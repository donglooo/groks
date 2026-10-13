// ---- 雞毛撢子打掃（方案 B）：灰積在高處（貓走道/貓跳板/大電視頂），第 3 階（7 天）書桌也積灰需再點一次 ----
// 狀態存 localStorage 'alivelog.dust'；測試：?debug=1 → 出現 1天/3天/7天 按鈕；或 console DUST.setDays(n)
// 貓勾子：onCatEvent('duster_pass'|'dust_land'|'sneeze', detail)；灰塵特效全部由本檔畫，Neko 只畫貓
(function(){
const KEY='alivelog.dust',DAY=86400e3,CUP={x:52,y:414},SNEEZE_R=130;
const HIGH=[[0,92,211],[70,88,235],[68,86,257],[80,98,279],[68,86,301],[80,98,323],[100,210,193]];   // live23：+閣樓牆架1、牆架2、床頭小書架  // [x0,x1,頂面y]
const DESK=[[237,351,317]];
const st=Object.assign({high:Date.now(),desk:Date.now()},(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}})());
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const stage=t=>{const d=(Date.now()-t)/DAY;return d>=7?3:d>=3?2:d>=1?1:0};
const hiS=()=>stage(st.high),dkS=()=>stage(st.desk)>=3?3:0;   // 書桌只有到第 3 階才出現
const cv=document.createElement('canvas');cv.width=600;cv.height=420;cv.className='px';cv.id='dustcv';cv.style.pointerEvents='none';
(document.getElementById('plantcv')||document.getElementById('fg')).after(cv);
const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
// 固定亂數，灰的圖樣每次一樣
const rnd=s=>()=>(s=(s*16807)%2147483647)/2147483647;
function layer(segs,s,clean){const r=rnd(7);for(const[x0,x1,y]of segs)for(let x=x0;x<x1;x++){const p=r();if(clean!=null&&x<clean)continue;
    if(s>=1&&p<.25){g.fillStyle='#a0988a';g.fillRect(x,y,1,1)}if(s>=2&&p<.6){g.fillStyle='#c4bcaa';g.fillRect(x,y,1,1)}if(s>=3&&p<.35){g.fillStyle='#c4bcaa';g.fillRect(x,y-1,1,1)}}
  if(s>=3)for(const[x0,x1,y]of segs){for(let i=0;i<=(x1-x0)/25;i++){const cx=x0+2+Math.floor(r()*(x1-x0-5));if(clean!=null&&cx<clean)continue;g.fillStyle='#a0988a';g.fillRect(cx,y-2,2,2);g.fillStyle='#c4bcaa';g.fillRect(cx,y-3,1,1)}}}
const FEA=['#d65c3c','#e8aa50','#b43c34','#f0d28c'];
function duster(x,y,tilt){x=Math.round(x);y=Math.round(y);g.fillStyle='#784e2c';for(let i=0;i<10;i++)g.fillRect(x+Math.trunc(tilt*i/3),y+i,1,1);
  FEA.forEach((c,j)=>{g.fillStyle=c;g.fillRect(x-3+j*2+tilt,y-8+(j&1),2,8)});g.fillStyle=FEA[3];g.fillRect(x-1,y-10,3,2)}
let sweep=null,parts=[];   // sweep:{segs,which,x,y,tilt,cleanX}
function draw(){g.clearRect(0,0,600,420);const hs=hiS(),ds=dkS();
  layer(HIGH,hs,sweep&&sweep.which==='high'?sweep.cut:null);if(ds)layer(DESK,ds,sweep&&sweep.which==='desk'?sweep.cut:null);
  g.fillStyle='#505a6e';g.fillRect(CUP.x-3,CUP.y-10,6,10);g.fillStyle='#6e7890';g.fillRect(CUP.x-3,CUP.y-10,6,1);
  if(sweep)duster(sweep.x,sweep.y,sweep.tilt);else duster(CUP.x,CUP.y-12,0);
  for(const p of parts){g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),1,1)}
  cv.dataset.high=hs;cv.dataset.desk=ds;cv.dataset.busy=sweep?'1':'0'}
// 音效：HTMLAudio；電視有聲播放中不出聲（判斷同 knock.js 的 tvAudible），改字卡
const AU={dust:new Audio('dust.wav'),sneeze:new Audio('sneeze.wav')};for(const a of Object.values(AU)){a.preload='auto';a.volume=.5}
function tvAudible(){try{return typeof unlocked!=='undefined'&&unlocked&&player&&player.getPlayerState&&player.getPlayerState()===1&&!player.isMuted()}catch(e){return false}}
window.DUSTSND=[];
function snd(k,txt,x,y){const blk=tvAudible();DUSTSND.push({k,played:!blk});
  if(!blk){try{const a=AU[k];a.currentTime=0;const p=a.play();p&&p.catch(e=>DUSTSND.push({k,err:String(e.name)}))}catch(e){}}
  if(txt)bubble(txt,x,y)}
