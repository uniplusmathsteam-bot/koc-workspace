/* Systemic circulation at course level: a portal vein joins TWO capillary beds. */
(() => {
'use strict';
const red='#cb3540',blue='#416faf',purple='#98639b',lymph='#cbbd36';
const label=(x,y,en,zh='',size=21)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#222" font-size="${size}" font-family="Arial,Microsoft JhengHei,sans-serif">${en}${zh?`<tspan x="${x}" dy="24" font-size="${size*.84}">${zh}</tspan>`:''}</text>`;
const vessel=(d,color,w=15)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
function bed(x,y,w,h,id){let svg=`<g data-capillary-bed="${id}" aria-label="${id} capillary network">`;for(let i=0;i<5;i++){const yy=y+10+i*(h-20)/4;svg+=vessel(`M${x+w} ${y+h/2} Q${x+w-20} ${yy} ${x+w-35} ${yy} C${x+w*.64} ${yy-13} ${x+w*.4} ${yy+13} ${x+35} ${yy} Q${x+15} ${yy} ${x} ${y+h/2}`,purple,4)}for(let i=1;i<4;i++)svg+=vessel(`M${x+w*i/4} ${y+10} Q${x+w*i/4+16} ${y+h/2} ${x+w*i/4} ${y+h-10}`,purple,3);return svg+'</g>'}
// Sample the SAME Bezier centreline drawn by bed(), rather than taking a
// shortcut across the capillary network. Middle branch, right-to-left flow.
function bedPoints(x,y,w,h){const yy=y+h/2,out=[],q=(a,b,c,t)=>a*(1-t)**2+2*b*(1-t)*t+c*t*t,c=(a,b,c,d,t)=>a*(1-t)**3+3*b*(1-t)**2*t+3*c*(1-t)*t*t+d*t**3;
 for(let i=0;i<=8;i++){const t=i/8;out.push([q(x+w,x+w-20,x+w-35,t),yy])}
 for(let i=1;i<=24;i++){const t=i/24;out.push([c(x+w-35,x+w*.64,x+w*.4,x+35,t),c(yy,yy-13,yy+13,yy,t)])}
 for(let i=1;i<=8;i++){const t=i/8;out.push([q(x+35,x+15,x,t),yy])}return out}
function particles(points,t,color,count=8,triangle=false){let out='';for(let i=0;i<count;i++){const p=((t+i/count)%1)*(points.length-1),j=Math.min(Math.floor(p),points.length-2),f=p-j,[a,b]=[points[j],points[j+1]],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f;out+=triangle?`<path d="M${x} ${y-6} l-6 11 h12 Z" fill="${color}" stroke="#fff"/>`:`<circle cx="${x}" cy="${y}" r="5" fill="${color}" stroke="#fff"/>`}return out}
function arrow(x,y,angle,color='#fff'){return `<path d="M-6 -5 L0 0 L-6 5" transform="translate(${x} ${y}) rotate(${angle})" stroke="${color}" stroke-width="2.5" fill="none"/>`}
const graph={nodes:{heart:'heart',intestine:'capillary-bed',liver:'capillary-bed',body:'capillary-bed'},edges:[{from:'heart',to:'intestine',type:'artery',name:'Intestinal artery'},{from:'heart',to:'liver',type:'artery',name:'Hepatic artery'},{from:'heart',to:'body',type:'artery',name:'Systemic artery'},{from:'intestine',to:'liver',type:'vein',name:'Hepatic portal vein'},{from:'liver',to:'heart',type:'vein',name:'Hepatic vein / vena cava'},{from:'body',to:'heart',type:'vein',name:'Systemic vein / vena cava'}]};
function circulation(s,t){const lipid=s.route==='lipid';let o='<svg viewBox="0 0 960 780" role="img" aria-label="Systemic circulation: arteries, veins, and intestinal and liver capillary beds" xmlns="http://www.w3.org/2000/svg">';o+='<rect width="960" height="780" fill="#fff"/>';
 o+=label(480,30,'Blood supply of the intestine and liver','小腸及肝的血液供應',25);
 o+=`<rect x="118" y="52" width="724" height="52" rx="10" fill="${lipid?'#e8edd3':'#dceaf7'}" stroke="${lipid?'#8c994e':'#5479a3'}" stroke-width="2.5"/>`;
 o+=label(480,78,lipid?'Lipid-soluble route 脂溶性途徑':'Water-soluble route 水溶性途徑',lipid?'Lacteal → lymph → venous junction → heart 乳糜管 → 淋巴 → 左靜脈角 → 心': 'Villus capillaries → portal vein → liver → heart 絨毛微血管 → 肝門靜脈 → 肝 → 心',19);
 // Separate arterial supply and venous return, with branches to every bed.
 o+=vessel('M520 110 H870 V550 H790',red)+vessel('M870 210 H550',red)+vessel('M870 450 H530',red);
 o+=vessel('M330 210 H100 V110 H440',blue)+vessel('M700 550 H100 V210',blue);
 // Two serial capillary beds, linked by the portal vein.
 o+='<rect x="310" y="155" width="260" height="110" rx="38" fill="#fae6db" stroke="#a36648" stroke-width="2"/>';
 o+='<path d="M310 390 Q420 365 550 390 L550 490 Q420 515 310 490 Z" fill="#fcf0dc" stroke="#a68b5d" stroke-width="2"/>';
 o+=vessel('M330 450 H285 V315 H590 V230 H550 V210',blue,13);
 o+=bed(330,175,220,70,'liver')+bed(330,415,200,70,'intestine')+bed(700,515,90,70,'body');
 // A stylized heart; the lung circuit is outside this systemic diagram.
 o+='<path d="M480 93 C450 60 425 100 443 124 L480 151 L517 124 C535 100 510 60 480 93 Z" fill="#d47576" stroke="#693c3e" stroke-width="2"/>';
 o+=label(480,737,'Heart detail omitted: right heart → lungs → left heart','心臟圖示省略：右心 → 肺 → 左心',18);
 o+=label(585,145,'Heart 心臟','',18)+label(267,165,'Liver','肝',22)+label(440,286,'Liver capillaries','肝微血管',19)+label(430,383,'Small intestine 小腸','',22)+label(430,515,'Intestinal capillaries','小腸微血管',19)+label(750,613,'Body capillaries','身體微血管',19);
 o+=label(180,247,'Hepatic vein','肝靜脈',20)+label(724,179,'Hepatic artery','肝動脈',20)+label(725,414,'Intestinal artery','小腸動脈',19)+label(440,343,'Hepatic portal vein 肝門靜脈','',21);
 o+=label(178,380,'Vena cava','腔靜脈',20)+label(900,325,'Aorta','主動脈',20);
 o+=arrow(730,210,180)+arrow(740,450,180)+arrow(870,350,90)+arrow(190,210,180)+arrow(100,325,-90)+arrow(200,110,0)+arrow(420,315,0)+arrow(590,270,-90)+arrow(450,550,180);
 // Moving blood enters both capillary beds and the hepatic portal vein in order.
 o+=particles([[520,110],[870,110],[870,210],...bedPoints(330,175,220,70),[100,210],[100,110],[440,110]],t,'#f6d6cf',11);
 if(!lipid)o+=label(430,595,'1 Capillaries','① 微血管',17)+label(338,395,'2 Portal vein','② 肝門靜脈',17)+label(520,195,'3 Liver','③ 肝',17)+label(155,300,'4 Hepatic vein → vena cava → heart','④ 肝靜脈 → 腔靜脈 → 心',16);
 o+=particles([[870,450],...bedPoints(330,415,200,70),[285,450],[285,315],[590,315],[590,230],[550,230],...bedPoints(330,175,220,70),[100,210],[100,110],[440,110]],t,lipid?'#f6d6cf':'#c5cf25',18);
 o+=particles([[870,550],...bedPoints(700,515,90,70),[100,550],[100,110],[440,110]],t,'#f6d6cf',8);
 if(lipid){const d='M430 480 H640 V80 H350 V110 H440';o+=vessel(d,'#fff',15)+vessel(d,lymph,8)+particles([[430,480],[640,480],[640,80],[350,80],[350,110],[440,110]],t,'#2e9b91',10,true)+`<circle cx="350" cy="110" r="7" fill="${lymph}" stroke="#fff"/>`+label(520,680,'1 Lacteal','① 乳糜管',17)+label(746,310,'2 Lymph vessels','② 淋巴管',19)+label(740,352,'3 Left venous junction → heart','③ 左靜脈角 → 心',16)+label(255,248,'Liver bypassed first','先不經肝',17);}
 o+=label(480,655,'Portal vein: capillary bed → vein → capillary bed','肝門靜脈：小腸微血管 → 靜脈 → 肝微血管',21);
 o+=`<path d="M90 690 H125" stroke="${red}" stroke-width="8"/>`+label(280,696,'Artery: away from heart 動脈：離心','',19)+`<path d="M490 690 H525" stroke="${blue}" stroke-width="8"/>`+label(710,696,'Vein: towards heart 靜脈：回心','',19);
 return o+'</svg>';
}
function comparison(s,t){let o='<svg viewBox="0 0 960 660" role="img" aria-label="Artery and vein comparison: flow direction, wall, lumen and valves in a limb vein" xmlns="http://www.w3.org/2000/svg"><rect width="960" height="660" fill="#fff"/>';
 o+=label(480,34,'Arteries and veins 動脈與靜脈','',27)+label(260,95,'Artery 動脈','Away from heart 離心',26)+label(700,95,'Vein 靜脈','Towards heart 回心',26);
 o+='<rect x="175" y="165" width="130" height="235" rx="12" fill="#efb1a5" stroke="#943d42" stroke-width="3"/><rect x="215" y="165" width="50" height="235" fill="#fff4ee"/>';
 o+='<rect x="610" y="165" width="150" height="235" rx="12" fill="#c9d9f0" stroke="#416faf" stroke-width="3"/><rect x="620" y="165" width="130" height="235" fill="#f6f9ff"/>';
 o+=vessel('M620 285 Q660 310 677 275 M750 285 Q710 310 693 275',blue,4);
 o+=label(385,215,'Thicker wall','較厚管壁',21)+vessel('M335 220 H292','#444',1)+label(385,330,'Smaller lumen','較窄管腔',21)+vessel('M335 335 H250','#444',1);
 o+=label(840,215,'Thinner wall','較薄管壁',21)+vessel('M795 220 H755','#444',1)+label(840,330,'Wider lumen','較闊管腔',21)+vessel('M790 335 H720','#444',1);
 o+=particles([[240,175],[240,395]],t,red,5)+particles([[685,395],[685,175]],t,blue,5)+arrow(240,235,90,red)+arrow(685,235,-90,blue);
 o+=label(680,445,'Valves in many veins (e.g. limbs)','很多靜脈有瓣膜（如四肢）',20)+label(480,510,'Artery → capillaries → vein','動脈 → 微血管 → 靜脈',24);
 o+=label(480,575,'Here: red = systemic artery; blue = systemic vein','此圖以紅色表示體循環動脈，藍色表示體循環靜脈',20)+label(480,630,'Vessel type depends on flow direction, not oxygen content.','血管類別取決於血流方向，而非含氧量。',20);return o+'</svg>';}
window.NutritionVessels={circulation,comparison,bed,graph};
})();
