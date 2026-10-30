// ---- 書架入口：樓下牆架那排書。點一下開三個學習頁（公文課／這週作業／範本庫），都在 gongwen/。
// 還沒打開過會在最左邊那本書上閃一下。打開任一頁後寫入 localStorage 'alivelog.shelf.seen'。
(function(){
const SHELF={x:122,y:297,w:62,h:22},GLINT={x:125,y:301};
const PAGES=[
  {id:'course',name:'公文課',hash:'course'},
  {id:'homework',name:'這週作業',hash:'homework'},
  {id:'templates',name:'範本庫',hash:'templates'}
];
const KEY='alivelog.shelf.seen';
const seen=()=>{try{return localStorage.getItem(KEY)==='1'}catch(e){return false}};
const mark=()=>{try{localStorage.setItem(KEY,'1')}catch(e){}};
const css=document.createElement('style');css.textContent=`
#shelfhit{position:absolute;z-index:4;cursor:pointer;touch-action:none}
#shelfglint{position:absolute;z-index:4;pointer-events:none;background:#f0b25a;opacity:0;animation:shgl 4s steps(1) infinite}
@keyframes shgl{0%{opacity:0}78%{opacity:.9}90%{opacity:0}100%{opacity:0}}
#shelfmenu{position:absolute;z-index:8;display:none;background:#120f1a;border:2px solid #f0b25a;box-shadow:4px 4px 0 #05070a;padding:4px;font:14px/1 monospace;color:#e0cbb8}
#shelfmenu b{display:block;padding:10px 14px;cursor:pointer;font-weight:normal;border-bottom:1px solid #3c3c44}
#shelfmenu b:last-child{border-bottom:0}
#shelf-ov{position:fixed;inset:0;z-index:60;display:none;flex-direction:column;background:rgba(10,8,16,.88);touch-action:auto}
#shelf-ov.on{display:flex}
#shelf-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;color:#e0cbb8;font:14px/1 monospace}
#shelf-x{background:#24222c;color:#e0cbb8;border:2px solid #f0b25a;padding:8px 14px;font:inherit;cursor:pointer}
#shelf-frame{flex:1;width:100%;border:0;background:#f7f3ea}`;
document.head.appendChild(css);
const hit=document.createElement('div');hit.id='shelfhit';
const gl=document.createElement('div');gl.id='shelfglint';
const menu=document.createElement('div');menu.id='shelfmenu';
PAGES.forEach(p=>{const b=document.createElement('b');b.textContent=p.name;b.dataset.id=p.id;menu.appendChild(b)});
const ov=document.createElement('div');ov.id='shelf-ov';
ov.innerHTML='<div id="shelf-bar"><span id="shelf-title"></span><button id="shelf-x" type="button">關閉</button></div><iframe id="shelf-frame" title="學習頁"></iframe>';
document.body.append(hit,gl,menu,ov);
const frame=document.getElementById('shelf-frame'),title=document.getElementById('shelf-title');
function place(){const V=window.VIEW;if(!V)return;const s=V.s;
  Object.assign(hit.style,{left:Math.round(V.ox+SHELF.x*s)+'px',top:Math.round(V.oy+SHELF.y*s)+'px',width:Math.round(SHELF.w*s)+'px',height:Math.round(SHELF.h*s)+'px'});
  if(seen()){gl.style.display='none';return}
  Object.assign(gl.style,{display:'block',left:Math.round(V.ox+GLINT.x*s)+'px',top:Math.round(V.oy+GLINT.y*s)+'px',width:Math.max(2,Math.round(2*s))+'px',height:Math.max(2,Math.round(6*s))+'px'});
}
function menuOpen(){menu.style.display='block';const r=hit.getBoundingClientRect(),mh=menu.offsetHeight,mw=menu.offsetWidth;
  let top=r.bottom+6;if(top+mh>innerHeight-4)top=r.top-mh-6;
  menu.style.left=Math.max(4,Math.min(innerWidth-mw-4,r.left))+'px';
  menu.style.top=Math.max(4,top)+'px'}
function menuClose(){menu.style.display='none'}
function openPage(id){const p=PAGES.find(x=>x.id===id)||PAGES[0];menuClose();mark();place();
  title.textContent=p.name;frame.src='gongwen/#'+p.hash;ov.classList.add('on');ov.dataset.page=p.id}
function closePage(){ov.classList.remove('on');ov.dataset.page='';frame.src='about:blank'}
let down=null;
hit.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};e.stopPropagation()});
hit.addEventListener('pointerup',e=>{const s=(window.VIEW||{}).s||1,moved=down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>6*s;down=null;
  e.stopPropagation();if(moved||ov.classList.contains('on'))return;if(menu.style.display==='block')menuClose();else menuOpen()});
hit.addEventListener('click',e=>e.stopPropagation());
menu.addEventListener('pointerdown',e=>e.stopPropagation());
menu.addEventListener('pointerup',e=>{const b=e.target.closest('b');if(!b)return;e.stopPropagation();openPage(b.dataset.id)});
document.getElementById('shelf-x').addEventListener('pointerup',e=>{e.stopPropagation();closePage()});
ov.addEventListener('pointerdown',e=>{if(e.target===ov)e.stopPropagation()});
document.addEventListener('pointerdown',e=>{if(menu.style.display==='block'&&!menu.contains(e.target)&&e.target!==hit)menuClose()},true);
addEventListener('alivelog:layout',place);place();
window.SHELF={open:openPage,close:closePage,pages:PAGES};
})();
