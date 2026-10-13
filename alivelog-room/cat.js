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
// ---- Neko 的貓 sprite 播放器＋移動（全部依 neko/cat_sheet.json：animations / spots / paths；Neko 換圖只要覆蓋 json+png）----
let SHEET=null,IMG=null,cur=null,fi=0,ft=0,nextAt={},pos={x:CAT.x,y:CAT.y},Q=[],act=null,spot='ac_perch',zoomLast=0;
const sleepNow=()=>{const l=get().slice(-1)[0];return !!(l&&l.behavior==='睡')};
const has=a=>SHEET&&SHEET.animations&&SHEET.animations[a];
const rnd=(a,b)=>a+Math.random()*(b-a);
// 找動畫：沒有 *_right 就用 *_left 鏡像（反之亦然）；都沒有就退回 breathe
function res(n){if(has(n))return{n,m:false};const o=n.replace(/_right$/,'_LEFT').replace(/_left$/,'_right').replace('_LEFT','_left');if(o!==n&&has(o))return{n:o,m:true};
  const t=n.replace(/_to_(left|right)$/,'');if(has(t))return{n:t,m:/_to_right$/.test(n)};return{n:'breathe',m:false}}
function frameDraw(name,mir){const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);const f=SHEET&&SHEET.frames[name];if(!f||!IMG)return;
  g.save();if(mir){g.translate(cv.width,0);g.scale(-1,1)}g.drawImage(IMG,f.x,f.y,f.w,f.h,0,0,f.w,f.h);g.restore();cv.dataset.frame=name;cv.dataset.mirror=mir?'1':'0';
  cv.style.filter=document.getElementById('fg').style.filter||'none';
  if(sleepNow()){g.fillStyle='#e0cbb8';const z=(x,y)=>{g.fillRect(x,y,3,1);g.fillRect(x+1,y+1,1,1);g.fillRect(x,y+2,3,1)};z(34,3);z(39,0)}}
function schedule(now){nextAt={blink:now+rnd(3e3,7e3),ear_twitch:now+rnd(5e3,11e3),tail_swish:now+rnd(7e3,15e3),lick:now+rnd(45e3,90e3),stretch:now+rnd(120e3,240e3),move:now+rnd(40e3,120e3)};
  if(sleepNow()){nextAt.blink=nextAt.lick=nextAt.stretch=nextAt.move=Infinity;nextAt.tail_swish=now+rnd(20e3,40e3)}}
const P=()=>SHEET.paths||{},SP=()=>SHEET.spots||{};
// 動作佇列：{anim,from,to,speed} 走/跑；{anim,at,times} 原地播；{fade:'in'|'out',ms,at}；{fn}
function run(list){Q=list.slice();next()}
function next(){act=Q.shift();if(!act){return idle()}
  if(act.fn){act.fn();return next()}
  if(act.fade){if(act.at)setPos(act.at);cv.style.transition=`opacity ${act.ms||400}ms`;cv.style.opacity=act.fade==='in'?1:0;act.until=performance.now()+(act.ms||400);return}
  if(act.at)setPos(act.at);if(act.from)setPos(act.from);
  const r=res(act.anim);cur={anim:r.n,mir:r.m,n:0,times:act.times||1};fi=0;ft=0;act.t0=performance.now();draw1()}
function idle(){const sp=SP()[spot]||{};const a=sleepNow()?'breathe':((sp.anim&&sp.anim[0])||'breathe');act={idle:true,anim:a};const r=res(a);cur={anim:r.n,mir:r.m,n:0,times:1};fi=0;ft=0;draw1()}
function setPos(p){pos={x:p[0],y:p[1]};place()}
function draw1(){const A=SHEET.animations[cur.anim];let name=A.frames[Math.min(fi,A.frames.length-1)];
  if(sleepNow()&&cur.anim==='breathe'&&has('blink')){const bf=SHEET.animations.blink.frames;name=bf[Math.min(1,bf.length-1)]}
  frameDraw(name,cur.mir);if(act&&act.onFrame)act.onFrame(fi)}
