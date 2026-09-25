import {cleanEnrichment} from './enrichment-schema.js';
import {cleanMapping,cleanMappingHistory} from './mapping-state.js?v=epithalamus1';
import {DMN,networkOf,recordKind} from './networks.js';
import {RULES,nameVariants,atlasName,atlasCode} from './mapping-rules.js?v=epithalamus1';
import {NAV,inGroup,mappingGroups} from '../anatomy/navigation.js?v=epithalamus1';
import {describe} from '../anatomy/labels.js?v=epithalamus1';
import {validateAnalysis,canonicalTheme,themeList} from './schema.js?v=epithalamus1';
export {canonicalTheme,themeList};
export const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const aliases={
 epithalamus:"epithalamus",上丘脑:"epithalamus",
 hippocampus:'hippocampus',hippocampalformation:'hippocampus',海马:'hippocampus',海马结构:'hippocampus',
 amygdala:'amygdala',amygdaloidcomplex:'amygdala',杏仁核:'amygdala',
 insula:'insula',insularcortex:'insula',anteriorinsula:'insula',posteriorinsula:'insula',岛叶:'insula',前岛叶:'insula',后岛叶:'insula',
 thalamus:'thalamus',丘脑:'thalamus',
 frontalobe:'frontal',frontallobe:'frontal',prefrontalcortex:'frontal_prefrontal',pfc:'frontal_prefrontal',dorsolateralprefrontalcortex:'frontal_prefrontal',dlpfc:'frontal_prefrontal',ventrolateralprefrontalcortex:'frontal_prefrontal',vlpfc:'frontal_prefrontal',额叶:'frontal',前额叶:'frontal_prefrontal',背外侧前额叶:'frontal_prefrontal',腹外侧前额叶:'frontal_prefrontal',
 motorcortex:'frontal_motor',premotorcortex:'frontal_motor',运动皮层:'frontal_motor',前运动皮层:'frontal_motor',
 parietallobe:'parietal',顶叶:'parietal',superiorparietallobule:'parietal_superior',inferiorparietallobule:'parietal_inferior',顶上小叶:'parietal_superior',顶下小叶:'parietal_inferior',
 temporallobe:'temporal',颞叶:'temporal',auditorycortex:'temporal_auditory',听觉皮层:'temporal_auditory',superiortemporalgyrus:'temporal_superior',superiortemporalsulcus:'temporal_superior',颞上回:'temporal_superior',颞上沟:'temporal_superior',
 occipitallobe:'occipital',visualcortex:'occipital',extrastriatecortex:'occipital_extra',枕叶:'occipital',视觉皮层:'occipital',纹外视觉皮层:'occipital_extra',
 cerebellum:'cerebellum',cerebellarcortex:'cerebellar_lobules',小脑:'cerebellum',小脑皮层:'cerebellar_lobules',
 cingulatecortex:'cingulate',扣带皮层:'cingulate',
 basalganglia:'basal',basalnuclei:'basal',基底神经节:'basal',striatum:'dorsal_striatum',dorsalstriatum:'dorsal_striatum',纹状体:'dorsal_striatum',背侧纹状体:'dorsal_striatum',ventralstriatum:'ventral_striatum',腹侧纹状体:'ventral_striatum',ventralbasalganglia:'ventral_basal_ganglia',腹侧基底神经节:'ventral_basal_ganglia',
 basalforebrain:'forebrain',基底前脑:'forebrain',subthalamus:'subthalamus',丘脑底区:'subthalamus',midbrain:'midbrain',中脑:'midbrain'
};
export function mappingOptions(entries){
 const options=RULES.filter(rule=>entries.some(e=>rule[2].includes(atlasCode(e)))).map(rule=>({value:'set:'+rule[0],label:rule[1].at(-1)+' · '+rule[0]+'（候选范围）'}));
 for(const id of new Set([...mappingGroups(),...Object.values(aliases)]))if(NAV[id])options.push({value:'group:'+id,label:NAV[id].label+'（已收录范围）'});
 options.unshift({value:'network:DMN',label:'DMN · 功能网络（仅角回参考位置）'});
 const seen=new Set();
 for(const e of entries){const key=e.atlas+'|'+e.name.replace(/^[LR] /,'').trim();if(seen.has(key))continue;seen.add(key);options.push({value:'parcel:'+e.id,label:describe(e).title+' · '+e.atlas});}
 return options;
}
export function suggestMapping(region,entries){
 const side=/^(left\s+|左侧)/i.test(region.name)?'L':/^(right\s+|右侧)/i.test(region.name)?'R':/^(bilateral\s+|双侧)/i.test(region.name)?'both':/^(midline\s+|中线)/i.test(region.name)?'M':null;
 const hemisphere=region.hemisphere==='unknown'&&side?side:region.hemisphere;
 if(networkOf(region)&&human(region.species))return {target:'network:DMN',hemisphere,confirmed:false};
 if(region.level!=='region'||!human(region.species))return null;
 if(side&&region.hemisphere!=='unknown'&&side!==region.hemisphere)return null;
 const variants=nameVariants(region.name).map(normalize);
 const rule=RULES.find(rule=>rule[1].some(n=>variants.includes(normalize(n))));
 if(rule?.[0]==='pineal'&&!['unknown','M'].includes(hemisphere))return null;
 if(rule&&entries.some(e=>rule[2].includes(atlasCode(e))))return {target:'set:'+rule[0],hemisphere,confirmed:false};
 const found=entries.filter(e=>[atlasName(e),atlasCode(e),describe(e).title].some(s=>variants.includes(normalize(s))));
 const unique=[...new Set(found.map(e=>e.atlas+'|'+atlasName(e)))];
 if(unique.length===1)return {target:'parcel:'+found[0].id,hemisphere,confirmed:false};
 const groups=[...new Set(variants.map(n=>aliases[n]).filter(Boolean))];
 if(groups.length===1)return {target:'group:'+groups[0],hemisphere,confirmed:false};
 return null;
}
export function mappingExplanation(region,mapping,entries){
 if(networkOf(region))return DMN.note;
 if(region.level!=='region')return '细胞类型或单神经元缺少可用的个体坐标，保留文字证据。';
 if(/人类.*[/、]|[/、].*人类/.test(region.species))return '跨物种合并记录：需根据原文将人类与动物证据分开；不会把动物发现直接投到人脑中。';
 if(/raphe|coeruleus|pedunculopontine|dorsal tegmental/i.test(region.name))return '当前底座未收录该核团，保留机制记录；补充侧别也无法生成其真实几何。';
 if(!human(region.species))return '物种未确认为人类；不投射到人脑底座。';
 if(!mapping)return '名称存在歧义、尚无对应规则或当前图谱未收录；将进入联网补全队列，不会用附近脑区代替。';
 const candidates=resolveMappingCandidate(region,mapping,entries);
 if(!candidates.length)return '已有对应已保存：'+mapping.target+'，但当前图谱没有可解析的候选范围；记录不会因此被清空。';
 if(mapping.hemisphere==='unknown')return `已建立解剖候选：${mapping.target}，对应 ${candidates.length} 个图谱条目。原文侧别未明确；参考模式可显示候选，证据模式暂不高亮。中线结构可在核对原文后选择“中线”。`;
 const rule=RULES.find(r=>'set:'+r[0]===mapping.target);
 const detail=rule?(rule[3]||'根据中英文学名或缩写识别为已收录结构。'):mapping.target.startsWith('group:')?'大结构对应已收录分区集合，不表示每个亚区都在论文中被激活。':'名称与图谱标签对应，不代表受试者实际激活边界。';
 return (mapping.confirmed?'已人工核对。':'自动候选，尚未人工核对。')+detail+' 显示 '+resolveMapping(region,mapping,entries).length+' 个图谱条目。';
}
export function rematchPapers(papers,entries){
 let matched=0,remaining=0;
 const updated=papers.map(p=>{const mappings={...p.mappings};for(const r of p.data.regions){
  if(mappings[r.id]?.target)continue;
  const old=[...(p.mappingHistory||[])].reverse().map(h=>cleanMapping(h.mappings?.[r.id])).find(m=>m&&resolveMappingCandidate(r,m,entries).length);
  const enrichment=cleanEnrichment(p.enrichments?.[r.id]);
  const candidates=[r.name,enrichment?.canonicalName,...(enrichment?.aliases||[])].filter(Boolean).map(name=>suggestMapping({...r,name},entries)).filter(m=>m&&resolveMappingCandidate(r,m,entries).length);
  const m=old||([...new Set(candidates.map(m=>m.target))].length===1?candidates[0]:null);
  if(m){mappings[r.id]=m;matched++;}else remaining++;
 }return {...p,mappings};});
 return {papers:updated,matched,remaining};
}
export function human(species){
 const value=String(species||'').normalize('NFKC').toLowerCase().trim();
 if(!value||/(mouse|mice|murine|rat|macaque|monkey|rodent|nonhuman|animal|小鼠|大鼠|小型猪|猕猴|猴|动物)/i.test(value))return false;
 return /(human|humans|homo sapiens|人类|成人|患者|被试|受试者|健康人)/i.test(value)||value==='人';
}
export function resolveMappingCandidate(region,mapping,entries){
 if(!mapping||!['region','network'].includes(region.level)||!human(region.species)||!['L','R','both','M','unknown'].includes(mapping.hemisphere))return [];
 const [kind,...rest]=String(mapping.target||'').split(':'),id=rest.join(':');
 let found=[];
 if(kind==='network'&&id==='DMN'&&networkOf(region))found=entries.filter(e=>DMN.codes.includes(atlasCode(e)));
 if(kind==='group'&&NAV[id]&&recordKind(region)!=='network')found=entries.filter(e=>(id==='epithalamus'||e.atlas!=='cit168')&&inGroup(e,id));
 if(kind==='set'&&recordKind(region)!=='network'){const rule=RULES.find(r=>r[0]===id);if(rule)found=entries.filter(e=>rule[2].includes(atlasCode(e)));}
 if(kind==='parcel'&&recordKind(region)!=='network'){
  const anchor=entries.find(e=>e.id===id);if(!anchor)return [];
  const name=anchor.name.replace(/^[LR] /,'').trim();
  found=entries.filter(e=>e.atlas===anchor.atlas&&e.name.replace(/^[LR] /,'').trim()===name);
 }
 // The new pineal organ has no lateral pair. Preserve legacy AAL midline mappings.
 if(found.length&&found.every(e=>e.atlas==='allen2020'&&e.hemisphere==='M')&&!['unknown','M'].includes(mapping.hemisphere))return [];
 // Explicit midline applies only to a midline mesh; never create left/right copies.
 return mapping.hemisphere==='unknown'?found:found.filter(e=>mapping.hemisphere==='M'?e.hemisphere==='M':mapping.hemisphere==='both'||e.hemisphere===mapping.hemisphere||e.hemisphere==='M');
}
export function resolveMapping(region,mapping,entries){
 if(mapping?.hemisphere==='unknown')return [];
 return resolveMappingCandidate(region,mapping,entries);
}
export function createPaper(analysis,entries,extra={}){
 const data=validateAnalysis(analysis),id=crypto.randomUUID();
 const mappings=Object.fromEntries(data.regions.map(r=>[r.id,suggestMapping(r,entries)]));
 return {id,data,mappings,reviewed:false,learned:false,createdAt:new Date().toISOString(),...extra};
}
export function mechanismRows(papers){return papers.flatMap(paper=>paper.data.mechanisms.map(mechanism=>({key:paper.id+':'+mechanism.id,paper,mechanism})));}
// Include records without a mechanism link in the overview, without inventing edges.
export function overviewRows(papers){return papers.flatMap(paper=>[...mechanismRows([paper]),{key:paper.id+':records',paper,mechanism:{regions:paper.data.regions.map(r=>r.id),connections:[]}}]);}
export function evidenceScene(rows,entries,{confirmedOnly=false,referenceMode=false}={}){
 const nodes=[],links=[];
 for(const {key,paper,mechanism:m,pointRecords=[]}of rows){
  const mapped=new Map();
  for(const rid of m.regions){
   const region=paper.data.regions.find(r=>r.id===rid),mapping=paper.mappings[rid];
   if(!region||confirmedOnly&&(!mapping?.confirmed||recordKind(region)==='network'))continue;
   const parcels=referenceMode?resolveMappingCandidate(region,mapping,entries):resolveMapping(region,mapping,entries);if(!parcels.length&&(confirmedOnly||!pointRecords.includes(rid)))continue;
   const id=paper.id+':'+rid;mapped.set(rid,id);
   if(!nodes.some(n=>n.id===id))nodes.push({id,name:region.name,entryIds:parcels.map(e=>e.id),reference:!parcels.length,provisional:!mapping?.confirmed,kind:recordKind(region),color:networkOf(region)?.color});
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
  for(const r of data.regions)mappings[r.id]=cleanMapping(p.mappings?.[r.id]);
  return {id:p.id,data,mappings,mappingHistory:cleanMappingHistory(p.mappingHistory,data.regions.map(r=>r.id)),enrichments:Object.fromEntries(data.regions.map(r=>[r.id,cleanEnrichment(p.enrichments?.[r.id])]).filter(([,v])=>v)),hiddenMarkers:Array.isArray(p.hiddenMarkers)?p.hiddenMarkers.filter(id=>data.regions.some(r=>r.id===id)):[],reviewed:p.reviewed===true,learned:p.learned===true,createdAt:typeof p.createdAt==='string'?p.createdAt:new Date().toISOString(),source:typeof p.source==='string'?p.source.slice(0,180000):'',fileName:typeof p.fileName==='string'?p.fileName.slice(0,300):'',model:typeof p.model==='string'?p.model.slice(0,100):'',figureNames:Array.isArray(p.figureNames)?p.figureNames.filter(v=>typeof v==='string').slice(0,3).map(v=>v.slice(0,300)):[],warnings:Array.isArray(p.warnings)?p.warnings.filter(v=>typeof v==='string').slice(0,10).map(v=>v.slice(0,1000)):[],fingerprint:typeof p.fingerprint==='string'?p.fingerprint.slice(0,128):'',usage:p.usage&&typeof p.usage.total_tokens==='number'?{total_tokens:p.usage.total_tokens}:null};
 });
 if(new Set(papers.map(p=>p.id)).size!==papers.length)throw Error('备份包含重复文献编号。');
 return {version:1,themes:themeList([...(Array.isArray(raw.themes)?raw.themes:[]),...papers.flatMap(p=>p.data.themes)]),papers};
}
