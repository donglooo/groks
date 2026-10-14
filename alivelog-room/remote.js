// ---- 像素遙控器：三種造型（?remote=A|B|C 或 localStorage 'alivelog.remote'，預設 A）----
// 長按電源 0.8 秒＝YouTube 登入（隱藏功能）
(function(){
const q=new URLSearchParams(location.search).get('remote');
let style=(q||localStorage.getItem('alivelog.remote')||'A').toUpperCase();if(q)localStorage.setItem('alivelog.remote',style);
const rc=document.getElementById('rc');
rc.style.cssText='position:absolute;z-index:9;display:none;pointer-events:none;background:none;border:0;box-shadow:none;padding:0;transform:none;image-rendering:pixelated';
const cv=document.createElement('canvas');cv.style.cssText='display:block;pointer-events:auto;image-rendering:pixelated;touch-action:none;filter:drop-shadow(0 6px 0 rgba(5,7,10,.55))';rc.appendChild(cv);
const g=cv.getContext('2d');
// 5x5 像素圖示
const IC={pw:'01010,10101,10101,10001,01110',up:'00100,01110,11111,00000,00000',dn:'00000,00000,11111,01110,00100',
 lf:'00010,00110,01110,00110,00010',rt:'01000,01100,01110,01100,01000',ok:'00000,01110,01110,01110,00000',
 vu:'00100,00100,11111,00100,00100',vd:'00000,00000,11111,00000,00000',mu:'10001,01010,00100,01010,10001',
 prv:'10001,10011,10111,10011,10001',nxt:'10001,11001,11101,11001,10001',spk:'00010,01110,11110,01110,00010',ch:'01110,10000,10000,10000,01110'};
function icon(n,x,y,c,s=1){const r=IC[n].split(',');g.fillStyle=c;for(let j=0;j<5;j++)for(let i=0;i<5;i++)if(r[j][i]==='1')g.fillRect(x+i*s,y+j*s,s,s)}
const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const joe=()=>typeof ch!=='undefined'&&ch===3;
let btns=[],pressed=null,W=0,H=0,SC=3;
function btn(k,x,y,w,h){btns.push({k,x,y,w,h})}
function disc(cx,cy,r,c){for(let y=-r;y<=r;y++){const w=Math.round(Math.sqrt(r*r-y*y));R(cx-w,cy+y,w*2+1,1,c)}}
const P={ink:'#0c0b10',body:'#1c1b22',body2:'#26252e',edge:'#3a3944',hi:'#55545f',txt:'#c8c4cc',dim:'#7a7884',red:'#c03a2c',amb:'#f0b25a',cream:'#e0cbb8',beige:'#cdbf9f',beige2:'#a89878',brown:'#5e4a3a'};
const off=(k)=>pressed===k?1:0;
function drawA(){W=34;H=112;cv.width=W;cv.height=H;btns=[];
  // 細長黑色機身（圓角、側邊高光）
  R(3,0,28,H,P.ink);R(1,2,32,H-4,P.ink);R(2,1,30,H-2,P.body);R(3,2,1,H-6,P.hi);R(30,3,1,H-8,P.ink);R(4,H-4,26,1,P.body2);
  // 電源
  disc(17,9,4,off('pw')?'#8a2a20':P.red);R(15,6,4,1,'#e06a5a');btn('pw',10,3,14,13);
  // 圓形方向鍵
  const cx=17,cy=36;disc(cx,cy,13,P.edge);disc(cx,cy,12,P.body2);disc(cx,cy,5,off('ok')?P.edge:P.hi);disc(cx,cy,4,off('ok')?P.body2:P.edge);
  icon('up',cx-2,cy-11+off('up'),P.txt);icon('dn',cx-2,cy+7+off('dn'),P.txt);
  icon(joe()?'prv':'lf',cx-11,cy-2+off('lf'),joe()?P.amb:P.txt);icon(joe()?'nxt':'rt',cx+7,cy-2+off('rt'),joe()?P.amb:P.txt);
  btn('chu',cx-6,cy-13,12,8);btn('chd',cx-6,cy+5,12,8);btn('lf',cx-13,cy-6,8,12);btn('rt',cx+5,cy-6,8,12);btn('ok',cx-5,cy-5,10,10);
  // 音量搖桿＋靜音
  R(6,56,10,26,P.edge);R(7,57,8,24,P.body2);R(7,68,8,1,P.ink);icon('vu',9,59+off('vu'),P.txt);icon('vd',9,72+off('vd'),P.txt);btn('vu',5,55,12,13);btn('vd',5,69,12,13);
  R(19,56,10,26,P.edge);R(20,57,8,24,P.body2);R(20,68,8,1,P.ink);icon('up',22,59+off('chu2'),P.dim);icon('dn',22,72+off('chd2'),P.dim);btn('chu2',18,55,12,13);btn('chd2',18,69,12,13);
  R(11,88,12,9,P.edge);R(12,89,10,7,off('mu')?P.edge:P.body2);icon('mu',14,90+off('mu'),P.txt);btn('mu',10,87,14,11);
  R(13,104,8,1,P.edge)}
function drawB(){const j=joe();const keys=['pw','chd','chu','ok','vd','vu','mu'].concat(j?['prv','nxt']:[]);W=8+keys.length*11;H=17;cv.width=W;cv.height=H;btns=[];
  R(2,0,W-4,H,P.ink);R(0,2,W,H-4,P.ink);R(1,1,W-2,H-2,P.body);R(2,1,W-4,1,P.edge);
  const map={pw:'pw',chd:'dn',chu:'up',ok:'ok',vd:'vd',vu:'vu',mu:'mu',prv:'prv',nxt:'nxt'};
  keys.forEach((k,i)=>{const x=5+i*11;if(pressed===k)R(x-2,3,9,11,P.body2);icon(map[k],x,6+off(k),k==='pw'?P.red:(k==='prv'||k==='nxt')?P.amb:k==='ok'?P.cream:P.txt);btn(k,x-3,0,11,H);
    if(k==='chu'||k==='vu')R(x+7,5,1,7,P.edge)})}
function drawC(){W=46;H=70;cv.width=W;cv.height=H;btns=[];
  R(1,0,W-2,H,P.brown);R(0,1,W,H-2,P.brown);R(2,2,W-4,H-4,P.beige);R(2,2,W-4,2,'#e6dcc2');R(2,H-5,W-4,3,P.beige2);
  R(6,6,34,6,'#2a2630');for(let i=0;i<5;i++)R(8+i*7,8,4,2,i===0?P.red:'#4a4650');   // 頻道指示燈條
  const big=(k,x,y,c,ic,icc)=>{const o=off(k);R(x,y+3,12,10,'#3a3028');R(x,y+o,12,10,c);R(x,y+o,12,2,'rgba(255,255,255,.25)');icon(ic,x+4,y+3+o,icc);btn(k,x-1,y-1,14,14)};
  const j=joe();
  big('pw',5,16,P.red,'pw','#fff');big('chu',17,16,'#5a5664','up',P.cream);big('vu',29,16,'#5a5664','vu',P.cream);
  big('mu',5,30,'#5a5664','mu',P.cream);big('ok',17,30,P.amb,'ok','#120f1a');big('vd',29,30,'#5a5664','vd',P.cream);
  big(j?'prv':'lfx',5,44,j?'#7a5a2a':'#6a6470',j?'prv':'lf',j?P.amb:'#8a8494');big('chd',17,44,'#5a5664','dn',P.cream);big(j?'nxt':'rtx',29,44,j?'#7a5a2a':'#6a6470',j?'nxt':'rt',j?P.amb:'#8a8494');
  R(14,60,18,2,P.beige2)}
function draw(){({A:drawA,B:drawB,C:drawC}[style]||drawA)();place()}
function place(){const fine=matchMedia('(pointer:fine)').matches;SC=Math.max(fine?3:2,Math.floor(Math.min(innerWidth*(fine?.4:.3)/W,innerHeight*(fine?.7:.55)/H)));SC=Math.min(SC,fine?6:4);
  cv.style.width=W*SC+'px';cv.style.height=H*SC+'px';const sb='env(safe-area-inset-bottom)';
  if(style==='A'){rc.style.transform='none';rc.style.left='auto';rc.style.right='calc(14px + env(safe-area-inset-right))';rc.style.bottom=`calc(14px + ${sb})`;rc.style.top='auto'}
  else{rc.style.left=Math.round((innerWidth-W*SC)/2)+'px';rc.style.right='auto';rc.style.bottom=`calc(18px + ${sb})`;rc.style.top='auto'}}
// 鍵位對應
function act(k){const j=joe();const m={chu2:'chu',chd2:'chd',lf:j?'prv':'vd',rt:j?'nxt':'vu'};k=m[k]||k;if(k==='lfx'||k==='rtx')return;window.rcKey&&rcKey(k)}
let lp=null,lpFired=false;
function close(){rc.style.display='none'}
// 任何不在遙控器機身上的點擊都關閉（含右側邊距、安全區；用 touchstart 再保險一次給 iOS）
function outside(e){if(rc.style.display!=='grid')return;const t=e.target;if(t===cv||t===document.getElementById('remote'))return;close()}
document.addEventListener('pointerdown',outside,true);document.addEventListener('touchstart',outside,{capture:true,passive:true});
cv.addEventListener('pointerdown',e=>{e.stopPropagation();const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/SC,y=(e.clientY-r.top)/SC;
  const b=btns.find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
  if(!b){const d=g.getImageData(Math.floor(x),Math.floor(y),1,1).data;if(d[3]===0)close();return}   // 點到遙控器外的透明處＝關閉pressed=b.k;draw();setTimeout(()=>{pressed=null;draw()},130);
  if(b.k==='pw'){lpFired=false;lp=setTimeout(()=>{lpFired=true;window.rcKey&&rcKey('login')},800);return}act(b.k)});
cv.addEventListener('pointerup',e=>{if(lp){clearTimeout(lp);lp=null;if(!lpFired)act('pw')}});
cv.addEventListener('pointerleave',()=>{if(lp){clearTimeout(lp);lp=null}});
let lastJ=null;setInterval(()=>{if(joe()!==lastJ){lastJ=joe();draw()}},400);
addEventListener('resize',place);draw();
window.RCUI={get style(){return style},set(s){style=String(s).toUpperCase();localStorage.setItem('alivelog.remote',style);draw()},btns:()=>btns,scale:()=>SC,canvas:cv};
})();
