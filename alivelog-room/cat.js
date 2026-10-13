// ---- 貓咪行為紀錄：點貓開選單，一點就記；長按貓匯出 JSON ----
(function(){
const KEY='alivelog.cat.log',B=['睡','吃','玩','討摸','窗邊','躲起來'],CAT={x:476,y:300,w:84,h:32};   // 會被 cat_sheet.json 的 anchor/frameSize 覆蓋
const $=id=>document.getElementById(id);
const hit=document.createElement('div');hit.id='cathit';hit.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
const cv=document.createElement('canvas');cv.width=CAT.w;cv.height=CAT.h;cv.style.cssText='position:absolute;z-index:3;pointer-events:none;image-rendering:pixelated';
const menu=document.createElement('div');menu.id='catmenu';
menu.style.cssText='position:absolute;z-index:8;display:none;background:#120f1a;border:2px solid #f0b25a;box-shadow:4px 4px 0 #05070a;padding:4px;font:14px/1 monospace;color:#e0cbb8;image-rendering:pixelated';
B.forEach(b=>{const d=document.createElement('div');d.textContent=b;d.dataset.b=b;d.style.cssText='padding:7px 12px;cursor:pointer;border-bottom:1px solid #3c3c44';menu.appendChild(d)});
document.body.append(cv,hit,menu);
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
function add(b){const d=new Date(),L=get();L.push({ts:d.toISOString(),behavior:b,weekday:d.getDay(),hour:d.getHours()});localStorage.setItem(KEY,JSON.stringify(L));if(napUntil){napUntil=0;saveState()}pose();flash(b)}
// ---- Neko 的貓 sprite 播放器＋移動（全部依 neko/cat_sheet.json：animations / spots / paths；Neko 換圖只要覆蓋 json+png）----
let follow=false,SHEET=null,IMG=null,cur=null,fi=0,ft=0,nextAt={},pos={x:CAT.x,y:CAT.y},Q=[],act=null,spot='ac_perch',zoomLast=0;
let napUntil=0;   // 夜裡載入時的「睡著」狀態：只是外觀，不寫進行為紀錄；記任何行為或到早上 7 點就結束
const sleepNow=()=>{if(napUntil&&Date.now()<napUntil)return true;const l=get().slice(-1)[0];return !!(l&&l.behavior==='睡')};
// ---- 記住貓在哪：localStorage 'alivelog.cat.state' = {spot,pose,ts,napUntil} ----
const SKEY='alivelog.cat.state';let lastSpot='ac_perch';
function saveState(){try{localStorage.setItem(SKEY,JSON.stringify({spot:lastSpot,pose:(window.CATPOS&&CATPOS.pose)||null,ts:Date.now(),napUntil}))}catch(e){}}
addEventListener('pagehide',saveState);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveState()});
const tpeHour=()=>+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',hour:'numeric',hourCycle:'h23'}).format(new Date());
function next7(){const h=tpeHour(),hrs=h>=23?(24-h+7):(7-h);const d=new Date(Date.now()+hrs*3600e3);d.setMinutes(0,0,0);return d.getTime()}
function startSpot(spots){let sv=null;try{sv=JSON.parse(localStorage.getItem(SKEY))}catch(e){}
  if(sv&&spots[sv.spot]&&Date.now()-sv.ts<30*60e3){napUntil=sv.napUntil&&sv.napUntil>Date.now()?sv.napUntil:0;return{spot:sv.spot,how:'resume'}}
  const W={ac_perch:3,floor_mid:2,window_gaze:2,walkway_lie:2,walkway_sit:1,loft_bed:3,loft_shelf:1},h=tpeHour(),night=h>=23||h<7;
  let napping=night&&Math.random()<.6;const pool=Object.keys(W).filter(k=>spots[k]&&(!napping||!['window_gaze','walkway_sit','loft_shelf'].includes(k)));   // 睡覺只選能趴的地方
  let r=Math.random()*pool.reduce((a,k)=>a+W[k],0),pick=pool[0];for(const k of pool){r-=W[k];if(r<=0){pick=k;break}}
  napUntil=napping?next7():0;return{spot:pick,how:napping?'random_nap':'random'}}
