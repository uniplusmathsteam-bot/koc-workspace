/* Readable teaching particles and lens zoom: camera stays outside the anatomy. */
(() => {
'use strict';
const T=window.THREE,P=window.AnatomyScene?.prototype;if(!T||!P)return;
const limits={min:.25,max:12};
function zoomValue(value){return Math.max(limits.min,Math.min(limits.max,value))}
function displayFactor(radius,pixelsPerWorld,size='large',structural=false){const target={normal:3,large:5,extra:7.5}[size]||5,boost=structural?1.12:1.65;return Math.max(boost,Math.min(30,(structural?target*.5:target)/Math.max(.0001,radius*pixelsPerWorld)))}
P.setZoom=function(value){this.camera.zoom=zoomValue(value);this.camera.updateProjectionMatrix();const slider=this.host.querySelector('[data-view=zoom]'),output=this.host.querySelector('[data-view=readout]');if(slider){slider.value=Math.log2(this.camera.zoom);slider.setAttribute('aria-valuetext',Math.round(this.camera.zoom*100)+'%')}if(output)output.textContent=Math.round(this.camera.zoom*100)+'%';this.render()};
P.resetView=function(){this.root.position.set(0,0,0);this.root.rotation.set(this.atlas&&this.currentMode==='route'?0:-.08,this.atlas&&this.currentMode==='route'?0:-.08,0);this.camera.position.z=this.homeZ||13;this.setZoom(1)};
P.prepareReadableParticles=function(){
 this.readableParticles=[];
 this.root.traverse(o=>{
  const structural=/^(glycogen-granule|protein-monomer|phospholipid-head|work-glycogen|work-iron|work-vitamin)/.test(o.name);
  if(!o.userData.readableParticle&&!structural&&!/^(work-(glucose|bile|carotene|remainder|nitrogen|urea|peroxide|water|oxygen)|hormone-lipid-input|sex-hormone-product)/.test(o.name))return;
  let radius=o.userData.particleRadius;if(!radius&&o.geometry){o.geometry.computeBoundingSphere();radius=o.geometry.boundingSphere.radius}radius=radius||.1;
  const meshes=[];o.traverse(m=>{if(m.isMesh&&!m.userData.particleHalo)meshes.push(m)});
  const layers=[];for(const m of meshes){
   const material=m.material;material.transparent=true;material.depthWrite=false;material.emissive?.copy(material.color).multiplyScalar(.18);m.renderOrder=31;
   const halo=new T.Mesh(m.geometry,new T.MeshBasicMaterial({color:'#fffdf2',side:T.BackSide,depthTest:false,depthWrite:false}));halo.scale.setScalar(1.2);halo.renderOrder=30;halo.userData.particleHalo=true;m.add(halo);layers.push({mesh:m,halo});
  }
  this.readableParticles.push({object:o,radius,structural,layers});
 });
};
P.withReadableParticles=function(draw){
 const camera=this.camera,height=this.viewport.clientHeight,world=new T.Vector3(),scale=new T.Vector3(),saved=[];
 for(const item of this.readableParticles||[]){const o=item.object;if(!o.visible)continue;o.getWorldPosition(world);o.getWorldScale(scale);const depth=Math.max(.1,world.distanceTo(camera.position)),pixels=height*camera.zoom/(2*depth*Math.tan(T.MathUtils.degToRad(camera.fov/2))),radius=item.radius*Math.max(scale.x,scale.y,scale.z),factor=displayFactor(radius,pixels,this.particleSize,item.structural);saved.push([o,o.scale.clone()]);o.scale.multiplyScalar(factor);for(const {mesh,halo}of item.layers){mesh.material.depthTest=!this.particleThrough;halo.visible=this.particleThrough;}}
 try{draw()}finally{saved.forEach(([o,scale])=>o.scale.copy(scale))}
};
P.installViewControls=function(){
 this.particleSize='large';this.particleThrough=true;this.panMode=false;
 const bar=document.createElement('div');bar.className='scene-view-controls';bar.innerHTML='<div class="view-zoom-row"><button data-view="out" aria-label="Zoom anatomy out">−</button><input data-view="zoom" type="range" min="-2" max="3.584963" step="0.05" value="0" aria-label="Anatomy zoom" aria-valuetext="100%"><button data-view="in" aria-label="Zoom anatomy in">＋</button><output data-view="readout">100%</output><button data-view="pan" aria-pressed="false">Pan 移動</button></div><div class="view-particle-row"><label>Particles 粒子 <select data-view="size" aria-label="Anatomy particle size"><option value="normal">Normal 標準</option><option value="large" selected>Large 大</option><option value="extra">Extra large 特大</option></select></label><label><input data-view="through" type="checkbox" checked>Through tissue 透視</label><span>Sizes enlarged for visibility 粒子已放大</span></div>';
 this.host.append(bar);
 bar.onclick=e=>{const action=e.target.dataset.view;if(action==='in')this.setZoom(this.camera.zoom*1.25);if(action==='out')this.setZoom(this.camera.zoom/1.25);if(action==='pan'){this.panMode=!this.panMode;e.target.setAttribute('aria-pressed',this.panMode);this.renderer.domElement.style.cursor=this.panMode?'move':'grab'}};
 bar.oninput=e=>{if(e.target.dataset.view==='zoom')this.setZoom(2**+e.target.value);if(e.target.dataset.view==='size'){this.particleSize=e.target.value;this.render()}if(e.target.dataset.view==='through'){this.particleThrough=e.target.checked;this.render()}};
 const canvas=this.renderer.domElement,points=new Map();let drag=null,pinch=null;
 const unit=()=>2*this.camera.position.distanceTo(this.root.position)*Math.tan(T.MathUtils.degToRad(this.camera.fov/2))/(Math.max(1,this.viewport.clientHeight)*this.camera.zoom);
 const gesture=()=>{const [a,b]=[...points.values()];return {distance:Math.hypot(a.x-b.x,a.y-b.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{points.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);if(points.size===2){pinch={...gesture(),zoom:this.camera.zoom,position:this.root.position.clone(),unit:unit()};drag=null;return}drag={x:e.clientX,y:e.clientY,rotation:this.root.rotation.clone(),position:this.root.position.clone(),unit:unit(),pan:this.panMode||e.shiftKey||e.button===2||(this.atlas&&this.currentMode==='route')};};
 canvas.onpointermove=e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2&&pinch){const g=gesture();this.root.position.set(pinch.position.x+(g.x-pinch.x)*pinch.unit,pinch.position.y-(g.y-pinch.y)*pinch.unit,pinch.position.z);this.setZoom(pinch.zoom*g.distance/Math.max(1,pinch.distance));return}if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.pan)this.root.position.set(drag.position.x+dx*drag.unit,drag.position.y-dy*drag.unit,drag.position.z);else this.root.rotation.set(T.MathUtils.clamp(drag.rotation.x+dy*.008,-1.4,1.4),drag.rotation.y+dx*.008,drag.rotation.z);this.render()};
 canvas.onpointerup=canvas.onpointercancel=e=>{points.delete(e.pointerId);drag=null;pinch=null;};
 canvas.onwheel=e=>{e.preventDefault();this.setZoom(this.camera.zoom*Math.exp(-e.deltaY*.0015))};
};
window.AnatomyViewMath={zoomValue,displayFactor,limits};
})();
