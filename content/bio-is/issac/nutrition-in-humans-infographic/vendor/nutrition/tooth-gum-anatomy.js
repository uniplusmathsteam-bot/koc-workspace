/* Crown and external gingival geometry adapted from human-teeth-explorer.html.
   No exposed roots: scurvy is shown at the gingival margin, with separate 2D tissue explanation. */
(() => {
'use strict';const T=window.THREE,P=window.AnatomyScene?.prototype;if(!T||!P)return;
function param(fn,nu=64,nv=24){const positions=[],indices=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)positions.push(...fn(i/nu,j/nv));for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;indices.push(a,b,a+1,a+1,b,b+1)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g}
function mesh(g,color,parent,name){const m=new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:.45,side:T.DoubleSide}));m.name=name;parent.add(m);return m}
function crown(parent,x){const g=new T.Group();parent.add(g);g.position.x=x;const w=.62,d=.56,h=.91,sq=v=>Math.sign(v)*Math.abs(v)**.7;
 mesh(param((u,t)=>{const a=u*Math.PI*2,c=Math.cos(a),s=Math.sin(a),r=.73+.25*Math.sin(t*Math.PI*.78),lobes=1+.017*Math.cos(a*3)*Math.sin(t*Math.PI),xx=w*r*sq(c)*lobes,z=d*r*sq(s),groove=.025*Math.cos(xx/w*3*Math.PI)*Math.exp(-Math.abs(s-.85)*4)*Math.sin(t*Math.PI);return[xx,t*h+groove,z]}),'#eeeadd',g,'scurvy-tooth-crown');
 mesh(param((u,t)=>{const a=u*Math.PI*2,r=(.73+.25*Math.sin(Math.PI*.78))*(1-t),xx=w*r*sq(Math.cos(a)),z=d*r*sq(Math.sin(a));let y=h;for(const[cx,cz]of[[-.48,-.48],[-.48,.48],[.48,-.48],[.48,.48]])y+=.19*Math.exp(-((xx/w-cx)**2+(z/d-cz)**2)/.13)*Math.min(1,t*6);y-=.055*Math.exp(-xx*xx/(w*w*.035))*Math.min(1,t*6);return[xx,y,z]},56,26),'#eeeadd',g,'scurvy-tooth-cusp');return g;}
P.buildGumScurvy=function(s){this.homeZ=s.compareBoth?8:5.7;this.camera.position.set(0,.2,this.homeZ);this.root.rotation.set(-.12,-.1,0);const variants=s.compareBoth?[false,true]:[s.diseaseComparison!=='healthy'];
 variants.forEach((bad,index)=>{const g=new T.Group();this.root.add(g);g.position.x=s.compareBoth?(index?1.9:-1.9):0;g.position.y=-.12;const teeth=[crown(g,-.66),crown(g,.66)];
 const margin=x=>.028+.21*Math.exp(-x*x/.035)+.065*Math.exp(-((Math.abs(x)-1.4)**2)/.018),surface=x=>.55+.07*Math.cos(x/1.6*Math.PI/2),local=x=>Math.exp(-x*x/.50),edge=(x,q)=>margin(x)+q*.14*local(x),front=(x,v,q)=>surface(x)-.045*(1-v)+.035*Math.sin(Math.PI*v)+q*.17*local(x)*Math.exp(-Math.pow((1-v)/.21,2));
 const gumPoint=(u,v,q)=>{const x=-1.6+3.2*u;return[x,-.85+(edge(x,q)+.85)*v,front(x,v,q)]},rimPoint=(u,v,q)=>{const x=-1.6+3.2*u;return[x,edge(x,q)+(.015+q*.04)*Math.sin(v*Math.PI),front(x,1,q)-v*.4]};
 const gum=mesh(param((u,v)=>gumPoint(u,v,0),64,22),'#c17a83',g,'scurvy-external-gum'),rim=mesh(param((u,v)=>rimPoint(u,v,0),64,8),'#c17a83',g,'scurvy-gingival-margin');gum.userData.affected=bad;
 const base=mesh(new T.BoxGeometry(3.2,.12,.4),'#c17a83',g,'scurvy-gum-base');base.position.set(0,-.81,.32);
 for(const side of[-1,1])mesh(param((u,v)=>{const x=side*1.6;return[x,-.85+(edge(x,0)+.85)*u,front(x,u,0)-v*.4]},24,12),'#c17a83',g,'scurvy-gum-side');
 const blood=[[-.34,.052],[-.2,.062],[.19,.058],[.34,.044]].map(([x,r],i)=>{const m=mesh(new T.SphereGeometry(r,18,12),'#9c1428',g,'scurvy-surface-blood');m.userData.affected=bad;m.userData.id=i;return {m,x,r}});
 const title=this.label(bad?'Vitamin C deficiency 維生素C不足':'Healthy gum 正常齒齦',[g.position.x,1.5,.1]);const condition=this.label('Gingival margin 齒齦邊緣',[g.position.x,-1.15,.8]);
 const deform=(m,nu,nv,fn,q)=>{const p=m.geometry.attributes.position;for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const a=fn(i/nu,j/nv,q);p.setXYZ(j*(nu+1)+i,...a)}p.needsUpdate=true;m.geometry.computeVertexNormals()};
 this.dynamic.push(t=>{const sw=bad?window.MechanismCore.ramp(t,.12,.62):0,q=bad?window.MechanismCore.ramp(t,.65,1):0;deform(gum,64,22,gumPoint,sw);deform(rim,64,8,rimPoint,sw);for(const m of[gum,rim])m.material.color.set('#c17a83').lerp(new T.Color('#a63e58'),sw*.82);gum.userData.swelling=sw;for(const e of blood){e.m.visible=q>0;e.m.position.set(e.x,edge(e.x,sw)-.01,front(e.x,1,sw)+.028);e.m.scale.set(q,q*.76,q*.7)}for(const [i,tooth]of teeth.entries())tooth.rotation.z=bad?Math.sin(t*18+i)*window.MechanismCore.ramp(t,.9,1)*.015:0;condition.textContent=!bad?'Gums hug the crowns 齒齦貼合牙冠':q>0?'Swollen, bleeding margin 紅腫及出血':sw>0?'Gum margin swells 齒齦邊緣隆起':'Before visible change 變化前';});
 });};
window.ToothGumAnatomy={param,crown};
})();
