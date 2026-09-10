import {NAV,inGroup} from '../anatomy/navigation.js?v=nav3';
import {describe} from '../anatomy/labels.js';
import {validateAnalysis,canonicalTheme,themeList} from './schema.js';
export {canonicalTheme,themeList};
export const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const aliases={
 hippocampus:'hippocampus',海马:'hippocampus',amygdala:'amygdala',杏仁核:'amygdala',insula:'insula',insularcortex:'insula',岛叶:'insula',thalamus:'thalamus',丘脑:'thalamus',frontalobe:'frontal',frontallobe:'frontal',额叶:'frontal',parietallobe:'parietal',顶叶:'parietal',temporallobe:'temporal',颞叶:'temporal',occipitallobe:'occipital',枕叶:'occipital',cerebellum:'cerebellum',小脑:'cerebellum',anteriorcingulatecortex:'cingulate',acc:'cingulate',前扣带皮层:'cingulate'
};
export function mappingOptions(entries){
 const options=[];
 for(const id of Object.keys(NAV).filter(id=>!['all','unassigned','medial','deep','brainstem'].includes(id)))options.push({value:'group:'+id,label:NAV[id].label+'（已收录范围）'});
 const seen=new Set();
 for(const e of entries){const key=e.atlas+'|'+e.name.replace(/^[LR] /,'').trim();if(seen.has(key))continue;seen.add(key);options.push({value:'parcel:'+e.id,label:describe(e).title+' · '+e.atlas});}
 return options;
}
export function suggestMapping(region,entries){
 if(region.level!=='region'||!human(region.species)||region.hemisphere==='unknown')return null;
 const n=normalize(region.name);
 const found=entries.filter(e=>{
  const full=e.name.replace(/^[LR] /,'').trim(),code=full.startsWith('Area ')?full.slice(5).split(' (')[0]:full.split(' (')[0];
  return [full,code,describe(e).title].some(s=>normalize(s)===n);
 });
 const unique=[...new Set(found.map(e=>e.atlas+'|'+e.name.replace(/^[LR] /,'').trim()))];
 if(unique.length===1)return {target:'parcel:'+found[0].id,hemisphere:region.hemisphere,confirmed:false};
 if(aliases[n])return {target:'group:'+aliases[n],hemisphere:region.hemisphere,confirmed:false};
 return null;
}
export function human(species){return /^(human|humans|homo sapiens|人|人类|成人|健康成人|人类被试)$/i.test((species||'').trim());}
export function resolveMapping(region,mapping,entries){
 if(!mapping||region.level!=='region'||!human(region.species)||!['L','R','both'].includes(mapping.hemisphere))return [];
 const [kind,...rest]=String(mapping.target||'').split(':'),id=rest.join(':');
 let found=[];
 if(kind==='group'&&NAV[id])found=entries.filter(e=>e.atlas!=='cit168'&&inGroup(e,id));
 if(kind==='parcel'){
  const anchor=entries.find(e=>e.id===id);if(!anchor)return [];
  const name=anchor.name.replace(/^[LR] /,'').trim();
  found=entries.filter(e=>e.atlas===anchor.atlas&&e.name.replace(/^[LR] /,'').trim()===name);
 }
 return found.filter(e=>mapping.hemisphere==='both'||e.hemisphere===mapping.hemisphere||e.hemisphere==='M');
}
export function createPaper(analysis,entries,extra={}){
 const data=validateAnalysis(analysis),id=crypto.randomUUID();
 const mappings=Object.fromEntries(data.regions.map(r=>[r.id,suggestMapping(r,entries)]));
 return {id,data,mappings,reviewed:false,learned:false,createdAt:new Date().toISOString(),...extra};
}
export function mechanismRows(papers){return papers.flatMap(paper=>paper.data.mechanisms.map(mechanism=>({key:paper.id+':'+mechanism.id,paper,mechanism})));}
export function evidenceScene(rows,entries,{confirmedOnly=false}={}){
 const nodes=[],links=[];
 for(const {key,paper,mechanism:m}of rows){
  const mapped=new Map();
  for(const rid of m.regions){
   const region=paper.data.regions.find(r=>r.id===rid),mapping=paper.mappings[rid];
   if(!region||confirmedOnly&&!mapping?.confirmed)continue;
   const parcels=resolveMapping(region,mapping,entries);if(!parcels.length)continue;
   const id=paper.id+':'+rid;mapped.set(rid,id);
   if(!nodes.some(n=>n.id===id))nodes.push({id,name:region.name,entryIds:parcels.map(e=>e.id),provisional:!mapping.confirmed});
  }
  for(const c of m.connections)if(mapped.has(c.from)&&mapped.has(c.to))links.push({id:key,from:mapped.get(c.from),to:mapped.get(c.to),kind:m.evidenceType,label:m.title,directed:c.directed,provisional:!paper.reviewed});
 }
 return {nodes,links};
}
export function validateBackup(raw,entries){
 if(raw?.version!==1||!Array.isArray(raw.papers)||raw.papers.length>1000)throw Error('这不是受支持的文献库备份。');
 const papers=raw.papers.map(p=>{
  if(typeof p.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(p.id))throw Error('文献编号无效。');
  const data=validateAnalysis(p.data),mappings={};
  for(const r of data.regions){const m=p.mappings?.[r.id];mappings[r.id]=m&&resolveMapping(r,m,entries).length?{target:m.target,hemisphere:m.hemisphere,confirmed:m.confirmed===true}:null;}
  return {id:p.id,data,mappings,reviewed:p.reviewed===true,learned:p.learned===true,createdAt:typeof p.createdAt==='string'?p.createdAt:new Date().toISOString(),source:typeof p.source==='string'?p.source.slice(0,180000):'',fileName:typeof p.fileName==='string'?p.fileName.slice(0,300):'',model:typeof p.model==='string'?p.model.slice(0,100):'',figureNames:Array.isArray(p.figureNames)?p.figureNames.filter(v=>typeof v==='string').slice(0,3).map(v=>v.slice(0,300)):[],warnings:Array.isArray(p.warnings)?p.warnings.filter(v=>typeof v==='string').slice(0,10).map(v=>v.slice(0,1000)):[],fingerprint:typeof p.fingerprint==='string'?p.fingerprint.slice(0,128):'',usage:p.usage&&typeof p.usage.total_tokens==='number'?{total_tokens:p.usage.total_tokens}:null};
 });
 if(new Set(papers.map(p=>p.id)).size!==papers.length)throw Error('备份包含重复文献编号。');
 return {version:1,themes:themeList([...(Array.isArray(raw.themes)?raw.themes:[]),...papers.flatMap(p=>p.data.themes)]),papers};
}
