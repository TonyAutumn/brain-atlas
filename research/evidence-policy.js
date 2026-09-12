import {sourceScreen,quoteProof,mentionsRegion} from './source-proof.js';
import {resolveMapping,human,normalize} from './model.js?v=evidence1';
import {RULES,nameVariants} from './mapping-rules.js';
import {recordKind} from './networks.js';
import {enrichmentPoints} from './enrichment.js?v=evidence1';
export const EVIDENCE_POLICY='atlas-evidence-v1';
const cache=new WeakMap();
function aliases(region){const variants=nameVariants(region.name).map(normalize);return RULES.filter(rule=>rule[1].some(n=>variants.includes(normalize(n)))).flatMap(rule=>rule[1]);}
function namedInProof(proof,region){
 const names=aliases(region);
 if(proof.fragments.some(s=>mentionsRegion(s,region,names)))return true;
 // Resolve a local anaphor such as "right junction" only using the immediately preceding definition.
 return /\b(?:junction|region|area|site)s?\b|该脑区|该区域/.test(proof.fragments.join(' '))&&mentionsRegion(proof.prefix,region,names);
}
export function curateMechanism(paper,mechanism,entries){
 const base={key:paper.id+':'+mechanism.id,paper,original:mechanism,mechanism,eligibleRegions:[],lookupRegions:[],pointRecords:[],omitted:[],edgeWarnings:[]};
 const screen=sourceScreen(mechanism,paper.source);
 if(screen.status!=='supported')return {...base,...screen};
 const regions=mechanism.regions.map(id=>paper.data.regions.find(r=>r.id===id)).filter(Boolean);
 for(const region of regions){
  if(!namedInProof(screen.proof,region)){base.omitted.push(region.name+'：摘录未支持这个脑区');continue;}
  if(!human(region.species)){base.omitted.push(region.name+'：人类与动物证据未分开');continue;}
  if(recordKind(region)!=='region'){base.omitted.push(region.name+'：当前仅有网络参考或细胞示意，不能作为实测脑区定位');continue;}
  if(region.hemisphere==='unknown'&&!['L','R','both'].includes(paper.mappings[region.id]?.hemisphere)){base.omitted.push(region.name+'：原文侧别待核对');continue;}
  const parcels=resolveMapping(region,paper.mappings[region.id],entries),points=enrichmentPoints(paper,region,entries).filter(p=>p.type==='atlas-reference');
  if(parcels.length||points.length){base.eligibleRegions.push(region.id);if(!parcels.length)base.pointRecords.push(region.id);}else base.lookupRegions.push(region.id);
 }
 if(!base.eligibleRegions.length){return {...base,status:base.lookupRegions.length?'location':'evidence',reason:base.lookupRegions.length?'有原文支持，等待可靠的图谱对应':base.omitted.join('；')||'未识别到有原文支持的人脑定位'};}
 const kept=new Set(base.eligibleRegions),connections=[];
 for(const edge of mechanism.connections){
  const from=regions.find(r=>r.id===edge.from),to=regions.find(r=>r.id===edge.to);
  if(!kept.has(edge.from)||!kept.has(edge.to)){base.edgeWarnings.push('连接端点不完整，未画连线');continue;}
  const proof=quoteProof(edge.quote,paper.source);
  if(!proof||!mentionsRegion(proof.fragments.join(' '),from,aliases(from))||!mentionsRegion(proof.fragments.join(' '),to,aliases(to))){base.edgeWarnings.push('未提供明确支持两端关系的原文摘录，未画连线');continue;}
  if(!/connect|projection|project(?:s|ed|ing)? to|correlat|coupl|influenc|tract|pathway|驱动|投射|连接|耦合|相关|通路/i.test(proof.fragments.join(' '))){base.edgeWarnings.push('摘录未明确报告脑区间关系，未画连线');continue;}
  if(/not (?:significantly )?correlated|no (?:significant )?(?:connectivity|connection|correlation)|未发现.{0,10}(?:连接|相关)|不存在.{0,10}(?:连接|投射)/i.test(proof.fragments.join(' '))){base.edgeWarnings.push('原文为未发现关系的结果，保留节点而不绘制连接');continue;}
  // Until direction is independently checked, preserve the reported relationship without asserting an arrow.
  connections.push({...edge,directed:false});
 }
 return {...base,status:'ready',proof:screen.proof,reason:'通过定位与摘录筛选，实验含义仍需核对',mechanism:{...mechanism,regions:base.eligibleRegions,connections}};
}
export function curatePaper(paper,entries){
 const previous=cache.get(paper);if(previous?.entries===entries)return previous.result;
 const seen=new Set(),rows=paper.data.mechanisms.map(m=>curateMechanism(paper,m,entries));
 for(const row of rows)if(row.status==='ready'){
  const key=JSON.stringify([row.mechanism.regions.slice().sort(),row.mechanism.connections,row.mechanism.evidenceType,row.mechanism.behavior||row.mechanism.title,row.mechanism.finding||row.mechanism.claim,row.proof.fragments]);
  if(seen.has(key)){row.status='duplicate';row.reason='与已保留条目使用相同定位及摘录';}else seen.add(key);
 }
 const result={ready:rows.filter(r=>r.status==='ready'),excluded:rows.filter(r=>r.status!=='ready'),rows,lookupRegions:[...new Set(rows.flatMap(r=>r.lookupRegions))]};
 cache.set(paper,{entries,result});return result;
}
export function curatedRows(papers,entries){return papers.flatMap(p=>curatePaper(p,entries).ready);}
