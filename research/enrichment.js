import {cleanEnrichment} from './enrichment-schema.js';
import {suggestMapping,resolveMapping,human} from './model.js?v=stable2';
export function mergeEnrichment(previous,raw){
 const old=cleanEnrichment(previous),next=cleanEnrichment(raw);if(!old)return next;if(!next)return old;
 // Source IDs are local to one lookup. Relabel collisions before combining evidence.
 const sources=[...old.sources],ids=new Map();
 for(const source of next.sources){
  const duplicate=sources.find(s=>s.url===source.url&&s.text===source.text&&s.type===source.type);
  if(duplicate){ids.set(source.id,duplicate.id);continue;}
  let id=source.id,n=1;while(sources.some(s=>s.id===id))id='lookup-'+n+++'-'+source.id.slice(0,40);
  ids.set(source.id,id);sources.push({...source,id});
 }
 const incomingReview=next.review?{...next.review,sourceId:ids.get(next.review.sourceId)}:null;
 const review=old.review?.parentName&&!incomingReview?.parentName?old.review:incomingReview||old.review;
 const points=[...new Map([...old.points,...next.points.map(p=>({...p,sourceId:ids.get(p.sourceId)}))].map(p=>[[p.space,...p.position,p.label].join('|'),p])).values()].slice(0,8);
 const required=new Set([review?.sourceId,...points.map(p=>p.sourceId)]);
 const retained=old.points.length&&!next.points.length||old.review?.parentName&&!incomingReview?.parentName;
 return cleanEnrichment({...next,canonicalName:next.canonicalName||old.canonicalName,aliases:[...new Set([...old.aliases,...next.aliases])],review,points,
  sources:[...sources.filter(s=>required.has(s.id)),...sources.filter(s=>!required.has(s.id))].slice(0,12),
  warnings:[...(retained?['本次检索未替换已有定位；保留此前来源支持的参考点或细胞示意（'+(old.checkedAt||'日期未记录')+'）。']:[]),...next.warnings]});
}
export function applyEnrichment(paper,rid,raw,entries){
 const region=paper.data.regions.find(r=>r.id===rid),enrichment=mergeEnrichment(paper.enrichments?.[rid],raw);if(!region||!enrichment)return paper;
 const mappings={...paper.mappings};
 if(!mappings[rid]?.target){
  const candidates=[enrichment.canonicalName,...enrichment.aliases].filter(Boolean).map(name=>suggestMapping({...region,name},entries)).filter(Boolean);
  const targets=[...new Set(candidates.map(m=>m.target))];
  if(targets.length===1)mappings[rid]=candidates[0];
 }
 return {...paper,mappings,enrichments:{...paper.enrichments,[rid]:enrichment}};
}
export function enrichmentPoints(paper,region,entries){
 const e=cleanEnrichment(paper.enrichments?.[region.id]);if(!e||paper.hiddenMarkers?.includes(region.id)||!human(region.species))return [];
 const common={recordId:paper.id+':'+region.id,paperId:paper.id,name:region.name,kind:region.level==='celltype'||region.level==='neuron'?'cell':'region'};
 if(common.kind==='cell'){
  const parent=e.review?.parentName;
  if(!parent||!human(e.review.parentSpecies)||!/(human|homo sapiens|人类)/i.test(e.review.quote)||!e.review.quote.toLowerCase().includes(parent.toLowerCase()))return [];
  const r={...region,level:'region',name:parent},m=suggestMapping(r,entries),parcels=resolveMapping(r,m,entries);
  // One labelled symbol per hemisphere. Never populate an inferred cloud of real neurons.
  const seen=new Set();return parcels.filter(p=>{if(seen.has(p.hemisphere))return false;seen.add(p.hemisphere);return true;}).map(p=>({...common,id:common.recordId+':'+p.hemisphere,position:p.center,anchorId:p.id,type:'cell-illustration',color:'#39b9ff',description:'细胞类型示意点，非真实神经元坐标；仅表示所属结构：'+parent,sourceId:e.review.sourceId}));
 }
 if(region.level!=='region'||region.hemisphere==='unknown')return [];
 return e.points.filter(p=>region.hemisphere==='both'||region.hemisphere==='L'&&p.position[0]<=0||region.hemisphere==='R'&&p.position[0]>=0).map((p,i)=>({...common,...p,id:common.recordId+':atlas'+i,type:'atlas-reference',color:'#7be3c1',description:'外部图谱显示参考点（不是激活峰或单神经元）。'+p.label}));
}
export function reuseKnownMappings(paper,previous,entries){
 let result=paper;
 const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 for(const region of paper.data.regions){
  if(result.mappings[region.id]?.target)continue;
  for(const old of previous){
   const match=old.data.regions.find(r=>norm(r.name)===norm(region.name));if(!match)continue;
   const learned=cleanEnrichment(old.enrichments?.[match.id]);if(!learned?.canonicalName)continue;
   // Reuse external terminology only, never transfer another paper's inference or cell/coordinate evidence.
   const termOnly={...learned,review:null,points:[],sources:learned.sources.filter(s=>s.type==='ontology'),note:'复用以前查到的术语定义；本篇实验结论仍以本篇原文为准。'};
   const next=applyEnrichment(result,region.id,termOnly,entries);
   if(next.mappings[region.id]?.target){result=next;break;}
  }
 }
 return result;
}
