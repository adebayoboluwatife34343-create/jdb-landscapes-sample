import {T,stage,initReveal,initMenu,initQuote,addLights,reduced,clamp,lerp,$,$$} from './common.js';
initMenu();initQuote();initReveal();
const sl=$('#slabs');if(sl){const c=innerWidth<700?5:8,r=innerWidth<700?8:5;sl.style.setProperty('--c',c);sl.style.setProperty('--r',r);for(let y=0;y<r;y++)for(let x=0;x<c;x++){const i=document.createElement('i');i.style.setProperty('--d',(1.9+(x+y)*.07)+'s');sl.appendChild(i)}const b=document.createElement('b');b.innerHTML='JDB LANDSCAPES<small>WATERLOOVILLE</small>';sl.appendChild(b)}
setTimeout(()=>document.documentElement.classList.add('sl-skip'),3500);addEventListener('keydown',()=>document.documentElement.classList.add('sl-skip'),{once:true});
// open now (UK): Mon 7-18, Tue 8-18, Wed-Fri 7-18
const pp=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'short',hour:'numeric',hour12:false}).formatToParts(new Date());const wd=pp.find(p=>p.type==='weekday').value.slice(0,3),hr=+pp.find(p=>p.type==='hour').value%24;const st={Mon:7,Tue:8,Wed:7,Thu:7,Fri:7}[wd];const on=st!==undefined&&hr>=st&&hr<18;$('#opennow').textContent=(on?'Open now. ':'')+'07:00 to 18:00 (Tue from 08:00)';
const host=$('#patio'),again=$('#again');let colour='light',lay=reduced?1:0,layT=0,run=!reduced,delay=reduced?0:3.4;
$$('.sw button').forEach(b=>b.addEventListener('click',()=>{colour=b.dataset.c;$$('.sw button').forEach(x=>x.setAttribute('aria-checked',x===b));if(ctx)ctx.invalidate()}));
again.addEventListener('click',()=>{if(reduced){lay=1;return}lay=0;layT=0;delay=0;run=true});
const ctx=stage(host,ctx=>{
 const {scene,cam}=ctx;cam.lookAt(0,-.2,0);addLights(ctx,{fill:0xc7d6e2,ground:0x59666f,ki:2.5,hi:1.4});
 const g=new T.Group();scene.add(g);
 const COLS=8,ROWS=5,sz=1.04;const slabs=[];
 const lightM=new T.MeshStandardMaterial({color:0xcfd6dd,roughness:.85}),darkM=new T.MeshStandardMaterial({color:0x69757f,roughness:.85}),edgeM=new T.MeshStandardMaterial({color:0x2e353b,roughness:.8}),gravel=new T.MeshStandardMaterial({color:0x9db1bd,roughness:1}),soilM=new T.MeshStandardMaterial({color:0x3d4a52,roughness:1});
 const ground=new T.Mesh(new T.BoxGeometry(COLS*sz+3,.3,ROWS*sz+3),soilM);ground.position.y=-.45;g.add(ground);
 const geo=new T.BoxGeometry(sz*.95,.14,sz*.95);
 for(let z=0;z<ROWS;z++)for(let x=0;x<COLS;x++){const m=new T.Mesh(geo,lightM);const to=new T.Vector3((x-(COLS-1)/2)*sz,0,(z-(ROWS-1)/2)*sz);m.userData={to,x,z,d:(x*.045+z*.06),dark:(x+z)%2===1};m.position.copy(to).add(new T.Vector3(0,6,0));m.rotation.set(Math.random()-.5,Math.random()-.5,Math.random()-.5);g.add(m);slabs.push(m)}
 // edging kerbs (charcoal) around
 const edges=[];function kerb(w,d,x,z,dd){const k=new T.Mesh(new T.BoxGeometry(w,.2,d),edgeM);k.userData={to:new T.Vector3(x,.03,z),d:.7+dd*.05};k.position.copy(k.userData.to).add(new T.Vector3(0,5,0));g.add(k);edges.push(k)}
 const hw=COLS*sz/2+.14,hd=ROWS*sz/2+.14;kerb(COLS*sz+.5,.22,0,hd,0);kerb(COLS*sz+.5,.22,0,-hd,1);kerb(.22,ROWS*sz,hw,0,2);kerb(.22,ROWS*sz,-hw,0,3);
 // decorative stones strip
 const stones=new T.InstancedMesh(new T.IcosahedronGeometry(.11,0),gravel,140);const tm=new T.Object3D();const sdata=[];for(let i=0;i<140;i++){const side=i%2?1:-1;const x=(Math.random()-.5)*(COLS*sz+1.6),z=side*(hd+.42+Math.random()*.5);sdata.push([x,z,Math.random()*.6+.7,Math.random()*3]);tm.position.set(x,-.22+Math.random()*.1,z);tm.scale.setScalar(.7+Math.random()*.7);tm.rotation.set(Math.random()*3,Math.random()*3,0);tm.updateMatrix();stones.setMatrixAt(i,tm.matrix)}g.add(stones);
 // fence at back: posts + lattice top panels
 const fenceM=new T.MeshStandardMaterial({color:0x4b6a80,roughness:.75}),fenceM2=new T.MeshStandardMaterial({color:0x3a566a,roughness:.75});const fparts=[];const fz=-hd-1.5;
 for(let i=0;i<=4;i++){const p=new T.Mesh(new T.BoxGeometry(.2,2.2,.2),fenceM2);p.userData={to:new T.Vector3((i-2)*2.25,.65,fz),d:1.0+i*.05};p.position.copy(p.userData.to).add(new T.Vector3(0,-3,0));g.add(p);fparts.push(p)}
 for(let i=0;i<4;i++){const pn=new T.Group();const body=new T.Mesh(new T.BoxGeometry(2.05,1.4,.07),fenceM);body.position.y=-.2;pn.add(body);for(let k=0;k<7;k++){const s=new T.Mesh(new T.BoxGeometry(.03,.6,.05),fenceM2);s.position.set(-.9+k*.3,.8,.02);s.rotation.z=.6;pn.add(s);const s2=s.clone();s2.rotation.z=-.6;pn.add(s2)}pn.userData={to:new T.Vector3((i-1.5)*2.25,.8,fz+.02),d:1.15+i*.06};pn.position.copy(pn.userData.to).add(new T.Vector3(0,-3,0));g.add(pn);fparts.push(pn)}
 g.position.y=-.1;let wasLay=-1;
 return{tick(c,dt){const S=c.state;
  if(run&&!reduced){if(delay>0)delay-=dt;else{layT+=dt;lay=clamp(layT/3.4);if(lay>=1)run=false}}
  for(const m of slabs){const u=m.userData;const k=clamp((lay*1.6-u.d)/.35);const e=1-Math.pow(1-k,3);m.position.set(u.to.x,u.to.y+(1-e)*6,u.to.z);m.rotation.set((1-e)*m.rotation.x*.9,(1-e)*m.rotation.y*.9,(1-e)*m.rotation.z*.9);m.visible=k>0;m.material=colour==='light'?lightM:colour==='dark'?darkM:(u.dark?darkM:lightM)}
  for(const e of edges){const k=clamp((lay*1.6-e.userData.d*.35)/.3);e.position.set(e.userData.to.x,e.userData.to.y+(1-k)*5,e.userData.to.z);e.visible=k>0}
  for(const f of fparts){const k=clamp((lay*1.6-f.userData.d*.45)/.3);const ee=1-Math.pow(1-k,3);f.position.set(f.userData.to.x,f.userData.to.y-(1-ee)*3,f.userData.to.z);f.visible=k>0}
  stones.visible=lay>.5;
  g.rotation.y=-.5+S.ry+(reduced?0:S.px*.18+Math.sin(S.t*.25)*.05)+S.sy*.4;g.rotation.x=S.rx*.4+(reduced?0:S.py*.05);
  if(reduced&&run)c.invalidate()}}},{fov:34,cam:[0,6.2,12.5]});