function tick(){requestAnimationFrame(tick);if(!SHEET||!IMG||!cur)return;const now=performance.now(),dt=Math.min(100,now-(tick.l||now));tick.l=now;
  if(act&&act.fade){if(now>=act.until)next();return}
  // 移動
  if(act&&act.to){const sp=act.speed||24,dx=act.to[0]-pos.x,dy=act.to[1]-pos.y,d=Math.hypot(dx,dy),st=sp*dt/1000;
    if(d<=st){setPos(act.to);return next()}pos.x+=dx/d*st;pos.y+=dy/d*st;place()}
  const A=SHEET.animations[cur.anim],dur=(A.durations_ms||[])[fi]||(A.fps?1000/A.fps:150);ft+=dt*((cur.anim==='breathe'&&sleepNow())?1/1.6:1);
  if(ft<dur)return;ft-=dur;fi++;
  if(fi>=A.frames.length){fi=0;cur.n++;
    if(act&&act.to){}   // 走路動畫一直循環到抵達
    else if(act&&!act.idle){if(cur.n>=cur.times&&!(act.loopUntil&&now<act.loopUntil))return next()}
    else if(!sleepNow()&&cur.anim!==((SP()[spot]||{}).anim||['breathe'])[0]){return idle()}
    else{ // idle 每輪檢查插播或移動
      if(!sleepNow()&&now>=nextAt.move){nextAt.move=now+rnd(40e3,120e3);return wander()}
      const allowed=(SP()[spot]||{}).anim||['breathe','blink'];
      for(const a of['stretch','lick','tail_swish','ear_twitch','blink'])if(now>=nextAt[a]&&has(a)){nextAt[a]=now+({blink:rnd(3e3,7e3),ear_twitch:rnd(5e3,11e3),tail_swish:rnd(7e3,15e3),lick:rnd(45e3,90e3),stretch:rnd(120e3,240e3)})[a];
        if(!allowed.includes(a)&&spot!=='floor_mid')continue;if(spot==='floor_mid'&&!['blink','ear_twitch'].includes(a))continue;
        if(sleepNow()&&a!=='ear_twitch'&&a!=='tail_swish')continue;const r=res(a);cur={anim:r.n,mir:r.m,n:0,times:a==='tail_swish'?2:1};act={anim:a,times:cur.times};break}}}
  draw1()}
// 走到某個 spot（室內走 floor_walk；陽台冷氣用淡出淡入）
function walkTo(target){const s0=spot,sp=SP(),pw=P().floor_walk||{},bt=P().balcony_transition||{},L=[];
  const tp=sp[target]&&sp[target].frame_topleft;if(!tp)return L;const inSide=(bt.indoor_side&&bt.indoor_side.at)||[230,206],ms=(bt.exit&&bt.exit.ms)||400;
  let x=pos.x;
  if(s0==='ac_perch'&&target!=='ac_perch'){L.push({fade:'out',ms},{fade:'in',ms:(bt.indoor_side&&bt.indoor_side.ms)||400,at:inSide});x=inSide[0]}
  if(target==='ac_perch'){if(s0!=='ac_perch'){if(Math.abs(x-inSide[0])>1)L.push(mv(x,inSide[0],pw));L.push({fade:'out',ms:(bt.indoor_side&&bt.indoor_side.ms)||400},{fade:'in',ms:(bt.enter&&bt.enter.ms)||400,at:(bt.enter&&bt.enter.at)||tp})}}
  else if(Math.abs(x-tp[0])>1)L.push(mv(x,tp[0],pw));
  L.push({fn:()=>{spot=target}});return L}
function mv(x0,x1,pw){const y=(pw.points&&pw.points[0][1])||206;return{anim:x1<x0?(pw.anim_left||'walk_left'):(pw.anim_right||'walk_right'),from:[x0,y],to:[x1,y],speed:pw.speed_px_s||24}}
function wander(){if(sleepNow())return idle();
  if(spot!=='ac_perch'&&Date.now()-zoomLast>30*60e3&&Math.random()<.25)return zoomies(false);
  const opts=Object.keys(SP()).filter(k=>k!==spot);const t=opts[Math.random()*opts.length|0];spot='moving';const L=walkTo2(t);
  if(t==='window_gaze')L.push({anim:'sit_gaze_window',times:1,loopUntil:performance.now()+rnd(20e3,60e3)});run(L)}
function walkTo2(t){const was=act&&act.spotWas;return walkTo.call(null,t)}
// 暴衝：依 paths.zoomies.sequence；撞盆栽那步對齊 knock.js 的盆栽（PLANT.contactX），不撞就跳過撞擊格
function zoomies(force){if(!SHEET||sleepNow())return false;const Z=P().zoomies;if(!Z)return false;zoomLast=Date.now();
  window.onCatEvent('zoomies',{force:!!force});
  const willKnock=!!(window.PLANT&&PLANT.decide&&PLANT.decide(!!force));
  const bump=Z.sequence.find(s=>s.anim==='zoom_bump_plant');let rep=null,orig=null;
  if(bump&&window.PLANT&&PLANT.contactX!=null){orig=(bump.impact_cat_topleft||bump.at).join();const off=(bump.impact_contact_px?bump.impact_contact_px[0]:6)-(bump.impact_cat_topleft||bump.at)[0];
    rep=[PLANT.contactX-off,(bump.impact_cat_topleft||bump.at)[1]]}
  const fix=p=>p&&rep&&p.join()===orig?rep:p;const L=[];let sx=pos.x;
  if(spot==='ac_perch'){const bt=P().balcony_transition||{},ins=(bt.indoor_side&&bt.indoor_side.at)||[230,206];L.push({fade:'out',ms:(bt.exit&&bt.exit.ms)||400},{fade:'in',ms:(bt.indoor_side&&bt.indoor_side.ms)||400,at:ins});sx=ins[0]}
  const first=Z.sequence[0];if(first.from&&Math.abs(sx-first.from[0])>1)L.push(Object.assign(mv(sx,first.from[0],P().floor_walk||{}),{speed:(Z.speed_px_s||140)*.6,anim:first.from[0]<sx?'zoom_run_left':'zoom_run_right'}));
  spot='moving';
  for(const s of Z.sequence){const st=Object.assign({},s,{at:fix(s.at),from:fix(s.from),to:fix(s.to)});
    if(st.to)st.speed=Z.speed_px_s||140;
    if(s.anim==='zoom_bump_plant'){if(!willKnock)continue;const k=s.impact_frame||0;let done=false;st.onFrame=f=>{if(!done&&f>=k){done=true;PLANT.knock()}}}
    if(s.alt&&has(s.alt)&&Math.random()<.5)st.anim=s.alt;if(s.repeat)st.times=s.repeat;L.push(st)}
  L.push({fn:()=>{spot='floor_mid'}});run(L);return true}