const has=a=>SHEET&&SHEET.animations&&SHEET.animations[a];
const rnd=(a,b)=>a+Math.random()*(b-a);
// 閣樓玻璃欄杆：疊在貓的像素上（source-atop），貓在玻璃後面；只影響欄杆矩形 x158–431,y96–141
const GLASS=new Image();GLASS.src='glass_rail.png';let lastF=null,glassAt='';
function glassOver(g){if(!GLASS.complete||!GLASS.naturalWidth)return;const x=Math.round(pos.x),y=Math.round(pos.y);
  if(x+CAT.w<=158||x>=432||y+CAT.h<=96||y>=142){glassAt='';return}
  g.save();g.globalCompositeOperation='source-atop';g.drawImage(GLASS,x,y,CAT.w,CAT.h,0,0,CAT.w,CAT.h);g.restore();glassAt=x+','+y}
// 找動畫：沒有 *_right 就用 *_left 鏡像（反之亦然）；都沒有就退回 breathe
function res(n){if(has(n))return{n,m:false};const o=n.replace(/_right$/,'_LEFT').replace(/_left$/,'_right').replace('_LEFT','_left');if(o!==n&&has(o))return{n:o,m:true};
  const t=n.replace(/_to_(left|right)$/,'');if(has(t))return{n:t,m:/_to_right$/.test(n)};return{n:'breathe',m:false}}
function frameDraw(name,mir){const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);const f=SHEET&&SHEET.frames[name];if(!f||!IMG)return;
  g.save();if(mir){g.translate(cv.width,0);g.scale(-1,1)}g.drawImage(IMG,f.x,f.y,f.w,f.h,0,0,f.w,f.h);g.restore();cv.dataset.frame=name;cv.dataset.mirror=mir?'1':'0';lastF=[name,mir];glassOver(g);cv.dataset.glass=glassAt;
  cv.style.filter=document.getElementById('fg').style.filter||'none';
  if(sleepNow()){g.fillStyle='#e0cbb8';const z=(x,y)=>{g.fillRect(x,y,3,1);g.fillRect(x+1,y+1,1,1);g.fillRect(x,y+2,3,1)};z(34,3);z(39,0)}}
function schedule(now){nextAt={blink:now+rnd(3e3,7e3),ear_twitch:now+rnd(5e3,11e3),tail_swish:now+rnd(7e3,15e3),lick:now+rnd(45e3,90e3),stretch:now+rnd(120e3,240e3),move:now+rnd(40e3,120e3)};
  if(sleepNow()){nextAt.blink=nextAt.lick=nextAt.stretch=nextAt.move=Infinity;nextAt.tail_swish=now+rnd(20e3,40e3)}}
const P=()=>SHEET.paths||{},SP=()=>SHEET.spots||{};
// 動作佇列：{anim,from,to,speed} 走/跑；{anim,at,times} 原地播；{fade:'in'|'out',ms,at}；{fn}
function run(list){if(act&&(act.jump||act.tunnel)){Q=list.slice();return}window.CATJUMP=false;Q=list.slice();next()}   // 跳到一半：落地後才換動作
function next(){act=Q.shift();if(!act){return idle()}
  if(act.fn){act.fn();return next()}
  if(act.fade){return next()}   // live21：不再淡出淡入（那等於瞬移）
  const tgt=act.from||act.at;if(tgt&&Math.hypot(tgt[0]-pos.x,tgt[1]-pos.y)>2){Q.unshift(act);Q=route(tgt).concat(Q);return next()}   // 起點不在腳下 → 先走/跳過去
  if(tgt)setPos(tgt);
  if(act.tunnel){act.el=0;window.CATTUNNEL=true;cv.style.transition='opacity 250ms steps(4)';cv.style.opacity=0;hit.style.pointerEvents='none';return}   // 走進門洞：消失，牆裡走一段時間後從另一個門洞出來（不是瞬移）
  if(act.jump){act.from=[pos.x,pos.y];const d=Math.hypot(act.to[0]-pos.x,act.to[1]-pos.y);act.dur=Math.min(1100,450+d*6);act.CR=200;act.LD=240;act.el=0;act.H=8+Math.max(0,act.from[1]-act.to[1])*.35;
    act.anim=act.to[0]<pos.x-1?'zoom_run_left':act.to[0]>pos.x+1?'zoom_run_right':(cur&&cur.mir?'zoom_run_left':'zoom_run_right')}
  const r=res(act.anim);cur={anim:r.n,mir:r.m,n:0,times:act.times||1};fi=0;ft=0;act.t0=performance.now();draw1()}
