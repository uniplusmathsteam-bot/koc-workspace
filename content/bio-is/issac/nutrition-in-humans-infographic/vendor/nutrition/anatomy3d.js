/* Local, deterministic anatomical models. Motion changes geometry and transports
   molecules through connected compartments; labels are separate from the motion. */
(() => {
'use strict';
const T=window.THREE;
if(!T)return;
const PI=Math.PI,TAU=2*PI,vec=(x,y,z=0)=>new T.Vector3(x,y,z);
function geometry(fn,nu=64,nv=40){
 const vertices=[],uv=[],indices=[];
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){vertices.push(...fn(i/nu,j/nv));uv.push(i/nu,j/nv)}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){let a=j*(nu+1)+i,b=a+nu+1;indices.push(a,b,a+1,b,b+1,a+1)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function texture(){
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),d=x.createImageData(128,128);
 for(let i=0;i<128*128;i++){const n=130+20*Math.sin(i*3.147)*Math.cos(i*.537)+10*Math.sin(i*.045);for(let j=0;j<3;j++)d.data[i*4+j]=n;d.data[i*4+3]=255}x.putImageData(d,0,0);const map=new T.CanvasTexture(c);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(5,3);return map;
}
const tissueTexture=texture();
function mat(color,options={}){return new T.MeshPhysicalMaterial({color,roughness:.48,metalness:0,clearcoat:.25,clearcoatRoughness:.38,bumpMap:tissueTexture,bumpScale:.025,...options})}
function mesh(g,m,parent){const e=new T.Mesh(g,m);parent.add(e);return e}
function sphere(parent,position,scale,material){const size=Math.max(...scale),segments=size<.16?[10,7]:size<.4?[18,12]:[36,24],e=mesh(new T.SphereGeometry(1,...segments),material,parent);e.position.set(...position);e.scale.set(...scale);return e}
function curve(points){return new T.CatmullRomCurve3(points.map(p=>vec(...p)))}
function tube(parent,points,radius,material){const path=points.getPoint?points:curve(points),segments=radius<.035?24:radius<.09?48:80,e=mesh(new T.TubeGeometry(path,segments,radius,radius<.035?6:10,false),material,parent);return {mesh:e,path}}
function drop(parent,position,scale,color){return sphere(parent,position,scale,mat(color,{roughness:.3,clearcoat:.55}))}
function smoothstep(a,b,t){t=T.MathUtils.clamp((t-a)/(b-a),0,1);return t*t*(3-2*t)}

function routeSample(segments,t){const q=Math.max(0,Math.min(1,t)),n=segments.length,index=Math.min(n-1,Math.floor(q*n));return{index,local:q===1?1:q*n-index}}
function routeTeaching(s){const lipid=s.route==='lipid',labels=lipid?['Lymph vessels 淋巴管','Thoracic duct 胸導管','Left venous junction 左靜脈角','Venous blood → right heart 靜脈血 → 右心']:['Gut capillaries 小腸微血管','Hepatic portal vein 肝門靜脈','Liver capillaries 肝微血管','Hepatic vein 肝靜脈','Vena cava → right heart 腔靜脈 → 右心'];const steps=lipid?['Start after a fat package has entered a lacteal. Follow the ONE orange, white-outlined marker in lymph. 由脂質微粒已進乳糜管開始；追蹤橙色白邊標記，隨淋巴流動。','The same package moves up the thoracic duct; it has not yet entered blood. 同一微粒沿胸導管向上，尚未進入血液。','The thoracic duct empties into venous blood at the left venous junction. 胸導管在左靜脈角把淋巴送入靜脈血。','The same marker now travels in venous blood to the right heart. Lung and systemic circulation follow, outside this view. 同一標記現隨靜脈血回右心；之後的肺循環及體循環不在此圖展示。']:['Start AFTER glucose has entered an intestinal capillary; the white outline identifies ONE glucose marker. 由葡萄糖已入小腸微血管開始；白邊標示一個葡萄糖標記。','Portal blood carries glucose from intestinal capillaries toward the liver. 門靜脈血把葡萄糖由小腸微血管帶往肝臟。','The marker enters a second capillary bed inside the liver. 肝門靜脈連接肝內第二組微血管。','Blood leaves the liver through hepatic veins. This is drainage, not hepatic arterial supply. 血液由肝靜脈離開肝臟；此為流出途徑，並非肝動脈供血。','The inferior vena cava returns blood to the right heart. Further circulation is omitted. 下腔靜脈把血液送回右心；此圖省略之後的循環。'];return{where:lipid?'Long-chain fat: lymph first 長鏈脂肪先入淋巴':'Glucose: portal route 葡萄糖門靜脈途徑',labels,steps,breaks:Array.from({length:labels.length+1},(_,i)=>i/labels.length)}}
window.TransportJourney={sample:routeSample,teaching:routeTeaching};

class AnatomyScene{
 constructor(host){
  this.host=host;this.scene=new T.Scene();this.scene.background=new T.Color('#f3f5ef');
  this.camera=new T.PerspectiveCamera(33,1,.1,100);this.camera.position.set(0,.2,13);
  try{this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch(error){this.failed=true;host.innerHTML='<p>3D unavailable in this browser. Open the original diagrams in Notes.</p>';return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=.85;r.localClippingEnabled=true;this.cutPlane=new T.Plane(vec(0,0,-1),.08);
  r.domElement.setAttribute('role','img');r.domElement.setAttribute('aria-label','Interactive three-dimensional anatomical teaching model');
  host.innerHTML='<div class="scene-viewport"><svg class="scene-leaders" aria-hidden="true"></svg><div class="scene-labels"></div><div class="scene-status">3D ANATOMY · DRAG TO ROTATE · 拖曳旋轉</div><div class="scene-actions"><button data-scene="expand" aria-pressed="false">⛶ Enlarge 放大模型</button><button data-scene="home" title="Reset camera">⌂</button><button data-scene="zoom-in" title="Zoom in">＋</button><button data-scene="zoom-out" title="Zoom out">−</button><button data-scene="labels" aria-pressed="true">Labels 標示</button><button data-scene="tissue" aria-pressed="true">Cutaway 剖面</button></div></div>';
  this.viewport=host.querySelector('.scene-viewport');this.viewport.prepend(r.domElement);this.labelLayer=host.querySelector('.scene-labels');this.leaders=host.querySelector('.scene-leaders');
  this.scene.add(new T.HemisphereLight(0xffffff,0xb6a095,.65));
  for(const [color,power,pos] of [[0xfff0df,1.05,[-5,7,8]],[0xffffff,.35,[5,3,5]],[0xcde4ed,.55,[1,4,-6]]]){const light=new T.DirectionalLight(color,power);light.position.set(...pos);this.scene.add(light)}
  this.root=new T.Group();this.scene.add(this.root);this.root.rotation.set(-.08,-.08,0);this.labels=[];this.flows=[];this.dynamic=[];this.tissue=[];this.opacity=true;this.showLabels=true;this.key='';this.phase=0;this.atlas=true;
  const atlasButton=document.createElement('button');atlasButton.dataset.scene='atlas';atlasButton.textContent='3D geometry 立體模型';host.querySelector('.scene-actions').prepend(atlasButton);
  this.atlasTexture=new T.TextureLoader().load('assets/portal-anatomy-reference.png',()=>this.render());this.atlasTexture.encoding=T.sRGBEncoding;
  this.surfaceTexture=new T.TextureLoader().load('assets/intestinal-tissue.png',()=>this.render());this.surfaceTexture.encoding=T.sRGBEncoding;this.surfaceTexture.wrapS=this.surfaceTexture.wrapT=T.RepeatWrapping;this.surfaceTexture.repeat.set(3,2);
  let pointer=null;
  r.domElement.onpointerdown=e=>{if(this.atlas&&this.currentMode==='route')return;pointer={x:e.clientX,y:e.clientY,rx:this.root.rotation.x,ry:this.root.rotation.y};r.domElement.setPointerCapture(e.pointerId)};
  r.domElement.onpointermove=e=>{if(pointer){this.root.rotation.y=pointer.ry+(e.clientX-pointer.x)*.008;this.root.rotation.x=T.MathUtils.clamp(pointer.rx+(e.clientY-pointer.y)*.008,-1,1);this.render()}};
  r.domElement.onpointerup=r.domElement.onpointercancel=()=>pointer=null;
  r.domElement.onwheel=e=>{e.preventDefault();this.camera.position.z=T.MathUtils.clamp(this.camera.position.z+e.deltaY*.008,6,23);this.render()};
  host.querySelector('.scene-actions').onclick=e=>{const b=e.target.closest('[data-scene]');if(!b)return;const a=b.dataset.scene;if(a==='atlas'){this.atlas=!this.atlas;this.key='';b.textContent=this.atlas?'3D geometry 立體模型':'Anatomical atlas 解剖圖';this.setState(this.currentMode,{...this.params,phase:this.phase});return}if(a==='expand'){const panel=host.closest('.panel');panel.classList.toggle('model-expanded');const expanded=panel.classList.contains('model-expanded');b.setAttribute('aria-pressed',expanded);b.textContent=expanded?'↙ Return 返回課室':'⛶ Enlarge 放大模型';requestAnimationFrame(()=>this.resize())}if(a==='home'){this.root.rotation.set(this.atlas&&this.currentMode==='route'?0:-.08,this.atlas&&this.currentMode==='route'?0:-.08,0);this.camera.position.z=this.homeZ||13;this.resetView?.()}if(a==='zoom-in')this.setZoom(this.camera.zoom*1.25);if(a==='zoom-out')this.setZoom(this.camera.zoom/1.25);if(a==='labels'){this.showLabels=!this.showLabels;b.setAttribute('aria-pressed',this.showLabels)}if(a==='tissue'){this.opacity=!this.opacity;b.setAttribute('aria-pressed',this.opacity);this.applyCutaway()}this.render()};
  this.installViewControls?.();
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.viewport);this.resize();
 }
 resize(){const w=this.viewport.clientWidth,h=this.viewport.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.render()}
 clear(){
  this.root.traverse(e=>{if(e.geometry)e.geometry.dispose();if(e.material){const m=Array.isArray(e.material)?e.material:[e.material];m.forEach(x=>x.dispose())}});
  this.root.clear();this.routeJourney=null;this.readableParticles=[];this.labels=[];this.flows=[];this.dynamic=[];this.tissue=[];this.labelLayer.innerHTML='';
 }
 label(text,point,options={}){const e=document.createElement('div');e.className='anatomy-label '+(options.className||'');e.textContent=text;this.labelLayer.append(e);this.labels.push({element:e,point:vec(...point),priority:options.priority||0});return e}
 addFlow(path,color,count=18,size=.045,speed=1,kind='sphere'){
  const g=kind==='blood'?geometry((u,v)=>{const a=u*TAU,b=v*PI,r=Math.sin(b),z=Math.cos(b);return[r*Math.cos(a),r*Math.sin(a),z*(.3+.35*r*r)]},16,12):new T.SphereGeometry(1,10,8),material=mat(color,{roughness:.35,clearcoat:.5});
  const particles=[];for(let i=0;i<count;i++){const p=mesh(g,material,this.root);p.scale.setScalar(size);p.userData.readableParticle=true;p.userData.particleRadius=1;particles.push(p)}
  const f={path,particles,speed,kind,size};this.flows.push(f);return f;
 }
 addLipidFlow(path,count=6,speed=.6){
  const particles=[];
  for(let i=0;i<count;i++){
   const group=new T.Group();this.root.add(group);
   const glycerol=sphere(group,[0,0,0],[.028,.028,.028],mat('#74839a'));
   const fattyAcids=[];for(let k=0;k<3;k++){const acid=mesh(T.CapsuleGeometry?new T.CapsuleGeometry(.012,.075,3,6):new T.CylinderGeometry(.012,.012,.1,6),mat('#c47b36'),group);acid.position.set((k-1)*.06,.05,0);fattyAcids.push(acid)}
   const monoBond=mesh(new T.CylinderGeometry(.005,.005,.045,6),mat('#74839a'),group);monoBond.rotation.z=Math.PI/2;monoBond.position.x=.022;
   const triglyceride=sphere(group,[0,0,0],[.07,.07,.07],mat('#a6b867'));triglyceride.visible=false;group.userData={glycerol,fattyAcids,triglyceride,monoBond,readableParticle:true,particleRadius:.1};particles.push(group);
  }
  this.flows.push({path,particles,speed,kind:'lipid'});
 }
 applyCutaway(){this.tissue.forEach(({material,windowed})=>{material.opacity=windowed&&this.opacity ? .3 : 1;material.transparent=!!(windowed&&this.opacity);material.depthWrite=!material.transparent;material.clippingPlanes=windowed?[]:this.opacity?[this.cutPlane]:[];material.needsUpdate=true});}
 setState(mode,s){
  if(this.failed)return;const key=[mode,s.route,s.nutrient,s.situation,s.function,s.flattened,s.detail||'organ',s.fate||'use',s.transit||'normal',s.production||'bile',s.glucoseStorage||'glycogen',s.application||'coeliac',s.lipidUse||'membrane',s.diseaseComparison||'affected',!!s.compareBoth].join('|');
  if(this.key!==key){if(this.currentMode!==mode){this.camera.zoom=1;this.camera.updateProjectionMatrix();this.root.position.set(0,0,0);}this.key=key;this.clear();this.currentMode=mode;this.params={...s};this.root.rotation.set(-.08,-.08,0);
   this.host.querySelector('[data-scene="atlas"]').hidden=mode!=='route';this.host.querySelector('.scene-status').textContent='3D ANATOMY · DRAG TO ROTATE · 拖曳旋轉';
   if(mode==='route'){if(this.atlas)this.buildAtlas(s);else this.buildCirculation(s)}
   else if(mode==='liver'&&this.buildLiverWork)this.buildLiverWork(s);
   else if(mode==='glucose'||mode==='fates'||mode==='liver')this.buildHepatocytes(mode,s);
   else if(mode==='egestion')this.buildColon(s);
   else if(mode==='application'&&s.application==='scurvy'&&this.buildGumScurvy)this.buildGumScurvy(s);
   else this.buildVilli(s);
   this.prepareReadableParticles?.();this.applyCutaway();this.resize();const zoomReadout=this.host.querySelector('[data-view=readout]');if(zoomReadout)zoomReadout.textContent=Math.round(this.camera.zoom*100)+'%';const zoomSlider=this.host.querySelector('[data-view=zoom]');if(zoomSlider){zoomSlider.value=Math.log2(this.camera.zoom);zoomSlider.setAttribute('aria-valuetext',Math.round(this.camera.zoom*100)+'%')}
  }
  this.update(s.phase,s.playing);
 }
 update(phase,playing){
  if(this.failed)return;this.phase=phase;const t=phase;
  for(const f of this.flows)f.particles.forEach((p,i)=>{const a=(t*f.speed+i/f.particles.length)%1,pos=f.path.getPoint(a);p.position.copy(pos);if(f.kind==='blood'){const tangent=f.path.getTangent(a);p.quaternion.setFromUnitVectors(vec(0,0,1),tangent);p.rotateX(.6*Math.sin(a*TAU))}if(f.kind==='lipid'){const combined=smoothstep(.4,.6,a),d=p.userData;d.glycerol.visible=a<.6;d.fattyAcids.forEach((acid,k)=>{acid.visible=a<.6;acid.position.x=[.052,-.09,.1][k]*(1-combined);acid.position.y=(k===0?0:.075)*(1-combined)});if(d.monoBond){d.monoBond.visible=a<.6;d.monoBond.position.x=.022*(1-combined)}d.triglyceride.visible=a>=.58;d.triglyceride.scale.setScalar(.07*Math.max(.1,combined))}});
  this.dynamic.forEach(fn=>fn(t,playing));this.render();
 }
 render(){
  if(!this.renderer||!this.viewport.clientWidth)return;this.root.updateMatrixWorld(true);
  const width=this.viewport.clientWidth,height=this.viewport.clientHeight,columns=[[],[]];
  this.labels.forEach((l,i)=>{const p=l.point.clone().applyMatrix4(this.root.matrixWorld).project(this.camera),visible=l.enabled!==false&&this.showLabels&&p.z<1&&p.x>-.98&&p.x<.98&&p.y>-.98&&p.y<.98;l.element.hidden=!visible;if(visible){const x=(p.x+1)*.5*width,y=(-p.y+1)*.5*height;columns[i%2].push({l,x,y})}});
  let leaders='';columns.forEach((column,side)=>{column.sort((a,b)=>a.y-b.y);let prev=28;const gap=Math.min(40,(height-65)/Math.max(1,column.length));column.forEach((item,i)=>{const {l,x,y}=item,ly=Math.max(prev,Math.min(y,height-28-(column.length-i-1)*gap));prev=ly+gap;const labelX=side?width-7:7;l.element.style.left=labelX+'px';l.element.style.top=ly+'px';l.element.style.transform=side?'translate(-100%,-50%)':'translate(0,-50%)';const edge=side?labelX-l.element.offsetWidth:labelX+l.element.offsetWidth;leaders+=`<path d="M${edge} ${ly} L${x} ${y}" stroke="#52675a" stroke-width=".8" opacity=".65" fill="none"/><circle cx="${x}" cy="${y}" r="2" fill="#365b4a"/>`})});this.leaders.setAttribute('viewBox',`0 0 ${width} ${height}`);this.leaders.innerHTML=leaders;
  if(this.withReadableParticles)this.withReadableParticles(()=>this.renderer.render(this.scene,this.camera));else this.renderer.render(this.scene,this.camera);
 }
 liver(parent,position=[0,0,0],scale=1){
  const g=new T.Group();g.position.set(...position);g.scale.setScalar(scale);parent.add(g);
  const shape=geometry((u,v)=>{const a=u*TAU,b=v*PI,xx=Math.sin(b)*Math.cos(a),yy=Math.cos(b),zz=Math.sin(b)*Math.sin(a),taper=xx>0?1-.42*xx:1;return[2.25*xx,yy*.96*taper+.14*Math.cos(xx*2)-.1*xx,zz*.85*taper+.08*Math.sin(a*3)*Math.sin(b)]});
  const material=mat('#74352e',{roughness:.36,clearcoat:.5,transparent:true,opacity:.8,side:T.DoubleSide});const capsule=mesh(shape,material,g);this.tissue.push({material,open:.8,closed:1});
  const seam=curve([[.55,.9,.1],[.3,.6,.68],[.1,.1,.84],[-.05,-.7,.5]]);tube(g,seam,.018,mat('#ad6458'));
  const gall=drop(g,[.12,-.9,.12],[.23,.55,.23],'#607944');gall.rotation.z=.22;
  const duct=tube(g,[[.2,-.52,.1],[.35,-1.05,.18],[.3,-1.5,.15]],.055,mat('#8b9556')).mesh;
  return {group:g,capsule,gall,duct};
 }
 addRouteJourney(s,segments){
  // Remove unrelated moving streams. Their structural vessels remain as context.
  const geometryToDispose=new Set(),materialsToDispose=new Set();
  for(const f of this.flows)for(const p of f.particles){p.traverse(o=>{if(o.geometry)geometryToDispose.add(o.geometry);if(o.material)materialsToDispose.add(o.material)});this.root.remove(p)}
  geometryToDispose.forEach(g=>g.dispose());materialsToDispose.forEach(m=>m.dispose());this.flows=[];
  const color=s.route==='lipid'?'#e58b35':'#e3ad24',packet=sphere(this.root,[0,0,0],[.065,.065,.065],mat(color));packet.name='selected-route-nutrient';packet.userData={readableParticle:true,particleRadius:1};
  const outline=new T.Mesh(new T.TorusGeometry(1.45,.13,6,20),new T.MeshBasicMaterial({color:'#fffdf2',depthTest:false}));outline.renderOrder=32;packet.add(outline);
  segments.forEach((a,i)=>{const m=tube(this.root,a.path,this.atlas?.018:.045,mat(a.color,{transparent:true,opacity:.85})).mesh;m.name='selected-route-segment';a.mesh=m;a.label=this.label(a.name,a.path.getPoint(.5).toArray(),{className:s.route==='lipid'?'green':'blue'});});
  const teaching=routeTeaching(s),journey={segments,packet,route:s.route};this.routeJourney=journey;
  this.dynamic.push(t=>{const a=routeSample(segments,t),pos=segments[a.index].path.getPoint(a.local);packet.position.copy(pos);packet.visible=true;journey.index=a.index;journey.local=a.local;for(const [i,segment]of segments.entries()){segment.mesh.material.opacity=i===a.index?1:.3;const l=this.labels.find(l=>l.element===segment.label);if(l)l.enabled=i===a.index}if(this.host){const status=this.host.querySelector('.scene-status');if(status)status.textContent=t>=1?'ARRIVED AT RIGHT HEART · 已到達右心':teaching.labels[a.index]}});
 }

 buildAtlas(s){
  this.homeZ=17;this.camera.position.set(0,0,this.homeZ);this.root.rotation.set(0,0,0);
  const plane=new T.PlaneGeometry(6,9,90,135),image=mesh(plane,new T.MeshBasicMaterial({map:this.atlasTexture,toneMapped:false}),this.root),original=plane.attributes.position.array.slice();
  const point=(x,y,z=.035)=>[(x/1024-.5)*6,(.5-y/1536)*9,z];
  const path=pixels=>curve(pixels.map(p=>point(...p)));
  const desc=(name,color,pixels)=>({name,color,path:path(pixels)});
  const segments=s.route==='lipid'?[
   desc('Lymph vessels 淋巴管','#82994d',[[628,1260],[652,1125],[643,970],[631,835]]),
   desc('Thoracic duct 胸導管','#82994d',[[631,835],[624,705],[632,550],[630,385],[608,180]]),
   desc('Left venous junction 左靜脈角','#82994d',[[608,180],[553,132],[477,122]]),
   desc('Venous return 靜脈回流','#427ca5',[[477,122],[459,160],[466,211],[468,254]])
  ]:[
   desc('Intestinal capillaries 小腸微血管','#936184',[[625,1210],[610,1200],[598,1215],[590,1230]]),
   desc('Hepatic portal vein 肝門靜脈','#745587',[[590,1230],[565,1120],[539,1010],[522,910],[512,822],[490,753],[476,688],[461,643],[420,611]]),
   desc('Liver capillaries 肝微血管','#936184',[[420,611],[370,604],[310,550],[257,550]]),
   desc('Hepatic vein 肝靜脈','#427ca5',[[257,550],[295,483],[366,428],[426,403]]),
   desc('Inferior vena cava 下腔靜脈','#427ca5',[[426,403],[440,347],[450,291],[468,254]])
  ];
  this.label('Right heart 右心',point(468,254));this.label('Small intestine 小腸',point(475,1200));this.label('Liver 肝臟',point(221,512));
  // The atlas is an orientation reference; the selected overlay is schematic.
  this.addRouteJourney(s,segments);
 }

 buildCirculation(s){
  this.homeZ=14.5;this.camera.position.set(0,.15,this.homeZ);
  const liver=this.liver(this.root,[-.85,.9,0],.86),red=mat('#b54343'),blue=mat('#427ca5'),portal=mat('#745587'),gut=mat('#d5a593',{roughness:.57});
  // Heart: ventricular mass, atrial appendages, and continuous great vessels.
  const heart=new T.Group();heart.position.set(.1,3.25,-.1);heart.rotation.z=-.25;this.root.add(heart);
  sphere(heart,[-.18,0,0],[.5,.65,.4],mat('#9b4b4d'));sphere(heart,[.26,.05,-.06],[.42,.5,.36],mat('#b75c58'));sphere(heart,[-.23,.52,-.08],[.28,.23,.25],mat('#ad6a70'));
  const aorta=tube(this.root,[[.25,3.45,-.1],[.65,3.9,-.28],[1,3.5,-.4],[1.03,1,-.5],[1.02,-2.4,-.55]],.13,red).path;
  const vena=tube(this.root,[[-.15,-2.55,-.45],[-.2,.65,-.4],[-.2,2.55,-.3],[-.1,3.25,-.13]],.15,blue).path;
  const upperVenousReturn=[[-.65,4,-.3],[-.8,3.6,-.35],[-.1,3.25,-.13]];
  tube(this.root,upperVenousReturn,.09,blue);
  // Intestinal loops form one connected convoluted tube.
  const intestinal=[];for(let i=0;i<170;i++){const t=i/169,ang=t*TAU*4.3;intestinal.push([Math.sin(ang)*(1.55-.35*t),-1.35-t*1.5+Math.cos(ang)*.23,Math.cos(ang)*.25+.06*Math.sin(ang*2)])}
  tube(this.root,intestinal,.16,gut);
  for(let i=0;i<6;i++){const x=-1.2+i*.48;const p=tube(this.root,[[x,-2.2,.05],[x*.75,-1.45,.2],[x*.35,-.75,.25],[-.36,-.4,.25]],.018,portal).path;this.addFlow(p,s.route==='lipid'?'#b34c69':'#e9bb61',2,.035,.8)}
  const hp=tube(this.root,[[-.36,-.4,.25],[-.4,-.08,.3],[-.25,.4,.35],[-.45,.85,.35]],.135,portal).path;
  const hv=tube(this.root,[[-.85,1.65,.12],[-.2,1.9,-.25],[-.2,2.55,-.3]],.125,blue).path;
  const ha=tube(this.root,[[1.03,.18,-.5],[.65,.22,-.18],[.05,.55,.24],[-.45,.85,.35]],.065,red).path;
  // Arterial supply branches into intestinal capillary beds before portal collection.
  const intestinalArtery=tube(this.root,[[1.02,-2.4,-.55],[1.35,-2.9,.2],[-1.35,-2.9,.2]],.055,red).path;
  this.addFlow(intestinalArtery,'#dd8e7e',10,.035,.7);
  for(let i=0;i<6;i++){const x=-1.2+i*.48;for(let j=0;j<3;j++){
   const cap=tube(this.root,[[x,-2.9,.2],[x-.14+j*.1,-2.65,.4],[x+.12-j*.05,-2.4,.3],[x,-2.2,.05]],.014,mat('#956688')).mesh;cap.name='intestinal-capillary';
  }}
  this.label('Intestinal capillaries 小腸微血管',[-.8,-2.55,.4],{className:'purple'});
  this.addFlow(aorta,'#b72e36',24,.07,1,'blood');this.addFlow(vena,'#803853',18,.07,1,'blood');this.addFlow(hp,s.route==='lipid'?'#b34c69':'#e8ad4d',14,.055,1.3);this.addFlow(hv,'#a64660',14,.065,1.4,'blood');this.addFlow(ha,'#bf3646',10,.045,1.2,'blood');
  // Branching vessels live inside the translucent liver, not on a diagram card.
  const endpoints=[[-2.2,1.1,.1],[-2,.45,.18],[-1.8,1.6,.04],[-.8,1.55,.2],[.45,1.15,.15],[.75,.7,.2]];
  for(const [i,end]of endpoints.entries()){
   const p=tube(this.root,[[-.45,.85,.35],[(end[0]-.45)/2,1.02,.2],end],.05,portal).path;this.addFlow(p,s.route==='lipid'?'#b34c69':'#e9b85c',4,.035,.8);
   tube(this.root,[end,[end[0]*.6,1.6,.08],[-.85,1.65,.12]],.032,blue);
  }
  this.label('Heart 心臟',[.1,3.25,.2]);this.label('Liver 肝臟',[-1.65,1.15,.5]);this.label('Small intestine 小腸',[-1.05,-2.1,.25]);
  this.label('Hepatic portal vein 肝門靜脈',[-.4,-.08,.3],{className:'purple'});this.label('Hepatic vein 肝靜脈',[-.2,2.1,-.25],{className:'blue'});this.label('Hepatic artery 肝動脈',[.65,.22,-.18],{className:'red'});this.label('Aorta 主動脈',[1.03,2.2,-.4],{className:'red'});this.label('Vena cava 腔靜脈',[-.2,2.7,-.28],{className:'blue'});
  this.dynamic.push(t=>{heart.scale.setScalar(1+.025*Math.sin(t*TAU*6));});
  const seg=(name,color,p)=>({name,color,path:p.getPoint?p:curve(p)});
  const journey=s.route==='lipid'?[
   seg('Lymph vessels 淋巴管','#82994d',[[.3,-2.3,.22],[.8,-1.8,.28],[.65,-.5,.12]]),
   seg('Thoracic duct 胸導管','#82994d',[[.65,-.5,.12],[.65,1.3,-.2],[.6,3,-.28]]),
   seg('Left venous junction 左靜脈角','#82994d',[[.6,3,-.28],[.1,4.2,-.3],upperVenousReturn[0]]),
   seg('Venous return 靜脈回流','#427ca5',upperVenousReturn)
  ]:[
   seg('Intestinal capillaries 小腸微血管','#936184',[[-1.2,-2.9,.2],[-1.34,-2.65,.4],[-1.08,-2.4,.3],[-1.2,-2.2,.05],[-.9,-1.45,.2],[-.42,-.75,.25],[-.36,-.4,.25]]),
   seg('Hepatic portal vein 肝門靜脈','#745587',hp),
   seg('Liver capillaries 肝微血管','#936184',[[-.45,.85,.35],[-1.325,1.02,.2],[-2.2,1.1,.1],[-1.32,1.6,.08],[-.85,1.65,.12]]),
   seg('Hepatic vein 肝靜脈','#427ca5',hv),
   seg('Inferior vena cava 下腔靜脈','#427ca5',[[-.2,2.55,-.3],[-.1,3.25,-.13]])
  ];
  for(const l of this.labels)l.enabled=/^(Heart |Liver |Small intestine )/.test(l.element.textContent);
  this.addRouteJourney(s,journey);

 }
 buildVilli(s){
  this.homeZ=12.8;this.camera.position.set(0,.1,this.homeZ);
  if(s.detail==='cell'){this.buildEpithelium(s);return}
  const normalHeight=3.4,flatHeight=1.05,height=s.flattened?flatHeight:normalHeight;
  const base=mesh(new T.BoxGeometry(6.8,.45,2.3),mat('#d9a591'),this.root);base.position.y=-2.25;
  const pink=mat('#efbdab',{roughness:.6,transparent:true,opacity:.42,side:T.DoubleSide}),cellMat=mat('#e7aa99',{roughness:.47}),nucleusMat=mat('#7b577b',{roughness:.65}),blood=mat('#bd4f59',{roughness:.4}),venous=mat('#6b79a3',{roughness:.4}),lymph=mat('#8ea65e',{roughness:.4,transparent:true,opacity:.68});
  this.tissue.push({material:pink,open:.28,closed:1},{material:cellMat,open:.3,closed:1},{material:nucleusMat,open:.3,closed:1});
  const positions=[[-2.25,-.3],[0,.2],[2.25,-.4]];
  for(let index=0;index<3;index++){
   const [x,z]=positions[index],group=new T.Group();this.root.add(group);group.position.set(x,-2.05,z);
   const radius=.65;
   const skin=geometry((u,v)=>{const a=u*TAU,y=v*height,r=radius*Math.sqrt(Math.max(.005,1-Math.pow(v,4)));return[r*Math.cos(a),y,r*Math.sin(a)]},48,32);
   mesh(skin,pink,group);
   // Individual enterocytes: a single epithelial layer, nuclei inside each cell.
   const rows=s.flattened?6:16,columns=18,total=rows*columns;
   const cellMesh=new T.InstancedMesh(new T.SphereGeometry(1,8,6),cellMat,total),nuclei=new T.InstancedMesh(new T.SphereGeometry(1,6,5),nucleusMat,total),dummy=new T.Object3D();group.add(cellMesh,nuclei);
   let n=0;
   for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
    const v=(j+.5)/rows,a=(i+(j%2)*.5)/columns*TAU,r=radius*Math.sqrt(Math.max(.005,1-Math.pow(v,4))),y=v*height;
    dummy.position.set(Math.cos(a)*r,y,Math.sin(a)*r);dummy.scale.set(.105,height/rows*.47,.075);dummy.rotation.y=-a;dummy.updateMatrix();cellMesh.setMatrixAt(n,dummy.matrix);
    dummy.position.multiplyScalar(1);dummy.position.x=Math.cos(a)*(r-.035);dummy.position.z=Math.sin(a)*(r-.035);dummy.scale.set(.035,.045,.025);dummy.updateMatrix();nuclei.setMatrixAt(n,dummy.matrix);n++;
   }
   // Dense brush-border microvilli bristles project outward, not into tissue.
   const vertices=[];for(let j=0;j<rows*2;j++)for(let i=0;i<36;i++){const v=(j+.5)/(rows*2),a=i/36*TAU,r=radius*Math.sqrt(Math.max(.005,1-Math.pow(v,4)));vertices.push(Math.cos(a)*(r+.055),v*height,Math.sin(a)*(r+.055),Math.cos(a)*(r+.13),v*height+.025,Math.sin(a)*(r+.13))}
   const brushGeometry=new T.BufferGeometry();brushGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));group.add(new T.LineSegments(brushGeometry,new T.LineBasicMaterial({color:'#b97b72'})));
   // Paired vascular limb, anastomosing capillary network, central blind-ended lacteal.
   const arterial=[[-.32,-.2,.1],[-.39,height*.3,.12],[-.33,height*.73,.1],[0,height*.91,.1]],ven=[[0,height*.91,.1],[.34,height*.73,.1],[.38,height*.3,.12],[.32,-.2,.1]];
   const arterialPath=tube(group,arterial,.055,blood).path,venPath=tube(group,ven,.065,venous).path,localBloodPaths=[arterialPath,venPath];
   for(let k=1;k<6;k++){const y=height*k/7;localBloodPaths.push(tube(group,[[-.38,y,.12],[-.12,y+.12,.27],[.12,y-.07,.27],[.38,y,.12]],.028,blood).path)}
   const lact=tube(group,[[0,-.25,0],[0,height*.35,0],[.02,height*.73,0]],.115,lymph);sphere(group,[.02,height*.73,0],[.115,.14,.115],lymph);
   // Flow paths in scene coordinates preserve absolute compartment positions.
   const world=points=>curve(points.map(p=>[p[0]+x,p[1]-2.05,p[2]+z]));
   this.addFlow(world([...arterial,...ven.slice(1)]),'#ae3447',12,.05,.75,'blood');
   const y=height*.48-2.05;
   // Absorbed nutrient enters a local capillary, then follows the EXACT
   // venous centreline downwards. It never travels up the incoming arteriole.
   const drainStart=.5,entry=venPath.getPoint(drainStart),entryWorld=entry.clone().add(vec(x,-2.05,z));
   const gy=entryWorld.y,entryPath=curve([[x+1.1,gy,z-.28],[x+.78,gy,z-.2],[x+.64,gy,z-.13],[x+.54,gy,z-.11],[x+.48,gy,z-.08],entryWorld.toArray()]);
   const glucosePath=new T.Curve();glucosePath.getPoint=t=>t<.4?entryPath.getPoint(t/.4):venPath.getPoint(drainStart+(t-.4)/.6*(1-drainStart)).add(vec(x,-2.05,z));
   const absorbCount=s.flattened?2:8;this.addFlow(glucosePath,'#e4a92d',absorbCount,.045,.7);
   // Back-facing epithelial cells provide a tissue corridor clear of the
   // anterior blood network. Assembly (.4–.6) stays inside the epithelial shell;
   // released packages then enter and drain along the actual lacteal curve.
   let lo=0,hi=1;for(let j=0;j<40;j++){const mid=(lo+hi)/2;if(lact.path.getPoint(mid).y<height*.48)lo=mid;else hi=mid}const lactEntryT=(lo+hi)/2,offset=vec(x,-2.05,z),lactEntry=lact.path.getPoint(lactEntryT).add(offset);
   const sourcePath=curve([[x+.06,y,z-.98],[x+.06,y,z-.78],[x+.06,y,z-.68],[x+.06,y,z-.64]]),releasePath=curve([[x+.06,y,z-.59],[x+.06,y,z-.4],[x+.06,y,z-.19],lactEntry.toArray()]);
   const lipidPath=new T.Curve();lipidPath.getPoint=a=>a<.3?sourcePath.getPoint(a/.3):a<.64?vec(x+.06,y,z-.64+.05*(a-.3)/.34):a<.78?releasePath.getPoint((a-.64)/.14):lact.path.getPoint(lactEntryT*(1-(a-.78)/.22)).add(offset);
   this.addLipidFlow(lipidPath,s.flattened?1:6,.6);this.flows[this.flows.length-1].villusGeometry={offset,lacteal:lact.path,lactEntryT,bloodPaths:localBloodPaths,entryFraction:.78};
   // Keep tissue and world-space flow paths aligned at every animation phase.
  }
  // Undigested fibre remains in the lumen; it never crosses epithelial cells.
  for(let i=0;i<6;i++){const f=tube(this.root,[[i-2.7,2.1,.4],[i-2.6,2.25,.4],[i-2.73,2.38,.4],[i-2.6,2.55,.4]],.035,mat('#9c784a')).mesh;this.dynamic.push(t=>{f.position.x=.1*Math.sin(t*TAU+i);f.position.y=.15*Math.cos(t*TAU+i)})}
  this.label('Arteriole in 小動脈流入',[-.32,-2.25,.3],{className:'red'});this.label('Venule out 小靜脈流出',[.32,-2.25,.3],{className:'blue'});this.label('Microvilli 微絨毛',[.12,height-2.02,.2]);this.label('One-cell epithelium 單層上皮',[-2.87,-1.3,-.25]);this.label('Capillaries 微血管網',[-.38,height*.3-2.05,.32],{className:'red'});this.label('Lacteal 乳糜管',[0,height*.5-2.05,.2],{className:'green'});this.label('Lumen 腸腔 · fibre stays here 纖維留在腸腔',[-.6,2.25,.4]);
 }
 buildEpithelium(s){
  this.homeZ=11;this.camera.position.set(0,0,this.homeZ);
  const cellMaterial=mat('#e3ae97',{transparent:true,opacity:.32,roughness:.57,side:T.DoubleSide});this.tissue.push({material:cellMaterial,open:.25,closed:.9});
  for(let i=0;i<3;i++){
   const x=(i-1)*1.8,cell=sphere(this.root,[x,0,0],[.85,1.65,.65],cellMaterial);sphere(this.root,[x,-.55,0],[.35,.43,.32],mat('#8b647f'));
   for(let j=0;j<15;j++){const xx=x+(j%5-2)*.25,z=(Math.floor(j/5)-1)*.32;const bristle=mesh(new T.CylinderGeometry(.035,.045,.52,8),mat('#d09a84'),this.root);bristle.position.set(xx,1.7,z)}
   for(let j=0;j<10;j++){const a=j*2.4,px=x+Math.sin(a)*.52,py=-.9+((j*7)%13)/13*2;const m=sphere(this.root,[px,py,.28],[.13,.24,.11],mat('#b76761'));m.rotation.z=a;for(let k=0;k<3;k++)tube(this.root,[[px-.06,py-.1+k*.07,.39],[px+.04,py-.07+k*.07,.41],[px-.04,py-.03+k*.07,.39]],.012,mat('#e2a689'))}
   const carrier=sphere(this.root,[x+.8,.55,.06],[.11,.23,.18],mat('#70867b'));this.dynamic.push(t=>{carrier.scale.y=.23*(1+.18*Math.sin(t*TAU*3+i))});
   const path=curve([[x+.9,2.4,.1],[x+.65,1.8,.2],[x+.7,.9,.2],[x+.8,.55,.1],[x+.4,.45,.1],[x,-1,.15],[x,-2.15,.1]]);this.addFlow(path,'#e0ad31',8,.055,.7);
  }
  const cap=tube(this.root,[[-3,-2.2,.1],[-1,-2.15,.1],[1,-2.15,.1],[3,-2.2,.1]],.16,mat('#ad4b60')).path;this.addFlow(cap,'#aa3143',20,.08,.7,'blood');
  this.label('Microvilli · larger surface 微絨毛',[0,1.95,.1]);this.label('Mitochondria 線粒體 · ATP',[-1.25,.4,.3],{className:'red'});this.label('Carrier 載體蛋白',[2.6,.55,.06]);this.label('Capillary 微血管',[.2,-2.15,.1],{className:'red'});
 }
 buildHepatocytes(mode,s){
  if(mode==='liver'){
   if(+s.function===2){if(s.production==='carotene')this.buildVitaminA(s);else this.buildBile(s);return}
   if(+s.function===3){this.buildDeamination(s);return}
   if(+s.function===4){this.buildDetox(s);return}
  }
  if(mode==='glucose'&&s.situation==='protein'){this.buildDeamination(s);return}
  if(mode==='fates'&&s.nutrient==='Amino acids 氨基酸'){
   if(s.fate==='use')this.buildProtein(s);else this.buildDeamination(s);return;
  }
  if(mode==='fates'&&s.nutrient==='Glucose 葡萄糖'&&s.fate==='use'){this.buildEnergy(s);return}
  if(mode==='fates'&&s.nutrient==='Glucose 葡萄糖'&&s.fate==='excess'&&s.glucoseStorage==='lipid'){this.buildGlucoseFat(s);return}
  this.homeZ=11.5;this.camera.position.set(0,0,this.homeZ);
  const amino=s.nutrient==='Amino acids 氨基酸'&&mode==='fates',lipid=s.nutrient==='Lipids 脂質'&&mode==='fates',fast=s.situation==='fasting'&&(mode==='glucose'||(mode==='liver'&&+s.function===0)),storing=mode==='liver'&&+s.function===1;
  if(lipid){if(s.fate==='use'&&s.lipidUse==='hormone'&&this.buildHormoneUse)this.buildHormoneUse(s);else if(s.fate==='use')this.buildMembrane(s);else this.buildAdipose(s);return}
  const tissue=mat('#c7826c',{transparent:true,opacity:.3,roughness:.55,side:T.DoubleSide}),nucleus=mat('#725174');this.tissue.push({material:tissue,open:.28,closed:.95});
  const hepatocytes=[];
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
   const x=(col-1)*1.9+(row?.3:0),y=(row-.5)*2.15;const group=new T.Group();group.position.set(x,y,0);this.root.add(group);
   const cell=mesh(geometry((u,v)=>{const a=u*TAU,b=v*PI,r=Math.sin(b),facet=1+.035*Math.cos(a*6);return[r*Math.cos(a)*.98*facet,Math.cos(b)*1.04,r*Math.sin(a)*.65]},36,24),tissue,group);
   sphere(group,[-.1,0,-.05],[.3,.32,.28],nucleus);sphere(group,[.05,.03,.2],[.07,.08,.05],mat('#4f365b'));
   for(let j=0;j<7;j++){const a=j*2.4;sphere(group,[Math.cos(a)*.58,Math.sin(a)*.64,.12],[.11,.2,.1],mat('#ad6057')).rotation.z=a}
   hepatocytes.push(group);
   if(storing){for(let j=0;j<12;j++){const a=j*2.4,r=.3+((j*7)%5)*.06;const store=sphere(group,[Math.cos(a)*r,-.35+Math.sin(a)*r*.45,.22],[.055,.055,.055],mat(j<6?'#94554c':'#b9a05d'));}this.addFlow(curve([[x,-2.3,.6],[x,y-.6,.5],[x,y-.3,.2]]),'#bca759',4,.045,.6)}
  }
  const sinusoid=tube(this.root,[[-3.5,0,.63],[-2.4,.12,.75],[-1.2,-.1,.74],[0,.13,.72],[1.2,-.1,.74],[2.4,.1,.72],[3.5,0,.64]],.18,mat('#a45666',{transparent:true,opacity:.48})).path;
  this.addFlow(sinusoid,'#ad3445',18,.09,.65,'blood');
  // Molecular glycogen: branching granules assemble / disassemble visibly inside cells.
  for(let c=0;c<hepatocytes.length;c++){
   const group=hepatocytes[c],granules=[],links=[];
   for(let i=0;i<27;i++){
    const a=i*2.4,r=.09*Math.sqrt(i),x=.34+Math.cos(a)*r*.65,y=.42+Math.sin(a)*r*.5,z=.28+.04*Math.sin(i);
    const g=sphere(group,[x,y,z],[.065,.065,.065],mat('#d4a537'));g.name='glycogen-granule';granules.push(g);
    if(i){const parent=Math.floor((i-1)/2),other=granules[parent];links.push({mesh:tube(group,[other.position.toArray(),[x,y,z]],.018,mat('#be8e32')).mesh,index:i})}
   }
   this.dynamic.push(t=>{const p=T.MathUtils.clamp(t*1.2-c*.04,0,1),amount=fast?1-p:p;granules.forEach((g,i)=>{const visible=i/27<amount;g.visible=visible;g.scale.setScalar(.065*(visible?Math.min(1,(amount-i/27)*27):.1))});links.forEach(l=>l.mesh.visible=l.index/27<amount)});
   const start=group.position.clone().add(vec(.4,.5,.3)),end=vec(group.position.x,0,.75);const points=fast?[start.toArray(),[group.position.x,.4,.55],end.toArray()]:[end.toArray(),[group.position.x,.5,.55],start.toArray()];this.addFlow(curve(points),amino?'#8660b5':'#e1b444',6,.06,.8);
   if(amino){const urea=curve([[group.position.x,.2,.45],[group.position.x+.4,.1,.6],[group.position.x+.6,0,.75],[3.5,0,.65]]);this.addFlow(urea,'#65bfc4',4,.045,.8)}
  }
  this.label('Hepatocytes 肝細胞',[-1.6,1.1,.3]);this.label('Sinusoid 血竇 · flowing blood 流動的血液',[0,.13,.72],{className:'red'});this.label(amino?'Deamination 脫氨':'Glycogen granules 糖原顆粒',[2.35,1.5,.28],{className:'gold'});
  if(storing){this.label('Iron 鐵',[-1.7,-1.5,.3],{className:'red'});this.label('Vitamins A D E K 脂溶性維生素',[2,-1.5,.3],{className:'gold'})}
  this.label(fast?'Glucose released 釋放葡萄糖':amino?'Amino acids absorbed 攝取氨基酸':'Glucose uptake 攝取葡萄糖',[-1.9,-.45,.55],{className:'gold'});
 }
 cellShell(){
  const material=mat('#d8a58f',{side:T.DoubleSide}),cell=sphere(this.root,[0,0,-.2],[3,2.5,1.3],material);this.tissue.push({material});
  sphere(this.root,[-1.5,-.75,-.25],[.62,.67,.5],mat('#85617e'));sphere(this.root,[-1.35,-.7,.18],[.18,.2,.1],mat('#644863'));
  for(let i=0;i<9;i++){const a=i*TAU/9;sphere(this.root,[Math.cos(a)*2.15,Math.sin(a)*1.65,-.25],[.18,.35,.16],mat('#b86f5d')).rotation.z=a}
  return cell;
 }
 buildProtein(s){
  this.homeZ=11;this.camera.position.set(0,0,this.homeZ);this.cellShell();
  // A ribosome with two subunits, RNA strand, and an elongating peptide.
  sphere(this.root,[.1,.15,.35],[.7,.48,.4],mat('#8e8f72'));sphere(this.root,[.1,-.22,.35],[.62,.32,.35],mat('#a5a27a'));
  const rna=[];for(let i=0;i<70;i++){const t=i/69;rna.push([-2.8+t*5.6,-.3+.1*Math.sin(t*TAU*8),.5])}tube(this.root,rna,.025,mat('#8c5798'));
  const aminoColors=['#9d83b3','#82a6bd','#d9aa65','#a7b77c'],peptide=[];
  for(let i=0;i<30;i++){const t=i/29,a=t*TAU*2.6;const p=[.3+Math.sin(a)*.45,.45+t*1.65,.5+Math.cos(a)*.2];const bead=sphere(this.root,p,[.115,.115,.115],mat(aminoColors[i%4]));bead.name='protein-monomer';peptide.push(bead);if(i){const bond=tube(this.root,[peptide[i-1].position.toArray(),p],.035,mat('#ba9b8c')).mesh;bead.userData.bond=bond}}
  for(let i=0;i<10;i++){const path=curve([[-2.9,1.7-i*.24,.3],[-1.6,1.2-i*.12,.4],[-.6,.4,.45],[0,.25,.5]]);this.addFlow(path,aminoColors[i%4],1,.1,.9)}
  this.dynamic.push(t=>{peptide.forEach((p,i)=>{p.visible=i/30<t;if(p.userData.bond)p.userData.bond.visible=p.visible});});
  this.label('Amino acids 氨基酸',[-1.9,1.3,.4],{className:'purple'});this.label('Ribosome 核糖體',[.1,.15,.65]);this.label('New protein 新生蛋白質',[.5,1.5,.5],{className:'purple'});
 }
 buildEnergy(s){
  this.homeZ=11;this.camera.position.set(0,0,this.homeZ);this.cellShell();
  const outerMaterial=mat('#b96f5e',{side:T.DoubleSide}),outer=sphere(this.root,[.55,.2,.08],[1.65,.85,.6],outerMaterial);outer.rotation.z=.3;this.tissue.push({material:outerMaterial});
  const mitoGroup=new T.Group();mitoGroup.position.set(.55,.2,.15);mitoGroup.rotation.z=.3;this.root.add(mitoGroup);
  for(let i=0;i<9;i++){const x=-1.35+i*.33;const crista=curve([[x,-.48,0],[x+.13,-.32,.1],[x-.05,.12,.13],[x+.1,.48,.02]]);tube(mitoGroup,crista,.055,mat('#d49b7c'))}
  const glucose=curve([[-3,1.45,.6],[-2.1,1.5,.5],[-1.3,1.25,.45],[-.9,1.05,.4]]);this.addFlow(glucose,'#deb044',10,.08,.75);
  this.addFlow(curve([[-.9,1.05,.4],[-.5,.8,.45],[0,.4,.45],[.3,.3,.4]]),'#7b9eae',13,.04,.95);
  for(let i=0;i<14;i++){const a=i/14*TAU;const path=curve([[.55,.2,.4],[.55+Math.cos(a),.2+Math.sin(a)*.7,.5],[.55+Math.cos(a)*2.2,.2+Math.sin(a)*1.8,.5]]);this.addFlow(path,'#f1ca4d',1,.065,.8)}
  this.label('Glucose 葡萄糖',[-1.9,1.45,.6],{className:'gold'});this.label('Mitochondrion 線粒體',[.55,.2,.4],{className:'red'});this.label('Energy released 釋放能量',[1.85,1.45,.6],{className:'gold'});
 }
 buildMembrane(s){
  this.homeZ=10.7;this.camera.position.set(0,0,this.homeZ);
  const heads=[],tails=[],dummy=new T.Object3D(),count=160,headMat=mat('#c8aa62'),tailMat=mat('#b78b76');
  for(let layer=0;layer<2;layer++)for(let row=0;row<5;row++)for(let col=0;col<16;col++){
   const x=(col-7.5)*.32,z=(row-2)*.34,y=layer?-.72:.72;
   const h=sphere(this.root,[x,y,z],[.12,.12,.12],headMat),pair=[];h.name='phospholipid-head';
   for(let side of [-1,1])pair.push(tube(this.root,[[x+side*.035,y+(layer?.1:-.1),z],[x+side*.07,y*.4,z+.03],[x+side*.05,y*.08,z-.04]],.025,tailMat).mesh);heads.push({h,pair,index:col});
  }
  for(let i=0;i<5;i++){const p=sphere(this.root,[i*1.1-2.2,0,.25],[.21,.95,.4],mat('#7d94a0'));p.rotation.z=.08*Math.sin(i)}
  this.dynamic.push(t=>{heads.forEach(({h,pair,index})=>{const visible=index/16<t*.7+.3;h.visible=visible;pair.forEach(p=>p.visible=visible);h.position.y=(h.position.y>0?1:-1)*(.72+.018*Math.sin(t*TAU+index))})});
  this.label('Cell membrane 細胞膜',[0,.7,.3]);this.label('Lipid molecules 脂質分子',[-2,.72,.6],{className:'gold'});this.label('Membrane proteins 膜蛋白',[1.1,0,.6]);
 }
 buildDeamination(s){
  this.homeZ=11.5;this.camera.position.set(0,0,this.homeZ);this.cellShell();
  const atoms=[];
  for(let i=0;i<6;i++){
   const group=new T.Group();this.root.add(group);group.userData.readableParticle=true;group.userData.particleRadius=.55;const carbon=sphere(group,[0,0,0],[.14,.14,.14],mat('#74665f')),nitrogen=sphere(group,[-.38,.2,0],[.15,.15,.15],mat('#4b8cbb')),oxygen=sphere(group,[.38,.2,0],[.14,.14,.14],mat('#c7615b'));
   tube(group,[[-.38,.2,0],[0,0,0],[.38,.2,0]],.04,mat('#b8aca0'));sphere(group,[0,-.34,0],[.15,.15,.15],mat('#b59b69'));atoms.push({group,nitrogen,i});
  }
  const urea=[];for(let i=0;i<4;i++){const group=new T.Group();this.root.add(group);group.userData.readableParticle=true;group.userData.particleRadius=.55;sphere(group,[0,0,0],[.13,.13,.13],mat('#74665f'));sphere(group,[0,.33,0],[.14,.14,.14],mat('#c7615b'));sphere(group,[-.31,-.2,0],[.15,.15,.15],mat('#4b8cbb'));sphere(group,[.31,-.2,0],[.15,.15,.15],mat('#4b8cbb'));tube(group,[[-.31,-.2,0],[0,0,0],[0,.33,0]],.035,mat('#c2b4a6'));tube(group,[[0,0,0],[.31,-.2,0]],.035,mat('#c2b4a6'));urea.push(group)}
  this.dynamic.push(t=>{
   atoms.forEach(({group,nitrogen,i})=>{const p=(t+i/6)%1;group.position.set(-3+p*4,.9-i*.27,.5);group.visible=p<.68;const split=smoothstep(.35,.65,p);nitrogen.position.set(-.38+split*.9,.2+split*1.2,0);group.scale.setScalar(.7)});
   urea.forEach((g,i)=>{const p=(t+i/4)%1;g.visible=p>.5;g.position.set(.4+(p-.5)*5.5,1.3+(p-.5)*1.8,.5);g.scale.setScalar(.7)});
  });
  const blood=tube(this.root,[[.5,2.4,.3],[2,2.1,.3],[3.5,2.5,.3]],.14,mat('#876181')).path;this.addFlow(blood,'#a8394e',12,.065,.8,'blood');
  this.label('Excess amino acids 過量氨基酸',[-2,.5,.5],{className:'purple'});this.label('Nitrogen removed 移除含氮部分',[.1,1.2,.5],{className:'blue'});this.label('Urea leaves liver 尿素離開肝臟',[2.2,2,.5],{className:'blue'});this.label('Remaining carbon skeleton 其餘碳骨架',[.8,-1.4,.4],{className:'gold'});
 }
 buildBile(s){
  this.homeZ=11.5;this.camera.position.set(0,0,this.homeZ);const organ=this.liver(this.root,[-.4,1,0],.9);organ.gall.visible=false;organ.duct.visible=false;
  const gall=drop(this.root,[.1,-.65,.3],[.38,.72,.34],'#617b46');gall.name='gall-bladder';gall.rotation.z=.25;
  const duct=tube(this.root,[[.2,-.2,.3],[.2,-1.05,.3],[.65,-1.4,.25],[1.4,-1.55,.2]],.09,mat('#83945b')).path;
  const hepaticDuct=tube(this.root,[[-.2,.4,.25],[.07,.15,.3],[.2,-.2,.3]],.075,mat('#83945b')).path;this.addFlow(hepaticDuct,'#b6b748',10,.045,.8);
  const duodenum=tube(this.root,[[1.7,-.85,.05],[2.1,-1.3,.15],[1.85,-2,.05],[.9,-2.2,0],[.35,-1.85,0]],.34,mat('#d4a18a')).mesh;
  this.addFlow(duct,'#b6b748',22,.05,.9);
  this.dynamic.push(t=>{const contraction=.1*(.5+.5*Math.sin(t*TAU*2));gall.scale.set(.38*(1-contraction),.72*(1-contraction*.7),.34*(1-contraction))});
  this.label('Liver makes bile 肝製造膽汁',[-1.6,1.4,.25]);this.label('Gall bladder stores bile 膽囊儲存膽汁',[.1,-.65,.6],{className:'green'});this.label('Bile duct 膽管',[.65,-1.4,.35],{className:'green'});this.label('Duodenum 十二指腸',[1.7,-1.95,.4]);
 }
 buildDetox(s){
  this.homeZ=11;this.camera.position.set(0,0,this.homeZ);this.cellShell();
  const enzyme=sphere(this.root,[.3,.1,.15],[.9,.7,.5],mat('#8b9a77'));sphere(this.root,[.9,.3,.4],[.33,.26,.2],mat('#a1ad8c'));
  const reactants=[],products=[];
  for(let i=0;i<10;i++){const g=new T.Group();this.root.add(g);g.userData.readableParticle=true;g.userData.particleRadius=.28;sphere(g,[-.1,0,0],[.1,.1,.1],mat('#c65d55'));sphere(g,[.1,0,0],[.1,.1,.1],mat('#c65d55'));sphere(g,[-.22,.07,0],[.065,.065,.065],mat('#f8f6ec'));sphere(g,[.22,-.07,0],[.065,.065,.065],mat('#f8f6ec'));reactants.push(g)}
  for(let i=0;i<12;i++){const g=new T.Group();this.root.add(g);g.userData.readableParticle=true;g.userData.particleRadius=.28;const oxygen=sphere(g,[0,0,0],[.1,.1,.1],mat('#c65d55'));if(i%2){sphere(g,[-.13,-.07,0],[.065,.065,.065],mat('#f8f6ec'));sphere(g,[.13,-.07,0],[.065,.065,.065],mat('#f8f6ec'))}else sphere(g,[.18,0,0],[.1,.1,.1],mat('#c65d55'));products.push(g)}
  this.dynamic.push(t=>{reactants.forEach((g,i)=>{const p=(t+i/10)%1;g.position.set(-3+p*5.8,.5+Math.sin(i)*.35,.55);g.visible=p<.55});products.forEach((g,i)=>{const p=(t+i/12)%1;g.position.set(.3+p*2.8,.25+Math.sin(i)*p*1.8,.5);g.visible=p>.08});enzyme.scale.x=.9*(1+.025*Math.sin(t*TAU*5))});
  this.label('Hydrogen peroxide 過氧化氫',[-1.9,.8,.6],{className:'red'});this.label('Catalase 過氧化氫酶',[.3,.1,.55],{className:'green'});this.label('Water + oxygen 水及氧',[2,1.3,.5],{className:'blue'});
 }
 buildGlucoseFat(s){
  this.homeZ=11;this.camera.position.set(0,0,this.homeZ);this.cellShell();
  const blood=tube(this.root,[[-3.5,-2.8,.4],[-1.5,-2.85,.4],[1,-2.8,.4],[3.5,-2.85,.4]],.15,mat('#a55a68')).path;this.addFlow(blood,'#af3548',16,.07,.75,'blood');
  const drops=[];
  for(let i=0;i<4;i++){
   const x=.25+(i%2)*1.1,y=(Math.floor(i/2)-.5)*1.35,d=drop(this.root,[x,y,.18],[.2,.2,.2],'#e2bc61');d.name='lipid-droplet';drops.push({d,i});
   this.addFlow(curve([[x,-2.8,.45],[x+.2,-2.25,.5],[x,y-.4,.4],[x,y,.2]]),'#dfb23d',7,.055,.75);
  }
  this.dynamic.push(t=>{drops.forEach(({d,i})=>{const growth=.12+smoothstep(.08+i*.07,.85,t)*.47;d.scale.set(growth,growth,growth*.82)})});
  this.label('Hepatocyte 肝細胞',[-1.8,1.7,.3]);this.label('Glucose from blood 血液中的葡萄糖',[.25,-2.65,.45],{className:'gold'});this.label('Lipid droplets form 脂滴形成',[1.35,.65,.4],{className:'gold'});
 }
 buildVitaminA(s){
  this.homeZ=13;this.camera.position.set(0,0,this.homeZ);
  const status=this.host?.querySelector('.scene-status');if(status)status.textContent='MOLECULAR CLOSE-UP · HYDROGENS OMITTED · 分子放大示意：氫原子省略';
  const molecule=new T.Group();molecule.name='carotene-conversion';this.root.add(molecule);molecule.position.z=.6;
  const left=new T.Group(),right=new T.Group();left.name='retinal-left';right.name='retinal-right';molecule.add(left,right);
  const carbon=mat('#667078',{roughness:.42}),oxygen=mat('#c45851',{roughness:.4}),bondMaterial=mat('#a99d8a',{roughness:.55});
  const atom=(group,p)=>{const a=sphere(group,p,[.085,.085,.085],carbon);a.userData.element='C';return a};
  const bond=(group,a,b,material=bondMaterial)=>{const start=vec(...a),end=vec(...b),delta=end.clone().sub(start),cylinder=mesh(new T.CylinderGeometry(.024,.024,delta.length(),7),material,group);cylinder.position.copy(start.add(end).multiplyScalar(.5));cylinder.quaternion.setFromUnitVectors(vec(0,1,0),delta.normalize());return cylinder};
  const backbone=[];
  for(let i=0;i<18;i++){const p=[(i-8.5)*.285,i%2?.105:-.105,0],group=i<9?left:right;backbone.push(p);atom(group,p);if(i&&i!==9){bond(group,backbone[i-1],p);if((i-1)%2===0)bond(group,backbone[i-1].map((v,k)=>v+(k===1?.065:0)),p.map((v,k)=>v+(k===1?.065:0)))}}
  const centralMaterial=mat('#cfab5b',{transparent:true,opacity:1}),centralBond=bond(molecule,backbone[8],backbone[9],centralMaterial),centralBond2=bond(molecule,backbone[8].map((v,k)=>v+(k===1?.065:0)),backbone[9].map((v,k)=>v+(k===1?.065:0)),centralMaterial);
  for(const [group,side]of [[left,-1],[right,1]]){
   const points=[];for(let k=0;k<6;k++){const a=k/6*TAU,p=[side*3.02+Math.cos(a)*.5,Math.sin(a)*.5,0];points.push(p);atom(group,p)}
   for(let k=0;k<6;k++)bond(group,points[k],points[(k+1)%6]);
   const index=side<0?0:3;bond(group,points[index],backbone[side<0?0:17]);
   const adjacent=(index+1)%6;bond(group,points[index].map((v,k)=>v+(k===2?.065:0)),points[adjacent].map((v,k)=>v+(k===2?.065:0)));
   // 2,6,6-trimethyl beta-ionone ring; hydrogens are implicit.
   const methylAttachments=[(index+5)%6,(index+5)%6,adjacent];methylAttachments.forEach((at,j)=>{const p=points[at],a=at/6*TAU,q=[p[0]+Math.cos(a)*.4,p[1]+Math.sin(a)*.4,j===2?0:j===0?.25:-.25];atom(group,q);bond(group,p,q)});
  }
  for(const i of [2,6,11,15]){const p=backbone[i],q=[p[0],p[1]+(i%2?.4:-.4),0],group=i<9?left:right;atom(group,q);bond(group,p,q)}
  const products=[];
  for(const [group,index,direction]of [[left,8,1],[right,9,-1]]){
   const p=backbone[index],o=[p[0]+direction*.3,p[1]+direction*.2,0],atomO=sphere(group,o,[.1,.1,.1],oxygen),link=bond(group,p,o),link2=bond(group,p.map((v,k)=>v+(k===2?.06:0)),o.map((v,k)=>v+(k===2?.06:0)));atomO.userData.element='O';products.push(atomO,link,link2);
  }
  this.dynamic.push(t=>{
   const enter=smoothstep(0,.25,t),split=smoothstep(.35,.72,t);molecule.position.y=.6-enter*.5;left.position.set(-split*.45,split*.48,0);right.position.set(split*.45,-split*.48,0);left.rotation.z=split*.1;right.rotation.z=-split*.1;centralBond.visible=centralBond2.visible=split<.99;centralMaterial.opacity=1-split;products.forEach(p=>p.visible=split>.6);
  });
  this.label('Carotene 胡蘿蔔素',[-2.6,.6,.6],{className:'gold'});this.label('Conversion in liver 在肝內轉化',[0,.1,.6]);this.label('Vitamin A · retinal sketch 維生素A：視黃醛示意',[2.7,-.6,.6],{className:'gold'});
  const [inputLabel,conversionLabel,productLabel]=this.labels.slice(-3);this.dynamic.push(t=>{const split=smoothstep(.35,.72,t),point=(p,g)=>vec(...p).applyEuler(g.rotation).add(g.position).add(molecule.position);inputLabel.point.copy(point(backbone[0],left));productLabel.point.copy(point(backbone[17],right));conversionLabel.point.copy(point(backbone[8],left).add(point(backbone[9],right)).multiplyScalar(.5));inputLabel.enabled=split<.9;conversionLabel.enabled=split<.98;productLabel.enabled=split>.6});
 }
 buildAdipose(s){
  const membrane=mat('#e6b4a0',{transparent:true,opacity:.3,roughness:.4,side:T.DoubleSide});this.tissue.push({material:membrane,open:.25,closed:.85});
  for(let i=0;i<5;i++){
   const a=i*TAU/5,x=Math.cos(a)*1.75,y=Math.sin(a)*1.45,cell=sphere(this.root,[x,y,0],[1.12,1.08,.8],membrane),fat=sphere(this.root,[x,y,.02],[.65,.65,.6],mat('#e8c56f',{roughness:.3,clearcoat:.55}));fat.name='lipid-droplet';sphere(this.root,[x+.9,y,.1],[.13,.3,.16],mat('#8f667a'));
   this.dynamic.push(t=>{const size=.52+smoothstep(.1,.85,t)*.38;fat.scale.set(size,size,size*.9);cell.scale.set(1.08+size*.1,1.04+size*.1,.8)});
   this.addFlow(curve([[x*1.6,y*1.6,.3],[x*1.3,y*1.3,.4],[x,y,.15]]),'#deba4b',5,.065,.8);
  }
  this.label('Adipose tissue 脂肪組織',[0,2.65,.3]);this.label('Lipid droplet expands 脂滴增大',[0,-2.65,.3],{className:'gold'});
 }
 buildColon(s){
  this.homeZ=13.4;this.camera.position.set(0,0,this.homeZ);
  const centre=curve([[-2,-2.7,0],[-2.2,-1.8,0],[-2.25,.8,0],[-1.8,2.2,0],[0,2.4,0],[2,2,0],[2.2,.5,0],[2,-1.3,0],[1,-2,0],[.3,-2.4,0],[.1,-3,0]]),frames=centre.computeFrenetFrames(180,false);
  const nu=180,nv=32,r=.43,positions=[],uv=[],indices=[];
  for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const u=i/nu,a=j/nv*TAU,p=centre.getPointAt(u),N=frames.normals[i],B=frames.binormals[i],radius=r*(1+.14*Math.cos(u*TAU*17));positions.push(p.x+radius*(Math.cos(a)*N.x+Math.sin(a)*B.x),p.y+radius*(Math.cos(a)*N.y+Math.sin(a)*B.y),p.z+radius*(Math.cos(a)*N.z+Math.sin(a)*B.z));uv.push(u,j/nv)}
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;indices.push(a,a+1,b,a+1,b+1,b)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const material=mat('#fff0e5',{map:this.surfaceTexture,bumpMap:this.surfaceTexture,bumpScale:.035,roughness:.52,side:T.DoubleSide});const wallMesh=mesh(g,material,this.root);wallMesh.name='colon-wall';this.tissue.push({material});
  const innerGeometry=g.clone(),innerMaterial=mat('#cb8c7b',{map:this.surfaceTexture,bumpMap:this.surfaceTexture,bumpScale:.018,roughness:.62,side:T.DoubleSide});mesh(innerGeometry,innerMaterial,this.root);this.tissue.push({material:innerMaterial});
  const rings=[];for(let i=0;i<18;i++){const u=.04+i*.05,p=centre.getPointAt(u),ring=mesh(new T.TorusGeometry(.43,.025,7,32),mat('#bb7e73'),this.root);ring.name='circular-muscle-ring';ring.userData.pathPosition=u;ring.position.copy(p);ring.quaternion.setFromUnitVectors(vec(0,0,1),centre.getTangentAt(u));this.tissue.push({material:ring.material});rings.push({u,ring})}
  for(let i=0;i<17;i++){const u=.06+i*.048,p=centre.getPointAt(u),normal=frames.normals[Math.round(u*nu)],position=p.clone().addScaledVector(normal,-.51);const fat=sphere(this.root,position.toArray(),[.1,.16,.09],mat('#d9bf7b'));fat.rotation.z=i*.3;}
  // Contractile geometry narrows the bowel immediately BEHIND the moving bolus.
  const stool=drop(this.root,[-2,-2,0],[.36,.56,.35],'#8f6748'),water=[],retainedWater=[];stool.name='faecal-contents';const fast=s.transit==='fast';
  for(let i=0;i<15;i++){const w=drop(this.root,[0,0,0],[.055,.055,.055],'#55a4bb');w.name='retained-water';retainedWater.push(w)}
  for(let i=0;i<28;i++)water.push(drop(this.root,[0,0,0],[.055,.055,.055],'#5ba8bf'));
  const vessels=[];for(let i=0;i<14;i++){const u=.08+i*.055,p=centre.getPointAt(u),N=frames.normals[Math.round(u*nu)],wall=p.clone().addScaledVector(N,.43),end=p.clone().addScaledVector(N,.9);const vessel=tube(this.root,[wall.toArray(),end.toArray(),[end.x+.1,end.y-.4,end.z-.2]],.027,mat('#b95864')).path;vessels.push({u,path:vessel});this.addFlow(vessel,'#ad3d50',2,.03,.7,'blood')}
  this.dynamic.push(t=>{
   const u=.05+t*.86,point=centre.getPointAt(u),absorbed=t*(fast?.3:1);stool.userData.pathPosition=u;stool.position.copy(point);stool.quaternion.setFromUnitVectors(vec(0,1,0),centre.getTangentAt(u));stool.scale.set(.36-absorbed*.07,.56-absorbed*.16,.35-absorbed*.06);stool.material.color.setRGB(.49-absorbed*.11,.30-absorbed*.1,.14-absorbed*.04);stool.material.roughness=.15+absorbed*.5;
   retainedWater.forEach((w,i)=>{const a=i/15*TAU,r=.26+.04*Math.sin(i);w.position.copy(point).add(vec(Math.cos(a)*r,Math.sin(a)*r,.18));w.visible=i/15<1-absorbed});
   const pos=g.attributes.position,inner=innerGeometry.attributes.position;
   for(let i=0;i<=nu;i++){const v=i/nu,p=centre.getPointAt(v),wave=Math.exp(-Math.pow((v-(u-.065))/.042,2)),radius=r*(1+.14*Math.cos(v*TAU*17))*(1-.47*wave);for(let j=0;j<=nv;j++){const a=j/nv*TAU,N=frames.normals[i],B=frames.binormals[i],k=i*(nv+1)+j,dx=radius*(Math.cos(a)*N.x+Math.sin(a)*B.x),dy=radius*(Math.cos(a)*N.y+Math.sin(a)*B.y),dz=radius*(Math.cos(a)*N.z+Math.sin(a)*B.z);pos.setXYZ(k,p.x+dx,p.y+dy,p.z+dz);inner.setXYZ(k,p.x+dx*.78,p.y+dy*.78,p.z+dz*.78)}}pos.needsUpdate=true;inner.needsUpdate=true;g.computeVertexNormals();innerGeometry.computeVertexNormals();rings.forEach(({u:v,ring})=>ring.scale.setScalar(1-.47*Math.exp(-Math.pow((v-(u-.065))/.042,2))));
   water.forEach((w,i)=>{const travel=(t+i/28)%1,along=.08+(i%14)*.055,frame=frames.normals[Math.round(along*nu)],base=centre.getPointAt(along),out=smoothstep(.25,.8,travel);w.position.copy(base).addScaledVector(frame,out*.95);w.position.z+=.05*Math.sin(i);w.visible=travel<.88&&(!fast||i%3===0);w.scale.setScalar(.055*(1-out*.35))});
  });
  this.label('Colon 結腸 · haustra 結腸袋',[0,2.4,.2]);this.label('Circular muscle contraction 環肌收縮',[-2.2,.1,.25]);const contractionLabel=this.labels[this.labels.length-1];this.label('Water crosses wall 水分穿過腸壁',[2.2,.5,.3],{className:'blue'});this.label('Rectum 直腸',[.1,-2.9,.05]);this.label('Faeces 糞便',[-2,-2,.05]);const stoolLabel=this.labels[this.labels.length-1];this.dynamic.push(t=>{const u=.05+t*.86;contractionLabel.point.copy(centre.getPointAt(Math.max(0,u-.065)));stoolLabel.point.copy(stool.position)});
 }
}
window.AnatomyScene=AnatomyScene;
})();
