/* Pure local indexing and bounded views. No requests, models or inference. */
export const SCHEMA = 'scholar.network-snapshot/v1';
export const MAX_SNAPSHOT_BYTES = 64 * 1024 * 1024;
const limits = {concepts:200000,chunks:50000,claims:500000,sources:100000,evidence:1000000};
const arrays = Object.keys(limits);
const kinds = {concepts:'concept',chunks:'chunk',claims:'claim',sources:'source'};
const kindOrder = {concept:0,chunk:1,claim:2,source:3};
export const KIND_LABELS = {concept:'概念',chunk:'组块',claim:'知识联系',source:'来源',bucket:'组块分层'};
export const STATUS_LABELS = {active:'可压缩',candidate:'候选',stale:'待更新',source_supported:'有来源支持',vocabulary_supported:'术语结构',provisional:'候选论断',contested:'存在分歧',withdrawn:'已撤回',superseded:'已替换',needs_review:'待核查'};
export const CHUNK_LABELS = {source:'资料组块',source_unit:'资料组块',template:'结构组块'};
export const RELATIONS={defined_by:'定义',related_to:'相关',is_a:'属于',part_of:'组成部分',measured_by:'测量方法',associated_with:'关联',causes:'因果',contrasts_with:'对照',supports:'支持',limited_by:'适用限制'};
export function relationLabel(value){return RELATIONS[value]||value||'联系'}
export function claimAvailability(record){
 if(record?.active!==false)return '';
 if(['withdrawn','superseded'].includes(record.status))return '当前不可用';
 return '复查未完成 · 暂不可用';
}
export function confidenceLabel(value){
 if(!value||typeof value!=='object')return '';
 if(value.is_current===false)return '此评估对应旧修订，已过期；不作为当前来源忠实度概率。';
 if(value.target&&value.target!=='source_faithfulness')return '评估目标并非来源忠实度，不显示为来源忠实度概率。';
 if(value.calibration==='calibrated'){
  if(value.is_current===true&&typeof value.probability==='number'&&value.probability>=0&&value.probability<=1)return '来源忠实度概率 '+(value.probability*100).toLocaleString('zh-CN',{maximumFractionDigits:1})+'%（非科学真伪）。';
  return '当前修订的已校准来源忠实度概率尚未确认。';
 }
 if(typeof value.score==='number')return '来源忠实度评分 '+value.score+'，未校准；不是正确概率或科学真伪。';
 return '';
}

export function norm(value){return String(value??'').normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g,' ').trim()}
export function safeURL(value){
 try{const url=new URL(String(value));return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.href:''}catch{return ''}
}
function title(row,kind){return String(row.title||row.label||row.statement||(kind==='chunk'?(CHUNK_LABELS[row.chunk_kind]||'组块')+' · '+row.id:row.id))}
function list(value,name){if(!Array.isArray(value))throw Error(name+' 必须为数组');return value}
function required(value,name){if(typeof value!=='string'||!value.trim()||value.length>300)throw Error(name+' 无效');return value}
export async function readBoundedText(stream,maximum=MAX_SNAPSHOT_BYTES){
 const reader=stream.getReader(),decoder=new TextDecoder('utf-8',{fatal:true}),parts=[];let bytes=0;
 try{
  while(true){
   const result=await reader.read();if(result.done)break;bytes+=result.value.byteLength;
   if(bytes>maximum){await reader.cancel();throw Object.assign(Error('快照超过本浏览器版本的 64 MB 上限。'),{code:'snapshot_size'})}
   parts.push(decoder.decode(result.value,{stream:true}));
  }
  parts.push(decoder.decode());return parts.join('');
 }finally{reader.releaseLock()}
}
export function validateSnapshot(snapshot){
 if(!snapshot||typeof snapshot!=='object'||snapshot.schema!==SCHEMA)throw Error('不是支持的学者网络快照（v1）。');
 if(snapshot.read_only!==true||snapshot.model_calls!==0)throw Error('需要只读、无模型调用的网络快照。');
 if(!snapshot.generated_at||!snapshot.manifest?.counts)throw Error('快照缺少同步时间或覆盖统计。');
 const ids=new Map();
 for(const name of arrays){
  const rows=list(snapshot[name],name);if(rows.length>limits[name])throw Error(name+' 超出本浏览器版本的规模上限。');
  if(snapshot.manifest.counts[name]!==rows.length)throw Error(name+' 数量与覆盖清单不一致，已停止加载。');
  for(const row of rows){
   if(!row||typeof row!=='object')throw Error(name+' 有无效记录');required(row.id,name+' id');
   if(ids.has(row.id))throw Error('快照存在重复记录编号：'+row.id);ids.set(row.id,name);
   if(name==='concepts')list(row.aliases||[],'aliases');
   if(name==='chunks'){list(row.members,'members');list(row.claim_ids||[],'claim_ids')}
   if(name==='claims')list(row.evidence_ids||[],'evidence_ids');
  }
 }
 for(const row of snapshot.chunks){
  for(const id of row.members)if(ids.get(id)!=='concepts')throw Error('组块成员缺少概念记录：'+id);
  for(const id of row.claim_ids||[])if(ids.get(id)!=='claims')throw Error('组块缺少知识联系记录：'+id);
 }
 for(const row of snapshot.claims){
  if(ids.get(row.subject)!=='concepts'||ids.get(row.object)!=='concepts')throw Error('知识联系的概念端点不完整：'+row.id);
  for(const id of row.evidence_ids||[])if(ids.get(id)!=='evidence')throw Error('知识联系缺少证据定位：'+id);
 }
 for(const row of snapshot.evidence){
  if(ids.get(row.claim_id)!=='claims'||ids.get(row.source_id)!=='sources')throw Error('证据出处不完整：'+row.id);
 }
 return snapshot;
}
function push(map,id,value){if(!map.has(id))map.set(id,[]);map.get(id).push(value)}
function unique(rows){return [...new Map(rows.map(row=>[row.id,row])).values()]}
function labelSort(a,b){return a.title.localeCompare(b.title,'zh-CN')||a.id.localeCompare(b.id)}
function wordMatch(text,term){
 if(/^[a-z0-9]{1,3}$/.test(term)){
  const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp('(^|[^a-z0-9])'+escaped+'([^a-z0-9]|$)').test(text);
 }
 return text.includes(term);
}

