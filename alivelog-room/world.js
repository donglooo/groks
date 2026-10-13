// ---- 天氣／時段／小動畫／自動餵食器 ----
(function(){
const $=id=>document.getElementById(id);
// 1) 地點規則：平日 08:00–18:00 中山區，其餘（平日晚上、週末）大同區
const LOC={中山區:[25.0685,121.5266],大同區:[25.0633,121.5130]};
function tpe(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Taipei',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
  const o={};p.forEach(x=>o[x.type]=x.value);return{wd:o.weekday,h:+o.hour%24,m:+o.minute}}
function where(){const t=tpe(),we=t.wd==='Sat'||t.wd==='Sun';return(!we&&t.h>=8&&t.h<18)?'中山區':'大同區'}
const W={loc:where(),code:null,isDay:null,phase:'dusk',kind:'clear',src:'未取得',rise:null,set:null};window.WEATHER=W;
// WMO 代碼 → 晴/雲/雨
const kind=c=>c==null?'clear':c>=51?'rain':c>=2?'cloudy':'clear';
function phase(){const now=Date.now();if(W.rise&&W.set){if(Math.abs(now-W.set)<45*60e3||Math.abs(now-W.rise)<30*60e3)return'dusk';return(now>W.rise&&now<W.set)?'day':'night'}
  const h=tpe().h;return h>=6&&h<17?'day':h>=17&&h<19?'dusk':'night'}
async function fetchWx(){W.loc=where();const[la,lo]=LOC[W.loc];
  try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=weather_code,is_day,precipitation,cloud_cover&daily=sunrise,sunset&timezone=Asia%2FTaipei&forecast_days=1`);
    const j=await r.json();W.code=j.current.weather_code;W.isDay=j.current.is_day;W.cloud=j.current.cloud_cover;W.precip=j.current.precipitation;
    W.rise=Date.parse(j.daily.sunrise[0]+':00+08:00');W.set=Date.parse(j.daily.sunset[0]+':00+08:00');W.kind=W.precip>0?'rain':kind(W.code);W.src='Open-Meteo '+j.current.time}
  catch(e){W.src='取得失敗：'+e}apply()}
// 只有黃昏底圖：白天/夜晚用濾鏡＋色層近似
const LOOK={day:{sky:'none',fg:'brightness(1.08)',tint:'rgba(0,0,0,0)'},
  dusk:{sky:'none',fg:'none',tint:'rgba(0,0,0,0)'},
  night:{sky:'hue-rotate(200deg) saturate(.55) brightness(.56)',fg:'brightness(.78) saturate(.85)',tint:'rgba(10,14,40,.18)'}};
function apply(){W.phase=window.FORCE_PHASE||phase();const k=window.FORCE_KIND||W.kind,L=LOOK[W.phase];
  let sky=L.sky;if(k!=='clear')sky=(sky==='none'?'':sky+' ')+'saturate(.45) brightness('+(k==='rain'?.7:.85)+')';
  $('sky').style.backgroundImage=W.phase==='day'?'url(sky_day.png)':'';$('sky').style.filter=sky||'none';$('fg').style.filter=L.fg;$('tint').style.background=L.tint;W.shown=W.phase+'/'+k}
// 雲與雨（畫在天空層，在建築與房間後面）
const wx=$('wx').getContext('2d');let drops=[],clouds=[];
for(let i=0;i<5;i++)clouds.push({x:Math.random()*600,y:6+Math.random()*194|0,w:30+Math.random()*40|0,v:1+Math.random()*2});
for(let i=0;i<90;i++)drops.push({x:Math.random()*600,y:Math.random()*350,v:120+Math.random()*80});
function wxDraw(dt){wx.clearRect(0,0,600,420);const k=window.FORCE_KIND||W.kind;if(k==='clear')return;
  const night=W.phase==='night';wx.fillStyle=night?'#2a2a3c':k==='rain'?'#5c5660':'#8a8494';
  clouds.forEach(c=>{c.x+=c.v*dt;if(c.x>620)c.x=-c.w;const x=c.x|0;wx.fillRect(x,c.y+3,c.w,5);wx.fillRect(x+6,c.y,c.w-14,4);wx.fillRect(x+c.w/3|0,c.y-2,c.w/3|0,3)});
  if(k==='rain'){wx.fillStyle='#9aa4b8';drops.forEach(d=>{d.y+=d.v*dt;d.x-=d.v*dt*.15;if(d.y>350){d.y=-4;d.x=Math.random()*620}wx.fillRect(d.x|0,d.y|0,1,3)})}}
// 2) 小動畫（低 FPS，像素對齊）
const a=$('amb').getContext('2d'),R=(x,y,w,h,c)=>{a.fillStyle=c;a.fillRect(x,y,w,h)};
const P={cat:'#4e566a',hi:'#5c6478',ink:'#120f1a',amber:'#f0b25a',yel:'#f8d070',leaf:'#5a8a4a',green:'#3e6a42',white:'#e0cbb8',steam:'rgba(224,203,184,.55)',metal:'#3c3c44',cream:'#4a4650'};
let blinkAt=performance.now()+3000,tailAt=0,earAt=0,feeding=0,t0=performance.now();
const sleeping=()=>{try{const L=JSON.parse(localStorage.getItem('alivelog.cat.log'))||[];return(L.slice(-1)[0]||{}).behavior==='睡'}catch(e){return false}};
function feeder(now){// 非智慧型自動餵食器：放在冷氣機右邊的女兒牆上
  R(438,184,13,16,'#c8c0b4');R(438,184,13,1,P.white);R(450,184,1,16,'#8a8494');R(437,182,15,3,'#8a8494');R(437,182,15,1,'#b0a8a0');
  R(440,187,9,6,'#2a2630');for(let i=0;i<4;i++)R(441+i*2,190+(i%2),2,2,'#a0603a');   // 透明儲糧窗
  R(441,195,7,1,P.metal);R(443,196,3,2,P.ink);R(446,194,1,1,(now/1000|0)%2?'#5fd38a':'#2e4a3a');  // 出糧口＋指示燈
  R(436,199,17,1,'#8a8494');R(437,198,15,1,'#6a6470');                                          // 碗
  if(feeding>now){for(let i=0;i<3;i++){const y=197+((now/90+i*3)|0)%3;R(442+i*2,y,1,1,'#a0603a')}}else R(441,197,6,1,'#a0603a')}
// 月亮時鐘：黑白月亮錶面，明暗線隨一天時間掃過（00:00 新月 → 12:00 滿月 → 24:00 新月），上面是真實時針分針
const SYN=29.530589;
function dayAge(){const t=tpe();return((t.h*60+t.m)/1440)*SYN}
window.MOONCLOCK=()=>{const t=tpe();return{h:t.h,m:t.m,age:+dayAge().toFixed(2)}};
function moonDraw(g,cx,cy,r,age){const k=Math.cos(2*Math.PI*age/SYN),wax=age<SYN/2;
  for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=(x*x+y*y)/(r*r);if(d>1)continue;const ny=y/r,nx=x/r,edge=Math.sqrt(1-ny*ny);
    const lit=(wax?nx:-nx)>k*edge;g.fillStyle=lit?(d>.75?'#c8c8c8':'#f0f0f0'):(d>.8?'#000000':'#1a1a1a');g.fillRect(cx+x,cy+y,1,1)}}
function hands(g,cx,cy,r){const t=tpe(),line=(ang,len,c,w)=>{for(let i=1;i<=len;i++){const x=cx+Math.round(Math.sin(ang)*i),y=cy-Math.round(Math.cos(ang)*i);g.fillStyle=c;g.fillRect(x,y,w,w)}};
  const hc='#c03a2c';line((t.h%12+t.m/60)/12*2*Math.PI,Math.round(r*.5),hc,r>8?2:1);line(t.m/60*2*Math.PI,Math.round(r*.8),'#f0b25a',r>8?2:1);g.fillStyle=hc;g.fillRect(cx,cy,1,1)}
function clock(){const cx=35,cy=169;R(cx-7,cy-7,15,15,P.ink);R(cx-6,cy-6,13,13,'#000');R(cx-6,cy-6,13,1,'#3c3c44');moonDraw(a,cx,cy,5,dayAge());hands(a,cx,cy,5)}
// 月相放大（點它放大、點旁邊縮回）
const mh=document.createElement('div');mh.id='moonhit';mh.style.cssText='position:absolute;z-index:4;cursor:pointer;touch-action:none';
const mb=document.createElement('canvas');mb.id='moonbig';mb.width=80;mb.height=80;mb.style.cssText='position:absolute;z-index:7;display:none;image-rendering:pixelated;box-shadow:0 0 0 100vmax rgba(10,8,16,.8)';
document.body.append(mh,mb);
const MOFF=document.createElement('canvas'),mog=MOFF.getContext('2d');
function cjk(g,t,x,y,c,px){MOFF.width=t.length*px+4;MOFF.height=px+4;mog.font=px+'px sans-serif';mog.textBaseline='top';mog.fillStyle='#fff';mog.fillText(t,0,1);
  const d=mog.getImageData(0,0,MOFF.width,MOFF.height).data;g.fillStyle=c;for(let yy=0;yy<MOFF.height;yy++)for(let xx=0;xx<MOFF.width;xx++)if(d[(yy*MOFF.width+xx)*4+3]>110)g.fillRect(x+xx,y+yy,1,1)}
function moonBig(){const g=mb.getContext('2d');g.fillStyle='#120f1a';g.fillRect(0,0,80,80);g.fillStyle='#000';g.fillRect(8,8,64,64);g.fillStyle='#3c3c44';g.fillRect(8,8,64,1);g.fillRect(8,71,64,1);
  moonDraw(g,40,40,28,dayAge());for(let i=0;i<12;i++){const an=i/12*2*Math.PI;g.fillStyle='#8a8494';g.fillRect(40+Math.round(Math.sin(an)*30),40-Math.round(Math.cos(an)*30),1,1)}hands(g,40,40,26)}
function moonPlace(){const V=window.VIEW||{s:1,ox:0,oy:0},s=V.s;Object.assign(mh.style,{left:Math.round(V.ox+28*s)+'px',top:Math.round(V.oy+162*s)+'px',width:Math.round(15*s)+'px',height:Math.round(15*s)+'px'});
  const k=Math.max(1,Math.floor(Math.min(innerWidth*.9/80,innerHeight*.9/80)));Object.assign(mb.style,{width:80*k+'px',height:80*k+'px',left:((innerWidth-80*k)/2|0)+'px',top:((innerHeight-80*k)/2|0)+'px'})}
addEventListener('alivelog:layout',moonPlace);moonPlace();
mh.addEventListener('pointerup',()=>{moonBig();mb.style.display='block';window.MOONOPEN=true});
document.addEventListener('pointerdown',e=>{if(mb.style.display==='block'&&e.target!==mb){mb.style.display='none';window.MOONOPEN=false;e.stopPropagation()}},true);
setInterval(()=>{if(mb.style.display==='block')moonBig()},10000);
function amb(now){a.clearRect(0,0,600,420);const sl=sleeping(),T=(now-t0)/1000;
  // 貓的動畫改由 cat.js 的 Neko sprite 播放
  // （電視櫃小盆栽已移除，搖擺動畫一併拿掉）
  // 檯燈極輕微閃爍
  // 馬克杯＋蒸氣
  R(321,317,5,5,'#c8c0b4');R(321,317,5,1,P.white);R(326,318,1,2,'#c8c0b4');R(322,318,3,1,'#5a3a2a');   // W_v3：書桌右移 40
  for(let i=0;i<3;i++){const ph=(T*0.9+i/3)%1,y=311-ph*12|0,x=323+Math.round(Math.sin(ph*6+i)*1.2);a.fillStyle=`rgba(224,203,184,${(.5*(1-ph)).toFixed(2)})`;a.fillRect(x,y,1,2)}
  clock();a.save();a.translate(120,150);feeder(now);a.restore()}   // live23：餵食器在陽台側 → x+120、y+150
// 窗簾微微擺動（1px，步進）
setInterval(()=>{const k=Math.random()<.5?0:1;['dl','dr','sheer'].forEach(id=>$(id).style.transform=k?'translateX(1px)':'none')},2200);
// 餵食時間（可在 localStorage 'alivelog.feeder.times' 改，例如 ["08:00","19:00"]）
function feedTimes(){try{return JSON.parse(localStorage.getItem('alivelog.feeder.times'))||['08:00','19:00']}catch(e){return['08:00','19:00']}}
setInterval(()=>{const t=tpe(),hm=String(t.h).padStart(2,'0')+':'+String(t.m).padStart(2,'0');if(feedTimes().includes(hm)&&feeding<performance.now()-60000)feeding=performance.now()+4000},20000);
window.feedNow=()=>feeding=performance.now()+4000;
let last=performance.now(),acc=0;
function loop(now){const dt=Math.min(.2,(now-last)/1000);last=now;acc+=dt;if(acc>=1/8&&!document.hidden){wxDraw(acc);amb(now);acc=0}requestAnimationFrame(loop)}
requestAnimationFrame(loop);fetchWx();setInterval(fetchWx,15*60e3);setInterval(apply,60e3);window.applyWeather=apply;
})();
