// ---- 書桌電腦：華爾街風投資面板（資料來自 portfolio.json）----
(function(){
const F={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001001001','8':'111101111101111','9':'111101111001111',
A:'010101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'111101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
'.':'000000000000010','%':'101001010100101','+':'000010111010000','-':'000000111000000','/':'001001010100100',':':'000010000010000',' ':'000000000000000','$':'011110010011110','>':'100010001010100'};
const C={bg:'#05070a',amber:'#f0b25a',green:'#5fd38a',red:'#e0605a',dim:'#3c3c44',grid:'#12201c',white:'#e0cbb8',blue:'#6a8cc0'};
const cv=document.getElementById('mon'),g=cv.getContext('2d');
let P={example:true,holdings:[]},rows=[],tape=0,src='示範價';
function T(t,x,y,c){g.fillStyle=c;[...String(t).toUpperCase()].forEach((k,i)=>{const b=F[k]||F[' '];for(let j=0;j<15;j++)if(b[j]=='1')g.fillRect(x+i*4+j%3,y+(j/3|0),1,1)});return x+t.length*4}
const tw=t=>String(t).length*4;
// 中文：用系統字畫，再把半透明像素二值化，保持硬邊
const off=document.createElement('canvas'),og=off.getContext('2d');
function CJK(t,x,y,c,px=8){off.width=t.length*px+4;off.height=px+4;og.font='bold '+px+'px sans-serif';og.textBaseline='top';og.fillStyle='#fff';og.fillText(t,0,1);
  const d=og.getImageData(0,0,off.width,off.height).data;g.fillStyle=c;for(let yy=0;yy<off.height;yy++)for(let xx=0;xx<off.width;xx++)if(d[(yy*off.width+xx)*4+3]>110)g.fillRect(x+xx,y+yy,1,1)}
const fmt=(n,d=2)=>n>=1000?Math.round(n).toString():n.toFixed(d);
function seed(s){let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))|0;return()=>{h=(h*1103515245+12345)|0;return((h>>>16)&0x7fff)/0x7fff}}
function calc(){rows=P.holdings.map(h=>{const price=(typeof h.price==='number')?h.price:(h._live??h.avgCost);
  const kind=(typeof h.price==='number')?'手動':(h._live!=null?'收盤':'示範價');
  return{...h,price,kind,pl:(price/h.avgCost-1)*100,val:price*h.shares}});
  src=rows.some(r=>r.kind==='示範價')?'示範價':rows.some(r=>r.kind==='手動')?'手動價':'TWSE收盤'}
function small(){cv.width=38;cv.height=24;g.fillStyle=C.bg;g.fillRect(0,0,38,24);
  // 走勢線（示意）
  g.fillStyle=C.grid;for(let x=0;x<38;x+=6)g.fillRect(x,6,1,12);
  const r=seed('mini');let y=12;for(let x=0;x<38;x++){y=Math.max(7,Math.min(17,y+(r()<.5?-1:1)));g.fillStyle=C.green;g.fillRect(x,y,1,1)}
  // 跑馬燈
  g.fillStyle='#120f1a';g.fillRect(0,0,38,6);const s=rows.map(r=>r.symbol+' '+(r.pl>=0?'+':'')+r.pl.toFixed(1)+'%').join('  ')+'  ';
  g.save();g.beginPath();g.rect(0,0,38,6);g.clip();const w=tw(s),o=-(tape%w);T(s,o,0,C.amber);T(s,o+w,0,C.amber);g.restore();
  g.fillStyle='#120f1a';g.fillRect(0,19,38,5);if(P.example)T('EXAMPLE',1,19,C.dim)}
