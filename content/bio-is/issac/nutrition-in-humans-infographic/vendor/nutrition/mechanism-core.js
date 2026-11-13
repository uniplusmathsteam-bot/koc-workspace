/* Compartment-first teaching scenes. Model coordinates and drawn gates share geometry. */
(() => {
'use strict';
const C={ink:'#203f40',muted:'#536b6b',glucose:'#c68a16',amino:'#8158a0',lipid:'#bd7332',blood:'#b54c61',blue:'#3d78a2',green:'#367f6a',water:'#298bb6',urea:'#267f9c',oxygen:'#68a7bd',co2:'#75828b'};
const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,t)=>a+(b-a)*t;
function ramp(t,a,b){const p=clamp((t-a)/(b-a));return p*p*(3-2*p)}
function at(points,t){t=clamp(t);if(t===0)return points[0];if(t===1)return points.at(-1);const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);let d=t*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1){const p=lengths[i]?d/lengths[i]:0;return [lerp(points[i][0],points[i+1][0],p),lerp(points[i][1],points[i+1][1],p)]}d-=lengths[i]}return points[0]}
const txt=(x,y,en,zh='',size=21,anchor='middle',color=C.ink)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial,Microsoft JhengHei,sans-serif" font-size="${size}" fill="${color}" font-weight="600">${en}${zh?`<tspan x="${x}" dy="23" font-size="${Math.max(14,size-3)}">${zh}</tspan>`:''}</text>`;
const path=(points,color=C.ink,width=3,extra='')=>`<path d="M${points.map(p=>p.join(' ')).join(' L')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle=(x,y,r,color,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra}/>`;
function token(x,y,type='glucose',extra='',r=9){const color=C[type]||type;let shape;
 if(type==='oxygen')shape=`<g data-molecule="O2">`+path([[x-r*.6,y],[x+r*.6,y]],'#46778b',r*.35)+circle(x-r*.55,y,r*.62,color,'stroke="#fff" stroke-width="1.2"')+circle(x+r*.55,y,r*.62,color,'stroke="#fff" stroke-width="1.2"')+'</g>';
 else if(type==='co2')shape=`<g data-molecule="CO2">`+path([[x-r,y],[x+r,y]],'#667e87',r*.3)+circle(x-r,y,r*.52,C.oxygen,'stroke="#fff" stroke-width="1"')+circle(x+r,y,r*.52,C.oxygen,'stroke="#fff" stroke-width="1"')+circle(x,y,r*.58,color,'stroke="#fff" stroke-width="1"')+'</g>';
 else shape=type==='glucose'?`<polygon points="${Array.from({length:6},(_,i)=>[x+r*Math.cos(i*Math.PI/3),y+r*Math.sin(i*Math.PI/3)].join(',')).join(' ')}" fill="${color}" stroke="#fff" stroke-width="1.8"/>`:type==='amino'?`<rect x="${x-r}" y="${y-r}" width="${r*2}" height="${r*2}" rx="4" fill="${color}" stroke="#fff" stroke-width="1.8"/>`:type==='lipid'?`<ellipse cx="${x}" cy="${y}" rx="${r*1.35}" ry="${r*.8}" fill="${color}" stroke="#fff" stroke-width="1.8"/>`:circle(x,y,r,color,'stroke="#fff" stroke-width="1.8"');return `<g ${extra}>${shape}</g>`}