export function createIndex(raw){
 const snapshot=validateSnapshot(raw),nodes=new Map(),byKind={concept:[],chunk:[],claim:[],source:[]};
 const conceptClaims=new Map(),conceptChunks=new Map(),claimEvidence=new Map(),sourceClaims=new Map();
 for(const [name,kind] of Object.entries(kinds))for(const record of snapshot[name]){
  const node={id:record.id,kind,title:title(record,kind),record};nodes.set(node.id,node);byKind[kind].push(node);
 }
 const evidence=new Map(snapshot.evidence.map(row=>[row.id,row]));
 for(const row of snapshot.evidence){push(claimEvidence,row.claim_id,row);push(sourceClaims,row.source_id,nodes.get(row.claim_id))}
 for(const row of snapshot.claims){push(conceptClaims,row.subject,nodes.get(row.id));if(row.object!==row.subject)push(conceptClaims,row.object,nodes.get(row.id))}
 for(const row of snapshot.chunks)for(const id of row.members)push(conceptChunks,id,nodes.get(row.id));
 const buckets=new Map();
 for(const node of byKind.chunk){
  const row=node.record,id='bucket:'+row.chunk_kind+':'+row.state;
  if(!buckets.has(id))buckets.set(id,{id,kind:'bucket',title:(CHUNK_LABELS[row.chunk_kind]||row.chunk_kind||'其他组块')+' · '+(STATUS_LABELS[row.state]||row.state||'未分类'),record:{chunk_kind:row.chunk_kind,state:row.state},chunks:[]});
  buckets.get(id).chunks.push(node);
 }
 for(const bucket of buckets.values()){bucket.chunks.sort(labelSort);bucket.memberCount=new Set(bucket.chunks.flatMap(node=>node.record.members)).size}
 for(const rows of Object.values(byKind))rows.sort(labelSort);
 const searchRows=[];
 for(const node of nodes.values()){
  const row=node.record,exact=[node.title,row.label,...(row.aliases||[])].filter(Boolean).map(norm);
  const parts=[...exact,row.definition,row.statement,row.predicate,row.status,STATUS_LABELS[row.status],row.coverage];
  if(node.kind==='chunk')parts.push(CHUNK_LABELS[row.chunk_kind],STATUS_LABELS[row.state],...row.members.flatMap(id=>{
   const member=nodes.get(id)?.record;return member?[member.label,member.title,...(member.aliases||[])]:[];
  }));
  searchRows.push({node,exact,text:norm(parts.filter(Boolean).join(' '))});
 }
 function search(query='',kind='all'){
  const q=norm(query),terms=q.split(' ').filter(Boolean),hits=[];
  for(const item of searchRows){
   if(kind!=='all'&&item.node.kind!==kind)continue;
   if(terms.length&&!terms.every(term=>wordMatch(item.text,term)))continue;
   const score=q&&item.exact.includes(q)?100:q&&item.exact.some(value=>value.startsWith(q))?50:0;
   hits.push({...item.node,score});
  }
  return hits.sort((a,b)=>b.score-a.score||kindOrder[a.kind]-kindOrder[b.kind]||labelSort(a,b));
 }
 function related(node){
  if(!node)return [];
  if(node.kind==='bucket')return node.chunks;
  if(node.kind==='chunk')return node.record.members.map(id=>nodes.get(id));
  if(node.kind==='concept')return unique([...(conceptChunks.get(node.id)||[]),...(conceptClaims.get(node.id)||[])]);
  if(node.kind==='claim')return unique([nodes.get(node.record.subject),nodes.get(node.record.object),...(claimEvidence.get(node.id)||[]).map(row=>nodes.get(row.source_id))]);
  if(node.kind==='source')return unique(sourceClaims.get(node.id)||[]);
  return [];
 }
 function get(id){return nodes.get(id)||buckets.get(id)}
 function graph(id='',page=0,limit=80){
  limit=Math.max(8,Math.min(120,Math.trunc(limit)||80));
  let center=id?get(id):null,children=[],scope='',overview=!center,layered=false;
  if(overview){
   layered=byKind.chunk.length>60;
   children=layered?[...buckets.values()].sort(labelSort):byKind.chunk;
   scope=layered?'全部组块按类型与状态分层':'全部组块';
  }else if(center.kind==='concept'){
   children=unique([...(conceptClaims.get(id)||[]).map(node=>nodes.get(node.record.subject===id?node.record.object:node.record.subject)).filter(node=>node.id!==id),...(conceptChunks.get(id)||[])]).sort((a,b)=>kindOrder[a.kind]-kindOrder[b.kind]||labelSort(a,b));
   scope='与该概念直接相连的概念和组块';
  }else{children=related(center);scope=center.kind==='chunk'?'该组块的全部成员概念':center.kind==='bucket'?'该分层的全部组块':center.kind==='claim'?'该联系的概念端点和来源':'该来源关联的知识联系'}
  const capacity=overview?limit:limit-1,pages=Math.max(1,Math.ceil(children.length/capacity));
  page=Math.max(0,Math.min(pages-1,Math.trunc(page)||0));
  const visible=children.slice(page*capacity,(page+1)*capacity),graphNodes=center?[center,...visible]:visible,visibleIds=new Set(graphNodes.map(n=>n.id)),edges=[];
  if(center?.kind==='bucket')for(const node of visible)edges.push({id:'layer:'+node.id,type:'layer',source:id,target:node.id,label:'分层目录'});
  if(center?.kind==='chunk')for(const node of visible)edges.push({id:'member:'+node.id,type:'member',source:id,target:node.id,label:'组块成员'});
  if(center?.kind==='concept')for(const node of visible)if(node.kind==='chunk')edges.push({id:'member:'+node.id,type:'member',source:id,target:node.id,label:'组块成员'});
  const relevant=center?.kind==='chunk'?(center.record.claim_ids||[]).map(id=>nodes.get(id)):center?.kind==='concept'?(conceptClaims.get(id)||[]):[];
  for(const node of relevant){const row=node.record;if(row.subject!==row.object&&visibleIds.has(row.subject)&&visibleIds.has(row.object))edges.push({id:node.id,type:'claim',source:row.subject,target:row.object,label:relationLabel(row.predicate),claim_id:node.id,status:row.status,active:row.active})}
  if(center?.kind==='claim'){
   for(const node of visible)edges.push({id:'claim:'+node.id,type:node.kind==='source'?'evidence':'endpoint',source:id,target:node.id,label:node.kind==='source'?'证据出处':node.id===center.record.subject?'主语概念':'对象概念',claim_id:id,status:center.record.status,active:center.record.active});
  }
  if(center?.kind==='source')for(const node of visible)edges.push({id:'evidence:'+node.id,type:'evidence',source:id,target:node.id,label:'证据出处',claim_id:node.id,status:node.record.status,active:node.record.active});
  if(overview&&!layered){
   const pairs=new Map();
   for(const [concept,chunkNodes] of conceptChunks){
    const ids=chunkNodes.map(n=>n.id).filter(id=>visibleIds.has(id)).sort();
    for(let a=0;a<ids.length;a++)for(let b=a+1;b<ids.length;b++){
     const key=ids[a]+'|'+ids[b];if(!pairs.has(key))pairs.set(key,{id:'shared:'+key,type:'shared',source:ids[a],target:ids[b],concept_ids:[]});pairs.get(key).concept_ids.push(concept);
    }
   }
   for(const edge of pairs.values()){edge.label='共享 '+edge.concept_ids.length+' 个概念';edges.push(edge)}
  }
  return {nodes:graphNodes,edges,center,overview,layered,scope,total:children.length,shown:visible.length,page,pages,limit};
 }
 return {snapshot,nodes,byKind,buckets,evidence,conceptClaims,conceptChunks,claimEvidence,sourceClaims,get,search,related,graph};
}
