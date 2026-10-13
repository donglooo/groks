// ---- 貓咪行為紀錄：點貓開選單，一點就記；長按貓匯出 JSON ----
(function(){
const KEY='alivelog.cat.log',B=['睡','吃','玩','討摸','窗邊','躲起來'],CAT={x:356,y:150,w:84,h:32};   // 會被 cat_sheet.json 的 anchor/frameSize 覆蓋
const $=id=>document.getElementById(id);
const hit=document.createElement('div');hit.id='cathit';hit.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
const cv=document.createElement('canvas');cv.width=CAT.w;cv.height=CAT.h;cv.style.cssText='position:absolute;z-index:3;pointer-events:none;image-rendering:pixelated';
const menu=document.createElement('div');menu.id='catmenu';
menu.style.cssText='position:absolute;z-index:8;display:none;background:#120f1a;border:2px solid #f0b25a;box-shadow:4px 4px 0 #05070a;padding:4px;font:14px/1 monospace;color:#e0cbb8;image-rendering:pixelated';
B.forEach(b=>{const d=document.createElement('div');d.textContent=b;d.dataset.b=b;d.style.cssText='padding:7px 12px;cursor:pointer;border-bottom:1px solid #3c3c44';menu.appendChild(d)});
document.body.append(cv,hit,menu);
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
function add(b){const d=new Date(),L=get();L.push({ts:d.toISOString(),behavior:b,weekday:d.getDay(),hour:d.getHours()});localStorage.setItem(KEY,JSON.stringify(L));pose();flash(b)}
// ---- Neko 的貓 sprite 播放器（依 neko/cat_sheet.json；Neko 換新圖只要覆蓋這兩個檔）----
let SHEET=null,IMG=null,cur=null,fi=0,tmr=null,nextAt={};
const sleepNow=()=>{const l=get().slice(-1)[0];return !!(l&&l.behavior==='睡')};
function frameDraw(name){const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);const f=SHEET&&SHEET.frames[name];if(!f||!IMG)return;
  g.drawImage(IMG,f.x,f.y,f.w,f.h,0,0,f.w,f.h);cv.dataset.frame=name;cv.style.filter=document.getElementById('fg').style.filter||'none';
  if(sleepNow()){g.fillStyle='#e0cbb8';const z=(x,y)=>{g.fillRect(x,y,3,1);g.fillRect(x+1,y+1,1,1);g.fillRect(x,y+2,3,1)};z(34,3);z(39,0)}}
const has=a=>SHEET&&SHEET.animations&&SHEET.animations[a];
const rnd=(a,b)=>a+Math.random()*(b-a);
function schedule(now){const sl=sleepNow();nextAt={blink:now+rnd(3e3,7e3),ear_twitch:now+rnd(5e3,11e3),tail_swish:now+rnd(7e3,15e3),
  lick:now+rnd(45e3,90e3),stretch:now+rnd(120e3,240e3)};if(sl){nextAt.blink=Infinity;nextAt.lick=Infinity;nextAt.stretch=Infinity;nextAt.tail_swish=now+rnd(20e3,40e3)}}
function play(anim,times=1){if(!has(anim))anim='breathe';cur={anim,times,n:0};fi=0;step()}
function step(){clearTimeout(tmr);if(!SHEET)return;const A=SHEET.animations[cur.anim],now=performance.now();
  if(fi>=A.frames.length){fi=0;cur.n++;if(cur.anim!=='breathe'&&(!A.loop||cur.n>=cur.times)){return pickNext()}}
  let name=A.frames[fi];
  if(sleepNow()&&cur.anim==='breathe'&&has('blink')){const bf=SHEET.animations.blink.frames;name=bf[Math.min(1,bf.length-1)]}   // 睡覺＝用眨眼的閉眼格
  frameDraw(name);const d=(A.durations_ms||[])[fi]||150;fi++;tmr=setTimeout(step,cur.anim==='breathe'&&sleepNow()?d*1.6:d)}
function pickNext(){play('breathe')}
// 呼吸迴圈每跑完一輪檢查要不要插入小動作
const _step=step;
function boot(){fetch('neko/cat_sheet.json',{cache:'no-store'}).then(r=>r.json()).then(j=>{SHEET=j;
  if(j.anchor_in_room_fg){CAT.x=j.anchor_in_room_fg[0];CAT.y=j.anchor_in_room_fg[1]}if(j.frameSize){CAT.w=j.frameSize[0];CAT.h=j.frameSize[1]}
  cv.width=CAT.w;cv.height=CAT.h;place();IMG=new Image();IMG.onload=()=>{schedule(performance.now());play('breathe')};IMG.src='neko/cat_sheet.png?v='+Date.now()}).catch(e=>window.CATERR=String(e))}
// 呼吸是 loop：每輪結束時（fi 回到 0）判斷插播
const origStep=step;
step=function(){if(cur&&cur.anim==='breathe'&&SHEET&&fi>=SHEET.animations.breathe.frames.length){fi=0;const now=performance.now();
    for(const a of['stretch','lick','tail_swish','ear_twitch','blink'])if(now>=nextAt[a]&&has(a)){nextAt[a]=now+({blink:rnd(3e3,7e3),ear_twitch:rnd(5e3,11e3),tail_swish:rnd(7e3,15e3),lick:rnd(45e3,90e3),stretch:rnd(120e3,240e3)})[a];
      if(sleepNow()&&a!=='ear_twitch'&&a!=='tail_swish')continue;cur={anim:a,times:a==='tail_swish'?2:1,n:0};break}}
  origStep()};
function pose(){if(SHEET&&cur){if(sleepNow())schedule(performance.now());frameDraw(cv.dataset.frame||'breathe_0')}}
// ---- 事件掛鉤：onCatEvent('knock'|'zoomies'...)；Neko 有對應動畫就播，沒有就用佔位（小跳＋驚嘆號）----
window.onCatEvent=function(type,detail){dispatchEvent(new CustomEvent('alivelog:cat',{detail:Object.assign({type},detail||{})}));
  if(has(type)){play(type);return}
  if(type==='knock'){const t=cv.style.transform;cv.style.transform='translateY(-6%)';setTimeout(()=>cv.style.transform=t||'',180);
    const r=hit.getBoundingClientRect(),d=document.createElement('div');d.textContent='!';d.style.cssText='position:absolute;z-index:6;pointer-events:none;font:bold 18px monospace;color:#f0b25a;text-shadow:2px 2px 0 #05070a;left:'+(r.left+r.width*.2)+'px;top:'+(r.top-20)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),700)}};
