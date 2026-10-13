// ---- 吊燈：點燈（範圍放大）開/關；開＝暖色光錐，關＝燈罩變暗、房間調暗（晚上更暗）；狀態存 localStorage 'alivelog.lights' ----
(function(){
const $=id=>document.getElementById(id),KEY='alivelog.lights',LAMPS=[272,316];
let on=localStorage.getItem(KEY)!=='off';
const cv=document.createElement('canvas');cv.width=600;cv.height=420;cv.className='px';cv.style.pointerEvents='none';
const dim=document.createElement('div');dim.id='dim';dim.className='px';dim.style.cssText='pointer-events:none;background:#05070f;opacity:0;transition:opacity .25s steps(4)';
$('fg').after(dim);dim.after(cv);   // 順序：房間 → 調暗層 → 光錐 →（背光、電視在更上面）
const g=cv.getContext('2d'),B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
function draw(){g.clearRect(0,0,600,420);
  for(const px of LAMPS){
    if(on){for(let y=219;y<300;y++){const t=(y-219)/81,w=Math.round(6+t*34);   // live23：乾淨的 3 圈半透明色帶（不再用 Bayer 抖點）
        for(const[f,al,c]of[[1,.06,'#f0b25a'],[.62,.07,'#f0b25a'],[.3,.08,'#f8d070']]){const ww=Math.round(w*f);const fade=1-t*.6;g.fillStyle=c;g.globalAlpha=al*fade;g.fillRect(px-ww,y,ww*2+1,1)}}g.globalAlpha=1}
    else{g.fillStyle='#3a2622';g.fillRect(px-4,216,9,2);g.fillRect(px-2,218,5,1);g.fillStyle='#4a2a24';g.fillRect(px+3,202,3,14)}}}
// live24：書桌檯燈已從底圖拿掉（drawDesk／#deskhit／alivelog.desklamp 移除）
try{localStorage.removeItem('alivelog.desklamp')}catch(e){}
function night(){return(window.WEATHER&&WEATHER.phase)==='night'}
function apply(){draw();dim.style.opacity=on?0:(night()?.45:.22);cv.dataset.on=on?'1':'0'}
function click(){if(window.IOS)return;try{const ac=window.__lac||(window.__lac=new AudioContext()),o=ac.createOscillator(),gn=ac.createGain(),t=ac.currentTime;
  o.type='square';o.frequency.value=on?1800:1200;gn.gain.setValueAtTime(.04,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.04);o.connect(gn).connect(ac.destination);o.start(t);o.stop(t+.05)}catch(e){}}
const hits=LAMPS.map(px=>{const h=document.createElement('div');h.className='lamphit';h.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
  h.addEventListener('pointerup',e=>{e.stopPropagation();on=!on;localStorage.setItem(KEY,on?'on':'off');apply();click()});document.body.appendChild(h);return[h,px]});
function place(){const V=window.VIEW;if(!V)return;const S=V.s;for(const el of[cv,dim])Object.assign(el.style,{left:V.ox+'px',top:V.oy+'px',width:Math.round(600*S)+'px',height:Math.round(420*S)+'px'});
  for(const[h,px]of hits)Object.assign(h.style,{left:Math.round(V.ox+(px-11)*S)+'px',top:Math.round(V.oy+172*S)+'px',width:Math.round(22*S)+'px',height:Math.round(56*S)+'px'})}
addEventListener('alivelog:layout',place);place();apply();setInterval(apply,60000);
window.LIGHTS={get on(){return on},toggle(){on=!on;localStorage.setItem(KEY,on?'on':'off');apply()}};
})();