const labelbox=(x,y,w,en,zh,color=C.green)=>`<rect x="${x}" y="${y}" width="${w}" height="58" rx="9" fill="#fff" stroke="${color}" stroke-width="1.5"/>`+txt(x+w/2,y+23,en,zh,18);
function svg(body,title,desc=''){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 800" role="img" aria-label="${title}"><title>${title}</title><desc>${desc}</desc><rect width="1120" height="800" fill="#fffdf8"/>${body}</svg>`}
const title=(en,zh)=>txt(560,38,en,zh,27);
const inputPoint=i=>[95+i*34,174+(i%2)*15];
const gates={in:350,out:810,signal:670,wall:[214,236],membrane:[322,338]};
function uptakePath(start,end){return [start,[350,180],[350,224],[350,277],[350,330],[350,380],end]}
function exportPath(start,end=[970,180]){return [start,[810,390],[810,330],[810,275],[810,224],[810,180],end]}
function cellBody(x,y,w,h){let out=`<path data-animal-cell="true" d="M${x+w*.15} ${y} H${x+w*.83} C${x+w*1.04} ${y-h*.04} ${x+w*1.04} ${y+h*.32} ${x+w*.97} ${y+h*.52} C${x+w*1.03} ${y+h*.83} ${x+w*.88} ${y+h*1.08} ${x+w*.68} ${y+h*.99} C${x+w*.48} ${y+h*.94} ${x+w*.29} ${y+h*1.08} ${x+w*.13} ${y+h*.94} C${x-w*.05} ${y+h*.79} ${x-w*.04} ${y+h*.43} ${x+w*.02} ${y+h*.22} Q${x+w*.04} ${y} ${x+w*.15} ${y}Z" fill="#fae6d4" stroke="#ac7c6c" stroke-width="5"/>`;
 // Organelles stay at the periphery, leaving the central reaction area clear.
 for(const [u,v]of [[.1,.36],[.12,.69],[.8,.3]]){const a=x+w*u,b=y+h*v;out+=`<g transform="translate(${a} ${b}) rotate(-18)"><ellipse rx="28" ry="14" fill="#c1816a" stroke="#956653" stroke-width="2"/>`+path([[-20,0],[-12,-8],[-5,8],[3,-8],[11,8],[21,0]],'#f8d5aa',2)+'</g>'}
 for(let i=0;i<4;i++){const a=x+w*.83,b=y+h*.38+i*13;out+=`<path d="M${a-23} ${b} Q${a+5} ${b+18} ${a+34} ${b-4}" fill="none" stroke="#b49189" stroke-width="4"/>`}
 for(let i=0;i<18;i++)out+=circle(x+w*(i%2?.08:.92)+(i%3)*7,y+h*(.28+Math.floor(i/2)*.06),1.7,'#bd9d87');
 return out;
}
function membrane(t,kind='glucose',signal=false,passiveExit=false){let out='';
 // A fenestrated endothelium is distinct from the hepatocyte membrane.
 out+='<rect x="55" y="140" width="1010" height="75" fill="#f8e6e8"/>';
 out+=path([[55,139],[1065,139]],C.blood,6);
 for(const [a,b]of [[55,333],[367,453],[487,653],[687,793],[827,1065]]){out+=`<rect x="${a}" y="214" width="${b-a}" height="22" rx="7" fill="#edc1c6" stroke="#a85b6c" stroke-width="2"/>`;for(let x=a+45;x<b-10;x+=95)out+=`<ellipse cx="${x}" cy="225" rx="10" ry="4" fill="#a76e81"/>`}
 out+=txt(70,105,'Blood in a capillary / liver sinusoid','微血管／肝血竇內的血液',20,'start');
 out+=txt(1045,270,'Tissue fluid','組織液',18,'end');
 out+=cellBody(200,330,860,350);
 for(let x=330;x<914;x+=13){if(Math.abs(x-350)<21||!passiveExit&&Math.abs(x-810)<21||signal&&Math.abs(x-670)<18)continue;out+=circle(x,324,4,'#ba9970')+circle(x,336,4,'#ba9970')+path([[x,328],[x+3,332]],'#ba9970',2)}
 for(const x of passiveExit?[350]:[350,810])out+=`<path d="M${x-16} 313 V347 M${x+16} 313 V347" stroke="#367f6a" stroke-width="9" stroke-linecap="round"/><rect x="${x-10}" y="318" width="20" height="24" fill="#eef6e9" opacity=".55"/>`;
 out+=path([[115,224],[325,224]],'#a66d7b',1.3)+txt(70,258,'Vessel wall + pores','血管壁及小孔',17,'start');
 out+=path([[115,330],[320,330]],'#8d795d',1.3)+txt(70,363,'Cell membrane','細胞膜',17,'start');
 out+=txt(350,285,kind==='glucose'?'Glucose carrier':kind==='amino'?'Amino-acid carrier':'Membrane uptake',kind==='glucose'?'葡萄糖載體':kind==='amino'?'氨基酸載體':'細胞膜攝取（示意）',16);
 out+=`<ellipse cx="965" cy="556" rx="48" ry="43" fill="#d7c5d9" stroke="#9c80a3" stroke-width="2"/>`+circle(972,558,15,'#b397bc')+txt(965,620,'Nucleus','細胞核',16);
 // Red blood cells stay in the lumen even while small solutes exchange.
 for(let i=0;i<9;i++){const x=75+((i*121+t*210)%970);out+=`<ellipse data-rbc="true" cx="${x}" cy="${(i%2?166:198)}" rx="16" ry="7" fill="#b34c60" stroke="#f4bac0" stroke-width="2"/>`}
 if(signal)out+=`<path d="M655 310 L661 327 H679 L685 310" fill="none" stroke="#357d68" stroke-width="6"/>`+txt(692,368,'Receptor','受體',16,'start');
 return out;
}
const glycogenPoints=Array.from({length:12},(_,i)=>i<6?[465+i*36,486]:i<9?[501+(i-6)*33,446]:[537+(i-9)*33,526]);
const glycogenParent=i=>i<6?i-1:i<9?(i===6?1:i-1):(i===9?2:i-1);
function bond(points,i,color=C.glucose){const j=glycogenParent(i);return j>=0?path([points[j],points[i]],color,4,'data-bond="true"'):''}
function fateKind(s){const n=s.nutrient||'Glucose';return n.startsWith('Amino')?(s.fate==='excess'?'deamination':'protein'):n.startsWith('Lipids')?(s.fate==='excess'?'fat':s.lipidUse==='hormone'?'hormone':'membrane'):s.fate==='excess'?(s.glucoseStorage==='lipid'?'fat':'glycogen'):'energy'}
function transferState(kind,s,t){const type=kind==='protein'||kind==='deamination'?'amino':(s.nutrient||'').startsWith('Lipids')?'lipid':'glucose',n=kind==='glycogen'?12:kind==='protein'?8:kind==='energy'?1:6;
 const points=Array.from({length:n},(_,i)=>kind==='glycogen'?glycogenPoints[i]:kind==='protein'?[470+i*39,480+Math.sin(i*.8)*16]:[475+(i%3)*40,430+Math.floor(i/3)*40]);
 return {type,points,particles:points.map((p,i)=>{const arrival=.57+i*.015,progress=ramp(t,.08+i*.008,arrival);return {id:i,p:at(uptakePath(inputPoint(i),p),progress),arrived:t>=arrival,progress}})};
}
function assimilation(s,t){const kind=fateKind(s);if(kind==='deamination')return deamination(s,t);
 const names={energy:['Respiration in a body cell','身體細胞的呼吸作用'],protein:['Amino acids become a protein chain','氨基酸連接成蛋白質鏈'],glycogen:['Glucose units join a branched glycogen store','葡萄糖單位連接成分支的糖原'],fat:['Lipid storage inside cells','細胞內儲存脂質'],membrane:['Lipid components build a cell membrane','脂質成分用作製造細胞膜'],hormone:['A lipid precursor is used to make sex hormones','利用脂質前體製造性激素']};
 const liver=kind==='glycogen'||kind==='fat'&&!(s.nutrient||'').startsWith('Lipids'),m=transferState(kind,s,t),r=ramp(t,.69,.92);
 let out=title(...names[kind])+membrane(t,m.type,false,['energy','hormone'].includes(kind))+txt(245,650,liver?'Liver cell':kind==='fat'?'Fat cell':kind==='hormone'?'Hormone-producing cell':'Body cell',liver?'肝細胞':kind==='fat'?'脂肪細胞':kind==='hormone'?'製造激素的細胞':'身體細胞',20,'start');
 for(const a of m.particles){if(['protein','glycogen'].includes(kind)||r<.95){out+=token(...a.p,m.type,`data-transfer-id="${a.id}" data-progress="${a.progress}"`,['protein','glycogen'].includes(kind)?10:10*(1-r));if(a.arrived&&['protein','glycogen'].includes(kind)){const i=a.id,j=kind==='protein'?i-1:glycogenParent(i);if(j>=0&&m.particles[j].arrived)out+=path([m.points[j],a.p],C[m.type],4,'data-bond="true"')}}}
 if(kind==='protein')out+=txt(635,564,'Joined amino-acid units','連接的氨基酸單位',21)+txt(635,601,'For growth, repair, enzymes and antibodies','用於生長、修補、酶及抗體',17);
 if(kind==='glycogen')out+=txt(630,584,'Glycogen stays inside the cell','糖原留在細胞內，不進入血管',20);
 if(kind==='energy'){
  out+=`<ellipse cx="640" cy="488" rx="140" ry="76" fill="#f5d8ba" stroke="#bb8460" stroke-width="2"/>`+path([[545,479],[570,455],[590,510],[620,458],[648,514],[680,464],[717,493]],'#c18d6a',3)+txt(640,600,'Mitochondrion','線粒體',18);
  out+=txt(500,262,'O₂ diffusion','氧的擴散',16);
  for(let i=0;i<6;i++){const p=at([[125+i*48,194],[470,180],[470,224],[470,277],[470,330],[470,380],[600+i*14,470]],ramp(t,.09+i*.01,.65));if(r<1)out+=token(...p,'oxygen','data-oxygen="true"',7*(1-r));if(r>0)out+=token(580+i*24,548,'water',`data-water="true"`,7*r)}
  if(r>0)out+=labelbox(725,395,153,'ATP energy','ATP 能量','#a88c22');
  for(let i=0;i<6;i++){const p=at(exportPath([600+i*15,480],[830+i*32,180]),ramp(t,.81+i*.02,.99));if(r>0)out+=token(...p,'co2','data-co2="true"',8*r)}
 }else if(kind==='fat'){
  out+=`<ellipse data-stored-fat="true" cx="615" cy="493" rx="${12+100*r}" ry="${10+76*r}" fill="#e0b65d" stroke="#ae8037" stroke-width="3"/>`+txt(625,608,liver?'Glucose is converted into lipids':'Triglycerides accumulate in a lipid droplet',liver?'葡萄糖經細胞內反應轉成脂質':'甘油三酯在脂滴內累積',19);
 }else if(kind==='membrane'){
  // Incorporated building blocks become part of the drawn lower bilayer.
  for(let i=0;i<8;i++){const end=[470+i*35,680],p=at([[500+(i%3)*30,450],[500+i*20,570],end],ramp(t,.68+i*.015,.96));if(t>.68){out+=token(...p,'lipid','data-incorporation="true"',7);if(t>.94)out+=path([[end[0]-4,680],[end[0]-7,666]],C.lipid,3)+path([[end[0]+4,680],[end[0]+7,666]],C.lipid,3)}}
  out+=txt(640,578,'Build membrane phospholipids','製造細胞膜的磷脂（反應簡化）',19);
 }else if(kind==='hormone'){
  out+=txt(645,565,'Cholesterol → steroid sex hormones','膽固醇 → 類固醇性激素',19);
  for(let i=0;i<4;i++){if(t>.72+i*.02){const p=at(exportPath([550+i*25,460],[845+i*50,180]),ramp(t,.72+i*.02,.98));out+=token(...p,'green','data-hormone-product="true"',9)}}
 }
 const typeName=m.type==='amino'?'Amino acid 氨基酸':m.type==='lipid'?(kind==='hormone'?'Lipid precursor 脂質前體':'Lipid building block 脂質成分'):'Glucose 葡萄糖';
 if(kind==='energy'){
  for(const [x,type,label]of [[80,'glucose','Glucose 葡萄糖'],[335,'oxygen','O₂ 氧'],[550,'water','Water 水'],[795,'co2','CO₂ 二氧化碳']])out+=token(x,730,type)+txt(x+22,735,label,'',18,'start');
  out+=txt(1045,105,'Red cells stay in blood','紅血球留在血液內',16,'end');
 }else {out+=token(80,730,m.type)+txt(103,735,typeName,'',18,'start')+txt(1055,735,'Red cells remain in blood','紅血球留在血管內',17,'end');if(kind==='hormone')out+=token(500,730,'green')+txt(520,735,'Steroid sex hormone 類固醇性激素','',17,'start');}
 out+=txt(560,780,'Transfer and enzyme steps are enlarged and simplified; particles are not to scale.','',15);return out;
}
function regulation(s,t){if(s.situation==='protein')return deamination(s,t);const fast=s.situation==='fasting',r=ramp(t,.4,.94);let out=title(fast?'Fasting: release glucose from liver glycogen':'After a meal: store glucose as liver glycogen',fast?'空腹：肝糖原分解並釋放葡萄糖':'餐後：肝將葡萄糖儲存為糖原')+membrane(t,'glucose',true)+txt(245,650,'Liver cell','肝細胞',20,'start');
 const hormonePath=[[110,181],[670,181],[670,224],[670,306]],h=at(hormonePath,ramp(t,.08,.36));out+=token(...h,'green','data-hormone="true"',11)+txt(1040,100,fast?'Pancreas releases glucagon':'Pancreas releases insulin',fast?'胰釋放升糖素':'胰釋放胰島素',17,'end');
 if(t>.35)out+=path([[670,341],[670,390],[600,435]],C.green,3,'stroke-dasharray="6 5"')+txt(850,399,'Signal to enzymes','訊息調節細胞內的酶',16);
 const n=fast?3:8;for(let i=0;i<n;i++)out+=token(80+(410+i*52+t*360)%960,182,'glucose','data-baseline-glucose="true"');
 const ps=[];
 for(let i=0;i<12;i++){const p=fast&&i<7?0:ramp(t,.4+i*.012,.73+i*.016),end=glycogenPoints[i],pos=fast?at(exportPath(end,[845+(i-7)*43+(p===1?(t-(.73+i*.016))*180:0),180]),p):at(uptakePath([80+(15+i*18+t*220)%240,174+(i%2)*15],end),p),inStore=fast?p===0:p===1;ps.push({pos,inStore});out+=token(...pos,'glucose',`data-regulation-unit="${i}" data-store="${inStore}"`,10);if(i&&inStore){const j=glycogenParent(i);if(ps[j]?.inStore)out+=path([ps[j].pos,pos],C.glucose,4,'data-glycogen-bond="true"')}}
 out+=txt(620,585,'Branched glycogen store','有分支的糖原儲備',21)+labelbox(55,438,145,fast?'Low → normal':'High → normal',fast?'血糖由低回升':'血糖由高回落',C.blood);
 out+=txt(560,726,fast?'Glucose exits through carriers, tissue fluid and the sinusoid wall.':'Glucose crosses the sinusoid wall, tissue fluid, then a membrane carrier.',fast?'葡萄糖經載體、組織液及血竇壁進入血液。':'葡萄糖先經血竇壁及組織液，再經細胞膜載體進入肝細胞。',18);
 out+=txt(560,785,'Insulin changes enzyme activity; it does not open a glucose gate in the liver.','',16);return out;
}
function deamination(s,t){let out=title('Deamination: separate nitrogen, then export urea','脫氨：移除含氮部分，再排出尿素')+membrane(t,'amino')+txt(245,650,'Liver cell','肝細胞',20,'start');const split=ramp(t,.6,.75),exit=ramp(t,.79,1);
 for(let i=0;i<5;i++){const end=[480+i*43,470],p=at(uptakePath(inputPoint(i),end),ramp(t,.06+i*.015,.53+i*.01));out+=token(...p,'#c79831',`data-carbon-part="${i}"`,12);const n=[p[0]+lerp(10,0,split),p[1]-lerp(9,65,split)];if(split<1)out+=token(...n,'amino','data-nitrogen="true"',8);else{const u=at([[end[0],405],[750,405],...exportPath([750,405],[850+i*38,180])],exit);out+=token(...u,'urea','data-urea="true"',10)}}
 out+=txt(605,565,'Remaining carbon parts can be reused','其餘碳骨架可用作製造葡萄糖、糖原或脂質',19)+txt(820,470,'Urea formation','形成尿素',18)+txt(560,733,'Urea is carried in blood to the kidneys, then excreted in urine.','尿素隨血液到腎，再隨尿液排出。',19)+txt(560,785,'Several enzyme reactions are combined into one teaching stage.','',15);return out;
}
function stores(s,t){let out=title('The liver takes up and stores useful materials','肝攝取及儲存有用物質')+membrane(t,'mixed')+txt(245,650,'Liver cell','肝細胞',20,'start');const labels=[['Glycogen','糖原','glucose'],['Iron','鐵','#9b5d40'],['Vitamins A D E K','維生素 A、D、E、K','green']];labels.forEach(([en,zh,type],row)=>{out+=txt(660,416+row*88,en,zh,19);for(let i=0;i<4;i++){const end=[480+i*32,451+row*85],p=at(uptakePath([100+i*35+row*170,180],end),ramp(t,.05+row*.05+i*.01,.64+row*.07));out+=token(...p,type,'data-store-unit="true"',9);if(row===0&&i&&t>.7)out+=path([[end[0]-32,end[1]],end],C.glucose,3)}});out+=txt(560,737,'Glucose is converted to glycogen; iron and fat-soluble vitamins can be stored.','葡萄糖轉成糖原；鐵及脂溶性維生素可被儲存。',18);return out;}
function caroteneState(t){const q=ramp(t,.3,.78);return {split:t>=.3,atoms:Array.from({length:40},(_,i)=>{const half=i<20?0:1,j=i%20,cx=lerp(half?660:460,half?700:430,q),y=lerp(390,520,q);return {id:i,half,p:[cx+(j-9.5)*10,y+(j%2?4:-4)]}})}}
function carotene(s,t){const state=caroteneState(t),detail=s.carbonTracking===true;let out=title('β-carotene is split into vitamin A precursors','β-胡蘿蔔素分解成維生素 A 前體')+cellBody(200,250,860,450)+`<ellipse cx="935" cy="560" rx="48" ry="37" fill="#c4aec8" stroke="#957d9c" stroke-width="3"/>`+txt(935,625,'Nucleus','細胞核',17);
 out+=txt(560,302,'Intracellular enzyme reaction','細胞內的酶促反應',23)+`<path data-carotene-enzyme="true" d="M505 405 Q515 365 544 377 L554 398 L568 378 Q608 366 618 410 Q599 449 560 430 Q520 453 505 405Z" fill="#a6b887" stroke="#738558" stroke-width="3"/>`;
 for(let half=0;half<2;half++){const a=state.atoms.filter(v=>v.half===half);out+=path(a.map(v=>v.p),state.split?'#a39127':'#d58a35',detail?4:8,`data-retinoid-part="${half}"`);if(detail)for(const v of a)out+=circle(...v.p,5,state.split?'#a39127':'#d58a35',`data-carotene-carbon="${v.id}" data-product-half="${half}"`)}
 if(!state.split)out+=path([state.atoms[19].p,state.atoms[20].p],'#d58a35',detail?5:8)+txt(560,470,detail?'One β-carotene molecule: 40 carbon units':'One β-carotene molecule',detail?'一個 β-胡蘿蔔素：40 個碳單位':'一個 β-胡蘿蔔素分子',21);else out+=txt(430,592,detail?'Retinal: 20 carbon units':'Vitamin A precursor',detail?'視黃醛：20 個碳單位':'維生素 A 前體',20)+txt(700,592,detail?'Retinal: 20 carbon units':'Vitamin A precursor',detail?'視黃醛：20 個碳單位':'維生素 A 前體',20)+txt(560,658,'Retinal can be converted to other vitamin A forms','圖示的視黃醛可再轉成其他維生素 A 形式',20);
 out+=txt(560,772,'The dots track carbon portions, not the detailed molecular shape; delivery is outside this reaction view.','圓點追蹤碳的部分，並非真實分子外形；此圖由物質已進入細胞開始。',17);return out;
}
function detox(s,t){let out=title('Catalase acts inside liver cells','過氧化氫酶在肝細胞內發揮作用')+cellBody(160,170,800,485)+`<ellipse cx="850" cy="535" rx="48" ry="37" fill="#c4aec8" stroke="#957d9c" stroke-width="3"/>`+txt(850,602,'Nucleus','細胞核',17)+txt(560,212,'Inside a liver cell','肝細胞內',22);out+=`<path d="M475 335 Q490 295 540 310 L555 343 L585 311 Q645 316 655 362 Q630 413 565 391 Q490 425 475 335Z" fill="#92b78b" stroke="#457e50" stroke-width="3"/>`+txt(565,455,'Catalase remains unchanged','酶不被消耗，可重複使用',20);const react=ramp(t,.45,.72);for(let i=0;i<2;i++){const p=at([[320+i*45,285],[510+i*50,348]],ramp(t,.06,.43));if(react<1)out+=token(...p,'#9b78ad','data-peroxide="true"',12*(1-react));if(react>0)out+=token(460+i*65,lerp(350,542,react),'water','data-water-product="true"',10*react)}if(react>0)out+=token(680,lerp(350,542,react),'oxygen','data-oxygen-product="true"',10*react);out+=txt(560,602,'2 H₂O₂ → 2 H₂O + O₂','過氧化氫 → 水及氧',23)+txt(560,733,'Hydrogen peroxide is produced by cell metabolism, not injected through a vessel wall.','過氧化氫由細胞代謝產生；此圖只顯示細胞內反應。',18);return out;}
function bile(s,t){const fill=ramp(t,.04,.4),release=ramp(t,.55,.95),em=ramp(t,.83,1);let out=title('Bile: production, storage, release and emulsification','膽汁：製造、儲存、釋放及乳化');out+='<path d="M110 180 Q175 132 330 154 L425 180 L405 287 Q255 311 120 280Z" fill="#e6b6a1" stroke="#925e4d" stroke-width="3"/>'+txt(265,200,'Liver cells','肝細胞',22);
 const storeRoute=[[260,245],[560,245],[560,305],[480,305],[480,390]],releaseRoute=[[480,390],[480,305],[560,305],[560,550],[932,550]];out+=path([[260,245],[560,245],[560,550],[932,550]],'#859449',17)+path([[480,390],[480,305],[560,305]],'#859449',13);
 const g=1+.25*fill-.45*release;out+=`<ellipse cx="480" cy="395" rx="${35*g}" ry="${62*g}" fill="#c4d294" stroke="#698447" stroke-width="3"/>`;
 out+='<path d="M785 468 Q932 468 932 552 Q932 642 785 642" fill="none" stroke="#b98b69" stroke-width="76"/><path d="M785 468 Q932 468 932 552 Q932 642 785 642" fill="none" stroke="#f8edcc" stroke-width="58"/>';
 for(let i=0;i<10;i++){const p=t<.54?at(storeRoute,ramp(t,.01+i*.014,.27+i*.014)):at(releaseRoute,ramp(t,.55+i*.009,.85+i*.009));out+=token(...p,'#8c9f31',`data-bile-unit="${i}"`,5)}
 if(em<1)out+=token(932,552,'lipid','data-large-droplet="true"',20*Math.sqrt(1-em));for(let i=0;i<7;i++){if(em>0){const a=i*2.4;out+=token(932+Math.cos(a)*16,552+Math.sin(a)*16,'lipid','data-small-droplet="true"',20*Math.sqrt(em/7))}}
 out+=txt(660,211,'Hepatic duct','肝管',18)+txt(353,386,'Gall bladder','膽囊',20)+txt(650,430,'Common bile duct','總膽管',19)+txt(875,710,'Duodenum lumen','十二指腸腸腔',20)+txt(315,555,release>.2?'Gall bladder contracts':'Bile collects in the gall bladder',release>.2?'膽囊收縮，膽汁經膽管流出':'膽汁流入膽囊儲存',20)+txt(560,770,'Bile splits a large fat droplet into smaller droplets; it is not a digestive enzyme.','',18);return out;}
window.MechanismCore={C,clamp,lerp,ramp,at,txt,path,circle,token,labelbox,svg,title,gates,uptakePath,exportPath,glycogenPoints,transferState,fateKind,assimilation,regulation,deamination,stores,carotene,caroteneState,detox,bile,cellBody};
})();