window.CATSPRITE={get anim(){return cur&&cur.anim},get frame(){return cv.dataset.frame},play:(a,t)=>play(a,t),reload:boot};
boot();
function flash(b){const f=document.createElement('div');f.textContent='已記：'+b;f.style.cssText=menu.style.cssText+';display:block;padding:8px;pointer-events:none';
  const r=hit.getBoundingClientRect();f.style.left=r.left+'px';f.style.top=Math.max(0,r.top-40)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1200)}
function place(){const {s,ox,oy}=window.VIEW||{s:1,ox:0,oy:0};
  Object.assign(hit.style,{left:ox+CAT.x*s+'px',top:oy+CAT.y*s+'px',width:CAT.w*s+'px',height:CAT.h*s+'px'});Object.assign(cv.style,{left:hit.style.left,top:hit.style.top,width:hit.style.width,height:hit.style.height})}
function open(){const r=hit.getBoundingClientRect();menu.style.display='block';const mh=menu.offsetHeight,mw=menu.offsetWidth;
  menu.style.left=Math.max(4,Math.min(innerWidth-mw-4,r.left+r.width/2-mw/2))+'px';menu.style.top=Math.max(4,Math.min(innerHeight-mh-4,r.top-mh-6))+'px'}
const close=()=>menu.style.display='none';
function exportJSON(){const blob=new Blob([JSON.stringify(get(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='alivelog-cat-log.json';document.body.appendChild(a);a.click();a.remove();window.CATEXPORT=(window.CATEXPORT||0)+1;flash('匯出 '+get().length+' 筆')}
let lp=null,long=false;
hit.addEventListener('pointerdown',e=>{long=false;lp=setTimeout(()=>{long=true;exportJSON()},700)});
hit.addEventListener('pointerup',e=>{clearTimeout(lp);if(!long){e.stopPropagation();menu.style.display==='block'?close():open()}});
hit.addEventListener('pointerleave',()=>clearTimeout(lp));hit.addEventListener('contextmenu',e=>e.preventDefault());
hit.addEventListener('click',e=>e.stopPropagation());
menu.addEventListener('click',e=>{e.stopPropagation();const b=e.target.dataset.b;if(b){add(b);close()}});
document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target)&&e.target!==hit)close()},true);
addEventListener('alivelog:layout',place);place();pose();window.catLog={get,add,exportJSON};
})();
