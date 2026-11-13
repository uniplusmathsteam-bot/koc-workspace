/* Presentation changes only: particle paths, state and original notes are
   untouched. Native-size legend text stays legible when SVG diagrams shrink. */
(() => {
'use strict';
const item=(shape,color,en,zh)=>({shape,color,en,zh});
const glucose=item('hex','#c68a16','Glucose','葡萄糖'),amino=item('square','#8158a0','Amino acids','氨基酸'),water=item('dot','#298bb6','Water','水'),fat=item('oval','#bd7332','Fat components','脂肪成分'),rbc=item('oval','#b54c61','Red blood cell','紅血球'),oxygen=item('oxygen','#68a7bd','Oxygen (O₂)','氧');
function spec(mode,s){
 if(mode==='application'){
  const known={
   coeliac:[glucose,water,item('line','#b56e81','Capillary blood','微血管血液'),item('gate','#438e76','Transport protein','運輸蛋白')],
   lactose:s.phase>.76?[item('pair','#c68a16','Lactose','乳糖'),item('oval','#79935c','Bacteria','細菌'),item('ring','#87966e','Gas','氣體'),water]:[glucose,item('dot','#9365a2','Galactose','半乳糖'),item('enzyme','#b78a42','Lactase','乳糖酶'),item('gate','#4d9a82','Transport protein','運輸蛋白')],
   pancreatic:[item('dot','#378b78','Digestive enzyme','消化酶'),item('tg','#c47b36','Triglyceride','甘油三酯'),item('chain','#c47b36','Fatty-acid chain','脂肪酸鏈'),item('dot','#8c90a7','Glycerol component','甘油成分'),item('block','#b54e4c','Duct obstruction','胰管阻塞')],
   cirrhosis:[item('dot','#e4ad91','Functioning tissue','功能組織'),item('line','#a89c8e','Fibrous scar','纖維疤痕'),item('dot','#bbc46e','Bile','膽汁')],
   anaemia:s.phase<.4?[rbc,item('dot','#896344','Iron','鐵')]:[rbc,oxygen],
   scurvy:[item('dot','#609b62','Vitamin C','維生素 C'),item('line','#b18c72','Collagen fibres','膠原纖維')]
  };if(known[s.application])return {box:[0,130,1120,525],items:known[s.application],note:s.application==='pancreatic'?'School digestion model: fatty acids + glycerol. 課程消化模型：脂肪酸及甘油。':'',omit:['Gold hexagon:','Green rods:','Green:','Brown dots:']};return null;
 }
 if(mode==='villi'){
  const key=s.adaptation||'absorption',boxes={absorption:[0,110,1120,590],long:[0,130,1120,640],folds:[0,130,1120,590],microvilli:[0,165,1120,590],energy:[0,165,1120,590],wall:[0,130,1120,610],blood:[0,130,1120,625],lacteal:[0,145,1120,600],mixing:[0,85,1120,670]};
  const items=key==='absorption'?[glucose,amino,water,item('dot','#57905f','Ions / B, C','離子／B、C'),fat,item('dot','#a19328','Vitamins ADEK','維生素 ADEK')]:key==='lacteal'?[item('chain','#c47b36','Fatty-acid chain','脂肪酸鏈'),item('dot','#8c90a7','Glycerol component','甘油成分'),item('ring','#769753','Packaged fat','包裝後脂肪')]:key==='energy'?[glucose,item('dot','#cba62e','ATP','ATP'),item('dot','#488db1','Na⁺','鈉離子')]:key==='wall'?[water,item('line','#4c81a5','Capillary blood','微血管血液')]:key==='blood'?[glucose,item('line','#b45165','Arteriole','小動脈'),item('line','#477ba7','Venule','小靜脈')]:[glucose];
  return {box:boxes[key]||boxes.absorption,items:key==='absorption'&&s.absorptionGroup==='water'?[...items.slice(0,4),item('gate','#438e76','Transport protein','運輸蛋白')]:key==='absorption'&&s.absorptionGroup==='lipid'?items.slice(4):key==='absorption'?[...items,item('gate','#438e76','Transport protein','運輸蛋白')]:key==='folds'?[glucose,item('line','#3f917c','Surface trace','表面輪廓追蹤')]:items,note:key==='absorption'?'Transverse section 橫切面':key==='lacteal'?'Lumen 腸腔 → epithelial cell 上皮細胞 → lacteal 乳糜管':key==='energy'||key==='microvilli'?'Lumen 腸腔 → epithelial cell 上皮細胞 → blood 血液':key==='folds'?'The structure stays fixed; green traces its exposed surface. 結構固定，綠色追蹤其暴露表面。':'',omit:key==='absorption'?['Glucose','Amino acids','Water','Mineral ions / B, C','Fat products','Vitamins A, D, E, K','Cross-section —']:[]};
 }
 if(mode==='route')return {box:[0,55,1120,660],items:[item('ring','#d4b257','Selected nutrient','追蹤營養素'),rbc,...(s.route==='lipid'?[item('line','#9caa45','Lymph','淋巴')]:[])],note:'Schematic. Heart detail: right → lungs → left. 循環示意；心臟細節：右心 → 肺 → 左心。'};
 if(mode==='liver'&&+s.function===2&&s.production!=='carotene')return {box:[0,135,1120,610],items:[item('dot','#9a9a2e','Bile','膽汁'),item('oval','#d49a3d','Fat droplet','脂肪滴')]};
 if(mode==='fates'||mode==='glucose'||mode==='liver'){
  const regulation=mode==='glucose'&&s.situation!=='protein'||mode==='liver'&&+s.function===0&&s.situation!=='protein';
  if(regulation)return {box:[0,75,1120,635],items:[glucose,item('line','#c68a16','Glycogen bonds','糖原鍵結'),item('dot','#367f6a',s.situation==='fasting'?'Glucagon':'Insulin',s.situation==='fasting'?'升糖素':'胰島素')],note:'The hormone binds outside the liver cell. 激素在肝細胞外與受體結合。'};
  if(mode==='liver'&&+s.function===4)return {box:[0,150,1120,550],items:[item('dot','#9b78ad','Hydrogen peroxide','過氧化氫'),water,oxygen,item('enzyme','#92b78b','Catalase','過氧化氫酶')]};
  if(mode==='liver'&&+s.function===2&&s.production==='carotene')return {box:[0,230,1120,500],items:[item('line','#d58a35','β-carotene','β-胡蘿蔔素'),item('line','#a39127','Vitamin A precursors','維生素 A 前體')],note:s.carbonTracking?'Dots track carbon portions; the molecular shape is simplified. 圓點追蹤碳的部分，分子外形已簡化。':''};
  if(mode==='liver'&&+s.function===1)return {box:[0,75,1120,635],items:[glucose,item('dot','#9b5d40','Iron','鐵'),item('dot','#367f6a','Vitamins ADEK','維生素 ADEK')]};
  const kind=mode==='fates'?window.MechanismCore.fateKind(s):'deamination';
  if(kind==='deamination')return {box:[0,75,1120,635],items:[amino,item('dot','#c79831','Carbon part','碳骨架'),item('dot','#267f9c','Urea','尿素')]};
  if(kind==='energy')return {box:[0,75,1120,635],items:[glucose,oxygen,water,item('co2','#75828b','Carbon dioxide (CO₂)','二氧化碳')],note:'One glucose + 6 O₂ → 6 CO₂ + 6 H₂O; energy is released. 一個葡萄糖＋6 O₂ → 6 CO₂＋6 H₂O，釋放能量。'};
  if(kind==='protein')return {box:[0,75,1120,635],items:[amino,item('line','#8158a0','Protein chain','蛋白質鏈')]};
  if(kind==='glycogen')return {box:[0,75,1120,635],items:[glucose,item('line','#c68a16','Glycogen','糖原')]};
  if(kind==='hormone')return {box:[0,100,1120,615],items:[item('dot','#b69b3b','Cholesterol','膽固醇'),item('dot','#dc73a2','Steroid hormone','類固醇激素')]};
  const fa=item('chain','#c67932','Fatty-acid chain','脂肪酸鏈');
  return {box:[0,100,1120,615],items:kind==='membrane'?[fa,item('dot','#697f96','Glycerol component','甘油成分'),item('dot','#478bb0','Phosphate component','磷酸成分'),item('phospholipid','#478bb0','Phospholipid','磷脂')]:[...((s.nutrient||'').startsWith('Glucose')?[glucose,fa]:[fa]),item('dot','#697f96','Glycerol component','甘油成分'),item('tg','#c67932','Triglyceride','甘油三酯')],note:kind==='membrane'?'New coloured molecules fill the faded existing bilayer. 新造有色分子整合進淡色的原有雙層。':''};
 }
 return null;
}
function compact(svg,config){if(!config)return svg;const [x,y,w,h]=config.box,limit=y+h;
 return svg.replace(/viewBox="[^"]+"/,`viewBox="${x} ${y} ${w} ${h}"`).replace(/<text\b[^>]*>[\s\S]*?<\/text>/g,node=>{const match=node.match(/\by="([\d.-]+)"/);if(!match)return node;const yy=+match[1],dy=[...node.matchAll(/\bdy="([\d.-]+)"/g)].reduce((n,m)=>n+(+m[1]),0),en=node.match(/>([^<]*)/)?.[1]||'';if(yy<y+16||yy+dy>limit-4||(config.omit||[]).some(t=>en.startsWith(t)))return '';return node});
}
function legend(items,note=''){return `<div class="diagram-legend" aria-label="Material key 物質圖例">${items.map(a=>`<span class="diagram-key"><i class="key-symbol key-${a.shape}" style="--key-color:${a.color}" aria-hidden="true"></i><span>${a.en} <span lang="zh-Hant">${a.zh}</span></span></span>`).join('')}${note?`<span class="diagram-key-note">${note}</span>`:''}</div>`}
window.DiagramPresentation={spec,compact,legend};
window.presentLearningScene=(mode,s,svg)=>{const config=spec(mode,s);return config?compact(svg,config)+legend(config.items,config.note):svg};
})();
