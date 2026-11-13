/* Anatomical schematic: inferior/anterior-oblique view, not surgical scale. */
(() => {
'use strict';
const M=window.MechanismCore,V=window.VillusStudio,{txt,path,token,at,ramp,lerp,circle}=M;
const prev=window.learningSceneSVG;
const duct=(p,w=15)=>path(p,'#6e834b',w+6)+path(p,'#d9df9c',w);
const G={right:[[315,245],[395,275],[520,295]],left:[[690,235],[620,265],[520,295]],hepatic:[[520,295],[520,385]],cystic:[[390,360],[420,350],[470,370],[520,385]],common:[[520,385],[545,445],[560,510],[640,550],[713,550]]};
const store=[...G.right,...G.hepatic.slice(1),...G.cystic.slice(0,-1).reverse(),[365,410]];
const release=[[365,410],...G.cystic,...G.common.slice(1),[716,565],[724,590]];
const cubic=(a,b,c,d,t)=>a.map((v,i)=>(1-t)**3*v+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*c[i]+t**3*d[i]);
const duodenum=Array.from({length:25},(_,i)=>cubic([845,430],[715,410],[710,455],[713,525],i/24)).concat(Array.from({length:24},(_,i)=>cubic([713,525],[710,615],[760,663],[850,645],(i+1)/24)));
const mealPath=duodenum.slice(0,25).concat(Array.from({length:12},(_,i)=>cubic([713,525],[710,615],[760,663],[850,645],(i+1)/12*.28)));
function organ(t,{scar=false,blocked=false}={}){let o='<path data-liver-outline="true" d="M130 260 C120 170 260 115 430 155 C530 178 640 125 795 190 C825 220 750 280 675 295 C570 320 460 315 400 340 C310 395 185 410 155 350Z" fill="#bd7764" stroke="#89594c" stroke-width="4"/>';
 o+='<path d="M505 165 Q470 245 485 310" fill="none" stroke="#e5b499" stroke-width="6"/>';
 // The gall bladder lies against the inferior surface of the liver; its neck
 // connects through the cystic duct rather than directly to the intestine.
 o+=duct(G.right,11)+duct(G.left,11)+duct(G.hepatic)+duct(G.cystic,12)+duct(G.common,16);
 const squeeze=ramp(t,.56,.9),sx=lerp(1,.72,squeeze),sy=lerp(1,.83,squeeze);o+=`<g transform="translate(390 360) scale(${sx} ${sy}) translate(-25 40)"><path data-gallbladder="true" d="M25 -55 C8 -40 -42 -12 -37 30 C-34 74 28 75 40 32 C52 -5 16 -25 25 -55Z" fill="#a9b77a" stroke="#6b814a" stroke-width="4"/><path d="M12 -40 Q-20 0 -15 34" fill="none" stroke="#d8e2ac" stroke-width="5"/></g>`;
 // C-shaped duodenum surrounds the pancreatic head; bile enters medially
 // through the duodenal wall, not via a tube ending in free abdominal space.
 o+=path(duodenum,'#b88565',90,'data-duodenum="true"')+path(duodenum,'#f6dfb9',62);
 o+='<path data-pancreas="true" d="M770 500 C835 460 975 477 1030 500 Q1045 520 1010 539 Q900 568 785 572 Q745 550 770 500Z" fill="#d9ae81" stroke="#aa805f" stroke-width="3"/>';
 for(let i=0;i<10;i++)o+=`<path d="M${790+i*21} 498 q-12 28 4 49" fill="none" stroke="#bd946c" stroke-width="2"/>`;
 o+=duct([[1010,515],[900,525],[800,535],[735,550],[713,550]],7);
 // The terminal bile segment is drawn over the wall at the papilla, making
 // the shared lumen endpoint explicit after drawing the organ outlines.
 o+=duct([[640,550],[713,550]],13);
 const opening=ramp(t,.48,.57),gap=2+opening*14;o+=`<ellipse cx="690" cy="550" rx="9" ry="22" fill="none" stroke="#648b62" stroke-width="4"/>`+path([[690,530],[690,550-gap]],'#648b62',7)+path([[690,550+gap],[690,570]],'#648b62',7);
 if(scar)for(let i=0;i<12;i++){const x=180+i%6*87,y=230+Math.floor(i/6)*66;o+=path([[x,y],[x+25,y-15],[x+48,y+8]],'#d5c8b9',10)}
 if(blocked)o+=path([[475,385],[560,385]],'#ac574e',18);
 return o;
}
function bile(s,t){let o=txt(560,35,'Bile follows connected ducts from liver to duodenum','膽汁經相連的膽管由肝到十二指腸',25)+organ(t);
 const stage=t<.5?'Between meals: bile is diverted into the gall bladder':t<.8?'A meal arrives: outlet opens and gall bladder contracts':'Bile enters the duodenum and emulsifies fat';
 o+=txt(560,99,stage,t<.5?'兩餐之間：膽汁流入膽囊儲存':t<.8?'食物到達：開口放鬆，膽囊收縮':'膽汁進入十二指腸，使大油滴分散',20);
 for(let i=0;i<10;i++){const p=t<.5?at(store,ramp(t,.02+i*.008,.39+i*.009)):at(release,ramp(t,.51+i*.01,.84+i*.01));o+=token(...p,'#9a9a2e',`data-bile-packet="${i}"`,7)}
 o+=txt(260,232,'Liver','肝',26)+txt(890,233,'Right + left hepatic ducts','左右肝管',18)+path([[815,245],[655,258]],'#758150',2)+txt(885,300,'Common hepatic duct','總肝管',18)+path([[790,310],[527,335]],'#758150',2)+txt(160,490,'Gall bladder','膽囊',22)+path([[250,495],[340,425]],'#758150',2)+txt(150,395,'Cystic duct','膽囊管',19)+path([[245,405],[450,371]],'#758150',2)+txt(340,605,'Common bile duct','總膽管',20)+path([[450,595],[554,487]],'#758150',2)+txt(915,605,'Pancreas','胰臟',21)+txt(850,702,'Duodenum','十二指腸',22);
 // Once bile has arrived in the lumen, split represented fat area into
 // smaller droplets. The chemical identity stays lipid throughout.
 const em=ramp(t,.86,1),meal=at(mealPath,ramp(t,.5,.83));if(t>=.5&&em<1)o+=circle(...meal,22*Math.sqrt(1-em),'#d49a3d','data-bile-large-fat="true"');for(let i=0;i<8;i++)if(em>0){const a=i*Math.PI/4;o+=circle(meal[0]+Math.cos(a)*22,meal[1]+Math.sin(a)*22,22*Math.sqrt(em/8),'#d49a3d','data-bile-small-fat="true"')}
 o+=txt(940,398,t<.5?'Outlet closed':'Outlet open',t<.5?'開口收緊':'開口放鬆',19)+path([[845,409],[690,550]],'#648b62',1.5);
 o+=txt(560,775,'Bile disperses fat droplets; it does not hydrolyse triglycerides.','膽汁分散脂肪滴，並不把甘油三酯水解。',20);return o;
}
window.BiliaryStudio={G,store,release,organ,bile,duodenum,mealPath};
window.LESSONS.find(a=>a.id==='liver').text+=`<h3>Biliary anatomy clarification · 膽管解剖補充</h3><p>The gall bladder lies against the inferior surface of the liver. Right and left hepatic ducts unite as the common hepatic duct; joining the cystic duct forms the common bile duct, which opens into the duodenum. Bile can enter and leave the gall bladder through the cystic duct.<br>膽囊貼近肝的下表面。左右肝管匯成總肝管，再與膽囊管連接成總膽管，通往十二指腸。膽汁可經膽囊管流入及流出膽囊。</p><p class="refs">Anatomical clarification accompanying the schematic: <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder" target="_blank" rel="noopener">OpenStax A&amp;P 2e §23.6</a>. Original source pages and wording remain unchanged.</p>`;
window.learningSceneSVG=(mode,s)=>mode==='liver'&&+s.function===2&&s.production!=='carotene'?V.wrap(bile(s,M.clamp(s.phase||0)),'Biliary anatomy and bile release'):prev(mode,s);
})();
