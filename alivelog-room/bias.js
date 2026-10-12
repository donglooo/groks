// ---- 電視背光（牆面光暈）：A=固定暖白光暈、B=依頻道變色（Ambilight 風，用預設色，抓不到影片畫面）----
// 切換：網址 ?bias=A|B|off，或 localStorage 'alivelog.bias'；預設 A
(function(){
const q=new URLSearchParams(location.search).get('bias');
let mode=(q||localStorage.getItem('alivelog.bias')||'B').toUpperCase();if(q)localStorage.setItem('alivelog.bias',mode);
const cv=document.createElement('canvas');cv.id='bias';cv.width=480;cv.height=270;cv.className='px';cv.style.pointerEvents='none';
document.getElementById('fg').after(cv);const g=cv.getContext('2d');
const TV={x:100,y:44,w:110,h:64},RANGE=10;
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const CHC=['#5fd38a','#e0605a','#6a8cc0','#f0b25a'];   // 民視綠、TVBS 紅、公視藍、Joeman 琥珀
let flashUntil=0,lastCh=-1;
function dist(x,y){const dx=Math.max(TV.x-x,0,x-(TV.x+TV.w-1)),dy=Math.max(TV.y-y,0,y-(TV.y+TV.h-1));return Math.max(dx,dy)+Math.min(dx,dy)*.4}
// 預先算好每個像素的強度（像素抖動，只算一次）
const pts=[];for(let y=TV.y-RANGE;y<TV.y+TV.h+RANGE;y++)for(let x=TV.x-RANGE;x<TV.x+TV.w+RANGE;x++){const d=dist(x,y);if(d<=0||d>RANGE)continue;
  const k=Math.pow(1-d/RANGE,1.6),b=BAYER[(y&3)*4+(x&3)];if(b<k)pts.push([x,y,k])}
function paint(col,alpha,inner){alpha*=fade;g.clearRect(0,0,480,270);for(const[x,y,k]of pts){g.globalAlpha=Math.min(.85,alpha*(.35+.65*k));g.fillStyle=k>.55&&inner?inner:col;g.fillRect(x,y,1,1)}g.globalAlpha=1}
let fade=0;function on(){const off=document.getElementById('poweroff');return mode!=='OFF'&&!(off&&off.dataset.off==='1')}
function frame(now){
  if(!on()){fade=0;g.clearRect(0,0,480,270);cv.dataset.state='off'}
  else if(mode==='A'&&(fade<1&&(fade=Math.min(1,fade+.12),cv.dataset.state=''),true)&&cv.dataset.state!=='A'){paint('#d8a868',.4,'#e8d0b0');cv.dataset.state=fade<1?'':'A'}
  else if(mode==='A'){}
  else if(mode==='B'){if(fade<1)fade=Math.min(1,fade+.12);const c=(typeof ch!=='undefined'?ch:0);if(c!==lastCh){if(lastCh>=0)flashUntil=now+250;lastCh=c}
    const br=.9+.1*Math.sin(now/1000*Math.PI*.25),fl=now<flashUntil;paint(CHC[c%4],(fl?.42:.36)*br,null);cv.dataset.state='B'+c}
  setTimeout(()=>requestAnimationFrame(frame),(mode==='B'||fade<1)?100:500)}
function place(){const V=window.VIEW;if(!V)return;Object.assign(cv.style,{left:V.ox+'px',top:V.oy+'px',width:Math.round(480*V.s)+'px',height:Math.round(270*V.s)+'px'})}
addEventListener('alivelog:layout',place);place();requestAnimationFrame(frame);
window.BIAS={get mode(){return mode},set(m){mode=String(m).toUpperCase();localStorage.setItem('alivelog.bias',mode);cv.dataset.state=''}};
})();
