/* Secondary-school diagrams: flat shapes, visible movement, syllabus-level labels. */
(() => {
'use strict';
const C={blood:'#d72d5d',water:'#4e9bc3',food:'#c7d52a',lymph:'#e6d955',tissue:'#f4c5ae',ink:'#202020'};
const clamp=x=>Math.max(0,Math.min(1,x));
const dot=(x,y,r=6,color=C.food)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
const line=(d,color=C.blood,w=15)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const label=(x,y,en,zh='',size=18)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${C.ink}" font-size="${size}" style="font-family:Georgia,'Times New Roman','Microsoft JhengHei',serif;font-weight:400">${en}${zh?`<tspan x="${x}" dy="23" font-size="${size*.85}">${zh}</tspan>`:''}</text>`;
const organ=(d,color=C.tissue)=>`<path d="${d}" fill="${color}" stroke="${C.ink}" stroke-width="3"/>`;
function moving(points,t,color,count=9){let out='';for(let i=0;i<count;i++){const p=((t+i/count)%1)*(points.length-1),j=Math.min(points.length-2,Math.floor(p)),f=p-j,a=points[j],b=points[j+1];out+=dot(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,5,color)}return out}
function granules(t,x=405,y=225,color=C.food){let s='';for(let i=0;i<18;i++){const f=clamp(t*1.3-i/22);if(f)s+=dot(x+(i%6)*17,y+Math.floor(i/6)*19,6*f,color)}return s}
function route(s,t){return s.route==='vessels'?window.NutritionVessels.comparison(s,t):window.NutritionVessels.circulation(s,t)}
function villi(s,t){const flat=s.flattened,tip=flat?245:100,base=400;let o=label(360,30,flat?'Flattened villus':'A villus',flat?'扁平絨毛':'一條絨毛');
 const wall=`M245 ${base} L265 ${tip+65} Q270 ${tip-10} 315 ${tip-10} Q360 ${tip-10} 365 ${tip+65} L385 ${base}`;
 o+=`<path d="${wall}" fill="#fbe8cd" stroke="#d9adb5" stroke-width="17"/>`;
 o+=line(`M315 417 L315 ${tip+60}`,C.lymph,17)+line(`M280 417 L287 ${tip+60}`, '#cb3540',7)+line(`M287 ${tip+60} Q312 ${tip+15} 339 ${tip+60}`, '#98639b',5)+line(`M339 ${tip+60} L350 417`, '#416faf',7);
 for(let i=0;i<5;i++){let y=tip+85+(base-tip-100)*i/5;o+=line(`M287 ${y} Q312 ${y-25} 342 ${y+15}`, '#98639b',5)}
 const outline=flat?[[267,305],[272,283],[277,267],[285,250],[299,240],[315,235],[333,240],[345,252],[354,270],[360,290],[365,315]]:[[267,290],[269,260],[272,230],[275,200],[279,170],[283,141],[290,115],[303,102],[321,101],[338,111],[349,132],[355,159],[359,189],[362,219],[366,250],[369,280],[373,310]];
 for(const [x,y]of outline)o+=`<ellipse cx="${x}" cy="${y}" rx="5" ry="8" fill="#eee0f1" stroke="#8e7597" stroke-width="1"/>`;
 o+=label(110,170,'Thin epithelium','單層上皮',17)+line(`M170 180 L275 ${tip+70}`,C.ink,1)+label(545,265,'Lacteal','乳糜管',18)+line('M465 270 L315 270',C.ink,1)+label(545,365,'Capillaries','微血管',18)+line('M465 370 L345 370',C.ink,1);
 o+=moving([[185,tip+30],[265,tip+50],[287,tip+65],[320,tip+50],[339,tip+65],[350,420]],t,C.food,flat?2:7)+moving([[425,tip+25],[360,tip+55],[315,tip+75],[315,420]],t,C.water,flat?1:4);
 o+=label(190,445,'Artery in','動脈流入',17)+label(440,445,'Vein out','靜脈流出',17)+label(360,495,'Purple: capillaries · Yellow: lacteal','紫：微血管　黃：乳糜管',15);return o;}
function cell(s,t,kind){let o=label(360,38,kind.title,kind.zh)+organ('M240 150 Q360 95 525 155 Q585 245 520 335 Q360 395 240 335 Q185 245 240 150 Z','#f7dfc9')+label(390,397,kind.cell||'Body cell',kind.cellZh||'身體細胞');
 o+=line('M65 125 L65 375',C.blood,32)+label(85,435,'Blood','血液');
 const backwards=kind.type==='release';
 o+=moving(backwards?[[310,245],[210,245],[65,245]]:[[65,245],[210,245],[315,245]],t,kind.type==='protein'? '#9270b6':C.food,6);
 if(kind.type==='store'||kind.type==='release')o+=granules(backwards?1-t:t)+label(440,315,'Glycogen','糖原');
 if(kind.type==='fat')o+=dot(420,240,18+45*t,'#e9bd58')+label(430,330,'Stored fat','儲存脂肪');
 if(kind.type==='protein'){for(let i=0;i<9;i++){const f=clamp(t*1.5-i/8);if(f)o+=dot(350+i*17,225+Math.sin(i)*15,7*f,'#9270b6')}o+=label(430,315,'Protein','蛋白質');}
 if(kind.type==='energy')o+=`<path d="M420 175 L386 245 L415 245 L397 300 L455 222 L425 222 Z" fill="#e8ac38" opacity="${.3+.7*t}"/>`+label(445,335,'Energy released','釋放能量');
 if(kind.type==='membrane')o+=line('M400 175 Q470 235 410 305','#c7984e',10)+moving([[300,245],[360,245],[400,200]],t,C.food,4)+label(475,330,'Cell membrane','細胞膜');
 if(kind.type==='urea')o+=moving([[330,245],[440,245],[570,245],[650,245]],t,'#6e99bb',5)+label(620,300,'Urea','尿素')+label(385,310,'Deamination','脫氨作用');
 return o;}
function fate(s,t){const aa=s.nutrient.startsWith('Amino'),lip=s.nutrient.startsWith('Lipids'),use=s.fate==='use';return cell(s,t,{title:aa?'What happens to amino acids?':lip?'What happens to lipids?':'What happens to glucose?',zh:aa?'氨基酸的用途':lip?'脂質的用途':'葡萄糖的用途',type:aa?(use?'protein':'urea'):lip?(use?'membrane':'fat'):use?'energy':s.glucoseStorage==='lipid'?'fat':'store',cell:use?'Body cell':lip?'Fat cell':'Liver cell',cellZh:use?'身體細胞':lip?'脂肪細胞':'肝細胞'});}
function glucose(s,t){const fast=s.situation==='fasting',protein=s.situation==='protein';if(protein)return cell(s,t,{title:'Excess amino acids form urea',zh:'過量氨基酸形成尿素',type:'urea',cell:'Liver cell',cellZh:'肝細胞'});
 let o=label(360,45,fast?'When starving: release glucose to blood':'When eating: reduce glucose in blood',fast?'飢餓：釋放葡萄糖到血液':'進食：降低血液中的葡萄糖',21);
 o+=`<rect x="95" y="100" width="530" height="270" fill="#fff" stroke="#777" stroke-width="1.5"/>`+label(360,135,'In the liver 肝內','',16)+label(215,205,'Glycogen','糖原',28)+label(510,205,'Glucose','葡萄糖',28);
 o+=granules(fast?1-t:t,160,270);
 for(let i=0;i<8;i++){const q=fast?t:1-t;if(i/8<q)o+=dot(475+(i%3)*24,275+Math.floor(i/3)*25,7,C.food)}
 o+=moving(fast?[[245,295],[360,295],[475,295]]:[[475,295],[360,295],[245,295]],t,C.food,4);
 o+=label(360,420,fast?'Glucagon promotes glycogen breakdown':'Insulin promotes glycogen formation',fast?'升糖素促進糖原分解':'胰島素促進糖原形成',19)+label(360,485,fast?'Glucose leaves the liver in blood':'Glucose is taken up from blood',fast?'葡萄糖隨血液離開肝':'葡萄糖由血液進入肝',16);return o;}
function liver(s,t){const f=+s.function;if(f===5)return window.NutritionVessels.circulation({...s,route:'water'},t);if(f===0)return glucose({...s,situation:s.situation==='fasting'?'fasting':'meal'},t);if(f===3)return glucose({...s,situation:'protein'},t);
 let o=label(360,38,['','','The liver produces useful substances','','The liver breaks down harmful substances'][f]||'The liver stores useful substances',f===1?'肝儲存物質':f===2?'肝製造有用物質':'肝分解有害物質')+line('M110 125 L110 370','#486ab5',23)+line('M610 125 L610 370','#d83037',23)+line('M220 210 L110 210','#486ab5',18)+line('M610 210 L480 210','#d83037',18)+line('M375 390 L375 275','#63b0d1',15)+organ('M215 165 Q260 115 360 145 Q410 160 485 150 Q555 170 505 195 Q400 205 350 285 Q285 320 245 325 Q215 320 215 165 Z','#b94126')+label(350,115,'Liver 肝','',18)+label(150,255,'Hepatic vein','肝靜脈',14)+label(565,255,'Hepatic artery','肝動脈',14);
 if(f===1){o+=granules(t,250,255)+label(360,400,'Glycogen · Iron · Vitamins A, D, E, K','糖原 · 鐵 · 維生素 A、D、E、K');}
 if(f===2&&s.production==='carotene'){o+=moving([[80,250],[190,250],[300,250]],t,'#df9b39',5)+moving([[400,250],[530,250],[640,250]],t,'#81a353',5)+label(90,335,'Carotene','胡蘿蔔素')+label(600,335,'Vitamin A','維生素A');}
 else if(f===2){o+=organ('M345 255 Q390 255 365 295 Q335 320 330 280 Z','#9daa30')+line('M385 235 L385 400 L550 400',C.lymph,6)+line('M360 280 L385 280',C.lymph,6)+organ('M525 375 Q595 360 600 400 Q595 440 525 425 L525 410 Q570 425 575 400 Q565 380 525 395 Z')+moving([[385,235],[385,280],[360,280],[385,280],[385,400],[550,400]],t,'#8d9829',8)+label(280,345,'Gall bladder','膽囊',18)+line('M300 325 L348 290',C.ink,1)+label(590,470,'Duodenum','十二指腸',18);}
 if(f===4){o+=moving([[80,250],[200,250],[315,250]],t,'#a885b6',5)+moving([[400,250],[530,250],[640,250]],t,C.water,7)+label(90,335,'Hydrogen peroxide','過氧化氫',15)+label(590,335,'Water + oxygen','水＋氧',16)+label(360,450,'Catalase breaks down hydrogen peroxide','過氧化氫酶分解過氧化氫',16);}
 return o;}
function colonPoint(q){const curves=[[[205,375],[175,370],[190,235],[190,170]],[[190,170],[190,115],[360,155],[480,140]],[[480,140],[515,145],[480,285],[490,355]],[[490,355],[490,420],[370,365],[380,465]]],p=Math.min(.99999,Math.max(0,q))*4,i=Math.floor(p),u=p-i,[a,b,c,d]=curves[i],v=1-u;return [v*v*v*a[0]+3*v*v*u*b[0]+3*v*u*u*c[0]+u*u*u*d[0],v*v*v*a[1]+3*v*v*u*b[1]+3*v*u*u*c[1]+u*u*u*d[1]];}
function colon(s,t){const fast=s.transit==='fast',front=[],back=[];for(let i=0;i<=140;i++){const q=i/140,[x,y]=colonPoint(q),a=colonPoint(Math.max(0,q-.003)),b=colonPoint(Math.min(1,q+.003)),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,width=25+3*Math.sin(q*100)-12*Math.exp(-Math.pow((q-(t-.075))/.03,2));front.push(`${x-dy/len*width},${y+dx/len*width}`);back.push(`${x+dy/len*width},${y-dx/len*width}`)}
 let o=label(360,30,fast?'Fast peristalsis: less water absorbed':'Large intestine and egestion',fast?'蠕動過快：吸水減少':'大腸與排遺')+organ(`M${front.join(' L')} L${back.reverse().join(' L')} Z`,'#faf7ec');
 const [x,y]=colonPoint(t),r=fast?19:19-8*t;o+=`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.25}" fill="#92704c"/>`;
 for(let i=0;i<(fast?8:3);i++)o+=dot(x+Math.sin(i*2)*r*.8,y+Math.cos(i*3)*r*.8,3,C.water);
 for(let i=0;i<(fast?2:7);i++){const q=(t+i/7)%1;o+=dot(515+q*60,210+i*17,4,C.water)}
 o+=label(85,270,'Colon','結腸',20)+line('M120 275 L167 275',C.ink,1)+label(600,195,'Water absorbed','水被吸收',17)+label(560,425,'Rectum','直腸',18)+line('M520 430 L405 430',C.ink,1)+label(340,495,'Anus 肛門','',18);
 o+=label(335,260,fast?'Wetter faeces':'Faeces become solid',fast?'糞便較稀':'糞便變得較固體',17)+label(335,330,'Undigested material','未消化物質',16);return o;}
function diagram(mode,s){const t=clamp(s.phase||0);let body=mode==='route'?route(s,t):mode==='villi'||mode==='application'?villi(s,t):mode==='fates'?fate(s,t):mode==='glucose'?glucose(s,t):mode==='liver'?liver(s,t):colon(s,t);if(mode==='route'||mode==='liver'&&+s.function===5)return body;return `<svg viewBox="0 0 720 520" role="img" aria-label="${mode}: simplified 2D teaching animation" xmlns="http://www.w3.org/2000/svg"><rect width="720" height="520" fill="#fff"/>${body}</svg>`;}
const FIGURES={villi:['a',1,100,195,850,485],application:['a',25,215,1115,755,400],route:['b',4,250,600,740,465],glucose:['b',9,140,100,910,250],liver:['b',8,110,170,970,515],fates:['b',9,140,100,910,250],egestion:['b',18,285,785,600,730]};
function figureRef(mode,s){if(mode==='fates'&&s.nutrient.startsWith('Amino'))return ['a',25,390,550,425,110];if(mode==='fates'&&s.nutrient.startsWith('Lipids'))return ['b',5,165,930,870,295];return FIGURES[mode]}
function sourceFigure(mode,s){const [d,n,x,y,w,h]=figureRef(mode,s),src=window.SOURCES?.find(a=>a.id===d)?.pages[n-1]?.image||`pages/${d}-${String(n).padStart(2,'0')}.webp`;return `<svg viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="Original notes figure: ${d} PDF page ${n}" xmlns="http://www.w3.org/2000/svg"><image href="${src}" width="1190" height="1682"/></svg>`;}
class NutritionDiagram{constructor(host){this.host=host;this.original=false;host.innerHTML='<div class="diagram-2d"><div class="diagram-actions"><button class="diagram-reference" aria-pressed="false">Notes figure 原圖</button><button class="diagram-expand" aria-pressed="false">⛶ Enlarge 放大</button></div><div class="diagram-picture"></div><span class="diagram-key"></span></div>';this.picture=host.querySelector('.diagram-picture');host.querySelector('.diagram-reference').onclick=e=>{this.original=!this.original;e.currentTarget.setAttribute('aria-pressed',this.original);e.currentTarget.textContent=this.original?'Animated 動畫':'Notes figure 原圖';this.setState(this.mode,this.state)};host.querySelector('.diagram-expand').onclick=e=>{const expanded=host.closest('.panel').classList.toggle('model-expanded');e.currentTarget.setAttribute('aria-pressed',expanded);e.currentTarget.textContent=expanded?'↙ Return 返回':'⛶ Enlarge 放大'}}setState(mode,s){const changed=this.mode!==mode||this.state?.nutrient!==s.nutrient;this.mode=mode;this.state={...s};if(!this.original||changed||!this.picture.querySelector('image'))this.picture.innerHTML=this.original?sourceFigure(mode,s):diagram(mode,s);const [d,n]=figureRef(mode,s);this.host.querySelector('.diagram-key').textContent=this.original?`Original notes figure 原筆記圖 · ${d==='a'?'7.5–7.6':'7.6–7.7'} PDF p.${n} · Static reference 靜態對照`:'2D · Adapted from notes 依原筆記簡化 · Use Animate or drag the stage slider 按動畫或拖曳進度';}}
window.NutritionDiagram=NutritionDiagram;window.nutritionDiagramSVG=diagram;window.nutritionSourceFigure=sourceFigure;
})();
