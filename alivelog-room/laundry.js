// ---- 陽台曬衣（proposal_1028）：點衣服＝依序收進籃子；點籃子＝晾回去；跟台北即時天氣（world.js WEATHER）走 ----
// 晴天白天輕晃；下雨時晾在外面的衣服變深、滴水；濕的收進來，籃子上那疊潮 2 小時後恢復；夜晚跟房間一起變暗
// 狀態 localStorage 'alivelog.laundry' = {out:true/false, wetUntil:時間戳}；測試：console LAUNDRY.collect()／hang()／state
(function(){
const KEY='alivelog.laundry',WET_MS=2*3600e3,GX=[460,476,492],GY=271,BX=456,BY=341;   // 衣服左上（600x420）、籃子左上
const st=Object.assign({out:true,wetUntil:0},(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}})());
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const $=id=>document.getElementById(id);
const cv=document.createElement('canvas');cv.width=600;cv.height=420;cv.className='px';cv.id='laundrycv';cv.style.pointerEvents='none';
$('fg').after(cv);   // 在房間底圖上、調暗層（#dim）之下
const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
const SPR=new Image();SPR.src='laundry.png';SPR.onload=()=>draw();
let hung=st.out?3:0,lift=-1,busy=false;   // hung＝桿上幾件（收的時候從右往左…依序）；lift＝正在提起的那件
const rain=()=>((window.FORCE_KIND||(window.WEATHER&&WEATHER.kind))==='rain');
const phase=()=>(window.WEATHER&&WEATHER.phase)||'dusk';
const wet=()=>Date.now()<st.wetUntil;
function draw(){if(!SPR.complete||!SPR.naturalWidth)return;g.clearRect(0,0,600,420);const now=Date.now(),w=wet();
  // 衣服
  for(let i=0;i<hung;i++){const sway=!w&&phase()==='day'&&!rain()&&((now/1000+i*1.1)%3)<.5,sy=w?36:sway?18:0;
    g.drawImage(SPR,i*13,sy,13,18,GX[i],GY-(i===lift?2:0),13,18);
    if(w&&i!==lift){const k=((now/2000)+i*.37)%1;if(k<.6){g.fillStyle='#96b0d2';g.fillRect(GX[i]+3+i*2,GY+18+Math.floor(k*14),1,1)}}}   // 每 2 秒一滴
  // 夾子（桿上一直都在）
  for(const x of GX)for(const dx of[1,10])g.drawImage(SPR,0,70,1,3,x+dx,269,1,3);
  // 籃子＋摺好的那疊
  g.drawImage(SPR,0,54,22,9,BX,BY,22,9);
  for(let i=0;i<3-hung;i++)g.drawImage(SPR,(2-i)*16,w?67:64,16,2,BX+3,BY-2-i*2,16,2);
  // 跟房間同一套明暗：#fg 的濾鏡＋#dim（吊燈關）的暗度
  const dim=$('dim')?+getComputedStyle($('dim')).opacity||0:0,f=(($('fg').style.filter||'none').replace('none',''))+(dim?` brightness(${(1-dim).toFixed(2)})`:'');
  if(cv.style.filter!==(f||'none'))cv.style.filter=f||'none';
  cv.dataset.out=st.out?'1':'0';cv.dataset.wet=w?'1':'0';cv.dataset.hung=hung}
// 音效：原創合成布料聲 0.2 秒、音量 0.15；只在點的當下，電視有聲播放中就不出聲（同 knock.js，不搶電視音訊）
const AU=new Audio('laundry.wav');AU.preload='auto';AU.volume=.15;window.LAUNDRYSND=[];
function tvAudible(){try{return typeof unlocked!=='undefined'&&unlocked&&player&&player.getPlayerState&&player.getPlayerState()===1&&!player.isMuted()}catch(e){return false}}
function snd(){const block=tvAudible();LAUNDRYSND.push({played:!block,t:Date.now()});if(block)return;try{AU.currentTime=0;const p=AU.play();p&&p.catch(()=>{})}catch(e){}}
function step(fn,n,done){let i=0;(function f(){if(i>=n){busy=false;place();draw();return done&&done()}fn(i++);draw();setTimeout(f,150)})()}
function collect(){if(busy||!st.out)return false;busy=true;snd();if(rain()||wet())st.wetUntil=Math.max(st.wetUntil,Date.now()+WET_MS);
  st.out=false;save();let k=0;step(i=>{if(i%2===0){lift=hung-1}else{hung--;lift=-1}},6);return true}   // 右邊那件先收：提起 → 進籃子
function hang(){if(busy||st.out)return false;busy=true;snd();st.out=true;save();step(()=>{hung++},3);return true}
// 點擊區（比衣服／籃子略大；放在貓的點擊區之前，重疊時貓優先）
const mk=id=>{const h=document.createElement('div');h.id=id;h.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
  const c=$('cathit');c?c.before(h):document.body.appendChild(h);let d=null;
  h.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY}});
  h.addEventListener('pointerup',e=>{const m=d&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>6*((window.VIEW||{}).s||1);d=null;if(m)return;   // 拖曳（直拿平移）不算點
    e.stopPropagation();id==='laundryhit'?collect():hang()});
  h.addEventListener('click',e=>e.stopPropagation());return h};
const ch=mk('laundryhit'),bh=mk('baskethit');
function place(){const V=window.VIEW;if(!V)return;const S=V.s;Object.assign(cv.style,{left:V.ox+'px',top:V.oy+'px',width:Math.round(600*S)+'px',height:Math.round(420*S)+'px'});
  const R=(h,x,y,w,hh,on)=>Object.assign(h.style,{left:Math.round(V.ox+x*S)+'px',top:Math.round(V.oy+y*S)+'px',width:Math.round(w*S)+'px',height:Math.round(hh*S)+'px',display:on?'block':'none'});
  R(ch,455,264,54,34,st.out&&!busy);R(bh,452,331,30,20,!st.out&&!busy)}   // 衣服 x455–508、y264–297；籃子 x452–481、y331–350（貓趴冷氣 y300 起）
function tick(){if(st.out&&rain()){const u=Date.now()+WET_MS;if(u-st.wetUntil>60e3){st.wetUntil=u;save()}}draw()}
addEventListener('alivelog:layout',place);place();draw();setInterval(tick,200);
window.LAUNDRY={collect,hang,get state(){return Object.assign({wet:wet(),hung,busy},st)},draw};
})();