function bubble(t,x,y){const V=window.VIEW||{s:1,ox:0,oy:0},d=document.createElement('div');d.textContent=t;d.className='dustbubble';
  d.style.cssText=`position:absolute;z-index:6;pointer-events:none;font:bold ${Math.max(12,Math.round(V.s*7))}px monospace;color:#e0cbb8;text-shadow:2px 2px 0 #05070a;left:${V.ox+x*V.s}px;top:${V.oy+y*V.s}px`;
  document.body.appendChild(d);setTimeout(()=>d.remove(),900)}
// 貓位置：window.CATPOS={x,y,w,h}（frame 左上角，room_fg 座標）優先；否則用 cat_sheet.json 的 anchor
let SHEET=null;const catBox=()=>{const c=window.CATPOS;if(c){const sp=SHEET&&SHEET.spots&&SHEET.spots[c.spot];return Object.assign({opaque:c.opaque||(sp&&sp.opaque_x_range)},c)}return(SHEET?{x:SHEET.anchor_in_room_fg[0],y:SHEET.anchor_in_room_fg[1],w:SHEET.frameSize[0],h:SHEET.frameSize[1]}:{x:476,y:300,w:84,h:32})};
const LIE=['breathe','blink','tail_swish','ear_twitch','lick','stretch'];
const catPose=()=>{const c=window.CATPOS,sp=c&&SHEET&&SHEET.spots&&SHEET.spots[c.spot];if(sp&&sp.anim){if(sp.anim.includes('sneeze_lie'))return'lie';if(sp.anim.includes('sneeze_sit'))return'sit'}if(c&&(c.pose==='lie'||c.pose==='sit'))return c.pose;const a=window.CATSPRITE&&CATSPRITE.anim;return LIE.includes(a)?'lie':'sit'};
const dur=(a,upto)=>{try{const A=SHEET.animations[a],d=A.durations_ms||A.frames.map(()=>150);return d.slice(0,upto==null?d.length:upto).reduce((x,y)=>x+y,0)}catch(e){return upto==null?1150:380}};
fetch('neko/cat_sheet.json').then(r=>r.json()).then(j=>SHEET=j).catch(()=>{});
// 哈啾對齊實際影格：監看貓 canvas 的 data-frame（cat.js 每格都會寫），看到 <anim>_<achoo_frame> 就觸發；
// 沒有貓 sprite／沒看到該格時，用 sheet 的 durations 算的時間 +250ms 當保底
function catCanvas(){return document.querySelector('canvas[data-frame]')}
function onAchoo(an,fn){const af=(SHEET&&SHEET.animations[an]&&SHEET.animations[an].achoo_frame)||2,want=an+'_'+af,cv=catCanvas();let done=false,mo=null,t=null;
  const fire=src=>{if(done)return;done=true;mo&&mo.disconnect();clearTimeout(t);window.DUSTACHOO={src,at:Math.round(performance.now()),frame:want};fn()};
  if(cv){if(cv.dataset.frame===want)return fire('frame');mo=new MutationObserver(()=>{if(cv.dataset.frame===want)fire('frame')});mo.observe(cv,{attributes:true,attributeFilter:['data-frame']})}
  t=setTimeout(()=>fire('timer'),dur(an,af)+250)}
