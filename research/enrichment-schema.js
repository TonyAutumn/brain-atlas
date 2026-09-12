export const ENRICH_VERSION='lookup1';
export function cleanEnrichment(raw){
 if(!raw||typeof raw!=='object')return null;
 const text=(v,n=1600)=>typeof v==='string'?v.slice(0,n):'';
 const sources=(Array.isArray(raw.sources)?raw.sources:[]).slice(0,12).map(s=>{let url='';try{const u=new URL(s.url);if(u.protocol==='https:'&&['www.ebi.ac.uk','europepmc.org','pubmed.ncbi.nlm.nih.gov','siibra-api-stable.apps.hbp.eu'].includes(u.hostname))url=u.href;}catch{}return {id:text(s.id,60),title:text(s.title,300),url,text:text(s.text,6000),type:text(s.type,30)};}).filter(s=>s.url);
 const out={version:ENRICH_VERSION,status:['complete','partial','error'].includes(raw.status)?raw.status:'partial',checkedAt:text(raw.checkedAt,50),canonicalName:text(raw.canonicalName,300),aliases:(Array.isArray(raw.aliases)?raw.aliases:[]).filter(s=>typeof s==='string').slice(0,30).map(s=>s.slice(0,300)),sources,note:text(raw.note),warnings:(Array.isArray(raw.warnings)?raw.warnings:[]).slice(0,15).map(s=>text(s,300)),review:null,points:[]};
 if(raw.review&&sources.some(s=>s.id===raw.review.sourceId&&s.text.includes(raw.review.quote))&&raw.review.quote?.length>=15)out.review={sourceId:text(raw.review.sourceId,60),quote:text(raw.review.quote,1000),summary:text(raw.review.summary),parentSpecies:text(raw.review.parentSpecies,100),parentName:text(raw.review.parentName,200)};
 // Only structured atlas coordinates are eligible to be shown. Arbitrary model coordinates never enter this path.
 for(const p of (Array.isArray(raw.points)?raw.points:[]).slice(0,8)){
  if(p.kind!=='atlas-reference'||p.space!=='MNI152_2009c_nonlin_asym'||p.units!=='mm'||p.axes!=='RAS'||!sources.some(s=>s.id===p.sourceId&&s.type==='atlas')||!Array.isArray(p.position)||p.position.length!==3||!p.position.every(n=>Number.isFinite(n)&&Math.abs(n)<200))continue;
  out.points.push({kind:p.kind,position:p.position,space:p.space,units:p.units,axes:p.axes,sourceId:p.sourceId,label:text(p.label,300)});
 }
 return out;
}
