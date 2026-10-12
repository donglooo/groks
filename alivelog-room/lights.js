// ---- 吊燈：點燈（範圍放大）開/關；開＝暖色光錐，關＝燈罩變暗、房間調暗（晚上更暗）；狀態存 localStorage 'alivelog.lights' ----
(function(){
const $=id=>document.getElementById(id),KEY='alivelog.lights',LAMPS=[246,290];
let on=localStorage.getItem(KEY)!=='off';
const cv=document.createElement('canvas');cv.width=480;cv.height=270;cv.className='px';cv.style.pointerEvents='none';
const dim=document.createElement('div');dim.className='px';dim.style.cssText='pointer-events:none;background:#05070f;opacity:0;transition:opacity .25s steps(4)';
$('fg').after(dim);dim.after(cv);   // 順序：房間 → 調暗層 → 光錐 →（背光、電視在更上面）
const g=cv.getContext('2d'),B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
function draw(){g.clearRect(0,0,480,270);
  for(const px of LAMPS){
    if(on){for(let y=69;y<150;y++){const t=(y-69)/81,w=Math.round(6+t*34);for(let x=px-w;x<=px+w;x++){const k=(1-t)*(1-Math.abs(x-px)/(w+1))*.9;
        if(B[(y&3)*4+(x&3)]<k*.55){g.fillStyle=k>.5?'#f8d070':'#f0b25a';g.globalAlpha=.10+.18*k;g.fillRect(x,y,1,1)}}}g.globalAlpha=1}
    else{g.fillStyle='#3a2622';g.fillRect(px-4,66,9,2);g.fillRect(px-2,68,5,1);g.fillStyle='#4a2a24';g.fillRect(px+3,52,3,14)}}}
// 書桌檯燈（獨立開關，存 'alivelog.desklamp'）
let desk=localStorage.getItem('alivelog.desklamp')!=='off';
function drawDesk(){if(desk){const steps=[[.16,0],[.10,1],[.06,2]];for(let y=132;y<180;y++){const t=(y-132)/48,w=Math.round(4+t*13);
    steps.forEach(([a,k])=>{g.fillStyle=`rgba(248,208,112,${a})`;const ww=Math.max(1,w-k*4),x0=225-ww,x1=Math.min(227,225+ww);g.fillRect(x0,y,x1-x0+1,1)})}
    g.fillStyle='rgba(248,208,112,.25)';g.fillRect(206,180,40,1)}
  else{g.fillStyle='#e0cbb8';g.fillRect(212,180,28,1);g.fillStyle='#64503c';g.fillRect(214,181,24,1);g.fillStyle='#7a3e26';g.fillRect(218,125,14,6);g.fillStyle='#5e3026';g.fillRect(217,131,16,1)}}
function night(){return(window.WEATHER&&WEATHER.phase)==='night'}
function apply(){draw();drawDesk();dim.style.opacity=on?0:(night()?.45:.22);cv.dataset.on=on?'1':'0'}
function click(){if(window.IOS)return;try{const ac=window.__lac||(window.__lac=new AudioContext()),o=ac.createOscillator(),gn=ac.createGain(),t=ac.currentTime;
  o.type='square';o.frequency.value=on?1800:1200;gn.gain.setValueAtTime(.04,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.04);o.connect(gn).connect(ac.destination);o.start(t);o.stop(t+.05)}catch(e){}}
const hits=LAMPS.map(px=>{const h=document.createElement('div');h.className='lamphit';h.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
  h.addEventListener('pointerup',e=>{e.stopPropagation();on=!on;localStorage.setItem(KEY,on?'on':'off');apply();click()});document.body.appendChild(h);return[h,px]});
function place(){const V=window.VIEW;if(!V)return;const S=V.s;for(const el of[cv,dim])Object.assign(el.style,{left:V.ox+'px',top:V.oy+'px',width:Math.round(480*S)+'px',height:Math.round(270*S)+'px'});
  for(const[h,px]of hits)Object.assign(h.style,{left:Math.round(V.ox+(px-11)*S)+'px',top:Math.round(V.oy+22*S)+'px',width:Math.round(22*S)+'px',height:Math.round(56*S)+'px'})}
const dh=document.createElement('div');dh.className='lamphit';dh.id='deskhit';dh.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
dh.addEventListener('pointerup',e=>{e.stopPropagation();desk=!desk;localStorage.setItem('alivelog.desklamp',desk?'on':'off');apply();click()});document.body.appendChild(dh);
const placeDesk=()=>{const V=window.VIEW;if(!V)return;const S=V.s;Object.assign(dh.style,{left:Math.round(V.ox+211*S)+'px',top:Math.round(V.oy+118*S)+'px',width:Math.round(28*S)+'px',height:Math.round(64*S)+'px'})};
addEventListener('alivelog:layout',placeDesk);placeDesk();
addEventListener('alivelog:layout',place);place();apply();setInterval(apply,60000);
window.LIGHTS={get desk(){return desk},get on(){return on},toggle(){on=!on;localStorage.setItem(KEY,on?'on':'off');apply()}};
})();
