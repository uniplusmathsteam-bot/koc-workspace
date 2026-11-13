/* Guided transformations: substance identity and compartment boundaries stay visible. */
(() => {
'use strict';
const W=820,H=630,colors={glucose:'#dea72d',amino:'#9665b2',fat:'#d4923d',urea:'#3589af',nitrogen:'#9665b2',water:'#459bd3',oxygen:'#acd5e3',hormone:'#488c7a'};
const clamp=t=>Math.max(0,Math.min(1,t)),q=(t,a,b)=>{let x=clamp((t-a)/(b-a));return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const text=(x,y,en,zh='',size=23,color='#243e36')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-size="${size}" font-family="Arial,Microsoft JhengHei,sans-serif" font-weight="600">${en}${zh?`<tspan x="${x}" dy="25" font-size="${size*.83}">${zh}</tspan>`:''}</text>`;
const dot=(x,y,r,color,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="${color===colors.oxygen?'#648b99':'#fff'}" stroke-width="2" ${extra}/>`;
const line=(d,c='#577767',w=3)=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const tag=(x,y,name,zh,color)=>`<rect x="${x-79}" y="${y-24}" width="158" height="55" rx="8" fill="#fff" stroke="${color}" stroke-width="2"/>`+text(x,y-3,name,zh,18,'#263f38');
function key(entries){return entries.map(([name,zh,color],i)=>dot(30+i*260,562,8,color)+text(150+i*260,558,name,zh,17)).join('')}
function substrate(x,y,type,r=11){if(type==='amino')return dot(x,y,r,colors.amino);if(type==='fat')return `<ellipse cx="${x}" cy="${y}" rx="${r*1.3}" ry="${r}" fill="${colors.fat}" stroke="#fff" stroke-width="2"/>`;return dot(x,y,r,colors.glucose)}
function blood(){return `<rect x="35" y="120" width="94" height="340" rx="33" fill="#f7dfe2" stroke="#a95466" stroke-width="3"/>`+text(82,490,'Blood','血液',20)}
function cell(title='Body cell',zh='身體細胞'){return `<path d="M285 150 C380 75 680 95 718 240 C770 430 470 480 310 395 C240 350 235 220 285 150 Z" fill="#fff2df" stroke="#ac8869" stroke-width="4"/>`+text(500,125,title,zh,22)+`<ellipse cx="620" cy="335" rx="35" ry="29" fill="#c5b3cd" stroke="#8c7398" stroke-width="2"/>`+text(622,390,'Nucleus','細胞核',16)}
const TITLE={energy:['Glucose releases energy','葡萄糖釋放能量'],protein:['Amino acids build proteins','氨基酸製造蛋白質'],hormone:['Lipids are used to make sex hormones','脂質被用作製造性激素'],membrane:['Lipids build cell membranes','脂質製造細胞膜'],fat:['Excess nutrients become stored fat','過量營養素轉成儲存脂肪'],glycogen:['Glucose becomes glycogen','葡萄糖轉成糖原'],deamination:['Excess amino acids are deaminated','過量氨基酸進行脫氨']};
function fateKind(s){const aa=s.nutrient.startsWith('Amino'),lip=s.nutrient.startsWith('Lipids'),use=s.fate==='use';return aa?(use?'protein':'deamination'):lip?(use?(s.lipidUse==='hormone'?'hormone':'membrane'):'fat'):use?'energy':s.glucoseStorage==='lipid'?'fat':'glycogen'}
function assimilation(s,t){const kind=fateKind(s),aa=s.nutrient.startsWith('Amino'),lip=s.nutrient.startsWith('Lipids');if(kind==='deamination')return deamination(t);
 let out=text(410,35,...TITLE[kind],25)+blood()+cell(kind==='hormone'?'Hormone-producing cell':kind==='glycogen'||(!lip&&kind==='fat')?'Liver cell':kind==='fat'?'Fat cell':'Body cell',kind==='hormone'?'製造激素的細胞':kind==='glycogen'||(!lip&&kind==='fat')?'肝細胞':kind==='fat'?'脂肪細胞':'身體細胞');
 const incoming=aa?'amino':lip?'fat':'glucose',progress=q(t,.05,.4),reaction=q(t,.4,.86);
 if(kind==='protein'||kind==='glycogen'){
  const n=kind==='protein'?11:20,points=[];
  for(let i=0;i<n;i++){const end=kind==='protein'?[350+i*24,265+Math.sin(i*.85)*19]:[400+(i%5)*27,225+Math.floor(i/5)*31];const p=q(t,.08+i*.012,.43+i*.018);const start=[82,160+i%8*33];const x=mix(start[0],end[0],p),y=mix(start[1],end[1],p);points.push([x,y]);if(i&&p>.93){const j=kind==='glycogen'&&i%5===0?i-5:i-1;out+=line(`M${points[j][0]} ${points[j][1]} L${x} ${y}`,aa?colors.amino:colors.glucose,4);}out+=substrate(x,y,incoming,10);}
  out+=tag(474,415,kind==='protein'?'Protein':'Glycogen',kind==='protein'?'蛋白質':'糖原',aa?colors.amino:colors.glucose)+text(475,478,kind==='protein'?'Joined amino acids → growth and repair':'Joined glucose units → energy store',kind==='protein'?'連接氨基酸，用於生長及修補':'葡萄糖單位連接，儲存以供日後使用',19);
 }else if(kind==='energy'){
  for(let i=0;i<5;i++){const p=q(t,.04+i*.018,.38+i*.018);if(t<.69)out+=substrate(mix(82,430,p),mix(175+i*35,245+i*8,p),'glucose',11*(1-q(t,.46,.69)));}
  out+=tag(385,190,'Glucose','葡萄糖',colors.glucose)+tag(560,190,'Oxygen','氧',colors.oxygen);
  for(let i=0;i<4;i++){const p=q(t,.05+i*.02,.42);if(t<.7)out+=dot(mix(82,500,p),mix(400-i*25,275+i*8,p),8*(1-q(t,.45,.7)),colors.oxygen);}
  if(reaction>0){out+=`<path d="M473 235 l-30 64 h29 l-13 51 57-76 h-31 l18-39 Z" fill="#efb822" opacity="${reaction}"/>`+text(490,380,'Energy for cell activities','能量供細胞活動',21);out+=tag(mix(480,335,reaction),mix(280,427,reaction),'CO₂','二氧化碳','#949aa4')+tag(mix(490,620,reaction),mix(285,427,reaction),'Water','水',colors.water);}
  out+=text(435,500,'Respiration: glucose and oxygen are used up','呼吸作用：消耗葡萄糖及氧',19);
 }else if(kind==='membrane'){
  for(let i=0;i<12;i++){const angle=-1.1+i*.17,end=[555+155*Math.cos(angle),270+125*Math.sin(angle)],p=q(t,.07+i*.017,.4+i*.023);out+=substrate(mix(82,end[0],p),mix(160+i%8*32,end[1],p),'fat',8);}
  const d=`M620 154 Q735 220 691 354`;out+=`<path d="${d}" pathLength="1" stroke="#b77d35" stroke-width="13" fill="none" stroke-dasharray="${reaction} 1"/>`+tag(475,440,'Membrane','細胞膜','#b77d35')+text(435,500,'Lipid is incorporated into the membrane','脂質被用作製造細胞膜',19);
 }else if(kind==='hormone'){for(let i=0;i<8;i++){const p=q(t,.04+i*.02,.4+i*.02);if(t<.64)out+=substrate(mix(82,430,p),mix(160+i%8*33,260,p),'fat',10*(1-q(t,.43,.64)));}for(let i=0;i<4;i++){const p=q(t,.6+i*.03,.86+i*.03);if(t>.53+i*.02)out+=dot(mix(450,82,p),mix(265+i*24,180+i*55,p),11,colors.hormone);}out+=tag(450,420,'Sex hormones','性激素',colors.hormone)+text(430,490,'Hormones enter blood to act on target organs','激素進入血液，對目標器官發揮作用',19);
 }else if(kind==='fat'){
  for(let i=0;i<9;i++){const p=q(t,.02+i*.018,.37+i*.025);if(p<1)out+=substrate(mix(82,430,p),mix(160+i%8*33,270,p),incoming,10)}
  out+=`<ellipse cx="445" cy="285" rx="${10+77*reaction}" ry="${10+64*reaction}" fill="#dfb359" stroke="#a97b36" stroke-width="3"/>`+tag(444,420,'Stored fat','儲存脂肪',colors.fat)+text(430,490,lip?'Lipids accumulate in a fat cell':'The liver converts excess glucose into lipids',lip?'脂質在脂肪細胞內累積':'肝將過量葡萄糖轉成脂質',19);
 }
 out+=key([[aa?'Amino acids':lip?'Lipids':'Glucose',aa?'氨基酸':lip?'脂質':'葡萄糖',colors[incoming]]]);return out;
}
function liverShape(){return `<path d="M340 143 Q405 90 513 122 Q582 140 670 120 Q740 128 720 175 Q610 196 545 273 Q480 315 371 325 Q337 308 340 143 Z" fill="#e8b29a" stroke="#8d5040" stroke-width="3"/>`+text(545,158,'Liver','肝',23)}
function regulation(s,t){if(s.situation==='protein')return deamination(t);const fast=s.situation==='fasting',signal=q(t,.18,.43),response=q(t,.43,.9);let out=text(410,35,fast?'Fasting: raise low blood glucose':'After a meal: lower high blood glucose',fast?'空腹：提高偏低的血糖':'餐後：降低偏高的血糖',23);
 out+=`<path d="M73 225 Q115 167 256 207 Q250 239 180 247 Q118 258 73 225 Z" fill="#efca86" stroke="#9e793b" stroke-width="3"/>`+text(165,160,'Pancreas','胰',22)+liverShape();
 out+=`<rect x="65" y="385" width="685" height="90" rx="30" fill="#f4dce0" stroke="#a95466" stroke-width="3"/>`+text(410,510,'Blood glucose','血液中的葡萄糖',21);
 const hormone=fast?'Glucagon':'Insulin',zh=fast?'升糖素':'胰島素';const spoints=[[170,280],[170,430],[680,430],[680,250],[580,250]],sp=signal*4,sj=Math.min(3,Math.floor(sp)),sf=sp-sj;out+=line('M170 250 V385','#a95466',10)+line('M680 430 V290 Q680 250 620 245','#a95466',10)+(t>.16?tag(mix(spoints[sj][0],spoints[sj+1][0],sf),mix(spoints[sj][1],spoints[sj+1][1],sf),hormone,zh,colors.hormone):'');
 const before=fast?3:15,after=8,count=Math.round(mix(before,after,response));for(let i=0;i<count;i++)out+=substrate(110+i*40,430,'glucose',10);
 for(let i=0;i<20;i++){const visible=fast?i/20<1-response*.7:i/20<.3+response*.7;const x=440+(i%5)*27,y=200+Math.floor(i/5)*24;if(visible)out+=substrate(x,y,'glucose',7);if(i%5&&visible)out+=line(`M${x-27} ${y} H${x}`,colors.glucose,3)}
 for(let i=0;i<6;i++){const p=q(t,.4+i*.025,.75+i*.025);if(p>0&&p<1)out+=substrate(mix(fast?510:400,fast?400:510,p),mix(fast?255:430,fast?430:255,p),'glucose',10)}
 out+=text(570,300,'Glycogen store','糖原儲存',20)+(t>.16?text(170,345,fast?'Glucagon increases':'Insulin increases',fast?'升糖素增加':'胰島素增加',20):'');
 out+=tag(670,515,response>.93?'Towards normal':fast?'Too low':'Too high',response>.93?'回復正常水平':fast?'偏低':'偏高',response>.93?'#39795d':'#a75842');
 out+=text(410,580,'Particle number shows relative change, not a measured concentration.','粒子數量只示意相對變化，並非實測濃度。',16);return out;
}
function deamination(t){let out=text(410,35,'Deamination in the liver','肝內的脫氨作用',25)+blood()+cell('Liver cell','肝細胞')+'<rect x="750" y="212" width="50" height="210" rx="19" fill="#dae8f4" stroke="#416faf" stroke-width="3"/>';const split=q(t,.35,.66),exported=q(t,.66,.96);
 for(let i=0;i<5;i++){const p=q(t,.03+i*.02,.32+i*.015),x=mix(82,355+i*36,p),y=mix(165+i*48,250,p);out+=dot(x,y,13,'#d9ad4d');if(split<1)out+=dot(x+mix(13,50,split),y-mix(12,65,split),9,colors.nitrogen);if(split===1){const xx=mix(x+50,775,exported),yy=mix(y-65,240+i*27,exported);out+=dot(xx,yy,10,colors.urea)}}
 out+=tag(440,330,'Remaining parts','其餘部分','#b58c36')+text(442,395,'Can form glucose, glycogen or lipids','可轉成葡萄糖、糖原或脂質',18)+tag(710,175,'Urea','尿素',colors.urea)+text(660,462,'Into hepatic vein','進入肝靜脈',20);
 out+=key([['Remaining parts','其餘部分','#d9ad4d'],['Nitrogenous part','含氮部分',colors.nitrogen],['Urea','尿素',colors.urea]]);return out;
}
function bile(t){const fill=q(t,.05,.4),release=q(t,.55,.95),g=1+.25*fill-.4*release;let out=text(410,35,'Bile: made, stored, then released','膽汁：製造、儲存、釋放',25)+liverShape();
 out+=line('M470 240 L470 337 L530 337 L530 440 L650 440','#899348',12)+`<ellipse cx="470" cy="350" rx="${30*g}" ry="${49*g}" fill="#c3ce8c" stroke="#62753f" stroke-width="3"/>`+`<path d="M650 380 Q745 380 745 445 Q745 510 650 510 L650 482 Q714 482 714 445 Q714 410 650 410 Z" fill="#edc5aa" stroke="#936c55" stroke-width="3"/>`;
 for(let i=0;i<10;i++){const p=q(t,.015*i,.25+.015*i);if(t<.53)out+=dot(470,mix(240,350,p),6,'#acac35');const a=i*2.4,r=17*Math.sqrt((i+1)/10);if(t>.12+i*.025&&release<.97)out+=dot(470+Math.cos(a)*r*g,350+Math.sin(a)*r*g,5,'#acac35')}
 for(let i=0;i<10;i++){const p=q(t,.54+i*.02,.76+i*.02);if(p>0){const points=[[470,350],[530,337],[530,440],[675,440]],k=p*3,j=Math.min(2,Math.floor(k)),f=k-j;out+=dot(mix(points[j][0],points[j+1][0],f),mix(points[j][1],points[j+1][1],f),5,'#acac35')}}
 const emulsify=q(t,.78,.98);if(emulsify<1)out+=dot(678,445,21*(1-emulsify),colors.fat);for(let i=0;i<7;i++){const a=i*2.4;if(emulsify>0)out+=dot(678+Math.cos(a)*20*emulsify,445+Math.sin(a)*19*emulsify,6*emulsify,colors.fat);}out+=text(410,585,emulsify>.4?'Bile emulsifies fat into smaller droplets':'Fat is present in the duodenum',emulsify>.4?'膽汁將脂肪乳化成較細小的油滴':'十二指腸內有脂肪',18);out+=text(280,350,'Gall bladder','膽囊',22)+line('M365 355 H435','#62753f',2)+text(565,395,'Bile duct','膽管',20)+text(670,545,'Duodenum','十二指腸',21)+text(240,462,release>.2?'Contracts and releases bile':'Stores bile from the liver',release>.2?'收縮並釋放膽汁':'儲存肝製造的膽汁',20);return out;
}
function stores(t){let out=text(410,35,'The liver stores useful substances','肝儲存有用物質',25)+blood()+cell('Liver cell','肝細胞');const names=[['Glycogen','糖原','#dea72d'],['Iron from RBC breakdown','紅血球分解所得的鐵','#a56d4e'],['Vitamins A D E K','維生素 A、D、E、K','#6b9d67']];
 names.forEach(([name,zh,c],row)=>{const y=205+row*95;out+=text(505,y-5,row===0&&t<.4?'Glucose':name,row===0&&t<.4?'葡萄糖':zh,row===1?17:20);for(let i=0;i<5;i++){const p=q(t,.03+i*.025,.44+row*.1+i*.03);out+=dot(mix(82,360+i*25,p),mix(180+i*45,y+40,p),9,c);if(row===0&&i>0&&p>.98)out+=line(`M${360+(i-1)*25} ${y+40} H${360+i*25}`,c,3)}});out+=text(420,507,'Stored materials remain available for later use','儲存物質可供日後使用',20);return out;
}
function carotene(t){let out=text(410,35,'The liver converts carotene into vitamin A','肝將胡蘿蔔素轉成維生素 A',24)+blood()+cell('Liver cell','肝細胞');for(let i=0;i<8;i++){const arrive=q(t,.03+i*.015,.38+i*.015),change=q(t,.43+i*.025,.7+i*.025),x=mix(82,370+i%4*43,arrive),y=mix(150+i*35,255+Math.floor(i/4)*43,arrive);out+=dot(x,y,12,change>.5?'#d3bd3b':'#e78d2e')}out+=tag(480,413,t>.57?'Vitamin A':'Carotene',t>.57?'維生素 A':'胡蘿蔔素',t>.57?'#a89532':'#d78023')+text(440,490,'Conversion occurs in liver cells; vitamin A can be stored','在肝細胞內轉換，維生素 A 可被儲存',19);return out;
}
function detox(t){let out=text(410,35,'Catalase breaks down hydrogen peroxide','過氧化氫酶分解過氧化氫',24)+cell('Liver cell','肝細胞');const process=q(t,.3,.8);
 out+=`<path d="M375 235 Q410 205 455 225 L445 252 L420 243 L400 267 Q372 270 375 235 Z" fill="#7da86d" stroke="#4b7742" stroke-width="3"/>`+text(420,315,'Catalase','過氧化氫酶',21);
 for(let i=0;i<6;i++){const p=q(t,.04+i*.02,.37+i*.02);if(t<.75)out+=dot(mix(250+i*24,420,p),mix(180+i%2*35,236,p),12*(1-process),'#ad83b4');if(process>0){out+=dot(mix(420,300+i*25,process),mix(236,400,process),8*process,colors.water)+(i%2===0?dot(mix(420,530+i*20,process),mix(236,400,process),8*process,colors.oxygen):'')}}
 out+=tag(295,450,'Water','水',colors.water)+tag(625,450,'Oxygen','氧','#6a9fab')+text(400,505,'The enzyme remains; it can be used again','酶保留，可重複使用',20)+text(420,538,'2 H₂O₂ → 2 H₂O + O₂','',19)+key([['Hydrogen peroxide','過氧化氫','#ad83b4'],['Catalase','過氧化氫酶','#7da86d']]);return out;
}
function board(mode,s){const t=clamp(s.phase||0);let body=mode==='fates'?assimilation(s,t):mode==='glucose'?regulation(s,t):+s.function===0?regulation(s,t):+s.function===1?stores(t):+s.function===2?(s.production==='carotene'?carotene(t):bile(t)):+s.function===3?deamination(t):detox(t);return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Guided ${mode}: named substances move and transform" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" rx="12" fill="#fffdf8"/>${body}</svg>`;}
class GuidedProcess{constructor(host){this.host=host}setState(mode,s){this.host.innerHTML=board(mode,s)}}
function teaching(mode,s){
 const fast=s.situation==='fasting';
 const glucose={where:'Liver 肝臟',labels:['Trigger 血糖改變','Hormone 激素','Response 回應'],steps:fast?['Blood glucose is low during fasting. 空腹時血糖偏低。','The pancreas releases more glucagon. The hormone travels in blood to the liver. 胰釋放更多升糖素，激素隨血液到肝。','Liver glycogen breaks down. Glucose enters blood and raises blood glucose towards normal. 肝糖原分解，葡萄糖進入血液，使血糖回升至正常。']:['After carbohydrate absorption, blood glucose is high. 吸收碳水化合物後，血糖偏高。','The pancreas releases more insulin. The hormone travels in blood to the liver. 胰釋放更多胰島素，激素隨血液到肝。','The liver takes up glucose and stores glycogen. Blood glucose falls towards normal. 肝攝取葡萄糖並儲存糖原，血糖回落至正常。']};
 const deam={where:'Liver cells 肝細胞',labels:['Amino acids 氨基酸','Remove nitrogen 脫氨','Urea 尿素'],steps:['Excess amino acids enter liver cells from blood. 過量氨基酸由血液進入肝細胞。','The nitrogenous portion separates. The remaining parts can be reused. 含氮部分被移除，其餘部分可再利用。','The nitrogenous portion forms urea. Urea leaves in the hepatic vein and is later excreted by kidneys. 含氮部分形成尿素，經肝靜脈離開，最後由腎排出。']};
 if(mode==='glucose')return s.situation==='protein'?deam:glucose;
 if(mode==='fates'){
  const kind=fateKind(s);if(kind==='deamination')return deam;
  const outcomes={hormone:['Lipids are used in hormone-producing cells to make sex hormones. 製造激素的細胞利用脂質製造性激素。','Sex hormones enter blood and act on their target organs. 性激素進入血液，對目標器官發揮作用。'],protein:['Amino acids join into a protein chain. 氨基酸連接成蛋白質鏈。','The proteins support growth and repair, or act as enzymes, antibodies or protein hormones. 蛋白質用於生長及修補，或作酶、抗體及蛋白質激素。'],glycogen:['Glucose units join to form glycogen in liver cells. 葡萄糖單位在肝細胞內連接成糖原。','Glycogen is a store that can later supply glucose. 糖原被儲存，日後可分解提供葡萄糖。'],energy:['Glucose and oxygen are used in respiration. 葡萄糖及氧參與呼吸作用。','Energy is released for cell activities; carbon dioxide and water are produced. 釋放能量供細胞活動，並產生二氧化碳及水。'],membrane:['Lipids are incorporated into the cell membrane. 脂質被用作製造細胞膜。','The membrane becomes part of the cell structure. 細胞膜成為細胞結構的一部分。'],fat:[s.nutrient.startsWith('Glucose')?'Excess glucose is converted into lipids in the liver. 過量葡萄糖在肝轉成脂質。':'Lipids accumulate inside a fat cell. 脂質在脂肪細胞內累積。','Lipids can be deposited around organs and stored in adipose tissue, including subcutaneous fat. 脂質可沉積在內臟周圍，並儲存於脂肪組織（包括皮下脂肪）。']};
  return {where:kind==='hormone'?'Hormone-producing cells 製造激素的細胞':kind==='glycogen'||kind==='fat'&&s.nutrient.startsWith('Glucose')?'Liver cells 肝細胞':kind==='fat'?'Fat cells 脂肪細胞':'Body cells 身體細胞',labels:['Uptake 攝取','Use or convert 利用／轉換','Result 結果'],steps:['Absorbed nutrients are taken up by cells from blood. 已吸收的營養素由血液被細胞攝取。',...outcomes[kind]]};
 }
 if(+s.function===0)return glucose;if(+s.function===3)return deam;
 if(+s.function===1)return {where:'Liver 肝臟',labels:['Uptake 攝取','Build stores 累積','Stored 儲存'],steps:['Glucose, iron and fat-soluble vitamins are taken up by the liver. 肝攝取葡萄糖、鐵及脂溶性維生素。','Glucose becomes glycogen; iron and vitamins A, D, E and K are stored. 葡萄糖轉成糖原；鐵及維生素 A、D、E、K 被儲存。','The stores remain available when the body needs them. 這些儲存物質可供身體日後使用。']};
 if(+s.function===2)return s.production==='carotene'?{where:'Liver cells 肝細胞',labels:['Carotene 胡蘿蔔素','Convert 轉換','Vitamin A 維生素A'],steps:['Carotene arrives in the liver. 胡蘿蔔素到達肝。','Liver cells convert carotene into vitamin A. 肝細胞將胡蘿蔔素轉成維生素 A。','Vitamin A can be stored in the liver. 維生素 A 可儲存在肝。']}:{where:'Liver → gall bladder → duodenum 肝 → 膽囊 → 十二指腸',labels:['Make 製造','Store 儲存','Release 釋放'],steps:['Liver cells produce bile. Watch bile enter the duct. 肝細胞製造膽汁，觀察膽汁進入膽管。','Bile collects in the gall bladder, which expands as it fills. 膽汁儲存在膽囊，膽囊隨充盈而增大。','The gall bladder contracts and bile enters the duodenum. Bile emulsifies fat; it is not a digestive enzyme. 膽囊收縮，膽汁進入十二指腸，乳化脂肪；膽汁不是消化酶。']};
 return {where:'Liver cells 肝細胞',labels:['Peroxide 過氧化氫','Catalase 酶作用','Products 產物'],steps:['Hydrogen peroxide is produced in cells and must be broken down. 細胞產生的過氧化氫需被分解。','Catalase breaks down hydrogen peroxide. Watch the substrate disappear. 過氧化氫酶分解過氧化氫，觀察底物減少。','Water and oxygen are produced. Catalase remains available for reuse. 產生水及氧，過氧化氫酶可重複使用。']};
}
const P=window.AnatomyScene?.prototype,T=window.THREE;
if(P&&T)P.buildHormoneUse=function(){
 this.homeZ=11;this.camera.position.set(0,0,this.homeZ);this.cellShell();
 const items=[];for(let i=0;i<8;i++){const m=new T.Mesh(new T.SphereGeometry(.105,12,8),new T.MeshStandardMaterial({color:'#d4923d'}));m.name='hormone-lipid-input';this.root.add(m);items.push(m)}
 const products=[];for(let i=0;i<4;i++){const m=new T.Mesh(new T.SphereGeometry(.12,12,8),new T.MeshStandardMaterial({color:'#488c7a'}));m.name='sex-hormone-product';this.root.add(m);products.push(m)}
 this.dynamic.push(t=>{items.forEach((m,i)=>{const p=q(t,.04+i*.02,.4+i*.02);m.position.set(mix(-3,0,p),mix(1.5-i*.3,.3,p),.8);m.visible=t<.64;});products.forEach((m,i)=>{const p=q(t,.6+i*.03,.86+i*.03);m.visible=t>.53+i*.02;m.position.set(mix(0,-3,p),mix(.3+i*.15,-1+i*.4,p),.8);});});
 this.label('Lipids 脂質',[-2,1,.8],{className:'gold'});this.label('Sex hormones 性激素',[-1,-.7,.8],{className:'green'});
};
window.GuidedProcess=GuidedProcess;window.guidedProcessSVG=board;window.guidedFateKind=fateKind;window.processTeaching=teaching;
})();
