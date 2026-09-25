import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {ATLAS,describe} from './labels.js?v=epithalamus1';
import {emphasis,showShell} from './visual-state.js?v=epithalamus1';
import {NAV,pathFor,childrenOf,navigationFor,inGroup,topGroup,navigationText,hierarchyFor} from './navigation.js?v=epithalamus1';
import {buildEvidenceLayer} from './evidence-layer.js?v=epithalamus1';
import {createSceneSwitch} from './scene-switch.js';
import {createSearchIndex,searchAtlas,conceptCoverage} from './search.js?v=epithalamus1';
import {CATALOG_VERSION,SOURCES} from './structure-catalog.js?v=epithalamus1';
import {inGeometryGroup,GEOMETRY_LINK_VERSION} from './geometry-links.js?v=epithalamus1';
import {displayState,isSolid,applySurfaceMode,isOccludedByShell,RENDER_MODE_VERSION} from './render-mode.js?v=epithalamus1';
import {configureAppearance,applyAppearance,isAnatomical,APPEARANCE_VERSION} from './anatomical-appearance.js?v=epithalamus1';
const $=id=>document.getElementById(id);
const knownKey='brain-atlas-anatomy-known-v1';
let known=new Set();try{known=new Set(JSON.parse(localStorage.getItem(knownKey)||'[]'));}catch{}
const state={group:'all',hemi:'both',query:'',knownOnly:false,source:'julich',selected:null,focusKind:'none',colors:false,isolate:false,renderMode:'transparent'};
let entries=[],searchIndex=[],renderer,scene,camera,controls,raycaster,meshes=new Map(),shells=[],dirty=true,loadedFiles=new Map();
let evidenceLayer=null,evidenceSwitch=null;
let previousSurfaceMode='transparent';
const embedded=new URLSearchParams(location.search).get('embed')==='research';
if(embedded)document.body.classList.add('research-embed');
const clip=new THREE.Plane(new THREE.Vector3(1,0,0),0);
const cursor=new THREE.Vector2();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const debounce=(fn,ms)=>{let t;return (...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};
const sourceFor=atlas=>atlas==='aal'?'julich':atlas;
const sourceFits=e=>state.source==='all'||sourceFor(e.atlas)===state.source;
// Rendering associations are not anatomical ancestry or search filters.
const matches=e=>sourceFits(e)&&inGeometryGroup(e,state.group)&&(state.hemi==='both'||e.hemisphere===state.hemi||e.hemisphere==='M')&&(!state.knownOnly||known.has(e.id));
const visibleEntries=()=>entries.filter(matches);
const usableChildren=id=>childrenOf(id).filter(child=>!['unassigned','midbrain_other','amygdala_other'].includes(child)||entries.some(e=>inGroup(e,child)));
function toast(s){$('toast3').textContent=s;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast3').textContent='',3200)}
function reportSceneError(message){window.brainAtlasError=message;if(embedded)window.parent.postMessage({type:'brain-atlas-error',message},location.origin);}
function breadcrumbs(group){return pathFor(group).map(id=>`<button data-group="${id}" ${id===group?'aria-current="location"':''}>${escape(NAV[id].label)}</button>`).join('<span aria-hidden="true">›</span>');}
function entryBreadcrumbs(e){return hierarchyFor(e).map((n,i,a)=>i===a.length-1?`<span class="current-parcel">${escape(n.label)}</span>`:`<button data-group="${n.id}">${escape(n.label)}</button>`).join('<span aria-hidden="true">›</span>');}
function renderNavigation(){
 const top=topGroup(state.group);
 const button=(id,active,label=NAV[id].label)=>{
  const coverage=conceptCoverage(id,entries);
  return `<button data-group="${id}" aria-pressed="${active}" ${active?'class="active"':''} title="${escape(coverage.note)}">${escape(label)}${coverage.partial?' <small>部分模型</small>':coverage.hasGeometry?'':' <small>仅层级</small>'}</button>`;
 };
 const setHTML=(id,html)=>{if($(id).innerHTML!==html)$(id).innerHTML=html;};
 const activeId=document.activeElement?.dataset.group;
 setHTML('groupFilters',['all',...childrenOf('all')].map(id=>button(id,top===id)).join(''));
 const ownChildren=usableChildren(state.group);
 const branch=ownChildren.length?state.group:NAV[state.group]?.parent;
 const branchChildren=branch?usableChildren(branch):[];
 $('subgroupPanel').hidden=state.group==='all';
 if(state.group!=='all'){
  $('subgroupLabel').textContent=NAV[branch].label+' · '+NAV[branch].kind;
  setHTML('subgroupFilters',[button(branch,state.group===branch,'全部 '+NAV[branch].label),...branchChildren.map(id=>button(id,state.group===id))].join(''));
 }
 if(activeId&&!document.activeElement?.dataset.group)$('groupFilters').parentElement.querySelector(`[data-group="${activeId}"]`)?.focus({preventScroll:true});
 $('navHint').textContent='名称、英文或缩写均可搜索；“部分模型”只显示已收录分区，“仅层级”也能点开。';
 setHTML('indexPath',breadcrumbs(state.group));
 $('search3').placeholder='搜索全库：VTA、顶盖、tegmentum…';
 $('atlasSelect').value=state.source;
 $('knownOnly').disabled=!!state.query;
}
function entryButton(e){return `<button class="region-item ${known.has(e.id)?'learned':''} ${e.id===state.selected?'active':''}" data-id="${e.id}" aria-pressed="${e.id===state.selected}"><span class="hem">${e.hemisphere==='M'?'中线':e.hemisphere}</span><strong>${escape(e.text.title)}</strong><small>${escape(e.name)} · ${ATLAS[e.atlas].name}</small></button>`;}
function renderList(){
 $('learnedCount').textContent=`已学习 ${entries.filter(e=>known.has(e.id)).length}`;
 if(state.query){
  const hits=searchAtlas(state.query,searchIndex),concepts=hits.filter(h=>h.kind==='concept').length;
  $('listCount').textContent=`${concepts} 个结构 · ${hits.length-concepts} 个模型条目`;
  $('regionItems').innerHTML='<p class="search-note">全库结果，包含全部图谱，不受当前分组、侧别或已学习筛选限制。点击后自动显示。</p>'+(hits.length?hits.map(hit=>hit.kind==='parcel'?entryButton(entries.find(e=>e.id===hit.id)):`<button class="region-item concept-item" data-group="${hit.id}"><span class="hem">${escape(hit.coverageLabel)}</span><strong>${escape(hit.label)}</strong><small>${escape(NAV[hit.id].english)} · ${hit.partial?'部分模型 · 非完整边界':hit.parcels.length?'有关联模型':'仅层级 · 暂无模型'}</small><small class="search-path">${escape(hit.path)}</small></button>`).join(''):'<p class="empty3">全库中没有这个名称。可尝试中文名、英文全名或常用缩写；词库仍在补充。</p>');
 }else{
  const list=visibleEntries().sort((a,b)=>a.text.title.localeCompare(b.text.title,'zh-CN')||a.hemisphere.localeCompare(b.hemisphere));
  $('listCount').textContent=`当前 ${list.length} 个模型条目`;
  $('regionItems').innerHTML=list.length?list.map(entryButton).join(''):`<p class="empty3">${conceptCoverage(state.group,entries).hasGeometry?'当前显示筛选下没有模型条目。':'此结构暂无三维模型，但从属关系已收录。'}请查看右侧详情或点击上方的下级结构。</p>`;
 }
 renderNavigation();updateMaterials();
}
function hasGeometrySelection(){return state.focusKind==='entry'&&!!state.selected||state.focusKind==='group'&&state.group!=='all'&&visibleEntries().length>0||state.focusKind==='evidence'&&!!evidenceLayer?.ids.size;}
function updateMaterials(){
 const hasSelection=!!scene&&!!hasGeometrySelection();
 if(!hasSelection)state.isolate=false;
 const display=displayState(state,hasSelection),solid=isSolid(state),anatomical=isAnatomical(state);
 $('solidMode').disabled=!scene;$('solidMode').setAttribute('aria-pressed',String(state.renderMode==='solid'));
 $('solidMode').textContent=state.renderMode==='solid'?'实体模型：开':'实体模型：关';
 $('anatomicalMode').disabled=!scene;$('anatomicalMode').setAttribute('aria-pressed',String(anatomical));
 $('anatomicalMode').textContent=anatomical?'解剖外观：开':'解剖外观：关';
 $('solidMode').title=state.renderMode==='solid'?'点击恢复透明显示；保留原透明度':'切换为不透明实体；选中结构后自动隐藏其它部分';
 $('showWholeBrain').disabled=!entries.length;
 $('isolate3').disabled=!hasSelection;$('isolate3').checked=display.isolate;
 $('isolate3').title=display.automaticIsolation?'实体模式自动隔离；取消勾选可返回全脑':'仅显示当前选择';
 for(const e of entries){
  const mesh=meshes.get(e.id);if(!mesh)continue;
  const style=emphasis(e,display,known.has(e.id));
  if(evidenceLayer?.ids.has(e.id)&&!(state.focusKind==='entry'&&state.selected===e.id)){Object.assign(style,{inSelection:true,colour:evidenceLayer.colors.get(e.id)||'#39b9ff',opacity:.85,emissive:evidenceLayer.colors.get(e.id)||'#0877b5',emissiveIntensity:.35,depthWrite:true,depthTest:true,order:6});}
  mesh.visible=display.isolate&&state.focusKind==='entry'?style.inSelection:matches(e)&&(!display.isolate||style.inSelection);
  if(evidenceLayer)mesh.visible=(display.isolate&&state.focusKind==='entry'?e.id===state.selected:evidenceLayer.ids.has(e.id))&&(state.hemi==='both'||e.hemisphere===state.hemi||e.hemisphere==='M');
  const mat=mesh.material;mat.color.set(style.colour);mat.emissive.set(style.emissive);
  applySurfaceMode(mat,style,state.renderMode);applyAppearance(mat,state.renderMode,e);mesh.renderOrder=solid?0:style.order;
 }
 const opacity=Number($('opacity3').value)/100;
 shells.forEach(m=>{
  m.visible=showShell(display,m.userData.entry.hemisphere,solid?1:opacity);
  m.material.color.set('#bbc3ce');
  applySurfaceMode(m.material,{opacity,depthWrite:false,depthTest:true},state.renderMode);applyAppearance(m.material,state.renderMode,m.userData.entry);m.renderOrder=solid?0:2;
 });
 if(evidenceLayer)evidenceLayer.group.visible=!(display.isolate&&state.focusKind==='entry');
 const group=state.group!=='all';
 $('selectionSwatch').style.background=group?NAV[state.group].color:'#8894a4';
 $('selectionLegend').textContent=group?NAV[state.group].label:'解剖结构';
 const coverage=state.focusKind==='group'?conceptCoverage(state.group,entries):null;
 const modeNote=solid?(display.automaticIsolation?'实体独立显示 · 其它结构及外壳已隐藏 · 点击「显示全脑」返回':'实体显示 · 从左侧选择结构可独立查看'):(display.isolate?'独立查看 · 其他结构与外壳已隐藏':'空间背景 · 可勾选「只看当前选择」');
 $('visibilityNote').textContent=coverage&&!coverage.hasGeometry?'仅层级知识：不绘制虚构模型、坐标或边界。':(coverage?.partial?'部分模型 · 非完整结构边界。':'')+modeNote;
 if(evidenceLayer){$('selectionLegend').textContent='文献涉及区域';$('selectionSwatch').style.background='#39b9ff';$('visibilityNote').textContent=(solid?modeNote+'。':'')+'连线为关系示意，非纤维走向或传导时序；蓝色区域：解剖对应；紫色区域：功能网络参考（非完整网络）；紫色虚线：假说 / 模型 / 综述；蓝色光点：细胞示意；绿色点：图谱参考位置';}
 if(anatomical){$('selectionSwatch').style.background='#c7b5ab';$('selectionLegend').textContent='解剖外观 · 模拟材质';$('visibilityNote').textContent=(coverage&&!coverage.hasGeometry?'此结构暂无模型。':coverage?.partial?'部分模型，非完整结构边界。':'')+'原图谱表面 · 色泽与细纹为模拟，不增加解剖精度。'+(display.automaticIsolation?'仅显示当前选择；点击“显示全脑”返回。':'选择结构可独立查看。')+(evidenceLayer?'文献对应保留；切回默认显示可查看证据颜色。':'');}
 const opacityLabel=$('opacity3').closest('label'),opacityLocked=display.isolate||solid;
 $('opacity3').disabled=opacityLocked;opacityLabel.classList.toggle('control-muted',opacityLocked);
 $('opacityOut').textContent=display.isolate?'隐藏':solid?'不透明':$('opacity3').value+'%';
 const isolateButton=$('isolateSelected');
 if(isolateButton){isolateButton.disabled=!hasSelection;isolateButton.textContent=display.automaticIsolation?'显示全脑':display.isolate?'恢复其他结构':'隐藏其他结构';isolateButton.setAttribute('aria-pressed',String(display.isolate));}
 dirty=true;
}
function setRenderMode(mode){
 if(!['solid','transparent','anatomical'].includes(mode))throw new TypeError('Unknown render mode');
 if(!scene){toast('三维暂不可用；结构层级与笔记仍可使用。');return false;}
 if(mode==='anatomical'&&state.renderMode!=='anatomical')previousSurfaceMode=state.renderMode;
 state.renderMode=mode;updateMaterials();
 if(isSolid(state)&&hasGeometrySelection())focusUnit();
 toast(isAnatomical(state)?'已切换解剖外观；色泽与细纹为模拟，模型边界来自原图谱。':isSolid(state)?'已切换实体模型；选中结构会自动隐藏其它部分。':'已恢复透明显示。');
 return true;
}
function restoreWholeBrain(){
 clearEvidence();state.selected=null;state.focusKind='none';state.group='all';state.query='';state.isolate=false;state.knownOnly=false;
 $('search3').value='';$('knownOnly').setAttribute('aria-pressed','false');$('clipAxis').value='none';
 updateClip();setHemi('both');setView('oblique');
}
function renderSnapshot(){
 const fields=m=>({id:m.userData.entry.id,opacity:m.material.opacity,transparent:m.material.transparent,depthWrite:m.material.depthWrite,depthTest:m.material.depthTest,appearanceMix:m.material.userData.tissueMix?.value||0,colour:m.material.color.getHexString()});
 return {mode:state.renderMode,isolated:displayState(state,!!scene&&!!hasGeometrySelection()).isolate,selected:state.selected,group:state.group,
  visibleModels:[...meshes.values()].filter(m=>m.visible).map(fields),visibleShells:shells.filter(m=>m.visible).map(fields)};
}
function currentUnit(){return state.focusKind==='entry'?entries.filter(e=>e.id===state.selected):evidenceLayer?entries.filter(e=>evidenceLayer.ids.has(e.id)):visibleEntries();}
function focusUnit(){
 if(!camera)return;
 const unit=currentUnit();if(!unit.length&&!evidenceLayer?.markers.length)return;
 const bounds=new THREE.Box3();
 for(const e of unit){bounds.expandByPoint(new THREE.Vector3(...e.bounds[0]));bounds.expandByPoint(new THREE.Vector3(...e.bounds[1]));}
 if(evidenceLayer?.markers.length&&state.focusKind!=='entry')bounds.union(evidenceLayer.pointBounds);
 const centre=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()).length();
 const direction=camera.position.clone().sub(controls.target).normalize();
 controls.target.copy(centre);camera.position.copy(centre).addScaledVector(direction,Math.max(45,size*1.65));controls.update();dirty=true;
}
function toggleIsolation(value=!displayState(state,!!scene&&!!hasGeometrySelection()).isolate){
 if(!value&&displayState(state,!!scene&&!!hasGeometrySelection()).automaticIsolation){restoreWholeBrain();return;}
 if(value&&(!scene||!hasGeometrySelection())){toast('此条目没有可独立显示的模型');return;}
 state.isolate=value;$('isolate3').checked=value;updateMaterials();if(value)focusUnit();
}
function groupDetail(){
 const group=state.group!=='all',info=NAV[state.group],list=visibleEntries(),coverage=conceptCoverage(state.group,entries);
 const parent=NAV[info.parent],children=usableChildren(state.group),related=info.related.filter(id=>NAV[id]);
 const links=ids=>ids.map(id=>`<button class="structure-link" data-group="${id}">${escape(NAV[id].label)} <small>${conceptCoverage(id,entries).label}</small></button>`).join('');
 const path=pathFor(state.group).slice(1).map((id,i)=>`<li class="hierarchy-step"><span>${i+1}</span><div><small>${escape(NAV[id].kind)}</small><strong>${escape(NAV[id].label)}</strong></div></li>`).join('');
 const references=[...info.references.map(id=>SOURCES[id]).filter(Boolean),...coverage.references].map(s=>`<a class="source-link" href="${escape(s.url)}" target="_blank" rel="noopener">${escape(s.title)} ↗</a>`).join('');
 const modelLinks=coverage.hasGeometry?`<details id="linkedModelDetails" class="detail-section"><summary>已关联模型（${coverage.parcels.length} 个条目 · 全部图谱）</summary><p class="micro-note">左右与图谱分别计数。点击任一条目会自动切换来源；不将多套图谱的重叠表面当成一个边界。</p>${coverage.parcels.map(entryButton).join('')}</details>`:'';
 $('detail3').innerHTML=`<div class="detail-label"><span class="eyebrow">STRUCTURE OVERVIEW</span><span class="atlas-badge">${coverage.hasGeometry?coverage.label:'仅层级 · 暂无模型'}</span></div><nav class="detail-path" aria-label="结构归属">${breadcrumbs(state.group)}</nav><h2>${escape(info.label)}</h2><p class="latin3">${escape(info.english)}</p>${parent?`<div class="direct-parent"><span>直接上级 · ${escape(parent.kind)}</span><strong>${escape(parent.label)}</strong></div>`:''}<section class="detail-section"><h3>这是什么</h3><p>${escape(info.note)}</p>${info.aliases.length?`<p class="micro-note">检索词：${info.aliases.map(escape).join(' / ')}</p>`:''}</section>${path?`<section class="detail-section"><h3>完整从属关系</h3><ol class="hierarchy-list">${path}</ol></section>`:''}<section class="detail-section"><h3>下属结构</h3>${children.length?links(children):'<p>层级库暂无进一步细分。可在左侧查看已收录的图谱条目。</p>'}</section>${related.length?`<section class="detail-section"><h3>相关位置与术语（不是同义词）</h3>${links(related)}</section>`:''}<section class="detail-section"><h3>三维显示范围</h3><p>${coverage.hasGeometry?`全库有 ${coverage.parcels.length} 个关联模型条目，当前显示 ${list.length} 个。大结构的子分区集合不等于完整体积。`:'目前只提供名称与从属关系，不以附近结构或虚构坐标代替。'}</p><p id="geometryCoverageNote" class="micro-note">${escape(coverage.note)}</p></section><div class="detail-actions"><button id="focusGroup" ${scene&&list.length?'':'disabled'}>定位已收录分区</button><button id="isolateSelected">隐藏其他结构</button></div>${modelLinks}<section class="detail-section"><h3>来源与定义</h3>${references}<a class="source-link" href="anatomy/GEOMETRY-AUDIT.md" target="_blank" rel="noopener">模型关联核对说明 ↗</a><p class="micro-note">这是学习导航，不表示传导顺序或功能因果；跨界定位分组和相关位置已单独注明。层级库不是完整的人脑本体。</p></section>`;
 $('focusGroup').onclick=focusUnit;$('isolateSelected').onclick=()=>toggleIsolation();
 $('stageTitle').textContent=group?info.label+(coverage.hasGeometry?' · '+coverage.label:' · 仅层级知识'):'群体参考脑 · 真实解剖表面';
 updateMaterials();
}
async function selectGroup(group){
 if(!NAV[group])return;
 clearEvidence();
 state.group=group;state.selected=null;state.focusKind=group==='all'?'none':'group';
 state.query='';state.knownOnly=false;state.hemi='both';$('search3').value='';$('knownOnly').setAttribute('aria-pressed','false');
 $('hemiControls').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.hemi==='both'));
 const coverage=conceptCoverage(group,entries);
 if(coverage.preferredSource&&(coverage.preferredSource==='all'||coverage.sources.includes(coverage.preferredSource)))state.source=coverage.preferredSource;
 else if(coverage.hasGeometry&&!coverage.parcels.some(sourceFits))state.source=coverage.sources.includes('julich')||coverage.sources.includes('aal')?'julich':sourceFor(coverage.sources[0]);
 renderList();groupDetail();if(innerWidth<=1100&&!embedded)$('detail3').classList.add('open');
 if(scene&&group!=='all'){
  try{await Promise.all([...new Set(visibleEntries().map(e=>e.file))].map(loadFile));if(state.group===group&&state.focusKind==='group'&&(state.isolate||isSolid(state)||coverage.includeGroups.length))focusUnit();}
  catch{toast('部分模型未加载；从属关系仍可查看。');}
 }
}
function renderDetail(e){
 const a=ATLAS[e.atlas],location=NAV[e.nav],hierarchy=hierarchyFor(e),parent=hierarchy.at(-2);
 const hierarchyRows=hierarchy.slice(1).map((n,i)=>`<li class="hierarchy-step"><span>${i+1}</span><div><small>${escape(n.kind||'图谱分区')}</small><strong>${escape(n.label)}</strong></div></li>`).join('');
 const precise=e.name.includes('Subc')?'此标签是“下托复合体”，不能自动等同于所有论文中的 subiculum；需核对论文采用的亚区定义。':e.name.includes('GapMap')?'图谱未定义范围。':a.description;
 $('detail3').innerHTML=`<div class="detail-label"><span class="eyebrow">REGION PROFILE</span><span class="atlas-badge">${a.name}</span></div><nav class="detail-path" aria-label="脑区完整归属">${entryBreadcrumbs(e)}</nav><h2>${escape(e.text.title)}</h2><p class="latin3">${escape(e.name)}</p><div class="direct-parent"><span>直接上级 · ${escape(parent.kind)}</span><strong>${escape(parent.label)}</strong></div><div class="detail-section breadcrumb3">${e.text.side} · ${location.label}<br>${a.type} · 标签 ${e.label}</div><div class="detail-actions"><button id="focusSelected" ${scene?'':'disabled'}>定位放大</button><button class="learn-btn" id="markLearned" aria-pressed="${known.has(e.id)}">${known.has(e.id)?'✓ 已学习':'标记已学习'}</button></div><button id="isolateSelected" class="isolate-action">隐藏其他结构</button><hr class="detail-hr"><section class="detail-section"><h3>解剖从属</h3><ol class="hierarchy-list">${hierarchyRows}</ol><p class="micro-note">这是解剖导航路径，不表示信息传导顺序或功能因果关系。</p></section><section class="detail-section"><h3>这一结构是什么</h3><p>${location.note}</p></section><section class="detail-section"><h3>显示中心 · MNI 毫米</h3><div class="coord-grid">${['X','Y','Z'].map((a,i)=>`<div><span>${a}</span><strong>${e.center[i].toFixed(1)}</strong></div>`).join('')}</div><p class="micro-note" style="margin-top:10px">网格中心，非激活峰。X：左负右正；Y：后负前正；Z：下负上正。</p></section><section class="detail-section"><h3>如何理解这个边界</h3><p>${precise}</p><a class="source-link" href="${a.url}" target="_blank" rel="noopener">查看图谱原始研究 ↗</a></section>`;
 $('focusSelected').onclick=()=>focus(e);$('isolateSelected').onclick=()=>toggleIsolation();
 $('markLearned').onclick=()=>{
  if(known.has(e.id))known.delete(e.id);else known.add(e.id);
  let saved=true;try{localStorage.setItem(knownKey,JSON.stringify([...known]));}catch{saved=false;}
  renderDetail(e);renderList();toast(saved?(known.has(e.id)?'已保存学习标记':'已取消学习标记'):'浏览器限制了保存；本次标记仅在当前页面保留');
 };
 $('stageTitle').textContent=e.text.full;updateMaterials();
}
async function select(id,{zoom=false,reveal=false}={}){
 const e=entries.find(e=>e.id===id);if(!e)return;
 state.selected=id;state.focusKind='entry';
 if(reveal){state.source=sourceFor(e.atlas);state.group=e.nav;state.query='';$('search3').value='';state.knownOnly=false;$('knownOnly').setAttribute('aria-pressed','false');if(state.hemi!=='both'&&state.hemi!==e.hemisphere)setHemi('both');}
 renderList();renderDetail(e);
 if(innerWidth<=1100&&!embedded)$('detail3').classList.add('open');
 if(!scene)return;
 try{await loadFile(e.file);}catch{toast('这个模型尚未加载成功；名称与从属关系仍可查看。');return;}
 if(state.selected!==id||state.focusKind!=='entry')return;
 if(zoom||isSolid(state))focus(e);
}
function focus(e){
 if(!camera)return;
 const centre=new THREE.Vector3(...e.center);const size=new THREE.Vector3(...e.bounds[1]).sub(new THREE.Vector3(...e.bounds[0])).length();
 const direction=camera.position.clone().sub(controls.target).normalize();
 controls.target.copy(centre);camera.position.copy(centre).addScaledVector(direction,Math.max(45,size*2.8));controls.update();dirty=true;
}
function setHemi(hemi){state.hemi=hemi;$('hemiControls').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.hemi===hemi));if(state.focusKind==='entry'&&!entries.some(e=>e.id===state.selected&&matches(e))){state.selected=null;state.focusKind=state.group==='all'?'none':'group';}renderList();if(state.focusKind!=='entry')groupDetail();}
function setView(view){
 if(!camera)return;
 const c=new THREE.Vector3(0,-20,10),d=340;
 const vectors={oblique:[-1.05,-1.25,.72],left:[-1,0,0],front:[0,1,0],top:[0,-.001,1]};
 camera.up.set(0,0,1);camera.position.copy(new THREE.Vector3(...vectors[view]).normalize().multiplyScalar(d).add(c));controls.target.copy(c);controls.update();dirty=true;
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
 raycaster=new THREE.Raycaster();raycaster.params.Line.threshold=1.2;
 new ResizeObserver(()=>{const r=$('canvasWrap').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(r.height,1);camera.updateProjectionMatrix();dirty=true;}).observe($('canvasWrap'));
 setView('oblique');
 const labelPositions={labelL:[-95,-15,0],labelR:[95,-15,0],labelA:[0,87,0],labelP:[0,-123,0]};
 function tick(){requestAnimationFrame(tick);controls.update();if(!dirty||document.hidden)return;renderer.render(scene,camera);const r=canvas.getBoundingClientRect();for(const [id,pos]of Object.entries(labelPositions)){const p=new THREE.Vector3(...pos).project(camera);const el=$(id);el.style.left=((p.x+1)*r.width/2)+'px';el.style.top=((1-p.y)*r.height/2)+'px';el.hidden=Math.abs(p.x)>.98||Math.abs(p.y)>.86||p.z>1;}dirty=false;}
 tick();
 let down=null;
 canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY,time:performance.now()});
 canvas.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5&&performance.now()-down.time<700){const hit=pick(e);if(hit?.userData.marker){const m=hit.userData.marker;toast(m.name+'：'+m.description);if(window.parent!==window)window.parent.postMessage({type:'brain-atlas-marker',paperId:m.paperId},location.origin);}else if(hit)select(hit.userData.entry.id);}down=null;});
 canvas.addEventListener('pointermove',debounce(e=>{if(e.buttons)return;const hit=pick(e);const tip=$('tooltip3');if(hit){tip.textContent=hit.userData.marker?hit.userData.marker.name+' · '+hit.userData.marker.description:hit.userData.entry.text.full;const r=canvas.getBoundingClientRect();tip.style.left=Math.min(e.clientX-r.left+15,r.width-240)+'px';tip.style.top=(e.clientY-r.top+15)+'px';canvas.style.cursor='pointer';}else{tip.textContent='';canvas.style.cursor='grab';}},55));
 canvas.addEventListener('pointerleave',()=>$('tooltip3').textContent='');
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')setView('oblique');else if(e.key==='+'||e.key==='-'){camera.position.sub(controls.target).multiplyScalar(e.key==='+'?.85:1.15).add(controls.target);}else{const offset=camera.position.clone().sub(controls.target),axis=e.key.includes('Left')||e.key.includes('Right')?new THREE.Vector3(0,0,1):new THREE.Vector3(1,0,0);offset.applyAxisAngle(axis,['ArrowLeft','ArrowUp'].includes(e.key)?.1:-.1);camera.position.copy(controls.target).add(offset);}controls.update();dirty=true;}});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('loadNotice').classList.remove('hidden');$('loadText').textContent='三维显示暂时中断，正在等待浏览器恢复；已有记录保留。';reportSceneError($('loadText').textContent);});
 canvas.addEventListener('webglcontextrestored',()=>{window.brainAtlasError='';$('loadNotice').classList.add('hidden');updateMaterials();updateClip();dirty=true;if(embedded&&window.brainAtlas)window.parent.postMessage({type:'brain-atlas-ready'},location.origin);});
}
function pick(ev){
 const r=$('brainCanvas').getBoundingClientRect();cursor.set((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(cursor,camera);
 const pointHits=raycaster.intersectObjects((evidenceLayer?.group.visible?evidenceLayer.markers:[])||[],false);const pointHit=pointHits.find(h=>$('clipAxis').value==='none'||clip.distanceToPoint(h.point)>=0);if(pointHit)return pointHit.object;
 const hits=raycaster.intersectObjects([...meshes.values()].filter(m=>m.visible),false);
 const hit=hits.find(h=>$('clipAxis').value==='none'||clip.distanceToPoint(h.point)>=0);
 if(!hit)return;
 if(isSolid(state)){
  const shellHit=raycaster.intersectObjects(shells.filter(m=>m.visible),false).find(h=>$('clipAxis').value==='none'||clip.distanceToPoint(h.point)>=0);
  if(isOccludedByShell(hit.distance,shellHit?.distance,true))return;
 }
 return hit.object;
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
   configureAppearance(material);
   if($('clipAxis').value!=='none')material.clippingPlanes=[clip];
   const mesh=new THREE.Mesh(geometry,material);mesh.userData.entry=entry;scene.add(mesh);
   if(entry.atlas==='surface'){mesh.renderOrder=2;shells.push(mesh);}else meshes.set(entry.id,mesh);
  }
  updateMaterials();return true;
 })();loadedFiles.set(file,p);try{return await p;}catch(e){loadedFiles.delete(file);throw e;}
}
function bindUI(){
 $('solidMode').onclick=()=>setRenderMode(state.renderMode==='solid'?'transparent':'solid');
 $('anatomicalMode').onclick=()=>setRenderMode(isAnatomical(state)?previousSurfaceMode:'anatomical');
 $('showWholeBrain').onclick=restoreWholeBrain;
 const navigate=e=>{const b=e.target.closest('[data-group]');if(b&&!b.disabled)selectGroup(b.dataset.group);};
 $('groupFilters').onclick=navigate;$('subgroupFilters').onclick=navigate;$('indexPath').onclick=navigate;
 const openResult=e=>{const b=e.target.closest('[data-id]');if(b){clearEvidence();select(b.dataset.id,{reveal:true,zoom:true});}else navigate(e);};
 $('regionItems').onclick=openResult;$('detail3').addEventListener('click',openResult);
 $('search3').addEventListener('input',debounce(()=>{state.query=$('search3').value.trim();renderList();},120));
 $('knownOnly').onclick=()=>{state.knownOnly=!state.knownOnly;$('knownOnly').setAttribute('aria-pressed','false');$('knownOnly').setAttribute('aria-pressed',String(state.knownOnly));renderList();if(state.focusKind!=='entry')groupDetail();};
 $('atlasSelect').onchange=()=>{state.source=$('atlasSelect').value;state.group='all';state.selected=null;state.focusKind='none';renderList();groupDetail();toast('已切换三维显示图谱；搜索仍覆盖全库。');};
 $('hemiControls').onclick=e=>{if(e.target.dataset.hemi)setHemi(e.target.dataset.hemi);};
 $('viewControls').onclick=e=>{if(e.target.dataset.view)setView(e.target.dataset.view);};
 $('resetView').onclick=()=>{if(!embedded)clearEvidence();state.selected=null;state.focusKind=evidenceLayer?'evidence':'none';state.group='all';state.query='';state.isolate=false;state.knownOnly=false;$('knownOnly').setAttribute('aria-pressed','false');$('search3').value='';$('isolate3').checked=false;$('clipAxis').value='none';updateClip();$('opacity3').value=18;$('opacityOut').textContent='18%';setHemi('both');setView('oblique');};
 $('opacity3').oninput=()=>{$('opacityOut').textContent=$('opacity3').value+'%';updateMaterials();};
 $('clipAxis').onchange=updateClip;$('clipDepth').oninput=updateClip;
 $('regionColors').onchange=()=>{state.colors=$('regionColors').checked;updateMaterials();};
 $('isolate3').onchange=()=>toggleIsolation($('isolate3').checked);
 $('openDetail').onclick=()=>$('detail3').classList.toggle('open');
 $('sourcesBtn').onclick=()=>$('sourcesDialog').showModal();$('closeSources').onclick=()=>$('sourcesDialog').close();
 $('sourcesDialog').onclick=e=>{if(e.target===$('sourcesDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
}
function updateClip(){
 const axis=$('clipAxis').value,active=axis!=='none';$('clipDepth').disabled=!active;
 const val=Number($('clipDepth').value);$('clipOut').textContent=active?val+'mm':'—';
 clip.normal.set(axis==='x'?-1:0,axis==='y'?-1:0,axis==='z'?-1:0);clip.constant=val;
 for(const m of [...meshes.values(),...shells]){m.material.clippingPlanes=active?[clip]:[];m.material.needsUpdate=true;}
 evidenceLayer?.group.traverse(m=>{if(m.material){m.material.clippingPlanes=active?[clip]:[];m.material.needsUpdate=true;}});dirty=true;
}
function clearEvidence(){evidenceSwitch?.cancel();if(evidenceLayer){scene.remove(evidenceLayer.group);evidenceLayer.dispose();evidenceLayer=null;}}
async function showEvidence(spec,options={}){
 if(!scene)throw Error('三维图形暂不可用；层级检索和已保存记录仍可使用。');
 if(!evidenceSwitch)evidenceSwitch=createSceneSwitch({
  async prepare(spec){
   const next=buildEvidenceLayer(spec,entries);
   const files=[...new Set(entries.filter(e=>next.ids.has(e.id)).map(e=>e.file))];
   try{await Promise.all(files.map(loadFile));return next;}catch(error){next.dispose();throw error;}
  },
  discard:next=>next.dispose(),
  install(next,spec,{refocus=true}){
   const previous=evidenceLayer,keepSelection=!refocus&&state.focusKind==='entry'&&next.ids.has(state.selected);
   scene.add(next.group);evidenceLayer=next;if(previous){scene.remove(previous.group);previous.dispose();}
   state.group='all';state.query='';state.knownOnly=false;
   if(!keepSelection){state.selected=null;state.focusKind='evidence';}
   if(refocus||!previous){state.hemi='both';state.isolate=false;$('clipAxis').value='none';$('hemiControls').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.hemi==='both'));}
   $('search3').value='';$('knownOnly').setAttribute('aria-pressed','false');$('isolate3').checked=state.isolate;
   renderList();updateClip();$('stageTitle').textContent=spec.title||'文献机制 · 待核对的解剖对应';
   if(refocus||!previous){if(next.ids.size||next.markers.length)focusUnit();else setView('oblique');}
   return {mapped:next.ids.size,connections:(spec.links||[]).length,markers:next.markers.length};
  }
 });
 return evidenceSwitch.show(spec,options);
}
function markEvidenceLearned(ids){for(const id of ids)if(entries.some(e=>e.id===id))known.add(id);localStorage.setItem(knownKey,JSON.stringify([...known]));renderList();}
async function main(){
 try{
  bindUI();
  const r=await fetch(new URL('data/manifest.json',import.meta.url));if(!r.ok)throw Error('索引读取失败');manifest=await r.json();
  entries=manifest.entries.filter(e=>e.atlas!=='surface');for(const e of entries){e.nav=navigationFor(e);e.text=describe(e);e.text.search+=' '+navigationText(e).toLowerCase();}
  searchIndex=createSearchIndex(entries);renderList();groupDetail();
  // Expose the catalogue before loading geometry. A failed model cannot remove knowledge.
  window.brainAtlas={appearanceVersion:APPEARANCE_VERSION,renderModeVersion:RENDER_MODE_VERSION,setRenderMode,restoreWholeBrain,getRenderState:renderSnapshot,version:manifest.version,catalogVersion:CATALOG_VERSION,geometryLinkVersion:GEOMETRY_LINK_VERSION,select:id=>select(id,{reveal:true,zoom:true}),getSelection:()=>state.selected,getEntry:id=>entries.find(e=>e.id===id),getKnown:()=>[...known],selectGroup,getGroup:()=>state.group,showEvidence,markLearned:markEvidenceLearned,search:q=>searchAtlas(q,searchIndex).map(({fields,...hit})=>hit),getStructure:id=>NAV[id]?{id,...NAV[id],path:pathFor(id)}:null,
   getModelCoverage:id=>{const {parcels,...coverage}=conceptCoverage(id,entries);return {...coverage,entryIds:parcels.map(e=>e.id)};},
   getVisibleModelIds:()=>[...meshes.values()].filter(m=>m.visible).map(m=>m.userData.entry.id)};
  window.catalogReady=true;
  try{setupScene();}catch(e){scene=null;camera=null;console.warn('3D unavailable',e);$('loadText').textContent='三维图形暂不可用；左侧仍可搜索并查看从属关系。';$('modelStatus').textContent='层级库可用 · 三维暂不可用';$('loadNotice').querySelector('.loading-line')?.remove();groupDetail();reportSceneError($('loadText').textContent);return;}
  const shellFile=manifest.files.find(f=>f.name.startsWith('shell'))?.name;
  if(shellFile)try{await loadFile(shellFile);}catch{toast('参考外壳未加载；结构检索仍可使用。');}
  // Start at the whole index, rather than silently restricting searches to the subiculum.
  renderList();if(state.focusKind==='entry')renderDetail(entries.find(e=>e.id===state.selected));else groupDetail();$('loadNotice').classList.add('hidden');window.atlasReady=true;
  if(embedded)window.parent.postMessage({type:'brain-atlas-ready'},location.origin);
  let done=loadedFiles.size,failures=0;
  const queue=manifest.files.map(f=>f.name).filter(f=>!loadedFiles.has(f));
  async function worker(){while(queue.length){const file=queue.shift();try{await loadFile(file);}catch(e){failures++;console.warn('Atlas file unavailable',file,e.message);}done++;$('modelStatus').textContent=`解剖数据 ${Math.round(done/manifest.files.length*100)}%`;}}
  await Promise.all([worker(),worker(),worker(),worker()]);
  $('modelStatus').textContent=failures?`${failures} 组模型未加载 · 层级仍可查`:`${entries.length} 个模型条目 · ${Object.keys(NAV).length-1} 个层级节点`;
 }catch(e){console.error(e);$('loadNotice').classList.remove('hidden');$('loadText').textContent='图谱索引加载失败：'+e.message+'。请刷新重试；已有学习和文献记录不会被删除。';reportSceneError($('loadText').textContent);$('loadNotice').querySelector('.loading-line')?.remove();}
}
main();
