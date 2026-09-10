import {DMN,networkOf,recordKind} from './networks.js';
import {RULES,nameVariants,atlasName,atlasCode} from './mapping-rules.js';
import {NAV,inGroup} from '../anatomy/navigation.js?v=nav3';
import {describe} from '../anatomy/labels.js';
import {validateAnalysis,canonicalTheme,themeList} from './schema.js';
export {canonicalTheme,themeList};
export const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const aliases={
 hippocampus:'hippocampus',海马:'hippocampus',amygdala:'amygdala',杏仁核:'amygdala',insula:'insula',insularcortex:'insula',岛叶:'insula',thalamus:'thalamus',丘脑:'thalamus',frontalobe:'frontal',frontallobe:'frontal',额叶:'frontal',parietallobe:'parietal',顶叶:'parietal',temporallobe:'temporal',颞叶:'temporal',occipitallobe:'occipital',枕叶:'occipital',cerebellum:'cerebellum',小脑:'cerebellum',cingulatecortex:'cingulate',扣带皮层:'cingulate'
};
export function mappingOptions(entries){
 const options=RULES.filter(rule=>entries.some(e=>rule[2].includes(atlasCode(e)))).map(rule=>({value:'set:'+rule[0],label:rule[1].at(-1)+' · '+rule[0]+'（候选范围）'}));
 for(const id of Object.keys(NAV).filter(id=>!['all','unassigned','medial','deep','brainstem'].includes(id)))options.push({value:'group:'+id,label:NAV[id].label+'（已收录范围）'});
 options.unshift({value:'network:DMN',label:'DMN · 功能网络（仅角回参考位置）'});
 const seen=new Set();
 for(const e of entries){const key=e.atlas+'|'+e.name.replace(/^[LR] /,'').trim();if(seen.has(key))continue;seen.add(key);options.push({value:'parcel:'+e.id,label:describe(e).title+' · '+e.atlas});}
 return options;
}
export function suggestMapping(region,entries){
 if(networkOf(region)&&human(region.species)&&region.hemisphere!=='unknown')return {target:'network:DMN',hemisphere:region.hemisphere,confirmed:false};
 if(region.level!=='region'||!human(region.species)||region.hemisphere==='unknown')return null;
 const side=/^(left\s+|左侧)/i.test(region.name)?'L':/^(right\s+|右侧)/i.test(region.name)?'R':null;
 if(side&&side!==region.hemisphere)return null;
 const variants=nameVariants(region.name).map(normalize);
 const rule=RULES.find(rule=>rule[1].some(n=>variants.includes(normalize(n))));
 if(rule&&entries.some(e=>rule[2].includes(atlasCode(e))))return {target:'set:'+rule[0],hemisphere:region.hemisphere,confirmed:false};
 const found=entries.filter(e=>[atlasName(e),atlasCode(e),describe(e).title].some(s=>variants.includes(normalize(s))));
 const unique=[...new Set(found.map(e=>e.atlas+'|'+atlasName(e)))];
 if(unique.length===1)return {target:'parcel:'+found[0].id,hemisphere:region.hemisphere,confirmed:false};
 const groups=[...new Set(variants.map(n=>aliases[n]).filter(Boolean))];
 if(groups.length===1)return {target:'group:'+groups[0],hemisphere:region.hemisphere,confirmed:false};
 return null;
}
export function mappingExplanation(region,mapping,entries){
 if(networkOf(region))return DMN.note;
 if(region.level!=='region')return '细胞类型或单神经元缺少可用的个体坐标，保留文字证据。';
 if(/人类.*[/、]|[/、].*人类/.test(region.species))return '跨物种合并记录：需根据原文将人类与动物证据分开；不会把动物发现直接投到人脑中。';
 if(/raphe|coeruleus|pedunculopontine|dorsal tegmental/i.test(region.name))return '当前底座未收录该核团，保留机制记录；补充侧别也无法生成其真实几何。';
 if(!human(region.species))return '物种未确认为人类；不投射到人脑底座。';
 if(!mapping){if(region.hemisphere==='unknown')return '原文侧别未明确，不能自动猜测双侧；核对后可选择显示侧别。';return '名称存在歧义、尚无对应规则或当前图谱未收录；不会以附近脑区代替。';}
 const rule=RULES.find(r=>'set:'+r[0]===mapping.target);
 const detail=rule?(rule[3]||'根据中英文学名或缩写识别为已收录结构。'):mapping.target.startsWith('group:')?'大结构对应已收录分区集合，不表示每个亚区都在论文中被激活。':'名称与图谱标签对应，不代表受试者实际激活边界。';
 return (mapping.confirmed?'已人工核对。':'自动候选，尚未人工核对。')+detail+' 显示 '+resolveMapping(region,mapping,entries).length+' 个图谱条目。';
}
export function rematchPapers(papers,entries){
 let matched=0,remaining=0;
 const updated=papers.map(p=>{const mappings={...p.mappings};for(const r of p.data.regions){if(mappings[r.id]?.target)continue;const m=suggestMapping(r,entries);if(m&&resolveMapping(r,m,entries).length){mappings[r.id]=m;matched++;}else remaining++;}return {...p,mappings};});
 return {papers:updated,matched,remaining};
}
export function human(species){return /^(human|humans|homo sapiens|人|人类|成人|健康成人|人类被试)$/i.test((species||'').trim());}
export function resolveMapping(region,mapping,entries){
 if(!mapping||!['region','network'].includes(region.level)||!human(region.species)||!['L','R','both'].includes(mapping.hemisphere))return [];
 const [kind,...rest]=String(mapping.target||'').split(':'),id=rest.join(':');
 let found=[];
 if(kind==='network'&&id==='DMN'&&networkOf(region))found=entries.filter(e=>DMN.codes.includes(atlasCode(e)));
 if(kind==='group'&&NAV[id]&&recordKind(region)!=='network')found=entries.filter(e=>e.atlas!=='cit168'&&inGroup(e,id));
 if(kind==='set'&&recordKind(region)!=='network'){const rule=RULES.find(r=>r[0]===id);if(rule)found=entries.filter(e=>rule[2].includes(atlasCode(e)));}
 if(kind==='parcel'&&recordKind(region)!=='network'){
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
   if(!region||confirmedOnly&&(!mapping?.confirmed||recordKind(region)==='network'))continue;
   const parcels=resolveMapping(region,mapping,entries);if(!parcels.length)continue;
   const id=paper.id+':'+rid;mapped.set(rid,id);
   if(!nodes.some(n=>n.id===id))nodes.push({id,name:region.name,entryIds:parcels.map(e=>e.id),provisional:!mapping.confirmed,kind:recordKind(region),color:networkOf(region)?.color});
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
