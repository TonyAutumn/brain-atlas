import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {GROUPS,ATLAS,describe,LOCATION} from './labels.js';
const $=id=>document.getElementById(id);
const knownKey='brain-atlas-anatomy-known-v1';
let known=new Set();try{known=new Set(JSON.parse(localStorage.getItem(knownKey)||'[]'));}catch{}
const state={group:'all',hemi:'both',query:'',knownOnly:false,source:'julich',selected:null,colors:false,isolate:false};
let entries=[],renderer,scene,camera,controls,raycaster,meshes=new Map(),shells=[],dirty=true,loadedFiles=new Map();
const clip=new THREE.Plane(new THREE.Vector3(1,0,0),0);
const cursor=new THREE.Vector2();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const debounce=(fn,ms)=>{let t;return (...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};
const sourceFits=e=>state.source==='cit168'?e.atlas==='cit168':e.atlas==='julich'||e.atlas==='aal';
const matches=e=>sourceFits(e)&&(state.group==='all'||e.category===state.group)&&(state.hemi==='both'||e.hemisphere===state.hemi||e.hemisphere==='M')&&(!state.knownOnly||known.has(e.id))&&(!state.query||e.text.search.includes(state.query));
const visibleEntries=()=>entries.filter(matches);
function toast(s){$('toast3').textContent=s;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast3').textContent='',3200)}
function renderList(){
 const list=visibleEntries().sort((a,b)=>a.text.title.localeCompare(b.text.title,'zh-CN')||a.hemisphere.localeCompare(b.hemisphere));
 $('listCount').textContent=`${list.length} 个条目 / ${entries.length} 个可选`;
 $('learnedCount').textContent=`已学习 ${entries.filter(e=>known.has(e.id)).length}`;
 $('regionItems').innerHTML=list.length?list.map(e=>`<button class="region-item ${known.has(e.id)?'learned':''} ${e.id===state.selected?'active':''}" data-id="${e.id}" aria-pressed="${e.id===state.selected}"><span class="hem">${e.hemisphere==='M'?'中线':e.hemisphere}</span><strong>${escape(e.text.title)}</strong><small>${escape(e.name)}</small></button>`).join(''):'<p class="empty3">没有匹配的条目。可清空搜索、切换图谱或显示双侧。</p>';
 $('groupFilters').querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.group===state.group);b.setAttribute('aria-pressed',String(b.dataset.group===state.group))});
 updateMaterials();
}
function updateMaterials(){
 for(const e of entries){
  const mesh=meshes.get(e.id);if(!mesh)continue;
  mesh.visible=matches(e)&&(!state.isolate||e.id===state.selected);
  const selected=e.id===state.selected,learned=known.has(e.id),mat=mesh.material;
  const base=state.colors&&e.color?new THREE.Color(`rgb(${e.color.join(',')})`):new THREE.Color(e.category==='cortex'?'#b3bdcc':'#a0adbf');
  mat.color.copy(selected?new THREE.Color('#39b9ff'):learned?new THREE.Color('#1675b2'):base);
  mat.emissive.set(selected?'#0877b5':learned?'#06395a':'#000000');
  mat.emissiveIntensity=selected?.65:.32;
  mat.opacity=selected?.96:learned?.65:state.group==='all'?(e.category==='cortex'?.095:.30):.34;
  if(state.colors&&!selected&&!learned)mat.opacity+=.13;
  mat.depthWrite=selected||learned;
  mat.depthTest=!selected;
  mesh.renderOrder=selected?10:learned?5:0;
 }
 const opacity=Number($('opacity3').value)/100;
 shells.forEach(m=>{m.visible=(state.hemi==='both'||m.userData.entry.hemisphere===state.hemi)&&opacity>0;m.material.opacity=opacity;});
 dirty=true;
}
function renderDetail(e){
 const a=ATLAS[e.atlas];
 const precise=e.name.includes('Subc')?'此标签是“下托复合体”，不能自动等同于所有论文中的 subiculum；需核对论文采用的亚区定义。':e.name.includes('GapMap')?'图谱未定义范围。':a.description;
 $('detail3').innerHTML=`<div class="detail-label"><span class="eyebrow">REGION PROFILE</span><span class="atlas-badge">${a.name}</span></div><h2>${escape(e.text.title)}</h2><p class="latin3">${escape(e.name)}</p><div class="detail-section breadcrumb3">${e.text.side} · ${GROUPS[e.category]}<br>${a.type} · 标签 ${e.label}</div><div class="detail-actions"><button id="focusSelected">定位放大</button><button class="learn-btn" id="markLearned" aria-pressed="${known.has(e.id)}">${known.has(e.id)?'✓ 已学习':'标记已学习'}</button></div><hr class="detail-hr"><section class="detail-section"><h3>空间位置</h3><p>${LOCATION[e.category]}</p></section><section class="detail-section"><h3>显示中心 · MNI 毫米</h3><div class="coord-grid">${['X','Y','Z'].map((a,i)=>`<div><span>${a}</span><strong>${e.center[i].toFixed(1)}</strong></div>`).join('')}</div><p class="micro-note" style="margin-top:10px">网格中心，非激活峰。X：左负右正；Y：后负前正；Z：下负上正。</p></section><section class="detail-section"><h3>如何理解这个边界</h3><p>${precise}</p><a class="source-link" href="${a.url}" target="_blank" rel="noopener">查看图谱原始研究 ↗</a></section><section class="detail-section"><h3>文献学习</h3><p class="micro-note">本次先建立解剖底座。之后可把论文的实验条件、定位与证据关联到这个条目。当前蓝光只表示选择或学习记录。</p></section>`;
 $('focusSelected').onclick=()=>focus(e);
 $('markLearned').onclick=()=>{
  if(known.has(e.id))known.delete(e.id);else known.add(e.id);
  let saved=true;try{localStorage.setItem(knownKey,JSON.stringify([...known]));}catch{saved=false;}
  renderDetail(e);renderList();toast(saved?(known.has(e.id)?'已保存学习标记':'已取消学习标记'):'浏览器限制了保存；本次标记仅在当前页面保留');
 };
 $('stageTitle').textContent=e.text.full;
}
async function select(id,{zoom=false,reveal=false}={}){
 const e=entries.find(e=>e.id===id);if(!e)return;
 state.selected=id;
 if(reveal){state.source=e.atlas==='cit168'?'cit168':'julich';state.group=e.category;state.query='';$('search3').value='';state.knownOnly=false;$('knownOnly').setAttribute('aria-pressed','false');if(state.hemi!=='both'&&state.hemi!==e.hemisphere)setHemi('both');}
 try{await loadFile(e.file);}catch(err){toast('这个结构尚未加载成功，请刷新重试');return;}
 renderList();renderDetail(e);if(zoom)focus(e);
 if(innerWidth<=1100&&window.atlasReady)$('detail3').classList.add('open');
}
function focus(e){
 const centre=new THREE.Vector3(...e.center);const size=new THREE.Vector3(...e.bounds[1]).sub(new THREE.Vector3(...e.bounds[0])).length();
 const direction=camera.position.clone().sub(controls.target).normalize();
 controls.target.copy(centre);camera.position.copy(centre).addScaledVector(direction,Math.max(45,size*2.8));controls.update();dirty=true;
}
function setHemi(hemi){state.hemi=hemi;$('hemiControls').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.hemi===hemi));renderList();}
function setView(view){
 const c=new THREE.Vector3(0,-20,10),d=340;
 const vectors={oblique:[-1.05,-1.25,.72],left:[-1,0,0],front:[0,1,0],top:[0,-.001,1]};
 camera.up.set(0,0,1);
 camera.position.copy(new THREE.Vector3(...vectors[view]).normalize().multiplyScalar(d).add(c));controls.target.copy(c);controls.update();dirty=true;
}
function setupScene(){
 const canvas=$('brainCanvas');
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor('#000000',0);renderer.localClippingEnabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(39,1,.1,1500);camera.up.set(0,0,1);
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=15;controls.maxDistance=650;controls.rotateSpeed=.7;controls.zoomSpeed=.9;controls.addEventListener('change',()=>dirty=true);
 scene.add(new THREE.HemisphereLight('#e0eeff','#293241',2.0));
 const key=new THREE.DirectionalLight('#ffffff',2.2);key.position.set(-180,130,240);scene.add(key);
 const fill=new THREE.DirectionalLight('#acbdd8',1.5);fill.position.set(140,-170,90);scene.add(fill);
 raycaster=new THREE.Raycaster();
 new ResizeObserver(()=>{const r=$('canvasWrap').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();dirty=true;}).observe($('canvasWrap'));
 setView('oblique');
 const labelPositions={labelL:[-95,-15,0],labelR:[95,-15,0],labelA:[0,87,0],labelP:[0,-123,0]};
 function tick(){requestAnimationFrame(tick);controls.update();if(!dirty||document.hidden)return;renderer.render(scene,camera);const r=canvas.getBoundingClientRect();for(const [id,pos]of Object.entries(labelPositions)){const p=new THREE.Vector3(...pos).project(camera);const el=$(id);el.style.left=((p.x+1)*r.width/2)+'px';el.style.top=((1-p.y)*r.height/2)+'px';el.hidden=Math.abs(p.x)>.98||Math.abs(p.y)>.86||p.z>1;}dirty=false;}
 tick();
 let down=null;
 canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY,time:performance.now()});
 canvas.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5&&performance.now()-down.time<700){const hit=pick(e);if(hit)select(hit.userData.entry.id);}down=null;});
 canvas.addEventListener('pointermove',debounce(e=>{if(e.buttons)return;const hit=pick(e);const tip=$('tooltip3');if(hit){tip.textContent=hit.userData.entry.text.full;const r=canvas.getBoundingClientRect();tip.style.left=Math.min(e.clientX-r.left+15,r.width-240)+'px';tip.style.top=(e.clientY-r.top+15)+'px';canvas.style.cursor='pointer';}else{tip.textContent='';canvas.style.cursor='grab';}},55));
 canvas.addEventListener('pointerleave',()=>$('tooltip3').textContent='');
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')setView('oblique');else if(e.key==='+'||e.key==='-'){camera.position.sub(controls.target).multiplyScalar(e.key==='+'?.85:1.15).add(controls.target);}else{const offset=camera.position.clone().sub(controls.target),axis=e.key.includes('Left')||e.key.includes('Right')?new THREE.Vector3(0,0,1):new THREE.Vector3(1,0,0);offset.applyAxisAngle(axis,['ArrowLeft','ArrowUp'].includes(e.key)?.1:-.1);camera.position.copy(controls.target).add(offset);}controls.update();dirty=true;}});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('loadNotice').classList.remove('hidden');$('loadText').textContent='图形上下文暂时丢失，请刷新恢复。';});
}
function pick(ev){
 const r=$('brainCanvas').getBoundingClientRect();cursor.set((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(cursor,camera);
 const hits=raycaster.intersectObjects([...meshes.values()].filter(m=>m.visible),false);
 return hits.find(h=>$('clipAxis').value==='none'||clip.distanceToPoint(h.point)>=0)?.object;
}
let manifest;
async function loadFile(file){
 if(loadedFiles.has(file))return loadedFiles.get(file);
 const p=(async()=>{
  const response=await fetch(new URL('data/'+file,import.meta.url));if(!response.ok)throw Error(`Model ${response.status}`);
  const compressed=await response.arrayBuffer();let buffer;
  if(typeof DecompressionStream==='undefined')throw Error('需要支持解压缩的新版浏览器');
  const magic=new Uint8Array(compressed,0,2);
  buffer=magic[0]===31&&magic[1]===139?await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():compressed;
  const items=manifest.entries.filter(e=>e.file===file);
  for(const entry of items){
   const positions=Float32Array.from(new Int16Array(buffer,entry.positionOffset,entry.vertices*3),v=>v*entry.positionScale);
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(buffer,entry.indexOffset,entry.triangles*3),1));geometry.computeVertexNormals();geometry.computeBoundingSphere();
   const material=new THREE.MeshStandardMaterial({color:'#bbc3ce',roughness:.78,metalness:.06,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false});
   if($('clipAxis').value!=='none')material.clippingPlanes=[clip];
   const mesh=new THREE.Mesh(geometry,material);mesh.userData.entry=entry;scene.add(mesh);
   if(entry.atlas==='surface'){mesh.renderOrder=2;shells.push(mesh);}else meshes.set(entry.id,mesh);
  }
  updateMaterials();return true;
 })();loadedFiles.set(file,p);try{return await p;}catch(e){loadedFiles.delete(file);throw e;}
}
function bindUI(){
 $('groupFilters').innerHTML=Object.entries(GROUPS).filter(([key])=>key!=='diencephalon').map(([key,name])=>`<button data-group="${key}" ${key==='all'?'class="active"':''}>${name}</button>`).join('');
 $('groupFilters').onclick=e=>{const b=e.target.closest('[data-group]');if(!b)return;state.group=b.dataset.group;renderList();};
 $('regionItems').onclick=e=>{const b=e.target.closest('[data-id]');if(b)select(b.dataset.id);};
 $('search3').addEventListener('input',debounce(()=>{state.query=$('search3').value.trim().toLowerCase();renderList();},120));
 $('knownOnly').onclick=()=>{state.knownOnly=!state.knownOnly;$('knownOnly').setAttribute('aria-pressed',String(state.knownOnly));renderList();};
 $('sourceToggle').onclick=()=>{state.source=state.source==='julich'?'cit168':'julich';state.group='all';$('sourceToggle').setAttribute('aria-pressed',String(state.source==='cit168'));$('sourceToggle').textContent=state.source==='cit168'?'✓ CIT168 核团':'CIT168 核团';renderList();toast(state.source==='cit168'?'已切换到 CIT168 的 32 个左右核团条目':'已切回 Julich 精细分区与小脑分叶');};
 $('hemiControls').onclick=e=>{if(e.target.dataset.hemi)setHemi(e.target.dataset.hemi);};
 $('viewControls').onclick=e=>{if(e.target.dataset.view)setView(e.target.dataset.view);};
 $('resetView').onclick=()=>{state.group='all';state.query='';state.isolate=false;state.knownOnly=false;$('knownOnly').setAttribute('aria-pressed','false');$('search3').value='';$('isolate3').checked=false;$('clipAxis').value='none';updateClip();$('opacity3').value=18;$('opacityOut').textContent='18%';setHemi('both');setView('oblique');};
 $('opacity3').oninput=()=>{$('opacityOut').textContent=$('opacity3').value+'%';updateMaterials();};
 $('clipAxis').onchange=updateClip;$('clipDepth').oninput=updateClip;
 $('regionColors').onchange=()=>{state.colors=$('regionColors').checked;updateMaterials();};
 $('isolate3').onchange=()=>{state.isolate=$('isolate3').checked;updateMaterials();};
 $('openDetail').onclick=()=>$('detail3').classList.toggle('open');
 $('sourcesBtn').onclick=()=>$('sourcesDialog').showModal();$('closeSources').onclick=()=>$('sourcesDialog').close();
 $('sourcesDialog').onclick=e=>{if(e.target===$('sourcesDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
}
function updateClip(){
 const axis=$('clipAxis').value,active=axis!=='none';$('clipDepth').disabled=!active;
 const val=Number($('clipDepth').value);$('clipOut').textContent=active?val+'mm':'—';
 clip.normal.set(axis==='x'?-1:0,axis==='y'?-1:0,axis==='z'?-1:0);clip.constant=val;
 for(const m of [...meshes.values(),...shells]){m.material.clippingPlanes=active?[clip]:[];m.material.needsUpdate=true;}
 dirty=true;
}
async function main(){
 try{
  setupScene();bindUI();
  const r=await fetch(new URL('data/manifest.json',import.meta.url));if(!r.ok)throw Error('索引读取失败');manifest=await r.json();
  entries=manifest.entries.filter(e=>e.atlas!=='surface');for(const e of entries)e.text=describe(e);
  renderList();
  const initial=entries.find(e=>e.id==='julich-L-172')||entries[0];
  const shellFile=manifest.files.find(f=>f.name.startsWith('shell')).name;
  await loadFile(shellFile);
  await select(initial.id);
  $('loadNotice').classList.add('hidden');window.atlasReady=true;
  let done=loadedFiles.size;let failures=0;
  const queue=manifest.files.map(f=>f.name).filter(f=>!loadedFiles.has(f));
  async function worker(){while(queue.length){const file=queue.shift();try{await loadFile(file);}catch(e){failures++;console.warn('Atlas file unavailable',file,e.message);}done++;$('modelStatus').textContent=`解剖数据 ${Math.round(done/manifest.files.length*100)}%`;}}
  await Promise.all([worker(),worker(),worker(),worker()]);
  $('modelStatus').textContent=failures?`${failures} 组未加载 · 刷新重试`:`${entries.length} 个图谱条目`;
  window.brainAtlas={version:manifest.version,select:id=>select(id,{reveal:true,zoom:true}),getSelection:()=>state.selected,getEntry:id=>entries.find(e=>e.id===id),getKnown:()=>[...known]};
 }catch(e){console.error(e);$('loadNotice').classList.remove('hidden');$('loadText').textContent='三维模型加载失败：'+e.message+'。请刷新或使用最新版 Edge / Chrome。';$('loadNotice').querySelector('.loading-line')?.remove();}
}
main();
