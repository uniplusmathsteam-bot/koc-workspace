/* Detailed villi, staged routes, and separate application mechanisms. */
(() => {
'use strict';
const M=window.MechanismCore,{C,clamp,lerp,ramp,at,txt,path,circle,token,labelbox,svg,title}=M;
const adaptations={surface:['Large surface area','大表面積','Long intestine → folds → villi → microvilli.','小腸很長；摺疊、絨毛及微絨毛增加面積。'],wall:['One cell thick','只有一層細胞厚','A short route across the epithelium.','上皮只有一層，縮短運輸距離。'],blood:['Dense capillary network','密集微血管網','Blood flow carries solutes away and maintains a gradient.','血流帶走溶質，維持濃度梯度。'],lacteal:['Central lacteal','中央乳糜管','Lipid packages enter lymph, not portal blood first.','脂質微粒先進入淋巴，並非先入門靜脈。'],energy:['Mitochondria + carriers','線粒體及載體','ATP supports active transport in epithelial cells.','ATP 供上皮細胞主動運輸使用。'],mixing:['Fresh food at the surface','接觸新鮮食糜','Mixing renews contact with digested food.','腸的攪拌使表面接觸新的已消化食物。']};
function capillary(points,color=C.blood,w=15){return path(points,'#efd0d3',w+7)+path(points,color,w)}
function villusUnit(cx,base,height,width,t,options={}){
 const half=width/2,top=base-height,shoulder=top+half,left=cx-half,right=cx+half,pts=[[left,base],[left,shoulder]];
 for(let i=1;i<=22;i++){const a=Math.PI-i/22*Math.PI;pts.push([cx+half*Math.cos(a),shoulder-half*Math.sin(a)])}pts.push([right,base]);
 let o=`<path d="M${pts.map(p=>p.join(' ')).join(' L')} Z" fill="#fbe7d4" stroke="#d7ad91" stroke-width="2"/>`;
 if(options.highlight==='surface')o+=path(pts,'#deb763',31,'opacity=".35"');
 // Sample an actual surface contour into a SINGLE contiguous row of cells.
 const lengths=pts.slice(1).map((p,i)=>Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1])),length=lengths.reduce((a,b)=>a+b,0),n=Math.round(length/20);
 for(let i=0;i<n;i++){const a=at(pts,i/n),b=at(pts,(i+1)/n),mid=at(pts,(i+.5)/n),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,normal=[dy/l,-dx/l],p=[a,b,b,a].map((p,j)=>[p[0]+normal[0]*(j<2?11:-11),p[1]+normal[1]*(j<2?11:-11)]);
  o+=`<polygon data-epithelial-cell="true" points="${p.map(p=>p.join(',')).join(' ')}" fill="#efb8a3" stroke="#b97870" stroke-width="1.4"/>`+`<ellipse cx="${mid[0]}" cy="${mid[1]}" rx="4" ry="3" fill="#96728c"/>`;
  for(let j=0;j<4;j++){const p=at(pts,(i+(j+.5)/4)/n);o+=path([[p[0]+normal[0]*12,p[1]+normal[1]*12],[p[0]+normal[0]*23,p[1]+normal[1]*23]],'#a86c67',2,'data-microvillus="true"')}
 }
 const bx=cx-width*.28,rx=cx+width*.28,radius=width*.28,cy=top+width*.25+radius,cap=[[bx,base+24],[bx,cy]],lact=[[cx,top+height*.34],[cx,base+30]];
 for(let i=1;i<=24;i++){const a=Math.PI-i/24*Math.PI;cap.push([cx+radius*Math.cos(a),cy-radius*Math.sin(a)])}cap.push([rx,base+24]);
 const gradient=`cap-${Math.round(cx)}-${Math.round(base)}-${Math.round(height)}`;o+=`<defs><linearGradient id="${gradient}"><stop stop-color="#bd4b59"/><stop offset=".5" stop-color="#985f95"/><stop offset="1" stop-color="#437aa4"/></linearGradient></defs>`;
 if(options.highlight==='blood')o+=path(cap,'#e0c57d',29,'opacity=".65"');
 o+=capillary(cap,`url(#${gradient})`,10);for(let i=1;i<5;i++){const y=shoulder+(base-shoulder)*i/5;o+=capillary([[bx,y],[cx-20,y-9],[cx+20,y+9],[rx,y]],`url(#${gradient})`,5)}
 if(options.highlight==='lacteal')o+=path(lact,'#d6bf65',38,'opacity=".5"');
 o+=path(lact,'#71985b',25)+path(lact,'#e2edc8',17);
 if(options.highlight==='wall')o+=`<rect x="${right-12}" y="${base-180}" width="24" height="24" fill="none" stroke="#b8912d" stroke-width="4"/>`;
 for(let i=0;i<8;i++){const p=at(cap,(i/8+t*.2)%1);o+=`<ellipse data-villus-rbc="true" cx="${p[0]}" cy="${p[1]}" rx="4" ry="7" fill="#b14d62"/>`}
 if(options.active){
  const lipid=!!options.lipid,entryY=top+height*.61,entryPath=lipid?[[right+Math.min(90,width*.4),entryY],[right+12,entryY],[right-7,entryY],[cx+25,entryY],[cx,entryY],[cx,base+30]]:[[right+Math.min(90,width*.4),entryY],[right+12,entryY],[right-12,entryY],[rx+10,entryY],[rx,entryY],[rx,base+24]];
  // The cell carrier is at the actual epithelial ribbon. Small nutrients cross
  // the capillary wall locally; red cells never take this side-entry route.
  o+=path([[right-13,entryY-14],[right-13,entryY+14]],C.green,5)+path([[right+13,entryY-14],[right+13,entryY+14]],C.green,5);
  for(let i=0;i<5;i++){const route=entryPath.map(p=>[...p]);route.at(-1)[1]-=i*(lipid?18:12);const p=i<(options.count??5)?ramp(t,.06+i*.045,.68+i*.055):0,pos=at(route,p),packaged=lipid&&pos[0]<right-7;o+=token(pos[0],pos[1]+(p===0?(i-2)*15:0),lipid?'lipid':'glucose',`data-villus-solute="${i}" data-packaged="${packaged}"`,packaged?10:7)}
 }
 return o;
}
function villi(s,t){const a=s.adaptation||'surface',flat=s.flattened,lipid=a==='lacteal',height=flat?150:380;
 let o=title('Villi: see each adaptation and its function','絨毛：觀察每項適應及其作用');
 o+=labelbox(35,94,280,'Long small intestine','小腸很長')+labelbox(380,94,310,'Folded inner wall','內壁高度摺疊')+labelbox(755,94,325,'Villi + microvilli','絨毛及微絨毛');
 o+=path([[100,183],[130,169],[155,187],[185,169],[213,187],[245,173]],'#b78164',12)+path([[410,190],[438,162],[465,190],[492,162],[519,190],[547,162],[575,190],[605,163],[635,188]],'#b78164',9);
 o+=txt(700,238,'Intestinal lumen 腸腔','',19)+txt(130,276,'Many neighbouring villi','大量相鄰絨毛',18);
 o+='<rect x="50" y="663" width="670" height="44" rx="8" fill="#edc7b2" stroke="#c09174"/>';
 o+=villusUnit(122,665,flat?100:220,82,t)+villusUnit(266,665,flat?120:290,105,t);
 const rotation=a==='mixing'?Math.sin(t*Math.PI*2)*1.5:0;o+=`<g transform="rotate(${rotation} 520 665)">`+villusUnit(520,665,height,200,t,{active:true,lipid,highlight:a})+'</g>';
 o+=path([[75,352],[370,352],[405,380]],'#8c6d66',1.5)+txt(70,326,'Microvilli','微絨毛',18,'start');
 o+=path([[70,252],[350,252],[420,430]],'#8c6d66',1.5)+txt(40,215,'Single epithelial layer','單層上皮',18,'start');
 o+=txt(445,715,'Arteriole in','小動脈流入',15,'middle',C.blood)+txt(635,715,'Venule out','小靜脈流出',15,'middle',C.blue);
 o+=txt(525,760,lipid?'Lacteal → lymph 乳糜管 → 淋巴':'Capillaries → portal vein 微血管 → 肝門靜脈','',17);
 o+=`<rect x="770" y="275" width="315" height="420" rx="16" fill="#f1f5ee" stroke="#b2c5ad"/>`+txt(928,308,'One epithelial cell: enlarged','一個上皮細胞的放大圖',20);
 o+='<rect x="820" y="380" width="210" height="186" rx="12" fill="#f4d0b6" stroke="#aa7b68" stroke-width="3"/>';
 for(let i=0;i<17;i++)o+=path([[826+i*12,380],[826+i*12,351]],'#a96d65',4);
 o+=`<ellipse cx="965" cy="502" rx="28" ry="22" fill="#baa0ba"/>`;
 for(let i=0;i<4;i++){const x=846+i%2*57,y=420+Math.floor(i/2)*75;o+=`<ellipse cx="${x}" cy="${y}" rx="22" ry="11" fill="#cc8a76" stroke="#a26755"/>`+path([[x-15,y],[x-7,y-5],[x,y+5],[x+8,y-5],[x+15,y]],'#f7d6ba',2)}
 o+=path([[882,565],[882,591]],C.green,11)+txt(1010,613,'Carrier 載體','',16,'end')+txt(917,643,'Mitochondria supply ATP','線粒體提供 ATP',17);
 o+=txt(700,370,'Capillaries','微血管',17)+path([[688,395],[575,446]],C.blood,1.5)+txt(700,616,'Lacteal','乳糜管',17)+path([[680,627],[520,627]],'#789256',1.5);
 if(a==='energy'){const p=at([[847,420],[882,475],[882,565]],ramp(t,.12,.7));o+=token(...p,'#c4a52f','data-atp="true"',9)+txt(850,600,'ATP','',15)}
 const ad=adaptations[a];o+=txt(928,720,ad[0],ad[1],19)+txt(560,789,'Glucose → capillaries; most long-chain fat → lacteals. Fibre stays in the lumen.','',17);
 return o;
}
function bedPoints(x,y,w,h){const out=[];for(let i=0;i<=40;i++){const p=i/40;out.push([x+w-w*p,y+h/2+Math.sin(p*Math.PI*2)*h*.16])}return out}
function bed(x,y,w,h,id){let o=`<g data-bed="${id}">`;for(let i=0;i<5;i++){const p=bedPoints(x,y-20+i*10,w,h);o+=path(p,'#995d94',4)}o+=path([[x,y+h/2-20],[x,y+h/2+20]],'#995d94',6)+path([[x+w,y+h/2-20],[x+w,y+h/2+20]],'#995d94',6);return o+'</g>'}
const transportRoutes={
 gut:bedPoints(460,570,240,75),portal:[[460,607.5],[360,607.5],[360,445],[770,445],[770,390],[700,390],[700,367.5]],
 liver:[[700,367.5],[700,347.5],...bedPoints(460,310,240,75)],return:[[460,347.5],[120,347.5],[120,165],[820,165]],
 lymph:[[590,685],[1080,685],[1080,90],[700,90],[700,165],[820,165]]
};
function route(s,t){const lipid=s.route==='lipid',r=transportRoutes;let o=title(lipid?'Follow fat from a lacteal to venous blood':'Follow absorbed glucose through two capillary beds',lipid?'追蹤脂質由乳糜管到靜脈血':'追蹤葡萄糖經過兩組微血管');
 o+='<path d="M430 330 Q425 265 550 285 Q650 260 735 305 Q752 345 715 387 Q638 405 590 398 Q510 433 450 400 Q423 380 430 330Z" fill="#ebc4b2" stroke="#aa7960" stroke-width="2"/><path d="M430 575 Q580 540 730 575 V650 Q580 690 430 650Z" fill="#f5e1c3" stroke="#b59a74" stroke-width="2"/>';
 const art=[[920,165],[995,165],[995,610],[700,610]],ha=[[995,327.5],[700,327.5]];
 o+=path(art,'#fff',20)+path(art,'#c04d4d',14)+path(ha,'#c04d4d',12)+path(r.portal,'#5479a3',12)+path(r.return,'#5479a3',14)+bed(460,570,240,75,'intestine')+bed(460,310,240,75,'liver');
 o+='<path d="M820 165 C815 140 832 124 852 140 L865 151 C880 118 910 126 920 165 C923 187 901 206 875 220 C850 209 821 192 820 165Z" fill="#edb1b5" stroke="#9c5c68" stroke-width="3"/>'+txt(870,163,'Heart','心臟',20);
 o+=txt(580,258,'Liver capillaries','肝微血管（血竇）',21)+txt(580,520,'Intestinal capillaries','小腸微血管',21)+txt(550,475,'Hepatic portal vein 肝門靜脈','',19)+path([[550,460],[550,445]],'#5479a3',1.5);
 o+=txt(220,320,'Hepatic vein 肝靜脈','',18)+txt(245,239,'Vena cava','腔靜脈',18)+path([[200,270],[120,270]],'#5479a3',1.5)+txt(1040,270,'Aorta','主動脈',18)+txt(870,275,'Hepatic artery','肝動脈',17)+path([[870,307],[870,327.5]],'#b85c57',1.5);
 if(lipid){o+=path(r.lymph.slice(0,-1),'#fff',19)+path(r.lymph.slice(0,-1),'#9caa45',10,'data-lymph-vessel="true"')+txt(960,650,'Lymph vessels','淋巴管',19)+path([[1040,668],[1080,680]],'#8c994e',1.5)+txt(580,710,'Lacteal 乳糜管','',19)+txt(490,110,'Left venous junction','左靜脈角',18)+path([[590,140],[700,165]],'#667b57',1.5)+circle(700,165,7,'#9caa45','stroke="#fff" stroke-width="2"');}
 const phases=lipid?[r.lymph]:[r.gut,r.portal,r.liver,r.return],stops=lipid?[0,1]:[0,.23,.52,.72,1];let k=0;while(k<phases.length-1&&t>stops[k+1])k++;const p=at(phases[k],(t-stops[k])/(stops[k+1]-stops[k]));
 o+=circle(...p,19,'#fff','stroke="#d4b257" stroke-width="2"')+token(...p,lipid?'lipid':'glucose','data-followed-nutrient="true"',11);
 for(const [j,points]of [art,ha,r.return].entries())for(let i=0;i<5;i++){const p=at(points,(i/5+t*.18)%1);o+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="6" ry="4" fill="${j===2?'#8f597e':'#b93b4e'}"/>`}
 o+=txt(560,757,'The white ring tracks ONE selected nutrient. Small red ovals are blood cells.','白色光圈追蹤一粒選定的營養素；細小紅橢圓是紅血球。',18)+txt(560,795,'Heart detail omitted: right heart → lungs → left heart → aorta. Layout is schematic.','',15);return o;
}
function comparePanel(x,titleEn,titleZh){return `<rect x="${x}" y="155" width="490" height="515" rx="18" fill="#f6f4eb" stroke="#d6d9c8"/>`+txt(x+245,190,titleEn,titleZh,22)}
function coeliac(s,t){let o=title('Coeliac disease: immune damage reduces absorption','乳糜瀉：免疫反應損害絨毛，減少吸收')+comparePanel(45,'Healthy villi','正常絨毛')+comparePanel(585,'Affected villi','受損絨毛');
 const damage=ramp(t,.24,.65);for(const [x,damaged]of [[45,false],[585,true]]){const base=570,h=damaged?lerp(235,75,damage):235;o+=path([[x+30,600],[x+455,600]],C.blood,20);for(let i=0;i<3;i++)o+=villusUnit(x+95+i*145,base,h,68,ramp(t,.65,1),{active:true,count:damaged?1:5});}
 if(t>.1)o+=txt(830,271,'Gluten triggers an immune response','麩質引發免疫反應',18);
 o+=txt(285,701,'Larger surface → more uptake','較大表面積 → 較多吸收',20)+txt(830,701,'Flattening → less uptake','絨毛扁平 → 吸收減少',20)+txt(560,774,'Unabsorbed solutes retain water in the intestine: diarrhoea can result.','未吸收的溶質令水留在腸內，可導致腹瀉。',19);return o;
}
function lactose(s,t){let o=title('Lactose intolerance: missing digestion before absorption','乳糖不耐症：消化不足，乳糖留在腸內');const normal=s.diseaseComparison==='healthy',split=normal?ramp(t,.3,.55):0;
 o+='<rect x="75" y="170" width="970" height="315" rx="20" fill="#fbefd3" stroke="#c5a681" stroke-width="3"/>'+txt(145,207,'Intestinal lumen','腸腔',21,'start');
 // A continuous epithelial row separates lumen from the lower blood channel.
 for(let i=0;i<22;i++)o+=`<rect x="${75+i*44}" y="485" width="43" height="59" fill="#f2bfa4" stroke="#b07c6e" stroke-width="1.5"/>`+circle(95+i*44,521,5,'#9b7898');
 for(let x=85;x<1040;x+=12)o+=path([[x,485],[x,472]],'#ae746a',2);
 o+='<rect x="75" y="589" width="970" height="57" fill="#eed5da" stroke="#a56b7b"/>'+txt(150,683,'Blood capillary','微血管',19,'start');
 for(const x of [400,600,880]){o+=path([[x-12,478],[x-12,549]],C.green,5)+path([[x+12,478],[x+12,549]],C.green,5);if(normal&&x!==880)o+=`<path d="M${x-22} 461 l12-20 h20 l12 20Z" fill="#55937b"/>`}
 for(let i=0;i<5;i++){const p=ramp(t,.03+i*.03,.25+i*.035),x=lerp(230+i*120,normal?400:450+i*35,p),y=lerp(290+i%2*40,449,p),progress=normal?ramp(t,.28+i*.045,.78+i*.045):0,a=at([[x-9,y],[400,457],[400,516],[400,565],[400,615],[430+i*37,615]],progress),b=at([[x+9,y],[600,457],[600,516],[600,565],[600,615],[650+i*37,615]],progress);
  o+=token(...a,'glucose',`data-lactose-unit="${i}-a"`,9)+token(...b,'#a8779d',`data-lactose-unit="${i}-b"`,9);if(progress===0)o+=path([[x-7,y],[x+7,y]],'#8c7466',3,'data-lactose-bond="true"');}
 if(!normal){const r=ramp(t,.56,1);o+=`<rect x="77" y="${483-86*r}" width="966" height="${86*r}" fill="#9dd6e5" opacity=".42"/>`;for(let i=0;i<8;i++){const q=at([[865+i%3*12,570+i%2*8],[880,545],[880,485],[880,420]],ramp(t,.56+i*.025,.8+i*.025));o+=token(...q,'water','data-retained-water="true"',6)}o+=txt(800,340,'Lactose remains unabsorbed','乳糖未被消化及吸收',20)+txt(820,397,'Water retained in lumen','水留在腸腔',18)}
 o+=txt(290,578,normal?'Lactase splits lactose':'Too little lactase',normal?'乳糖酶分解乳糖':'乳糖酶不足',20)+txt(560,742,normal?'Glucose and galactose cross epithelial cells, then enter blood.':'Undigested lactose can reach the colon; bacteria produce gas and extra fluid.',normal?'葡萄糖及半乳糖穿過上皮細胞，再進入血液。':'未消化的乳糖可到達結腸，細菌產生氣體及增加液體。',18)+txt(560,793,'Water transfer is schematic; this is not a model of every intestinal transporter.','',15);return o;
}
function pancreatic(s,t){const blocked=s.diseaseComparison!=='healthy';let o=title('Pancreatic duct: enzymes must reach the intestinal lumen','胰管：消化酶必須到達腸腔');o+='<path d="M110 285 Q180 210 370 255 L410 300 Q245 360 110 320Z" fill="#e9c487" stroke="#a88246" stroke-width="3"/>'+txt(245,230,'Pancreas','胰臟',23);
 const duct=[[300,300],[620,300],[620,460],[970,460],[970,490]];o+=path(duct,'#ad9165',26)+path(duct,'#f6efda',17);
 o+='<path d="M760 370 Q970 370 970 490 Q970 620 760 620" fill="none" stroke="#bb8d6c" stroke-width="82"/><path d="M760 370 Q970 370 970 490 Q970 620 760 620" fill="none" stroke="#fbefcf" stroke-width="62"/>';
 if(blocked)o+=path([[500,281],[500,319]],'#a34346',14)+txt(500,244,'Blocked duct','胰管阻塞',21);
 for(let i=0;i<8;i++){const points=blocked?[[300,300],[479,300]]:duct,p=at(points,ramp(t,.03+i*.02,.55+i*.02));o+=token(...p,'green','data-pancreatic-enzyme="true"',7)}
 const reaction=blocked?0:ramp(t,.64,1);if(reaction<1)o+=token(970,490,'lipid','data-undigested-fat="true"',24*(1-reaction));if(reaction>0)for(let i=0;i<6;i++)o+=token(970+Math.cos(i*2.4)*16,490+Math.sin(i*2.4)*16,'lipid','data-fat-products="true"',6*reaction);
 o+=txt(820,689,'Duodenum','十二指腸',22)+txt(430,507,blocked?'Enzymes stop before the obstruction':'Enzymes arrive and digest food',blocked?'消化酶不能通過阻塞位置':'消化酶到達腸腔並消化食物',19)+txt(560,755,blocked?'Less fat digestion → more fat in faeces; protein digestion is also reduced.':'Pancreatic juice supplies lipase, proteases and other digestive enzymes.',blocked?'脂肪消化減少 → 糞便脂肪增加；蛋白質消化亦減少。':'胰液提供脂肪酶、蛋白酶及其他消化酶。',18);return o;}
function cirrhosis(s,t){const affected=s.diseaseComparison!=='healthy',damage=affected?ramp(t,.08,.55):0;let o=title('Liver cirrhosis: scar tissue replaces functioning tissue','肝硬化：疤痕組織取代正常功能組織');o+='<path d="M160 230 Q270 135 440 180 Q570 220 650 195 Q735 240 650 390 Q500 460 220 425 Q140 395 160 230Z" fill="#e4b19b" stroke="#925f4e" stroke-width="4"/>';
 for(let i=0;i<24;i++){const x=220+i%6*64,y=245+Math.floor(i/6)*44;o+=`<ellipse cx="${x}" cy="${y}" rx="26" ry="17" fill="${i<24*(1-damage*.65)?'#cf8f79':'#c5b6aa'}" stroke="#f3d6c7" stroke-width="2"/>`}
 if(damage>0)for(let i=0;i<5;i++)o+=path([[210+i*90,200],[240+i*85,280],[210+i*90,410]],'#ead8b5',4+damage*8);
 const duct=[[610,405],[700,460],[895,460]];o+=path(duct,'#85954d',14);const count=affected?Math.round(10-damage*7):10;for(let i=0;i<count;i++){const p=at(duct,ramp(t,.56+i*.02,.8+i*.02));o+=token(...p,'#8ea23a','data-cirrhosis-bile="true"',6)}
 o+=txt(430,505,'Functional liver tissue','有功能的肝組織',22)+labelbox(795,340,260,affected?'Reduced bile output':'Normal bile output',affected?'膽汁製造減少':'正常膽汁製造',C.green)+txt(560,694,'The supplied question also associates cirrhosis with anaemia.','原題亦將肝硬化與貧血聯繫。',19)+txt(560,755,'This illustrates reduced liver function; anaemia may have several different causes.','此圖示意肝功能受損；貧血可有不同成因。',17);return o;}
function deficiency(s,t){let o=title('Malabsorption can cause nutrient deficiencies','吸收不良可造成營養缺乏');const iron=s.deficiency!=='vitaminC';o+=labelbox(80,160,315,iron?'Iron not absorbed efficiently':'Vitamin C not absorbed efficiently',iron?'鐵未被有效吸收':'維生素 C 未被有效吸收')+labelbox(700,160,330,iron?'Less haemoglobin formed':'Impaired collagen maintenance',iron?'血紅蛋白製造減少':'膠原蛋白維持受影響');
 o+='<rect x="410" y="382" width="275" height="36" fill="#f0d4da" stroke="#b77a89"/>'+txt(550,457,'Absorbed portion in blood','已吸收而進入血液的部分',16);for(let i=0;i<10;i++){const p=i<3?at([[425+i*20,400],[665,400]],ramp(t,.05+i*.01,.65)):[170+i%4*38,300+Math.floor(i/4)*55];o+=token(...p,iron?'#9c654a':'green','data-deficiency-nutrient="true"',8)}
 if(iron){for(let i=0;i<8;i++){const pale=t>.65&&i>2;o+=`<ellipse cx="${740+i%4*70}" cy="${360+Math.floor(i/4)*100}" rx="26" ry="18" fill="${pale?'#edcbd0':'#b3475b'}" stroke="#b77886" stroke-width="2"/>`}o+=txt(865,540,'Anaemia: reduced oxygen-carrying capacity','貧血：攜氧能力下降',19)}else{for(let i=0;i<6;i++){const x=750+i*38;o+=path([[x,330],[x+10,370],[x,410],[x+10,450],[x,490]],t>.65&&i%2?'#dcc4b5':'#b6927d',t>.65?3:7)}o+=txt(860,540,'Scurvy: weakened connective tissue','壞血病：結締組織受影響',19)}
 o+=txt(560,690,'Case-study consequence; deficiency can also have other causes.','此為個案的後果；營養缺乏亦可有其他成因。',19)+txt(560,750,iron?'Iron is needed to make haemoglobin in developing red blood cells.':'Vitamin C supports normal collagen formation and maintenance.',iron?'發育中的紅血球需要鐵來製造血紅蛋白。':'維生素 C 支持正常膠原蛋白形成及維持。',18);return o;}
function transportProcesses(s,t){const kind=s.transportProcess||'diffusion',active=kind==='active',water=kind==='osmosis';let o=title(water?'Osmosis: water crosses a selectively permeable membrane':active?'Active transport: carriers use cellular energy':'Diffusion: net movement down a concentration gradient',water?'滲透：水經選擇透性膜移動':active?'主動運輸：載體利用細胞能量':'擴散：淨移動由高濃度至低濃度');o+='<rect x="120" y="200" width="880" height="370" rx="20" fill="#f1f5ed" stroke="#bac9b3"/>'+path([[560,200],[560,570]],'#ad9475',12);const count=active?5:12;for(let side=0;side<2;side++){const countHere=(active||water)?(side?15:3):(side?3:15);for(let i=0;i<countHere;i++){const x=(side?680:200)+i%4*48,y=255+Math.floor(i/4)*73;o+=token(x,y,'#9c6b92','data-solute-background="true"',8)}}
 for(let i=0;i<count;i++){const points=active?[[290,310+i%3*70],[560,400],[780,310+i%3*70]]:[[290,310+i%3*70],[560,400],[780,310+i%3*70]],p=at(points,ramp(t,.08+i*.02,.7+i*.02));o+=token(...p,water?'water':'glucose','data-process-solute="true"',8)}
 o+=path([[544,370],[544,430]],C.green,10)+path([[576,370],[576,430]],C.green,10)+txt(320,645,active?'Lower concentration':water?'Higher water potential':'Higher concentration',active?'較低濃度':water?'較高水勢':'較高濃度',21)+txt(800,645,active?'Higher concentration':water?'Lower water potential':'Lower concentration',active?'較高濃度':water?'較低水勢':'較低濃度',21);
 if(active)o+=labelbox(470,480,180,t>.35?'ATP used':'ATP available',t>.35?'消耗 ATP':'ATP 供能','#a08a32');else o+=txt(560,744,'Both directions occur; the highlighted particles show NET movement.','分子會雙向移動；高亮粒子示意淨移動方向。',18);return o;}
function experiments(s,t){const which=s.experiment||'lipase';if(which==='microscopy')return villi({...s,adaptation:'energy'},t);if(which==='dialysis'){let o=title('Dialysis tubing: small molecules cross, large molecules stay','透析管：小分子可穿過，大分子留在管內');o+='<rect x="100" y="200" width="920" height="400" rx="20" fill="#e4f1f7" stroke="#759daf"/><rect x="340" y="260" width="420" height="270" rx="30" fill="#f8e5c3" stroke="#b29369" stroke-width="6" stroke-dasharray="10 8"/>';for(let i=0;i<7;i++){const p=at([[430+i%3*60,320+i%2*65],[760,405],[890,360+i*15]],ramp(t,.1+i*.02,.75+i*.02));o+=token(...p,'glucose','data-dialysis-small="true"',8);o+=path([[420+i*27,460],[430+i*27,447],[440+i*27,461],[450+i*27,447]],'#886e97',7)}o+=txt(550,570,'Starch stays inside','澱粉留在管內',21)+txt(550,690,'Surrounding solution represents blood; rinse the tubing before the experiment.','外面溶液代表血液；實驗前先沖洗透析管。',18)+txt(550,755,'This model demonstrates permeability; it cannot model active transport in living cells.','此模型示範透性，不能模擬活細胞的主動運輸。',17);return o;}
 let o=title('Lipase practical: more exposed surface speeds digestion','脂肪酶實驗：較大接觸面積加快消化');for(const [x,bile]of [[280,false],[820,true]]){o+=`<rect x="${x-210}" y="180" width="420" height="410" rx="30" fill="#f0eee3" stroke="#bcc5b3"/>`+txt(x,220,bile?'With bile salts':'Without bile salts',bile?'有膽鹽':'沒有膽鹽',23);const r=ramp(t,.38,bile?.8:1.6);for(let i=0;i<(bile?9:1);i++){const a=i*2.4,rad=bile?20:60;if(r<1)o+=token(x+Math.cos(a)*(bile?65:0),370+Math.sin(a)*(bile?65:0),'lipid','data-practical-fat="true"',rad*(1-r));if(r>0)o+=token(x-80+i*20,500,'#a68144','data-fatty-acid="true"',7*r)}for(let i=0;i<5;i++){const a=i*2.4+t*3;o+=token(x+Math.cos(a)*90,370+Math.sin(a)*90,'green','data-lipase="true"',8)}}o+=txt(560,660,'Fatty acids form → pH falls. The enzyme is not used up.','產生脂肪酸 → pH 下降；酶不被消耗。',21)+txt(560,740,'Compare the same temperature, enzyme amount and initial fat amount.','比較時保持相同溫度、酶量及最初脂肪量。',18);return o;}
function application(s,t){return ({coeliac,lactose,pancreatic,cirrhosis,deficiency,processes:transportProcesses,experiments}[s.application||'coeliac']||coeliac)(s,t)}
window.LearningDiagrams={adaptations,villusUnit,villi,route,transportRoutes,application,coeliac,lactose,pancreatic,cirrhosis,deficiency,transportProcesses,experiments};
})();
