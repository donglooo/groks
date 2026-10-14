// morning.js：每天一張早安圖，在房間裡「撿起來」。
// 圖檔：morning/YYYY-MM-DD.jpg（台北日期；找不到 .jpg 就試 .png）。今天的檔案存在、而且 localStorage 'morning.opened' 不是今天 → 顯示「新」提示。
// 點房間裡的物件 → 乾淨的遮罩＋真正的 <img>（手機長按可儲存）；點圖以外的地方關閉。沒有額外按鈕。
(()=>{const OPT={"glint": [356, 290], "idle": {"x": 354, "y": 290, "w": 11, "h": 13, "img": "mc/idle.png"}, "new": {"x": 354, "y": 290, "w": 11, "h": 13, "img": "mc/new.png"}};
const $=id=>document.getElementById(id);
const tpeDate=()=>window.MORNING_DATE||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const css=document.createElement('style');css.textContent=`
.mc-spr{position:absolute;image-rendering:pixelated;background-size:100% 100%;background-repeat:no-repeat;z-index:4;cursor:pointer}
.mc-glint{position:absolute;z-index:4;pointer-events:none;background:#fff8e8;opacity:0;animation:mcg 4s steps(1) infinite}
@keyframes mcg{0%{opacity:0}80%{opacity:.85}90%{opacity:0}100%{opacity:0}}
#mc-ov{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;flex-direction:column;background:rgba(10,8,16,.82);touch-action:auto}
#mc-ov.on{display:flex}
#mc-img{max-width:88vw;max-height:calc(100vh - 56px);border:3px solid #efe6d6;background:#efe6d6;-webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto;pointer-events:auto;touch-action:auto}
#mc-cap{margin-top:10px;color:#cfc6b8;font:13px/1.4 system-ui,sans-serif;letter-spacing:.08em;pointer-events:none}`;
document.head.appendChild(css);
const ov=document.createElement('div');ov.id='mc-ov';ov.innerHTML='<img id="mc-img" alt="早安圖"><div id="mc-cap"></div>';document.body.appendChild(ov);
const img=$('mc-img');
ov.addEventListener('click',e=>{if(e.target!==img)ov.classList.remove('on')});
ov.addEventListener('pointerdown',e=>e.stopPropagation());
const spr=document.createElement('div');spr.className='mc-spr';document.body.appendChild(spr);
const gl=document.createElement('div');gl.className='mc-glint';document.body.appendChild(gl);
let url=null,today=tpeDate();
function isNew(){return url&&localStorage.getItem('morning.opened')!==today}
function render(){const V=window.VIEW;if(!V)return;const s=V.s,st=isNew()?OPT.new:(url?OPT.idle:null);
  if(!st){spr.style.display=gl.style.display='none';return}
  Object.assign(spr.style,{display:'block',left:V.ox+st.x*s+'px',top:V.oy+st.y*s+'px',width:st.w*s+'px',height:st.h*s+'px',backgroundImage:`url(${st.img})`,filter:($('fg')&&$('fg').style.filter)||'none'});
  if(isNew()&&OPT.glint){Object.assign(gl.style,{display:'block',left:V.ox+OPT.glint[0]*s+'px',top:V.oy+OPT.glint[1]*s+'px',width:s+'px',height:s+'px'})}else gl.style.display='none'}
function probe(ext,next){const t=new Image();t.onload=()=>{url=t.src;render()};t.onerror=next;t.src=`morning/${today}.${ext}`}
function check(){today=tpeDate();url=null;probe('jpg',()=>probe('png',()=>{url=null;render()}))}
spr.addEventListener('click',e=>{e.stopPropagation();if(!url)return;img.src=url;$('mc-cap').textContent='早安';ov.classList.add('on');localStorage.setItem('morning.opened',today);render()});
spr.addEventListener('pointerdown',e=>e.stopPropagation());
addEventListener('resize',()=>setTimeout(render,50));setInterval(render,1000);setInterval(check,10*60e3);
window.MORNING={check,render,open:()=>spr.click()};check();
})();
