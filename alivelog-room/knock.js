// ---- 貓撞倒盆栽事件：盆栽（直立/倒下中/倒下）＋撒土＋掃地機器人；狀態存 localStorage 'alivelog.plant' ----
// 測試：網址加 ?debug=1 → 左上角出現「knock」按鈕；或 console 呼叫 PLANT.knock()
// 自然發生：貓 onCatEvent('zoomies') 時有機率撞倒；另有低頻背景機率；兩次至少間隔 3 小時
(function(){
const KEY='alivelog.plant',COOL=3*3600e3,PX=96,PY=238,VX=246,VY=238;   // 盆栽底部中心、掃地機座位置（底圖 480x270 座標）
const st=Object.assign({s:'up',dirt:0,last:0},(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}})());
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const cv=document.createElement('canvas');cv.width=480;cv.height=270;cv.className='px';cv.id='plantcv';cv.style.pointerEvents='none';
document.getElementById('fg').after(cv);
const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
// 盆栽 12x17 像素圖（原創）：. 透明 L 亮葉 D 暗葉 S 莖 P 盆 p 盆陰影 r 盆口 d 土
const ART=['....L..D....','..LLD.LDL...','.LDLL.DLLD..','LLD.LSDL.DL.','.D..LSL..D..','..DL.S.LL...','.LLD.SDLDL..','..D.LSLD....','....DSL.....','.rrrrrrrrrr.','rddddddddddr','.PPPPPPPPpp.','.PPPPPPPPpp.','..PPPPPPpp..','..PPPPPPpp..','..PPPPPPpp..','...ppppppp..'];
const COL={L:'#78a050',D:'#2e3e34',S:'#4e5c40',P:'#c06a3a',p:'#7a3e26',r:'#d08a5a',d:'#40342a'};
const spr=document.createElement('canvas');spr.width=12;spr.height=17;{const s=spr.getContext('2d');ART.forEach((row,y)=>[...row].forEach((c,x)=>{if(COL[c]){s.fillStyle=COL[c];s.fillRect(x,y,1,1)}}))}
// 撒出來的土（固定圖樣，原創）
const DIRT=[[-2,0,5],[3,-1,3],[7,0,6],[13,-1,2],[16,0,3],[1,1,9],[10,1,5],[19,1,2],[-4,1,2]];
const CRUMB=[[5,-2],[11,-2],[18,-1],[22,0],[-6,0],[14,-3]];
let ang=0,vac={x:VX,on:false},dirtA=1;
function drawVac(){const x=Math.round(vac.x),y=VY;g.fillStyle='#24222c';g.fillRect(x-6,y-3,13,3);g.fillRect(x-5,y-4,11,1);g.fillStyle='#5c5a64';g.fillRect(x-4,y-5,9,1);
  g.fillStyle=vac.on?'#7ad070':'#c03a2c';g.fillRect(x-1,y-5,2,1);g.fillStyle='#12101a';g.fillRect(x-6,y,13,1);
  if(vac.on){g.fillStyle='#e0cbb8';g.globalAlpha=.5;g.fillRect(x+7+(Date.now()/80&1),y-1,1,1);g.globalAlpha=1}}
function draw(){g.clearRect(0,0,480,270);
  if(st.dirt){g.globalAlpha=dirtA;g.fillStyle='#40342a';for(const[dx,dy,w]of DIRT)g.fillRect(PX-dx-w,PY+dy,w,1);g.fillStyle='#2a1e20';for(const[dx,dy]of CRUMB)g.fillRect(PX-dx,PY+dy,1,1);g.globalAlpha=1}
  g.save();g.translate(PX-6,PY);g.rotate(-ang);g.drawImage(spr,0,-17);g.restore();   // 貓從右邊撞過來 → 以盆底左下角為支點往左倒
  drawVac();cv.dataset.state=st.s;cv.dataset.dirt=st.dirt?'1':'0'}
// 音效：HTMLAudio（不用 Web Audio）；iOS 上電視有聲播放中就不出聲，以免搶走電視音訊，改用字卡「咚！」
const AU={knock:new Audio('knock.wav'),vac:new Audio('vacuum.wav')};for(const a of Object.values(AU)){a.preload='auto';a.volume=.6}
function tvAudible(){try{return typeof unlocked!=='undefined'&&unlocked&&player&&player.getPlayerState&&player.getPlayerState()===1&&!player.isMuted()}catch(e){return false}}
window.PLANTSND=[];
// 所有平台一致：電視有聲播放中就不出聲
function snd(k,txt){const iosBlock=tvAudible();PLANTSND.push({k,played:!iosBlock});
  if(!iosBlock){try{const a=AU[k];a.currentTime=0;const p=a.play();p&&p.catch(e=>PLANTSND.push({k,err:String(e.name)}))}catch(e){}}
  if(txt)bubble(txt,iosBlock)}
