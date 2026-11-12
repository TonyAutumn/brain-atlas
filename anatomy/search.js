import {NAV,pathFor,navigationFor} from './navigation.js?v=epithalamus1';
import {describe} from './labels.js?v=functional2';
import {RULES,atlasCode} from '../research/mapping-rules.js?v=epithalamus1';
import {parcelAliases} from './structure-catalog.js?v=epithalamus1';
import {conceptCoverage} from './geometry-links.js?v=epithalamus1';
import {OLFACTORY_PRESETS} from './olfactory-circuit.js?v=olfactory1';
import {NETWORKS,networkEntries,isFunctional,describeFunctional} from '../research/networks.js?v=olfactory1';
import {CONCEPT_TERMS,parcelVocabulary,functionalVocabulary,networkVocabulary} from './search-vocabulary.js?v=aliases1';
export {conceptCoverage};
export const normalizeSearch=value=>String(value||'').normalize('NFKC').toLowerCase()
 .replace(/['’]s\b/g,'').replace(/['’]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
const compact=s=>s.replaceAll(' ','');
// Never inherit a sibling's abbreviation (LGN != MGN, MD != MV).
const ALIAS_GROUPS=new Set(['substantia_nigra','red_nucleus','ventral_tegmental','subthalamic_nucleus','zona_incerta','nucleus_accumbens','ventral_pallidum','putamen','caudate','parabrachial_pigmented','habenular_complex','pineal_gland']);
const prepared=new WeakMap();
function score(q,fields){
 const qc=compact(q);if(!qc)return 0;
 const short=/^[a-z0-9]{1,3}$/.test(qc)||/^(?:ba|ca|hoc|hip|op|fg)\d+[a-z]*$/.test(qc);
 if(!prepared.has(fields))prepared.set(fields,fields.map(normalizeSearch).filter(Boolean).map(f=>({f,fc:compact(f),tokens:f.split(' ')})));
 let best=0;
 for(const {fc,tokens} of prepared.get(fields)){
  if(fc===qc){best=Math.max(best,100);continue;}
  if(short){if(tokens.includes(q)||tokens.includes(qc))best=Math.max(best,85);continue;}
  if(fc.startsWith(qc))best=Math.max(best,75);
  else if(fc.includes(qc))best=Math.max(best,60);
  else if(q.split(' ').every(word=>tokens.some(token=>token.startsWith(word))))best=Math.max(best,45);
 }
 return best;
}
export function createSearchIndex(entries,{includePresets=true}={}){
 const anatomical=entries.filter(e=>e.atlas!=='surface'&&!isFunctional(e));
 const concepts=Object.entries(NAV).filter(([id])=>id!=='all'&&!['unassigned','midbrain_other','amygdala_other'].includes(id)).map(([id,n])=>{
  const coverage=conceptCoverage(id,anatomical);
  return {kind:'concept',id,label:n.label,fields:[n.label,n.english,...n.aliases,...(CONCEPT_TERMS[id]||[])],path:pathFor(id).map(p=>NAV[p].label).join(' › '),parcels:coverage.parcels.map(e=>e.id),coverageLabel:coverage.label,partial:coverage.partial};
 });
 const parcels=entries.filter(e=>e.atlas!=='surface').map(e=>{
  if(isFunctional(e)){
   const text=describeFunctional(e);
   return {kind:'parcel',id:e.id,label:text.title,atlas:e.atlas,hemisphere:e.hemisphere,fields:[text.title,...functionalVocabulary(e,NETWORKS)],path:'Schaefer 200 · Yeo 7 / 17 功能分区'};
  }
  const group=e.nav||navigationFor(e),nav=NAV[group],text=describe(e);
  return {kind:'parcel',id:e.id,label:text.title,atlas:e.atlas,hemisphere:e.hemisphere,fields:[e.name,e.name.replace(/^[LR] /,'').trim(),text.title,String(e.label??''),...RULES.filter(r=>r[2].includes(atlasCode(e))).flatMap(r=>r[1]),...parcelAliases(e),...parcelVocabulary(e),nav?.label,nav?.english,...(ALIAS_GROUPS.has(group)?nav.aliases:[])],path:pathFor(group).map(p=>NAV[p].label).join(' › ')};
 });
 const choices=[...OLFACTORY_PRESETS,...(entries.some(isFunctional)?NETWORKS:[])];
 const presets=includePresets?choices.map(p=>({kind:'preset',id:p.id,label:p.label,fields:networkVocabulary(p),parcels:networkEntries(p,entries).map(e=>e.id),coverageLabel:'组合参考',path:p.scope})):[];
 return [...concepts,...parcels,...presets];
}
// Explicit query laterality is separate from the page's display-side filter.
function queryParts(value){
 let query=normalizeSearch(value),hemisphere=null;
 const side={'left':'L','lh':'L','l':'L','左':'L','左侧':'L','左半球':'L','right':'R','rh':'R','r':'R','右':'R','右侧':'R','右半球':'R','midline':'M','中线':'M'};
 const prefix=query.match(/^(left|right|lh|rh|l|r)\s+(.+)$/)||query.match(/^(左半球|右半球|左侧|右侧|中线|左|右)\s*(.+)$/);
 const suffix=query.match(/^(.+)\s+(left|right|lh|rh|l|r)$/);
 if(prefix){hemisphere=side[prefix[1]];query=prefix[2];}
 else if(suffix){hemisphere=side[suffix[2]];query=suffix[1];}
 return {query,hemisphere};
}
export function searchAtlas(query,index){
 const parts=queryParts(query),rank={concept:0,preset:1,parcel:2};
 return index.filter(item=>!parts.hemisphere||item.kind==='parcel'&&item.hemisphere===parts.hemisphere)
 .map(item=>({...item,score:score(parts.query,item.fields)})).filter(item=>item.score>0)
 .sort((a,b)=>b.score-a.score||rank[a.kind]-rank[b.kind]||a.label.localeCompare(b.label,'zh-CN')||a.id.localeCompare(b.id));
}