function bigDraw(){cv.width=256;cv.height=144;g.fillStyle=C.bg;g.fillRect(0,0,256,144);
  g.fillStyle='#1a1408';g.fillRect(0,0,256,9);T('ALIVELOG TERMINAL',3,2,C.amber);T('PORTFOLIO',220-tw('PORTFOLIO')+34,2,C.amber);
  if(P.example){g.fillStyle=C.red;g.fillRect(112,0,30,9);T('DEMO',114,2,'#05070a')}
  // 跑馬燈
  g.fillStyle='#0b0d10';g.fillRect(0,10,256,8);const s=rows.map(r=>r.symbol+' '+fmt(r.price)+' '+(r.pl>=0?'+':'')+r.pl.toFixed(2)+'%').join('   ')+'   ';
  g.save();g.beginPath();g.rect(0,10,256,8);g.clip();const w=tw(s),o=-(tape%w);[o,o+w,o+2*w].forEach(xx=>{let x=xx;rows.forEach(r=>{const t=r.symbol+' '+fmt(r.price)+' '+(r.pl>=0?'+':'')+r.pl.toFixed(2)+'%   ';T(t,x,12,r.pl>0?C.green:r.pl<0?C.red:C.amber);x+=tw(t)})});g.restore();
  // K 線（示意走勢，非真實歷史）
  const cx=4,cy=22,cw=120,ch=58;g.fillStyle=C.grid;for(let x=cx;x<=cx+cw;x+=20)g.fillRect(x,cy,1,ch);for(let y=cy;y<=cy+ch;y+=14.5)g.fillRect(cx,y|0,cw,1);
  const r0=rows[0]||{symbol:'---'};const rnd=seed(r0.symbol);let v=ch/2;
  for(let i=0;i<20;i++){const o2=v,c2=Math.max(6,Math.min(ch-6,v+(rnd()-.48)*10)),hi=Math.min(o2,c2)-rnd()*4,lo=Math.max(o2,c2)+rnd()*4,up=c2<o2;
    g.fillStyle=up?C.green:C.red;const x=cx+3+i*6;g.fillRect(x+1,cy+hi|0,1,(lo-hi)|0||1);g.fillRect(x,cy+Math.min(o2,c2)|0,3,Math.max(1,Math.abs(c2-o2)|0));v=c2}
  T(r0.symbol,cx+2,cy+2,C.amber);T('SAMPLE',cx+cw-26,cy+ch-7,C.dim);
  // 總覽
  const tot=rows.reduce((a,r)=>a+r.val,0),cost=rows.reduce((a,r)=>a+r.avgCost*r.shares,0),pl=cost?(tot/cost-1)*100:0;
  T('TOTAL VALUE',132,24,C.dim);T(fmt(tot,0)+' '+(P.currency||''),132,31,C.white);
  T('TOTAL P/L',132,41,C.dim);T((pl>=0?'+':'')+fmt(tot-cost,0)+' '+(pl>=0?'+':'')+pl.toFixed(2)+'%',132,48,pl>0?C.green:pl<0?C.red:C.amber);
  T('PRICE SRC',132,58,C.dim);CJK(src+(P.example?'・範例':''),132,63,src==='示範價'?C.red:C.amber,12);
  // 持股表
  const y0=86;g.fillStyle='#1a1408';g.fillRect(0,y0,256,8);
  [['SYM',3],['SHARES',40],['COST',84],['PRICE',128],['P/L%',176],['SRC',214]].forEach(([t,x])=>T(t,x,y0+2,C.amber));
  rows.slice(0,6).forEach((r,i)=>{const y=y0+11+i*9;if(i%2){g.fillStyle='#0b0d10';g.fillRect(0,y-2,256,9)}
    const c=r.pl>0?C.green:r.pl<0?C.red:C.white;T(r.symbol,3,y,C.white);T(String(r.shares),40,y,C.white);T(fmt(r.avgCost),84,y,C.white);T(fmt(r.price),128,y,c);T((r.pl>=0?'+':'')+r.pl.toFixed(2),176,y,c);T({'示範價':'DEMO','手動':'MANUAL','收盤':'TWSE'}[r.kind],214,y,r.kind==='示範價'?C.red:C.dim)})}
function draw(){if(document.getElementById('mon').classList.contains('big'))bigDraw();else small()}
window.drawMon=draw;
// 嘗試抓證交所收盤價（官方 OpenAPI 目前沒開 CORS，瀏覽器多半會失敗，失敗就維持示範價）
async function live(){try{const ctl=new AbortController();setTimeout(()=>ctl.abort(),4000);
  const d=await (await fetch('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL',{signal:ctl.signal})).json();
  P.holdings.forEach(h=>{const m=d.find(x=>x.Code===h.symbol);if(m&&+m.ClosingPrice)h._live=+m.ClosingPrice});calc();draw()}catch(e){window.MONLOG='price fetch failed: '+e}}
fetch('portfolio.json',{cache:'no-store'}).then(r=>r.json()).then(j=>{P=j;calc();draw()})   // 證交所 OpenAPI 沒開 CORS，瀏覽器抓不到，所以不去抓.catch(e=>{window.MONLOG='portfolio.json failed: '+e;calc();draw()});
calc();draw();setInterval(()=>{tape+=1;draw()},120);
})();
