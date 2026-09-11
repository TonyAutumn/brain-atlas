import {networkOf,recordKind,kindLabel} from './networks.js';
import {EVIDENCE,ORIGINS,validateAnalysis,quoteCheck} from './schema.js';
import {canonicalTheme,themeList,createPaper,mappingOptions,resolveMapping,evidenceScene,mechanismRows,validateBackup,human,rematchPapers,mappingExplanation} from './model.js?v=net1';
import {automaticThemes} from './theme-policy.js';
import {readLibrary,saveLibrary} from './store.js';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let library={version:1,themes:['濒死体验'],papers:[]},entries=[],options=[],activeTheme='',view='mechanisms',search='',selectedRows=null,editing=null,rename=false,abort=null,busy=false,ready=false,pendingScene=null,currentRows=[];
let service='',token='';try{service=localStorage.getItem('brain-atlas-service-v1')||'';token=sessionStorage.getItem('brain-atlas-access-v1')||'';}catch{}
function message(text){$('message').textContent=text;clearTimeout(message.timer);message.timer=setTimeout(()=>$('message').textContent='',6500);}
function showDialog(id){$(id).showModal();}
function closeDialog(id){if(id==='uploadDialog'&&busy){message('分析仍在进行；请先取消或等待完成。');return;}$(id).close();}
async function commit(next){library=next;render();try{await saveLibrary(library);return true;}catch(e){message(e.message+' 当前结果仍在页面中，可用“导出备份”保存。');return false;}}
function selectedPapers(){return library.papers.filter(p=>(!activeTheme||p.data.themes.some(t=>t.toLowerCase()===activeTheme.toLowerCase()))&&(!$('reviewedOnly').checked||p.reviewed)&&(!search||[p.data.title,p.data.task,p.data.summary,...p.data.mechanisms.map(m=>m.title+' '+m.claim)].join(' ').toLowerCase().includes(search)));}
function render(){
 const papers=selectedPapers(),rows=mechanismRows(papers),themeNames=themeList([...library.themes,...library.papers.flatMap(p=>p.data.themes)]);
 $('themeList').innerHTML=[['', '全部文献'],...themeNames.map(t=>[t,t])].map(([id,name])=>`<button data-theme="${esc(id)}" aria-pressed="${activeTheme===id}"><span>${esc(name)}</span><small>${library.papers.filter(p=>!id||p.data.themes.some(t=>t.toLowerCase()===id.toLowerCase())).length}</small></button>`).join('');
 $('themeSuggestions').innerHTML=themeNames.map(t=>`<option value="${esc(t)}"></option>`).join('');
 $('topicTitle').textContent=activeTheme||'全部文献';$('renameTheme').hidden=!activeTheme;
 $('topicSummary').textContent=`${papers.length} 篇文献 · ${rows.length} 条机制证据 · ${papers.filter(p=>p.reviewed).length} 篇已核对`;
 $('mechanismsTab').setAttribute('aria-pressed',String(view==='mechanisms'));$('papersTab').setAttribute('aria-pressed',String(view==='papers'));
 currentRows=selectedRows?rows.filter(r=>selectedRows.includes(r.key)):rows;
 if(selectedRows&&!currentRows.length){selectedRows=null;currentRows=rows;}
 $('showAllMechanisms').hidden=!selectedRows;
 if(!papers.length)$('results').innerHTML=`<div class="empty"><h2>${library.papers.length?'当前没有匹配的文献':'从第一篇论文开始'}</h2><p>${library.papers.length?'可以切换主题、清空搜索，或关闭“只看已核对文献”。':'上传与这个主题有关的论文，逐篇积累行为任务、神经机制与证据。'}</p><p>同一主题下的论文会一起展示；每项结论仍保留各自的来源和限制。</p><button data-upload class="primary">上传文献</button></div>`;
 else if(view==='papers')$('results').innerHTML=papers.map(p=>`<article class="card"><div class="card-top"><span class="badge ${p.reviewed?'checked':'draft'}">${p.reviewed?'已核对':'待核对'}</span><span class="badge">${esc(p.data.studyType||'研究类型未报告')}</span></div><h3>${esc(p.data.title)}</h3><p>${esc(p.data.summary)}</p><div class="citation">${esc(p.data.authors)} ${esc(p.data.year)}</div><div class="region-tags">${p.data.themes.map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="actions"><button data-paper="${p.id}">论文与证据</button><button data-paper-map="${p.id}">查看本篇机制图</button></div></article>`).join('');
 else $('results').innerHTML=rows.length?rows.map(({key,paper:p,mechanism:m})=>`<article class="card ${selectedRows?.includes(key)?'selected':''}"><div class="card-top"><span class="badge ${['hypothesis','review','effective'].includes(m.evidenceType)?'inference':''}">${EVIDENCE[m.evidenceType]}</span><span class="badge">${ORIGINS[m.origin]}</span>${p.reviewed?'':'<span class="badge draft">待核对</span>'}</div><h3>${esc(m.title)}</h3><p>${esc(m.claim)}</p><p><b>方法：</b>${esc(m.method||'未报告')}</p><div class="region-tags">${m.regions.map(id=>p.data.regions.find(r=>r.id===id)).filter(Boolean).map(r=>`<span style="border-left:3px solid ${networkOf(r)?'#b58aff':recordKind(r)==='cell'?'#e6b465':'#39b9ff'}">${kindLabel(r)} · ${esc(r.name)} · ${esc({L:'左',R:'右',both:'双侧',unknown:'侧别未报告'}[r.hemisphere])}</span>`).join('')}</div>${m.limitations?`<p><b>限制：</b>${esc(m.limitations)}</p>`:''}<div class="citation"><button data-paper="${p.id}">${esc(p.data.title)} · ${esc(p.data.year)}</button><br>${esc(m.locator||'原文位置待核对')}</div><div class="actions"><button data-mechanism="${esc(key)}">在脑图中查看</button><button data-paper="${p.id}">查看原文证据</button></div></article>`).join(''):'<div class="empty"><h2>尚无可提取的神经机制</h2><p>这些文献已保存，可在“对应文献”查看。缺少神经证据时不会生成推测路线。</p></div>';
 updateScene();
}
async function updateScene(){
 const spec=evidenceScene(currentRows,entries),regionRefs=new Set(currentRows.flatMap(({paper,mechanism:m})=>m.regions.map(id=>paper.id+':'+id)));
 spec.title=selectedRows?'当前文献机制':(activeTheme||'全部文献')+' · 机制综览';pendingScene=spec;
 $('brainTitle').textContent=spec.title;
 const pending=spec.nodes.filter(n=>n.provisional).length,unmapped=regionRefs.size-spec.nodes.length;
 const refs=[...new Map(currentRows.flatMap(({paper,mechanism:m})=>m.regions.map(id=>({paper,r:paper.data.regions.find(r=>r.id===id)}))).filter(x=>x.r).map(x=>[x.paper.id+':'+x.r.id,x])).values()];
 const counts={region:0,network:0,cell:0};refs.forEach(x=>counts[recordKind(x.r)]++);
 $('mappingStatus').textContent=currentRows.length?`解剖结构 ${counts.region} 项 · 功能网络 ${counts.network} 项 · 细胞/神经元 ${counts.cell} 项。${spec.nodes.filter(n=>n.kind!=='network').length} 项解剖对应，${spec.nodes.filter(n=>n.kind==='network').length} 项网络参考；${pending} 项候选待核对。`:'当前没有文献机制。';
 const filter=$('recordFilter').value;
 document.querySelectorAll('#recordTabs [data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===filter)));
 if(filter!=='all'){spec.nodes=spec.nodes.filter(n=>n.kind===filter);const visible=new Set(spec.nodes.map(n=>n.id));spec.links=spec.links.filter(l=>visible.has(l.from)&&visible.has(l.to));}
 $('recordDetails').innerHTML=refs.filter(x=>filter==='all'||recordKind(x.r)===filter).map(({paper,r})=>`<div style="border-left:3px solid ${networkOf(r)?'#b58aff':recordKind(r)==='cell'?'#e6b465':'#39b9ff'};padding:8px;margin:8px 0"><b>${kindLabel(r)} · ${esc(r.name)}</b><p>${esc(mappingExplanation(r,paper.mappings[r.id],entries))}</p>${networkOf(r)?'<a href="https://pubmed.ncbi.nlm.nih.gov/11209064/" target="_blank" rel="noopener">DMN 背景文献</a>':''}</div>`).join('')||'<p>当前范围没有此类记录。可切换到“全部文献”、关闭“只看已核对文献”，或上传涉及此类机制的论文。</p>';

 const confirmed=evidenceScene(currentRows,entries,{confirmedOnly:true});$('markLearned').disabled=!confirmed.nodes.length||!['all','region'].includes(filter);
 if(ready){try{await $('brainFrame').contentWindow.brainAtlas.showEvidence(spec);}catch{message('部分三维结构尚未加载成功，可刷新后重试。');}}
}
function upload(){if(activeTheme)$('uploadTheme').value=activeTheme;showDialog('uploadDialog');if(!service||!token)$('uploadStatus').textContent='请先在顶部“连接 Kimi”配置分析服务。选择文件本身不会上传。';}
function settings(){ $('serviceUrl').value=service;$('accessToken').value=token;showDialog('settingsDialog');}
function serviceAddress(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error('请填写不带查询参数的 HTTPS 分析服务网址。');if(/(^|\.)(moonshot\.(cn|ai)|kimi\.com)$/.test(u.hostname))throw Error('这里填写个人分析服务地址，不是 Kimi 的 API 地址。');return u.href.replace(/\/$/,'');}
function saveSettings(){service=serviceAddress($('serviceUrl').value.trim());token=$('accessToken').value.trim();if(token.length<24)throw Error('个人访问码至少需要 24 个字符。');try{localStorage.setItem('brain-atlas-service-v1',service);sessionStorage.setItem('brain-atlas-access-v1',token);}catch{message('浏览器禁止保存设置，本次会话仍可使用。');}$('settingsBtn').textContent='Kimi 连接设置';$('connectionStatus').textContent='连接设置已保存。点击“测试连接”核对服务与模型。';}
async function callService(path,init={}){if(!service||!token)throw Error('请先配置 Kimi 分析服务。');const r=await fetch(service+path,{...init,headers:{...init.headers,Authorization:'Bearer '+token}});if(!r.ok){let data;try{data=await r.json();}catch{}throw Error(data?.error||`服务返回 ${r.status}，请检查连接设置。`);}return r;}
async function analyze(event){
 event.preventDefault();if(busy)return;
 if(!service||!token){$('uploadStatus').textContent='尚未连接分析服务。请先完成顶部“连接 Kimi”中的一次性配置。';return;}
 const file=$('paperFile').files[0],text=$('paperText').value.trim(),figures=[...$('figureFiles').files];
 if((!file&&!text)||(file&&text)){ $('uploadStatus').textContent='请上传一篇文献或粘贴正文，二选一。';return;}
 if(file?.size>12*1024*1024||figures.length>3||figures.some(f=>f.size>2*1024*1024)){ $('uploadStatus').textContent='论文最大 12 MB；图表最多 3 张，每张最大 2 MB。';return;}
 busy=true;abort=new AbortController();$('analyzeBtn').disabled=true;$('cancelAnalysis').hidden=false;
 let stage='正在准备材料',warnings=[],started=Date.now();const update=()=>$('uploadStatus').textContent=stage+`\n已用时 ${Math.floor((Date.now()-started)/1000)} 秒`;
 update();const timer=setInterval(update,1000);let received=false;
 try{
  const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',file?await file.arrayBuffer():new TextEncoder().encode(text)))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const duplicate=library.papers.find(p=>p.fingerprint===fingerprint);
  if(duplicate)throw Error('这份正文已经在文献库中：'+duplicate.data.title+'。请打开该文献编辑主题，无需重复付费分析。');
  const form=new FormData();if(file)form.append('file',file);else form.append('text',text);for(const f of figures)form.append('figures',f);form.append('themes',library.themes.join('\n'));form.append('chosenTheme',$('uploadTheme').value.trim());
  const response=await callService('/analyze',{method:'POST',body:form,signal:abort.signal});
  if(!response.headers.get('Content-Type')?.includes('application/x-ndjson'))throw Error('分析服务版本不匹配，请更新服务代码。');
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
  async function handle(line){
   if(!line.trim())return;const data=JSON.parse(line);
   if(data.type==='status'){stage=data.message;update();}
   if(data.type==='warning')warnings.push(data.message);
   if(data.type==='error')throw Error(data.message);
   if(data.type==='result'){
    if(received)throw Error('服务返回了重复结果。');received=true;
    const paper=createPaper(data.analysis,entries,{source:data.source||'',fileName:file?.name||'粘贴的正文',originalFile:file||null,fingerprint,model:data.model,usage:data.usage,figureNames:data.figures||[],warnings});
    const suggested=automaticThemes(paper.data.themes),chosen=form.get('chosenTheme');
    paper.data.themes=themeList(chosen?[chosen,...suggested]:suggested);
    if(!paper.data.themes.length)paper.warnings=[...(paper.warnings||[]),'未获得合适的现象或行为主题。文献已保留在“全部文献”，请核对后填写主题。'];
    const saved=await commit({...library,themes:themeList([...library.themes,...paper.data.themes]),papers:[paper,...library.papers]});
    stage=saved?'分析完成，已保存为待核对草稿。':'分析完成，但本地保存失败，请立即导出备份。';
    if(warnings.length)stage+='\n'+warnings.join('\n');
    selectedRows=null;activeTheme=paper.data.themes[0]||'';render();
    if(saved){message('论文已加入主题，可核对定位与证据。');openPaper(paper.id);}
   }
  }
  while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});if(buffer.length>4000000)throw Error('服务响应过大，已停止读取。');let end;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);await handle(line);}}
  buffer+=decoder.decode();if(buffer.trim())await handle(buffer);if(!received)throw Error('连接中断，尚未收到完整分析结果。请检查服务后重试。');
 }catch(e){stage=abort.signal.aborted?'已取消；已经发出的 Kimi 调用可能仍产生费用。':e.message;}
 finally{clearInterval(timer);busy=false;abort=null;$('analyzeBtn').disabled=false;$('cancelAnalysis').hidden=true;$('uploadStatus').textContent=stage;}
}
function field(label,value,key,rows=0){return `<label>${label}${rows?`<textarea data-field="${key}" rows="${rows}">${esc(value)}</textarea>`:`<input data-field="${key}" value="${esc(value)}">`}</label>`;}
function enumOptions(values,selected){return Object.entries(values).map(([v,label])=>`<option value="${v}" ${selected===v?'selected':''}>${label}</option>`).join('');}
function mappingRow(r,p){
 const m=p.mappings[r.id],allowed=['region','network'].includes(r.level)&&human(r.species);
 return `<div class="mapping-row" data-region="${esc(r.id)}"><h3>${esc(r.name)}</h3><p>${esc(r.species)} · ${kindLabel(r)} · 原文侧别：${esc(r.hemisphere)}<br>${esc(r.locator)}</p>${allowed?`<div class="row"><label>图谱对应<select data-mapping><option value="">保留未匹配</option>${options.filter(o=>networkOf(r)?o.value.startsWith('network:'):!o.value.startsWith('network:')).map(o=>`<option value="${o.value}" ${m?.target===o.value?'selected':''}>${esc(o.label)}</option>`).join('')}</select></label><label>用于显示的侧别<select data-side>${enumOptions({unknown:'未明确，不投到图中',L:'左侧',R:'右侧',both:'双侧'},m?.hemisphere||r.hemisphere)}</select></label></div><label class="check"><input type="checkbox" data-confirmed ${m?.confirmed?'checked':''}>我已核对侧别与图谱范围</label><p class="filter-note">${esc(mappingExplanation(r,m,entries))}</p><small>自动对应只是候选。大结构对应的是已收录分区集合，不能擅自把论文中的海马细化成 CA1 等亚区。</small>`:'<p class="filter-note">保留在证据列表中；当前人脑底座不显示动物脑区、细胞类型或单神经元位置。</p>'}</div>`;
}
function mechanismEditor(m,p){
 const quotes={matched:'已在提取文本中找到原文；仍需核对它是否支持结论',unmatched:'摘录未在提取文本中找到，请核对原 PDF 或附图',missing:'尚无可核验的原文摘录'};
 return `<details class="mechanism-editor" data-edit-mechanism="${esc(m.id)}"><summary>${esc(m.title)}</summary>${field('机制名称',m.title,'title')}${field('结论 / 假说',m.claim,'claim',4)}${field('实验与测量方法',m.method,'method',2)}<div class="metadata"><label>证据类别<select data-field="evidenceType">${enumOptions(EVIDENCE,m.evidenceType)}</select></label><label>证据来源<select data-field="origin">${enumOptions(ORIGINS,m.origin)}</select></label></div>${field('原文位置（节 / 页 / 图表）',m.locator,'locator')}${field('原文摘录',m.quote,'quote',4)}<p class="filter-note">${quotes[quoteCheck(m.quote,p.source||'')]}</p>${field('限制、分歧或不支持结果',m.limitations,'limitations',3)}${m.connections.length?'<h3>论文明确报告的关系</h3>':'<p>本项未提取出明确的两区域关系，不自动连线。</p>'}${m.connections.map((c,i)=>`<div class="connection-row" data-connection="${i}"><label>端点一<select data-from>${p.data.regions.map(r=>`<option value="${esc(r.id)}" ${r.id===c.from?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label><label>端点二<select data-to>${p.data.regions.map(r=>`<option value="${esc(r.id)}" ${r.id===c.to?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label><label><input type="checkbox" data-directed ${c.directed?'checked':''}>原文有方向依据</label><label><input type="checkbox" data-remove>删除这条关系</label></div>`).join('')}<label><input type="checkbox" data-remove-mechanism>移除这条机制（不影响其他机制）</label></details>`;
}
function openPaper(id){
 const p=library.papers.find(p=>p.id===id);if(!p)return;editing=id;
 $('paperDetail').innerHTML=`<form id="paperEdit"><div class="dialog-heading"><h2>论文与证据</h2><button type="button" data-close="paperDialog">关闭</button></div><p>核对原始研究后可修改结论、主题与定位。修改内容仅保存到个人文献库。</p><section id="paperMetadata"><div class="metadata"><div class="full">${field('论文标题',p.data.title,'title')}</div>${field('作者',p.data.authors,'authors')}${field('年份',p.data.year,'year')}<div class="full">${field('所属主题（多个主题用逗号分隔）',p.data.themes.join('，'),'themes')}</div><div class="full">${field('行为任务、实验条件与样本',p.data.task,'task',4)}${field('研究摘要',p.data.summary,'summary',4)}</div></div></section><p>${esc(p.data.studyType)} · ${esc(p.data.species)} · ${esc(p.model||'导入记录')}${p.usage?.total_tokens?` · 本次 ${p.usage.total_tokens} tokens`:''}</p>${p.data.doi?`<a href="https://doi.org/${encodeURIComponent(p.data.doi.replace(/^https?:\/\/doi\.org\//,''))}" target="_blank" rel="noopener">打开 DOI</a>`:''}${p.warnings?.length?`<p>${p.warnings.map(esc).join('<br>')}</p>`:''}<section class="paper-section"><h2>脑区与图谱对应</h2><p>自动匹配不会凭空生成精细亚区。逐项核对后勾选“已核对”，才可将这些位置标记为已学习。</p>${p.data.regions.map(r=>mappingRow(r,p)).join('')||'<p>未提取到可定位的神经结构。</p>'}</section><section class="paper-section"><h2>机制及原文证据</h2>${p.data.mechanisms.map(m=>mechanismEditor(m,p)).join('')||'<p>未提取到神经机制证据。</p>'}</section><details><summary>提取的原始文本 / 文件</summary><p>文件：${esc(p.fileName||'未记录')}。PDF 内图像未自动作为视觉输入；补充图表：${esc((p.figureNames||[]).join('、')||'无')}。</p>${p.originalFile?'<button type="button" id="downloadOriginal">下载原文件</button>':''}<pre class="paper-source">${esc(p.source||'备份中未包含原始文本。')}</pre></details><div class="save-row"><label><input type="checkbox" id="paperReviewed" ${p.reviewed?'checked':''}>我已核对本篇结论、证据类型与引用</label><div class="actions"><button class="primary" type="submit">保存修改</button><button type="button" id="deletePaper" class="danger">删除这篇文献</button></div><p id="editStatus" role="status"></p></div></form>`;
 $('paperEdit').onsubmit=savePaper;
 $('deletePaper').onclick=async()=>{if(!confirm('删除这篇文献及它在各主题中的证据？已学习的解剖标记会保留。'))return;const saved=await commit({...library,papers:library.papers.filter(p=>p.id!==id)});if(saved)$('paperDialog').close();};
 if($('downloadOriginal'))$('downloadOriginal').onclick=()=>download(p.originalFile,p.fileName||'paper.pdf');
 if(!$('paperDialog').open)showDialog('paperDialog');
}
async function savePaper(event){
 event.preventDefault();const p=library.papers.find(p=>p.id===editing);if(!p)return;
 try{
  const data=structuredClone(p.data),mappings=structuredClone(p.mappings);
  $('paperMetadata').querySelectorAll('[data-field]').forEach(el=>{if(el.dataset.field==='themes')data.themes=themeList(el.value.split(/[,，\n]/));else data[el.dataset.field]=el.value;});
  $('paperDetail').querySelectorAll('[data-region]').forEach(el=>{const r=data.regions.find(r=>r.id===el.dataset.region),target=el.querySelector('[data-mapping]');if(!target)return;const mapping={target:target.value,hemisphere:el.querySelector('[data-side]').value,confirmed:el.querySelector('[data-confirmed]').checked};mappings[r.id]=target.value&&resolveMapping(r,mapping,entries).length?mapping:null;});
  const removed=new Set();
  $('paperDetail').querySelectorAll('[data-edit-mechanism]').forEach(el=>{const m=data.mechanisms.find(m=>m.id===el.dataset.editMechanism);if(el.querySelector('[data-remove-mechanism]').checked){removed.add(m.id);return;}el.querySelectorAll('[data-field]').forEach(input=>m[input.dataset.field]=input.value);m.connections=[...el.querySelectorAll('[data-connection]')].filter(row=>!row.querySelector('[data-remove]').checked).map(row=>({from:row.querySelector('[data-from]').value,to:row.querySelector('[data-to]').value,directed:row.querySelector('[data-directed]').checked}));});
  data.mechanisms=data.mechanisms.filter(m=>!removed.has(m.id));
  const validated=validateAnalysis(data),next={...p,data:validated,mappings,reviewed:$('paperReviewed').checked};
  const saved=await commit({...library,themes:themeList([...library.themes,...validated.themes]),papers:library.papers.map(p=>p.id===editing?next:p)});
  $('editStatus').textContent=saved?'修改已保存。':'本地保存失败，请立即导出备份。';
 }catch(e){$('editStatus').textContent=e.message;}
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function exportBackup(){const data={version:1,themes:library.themes,papers:library.papers.map(({originalFile,...p})=>p)};download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'brain-atlas-papers-backup.json');message('已导出主题、分析与原文文本；备份不包含原始 PDF 或连接密钥。');}
function bind(){
 $('recordFilter').value=['region','network','cell'].includes(new URLSearchParams(location.search).get('record'))?new URLSearchParams(location.search).get('record'):'all';
 $('recordFilter').onchange=updateScene;
 $('recordTabs').onclick=e=>{const b=e.target.closest('[data-kind]');if(b){$('recordFilter').value=b.dataset.kind;updateScene();}};
 document.addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close)closeDialog(close.dataset.close);});
 $('uploadDialog').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
 $('uploadBtn').onclick=upload;$('settingsBtn').onclick=settings;$('uploadForm').onsubmit=analyze;$('cancelAnalysis').onclick=()=>abort?.abort();
 $('saveSettings').onclick=()=>{try{saveSettings();}catch(e){$('connectionStatus').textContent=e.message;}};
 $('testConnection').onclick=async()=>{try{saveSettings();$('testConnection').disabled=true;$('connectionStatus').textContent='正在核对服务、Kimi 密钥与模型…';const data=await(await callService('/health',{signal:AbortSignal.timeout(30000)})).json();$('connectionStatus').textContent='已连接 Kimi，当前模型：'+data.model;$('settingsBtn').textContent='Kimi 已连接';}catch(e){$('connectionStatus').textContent=e.message;}finally{$('testConnection').disabled=false;}};
 $('copyWorker').onclick=async()=>{try{const r=await fetch('services/kimi-worker.js?v=themes1',{cache:'no-store'});if(!r.ok)throw Error();await navigator.clipboard.writeText(await r.text());message('已复制完整分析服务代码，请替换 Cloudflare Worker 代码并部署。');}catch{message('无法复制，请点击旁边“下载代码”后打开并复制。');}};
 $('generateToken').onclick=()=>{const bytes=crypto.getRandomValues(new Uint8Array(24));$('generatedToken').textContent=Array.from(bytes,v=>v.toString(16).padStart(2,'0')).join('');$('copyToken').hidden=false;};
 $('copyToken').onclick=async()=>{try{await navigator.clipboard.writeText($('generatedToken').textContent);message('访问码已复制；请同时保存到服务端和本页连接设置。');}catch{message('请手动选中并复制访问码。');}};
 $('themeList').onclick=e=>{const b=e.target.closest('[data-theme]');if(b){activeTheme=b.dataset.theme;selectedRows=null;render();}};
 $('librarySearch').oninput=()=>{search=$('librarySearch').value.trim().toLowerCase();selectedRows=null;render();};
 $('reviewedOnly').onchange=()=>{selectedRows=null;render();};
 $('mechanismsTab').onclick=()=>{view='mechanisms';render();};$('papersTab').onclick=()=>{view='papers';render();};
 $('showAllMechanisms').onclick=()=>{selectedRows=null;render();};
 $('results').onclick=e=>{const paper=e.target.closest('[data-paper]'),map=e.target.closest('[data-paper-map]'),mechanism=e.target.closest('[data-mechanism]');if(paper)openPaper(paper.dataset.paper);if(map){selectedRows=mechanismRows(selectedPapers()).filter(r=>r.paper.id===map.dataset.paperMap).map(r=>r.key);render();}if(mechanism){selectedRows=[mechanism.dataset.mechanism];render();}if(e.target.closest('[data-upload]'))upload();};
 $('addTheme').onclick=()=>{rename=false;$('nameTitle').textContent='新建主题';$('themeName').value='';showDialog('nameDialog');};
 $('renameTheme').onclick=()=>{rename=true;$('nameTitle').textContent='重命名 / 合并主题';$('themeName').value=activeTheme;showDialog('nameDialog');};
 $('nameForm').onsubmit=async e=>{e.preventDefault();const name=canonicalTheme($('themeName').value);if(!name)return;const old=activeTheme,papers=rename?library.papers.map(p=>({...p,data:{...p.data,themes:themeList(p.data.themes.map(t=>t.toLowerCase()===old.toLowerCase()?name:t))}})):library.papers;activeTheme=name;const saved=await commit({...library,themes:themeList([...library.themes.filter(t=>!rename||t!==old),name]),papers});if(saved)$('nameDialog').close();};
 $('rematchBtn').onclick=async()=>{
  if(busy){message('请等待当前分析完成后重新匹配。');return;}
  $('rematchBtn').disabled=true;
  try{const result=rematchPapers(library.papers,entries);const saved=await commit({...library,papers:result.papers});if(saved){$('rematchStatus').textContent=`已补充 ${result.matched} 项自动候选；仍有 ${result.remaining} 项缺少可靠对应。已有匹配与人工核对状态保留。无需调用 Kimi。`;}}catch(e){message(e.message);}finally{$('rematchBtn').disabled=false;}
 };
 $('exportBtn').onclick=exportBackup;$('importBtn').onclick=()=>$('backupFile').click();
 $('backupFile').onchange=async()=>{const f=$('backupFile').files[0];if(!f)return;try{if(f.size>80*1024*1024)throw Error('备份文件超过 80 MB。');const data=validateBackup(JSON.parse(await f.text()),entries),existing=new Set(library.papers.map(p=>p.id)),added=data.papers.filter(p=>!existing.has(p.id));const saved=await commit({...library,themes:themeList([...library.themes,...data.themes]),papers:[...library.papers,...added]});if(saved)message(`已导入 ${added.length} 篇文献；相同编号的现有文献未被覆盖。`);}catch(e){message(e.message);}finally{$('backupFile').value='';}};
 $('markLearned').onclick=()=>{if(!['all','region'].includes($('recordFilter').value))return;try{const spec=evidenceScene(currentRows,entries,{confirmedOnly:true}),ids=[...new Set(spec.nodes.flatMap(n=>n.entryIds))];if(!ids.length)return;const key='brain-atlas-anatomy-known-v1',known=new Set(JSON.parse(localStorage.getItem(key)||'[]'));ids.forEach(id=>known.add(id));localStorage.setItem(key,JSON.stringify([...known]));if(ready)$('brainFrame').contentWindow.brainAtlas.markLearned(ids);message(`已保存 ${ids.length} 个图谱条目的学习标记；仅包含已核对定位。`);}catch{message('学习标记未能保存，请检查浏览器存储权限。');}};
 window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===$('brainFrame').contentWindow&&e.data?.type==='brain-atlas-ready'){ready=true;updateScene();}});
}
async function main(){
 try{bind();const [stored,r]=await Promise.all([readLibrary(),fetch('anatomy/data/manifest.json')]);if(!r.ok)throw Error('无法读取脑区图谱。');entries=(await r.json()).entries.filter(e=>e.atlas!=='surface');options=mappingOptions(entries);library=stored;if(library.mappingRevision!=='net1'){const result=rematchPapers(library.papers,entries);await commit({...library,papers:result.papers,mappingRevision:'net1'});$('rematchStatus').textContent=`已自动补充 ${result.matched} 项候选。功能网络、细胞与不能定位的结构可展开图下清单查看。`;}render();if(service)$('settingsBtn').textContent='Kimi 连接设置';if($('brainFrame').contentWindow.brainAtlas){ready=true;updateScene();}}
 catch(e){$('topicSummary').textContent=e.message;$('uploadBtn').disabled=true;message(e.message);}
}
main();
