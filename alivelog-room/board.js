// ---- 軟木板便利貼（磁磚牆上，小版 x250–292、y88–128）：狀態存 localStorage 'alivelog.board' ----
// 點板上空白處＝新增（下方一行輸入框＋5 色）；點便利貼＝放大編輯；拖曳（移動 >4px 才開始）；長按 0.7 秒＝進度圈滿了撕掉（放開就取消）
// 板子本體由本檔畫（room_fg 背景裡不畫，免得重複）；便利貼上的字只畫成橫條，不在房間畫面上顯示內容
(function(){
const KEY='alivelog.board',BX=273,BY=232,BW=43,BH=41,IX0=BX+3,IY0=BY+3,IX1=BX+BW-3,IY1=BY+BH-3,NW=12,NH=11,MAX=6,LONG=700,DRAG=4;
const COLS=['#f0c85a','#dc8c96','#6eb4aa','#a0c86e','#c8c8be'];
const st=(()=>{try{const j=JSON.parse(localStorage.getItem(KEY));if(j&&Array.isArray(j.notes))return j}catch(e){}return{notes:[]}})();
if(st.notes.some(n=>n.x<IX0||n.y<IY0||n.x>IX1-NW||n.y>IY1-NH)){st.notes.forEach(n=>{if(n.y<150)n.y+=150;n.x+=BX-250;n.y+=BY-238;n.x=Math.max(IX0,Math.min(IX1-NW,n.x));n.y=Math.max(IY0,Math.min(IY1-NH,n.y))});localStorage.setItem(KEY,JSON.stringify(st))}   // 舊版（480x270 或 loft_final）位置的便利貼：搬到新板子並夾在板內   // live23：舊 480x270 座標的便利貼搬到新座標（y+150）
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const cv=document.createElement('canvas');cv.width=600;cv.height=420;cv.className='px';cv.id='boardcv';cv.style.pointerEvents='none';
document.getElementById('fg').after(cv);   // 在房間圖之後、lights.js 調暗層之前 → 關燈時一起變暗
const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
// 軟木斑點（固定亂數）
const SPK=[];{let s=3;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<60;i++)SPK.push([BX+2+Math.floor(r()*(BW-4)),BY+2+Math.floor(r()*(BH-4)),r()<.5?'#96683e':'#c49662'])}
let drag=null,press=null;   // drag:{id,x,y}；press:{id,t0,k}
function noteAt(n,x,y,lift){if(lift)R(x+1,y+1,NW,NH,'rgba(10,10,14,.55)');R(x,y,NW,NH,COLS[n.c]||COLS[0]);
  const L=(n.t||'').length,lines=L?Math.min(3,Math.ceil(L/8)):0;for(let i=0;i<lines;i++)R(x+2,y+3+i*3,Math.max(2,Math.min(8,L-i*8)),1,'#5a463c');   // 字只畫成長短橫條
  R(x+5,y,2,2,'#c8463a');R(x+5,y,1,1,'#ffb4aa')}                                                            // 紅圖釘
function draw(){g.clearRect(0,0,600,420);
  R(BX,BY,BW,BH,'#7a4e2c');R(BX+2,BY+2,BW-4,BH-4,'#b08050');R(BX,BY,BW,1,'#96683e');for(const[x,y,c]of SPK)R(x,y,1,1,c);
  for(const n of st.notes){if(drag&&drag.id===n.id)continue;noteAt(n,n.x,n.y)}
  if(drag){const n=find(drag.id);if(n)noteAt(n,drag.x,drag.y,true)}
  if(press&&press.k>0){const n=find(press.id);if(n){const cx=n.x+NW/2,cy=n.y+NH/2,N=16;for(let i=0;i<Math.round(N*press.k);i++){const a=-Math.PI/2+i/N*Math.PI*2;R(Math.round(cx+Math.cos(a)*8),Math.round(cy+Math.sin(a)*8),1,1,'#f0ece2')}}}
  cv.dataset.n=st.notes.length}
const find=id=>st.notes.find(n=>n.id===id);
const clampX=x=>Math.max(IX0,Math.min(IX1-NW,Math.round(x))),clampY=y=>Math.max(IY0,Math.min(IY1-NH,Math.round(y)));
// 每張便利貼一個點擊區（touch-action:none：按在便利貼上不會觸發房間平移）
const hits=new Map();
function syncHits(){for(const[id,h]of hits)if(!find(id)){h.remove();hits.delete(id)}
  for(const n of st.notes)if(!hits.has(n.id)){const h=document.createElement('div');h.className='notehit';h.dataset.id=n.id;h.style.cssText='position:absolute;z-index:4;cursor:grab;touch-action:none';bind(h,n.id);document.body.appendChild(h);hits.set(n.id,h)}
  place()}
function place(){const V=window.VIEW;if(!V)return;const S=V.s;Object.assign(cv.style,{left:V.ox+'px',top:V.oy+'px',width:Math.round(600*S)+'px',height:Math.round(420*S)+'px'});
  for(const[id,h]of hits){const n=find(id);if(!n)continue;const x=drag&&drag.id===id?drag.x:n.x,y=drag&&drag.id===id?drag.y:n.y;
    Object.assign(h.style,{left:V.ox+(x-1)*S+'px',top:V.oy+(y-1)*S+'px',width:(NW+2)*S+'px',height:(NH+2)*S+'px'})}}
const toRoom=e=>{const V=window.VIEW||{s:1,ox:0,oy:0};return{x:(e.clientX-V.ox)/V.s,y:(e.clientY-V.oy)/V.s}};
function bind(h,id){
  h.addEventListener('pointerdown',e=>{e.stopPropagation();try{h.setPointerCapture(e.pointerId)}catch(_){}const p=toRoom(e),n=find(id);
    press={id,t0:performance.now(),k:0,sx:e.clientX,sy:e.clientY,dx:p.x-n.x,dy:p.y-n.y,moved:false};
    (function f(){if(!press||press.id!==id||press.moved)return;press.k=Math.min(1,(performance.now()-press.t0-150)/(LONG-150));draw();
      if(press.k>=1){tear(id);return}requestAnimationFrame(f)})()});
  h.addEventListener('pointermove',e=>{if(!press||press.id!==id)return;
    if(!press.moved&&Math.hypot(e.clientX-press.sx,e.clientY-press.sy)>DRAG*((window.VIEW||{s:1}).s>1?1:1)){press.moved=true;press.k=0;h.style.cursor='grabbing'}
    if(press.moved){const p=toRoom(e);drag={id,x:clampX(p.x-press.dx),y:clampY(p.y-press.dy)};draw();place()}});
  const up=e=>{e.stopPropagation();if(!press||press.id!==id)return;const pr=press;press=null;h.style.cursor='grab';
    if(pr.moved&&drag){const n=find(id);n.x=drag.x;n.y=drag.y;drag=null;save();window.BOARDEV.push('drag')}
    else if(pr.k<.25&&performance.now()-pr.t0<LONG*.5)edit(id);   // 短按＝編輯；按一半放開＝取消
    else window.BOARDEV.push('cancel');
    draw();place()};
  h.addEventListener('pointerup',up);h.addEventListener('pointercancel',e=>{press=null;drag=null;draw();place()});h.addEventListener('click',e=>e.stopPropagation())}
function tear(id){const n=find(id);press=null;if(!n)return;const x0=n.x,y0=n.y,t0=performance.now();window.BOARDEV.push('tear');
  st.notes=st.notes.filter(m=>m.id!==id);save();syncHits();
  (function f(){const k=(performance.now()-t0)/450;draw();if(k>=1){draw();return}g.save();g.globalAlpha=1-k;g.translate(x0+NW/2+k*6,y0+NH/2+k*22);g.rotate(k*.6);
    g.fillStyle=COLS[n.c]||COLS[0];g.fillRect(-NW/2,-NH/2,NW,NH);g.restore();requestAnimationFrame(f)})();
  bubble('撕掉了',x0,y0-8)}
// 點板子空白處＝新增：平移是 index.html 從 fg 開始的拖曳，我們只在「沒有移動」的點擊才新增 → 不搶平移
let tap=null;
addEventListener('pointerdown',e=>{const t=e.target;if(!(t===document.body||t.id==='fg'||t.id==='amb'||t.id==='sky'))return;const p=toRoom(e);
  if(p.x>=BX&&p.x<BX+BW&&p.y>=BY&&p.y<BY+BH)tap={x:e.clientX,y:e.clientY,p};else tap=null});
addEventListener('pointerup',e=>{if(!tap)return;const T=tap;tap=null;if(Math.hypot(e.clientX-T.x,e.clientY-T.y)>6)return;
  if(st.notes.length>=MAX){bubble('板子滿了，先撕一張',BX-6,BY-8);return}
  compose({x:clampX(T.p.x-NW/2),y:clampY(T.p.y-NH/2)})});
// ---- 輸入介面（HTML overlay，手機鍵盤可用）----
const ui=document.createElement('div');ui.id='boardui';
ui.style.cssText='position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:20;display:none;background:#120f1a;border:2px solid #f0b25a;box-shadow:4px 4px 0 #05070a;padding:8px;font:14px monospace;color:#e0cbb8;width:min(92vw,360px);box-sizing:border-box';
ui.innerHTML='<div id="bcols" style="display:flex;gap:8px;margin-bottom:8px"></div><textarea id="btext" rows="1" maxlength="60" placeholder="寫一句…" style="width:100%;box-sizing:border-box;font:16px monospace;background:#e0cbb8;color:#120f1a;border:0;padding:6px;resize:none"></textarea>'+
  '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button id="bcancel">取消</button><button id="bok">貼上</button></div>';
document.body.appendChild(ui);for(const b of ui.querySelectorAll('button'))b.style.cssText='font:14px monospace;background:#120f1a;color:#f0b25a;border:2px solid #f0b25a;padding:6px 12px';
const $=id=>ui.querySelector('#'+id);let cur=null,selC=0;
COLS.forEach((c,i)=>{const d=document.createElement('div');d.className='bcol';d.dataset.c=i;d.style.cssText=`width:28px;height:28px;background:${c};border:2px solid #120f1a;cursor:pointer`;d.addEventListener('pointerup',e=>{e.stopPropagation();pick(i)});$('bcols').appendChild(d)});
function pick(i){selC=i;ui.querySelectorAll('.bcol').forEach((d,k)=>d.style.borderColor=k===i?'#f0ece2':'#120f1a')}
for(const ev of['pointerdown','pointerup','click'])ui.addEventListener(ev,e=>e.stopPropagation());
function compose(pos){cur={mode:'new',pos};$('btext').rows=1;$('btext').value='';$('bok').textContent='貼上';pick(st.notes.length%5);open()}
function edit(id){const n=find(id);if(!n)return;cur={mode:'edit',id};$('btext').rows=3;$('btext').value=n.t||'';$('bok').textContent='確定';pick(n.c||0);open();window.BOARDEV.push('edit')}
function open(){ui.style.display='block';ui.dataset.mode=cur.mode;setTimeout(()=>$('btext').focus(),0)}
function close(){ui.style.display='none';cur=null;$('btext').blur()}
function ok(){if(!cur)return;const t=$('btext').value.trim().slice(0,60);
  if(cur.mode==='new'){if(t){st.notes.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),x:cur.pos.x,y:cur.pos.y,c:selC,t,at:Date.now()});window.BOARDEV.push('add')}}
  else{const n=find(cur.id);if(n){n.t=t;n.c=selC}}
  save();close();syncHits();draw()}
$('bok').addEventListener('pointerup',ok);$('bcancel').addEventListener('pointerup',close);
$('btext').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&!e.shiftKey&&cur&&cur.mode==='new'){e.preventDefault();ok()}if(e.key==='Escape')close()});
function bubble(t,x,y){const V=window.VIEW||{s:1,ox:0,oy:0},d=document.createElement('div');d.textContent=t;
  d.style.cssText=`position:absolute;z-index:6;pointer-events:none;font:bold ${Math.max(12,Math.round(V.s*6))}px monospace;color:#f0b25a;text-shadow:2px 2px 0 #05070a;left:${V.ox+x*V.s}px;top:${V.oy+y*V.s}px`;
  document.body.appendChild(d);setTimeout(()=>d.remove(),1000)}
window.BOARDEV=[];
addEventListener('alivelog:layout',place);syncHits();draw();
window.BOARD={get notes(){return st.notes.map(n=>Object.assign({},n))},get ui(){return cur&&cur.mode},clear(){st.notes=[];save();syncHits();draw()}};
})();
