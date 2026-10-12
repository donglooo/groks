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
function night(){return(window.WEATHER&&WEATHER.phase)==='night'}
function apply(){draw();dim.style.opacity=on?0:(night()?.45:.22);cv.dataset.on=on?'1':'0'}
function click(){if(window.IOS)return;try{const ac=window.__lac||(window.__lac=new AudioContext()),o=ac.createOscillator(),gn=ac.createGain(),t=ac.currentTime;
  o.type='square';o.frequency.value=on?1800:1200;gn.gain.setValueAtTime(.04,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.04);o.connect(gn).connect(ac.destination);o.start(t);o.stop(t+.05)}catch(e){}}
const hits=LAMPS.map(px=>{const h=document.createElement('div');h.className='lamphit';h.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
  h.addEventListener('pointerup',e=>{e.stopPropagation();on=!on;localStorage.setItem(KEY,on?'on':'off');apply();click()});document.body.appendChild(h);return[h,px]});
function place(){const V=window.VIEW;if(!V)return;const S=V.s;for(const el of[cv,dim])Object.assign(el.style,{left:V.ox+'px',top:V.oy+'px',width:Math.round(480*S)+'px',height:Math.round(270*S)+'px'});
  for(const[h,px]of hits)Object.assign(h.style,{left:Math.round(V.ox+(px-11)*S)+'px',top:Math.round(V.oy+22*S)+'px',width:Math.round(22*S)+'px',height:Math.round(56*S)+'px'})}
addEventListener('alivelog:layout',place);place();apply();setInterval(apply,60000);
window.LIGHTS={get on(){return on},toggle(){on=!on;localStorage.setItem(KEY,on?'on':'off');apply()}};
})();
