// ---- 書架：點左側牆面那排書，打開公文課前三課 ----
// 書本在 room_fg 600×420 的 x120–184、y299–321。拖曳（直拿平移）不算點；和貓重疊時貓優先。
(function(){
const BOX={x:120,y:299,w:64,h:22};   // 只蓋書與層板，不含左邊那格空架
const BOOKS=[
  {n:'1',title:'簽與函',sub:'公文的兩個基本款',href:'gongwen/#lesson-01'},
  {n:'2',title:'簽的深入',sub:'主旨、說明、擬辦',href:'gongwen/#lesson-02'},
  {n:'3',title:'函的深入',sub:'上行、平行、下行',href:'gongwen/#lesson-03'}
];
const css=document.createElement('style');css.textContent=`
#shelf-ov{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(10,8,16,.82);touch-action:auto}
#shelf-ov.on{display:flex}
#shelf-card{width:min(92vw,360px);background:#24222c;border:3px solid #120f1a;box-shadow:4px 4px 0 #05070a;padding:14px 14px 10px;color:#e0cbb8;font:15px/1.45 ui-monospace,monospace}
#shelf-card h2{margin:0 0 4px;font:bold 16px/1.3 ui-monospace,monospace;color:#f0b25a;letter-spacing:.12em}
#shelf-card p{margin:0 0 12px;color:#8a8494;font-size:12px}
#shelf-card a{display:grid;grid-template-columns:28px 1fr;gap:2px 10px;align-items:center;margin:0 0 8px;padding:10px 10px;background:#3c3c44;color:#e0cbb8;text-decoration:none;border:2px solid #120f1a;box-shadow:inset 0 -3px 0 #24222c}
#shelf-card a:active{transform:translateY(2px);box-shadow:none}
#shelf-card a b{grid-row:span 2;display:flex;align-items:center;justify-content:center;height:28px;background:#2f5d50;color:#f7f3ea;font-size:14px}
#shelf-card a small{color:#cfc6b8;font-size:12px}`;
document.head.appendChild(css);
const ov=document.createElement('div');ov.id='shelf-ov';
ov.innerHTML='<div id="shelf-card" role="dialog" aria-modal="true" aria-label="書架"><h2>書架</h2><p>冬瓜的公文課</p>'+
  BOOKS.map(b=>`<a href="${b.href}"><b>${b.n}</b><span>${b.title}</span><small>${b.sub}</small></a>`).join('')+
  '</div>';
document.body.appendChild(ov);
const card=document.getElementById('shelf-card');
function open(){ov.classList.add('on')}
function close(){ov.classList.remove('on')}
ov.addEventListener('click',e=>{if(!card.contains(e.target))close()});
ov.addEventListener('pointerdown',e=>e.stopPropagation());
card.addEventListener('click',e=>{if(e.target.closest('a'))close()});
const hit=document.createElement('div');hit.id='shelfhit';hit.setAttribute('aria-label','書架');
hit.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
const cat=document.getElementById('cathit');cat?cat.before(hit):document.body.appendChild(hit);
let d=null;
hit.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY}});
hit.addEventListener('pointerup',e=>{const s=(window.VIEW||{}).s||1,m=d&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>6*s;d=null;if(m)return;
  e.stopPropagation();open()});
hit.addEventListener('click',e=>e.stopPropagation());
function place(){const V=window.VIEW;if(!V)return;const S=V.s;
  Object.assign(hit.style,{left:Math.round(V.ox+BOX.x*S)+'px',top:Math.round(V.oy+BOX.y*S)+'px',width:Math.round(BOX.w*S)+'px',height:Math.round(BOX.h*S)+'px'})}
addEventListener('alivelog:layout',place);place();
let lv='';(function loop(){const V=window.VIEW;const k=V?V.s+','+V.ox+','+V.oy:'';if(k!==lv){lv=k;place()}requestAnimationFrame(loop)})();
window.SHELF={open,close,books:BOOKS};
})();
