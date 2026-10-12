// ---- 貓咪行為紀錄：點貓開選單，一點就記；長按貓匯出 JSON ----
(function(){
const KEY='alivelog.cat.log',B=['睡','吃','玩','討摸','窗邊','躲起來'],CAT={x:364,y:150,w:70,h:34};
const $=id=>document.getElementById(id);
const hit=document.createElement('div');hit.id='cathit';hit.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
const cv=document.createElement('canvas');cv.width=CAT.w;cv.height=CAT.h;cv.style.cssText='position:absolute;z-index:3;pointer-events:none;image-rendering:pixelated';
const menu=document.createElement('div');menu.id='catmenu';
menu.style.cssText='position:absolute;z-index:8;display:none;background:#120f1a;border:2px solid #f0b25a;box-shadow:4px 4px 0 #05070a;padding:4px;font:14px/1 monospace;color:#e0cbb8;image-rendering:pixelated';
B.forEach(b=>{const d=document.createElement('div');d.textContent=b;d.dataset.b=b;d.style.cssText='padding:7px 12px;cursor:pointer;border-bottom:1px solid #3c3c44';menu.appendChild(d)});
document.body.append(cv,hit,menu);
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
function add(b){const d=new Date(),L=get();L.push({ts:d.toISOString(),behavior:b,weekday:d.getDay(),hour:d.getHours()});localStorage.setItem(KEY,JSON.stringify(L));pose();flash(b)}
function pose(){const g=cv.getContext('2d');g.clearRect(0,0,CAT.w,CAT.h);const last=get().slice(-1)[0];
  if(last&&last.behavior==='睡'){const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x-CAT.x,y-CAT.y,w,h)};
    for(const ex of[374,383]){R(ex,166,4,4,'#4e566a');R(ex,168,4,1,'#120f1a');R(ex,167,1,1,'#120f1a');R(ex+3,167,1,1,'#120f1a')}
    R(392,154,3,1,'#e0cbb8');R(393,155,1,1,'#e0cbb8');R(392,156,3,1,'#e0cbb8');R(397,151,2,1,'#e0cbb8');R(397,152,2,1,'#e0cbb8')}}
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
