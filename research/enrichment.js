import {cleanEnrichment} from './enrichment-schema.js';
import {suggestMapping,resolveMapping,human} from './model.js?v=lookup1';
export function applyEnrichment(paper,rid,raw,entries){
 const region=paper.data.regions.find(r=>r.id===rid),enrichment=cleanEnrichment(raw);if(!region||!enrichment)return paper;
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
