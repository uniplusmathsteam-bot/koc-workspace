/* Organ-level liver mechanisms. Symbols represent substances, not atomic structures. */
(() => {
'use strict';
const T=window.THREE,P=window.AnatomyScene?.prototype;if(!T||!P)return;
const v=p=>new T.Vector3(...p),ease=(a,b,t)=>T.MathUtils.smoothstep(t,a,b);
function ball(parent,p,r,color,name=''){const m=new T.Mesh(new T.SphereGeometry(r,14,10),new T.MeshStandardMaterial({color,roughness:.45}));m.position.set(...p);m.name=name;parent.add(m);return m}
function pipe(parent,points,r,color){const path=new T.CatmullRomCurve3(points.map(v)),mesh=new T.Mesh(new T.TubeGeometry(path,40,r,7,false),new T.MeshStandardMaterial({color,roughness:.5}));parent.add(mesh);return path}
function travel(scene,points,color,count,start,end,name){const path=new T.CatmullRomCurve3(points.map(v)),items=[];for(let i=0;i<count;i++)items.push(ball(scene.root,points[0],.075,color,name));scene.dynamic.push(t=>items.forEach((m,i)=>{const q=(t-start-i*.025)/(end-start);m.visible=q>=0&&q<=1;m.position.copy(path.getPoint(T.MathUtils.clamp(q,0,1)))}));return items}
function granules(scene,reverse=false){const nodes=[];for(let i=0;i<24;i++){const x=-1.1+(i%6)*.19,y=.2+Math.floor(i/6)*.19;const b=ball(scene.root,[x,y,.85],.075,'#dbb644','work-glycogen');nodes.push(b);if(i%6){pipe(scene.root,[[x-.19,y,.85],[x,y,.85]],.018,'#bca143');b.userData.bond=scene.root.children[scene.root.children.length-1]}}
 scene.dynamic.push(t=>nodes.forEach((m,i)=>{const progress=ease(.43,.9,t),fraction=reverse?1-.75*progress:.25+.75*progress;m.visible=i/24<fraction;if(m.userData.bond)m.userData.bond.visible=m.visible}));return nodes}
P.buildLiverWork=function(s){
 this.homeZ=9.5;this.camera.position.set(0,-.15,this.homeZ);this.root.rotation.set(-.06,-.12,0);
 const organ=this.liver(this.root,[0,.5,0],1.05);organ.gall.visible=false;organ.duct.visible=false;
 const shell=this.tissue.find(item=>item.material===organ.capsule.material);if(shell)shell.windowed=true;
 const ha=pipe(this.root,[[3.3,1.7,.2],[2.65,1,.2],[1.5,.5,.3]],.105,'#cc3e43');
 const hp=pipe(this.root,[[1.05,-2.3,.15],[1.05,-.8,.2],[1.5,.5,.3]],.14,'#586cad');
 const hv=pipe(this.root,[[-1.5,.5,.3],[-2.55,1.25,.2],[-3.25,2,.2]],.15,'#426d9f');
 for(let i=0;i<7;i++){const y=.05+i*.15;pipe(this.root,[[1.5,.5,.3],[.9,y,.4],[0,y+.05,.4],[-.9,y,.4],[-1.5,.5,.3]],.022,'#9c668e')}
 this.addFlow(ha,'#e9aaa2',6,.045,.65);this.addFlow(hp,'#e9bf7d',8,.045,.65);this.addFlow(hv,'#abc8e2',7,.045,.65);
 this.label('Hepatic artery 肝動脈',[2.55,1,.3],{className:'red'});this.label('Hepatic portal vein 肝門靜脈',[1.05,-1.2,.2],{className:'blue'});this.label('Hepatic vein 肝靜脈',[-2.55,1.25,.3],{className:'blue'});this.label('Liver capillaries 肝微血管',[.9,.85,.4],{className:'purple'});
 const f=+s.function;
 if(f===0){const fast=s.situation==='fasting';granules(this,fast);
  if(fast)travel(this,[[-.7,.5,.9],[-1.5,.5,.6],[-2.55,1.25,.25],[-3.25,2,.25]],'#e9c342',7,.45,.97,'work-glucose-out');
  else travel(this,[[1.05,-2.1,.3],[1.5,.5,.55],[.3,.8,.9],[-.55,.5,.9]],'#e9c342',7,0,.48,'work-glucose-in');
  this.label('Glycogen store 糖原儲存',[-.7,.55,.95],{className:'gold'});this.label(fast?'Glucose released 葡萄糖釋放':'Glucose taken up 攝取葡萄糖',fast?[-2,1.6,.5]:[1.45,-.35,.6],{className:'gold'});
 }
 if(f===1){granules(this);const stores=[];for(let i=0;i<4;i++){const m=ball(this.root,[.55+(i%2)*.24,.05+Math.floor(i/2)*.25,.85],.1,'#b27b64','work-iron');stores.push(m)}
  for(let i=0;i<4;i++){const m=ball(this.root,[-.75+i*.35,1.05,.8],.115,['#d29b43','#8aac76','#bb846d','#9187b4'][i],'work-vitamin');stores.push(m)}
  this.dynamic.push(t=>stores.forEach((m,i)=>m.scale.setScalar(.25+.75*ease(.15+i*.04,.65+i*.04,t))));
  this.label('Glycogen 糖原',[-.65,.45,.9],{className:'gold'});this.label('Iron 鐵',[.75,.3,.9]);this.label('Vitamins A, D, E, K 維生素',[-.2,1.1,.9],{className:'green'});
 }
 if(f===2&&s.production==='bile'){
  const gall=ball(this.root,[.35,-.9,.35],.4,'#789849','work-gall-bladder');gall.scale.set(.65,1.3,.65);
  const toGall=pipe(this.root,[[0,.1,.4],[.1,-.45,.4],[.35,-.65,.4]],.06,'#b9ad46');
  const toGut=pipe(this.root,[[.35,-.8,.4],[.45,-1.5,.4],[1.45,-1.8,.4]],.07,'#b9ad46');
  pipe(this.root,[[2,-1.15,.2],[2.25,-1.75,.2],[1.7,-2.25,.2],[.9,-2.05,.2]],.25,'#d4a18a');
  travel(this,[[0,.1,.5],[.1,-.45,.5],[.35,-.85,.5]],'#d8cf4f',8,0,.5,'work-bile-made');
  travel(this,[[.35,-.85,.5],[.45,-1.5,.5],[1.45,-1.8,.5]],'#d8cf4f',9,.58,.96,'work-bile-released');
  this.dynamic.push(t=>{const fill=ease(.15,.5,t),release=ease(.58,.95,t),k=.75+.3*fill-.35*release;gall.scale.set(.65*k,1.3*k,.65*k)});
  this.label('Gall bladder stores bile 膽囊儲膽',[.35,-.9,.7],{className:'green'});this.label('Bile duct 膽管',[.5,-1.5,.45],{className:'green'});this.label('Duodenum 十二指腸',[1.7,-2,.45]);
 }
 if(f===2&&s.production==='carotene'){
  const input=travel(this,[[1.05,-2,.3],[1.5,.5,.5],[-.4,.6,.85]],'#e79539',6,0,.48,'work-carotene');
  const product=Array.from({length:7},(_,i)=>ball(this.root,[-.8+(i%4)*.3,.35+Math.floor(i/4)*.3,.85],.11,'#e1c758','work-vitamin-A'));
  this.dynamic.push(t=>product.forEach((m,i)=>m.visible=t>.42+i*.05));this.label('Carotene 胡蘿蔔素',[1.2,-.5,.5],{className:'gold'});this.label('Vitamin A 維生素 A',[-.4,.6,.9],{className:'gold'});
 }
 if(f===3){const groups=[];for(let i=0;i<5;i++){const g=new T.Group();this.root.add(g);const rest=ball(g,[0,0,0],.105,'#dfb14f','work-remainder'),nitrogen=ball(g,[.13,.1,0],.065,'#9476b7','work-nitrogen');groups.push({g,nitrogen,i})}
  this.dynamic.push(t=>groups.forEach(({g,nitrogen,i})=>{const q=ease(i*.025,.3+i*.025,t);g.position.set(1.05*(1-q)+(-.9+i*.35)*q,-1.8*(1-q)+.45*q,.7);nitrogen.position.set(.13+ease(.32,.6,t)*.6,.1+ease(.32,.6,t)*.55,0);nitrogen.visible=t<.65}));
  travel(this,[[.6,1.1,.9],[-1.5,.5,.5],[-2.55,1.25,.25],[-3.25,2,.25]],'#75a9c4',5,.62,.99,'work-urea');
  this.label('Excess amino acids 過量氨基酸',[.8,-.3,.8],{className:'purple'});this.label('Nitrogen removed 移除含氮部分',[.6,1.1,.95],{className:'purple'});this.label('Urea leaves liver 尿素離開肝',[-2,1.8,.5],{className:'blue'});this.label('Remaining parts reused 其餘部分再利用',[-.6,.35,.9],{className:'gold'});
 }
 if(f===4){const substrates=[],products=[];for(let i=0;i<7;i++){substrates.push(ball(this.root,[-.9+(i%4)*.35,.3+Math.floor(i/4)*.4,.85],.12,'#b187b5','work-peroxide'));products.push(ball(this.root,[-1.1+i*.3,.1,.9],.075,'#6dafe0','work-water'));products.push(ball(this.root,[-1.1+i*.3,.8,.9],.075,'#d5e8ee','work-oxygen'))}
  const enzyme=ball(this.root,[.2,.6,.75],.24,'#80a572','work-catalase');enzyme.scale.set(1,.6,1);
  this.dynamic.push(t=>{substrates.forEach((m,i)=>{m.scale.setScalar(Math.max(.001,1-ease(.2+i*.035,.65+i*.035,t)));m.visible=t<.87});products.forEach((m,i)=>{const q=ease(.42+i*.012,.85+i*.008,t);m.visible=q>0;m.scale.setScalar(q);m.position.y=(i%2?.8:.1)+(i%2?1:-1)*q*.3})});
  this.label('Hydrogen peroxide 過氧化氫',[-.7,.4,.95],{className:'purple'});this.label('Catalase 過氧化氫酶',[.2,.6,.95],{className:'green'});this.label('Water + oxygen 水＋氧',[-.6,1,.95],{className:'blue'});
 }
};
})();