const cev=(t,d)=>{try{window.onCatEvent&&window.onCatEvent(t,d)}catch(e){}};
window.DUSTEV=[];const emit=(t,d)=>{DUSTEV.push({t,d,at:Math.round(performance.now())});cev(t,d)};
// 掃一趟：每段頂面由左到右，撢子 3 影格擺動（-1/0/1，每 80ms 換一格），走 0.09px/ms；灰往下飄
let fl={};
function run(which){if(sweep)return false;window.DUSTT0=Math.round(performance.now());const segs=which==='desk'?DESK:HIGH,heavy=(which==='desk'?dkS():hiS())>=3;let i=0;fl={pose:catPose()};
  emit('duster_pass',{phase:'start',target:which});snd('dust','唰唰',CUP.x,CUP.y-30);
  const next=()=>{if(i>=segs.length){end(which);return}const[x0,x1,y]=segs[i++];const t0=performance.now(),ms=(x1-x0)/0.09;
    (function f(){const k=Math.min(1,(performance.now()-t0)/ms),x=x0+(x1-x0)*k;
      sweep={which,x,y:y-3,tilt:[-1,0,1,0][Math.floor(performance.now()/80)%4],cut:x};
      if(Math.random()<.6)parts.push({x:x+(Math.random()*6-3),y:y-1,vx:(Math.random()-.5)*.3,vy:-.3-Math.random()*.3,c:Math.random()<.5?'#c4bcaa':'#f0ece2',life:900});
      const c=catBox(),L=c.opaque?c.opaque[0]:c.x,Rr=c.opaque?c.opaque[1]:c.x+c.w,dx0=x<L?L-x:x>Rr?x-Rr:0,dx=x<c.x?c.x-x:x>c.x+c.w?x-(c.x+c.w):0,dy=y<c.y?c.y-y:y>c.y+c.h?y-(c.y+c.h):0,d=Math.hypot(dx,dy);
      emit('duster_pass',{phase:'move',target:which,x:Math.round(x),y,dist:Math.round(d)});
      if(!fl.paw&&d<=40){fl.paw=1;emit('duster_paw',{x:Math.round(x),y})}
      // 灰落到貓身上：撢子在貓 frame 的 x 範圍內，且在貓上方 40px 以內或貓身上
      if(!fl.land&&dx0===0&&y<=c.y+c.h&&y>=c.y-40){fl.land=1;const pose=fl.pose,an=pose==='lie'?'sneeze_lie':'sneeze_sit';
        emit('dust_land',{x:Math.round(x),y,pose});
        setTimeout(()=>{emit('sneeze',{pose,anim:an});window.DUSTSNEEZE=(window.DUSTSNEEZE||0)+1;
          onAchoo(an,()=>{snd('sneeze','哈啾！',c.x+c.w/2-10,c.y-12);const af=(SHEET&&SHEET.animations[an].achoo_frame)||2;   // 噴嚏剩下的格數播完才抖毛
            setTimeout(()=>{emit('dust_shake',{});if(heavy)setTimeout(()=>emit('rub_face',{}),dur('dust_shake'))},dur(an)-dur(an,af))})},600)}
      draw();k<1?requestAnimationFrame(f):next()})()};next()}
function end(which){if(which==='desk')st.desk=Date.now();else st.high=Date.now();
  save();sweep=null;cev('duster_pass',{phase:'end',target:which});draw();place()}
function click(){window.PANKEEP&&PANKEEP(CUP.x-10,CUP.x+10,CUP.y-26,CUP.y+2);if(sweep)return;if(hiS()>0)return run('high');if(dkS()>0)return run('desk');bubble('很乾淨',CUP.x-10,CUP.y-30)}
// 粒子
(function tick(){if(parts.length){for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.02;p.life-=16}parts=parts.filter(p=>p.life>0&&p.y<420);if(!sweep)draw()}requestAnimationFrame(tick)})();
const hit=document.createElement('div');hit.id='dusthit';hit.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';document.body.appendChild(hit);
function place(){const V=window.VIEW;if(!V)return;const S=V.s;Object.assign(cv.style,{left:V.ox+'px',top:V.oy+'px',width:Math.round(600*S)+'px',height:Math.round(420*S)+'px'});
  Object.assign(hit.style,{left:V.ox+(CUP.x-7)*S+'px',top:V.oy+(CUP.y-24)*S+'px',width:14*S+'px',height:24*S+'px'})}
hit.addEventListener('pointerup',e=>{e.stopPropagation();click()});hit.addEventListener('click',e=>e.stopPropagation());
function setDays(n){st.high=Date.now()-n*DAY-1000;st.desk=st.high;save();draw()}
if(/[?&]debug=1/.test(location.search))[1,3,7].forEach((n,k)=>{const b=document.createElement('button');b.id='dbgdust'+n;b.textContent=n+'天';
  b.style.cssText=`position:fixed;left:${6+k*46}px;top:40px;z-index:50;font:12px monospace;background:#120f1a;color:#c4bcaa;border:2px solid #c4bcaa;padding:4px 6px`;
  b.addEventListener('pointerup',e=>{e.stopPropagation();setDays(n)});b.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(b)});
addEventListener('alivelog:layout',place);place();draw();
window.DUST={get state(){return{high:hiS(),desk:dkS(),busy:!!sweep,raw:Object.assign({},st)}},click,setDays,sweep:run};
})();
