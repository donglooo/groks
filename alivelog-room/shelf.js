// ---- 電視下方、沙發上方那排書：點開三本學習頁（各自獨立，不是同一課的分頁）----
// 實測 room_fg.png（600×420）：書脊 x124–176、y302–315；層板 x124–182、y316–318；支架落到 y321。
// 點擊區含一點牆面留白，仍離沙發坐墊（約 y348）很遠。拖曳超過 6px 不算點，跟房間平移同一門檻。
(function(){
const HIT={x:118,y:294,w:66,h:28};   // x118–184、y294–322
const SLOP=6;
const BOOKS=[
  {id:'gongwen',name:'公文',href:'gongwen/'},
  {id:'english',name:'英文發音',href:'english/'},
  {id:'housing',name:'住宅研究',href:'housing/'}
];
const css=document.createElement('style');css.textContent=`
#shelfhit{position:absolute;z-index:4;cursor:pointer;touch-action:none}
#shelf-pick,#shelf-read{position:fixed;inset:0;display:none}
#shelf-pick.on,#shelf-read.on{display:flex}
#shelf-pick{z-index:70;align-items:center;justify-content:center;background:rgba(10,8,16,.78);touch-action:none}
#shelf-panel{width:min(92vw,420px);box-sizing:border-box;background:#24222c;border:3px solid #120f1a;box-shadow:4px 4px 0 #05070a;padding:14px 14px 12px;color:#e0cbb8}
#shelf-panel h2{margin:0 0 12px;text-align:center;font:bold 14px/1 ui-monospace,monospace;letter-spacing:.18em;color:#f0b25a}
.shelf-row{display:flex;gap:10px}
.shelf-book{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;min-height:148px;padding:12px 4px 10px;background:#1c1a22;color:#e0cbb8;border:2px solid #120f1a;box-shadow:inset 0 -3px 0 #121016;cursor:pointer;font:bold 15px/1.25 ui-monospace,monospace;touch-action:none}
.shelf-book b{width:36px;height:74px;box-shadow:inset -5px 0 0 rgba(0,0,0,.35),inset 4px 0 0 rgba(255,248,230,.28),3px 3px 0 #05070a}
.shelf-book[data-book=gongwen] b{background:#9a3a32}
.shelf-book[data-book=english] b{background:#2f6f62}
.shelf-book[data-book=housing] b{background:#c48a3a}
#shelf-dismiss{display:block;width:100%;min-height:48px;margin-top:12px;background:#efe6d6;color:#2a2418;border:2px solid #120f1a;font:bold 16px/1 ui-monospace,monospace;cursor:pointer;touch-action:manipulation}
#shelf-read{z-index:80;flex-direction:column;background:#120f1a;touch-action:auto}
#shelf-bar{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top));background:#24222c;color:#e0cbb8;border-bottom:3px solid #120f1a;font:bold 15px/1.2 ui-monospace,monospace}
#shelf-x{flex:none;min-width:88px;min-height:48px;padding:0 16px;background:#efe6d6;color:#2a2418;border:2px solid #120f1a;font:bold 16px/1 ui-monospace,monospace;cursor:pointer;touch-action:manipulation}
#shelf-frame{flex:1;width:100%;min-height:0;border:0;background:#f7f4ee;touch-action:auto}
`;
document.head.appendChild(css);
const hit=document.createElement('div');hit.id='shelfhit';hit.setAttribute('role','button');hit.setAttribute('aria-label','書架');
const pick=document.createElement('div');pick.id='shelf-pick';
pick.innerHTML='<div id="shelf-panel" role="dialog" aria-modal="true" aria-label="書架"><h2>書架</h2><div class="shelf-row">'+
  BOOKS.map(b=>'<button type="button" class="shelf-book" data-book="'+b.id+'"><b></b>'+b.name+'</button>').join('')+
  '</div><button type="button" id="shelf-dismiss">關閉</button></div>';
const read=document.createElement('div');read.id='shelf-read';
read.innerHTML='<div id="shelf-bar"><span id="shelf-title"></span><button type="button" id="shelf-x">關閉</button></div><iframe id="shelf-frame" title="學習頁"></iframe>';
document.body.append(hit,pick,read);
const frame=document.getElementById('shelf-frame'),title=document.getElementById('shelf-title');
const bookOf=id=>BOOKS.filter(b=>b.id===id)[0];
function place(){const V=window.VIEW;if(!V)return;const S=V.s;
  Object.assign(hit.style,{left:Math.round(V.ox+HIT.x*S)+'px',top:Math.round(V.oy+HIT.y*S)+'px',width:Math.round(HIT.w*S)+'px',height:Math.round(HIT.h*S)+'px'})}
addEventListener('alivelog:layout',place);place();
function closeAll(){pick.classList.remove('on');read.classList.remove('on');frame.src='about:blank';window.SHELFOPEN=false}
function showPick(){frame.src='about:blank';read.classList.remove('on');pick.classList.add('on');window.SHELFOPEN=true}
function showRead(book){pick.classList.remove('on');title.textContent=book.name;frame.title=book.name;frame.src=book.href;read.classList.add('on');window.SHELFOPEN=true}
let d=null;
hit.addEventListener('pointerdown',e=>{if(e.button!==0||window.SHELFOPEN)return;d={x:e.clientX,y:e.clientY,id:e.pointerId};try{hit.setPointerCapture(e.pointerId)}catch(_){}});
hit.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>SLOP)d.drag=true});
hit.addEventListener('pointerup',e=>{if(!d||e.pointerId!==d.id)return;const drag=d.drag||Math.hypot(e.clientX-d.x,e.clientY-d.y)>SLOP;d=null;if(e.button!==0||drag)return;showPick()});
hit.addEventListener('pointercancel',()=>{d=null});
hit.addEventListener('click',e=>e.stopPropagation());
function tap(el,fn){let p=null;
  el.addEventListener('pointerdown',e=>{e.stopPropagation();if(e.button!==0)return;p={x:e.clientX,y:e.clientY,id:e.pointerId}});
  el.addEventListener('pointerup',e=>{e.stopPropagation();if(!p||e.pointerId!==p.id)return;const m=Math.hypot(e.clientX-p.x,e.clientY-p.y);p=null;if(e.button!==0||m>SLOP)return;fn()});
  el.addEventListener('pointercancel',()=>{p=null});
  el.addEventListener('click',e=>e.stopPropagation())}
pick.querySelectorAll('.shelf-book').forEach(btn=>tap(btn,()=>{const b=bookOf(btn.dataset.book);if(b)showRead(b)}));
tap(document.getElementById('shelf-dismiss'),closeAll);
tap(document.getElementById('shelf-x'),closeAll);
pick.addEventListener('pointerdown',e=>e.stopPropagation());
pick.addEventListener('pointerup',e=>{if(e.target===pick){e.stopPropagation();closeAll()}});
read.addEventListener('pointerdown',e=>e.stopPropagation());
addEventListener('keydown',e=>{if(e.key==='Escape'&&window.SHELFOPEN){e.preventDefault();closeAll()}});
window.SHELF={hit:HIT,books:BOOKS,pick:showPick,open:showRead,close:closeAll};
})();