function idle(){follow=false;const sp=SP()[spot]||{};const a=sleepNow()?'breathe':((sp.anim&&sp.anim[0])||'breathe');act={idle:true,anim:a};const r=res(a);cur={anim:r.n,mir:r.m,n:0,times:1};fi=0;ft=0;draw1()}
function setPos(p){pos={x:p[0],y:p[1]};place();upd()}
// window.CATPOS：給 dust.js 等物件用（frame 左上角、room 座標、pose=lie|sit|walk）
const LIEA=['breathe','blink','tail_swish','ear_twitch','lick','stretch','sneeze_lie'],SITA=['sit_gaze_window','zoom_pant','zoom_nonchalant','sneeze_sit','dust_shake','duster_paw','rub_face'];
function poseNow(){const a=cur&&cur.anim;if(act&&(act.to||act.jump||act.tunnel))return'walk';if(spot==='walkway_sit')return'sit';if(spot==='walkway_lie'||spot==='ac_perch')return'lie';if(LIEA.includes(a))return'lie';if(SITA.includes(a))return'sit';return/walk|run|skid|turn|bump/.test(a)?'walk':'sit'}
function upd(){if(spot!=='moving'&&spot!==lastSpot){lastSpot=spot;saveState()}window.CATPOS={x:Math.round(pos.x),y:Math.round(pos.y),w:CAT.w,h:CAT.h,pose:poseNow(),spot}}
function draw1(){const A=SHEET.animations[cur.anim];let name=A.frames[Math.min(fi,A.frames.length-1)];
  if(sleepNow()&&cur.anim==='breathe'&&has('blink')){const bf=SHEET.animations.blink.frames;name=bf[Math.min(1,bf.length-1)]}
  frameDraw(name,cur.mir);upd();if(act&&act.onFrame)act.onFrame(fi)}
