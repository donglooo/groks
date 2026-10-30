// ---- 書架（我的世界）：點下層牆架那排書，選三個已上線的學習頁 ----
// 課程／作業／範本庫都在 gongwen/（公文函 v1）。批改分頁還是空的，先不掛。
// 點書以外的暗處關掉。直拿拖曳不算點。
(function(){
const BOOKS=[
  {t:'課程',href:'gongwen/#course'},
  {t:'作業',href:'gongwen/#homework'},
  {t:'範本庫',href:'gongwen/#templates'}
];
// 下層牆架書脊（room_fg 600×420）：x124–176、y299–315，點擊區略放大
const BOX={x:118,y:294,w:64,h:26};
const css=document.createElement('style');css.textContent=`
#shelfmenu{position:absolute;z-index:8;display:none;background:#120f1a;border:2px solid #f0b25a;box-shadow:4px 4px 0 #05070a;padding:4px;font:14px/1.3 "PingFang TC","Noto Sans TC",ui-monospace,monospace;color:#e0cbb8}
#shelfmenu div{padding:8px 14px;cursor:pointer;border-bottom:1px solid #3c3c44}
#shelfmenu div:last-child{border-bottom:0}
#shelf-ov{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(10,8,16,.82);touch-action:auto}
#shelf-ov.on{display:flex}
#shelf-ov iframe{width:min(860px,94vw);height:calc(100vh - 48px);border:3px solid #efe6d6;background:#f7f3ea;pointer-events:auto;touch-action:auto}`;
document.head.appendChild(css);
const hit=document.createElement('div');hit.id='shelfhit';hit.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
const menu=document.createElement('div');menu.id='shelfmenu';
BOOKS.forEach((b,i)=>{const d=document.createElement('div');d.textContent=b.t;d.dataset.i=i;menu.appendChild(d)});
const ov=document.createElement('div');ov.id='shelf-ov';ov.innerHTML='<iframe title="學習頁"></iframe>';
document.body.append(hit,menu,ov);
const frame=ov.querySelector('iframe');
function place(){const V=window.VIEW;if(!V)return;const s=V.s;
  Object.assign(hit.style,{left:Math.round(V.ox+BOX.x*s)+'px',top:Math.round(V.oy+BOX.y*s)+'px',width:Math.round(BOX.w*s)+'px',height:Math.round(BOX.h*s)+'px'});
  if(menu.style.display==='block')openMenu()}
function openMenu(){menu.style.display='block';const r=hit.getBoundingClientRect(),mw=menu.offsetWidth,mh=menu.offsetHeight;
  menu.style.left=Math.max(4,Math.min(innerWidth-mw-4,r.left+r.width/2-mw/2))+'px';
  menu.style.top=Math.max(4,Math.min(innerHeight-mh-4,r.top-mh-6))+'px'}
const closeMenu=()=>{menu.style.display='none'};
function openBook(i){const b=BOOKS[i];if(!b)return false;closeMenu();frame.src=b.href;ov.classList.add('on');return true}
function closeBook(){ov.classList.remove('on');frame.src='about:blank'}
let d=null;
hit.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY}});
hit.addEventListener('pointerup',e=>{const m=d&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>6*((window.VIEW||{}).s||1);d=null;if(m)return;
  e.stopPropagation();if(menu.style.display==='block')closeMenu();else openMenu()});
hit.addEventListener('click',e=>e.stopPropagation());
menu.addEventListener('pointerdown',e=>e.stopPropagation());
menu.addEventListener('click',e=>{e.stopPropagation();const i=e.target.dataset.i;if(i!=null)openBook(+i)});
ov.addEventListener('pointerdown',e=>{e.stopPropagation();if(e.target===ov)closeBook()});
document.addEventListener('pointerdown',e=>{if(menu.style.display==='block'&&!menu.contains(e.target)&&e.target!==hit)closeMenu()},true);
addEventListener('alivelog:layout',place);addEventListener('resize',()=>setTimeout(place,50));place();
window.SHELF={books:BOOKS,openMenu,closeMenu,openBook,closeBook,box:BOX};
})();
