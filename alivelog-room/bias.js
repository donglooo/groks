// ---- 電視背光（柔和光暈，無棋盤點）：A=固定暖白、B=依頻道顏色緩慢變化 ----
// 切換：?bias=A|B|off 或 localStorage 'alivelog.bias'；預設 A
(function(){
const q=new URLSearchParams(location.search).get('bias');
let mode=(q||localStorage.getItem('alivelog.bias')||'A').toUpperCase();if(q)localStorage.setItem('alivelog.bias',mode);
const el=document.createElement('div');el.id='bias';el.style.cssText='position:absolute;pointer-events:none;border-radius:6px;opacity:0;transition:opacity .9s ease,box-shadow 1.6s ease';
document.getElementById('fg').after(el);
const TV={x:100,y:194,w:110,h:64};
const CHC=['95,211,138','224,96,90','106,140,192','240,178,90'],A='232,200,150';
function on(){const o=document.getElementById('poweroff');return mode!=='OFF'&&!(o&&o.dataset.off==='1')}
function upd(){const V=window.VIEW;if(!V)return;const s=V.s,c=mode==='B'?CHC[(typeof ch!=='undefined'?ch:0)%4]:A,r=Math.round(9*s);
  Object.assign(el.style,{left:Math.round(V.ox+(TV.x+3)*s)+'px',top:Math.round(V.oy+(TV.y+3)*s)+'px',width:Math.round((TV.w-6)*s)+'px',height:Math.round((TV.h-6)*s)+'px',
    boxShadow:`0 0 ${r*2}px ${Math.round(r*.6)}px rgba(${c},.38), 0 0 ${r*4}px ${r}px rgba(${c},.14)`,background:`rgba(${c},.2)`});
  el.style.opacity=on()?(mode==='B'?(.85+.1*Math.sin(Date.now()/4000)):.9):0;el.dataset.state=on()?mode+(mode==='B'?(typeof ch!=='undefined'?ch:0):''):'off'}
addEventListener('alivelog:layout',upd);setInterval(upd,400);upd();
window.BIAS={get mode(){return mode},set(m){mode=String(m).toUpperCase();localStorage.setItem('alivelog.bias',mode);upd()}};
})();