function tick(){requestAnimationFrame(tick);if(!SHEET||!IMG||!cur)return;const now=performance.now(),dt=Math.min(100,now-(tick.l||now));tick.l=now;
  if(follow&&window.PANKEEP&&!(act&&act.fade&&act.fade==='out')){const la=act&&act.to?Math.sign(act.to[0]-pos.x)*Math.min(50,Math.abs(act.to[0]-pos.x)):0;PANKEEP(pos.x+18+Math.min(0,la),pos.x+66+Math.max(0,la),pos.y,pos.y+CAT.h)}   // 跑的方向多看一點
  if(act&&act.tunnel){act.el+=dt;if(act.el>=250&&!act.moved){act.moved=true;setPos(act.to)}if(act.el>=act.ms-250&&!act.shown){act.shown=true;cv.style.opacity=1}if(act.el>=act.ms){window.CATTUNNEL=false;hit.style.pointerEvents='';cv.style.transition='';return next()}return}
  if(act&&act.jump){act.el+=dt;const f=act.from,g=act.to,cr=res('zoom_pant'),mir=act.anim==='zoom_run_right'?!cr.m:cr.m;
    if(act.el<act.CR){window.CATJUMP=true;cur={anim:cr.n,mir,n:0,times:1};fi=0;draw1();return}   // 起跳前蹲一下
    const t=Math.min(1,(act.el-act.CR)/act.dur);
    if(t<1){pos.x=f[0]+(g[0]-f[0])*t;pos.y=f[1]+(g[1]-f[1])*t-act.H*4*t*(1-t);place();upd();window.CATJUMP=true;const r=res(act.anim);cur={anim:r.n,mir:r.m,n:0,times:1};const A=SHEET.animations[cur.anim];fi=Math.min(A.frames.length-1,Math.floor(t*A.frames.length));draw1();return}
    if(pos.x!==g[0]||pos.y!==g[1])setPos(g);
    if(act.el<act.CR+act.dur+act.LD){window.CATJUMP=true;cur={anim:cr.n,mir,n:0,times:1};fi=0;draw1();return}   // 落地停一下
    window.CATJUMP=false;return next()}
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
// live21：走到某個 spot ＝ 沿路線圖走/跳（地板走路；貓走道靠牆上踏板一階階跳；陽台從落地門邊跳上欄台再跳上冷氣）
// 路線圖可放在 cat_sheet.json paths.routes 覆蓋：{floor_y, nodes:{名:[x,y]}, edges:[[a,b],...]}，同 y 用走的、不同 y 用跳的
const DEF_ROUTES={floor_y:356,nodes:{F_climb:[60,356],SOFA:[60,307],S130:[34,247],W_end:[21,181],W_lie:[4,181],F_bal:[370,356],LEDGE:[450,319],AC:[476,300]},edges:[['F_climb','SOFA'],['SOFA','S130'],['S130','W_end'],['W_end','W_lie'],['F_bal','LEDGE'],['LEDGE','AC']]};   // 樓中樓完整路線在 cat_sheet.json paths.routes（Nook cat_routes.json）
function route(goal){const RT=P().routes||DEF_ROUTES,fy=RT.floor_y||356,N=Object.assign({},RT.nodes),E=[];const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<=2;
  N.__s=[pos.x,pos.y];N.__g=goal;const ks=Object.keys(N);
  // 地板上的點彼此可走；其他用 edges；起點/終點不在圖上就接最近的節點
  ks.forEach(a=>ks.forEach(b=>{if(a<b&&N[a][1]===fy&&N[b][1]===fy&&Math.abs(N[a][1]-fy)<1)E.push([a,b])}));
  const TUN={};(RT.edges||[]).forEach(e=>{const a=Array.isArray(e)?e[0]:e.a,b=Array.isArray(e)?e[1]:e.b,o=Array.isArray(e)?(e[2]||{}):e;E.push([a,b]);if(o.type==='tunnel'){const dr=o.duration_ms;TUN[a+'|'+b]=TUN[b+'|'+a]=Array.isArray(dr)?dr:(o.ms||0)}});
  (RT.tunnels||[]).forEach(t=>{if(!N[t.a]||!N[t.b])return;E.push([t.a,t.b]);TUN[t.a+'|'+t.b]=TUN[t.b+'|'+t.a]=Array.isArray(t.duration_ms)?t.duration_ms:(t.ms||0)});   // paths.routes.tunnels（Nook 格式）
  for(const t of['__s','__g']){const p=N[t];if(Math.abs(p[1]-fy)<1)continue;let best=null,bd=1e9;for(const k of ks){if(k[0]==='_')continue;const d=Math.hypot(N[k][0]-p[0],N[k][1]-p[1]);if(d<bd){bd=d;best=k}}if(best)E.push([t,best])}
  if(near(N.__s,goal))return[];
  const adj={};ks.forEach(k=>adj[k]=[]);E.forEach(([a,b])=>{if(adj[a]&&adj[b]){const tk=TUN[a+'|'+b];const c=tk!=null?(Array.isArray(tk)?(tk[0]+tk[1])/2:(tk||2500))/40:Math.hypot(N[a][0]-N[b][0],N[a][1]-N[b][1])+(Math.abs(N[a][1]-N[b][1])>12?20:0);adj[a].push([b,c]);adj[b].push([a,c])}});
  const D={},pv={},U=new Set(ks);ks.forEach(k=>D[k]=1e9);D.__s=0;
  while(U.size){let u=null;U.forEach(k=>{if(u===null||D[k]<D[u])u=k});U.delete(u);if(u==='__g'||D[u]>=1e9)break;for(const[v,c]of adj[u])if(D[u]+c<D[v]){D[v]=D[u]+c;pv[v]=u}}
  if(D.__g>=1e9)return[{jump:true,to:goal.slice()}];   // 圖斷了也至少用跳的過去，不瞬移
  const seq=[];for(let k='__g';k;k=pv[k])seq.unshift(k);const L=[];const pw=P().floor_walk||{};
  for(let i=1;i<seq.length;i++){const a=N[seq[i-1]],b=N[seq[i]];const tk=TUN[seq[i-1]+'|'+seq[i]];if(tk!=null){L.push({tunnel:true,to:b.slice(),ms:Array.isArray(tk)?rnd(tk[0],tk[1]):(tk||Math.max(1500,Math.hypot(a[0]-b[0],a[1]-b[1])*40))});continue}if(near(a,b))continue;
    const dy=Math.abs(a[1]-b[1]);if(dy<1||(dy<=12&&Math.abs(a[0]-b[0])<=20))L.push(Object.assign(mv(a[0],b[0],pw),{from:null,to:[b[0],b[1]],speed:dy<1?(pw.speed_px_s||24):20}));else L.push({jump:true,to:b.slice()})}   // 樓梯一階 ≤12px：用走的上下
  return L}
function walkTo(target){const tp=SP()[target]&&SP()[target].frame_topleft;if(!tp)return[];return route(tp).concat([{fn:()=>{spot=target}}])}
function mv(x0,x1,pw){const y=pos.y;return{anim:x1<x0?(pw.anim_left||'walk_left'):(pw.anim_right||'walk_right'),from:[x0,y],to:[x1,y],speed:pw.speed_px_s||24}}
function wander(){if(sleepNow())return idle();
  if(spot!=='ac_perch'&&Date.now()-zoomLast>30*60e3&&Math.random()<.25)return zoomies(false);
  const opts=Object.keys(SP()).filter(k=>k!==spot);const t=opts[Math.random()*opts.length|0];const L=walkTo2(t);spot='moving';
  follow=true;   // live25：直拿可平移，走動時鏡頭跟著貓（使用者剛滑過 8 秒內不搶）
  if(t==='window_gaze')L.push({anim:'sit_gaze_window',times:1,loopUntil:performance.now()+rnd(20e3,60e3)});run(L)}
function walkTo2(t){const was=act&&act.spotWas;return walkTo.call(null,t)}
// 暴衝：依 paths.zoomies.sequence；撞盆栽那步對齊 knock.js 的盆栽（PLANT.contactX），不撞就跳過撞擊格
function zoomies(force){if(!SHEET||sleepNow()||(act&&(act.jump||act.tunnel)))return false;const Z=P().zoomies;if(!Z)return false;zoomLast=Date.now();
  window.onCatEvent('zoomies',{force:!!force});
  const willKnock=!!(window.PLANT&&PLANT.decide&&PLANT.decide(!!force));
  const bump=Z.sequence.find(s=>s.anim==='zoom_bump_plant');let rep=null,orig=null;
  if(bump&&window.PLANT&&PLANT.contactX!=null){orig=(bump.impact_cat_topleft||bump.at).join();const off=(bump.impact_contact_px?bump.impact_contact_px[0]:6)-(bump.impact_cat_topleft||bump.at)[0];
    rep=[PLANT.contactX-off,(bump.impact_cat_topleft||bump.at)[1]]}
  const fix=p=>p&&rep&&p.join()===orig?rep:p;const L=[];let sx=pos.x;
  const first=Z.sequence[0];if(first.from){const fy=(P().routes||DEF_ROUTES).floor_y||356;
    if(Math.abs(pos.y-fy)>1){L.push(...route([first.from[0],fy]))}   // 高處先一路跳下來
    else if(Math.abs(sx-first.from[0])>1)L.push(Object.assign(mv(sx,first.from[0],P().floor_walk||{}),{from:null,speed:(Z.speed_px_s||140)*.6,anim:first.from[0]<sx?'zoom_run_left':'zoom_run_right'}))}
  spot='moving';
  for(const s of Z.sequence){const st=Object.assign({},s,{at:fix(s.at),from:fix(s.from),to:fix(s.to)});
    if(st.to)st.speed=Z.speed_px_s||140;
    if(s.anim==='zoom_bump_plant'){if(!willKnock)continue;const k=s.impact_frame||0;let done=false;st.onFrame=f=>{if(!done&&f>=k){done=true;PLANT.knock()}}}
    if(s.alt&&has(s.alt)&&Math.random()<.5)st.anim=s.alt;if(s.repeat)st.times=s.repeat;L.push(st)}
  L.push({fn:()=>{spot='floor_mid'}});follow=true;run(L);return true}
window.onCatEvent=function(type,detail){dispatchEvent(new CustomEvent('alivelog:cat',{detail:Object.assign({type},detail||{})}));
  // 撢子事件（Nook dust.js）：依 cat_sheet.json events 找動畫；走路/暴衝中不插播
  const EV=(SHEET&&SHEET.events)||{};
  if((type==='duster_pass'||type==='dust_land')&&window.PANKEEP){const x=detail&&detail.x!=null?detail.x:38,y=detail&&detail.y!=null?detail.y:374;if(!(detail&&detail.phase==='end'))PANKEEP(x-24,x+24,y-10,y+10)}
  if(['duster_paw','sneeze','dust_shake','rub_face'].includes(type)){if(!SHEET||(act&&(act.to||act.jump||act.tunnel||act.fade||String(act.anim).startsWith('zoom'))))return;
    let a=type;const e=EV[type]||{};if(type==='sneeze'){const ps=poseNow()!=='walk'?poseNow():((detail&&detail.pose)||'sit');a=(e.by_pose&&e.by_pose[ps])||(detail&&detail.anim)||e.default||'sneeze_sit'}else if(e.anim)a=e.anim;
    if(type==='duster_paw'&&sleepNow())return;if(!has(a))return;run([{anim:a,times:1}]);return}
  if(type==='knock'&&act&&String(act.anim).startsWith('zoom'))return;   // 暴衝中由撞擊格處理
  if(type==='knock'&&has('zoom_bump_plant'))return;
  if(type==='knock'){const r=hit.getBoundingClientRect(),d=document.createElement('div');d.textContent='!';d.style.cssText='position:absolute;z-index:6;pointer-events:none;font:bold 18px monospace;color:#f0b25a;text-shadow:2px 2px 0 #05070a;left:'+(r.left+r.width*.2)+'px;top:'+(r.top-20)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),700)}};
