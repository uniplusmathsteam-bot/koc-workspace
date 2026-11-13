(() => {
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],L=window.LESSONS,S=window.SOURCES,E=window.ORIGINAL_EXERCISES;
const safeParse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const state={topic:Math.max(0,Math.min(L.length-1,safeParse('nutrition-topic',1))),doc:'b',page:2,panels:safeParse('nutrition-panels-v2',['model','text']),route:'water',nutrient:'Glucose 葡萄糖',situation:'meal',function:0,flattened:false,zoom:false,playing:false,phase:0,speed:1,font:safeParse('nutrition-font',20),tool:'move',fit:safeParse('nutrition-fit',false),detail:'organ',fate:'use',transit:'normal'};
state.noteScale=safeParse('nutrition-note-scale','page');
state.production='bile';state.glucoseStorage='glycogen';state.lipidUse='membrane';
let anatomy=null,anatomy3D=null,guidedProcess=null;
state.modelView='guided';
state.reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
state.carbonTracking=false;state.application='coeliac';state.adaptation='villi';state.absorptionGroup='both';state.compareBoth=false;state.diseaseComparison='affected';state.deficiency='iron';state.transportProcess='diffusion';state.experiment='lipase';
let lesson=L[state.topic],raf=0,last=0,quizIndex=0;
let reviewed=safeParse('nutrition-reviewed',[]);
let practiceMode='quick',originalSetIndex=0,originalQuestionIndex=0,originalAnswers=safeParse('nutrition-original-answers',{}),drafts=safeParse('nutrition-drafts',{}),originalRevealed=new Set();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function panelLayout(){
 const keys=['model','text','notes','practice'];state.panels=state.panels.filter(k=>keys.includes(k));if(!state.panels.length)state.panels=['model'];
 const plan=window.ViewportLayout.panelPlan(innerWidth,state.panels,state.mobilePanel);
 keys.forEach(k=>{$('#'+k+'Panel').hidden=!plan.visible.includes(k);$(`[data-panel="${k}"]`).setAttribute('aria-pressed',plan.visible.includes(k));});
 $('#workspace').style.gridTemplateColumns=plan.weights.map(w=>`minmax(0,${w}fr)`).join(' ');$('#workspace').style.gridTemplateRows=`repeat(${plan.rows},minmax(0,1fr))`;
 $('#workspace').classList.toggle('guided-layout',state.modelView==='guided'&&plan.visible.includes('model'));save('nutrition-panels-v2',state.panels);requestAnimationFrame(()=>{fitNote();fitPanels()});
}
function showSource(doc,n){state.doc=doc;state.page=n;$('#document').value=doc;const source=S.find(x=>x.id===doc);$('#page').innerHTML=source.pages.map(p=>`<option value="${p.n}">p. ${p.n} / ${source.pages.length}</option>`).join('');$('#page').value=n;renderNote();}
function renderNote(){
 const source=S.find(x=>x.id===state.doc),p=source.pages[state.page-1];
 $('#noteImage').src=p.image;$('#noteImage').alt=`${source.file}, PDF page ${p.n}. Original wording, diagrams and alignment.`;
 $('#download').href=window.OFFLINE_PDFS?.[state.doc]||`notes-${state.doc}.pdf`;$('#download').download=`Nutrition-${state.doc==='a'?'7.5-7.6':'7.6-7.7'}-notes.pdf`;
 $('#sourceCaption').textContent=`${source.file} · PDF p. ${p.n} / ${source.pages.length}`;
 $('#prevPage').disabled=state.page===1;$('#nextPage').disabled=state.page===source.pages.length;
 $('#textLayer').innerHTML=p.words.map(w=>`<span style="left:${w.x}%;top:${w.y}%;width:${w.w}%;height:${w.h}%;font-size:${w.h*.82}cqh">${esc(w.text)}</span>`).join('');
 $('#noteViewport').scrollTop=0;$('#noteViewport').scrollLeft=0;
 requestAnimationFrame(fitNote);redrawInk();
 $('#reviewed').setAttribute('aria-pressed',reviewed.includes(`${state.doc}:${state.page}`));updateReviewCount();
 if(practiceMode==='written')renderPractice();
}
function fitNote(){
 const viewport=$('#noteViewport');if(!viewport.clientWidth||!viewport.clientHeight)return;
 const p=S.find(x=>x.id===state.doc).pages[state.page-1],ratio=p.w/p.h;
 const frame=window.ViewportLayout.contain(Math.max(0,viewport.clientWidth-12),Math.max(0,viewport.clientHeight-12),p.w,p.h),width=frame.width;state.noteScale='page';$('#noteScale').disabled=true;
 $('#noteSheet').style.width=width+'px';$('#noteSheet').style.height=width/ratio+'px';$('#noteSheet').style.containerType='size';
 $('#noteScale').value=state.noteScale;
 redrawInk();
}
function setTopic(i){
 state.topic=(i+L.length)%L.length;lesson=L[state.topic];state.phase=0;state.playing=false;last=0;quizIndex=0;
 if(practiceMode==='original'){originalSetIndex=originalSetForTopic();originalQuestionIndex=0;}
 if(lesson.mode!=='egestion'){state.modelView='guided';if(+state.function===5)state.function=0;}else state.modelView='anatomy';
 save('nutrition-topic',state.topic);$('#topics').innerHTML=L.map((l,j)=>`<button class="${j===state.topic?'active':''}" aria-current="${j===state.topic?'page':'false'}" data-topic="${j}">${esc(l.name)}</button>`).join('');
 $('#modelTitle').textContent=lesson.title;$('#modelRef').textContent=`${lesson.doc==='a'?'7.5–7.6':'7.6–7.7'} p.${lesson.page}`;
 renderLessonContent();
 $('#textPanel').scrollTop=0;renderControls();renderModel();if(practiceMode==='original')showOriginalSource();else if(lesson.mode==='application'){const tab=window.APPLICATION_TABS.find(t=>t.id===state.application);showSource(tab.doc,tab.page)}else showSource(lesson.doc,lesson.page);renderPractice();updatePlay();requestAnimationFrame(fitPanels);
}
function renderLessonContent(){
 const refs=`<div class="refs">SOURCE PAGES · 對照原筆記<br>${lesson.refs.map(([d,p])=>`<button data-source="${d}:${p}">${d==='a'?'7.5–7.6':'7.6–7.7'} p.${p}</button>`).join('')}</div>`;
 if(lesson.mode==='application'){
  const nav=`<nav class="application-tabs" aria-label="Application topics">${window.APPLICATION_TABS.map(t=>`<button data-application-link="${t.id}" aria-pressed="${state.application===t.id}">${t.label}</button>`).join('')}</nav>`;
  $('#lessonText').innerHTML=nav+window.applicationLessonHTML(state);
 }else $('#lessonText').innerHTML=lesson.text+refs;
}
function buttons(items,key,value){
 const names={modelView:'View 視圖',route:'Route 路徑',nutrient:'Nutrient 營養素',fate:'Condition 情況',glucoseStorage:'Storage 儲存',lipidUse:'Use 用途',situation:'Situation 情況',function:'Function 功能',production:'Product 產物',villi:'Villi 絨毛',adaptation:'Adaptation 適應',application:'Application 應用',diseaseComparison:'Compare 對照',deficiency:'Nutrient 營養素',transportProcess:'Process 過程',experiment:'Experiment 實驗',transit:'Transit 蠕動'};
 return `<label class="control-pick"><span>${names[key]||key}</span><select data-choice-select="${key}" aria-label="${names[key]||key}">${items.map(([v,label])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${label}</option>`).join('')}</select></label>`;
}
function currentTeaching(){return lesson.mode==='route'&&state.modelView==='anatomy'&&window.TransportJourney?window.TransportJourney.teaching(state):window.processTeaching(lesson.mode,state)}
function renderControls(){
 if(lesson.mode==='application'&&state.application!=='scurvy')state.modelView='guided';
 if(state.modelView==='notes'&&!['egestion','route'].includes(lesson.mode))state.modelView='guided';
 let html='';
 if(lesson.mode==='liver'&&+state.function===0&&!['meal','fasting'].includes(state.situation))state.situation='meal';
 if(lesson.mode==='liver'&&state.modelView==='notes')state.function=5;
 if(lesson.mode==='route')html=buttons([['water','Water-soluble 水溶性'],['lipid','Lipid-soluble 脂溶性'],...(state.modelView==='notes'?[['vessels','Artery vs vein 動脈與靜脈']]:[])],'route',state.route);
 if(lesson.mode==='fates'){html=buttons(['Glucose 葡萄糖','Amino acids 氨基酸','Lipids 脂質'].map(x=>[x,x]),'nutrient',state.nutrient)+buttons([['use','Use by cells 細胞利用'],['excess','When excess 過量時']],'fate',state.fate);if(state.nutrient==='Lipids 脂質'&&state.fate==='use')html+=buttons([['membrane','Cell membranes 細胞膜'],['hormone','Sex hormones 性激素']],'lipidUse',state.lipidUse);if(state.nutrient==='Glucose 葡萄糖'&&state.fate==='excess')html+=buttons([['glycogen','Glycogen 糖原'],['lipid','Lipids in liver 肝內脂質']],'glucoseStorage',state.glucoseStorage)}
 if(lesson.mode==='glucose')html=buttons([['meal','After a meal 餐後'],['fasting','Starvation 飢餓'],['protein','High protein 高蛋白']],'situation',state.situation);
 if(lesson.mode==='liver'){html=buttons(['Regulating 調節','Storing 儲存','Producing 生產','Deaminating 脫氨','Detoxifying 解毒',...(state.modelView==='notes'?['Blood supply 血液供應']:[])].map((x,i)=>[String(i),x]),'function',String(state.function));if(+state.function===0)html+=buttons([['meal','Insulin ↑ 胰島素增加'],['fasting','Glucagon ↑ 升糖素增加']],'situation',state.situation);if(+state.function===2)html+=buttons([['bile','Bile 膽汁'],['carotene','Vitamin A 維生素A']],'production',state.production)}
 if(lesson.mode==='liver'&&state.modelView==='guided'&&+state.function===2&&state.production==='carotene')html+=`<button data-carbon-toggle aria-pressed="${state.carbonTracking}">${state.carbonTracking?'✓ Carbon tracking 碳追蹤':'Show carbon tracking 顯示碳追蹤'}</button>`;
 if(lesson.mode==='villi'&&state.modelView!=='guided')html=buttons([['normal','Healthy villi 正常絨毛'],['flat','Flattened villi 扁平絨毛']],'villi',state.flattened?'flat':'normal');

 if(lesson.mode==='villi'&&state.modelView==='guided'){html='<div class="adaptation-tabs">'+Object.entries(window.FocusedLearning.tabs).map(([id,a])=>`<button data-choice="adaptation:${id}" aria-pressed="${state.adaptation===id}">${a[0]} ${a[1]}</button>`).join('')+'</div>';if(state.adaptation==='absorption')html+=buttons([['both','All nutrients 全部營養素'],['water','To blood 進血液'],['lipid','To lymph 進淋巴']],'absorptionGroup',state.absorptionGroup);}
 if(lesson.mode==='application'){
  html=buttons(window.APPLICATION_TABS.map(t=>[t.id,t.label]),'application',state.application);
  if(['coeliac','lactose','pancreatic','cirrhosis','anaemia','scurvy'].includes(state.application)){html+=`<button class="compare-both" data-compare-both aria-pressed="${state.compareBoth}">${state.compareBoth?'✓ Side by side 並排對照':'Show normal + abnormal 正常及異常並排'}</button>`;if(!state.compareBoth)html+=buttons([['healthy','Normal 正常'],['affected','Abnormal 異常']],'diseaseComparison',state.diseaseComparison);}
  if(state.application==='deficiency')html+=buttons([['iron','Iron → anaemia 鐵 → 貧血'],['vitaminC','Vitamin C → scurvy 維生素 C → 壞血病']],'deficiency',state.deficiency);
  if(state.application==='processes')html+=buttons([['diffusion','Diffusion 擴散'],['osmosis','Osmosis 滲透'],['active','Active transport 主動運輸']],'transportProcess',state.transportProcess);
  if(state.application==='experiments')html+=buttons([['lipase','Lipase 脂肪酶'],['dialysis','Dialysis tubing 透析管'],['microscopy','Microscopy 顯微鏡']],'experiment',state.experiment);
 }
 if(lesson.mode==='egestion')html=buttons([['normal','Normal peristalsis 正常蠕動'],['fast','Too fast 蠕動過快']],'transit',state.transit);
 if(lesson.mode==='liver'&&state.modelView==='notes')html=buttons([['5','Blood supply 血液供應']],'function','5');
 if(lesson.mode!=='egestion'&&(state.modelView==='guided'||lesson.mode==='route'&&state.modelView==='anatomy')){
  const info=currentTeaching();html+=`<div class="control-row process-steps">${info.labels.map((label,i)=>`<button data-stage="${Math.round((info.breaks[i]+(info.breaks[i+1]-info.breaks[i])*.7)*1000)}" aria-label="Step ${i+1}: ${label}">${i+1} · ${label}</button>`).join('')}</div>`;
 }
 const views=lesson.mode==='application'?(state.application==='scurvy'?[['guided','Mechanism 動畫機制'],['anatomy','Animated tooth model 牙齒動畫模型']]:[['guided','Mechanism 動畫機制']]):lesson.mode==='egestion'?[['anatomy','Anatomy model 解剖模型'],['notes','2D diagram 二維圖']]:lesson.mode==='route'?[['guided','Learn the mechanism 機制講解'],['anatomy','Animated anatomy 解剖動畫'],['notes','2D diagram 二維圖']]:[['guided','Learn the mechanism 機制講解'],['anatomy','Animated anatomy 解剖動畫']];
 $('#modelControls').innerHTML=buttons(views,'modelView',state.modelView)+html;
}
function syncModelExpand(){const expanded=$('#modelPanel').classList.contains('model-expanded');$$('#modelStage .diagram-expand,#modelStage [data-scene="expand"]').forEach(b=>{b.setAttribute('aria-pressed',expanded);b.textContent=expanded?'↙ Return 返回課室':'⛶ Enlarge 放大';});}
function renderModel(){
 $('#timeline').value=Math.round(state.phase*1000);renderProcessStory();
 const guided=state.modelView==='guided'&&lesson.mode!=='egestion',reference=state.modelView==='anatomy'&&lesson.mode!=='egestion';
 $('#modelPanel').classList.toggle('guided-mode',guided);$('#modelPanel').classList.toggle('mechanism-v3',guided);$('#modelPanel').classList.toggle('reference-view',reference);$('#workspace').classList.toggle('guided-layout',guided&&state.panels.includes('model'));
 if(!$('#anatomyHost'))$('#modelStage').innerHTML='<div id="anatomyContext"><div id="contextTitle"></div><div id="anatomyHost" class="model-render-host"></div></div><div id="diagramHost" class="model-render-host" hidden></div><div id="guidedHost" class="model-render-host" hidden></div>';
 $('#anatomyContext').hidden=state.modelView!=='anatomy';const contextTitle=$('#contextTitle');contextTitle.hidden=!(reference&&['villi','route'].includes(lesson.mode));if(reference&&lesson.mode==='route'){const info=currentTeaching(),stage=Math.min(info.labels.length-1,Math.floor(state.phase*info.labels.length));contextTitle.textContent=info.steps[stage]+' Other vessels are static context; sizes enlarged. 其他管道只作靜態定位；標記已放大。'}else if(!contextTitle.hidden)contextTitle.textContent='Gold glucose → blood · Orange/grey fat components → green packages → lymph · Red discs: blood cells. 金：葡萄糖入血；橙／灰：脂質成分 → 綠色微粒入淋巴；紅圓盤：血球。 Enlarged markers 標記已放大。';$('#diagramHost').hidden=state.modelView!=='notes';$('#guidedHost').hidden=!guided;
 $('#modelStage').classList.toggle('guided-stage',guided);const playback=$('.playback-row');if(playback.nextElementSibling!==$('#modelStage'))$('#modelPanel').insertBefore(playback,$('#modelStage'));
 if(guided){if(!guidedProcess)guidedProcess=new window.LearningScene($('#guidedHost'));guidedProcess.setState(lesson.mode,state);}
 else if(state.modelView==='anatomy'&&window.AnatomyScene){
  if(!anatomy3D)anatomy3D=new window.AnatomyScene($('#anatomyHost'));
  if(!anatomy3D.failed){anatomy3D.setState(lesson.mode,state);}
  else {if(lesson.mode!=='egestion'){state.modelView='guided';renderControls();renderModel();return;}$('#anatomyContext').hidden=true;$('#diagramHost').hidden=false;if(!anatomy)anatomy=new window.NutritionDiagram($('#diagramHost'));anatomy.setState(lesson.mode,state);}
 }else {if(!anatomy)anatomy=new window.NutritionDiagram($('#diagramHost'));anatomy.setState(lesson.mode,state);}
 $('#play').disabled=false;$('#timeline').disabled=false;$('#replay').disabled=false;
 syncModelExpand();renderAnatomyCaption();
 if(reference)$('#modelCaption').textContent='Animated anatomical context: use Animate, Pause, Replay or the timeline. Rotate, zoom and pan to inspect the structures. 解剖動畫：可播放、暫停、重播或拖動進度；亦可旋轉、放大及平移觀察。';
}
function renderProcessStory(){
 const box=$('#processStory'),target=lesson.mode!=='egestion'&&(state.modelView==='guided'||lesson.mode==='route'&&state.modelView==='anatomy');box.hidden=!target;const stepText=$('#currentStepExplanation');if(stepText)stepText.hidden=!target;if(!target)return;
 const teaching=currentTeaching();let stage=0;while(stage<teaching.labels.length-1&&state.phase>=teaching.breaks[stage+1])stage++;
 const message=`${stage+1} · ${teaching.labels[stage]}`;if(box.textContent!==message)box.textContent=message;const detail=$('#currentStepExplanation');if(detail)detail.textContent=teaching.steps[stage];
 $$('.process-steps button').forEach((b,i)=>b.setAttribute('aria-pressed',i===stage));
}
function renderAnatomyCaption(){
 const captions={
 route:state.route==='vessels'?'Arteries carry blood away from the heart; veins carry blood towards the heart. The hepatic portal vein joins two capillary beds: intestine and liver. 動脈將血液帶離心臟，靜脈將血液帶回心臟；肝門靜脈連接小腸及肝的兩組微血管。':state.route==='water'?'Intestinal capillaries → hepatic portal vein → liver capillaries → hepatic vein → vena cava → heart. The liver also receives arterial blood through the hepatic artery. 小腸微血管 → 肝門靜脈 → 肝微血管 → 肝靜脈 → 腔靜脈 → 心臟；肝亦由肝動脈獲得血液。':'Fat travels in lymph vessels, then rejoins the blood before reaching the heart. 脂質經淋巴管運輸，再重回血液到達心臟。',
 villi:'Villi increase the surface area for absorption. Glucose and amino acids enter blood capillaries; fat enters lacteals. 絨毛增加吸收表面積；葡萄糖及氨基酸進入微血管，脂質進入乳糜管。',
 application:'Flattened villi have less surface area, so fewer nutrients are absorbed. 扁平絨毛的表面積較少，因此吸收的營養素減少。',
 fates:'Watch nutrients enter cells and be used or stored. Amino acids form proteins; excess amino acids are deaminated in the liver. 觀察營養素進入細胞後被利用或儲存；氨基酸製造蛋白質，過量氨基酸在肝脫氨。',
 glucose:state.situation==='protein'?'The liver deaminates excess amino acids, producing urea. 肝將過量氨基酸脫氨，產生尿素。':state.situation==='fasting'?'Glucagon promotes glycogen breakdown. Glucose is released into blood. 升糖素促進糖原分解，葡萄糖釋放到血液。':'Insulin promotes conversion of glucose into glycogen in the liver. 胰島素促進肝將葡萄糖轉成糖原。',
 liver:['The liver regulates blood glucose by storing or releasing glucose. 肝透過儲存或釋放葡萄糖調節血糖。','The liver stores glycogen, iron and vitamins A, D, E and K. 肝儲存糖原、鐵及維生素 A、D、E、K。',state.production==='carotene'?'The liver converts carotene into vitamin A. 肝將胡蘿蔔素轉成維生素 A。':'The liver makes bile. The gall bladder stores it and releases it into the duodenum. 肝製造膽汁，膽囊儲存膽汁並將其釋放到十二指腸。','The liver deaminates excess amino acids and produces urea. 肝將過量氨基酸脫氨並產生尿素。','Catalase breaks down hydrogen peroxide into water and oxygen. 過氧化氫酶將過氧化氫分解成水及氧。','The hepatic artery and hepatic portal vein both feed the liver capillary network, which drains into the hepatic vein. The portal vein connects the intestinal and liver capillary beds. 肝動脈及肝門靜脈均流入肝微血管網，再由肝靜脈帶走血液；肝門靜脈連接小腸及肝的微血管。'][+state.function],
 egestion:state.transit==='fast'?'Fast transit leaves less time for water absorption, so faeces stay wetter. 蠕動過快令吸水時間減少，糞便較稀。':'The bowel wall pushes contents forward. Water is absorbed into blood and faeces become more solid. 腸壁推動內容物前進，水被吸收進入血液，糞便變得較固體。'
 };
 const guidedTopic=lesson.mode!=='egestion'&&state.modelView==='guided';
 $('#modelCaption').textContent=(guidedTopic?window.processTeaching(lesson.mode,state).steps.join(' '):captions[lesson.mode])+' Diagrams are schematic. 圖像為示意。';
 $('#captionSummary').textContent=guidedTopic?'What changes and why? · 變化與原因':'Key idea · 學習重點';
}

function updatePlay(){$('#play').textContent=state.reducedMotion&&(state.modelView==='guided'||lesson.mode==='route'&&state.modelView==='anatomy')?'Next stage 下一步':state.playing?'❚❚ Pause 暫停':'▶ Animate 動畫';$('#play').setAttribute('aria-pressed',state.playing)}
let lastPaint=0;
function tick(time){
 if(state.playing){if(last){const guidedTopic=lesson.mode!=='egestion'&&state.modelView==='guided';const routeJourney=lesson.mode==='route'&&state.modelView==='anatomy',finiteTopic=guidedTopic||routeJourney;const surfaceLesson=guidedTopic&&lesson.mode==='villi'&&['folds','villi','microvilli'].includes(state.adaptation),focusedLesson=guidedTopic&&lesson.mode==='villi'&&['energy','lacteal'].includes(state.adaptation);const next=state.phase+(time-last)/(surfaceLesson||routeJourney?30000:focusedLesson?24000:guidedTopic?16000:10000)*state.speed*(lesson.mode==='egestion'&&state.transit==='fast'?1.7:1);state.phase=finiteTopic?Math.min(1,next):next%1;if(finiteTopic&&next>=1){state.playing=false;updatePlay();renderModel();}}last=time;if(time-lastPaint>40){renderModel();lastPaint=time}}else last=0;
 drawLaser(time);raf=requestAnimationFrame(tick);
}
function exerciseLinks(){
 return `<h3>Complete original exercises<br>完整原版練習</h3><p style="font-size:14px">The quick checks above are extra practice. All original questions, diagrams, worked examples and supplied answers are in these page ranges. Use the page selector to read every page.<br>上方為額外速測；以下保留全部原題、圖、例題及已提供的答案。</p><div class="exercise-links">${[['a',4,'A · vocabulary & intro exercises p.4–12'],['a',13,'A · concept checks p.13–19'],['a',20,'A · concept answers p.20–21'],['a',22,'A · unit exercises p.22–28'],['a',29,'A · unit answers p.29'],['b',4,'B · vocabulary & intro exercises p.4–13'],['b',14,'B · transport checks p.14–16'],['b',17,'B · transport answers p.17'],['b',19,'B · egestion checks p.19–21'],['b',22,'B · egestion answers p.22'],['b',23,'B · anatomical plates & summary p.23–25'],['b',26,'B · unit exercises p.26–34'],['b',35,'B · unit standard answers p.35–37']].map(([d,p,t])=>`<button data-source="${d}:${p}">${t}</button>`).join('')}</div><p class="refs">A = 7.5–7.6, B = 7.6–7.7. Source page numbers are PDF page positions. Original printed numbering may differ. 頁碼按 PDF 順序；可能與印刷頁碼不同。</p>`;
}
function renderPractice(){
 requestAnimationFrame(fitPanels);
 const modes=`<div class="practice-modes" role="group" aria-label="Practice type">${[['quick','Quick 速測'],['original','Original 原題'],['written','Written 作答']].map(([key,label])=>`<button data-practice="${key}" aria-pressed="${practiceMode===key}">${label}</button>`).join('')}</div>`;
 if(practiceMode==='original'){$('#practice').innerHTML=modes+originalQuestionHTML();return}
 if(practiceMode==='written'){$('#practice').innerHTML=modes+writtenHTML();return}
 const q=lesson.questions[quizIndex];$('#practice').innerHTML=modes+`<h2>${esc(lesson.name)} · Quick check 速測</h2><div class="quiz-nav"><button data-quiz="prev" ${quizIndex===0?'disabled':''}>◀</button><span>Question 題目 ${quizIndex+1} / ${lesson.questions.length}</span><button data-quiz="next" ${quizIndex===lesson.questions.length-1?'disabled':''}>▶</button></div><p>${esc(q.q)}</p><div class="quiz-options">${q.options.map((x,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)}. ${esc(x)}</button>`).join('')}</div><div id="feedback" class="answer" hidden role="status"></div><button id="reveal" style="margin-top:12px">Show explanation 顯示解釋</button>`+`<button id="practiceSources" class="practice-sources">Source library 原筆記庫（66 頁）</button>`;
}
function originalSetForTopic(){return {villi:0,transport:2,assimilation:4,glucose:2,liver:2,egestion:3,applications:1}[lesson.id]??0}
function originalKey(){return `${E[originalSetIndex].id}:${E[originalSetIndex].questions[originalQuestionIndex].n}`}
function showOriginalSource(){const set=E[originalSetIndex],q=set.questions[originalQuestionIndex];state.noteScale='width';showSource(set.doc,q.pages[0])}
function originalQuestionHTML(){
 const set=E[originalSetIndex],q=set.questions[originalQuestionIndex],key=originalKey(),choice=originalAnswers[key],revealed=originalRevealed.has(key),correct=choice===q.answer;
 const scored=set.questions.filter(x=>!x.ambiguous),matches=scored.filter(x=>originalAnswers[`${set.id}:${x.n}`]===x.answer).length;
 return `<div class="original-practice-content">
 <h2>Original MCQs · 原題</h2>
 <label class="exercise-select">Set 題組<select id="originalSet">${E.map((s,i)=>`<option value="${i}" ${i===originalSetIndex?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label>
 <div class="quiz-nav original-nav"><button data-original-nav="prev" aria-label="Previous original question" ${originalQuestionIndex===0?'disabled':''}>◀</button><select id="originalQuestion" aria-label="Original question">${set.questions.map((x,i)=>`<option value="${i}" ${i===originalQuestionIndex?'selected':''}>Q${x.n} · ${esc(x.title)}</option>`).join('')}</select><button data-original-nav="next" aria-label="Next original question" ${originalQuestionIndex===set.questions.length-1?'disabled':''}>▶</button></div>
 <p class="practice-instruction">Original question and diagram: Notes.<br>原題及圖：見旁邊筆記。</p>
 <div class="exercise-links">${q.pages.map(n=>`<button data-source="${set.doc}:${n}">Question 原題 p.${n}</button>`).join('')}</div>
 <div class="original-options" role="group" aria-label="Original answer choices">${['A','B','C','D'].map(letter=>`<button data-original-answer="${letter}" aria-pressed="${choice===letter}" class="${choice===letter?(q.ambiguous?'ambiguous-choice':correct?'correct-choice':'incorrect-choice'):''}">${letter}</button>`).join('')}</div>
 ${q.ambiguous?`<div class="source-ambiguity"><strong>Source ambiguity · 原題有歧義</strong><p>${esc(q.explain)}</p></div>`:''}
 <div id="originalFeedback" class="answer" role="status" ${!choice&&!revealed?'hidden':''}>${q.ambiguous?'Supplied key 原答案：'+q.answer:revealed?'Supplied answer 原答案：'+q.answer:correct?'✓ Correct 答對了。':'Try again 再試一次。'}${!q.ambiguous&&(correct||revealed)?'<p>'+esc(q.explain)+'</p>':''}</div>
 <div class="exercise-links"><button id="revealOriginal">Show answer 顯示答案</button><button data-source="${set.doc}:${set.answerPage}">Answer page 答案頁 p.${set.answerPage}</button>${choice?'<button id="clearOriginalChoice">Clear choice 清除選項</button>':''}</div>
 <p class="practice-score">Key matches 原答案吻合：${matches} / ${scored.length}${q.ambiguous?' · Ambiguous item unscored 歧義題不計分':''}</p>
 <p class="refs">Saved only in this browser. Original long questions and marking schemes are in the source library.<br>只儲存在此瀏覽器；長題及評分準則保留於完整筆記庫。</p></div>`;
}
function writtenHTML(){
 const key=`${state.doc}:${state.page}`,name=state.doc==='a'?'7.5–7.6':'7.6–7.7';
 return `<h2>Written response · 長題作答</h2><p class="practice-instruction">Use the page controls in Notes to choose any original exercise. Write here or annotate the unchanged page with the pen.<br>使用原筆記的頁面控制選擇練習，在此輸入，或用筆在原頁上作答。</p><label class="draft-label">${name} · p.${state.page}<textarea id="writtenResponse" data-page-key="${key}" placeholder="Your response / 你的答案">${esc(drafts[key]||'')}</textarea></label><span id="draftStatus" role="status" class="refs">Saved locally per source page · 按原筆記頁面儲存於本機</span><div class="exercise-links"><button id="downloadResponses">Download my responses 下載我的答案</button></div>`+`<button id="practiceSources" class="practice-sources">Source library 原筆記庫（66 頁）</button>`;
}
$('#topics').onclick=e=>{const b=e.target.closest('[data-topic]');if(b)setTopic(+b.dataset.topic)};
$('#prevTopic').onclick=()=>setTopic(state.topic-1);$('#nextTopic').onclick=()=>setTopic(state.topic+1);
$$('[data-panel]').forEach(b=>b.onclick=()=>{const key=b.dataset.panel;if(innerWidth<760){state.mobilePanel=key;if(!state.panels.includes(key))state.panels.push(key);panelLayout();return}if(state.panels.includes(key)){if(state.panels.length===1)return;state.panels=state.panels.filter(x=>x!==key)}else state.panels.push(key);panelLayout()});
$('#document').onchange=e=>showSource(e.target.value,1);$('#page').onchange=e=>{state.page=+e.target.value;renderNote()};
$('#prevPage').onclick=()=>showSource(state.doc,state.page-1);$('#nextPage').onclick=()=>showSource(state.doc,state.page+1);
$('#noteScale').onchange=e=>{state.noteScale=e.target.value;save('nutrition-note-scale',state.noteScale);fitNote()};$('#noteExpand').onclick=()=>{$('#notesPanel').classList.toggle('notes-expanded');$('#noteExpand').setAttribute('aria-pressed',$('#notesPanel').classList.contains('notes-expanded'));$('#noteExpand').textContent=$('#notesPanel').classList.contains('notes-expanded')?'↙ Return 返回':'⛶ Enlarge 放大';requestAnimationFrame(fitNote)};$('#noteImage').onload=fitNote;new ResizeObserver(fitNote).observe($('#noteViewport'));
$('#play').onclick=()=>{if(state.reducedMotion&&(state.modelView==='guided'||lesson.mode==='route'&&state.modelView==='anatomy')){const b=currentTeaching().breaks;const next=b.find(x=>x>state.phase+.03);state.phase=next===undefined?0:Math.min(1,next+.01);state.playing=false;renderModel();updatePlay();return}if(!state.playing&&state.phase>=1)state.phase=0;state.playing=!state.playing;last=0;updatePlay()};$('#replay').onclick=()=>{state.phase=0;state.playing=!state.reducedMotion;last=0;updatePlay();renderModel()};$('#speed').onchange=e=>state.speed=+e.target.value;
$('#timeline').oninput=e=>{state.phase=+e.target.value/1000;state.playing=false;renderModel();updatePlay()};
function chooseModelState(key,value){
 if(key==='modelView'){save('nutrition-model-view-v3',value);if(['anatomy','guided'].includes(value)){if(state.route==='vessels')state.route='water';if(+state.function===5)state.function=0;}}
 if(key==='villi')state.flattened=value==='flat';else state[key]=value;
 state.phase=0;state.playing=false;updatePlay();
 if(key==='application'){renderLessonContent();const tab=window.APPLICATION_TABS.find(t=>t.id===state.application);showSource(tab.doc,tab.page);}
 renderControls();renderModel();requestAnimationFrame(fitPanels);
}
$('#modelControls').onclick=e=>{if(e.target.closest('[data-carbon-toggle]')){state.carbonTracking=!state.carbonTracking;renderControls();renderModel();return}if(e.target.closest('[data-compare-both]')){state.compareBoth=!state.compareBoth;renderControls();renderModel();return}const step=e.target.closest('[data-stage]');if(step){state.phase=+step.dataset.stage/1000;state.playing=false;updatePlay();renderModel();return}const b=e.target.closest('[data-choice]');if(b){const [key,value]=b.dataset.choice.split(':');chooseModelState(key,value)}};
$('#modelControls').onchange=e=>{if(e.target.dataset.choiceSelect)chooseModelState(e.target.dataset.choiceSelect,e.target.value)};
$('#modelControls').oninput=e=>{if(e.target.id==='water'){state.playing=false;state.phase=+e.target.value/100;renderModel();updatePlay()}};
document.addEventListener('click',e=>{
 if(e.target.closest('#practiceSources')){$('#library').click();return}
 const appLink=e.target.closest('[data-application-link]');if(appLink){state.application=appLink.dataset.applicationLink;setTopic(L.findIndex(x=>x.mode==='application'));return;}
 const mode=e.target.closest('[data-practice]');if(mode){practiceMode=mode.dataset.practice;if(practiceMode!=='quick'){state.panels=['notes','practice'];if(practiceMode==='original'){originalSetIndex=originalSetForTopic();originalQuestionIndex=0;showOriginalSource()}else{state.noteScale='width';fitNote()}}panelLayout();renderPractice();return}
 const originalNav=e.target.closest('[data-original-nav]');if(originalNav){originalQuestionIndex=Math.max(0,Math.min(E[originalSetIndex].questions.length-1,originalQuestionIndex+(originalNav.dataset.originalNav==='next'?1:-1)));showOriginalSource();renderPractice();return}
 const originalChoice=e.target.closest('[data-original-answer]');if(originalChoice){originalAnswers[originalKey()]=originalChoice.dataset.originalAnswer;save('nutrition-original-answers',originalAnswers);renderPractice();$(`[data-original-answer="${originalChoice.dataset.originalAnswer}"]`).focus();return}
 if(e.target.id==='revealOriginal'){originalRevealed.add(originalKey());renderPractice();return}
 if(e.target.id==='clearOriginalChoice'){delete originalAnswers[originalKey()];originalRevealed.delete(originalKey());save('nutrition-original-answers',originalAnswers);renderPractice();return}
 if(e.target.id==='downloadResponses'){const blob=new Blob([JSON.stringify({app:'Nutrition classroom',responses:drafts,originalMCQChoices:originalAnswers},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='nutrition-responses.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return}
 const quiz=e.target.closest('[data-quiz]');if(quiz){quizIndex+=quiz.dataset.quiz==='next'?1:-1;quizIndex=Math.max(0,Math.min(lesson.questions.length-1,quizIndex));renderPractice();return}
 const b=e.target.closest('[data-source]');if(b){const [d,n]=b.dataset.source.split(':');if(!state.panels.includes('notes')){state.panels.push('notes');panelLayout()}if(innerWidth<760){state.mobilePanel='notes';panelLayout()}showSource(d,+n);$('#searchResults').hidden=true;return}
 const a=e.target.closest('[data-answer]');if(a){const q=lesson.questions[quizIndex],correct=+a.dataset.answer===q.answer;$('#feedback').hidden=false;$('#feedback').textContent=(correct?'✓ Correct 答對了。 ':'Try again 再試一次。 ')+q.explain;return}
 if(e.target.id==='reveal'){const q=lesson.questions[quizIndex];$('#feedback').hidden=false;$('#feedback').textContent=String.fromCharCode(65+q.answer)+'. '+q.explain}
});
$('#practice').onchange=e=>{if(e.target.id==='originalSet'){originalSetIndex=+e.target.value;originalQuestionIndex=0;showOriginalSource();renderPractice()}if(e.target.id==='originalQuestion'){originalQuestionIndex=+e.target.value;showOriginalSource();renderPractice()}};
$('#practice').oninput=e=>{if(e.target.id==='writtenResponse'){drafts[e.target.dataset.pageKey]=e.target.value;save('nutrition-drafts',drafts);$('#draftStatus').textContent='Saved locally ✓ 已儲存於本機'}};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{$('#fullscreen').textContent='Fullscreen unavailable'}};
function updateReviewCount(){$('#footer').textContent=`66 / 66 source pages included · ${reviewed.length} / 66 marked reviewed 已讀 · Hide panels to enlarge 關閉部分面板可放大其餘內容`}
$('#reviewed').onclick=()=>{const key=`${state.doc}:${state.page}`;reviewed=reviewed.includes(key)?reviewed.filter(x=>x!==key):[...reviewed,key];save('nutrition-reviewed',reviewed);$('#reviewed').setAttribute('aria-pressed',reviewed.includes(key));updateReviewCount()};
let modalItems=[],modalPage=0;
function renderModalPage(){const size=innerHeight<600?2:4,p=window.ViewportLayout.pageSlice(modalItems,modalPage,size);modalPage=p.page;$('#results').innerHTML='<div class="viewport-result-grid">'+p.items.join('')+'</div>'+`<nav class="result-pager"><button data-result-page="-1" ${p.page===0?'disabled':''}>◀ Previous 上頁</button><span>${p.page+1} / ${p.pages}</span><button data-result-page="1" ${p.page===p.pages-1?'disabled':''}>Next 下頁 ▶</button></nav>`;}
$('#results').addEventListener('click',e=>{const b=e.target.closest('[data-result-page]');if(b){modalPage+=+b.dataset.resultPage;renderModalPage()}});
$('#library').onclick=()=>{
 const titles={a:['Absorption adaptations 小腸吸收適應','Microvilli, mitochondria & flattened villi','Absorption pathways 吸收途徑','Adaptations vocabulary 適應詞彙','Intro exercise: intestinal features','Intro exercise: villi & capillaries','Intro exercise: epithelial cells','Coeliac disease 乳糜瀉','Worked features & functions','Worked features & functions','Worked epithelial adaptations','Worked coeliac response','Concept checks 1–3','Concept checks: routes & experiments','Concept checks: water & cell diagram','Glucose absorption question','Micrograph & epithelial-cell questions','Coeliac disease case study','Coeliac disease explanation','Concept-check answers','Concept-check answers','Unit exercises: digestive organs','Unit exercises: water & villus','Unit exercises: ileum & absorption','Unit long question: gluten & villi','Unit long questions: coeliac & microscopy','Unit long question: epithelial cells','Unit long question: carbohydrates','Unit standard answers'],b:['Transport circulation 運輸循環','Vessels, contents & directions 血管','Food fates & liver functions 同化與肝','Absorption routes vocabulary','Biomolecule identification','Amino acid identification & liver table','Hepatic vessels vocabulary 肝血管','Liver structure & function exercises','Sugary drink & glycogen questions','Worked nutrient pathways','Worked amino-acid pathway','Worked liver structures & functions','Worked glycogen regulation','Transport & liver concept checks','Transport & liver concept checks','Liver vessels long question','Transport & liver answers','Large intestine & egestion 大腸與排遺','Egestion concept checks','Spinach, assimilation & fibre','Intestinal surgery applications','Egestion and surgery answers','Anatomical reference plates','Histology reference plates','Digestion & absorption summary','Unit multiple-choice questions','Unit multiple-choice questions','Unit glucose absorption question','Unit meat digestion question','Unit gall bladder question','Unit lactose intolerance question','Unit liver vessels question','Unit circulation question','Unit lipid essay question','Unit standard answers','Unit standard answers','Unit essay standard answer']};
 $('#searchResults').hidden=false;$('#searchSummary').textContent='Complete source library · 66 / 66 pages · 原筆記全部內容';
 modalItems=S.flatMap(d=>d.pages.map(p=>`<button class="source-card" data-source="${d.id}:${p.n}"><img src="${p.image}" alt="" loading="lazy"><strong>${d.id.toUpperCase()} · p.${p.n} ${reviewed.includes(`${d.id}:${p.n}`)?'✓':''}</strong><span>${esc(titles[d.id][p.n-1])}</span></button>`));modalPage=0;renderModalPage();
};
function font(delta){state.font=Math.max(14,Math.min(38,state.font+delta));document.documentElement.style.setProperty('--size',state.font+'px');save('nutrition-font',state.font);requestAnimationFrame(fitPanels)}$('#fontDown').onclick=()=>font(-2);$('#fontUp').onclick=()=>font(2);font(0);
function search(){const term=$('#search').value.trim();if(!term){$('#searchResults').hidden=true;return}const found=[];S.forEach(d=>d.pages.forEach(p=>{const index=p.text.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());if(index>=0)found.push({doc:d.id,page:p.n,text:p.text.slice(Math.max(0,index-70),index+180)})}));$('#searchResults').hidden=false;$('#searchSummary').textContent=`${found.length} matching pages · 符合頁面`;modalItems=found.map(x=>`<button class="search-card" data-source="${x.doc}:${x.page}"><strong>${x.doc==='a'?'7.5–7.6':'7.6–7.7'} · p.${x.page}</strong><p>${esc(x.text.slice(0,innerWidth<760?100:220))}</p></button>`);if(!modalItems.length)modalItems=['<p>No matching extracted text. Text inside diagrams may need visual inspection. 未找到文字；圖中的文字可能需直接查看原頁。</p>'];modalPage=0;renderModalPage();}

let searchTimer;$('#search').oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(search,300)};$('#closeSearch').onclick=()=>$('#searchResults').hidden=true;
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setTool('move');$('#searchResults').hidden=true;$('#modelPanel').classList.remove('model-expanded');$$('.diagram-expand,[data-scene="expand"]').forEach(b=>{b.textContent='⛶ Enlarge 放大';b.setAttribute('aria-pressed','false')});requestAnimationFrame(()=>anatomy3D?.resize())}if(e.target.closest('input,select,textarea,button,summary'))return;if(e.key===' '){e.preventDefault();state.playing=!state.playing;updatePlay()}if(e.key==='ArrowRight'){if(!state.panels.includes('notes')||e.shiftKey)setTopic(state.topic+1);else if(state.page<S.find(x=>x.id===state.doc).pages.length)showSource(state.doc,state.page+1)}if(e.key==='ArrowLeft'){if(!state.panels.includes('notes')||e.shiftKey)setTopic(state.topic-1);else if(state.page>1)showSource(state.doc,state.page-1)}});
document.addEventListener('visibilitychange',()=>last=0);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#notesPanel').classList.remove('notes-expanded');$('#noteExpand').textContent='⛶ Enlarge 放大';$('#noteExpand').setAttribute('aria-pressed','false')}});
const canvas=$('#ink'),ctx=canvas.getContext('2d');let strokes=safeParse('nutrition-ink',{}),working=null,undoStack=[],lasers=[];
const inkKey=()=>`${lesson.id}:${state.doc}:${state.page}`;
const pageInkKey=()=>`page:${state.doc}:${state.page}`;
const notesVisible=()=>!$('#notesPanel').hidden&&$('#noteViewport').clientWidth>0;
const visibleInkKeys=()=>notesVisible()?[inkKey(),pageInkKey()]:[inkKey()];
function resizeInk(){const dpr=devicePixelRatio||1;canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);redrawInk()}
function viewportPoint(s,p){if(s.space==='page'){const r=$('#noteSheet').getBoundingClientRect();return [r.left+p[0]*r.width,r.top+p[1]*r.height]}return [p[0]*innerWidth,p[1]*innerHeight]}
function drawStroke(s){
 if(!s.points.length||s.space==='page'&&(!notesVisible()||s.storageKey!==pageInkKey()))return;
 ctx.save();
 if(s.space==='page'){const v=$('#noteViewport').getBoundingClientRect(),r=$('#noteSheet').getBoundingClientRect();ctx.beginPath();ctx.rect(v.left,v.top,v.width,v.height);ctx.clip();ctx.beginPath();ctx.rect(r.left,r.top,r.width,r.height);ctx.clip()}
 ctx.beginPath();ctx.strokeStyle=s.colour;ctx.lineWidth=s.space==='page'?Math.max(1.5,$('#noteSheet').clientWidth*.003):3;ctx.lineCap='round';ctx.lineJoin='round';s.points.forEach((p,i)=>{const [x,y]=viewportPoint(s,p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});if(s.points.length===1){const [x,y]=viewportPoint(s,s.points[0]);ctx.lineTo(x+.2,y+.2)}ctx.stroke();ctx.restore();
}
function redrawInk(){ctx.clearRect(0,0,innerWidth,innerHeight);visibleInkKeys().forEach(key=>(strokes[key]||[]).forEach(drawStroke));if(working)drawStroke(working)}
function setTool(tool){state.tool=tool;canvas.style.pointerEvents=tool==='move'?'none':'auto';canvas.style.cursor=tool==='eraser'?'cell':'crosshair';$$('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===tool));if(tool==='move'){lasers=[];redrawInk()}}
$$('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
function backupInk(keys=visibleInkKeys()){undoStack.push({snapshots:Object.fromEntries(keys.map(key=>[key,JSON.stringify(strokes[key]||[])]))});if(undoStack.length>50)undoStack.shift()}
function inPaper(e){if(!notesVisible())return false;const v=$('#noteViewport').getBoundingClientRect(),r=$('#noteSheet').getBoundingClientRect();return e.clientX>=Math.max(v.left,r.left)&&e.clientX<=Math.min(v.right,r.right)&&e.clientY>=Math.max(v.top,r.top)&&e.clientY<=Math.min(v.bottom,r.bottom)}
function eventPoint(e,space){if(space==='page'){const r=$('#noteSheet').getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}return [e.clientX/innerWidth,e.clientY/innerHeight]}
canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);if(state.tool==='laser'){lasers.push({x:e.clientX,y:e.clientY,time:performance.now()});return}if(state.tool==='pen'){const space=inPaper(e)?'page':'viewport',key=space==='page'?pageInkKey():inkKey();backupInk([key]);working={colour:$('#inkColor').value,space,storageKey:key,points:[eventPoint(e,space)]}}if(state.tool==='eraser'){backupInk();erase(e)}redrawInk()};
function erase(e){visibleInkKeys().forEach(key=>{strokes[key]=(strokes[key]||[]).filter(s=>!s.points.some(p=>{const [x,y]=viewportPoint(s,p);return Math.hypot(x-e.clientX,y-e.clientY)<22}))});redrawInk()}
canvas.onpointermove=e=>{if(state.tool==='laser'&&e.buttons){lasers.push({x:e.clientX,y:e.clientY,time:performance.now()});return}if(working){if(working.space==='page'&&working.storageKey!==pageInkKey())return;working.points.push(eventPoint(e,working.space));redrawInk()}if(state.tool==='eraser'&&e.buttons)erase(e)};
function finishInk(){if(working){const key=working.storageKey;(strokes[key]??=[]).push(working);working=null}save('nutrition-ink',strokes);redrawInk()}canvas.onpointerup=finishInk;canvas.onpointercancel=finishInk;
$('#clear').onclick=()=>{backupInk();visibleInkKeys().forEach(key=>strokes[key]=[]);save('nutrition-ink',strokes);redrawInk()};$('#undo').onclick=()=>{const keys=visibleInkKeys();let index=-1;for(let i=undoStack.length-1;i>=0;i--)if(Object.keys(undoStack[i].snapshots).some(key=>keys.includes(key))){index=i;break}if(index>=0){const [old]=undoStack.splice(index,1);Object.entries(old.snapshots).forEach(([key,value])=>strokes[key]=JSON.parse(value));save('nutrition-ink',strokes);redrawInk()}};
$('#noteViewport').addEventListener('scroll',redrawInk,{passive:true});
window.addEventListener('scroll',redrawInk,{passive:true});
function drawLaser(time){if(!lasers.length)return;lasers=lasers.filter(p=>time-p.time<1600);redrawInk();lasers.forEach(p=>{ctx.globalAlpha=1-(time-p.time)/1600;ctx.fillStyle='#f43f5e';ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1}
function fitPanels(){
 document.body.classList.remove('classroom-fit');$('#fitAll').setAttribute('aria-pressed','true');$('#lessonText').style.cssText='';
 const content=$('#practice'),panel=$('#practicePanel');if(!panel.hidden){const w=Math.max(1,panel.clientWidth-24),h=Math.max(1,panel.clientHeight-43);content.style.cssText=`width:${w}px;transform:none;transform-origin:top left`;const height=content.scrollHeight,scale=window.ViewportLayout.fitScale(w,h,w,height);content.style.transform=`scale(${scale})`;}
 anatomy3D?.resize();
}
$('#fitAll').textContent='Fit screen 適合畫面';$('#fitAll').onclick=()=>{anatomy3D?.resetView?.();fitPanels();fitNote()};
const explanation=$('.mechanism-explanation');$('#textPanel').insertBefore(explanation,$('#lessonText'));
const stepDetail=document.createElement('aside');stepDetail.id='currentStepExplanation';stepDetail.setAttribute('aria-live','polite');$('#textPanel').insertBefore(stepDetail,explanation);
new ResizeObserver(()=>requestAnimationFrame(fitPanels)).observe($('#textPanel'));
new ResizeObserver(()=>requestAnimationFrame(fitPanels)).observe($('#practice'));
window.addEventListener('resize',()=>{resizeInk();panelLayout();fitPanels();if(!$('#searchResults').hidden)renderModalPage()});panelLayout();setTopic(state.topic);resizeInk();raf=requestAnimationFrame(tick);
function applyEmbed(opts={}){if(opts.view){state.modelView=opts.view;if(lesson.mode==='liver'&&opts.view==='notes')state.function=5}if(opts.application!=null)state.application=opts.application;if(opts.diseaseComparison!=null){state.diseaseComparison=opts.diseaseComparison;state.compareBoth=false}if(opts.topic!=null)setTopic(opts.topic);renderControls();renderModel();updatePlay();}
window.NutritionApp={state,lessons:L,sources:S,setTopic,showSource,renderModel,applyEmbed};
})();
