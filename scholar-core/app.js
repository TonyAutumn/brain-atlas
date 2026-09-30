import {createIndex,MAX_SNAPSHOT_BYTES,readBoundedText,safeURL,KIND_LABELS,STATUS_LABELS,CHUNK_LABELS,relationLabel,claimAvailability,confidenceLabel} from './network-data.js';

const $=id=>document.getElementById(id),SVG='http://www.w3.org/2000/svg';
let index=null,current='',graphPage=0,cataloguePage=0,searchResults=[],trail=[],searchTimer=null;
let viewport={x:0,y:0,scale:1},drag=null,resizeTimer=null;
const catalogueSize=24,scopeLabels={all:'记录',concept:'概念',chunk:'组块',claim:'知识联系',source:'来源'};
const coverageLabels={abstract:'摘要来源',fulltext:'全文来源',excerpt:'正文片段',user_note:'个人笔记',vocabulary:'术语库'};
function element(tag,text='',className=''){const node=document.createElement(tag);if(text!==undefined)node.textContent=String(text);if(className)node.className=className;return node}
function svg(tag,attrs={},text){const node=document.createElementNS(SVG,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));if(text!==undefined)node.textContent=String(text);return node}
function append(parent,...children){parent.append(...children.filter(Boolean));return parent}
function button(text,run,className=''){const node=element('button',text,className);node.type='button';node.onclick=run;return node}
function number(value){return Number(value||0).toLocaleString('zh-CN')}
function time(value){const date=new Date(typeof value==='number'?(value<1e12?value*1000:value):value);return Number.isNaN(date.getTime())?'时间未确认':date.toLocaleString('zh-CN',{hour12:false})}
function link(value,text){const href=safeURL(value);if(!href)return null;const node=element('a',text||value);node.href=href;node.target='_blank';node.rel='noopener noreferrer';return node}
function short(value,length=13){const chars=[...String(value||'')];return chars.length>length?chars.slice(0,length).join('')+'…':chars.join('')}
function status(text,kind=''){$('load-state').textContent=text;$('load-state').className='load-state'+(kind?' '+kind:'')}
function openNode(id,push=true){
 if(!index||id&&!index.get(id))return;
 if(push&&current!==id)trail.push(current);current=id;graphPage=0;
 $('back').disabled=!trail.length;
 history.replaceState(null,'',location.pathname+location.search+(id?'#'+encodeURIComponent(id):''));
 renderGraph();renderInspector(index.get(id));renderCatalogue();
}
function renderCounts(){
 const names=[['concepts','概念（全库）','concept'],['chunks','组块（全库）','chunk'],['claims','知识联系','claim'],['sources','来源','source'],['evidence','证据定位','']];
 $('counts').replaceChildren(...names.map(([key,label,kind])=>{
  const box=kind?button('',()=>{$('scope').value=kind;$('query').value='';searchCatalogue()},'count'):element('div','','count');
  return append(box,element('strong',number(index.snapshot.manifest.counts[key])),element('span',label));
 }));
 const coverage=index.snapshot.manifest.coverage||{},all=coverage.all_concepts===true&&coverage.all_chunks===true;
 const ungrouped=index.byKind.concept.filter(node=>!index.conceptChunks.has(node.id)).length;
 $('snapshot-coverage').textContent=(all?'完整概念与组块快照':'覆盖范围以本快照清单为准')+' · '+number(ungrouped)+' 个概念尚未入组块，仍可从全库目录搜索与查看。';
}
function describe(node){
 if(node.kind==='concept')return `${(node.record.aliases||[]).slice(0,3).join(' · ')}${node.record.aliases?.length?' · ':''}${(index.conceptClaims.get(node.id)||[]).length} 条联系`;
 if(node.kind==='chunk')return `${CHUNK_LABELS[node.record.chunk_kind]||node.record.chunk_kind||'组块'} · ${STATUS_LABELS[node.record.state]||node.record.state||''} · ${node.record.members.length} 个概念`;
 if(node.kind==='claim')return (STATUS_LABELS[node.record.status]||node.record.status||'知识联系')+(claimAvailability(node.record)?' · '+claimAvailability(node.record):'');
 if(node.kind==='source')return coverageLabels[node.record.coverage]||node.record.coverage||'来源';
 return `${node.chunks.length} 个组块 · ${number(node.memberCount)} 个不同概念`;
}
function searchCatalogue(){if(!index)return;cataloguePage=0;searchResults=index.search($('query').value,$('scope').value);renderCatalogue()}
function renderCatalogue(){
 if(!index)return;const pages=Math.max(1,Math.ceil(searchResults.length/catalogueSize));cataloguePage=Math.min(cataloguePage,pages-1);
 $('catalogue-count').textContent=number(searchResults.length)+' 项';
 $('catalogue-help').textContent=($('query').value?'匹配':'全库')+' '+number(searchResults.length)+' 条'+scopeLabels[$('scope').value]+'；搜索覆盖全部记录，按页展示。';
 const rows=searchResults.slice(cataloguePage*catalogueSize,(cataloguePage+1)*catalogueSize);
 $('catalogue-list').replaceChildren(...rows.map(node=>{
  const item=button('',()=>openNode(node.id),'catalogue-item'+(current===node.id?' selected':''));
  return append(item,element('strong',node.title),element('small',KIND_LABELS[node.kind]+' · '+describe(node)));
 }));
 if(!rows.length)$('catalogue-list').append(element('p','当前类型没有匹配项；可切换“全部类型”或修改搜索词。','empty'));
 $('catalogue-page').value=cataloguePage+1;$('catalogue-page').max=pages;$('catalogue-pages').textContent=pages;
 $('catalogue-prev').disabled=cataloguePage===0;$('catalogue-next').disabled=cataloguePage>=pages-1;
}
function applyViewport(){$('graph-scene').setAttribute('transform',`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`);$('zoom-value').textContent=Math.round(viewport.scale*100)+'%'}
function zoom(factor,x,y){
 const bounds=$('graph-stage').getBoundingClientRect(),px=x??bounds.width/2,py=y??bounds.height/2;
 const next=Math.max(.3,Math.min(5,viewport.scale*factor)),ratio=next/viewport.scale;
 viewport={x:px-(px-viewport.x)*ratio,y:py-(py-viewport.y)*ratio,scale:next};applyViewport();
}
function positions(data,width,height){
 const map=new Map(),center={x:width/2,y:height/2};
 if(data.overview){
  const columns=Math.min(data.nodes.length||1,Math.max(2,Math.floor(width/112))),rows=Math.ceil(data.nodes.length/columns);
  const gapY=Math.min(90,(height-60)/Math.max(1,rows)),startY=(height-gapY*(rows-1))/2;
  data.nodes.forEach((node,i)=>map.set(node.id,{x:(i%columns+.5)*width/columns,y:startY+Math.floor(i/columns)*gapY}));
 }else{
  map.set(data.center.id,center);const children=data.nodes.filter(n=>n.id!==data.center.id),outer=Math.min(width,height)/2-38;
  children.forEach((node,i)=>{
   const ring=Math.floor(i/22),count=Math.min(22,children.length-ring*22),angle=(i%22)/Math.max(1,count)*Math.PI*2-Math.PI/2+ring*.23;
   const radius=outer*Math.max(.38,.9-ring*.22);map.set(node.id,{x:center.x+Math.cos(angle)*radius,y:center.y+Math.sin(angle)*radius});
  });
 }
 return map;
}
function renderGraph(){
 if(!index)return;const stage=$('graph-stage'),width=Math.max(280,stage.clientWidth),height=stage.clientHeight;
 const limit=width<420?30:80,data=index.graph(current,graphPage,limit);graphPage=data.page;
 $('graph-title').textContent=data.center?.title||'组块全景';
 $('graph-description').textContent=data.layered?`按类型与状态分层，覆盖全部 ${number(index.byKind.chunk.length)} 个组块；点击入口继续展开。`:data.scope;
 $('graph-coverage').textContent=data.overview&&data.layered?`全部 ${number(index.byKind.chunk.length)} 个组块纳入 ${data.total} 个显示分层。`:`当前展示 ${data.shown} / ${number(data.total)} 个${data.center?'关联条目':'组块'}${data.center?'及所选节点':''}；全部内容仍可从目录与详情查看。`;
 if(data.nodes.length>36)$('graph-coverage').textContent+=' 大图只显示部分名称，悬停或点击可查看完整内容。';
 $('graph-page').textContent=data.pages>1?`${data.page+1} / ${data.pages}`:'';
 $('graph-prev').disabled=data.page===0;$('graph-next').disabled=data.page>=data.pages-1;
 $('graph-prev').hidden=$('graph-next').hidden=data.pages===1;
 const canvas=$('graph'),scene=$('graph-scene');canvas.setAttribute('viewBox',`0 0 ${width} ${height}`);scene.replaceChildren();
 viewport={x:0,y:0,scale:1};applyViewport();const layout=positions(data,width,height);
 for(const edge of data.edges){
  const from=layout.get(edge.source),to=layout.get(edge.target);if(!from||!to)continue;
  const inactive=edge.active===false||['withdrawn','superseded','needs_review'].includes(edge.status),line=svg('line',{x1:from.x,y1:from.y,x2:to.x,y2:to.y,class:'graph-edge '+edge.type+(inactive?' inactive':''),tabindex:0,role:'button','aria-label':edge.label||'查看联系'});
  line.append(svg('title',{},edge.label||'查看联系'));
  const run=()=>{if(edge.claim_id)openNode(edge.claim_id);else inspectEdge(edge)};
  line.addEventListener('click',event=>{if(!drag?.moved){event.stopPropagation();run()}});
  line.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();run()}});scene.append(line);
 }
 for(const [i,node] of data.nodes.entries()){
  const pos=layout.get(node.id),central=data.center?.id===node.id,group=svg('g',{class:'graph-node '+node.kind+(central?' center':'')+(node.kind==='claim'&&node.record.active===false?' inactive':''),transform:`translate(${pos.x} ${pos.y})`,tabindex:0,role:'button','aria-label':KIND_LABELS[node.kind]+'：'+node.title});
   group.append(svg('title',{},node.title+' · '+describe(node)));
   // Include the gap and label in the pointer target, not just the tiny glyph.
   const labelled=data.nodes.length<=36||central||i<22;
   const hitWidth=labelled?Math.max(48,Math.min(166,[...short(node.title,width<420?9:13)].length*12+10)):36;
   group.append(svg('rect',{x:-hitWidth/2,y:-18,width:hitWidth,height:labelled?66:36,fill:'transparent',stroke:'none','pointer-events':'all',class:'hit-area'}));
  if(node.kind==='chunk'||node.kind==='bucket')group.append(svg('rect',{x:central?-18:-13,y:central?-13:-9,width:central?36:26,height:central?26:18,rx:4,class:'shape'}));
  else if(node.kind==='claim'||node.kind==='source')group.append(svg('polygon',{points:central?'0,-15 15,0 0,15 -15,0':'0,-10 10,0 0,10 -10,0',class:'shape'}));
  else group.append(svg('circle',{r:central?14:8,class:'shape'}));
  if(data.nodes.length<=36||central||i<22)group.append(svg('text',{x:0,y:central?31:25,'text-anchor':'middle'},short(node.title,width<420?9:13)));
  if(node.kind==='bucket')group.append(svg('text',{x:0,y:41,'text-anchor':'middle',class:'count-label'},node.chunks.length+' 个组块'));
  else if(node.kind==='chunk'&&data.overview)group.append(svg('text',{x:0,y:40,'text-anchor':'middle',class:'count-label'},node.record.members.length+' 个概念'));
  const run=()=>openNode(node.id);group.addEventListener('click',event=>{if(!drag?.moved){event.stopPropagation();run()}});
  group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();run()}});scene.append(group);
 }
 if(!data.nodes.length)scene.append(svg('text',{x:width/2,y:height/2,'text-anchor':'middle',fill:'#6b8079'},'暂无组块；全部概念可从全库目录查看。'));
}
function group(body,title){const section=element('section','','details-group');append(section,element('h4',title));body.append(section);return section}
function nodeButton(node){return button(node.title,()=>openNode(node.id))}
function pagedRows(body,title,items,render,size=24){
 const section=group(body,title+'（'+number(items.length)+'）'),list=element('div'),pager=element('div','','mini-pages');let page=0;
 const prev=button('上一页',()=>{page--;draw()}),next=button('下一页',()=>{page++;draw()}),text=element('span');append(pager,prev,text,next);append(section,list,pager);
 function draw(){
  const pages=Math.max(1,Math.ceil(items.length/size));list.replaceChildren(...items.slice(page*size,(page+1)*size).map(render));
  if(!items.length)list.append(element('p','暂无相关记录。'));
  pager.hidden=pages===1;text.textContent=(page+1)+' / '+pages;prev.disabled=!page;next.disabled=page>=pages-1;
 }draw();return section;
}
function renderEntityRow(node){return append(element('div','','record'),nodeButton(node),element('p',KIND_LABELS[node.kind]+' · '+describe(node)))}
function renderEvidence(row){
 const source=index.get(row.source_id),record=element('div','','record');
 append(record,source?nodeButton(source):element('strong','来源未发布'),element('p',(row.stance==='contradicts'?'反证':row.stance==='supports'?'支持来源':'背景来源')+(row.usable===false?' · 当前不可用':'')),element('p',row.locator||'定位未提供','locator'));
 if(row.summary)record.append(element('p',row.summary));if(source)record.append(link(source.record.url,'查看公开来源 ↗')||element('p','本地或非公开网址未发布。'));return record;
}
function renderInspector(node){
 const body=$('inspector-body');body.replaceChildren();$('inspector-kind').textContent=node?KIND_LABELS[node.kind]:'';
 if(!node){append(body,element('h3','从组块开始'),element('p','组块分层覆盖整个快照。也可搜索概念，或点击上方统计进入完整目录。'),element('p','没有入组块或没有联系的概念同样可以查看。','hint'));return}
 const row=node.record;append(body,element('h3',node.title),element('p',describe(node)));
 if(node.kind==='bucket'){
  body.append(element('p','这是按组块类型与当前状态生成的显示分层，不表示新增知识关系。','hint'));pagedRows(body,'全部组块',node.chunks,renderEntityRow);return;
 }
 if(node.kind==='concept'){
  body.append(element('p',row.definition||'定义尚未写入。','definition'));
  const aliases=group(body,'名称与别名');for(const alias of row.aliases||[])aliases.append(element('span',alias,'tag'));
  if(!row.aliases?.length)aliases.append(element('p','暂无别名。'));
  pagedRows(body,'所属组块',index.conceptChunks.get(node.id)||[],renderEntityRow);
  const conceptSourceIds=new Set([...(row.source_ids||[]),...(index.conceptClaims.get(node.id)||[]).flatMap(claim=>(index.claimEvidence.get(claim.id)||[]).map(evidence=>evidence.source_id))]);
  pagedRows(body,'相关出处',[...conceptSourceIds].map(id=>index.get(id)).filter(Boolean),renderEntityRow);
  pagedRows(body,'全部知识联系',index.conceptClaims.get(node.id)||[],renderEntityRow);return;
 }
 if(node.kind==='chunk'){
  if(row.definition)body.append(element('p',row.definition,'definition'));
  body.append(element('span',STATUS_LABELS[row.state]||row.state||'未分类','tag'));
  pagedRows(body,'全部成员概念',row.members.map(id=>index.get(id)),renderEntityRow);
  pagedRows(body,'组块知识联系',(row.claim_ids||[]).map(id=>index.get(id)),renderEntityRow);
  if(row.source_id&&index.get(row.source_id))append(group(body,'组块来源'),nodeButton(index.get(row.source_id)));return;
 }
 if(node.kind==='claim'){
  body.append(element('span',STATUS_LABELS[row.status]||row.status||'未提供状态',['source_supported','vocabulary_supported'].includes(row.status)?'tag':'tag warning'));
  if(claimAvailability(row))body.append(element('span',claimAvailability(row),'tag warning'));
  if(row.statement!==node.title)body.append(element('p',row.statement,'definition'));
  const endpoints=group(body,'关系方向');append(endpoints,nodeButton(index.get(row.subject)),element('p',relationLabel(row.predicate)),nodeButton(index.get(row.object)));
  const conditions=group(body,'适用条件'),entries=Object.entries(row.qualifiers||{});
  for(const [key,value] of entries){const line=element('p','','condition');append(line,element('strong',key+'：'),element('span',typeof value==='object'?JSON.stringify(value,null,2):value));conditions.append(line)}
  if(!entries.length)conditions.append(element('p','未提供独立条件字段，请结合关系陈述与来源核对。'));
  const confidence=confidenceLabel(row.confidence);if(confidence)body.append(element('p',confidence,'hint'));
  pagedRows(body,'证据与出处',index.claimEvidence.get(node.id)||[],renderEvidence);
  body.append(element('p','发布快照保留科学概括和来源定位，文献原文仍在本机。来源支持不等于科学结论已被证实。','hint'));return;
 }
 if(node.kind==='source'){
  append(body,link(row.url,'打开公开来源 ↗')||element('p','本地或非公开网址未发布。'));
  body.append(element('p','此站展示来源元数据与引用定位，不包含私人原文。','hint'));
  pagedRows(body,'引用该来源的知识联系',[...new Map((index.sourceClaims.get(node.id)||[]).map(n=>[n.id,n])).values()],renderEntityRow);
 }
}
function inspectEdge(edge){
 const body=$('inspector-body');body.replaceChildren();$('inspector-kind').textContent='显示中的联系';append(body,element('h3',edge.label||'联系'));
 for(const id of [edge.source,edge.target]){const node=index.get(id);if(node)body.append(nodeButton(node))}
 if(edge.type==='shared'){body.append(element('p','共享成员是显示组块联系的依据，不代表新增科学论断。','hint'));pagedRows(body,'共享的概念',edge.concept_ids.map(id=>index.get(id)),renderEntityRow)}
 else body.append(element('p',edge.type==='layer'?'此线连接显示分层与原始组块。':'此线表示保存的组块成员关系。'));
}
async function installSnapshot(raw,origin){
 status('正在建立全量索引…');await new Promise(resolve=>requestAnimationFrame(resolve));
 const next=createIndex(raw);index=next;trail=[];graphPage=0;cataloguePage=0;
 if(!index.get(current))current='';
 $('snapshot-time').textContent='同步于 '+time(raw.generated_at);$('snapshot-origin').textContent=origin+' · 快照序号 '+String(raw.sequence??'未提供');
 const example=raw.manifest.example===true||raw.manifest.mode==='example';status(example?'示例数据 · 尚未接入真实网络快照。':'快照已读取；全部目录与索引在浏览器内查询。',example?'example':'');
 renderCounts();searchCatalogue();renderGraph();renderInspector(index.get(current));$('back').disabled=true;
}
async function websiteSnapshotText(){
 const options={cache:'no-store',credentials:'omit'};
 if(typeof DecompressionStream==='function'){
  try{
   const compressed=await fetch('./snapshot.json.gz',options);
   if(compressed.ok&&compressed.body)return await readBoundedText(compressed.body.pipeThrough(new DecompressionStream('gzip')));
  }catch(error){if(error.code==='snapshot_size')throw error}
 }
 const response=await fetch('./snapshot.json',options);
 if(!response.ok)throw Error('网站快照暂未取得（'+response.status+'）。可稍后重试或导入快照文件。');
 if(Number(response.headers.get('Content-Length'))>MAX_SNAPSHOT_BYTES)throw Error('快照超过本浏览器版本的 64 MB 上限。');
 if(response.body)return await readBoundedText(response.body);
 const text=await response.text();if(new TextEncoder().encode(text).byteLength>MAX_SNAPSHOT_BYTES)throw Error('快照超过本浏览器版本的 64 MB 上限。');return text;
}
async function loadWebsite(){
 $('reload').disabled=true;status('正在读取最新网站快照…');
 try{
  const text=await websiteSnapshotText();
  await installSnapshot(JSON.parse(text),'网站发布快照');
 }catch(error){status(error.message+(index?' 当前保留上次已读取的快照。':''),'error')}
 finally{$('reload').disabled=false}
}
$('search-form').onsubmit=event=>{event.preventDefault();clearTimeout(searchTimer);searchCatalogue()};
$('query').oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(searchCatalogue,120)};
$('scope').onchange=searchCatalogue;$('clear-query').onclick=()=>{$('query').value='';searchCatalogue()};
$('home').onclick=()=>openNode('');$('back').onclick=()=>{if(trail.length)openNode(trail.pop(),false)};
$('catalogue-prev').onclick=()=>{if(cataloguePage){cataloguePage--;renderCatalogue()}};$('catalogue-next').onclick=()=>{cataloguePage++;renderCatalogue()};
$('catalogue-page-form').onsubmit=event=>{event.preventDefault();cataloguePage=Math.max(0,Math.min(Math.ceil(searchResults.length/catalogueSize)-1,(Number($('catalogue-page').value)||1)-1));renderCatalogue()};
$('graph-prev').onclick=()=>{if(graphPage){graphPage--;renderGraph()}};$('graph-next').onclick=()=>{graphPage++;renderGraph()};
$('zoom-in').onclick=()=>zoom(1.25);$('zoom-out').onclick=()=>zoom(.8);$('fit').onclick=()=>{viewport={x:0,y:0,scale:1};applyViewport()};
$('reload').onclick=loadWebsite;$('import-trigger').onclick=()=>$('snapshot-file').click();
$('snapshot-file').onchange=async event=>{
 try{const file=event.target.files[0];if(!file)return;if(file.size>MAX_SNAPSHOT_BYTES)throw Error('导入快照超过 64 MB。');await installSnapshot(JSON.parse(await file.text()),'本地导入 '+file.name)}
 catch(error){status('导入未完成：'+error.message+(index?' 原快照保留。':''),'error')}finally{event.target.value=''}
};
const stage=$('graph-stage');
stage.addEventListener('wheel',event=>{event.preventDefault();const rect=stage.getBoundingClientRect();zoom(event.deltaY<0?1.12:1/1.12,event.clientX-rect.left,event.clientY-rect.top)},{passive:false});
stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,originX:viewport.x,originY:viewport.y,moved:false,captured:false};if(!event.target.closest('.graph-node,.graph-edge')){stage.setPointerCapture(event.pointerId);drag.captured=true}});
stage.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;if(drag.moved){if(!drag.captured){stage.setPointerCapture(event.pointerId);drag.captured=true}viewport.x=drag.originX+dx;viewport.y=drag.originY+dy;$('graph').classList.add('dragging');applyViewport()}});
stage.addEventListener('pointerup',()=>{$('graph').classList.remove('dragging');setTimeout(()=>drag=null,0)});
stage.addEventListener('pointercancel',()=>{drag=null;$('graph').classList.remove('dragging')});
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(renderGraph,120)});
try{current=decodeURIComponent(location.hash.slice(1))}catch{}
loadWebsite();