function boot(){fetch('neko/cat_sheet.json',{cache:'no-store'}).then(r=>r.json()).then(j=>{SHEET=j;
  const ac=(j.spots&&j.spots.ac_perch&&j.spots.ac_perch.frame_topleft)||j.anchor_in_room_fg;if(ac){CAT.x=ac[0];CAT.y=ac[1]}if(j.frameSize){CAT.w=j.frameSize[0];CAT.h=j.frameSize[1]}
  const ss=startSpot(j.spots||{}),tl=(j.spots&&j.spots[ss.spot]&&j.spots[ss.spot].frame_topleft)||[CAT.x,CAT.y];window.CATSTART=Object.assign({napUntil},ss);
  pos={x:tl[0],y:tl[1]};spot=ss.spot;lastSpot=spot;cv.width=CAT.w;cv.height=CAT.h;place();IMG=new Image();
  // 第一次走動提早到 5–20 秒
  IMG.onload=()=>{const now=performance.now();schedule(now);if(!sleepNow())nextAt.move=now+rnd(5e3,20e3);idle();saveState()};IMG.src='neko/cat_sheet.png?v='+Date.now()}).catch(e=>window.CATERR=String(e))}
requestAnimationFrame(tick);
function spotAt(){for(const[k,v]of Object.entries(SP()))if(v.frame_topleft&&Math.hypot(v.frame_topleft[0]-pos.x,v.frame_topleft[1]-pos.y)<=2)return k;return'floor_mid'}
function pose(){if(SHEET&&cur){schedule(performance.now());if(sleepNow()&&(Q.length||act&&!act.idle)){cv.style.opacity=1;
    if(act&&(act.jump||act.tunnel)){Q=[{fn:()=>{spot=spotAt()}}];return}   // 跳到一半不能停在空中：落地再睡
    Q=[];if(spot==='moving')spot=spotAt();idle()}draw1()}}   // 記「睡」→ 原地停下睡
