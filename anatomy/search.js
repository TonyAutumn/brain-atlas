import {NAV,pathFor,navigationFor,inGroup} from './navigation.js?v=search1';
import {describe} from './labels.js';
import {RULES,atlasCode} from '../research/mapping-rules.js';
import {parcelAliases} from './structure-catalog.js';
export const normalizeSearch=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
const compact=s=>s.replaceAll(' ','');
function score(query,fields){
 const q=normalizeSearch(query),qc=compact(q);if(!qc)return 0;
 const short=/^[a-z0-9]{1,3}$/.test(qc);
 let best=0;
 for(const field of fields){
  const f=normalizeSearch(field),fc=compact(f);if(!fc)continue;
  if(fc===qc){best=Math.max(best,100);continue;}
  // Short abbreviations match whole tokens, never arbitrary substrings (IC != Julich).
  if(short){if(f.split(' ').includes(q))best=Math.max(best,85);continue;}
  if(fc.startsWith(qc))best=Math.max(best,75);
  else if(fc.includes(qc))best=Math.max(best,60);
  else if(q.split(' ').every(word=>f.split(' ').some(token=>token.startsWith(word))))best=Math.max(best,45);
 }
 return best;
}
export function createSearchIndex(entries){
 const concepts=Object.entries(NAV).filter(([id])=>id!=='all'&&!['unassigned','midbrain_other','amygdala_other'].includes(id)).map(([id,n])=>({kind:'concept',id,label:n.label,fields:[n.label,n.english,...n.aliases],path:pathFor(id).map(p=>NAV[p].label).join(' › '),parcels:entries.filter(e=>inGroup(e,id)).map(e=>e.id)}));
 const parcels=entries.filter(e=>e.atlas!=='surface').map(e=>{
  const nav=NAV[e.nav||navigationFor(e)],text=describe(e);
  return {kind:'parcel',id:e.id,label:text.title,atlas:e.atlas,hemisphere:e.hemisphere,fields:[e.name,e.name.replace(/^[LR] /,'').trim(),text.title,String(e.label??''),...RULES.filter(r=>r[2].includes(atlasCode(e))).flatMap(r=>r[1]),...parcelAliases(e),nav?.label,nav?.english,...(nav?.aliases||[])],path:pathFor(e.nav||navigationFor(e)).map(p=>NAV[p].label).join(' › ')};
 });
 return [...concepts,...parcels];
}
// Search is intentionally independent of the rendering source, hemisphere and learned filter.
export function searchAtlas(query,index){
 return index.map(item=>({...item,score:score(query,item.fields)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||(a.kind===b.kind?0:a.kind==='concept'?-1:1)||a.label.localeCompare(b.label,'zh-CN')||a.id.localeCompare(b.id));
}
export function conceptCoverage(group,entries){
 const parcels=entries.filter(e=>e.atlas!=='surface'&&inGroup(e,group));
 return {parcels,sources:[...new Set(parcels.map(e=>e.atlas))],hasGeometry:parcels.length>0};
}
