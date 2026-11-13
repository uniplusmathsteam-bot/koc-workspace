/* Keep source explanations intact, but give each application its own destination. */
(() => {
'use strict';
const lesson=window.LESSONS.find(x=>x.id==='applications'),liver=window.LESSONS.find(x=>x.id==='liver');
const raw=lesson.text,parts=raw.split(/(?=<h3>)/),sections=parts.slice(1);
const find=word=>sections.find(x=>x.includes(word))||'';
const experimental=find('Experimental reasoning'),paragraphs=experimental.match(/<p[\s\S]*?<\/p>/g)||[];
const microscopy=find('Microscopy &amp;')||find('Microscopy & nutrient');
const cirr=liver.text.match(/<h3>Application: liver cirrhosis[\s\S]*?(?=<p class="refs">Optional molecular view|$)/)?.[0]||'';
const tabs=[
 {id:'coeliac',label:'Coeliac disease 乳糜瀉',doc:'a',page:25,content:find('Coeliac disease')},
 {id:'lactose',label:'Lactose intolerance 乳糖不耐症',doc:'b',page:31,content:find('Lactose intolerance')},
 {id:'cirrhosis',label:'Liver cirrhosis 肝硬化',doc:'b',page:15,content:cirr},
 {id:'pancreatic',label:'Blocked pancreatic duct 胰管阻塞',doc:'b',page:14,content:'<h3>Blocked pancreatic duct · 胰管阻塞</h3>'+(paragraphs[1]||'')},
 {id:'anaemia',label:'Anaemia 貧血',doc:'a',page:26,content:'<h3>Iron deficiency and anaemia · 缺鐵及貧血</h3><p>In the supplied malabsorption case, iron deficiency causes anaemia. Iron is required to make haemoglobin in developing red blood cells; reduced haemoglobin reduces oxygen-carrying capacity.<br>原吸收不良個案中，缺鐵造成貧血。發育中的紅血球需要鐵製造血紅蛋白；血紅蛋白減少會降低攜氧能力。</p>'},
 {id:'scurvy',label:'Scurvy 壞血病',doc:'a',page:26,content:'<h3>Vitamin C deficiency and scurvy · 維生素 C 缺乏及壞血病</h3><p>In the supplied case, vitamin C deficiency causes scurvy. Vitamin C supports normal collagen formation, connective tissue and wound healing.<br>原個案中，維生素 C 缺乏造成壞血病。維生素 C 支持正常膠原蛋白形成、結締組織及傷口癒合。</p>'},
 {id:'processes',label:'Transport processes 運輸過程',doc:'a',page:2,content:parts[0].replace(/<h2>[\s\S]*?<\/h2>/,'<h2>Diffusion, osmosis & active transport<br>擴散、滲透及主動運輸</h2>')+find('Absorption sites')},
 {id:'experiments',label:'Experiments & microscopy 實驗與顯微鏡',doc:'a',page:3,content:find('Lipase practical')+find('Dialysis-tubing')+'<h3>Experimental reasoning · 實驗推論</h3>'+(paragraphs[0]||'')+microscopy}
];
// Preserve an audit trail of the full original teaching text, not a new UI dump.
window.APPLICATION_SOURCE_TEXT=raw;
window.APPLICATION_TABS=tabs;
const scienceRefs={coeliac:['NIDDK: coeliac disease','https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease/definition-facts'],lactose:['NIDDK: lactose intolerance','https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance/symptoms-causes'],cirrhosis:['NIDDK: cirrhosis','https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis/definition-facts'],anaemia:['NIH: iron','https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/'],scurvy:['NIH: vitamin C','https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/']};
window.applicationLessonHTML=s=>{const tab=tabs.find(x=>x.id===s.application)||tabs[0];return `<div class="application-intro">Application · ${tab.label}</div>${tab.content}<div class="refs">SOURCE · 原筆記 <button data-source="${tab.doc}:${tab.page}">${tab.doc.toUpperCase()} · PDF p.${tab.page}</button>${scienceRefs[tab.id]?`<p>Scientific reference · 科學參考：<a href="${scienceRefs[tab.id][1]}" target="_blank" rel="noopener">${scienceRefs[tab.id][0]}</a></p>`:''}</div>`};
if(cirr)liver.text=liver.text.replace(cirr,'<h3>Related disease · 相關疾病</h3><p>Liver cirrhosis has its own explanation and animation under Application.<br>肝硬化的解說及動畫已放入「應用」的獨立分頁。</p><button data-application-link="cirrhosis">Open liver cirrhosis 肝硬化 →</button>');
})();