window.CATSPRITE={get anim(){return cur&&cur.anim},get frame(){return cv.dataset.frame},get mirror(){return cv.dataset.mirror==='1'},get pos(){return Object.assign({},pos)},get spot(){return spot},get queue(){return Q.length},
  play:(a,t)=>run([{anim:a,times:t||1}]),go:t=>{if(act&&(act.jump||act.tunnel))return false;const L=walkTo(t);spot='moving';follow=true;run(L.concat(t==='window_gaze'?[{anim:'sit_gaze_window',times:1,loopUntil:performance.now()+30e3}]:[]))},zoomies:f=>zoomies(f!==false),reload:boot};
if(/[?&]debug=1/.test(location.search)){const b=document.createElement('button');b.id='dbgzoom';b.textContent='zoom';
  b.style.cssText='position:fixed;left:64px;top:6px;z-index:50;font:12px monospace;background:#120f1a;color:#f0b25a;border:2px solid #f0b25a;padding:4px 8px';
  b.addEventListener('pointerup',e=>{e.stopPropagation();zoomies(true)});b.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(b)}
boot();
function flash(b){const f=document.createElement('div');f.textContent='已記：'+b;f.style.cssText=menu.style.cssText+';display:block;padding:8px;pointer-events:none';
  const r=hit.getBoundingClientRect();f.style.left=r.left+'px';f.style.top=Math.max(0,r.top-40)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1200)}
function place(){const {s,ox,oy}=window.VIEW||{s:1,ox:0,oy:0};
  Object.assign(hit.style,{left:ox+Math.round(pos.x)*s+'px',top:oy+Math.round(pos.y)*s+'px',width:CAT.w*s+'px',height:CAT.h*s+'px'});Object.assign(cv.style,{left:hit.style.left,top:hit.style.top,width:hit.style.width,height:hit.style.height});
  if(lastF){const x=Math.round(pos.x),y=Math.round(pos.y),inG=!(x+CAT.w<=158||x>=432||y+CAT.h<=96||y>=142);if(inG?glassAt!==x+','+y:glassAt)frameDraw(lastF[0],lastF[1])}}
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