function bubble(t,big){const V=window.VIEW||{s:1,ox:0,oy:0},d=document.createElement('div');d.textContent=t;
  d.style.cssText=`position:absolute;z-index:6;pointer-events:none;font:bold ${Math.max(12,Math.round(V.s*7))}px monospace;color:#f0b25a;text-shadow:2px 2px 0 #05070a;left:${V.ox+(PX+4)*V.s}px;top:${V.oy+(PY-30)*V.s}px`;
  document.body.appendChild(d);setTimeout(()=>d.remove(),big?1100:800)}
// 點擊區
const mk=id=>{const h=document.createElement('div');h.id=id;h.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';document.body.appendChild(h);return h};
const ph=mk('planthit'),vh=mk('vachit');
function place(){const V=window.VIEW;if(!V)return;const S=V.s;Object.assign(cv.style,{left:V.ox+'px',top:V.oy+'px',width:Math.round(480*S)+'px',height:Math.round(270*S)+'px'});
  const fallen=st.s!=='up';Object.assign(ph.style,fallen?{left:V.ox+(PX-24)*S+'px',top:V.oy+(PY-14)*S+'px',width:30*S+'px',height:16*S+'px'}:{left:V.ox+(PX-7)*S+'px',top:V.oy+(PY-19)*S+'px',width:14*S+'px',height:20*S+'px'});
  Object.assign(vh.style,{left:V.ox+(vac.x-9)*S+'px',top:V.oy+(VY-9)*S+'px',width:18*S+'px',height:12*S+'px'})}
let busy=false;
function anim(from,to,ms,fn,done){const t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/ms);fn(from+(to-from)*k,k);draw();k<1?requestAnimationFrame(f):done&&done()})()}
function knock(force){if(busy||st.s!=='up')return false;if(!force&&Date.now()-st.last<COOL)return false;busy=true;st.last=Date.now();
  window.onCatEvent&&onCatEvent('knock');st.s='falling';
  anim(0,Math.PI/2,260,(a,k)=>{ang=a*k*k/(k||1)},()=>{ang=Math.PI/2;st.s='fallen';st.dirt=1;dirtA=1;save();draw();place();snd('knock','咚！');busy=false});return true}
function upright(){if(busy||st.s!=='fallen')return;busy=true;anim(Math.PI/2,0,220,a=>ang=a,()=>{ang=0;st.s='up';save();place();busy=false})}
function vacuum(){if(vac.on||busy)return;if(!st.dirt){bubble('嗶',false);return}vac.on=true;snd('vac','嗡～');
  const go=(to,ms,d)=>anim(vac.x,to,ms,x=>{vac.x=x;place()},d);
  go(PX-26,500,()=>go(PX+6,350,()=>{anim(1,0,300,a=>dirtA=a,()=>{st.dirt=0;dirtA=1;save();go(VX,500,()=>{vac.on=false;draw();place()})})}))}
ph.addEventListener('pointerup',e=>{e.stopPropagation();upright()});vh.addEventListener('pointerup',e=>{e.stopPropagation();vacuum()});
for(const h of[ph,vh])h.addEventListener('click',e=>e.stopPropagation());
// 自然發生：貓暴衝時 30% 機率；另外每 10 分鐘有 1/30 機率（受 3 小時冷卻限制）
// 暴衝時撞不撞由 cat.js 問 PLANT.decide()（30%＋冷卻），撞擊格呼叫 PLANT.knock()
// （不再有背景隨機撞倒：只在貓暴衝時發生）
if(st.s==='falling')st.s='fallen';ang=st.s==='fallen'?Math.PI/2:0;
if(/[?&]debug=1/.test(location.search)){const b=document.createElement('button');b.id='dbgknock';b.textContent='knock';
  b.style.cssText='position:fixed;left:6px;top:6px;z-index:50;font:12px monospace;background:#120f1a;color:#f0b25a;border:2px solid #f0b25a;padding:4px 8px';
  b.addEventListener('pointerup',e=>{e.stopPropagation();knock(true)});b.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(b)}
addEventListener('alivelog:layout',place);place();draw();
window.PLANT={contactX:PX+6,decide:force=>st.s==='up'&&!busy&&(force||(Date.now()-st.last>=COOL&&Math.random()<.3)),get state(){return Object.assign({},st)},knock:()=>knock(true),upright,vacuum,get vac(){return Object.assign({},vac)}};
})();