window.onCatEvent=function(type,detail){dispatchEvent(new CustomEvent('alivelog:cat',{detail:Object.assign({type},detail||{})}));
  if(type==='knock'&&act&&String(act.anim).startsWith('zoom'))return;   // 暴衝中由撞擊格處理
  if(type==='knock'&&has('zoom_bump_plant'))return;
  if(type==='knock'){const r=hit.getBoundingClientRect(),d=document.createElement('div');d.textContent='!';d.style.cssText='position:absolute;z-index:6;pointer-events:none;font:bold 18px monospace;color:#f0b25a;text-shadow:2px 2px 0 #05070a;left:'+(r.left+r.width*.2)+'px;top:'+(r.top-20)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),700)}};
function boot(){fetch('neko/cat_sheet.json',{cache:'no-store'}).then(r=>r.json()).then(j=>{SHEET=j;
  const ac=(j.spots&&j.spots.ac_perch&&j.spots.ac_perch.frame_topleft)||j.anchor_in_room_fg;if(ac){CAT.x=ac[0];CAT.y=ac[1]}if(j.frameSize){CAT.w=j.frameSize[0];CAT.h=j.frameSize[1]}
  pos={x:CAT.x,y:CAT.y};spot='ac_perch';cv.width=CAT.w;cv.height=CAT.h;place();IMG=new Image();IMG.onload=()=>{schedule(performance.now());idle()};IMG.src='neko/cat_sheet.png?v='+Date.now()}).catch(e=>window.CATERR=String(e))}
requestAnimationFrame(tick);
function pose(){if(SHEET&&cur){schedule(performance.now());if(sleepNow()&&(Q.length||act&&!act.idle)){Q=[];if(spot==='moving')spot='floor_mid';cv.style.opacity=1;idle()}draw1()}}   // 記「睡」→ 原地停下睡
window.CATSPRITE={get anim(){return cur&&cur.anim},get frame(){return cv.dataset.frame},get mirror(){return cv.dataset.mirror==='1'},get pos(){return Object.assign({},pos)},get spot(){return spot},get queue(){return Q.length},
  play:(a,t)=>run([{anim:a,times:t||1}]),go:t=>{spot=spot==='moving'?'floor_mid':spot;const L=walkTo(t);spot='moving';run(L.concat(t==='window_gaze'?[{anim:'sit_gaze_window',times:1,loopUntil:performance.now()+30e3}]:[]))},zoomies:f=>zoomies(f!==false),reload:boot};
if(/[?&]debug=1/.test(location.search)){const b=document.createElement('button');b.id='dbgzoom';b.textContent='zoom';
  b.style.cssText='position:fixed;left:64px;top:6px;z-index:50;font:12px monospace;background:#120f1a;color:#f0b25a;border:2px solid #f0b25a;padding:4px 8px';
  b.addEventListener('pointerup',e=>{e.stopPropagation();zoomies(true)});b.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(b)}
boot();
function flash(b){const f=document.createElement('div');f.textContent='已記：'+b;f.style.cssText=menu.style.cssText+';display:block;padding:8px;pointer-events:none';
  const r=hit.getBoundingClientRect();f.style.left=r.left+'px';f.style.top=Math.max(0,r.top-40)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1200)}
function place(){const {s,ox,oy}=window.VIEW||{s:1,ox:0,oy:0};
  Object.assign(hit.style,{left:ox+Math.round(pos.x)*s+'px',top:oy+Math.round(pos.y)*s+'px',width:CAT.w*s+'px',height:CAT.h*s+'px'});Object.assign(cv.style,{left:hit.style.left,top:hit.style.top,width:hit.style.width,height:hit.style.height})}
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
