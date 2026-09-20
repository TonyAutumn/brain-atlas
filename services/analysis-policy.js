import {sourceScreen,quoteProof,mentionsRegion} from '../research/source-proof.js';
// The worker can check source support; the browser checks availability in its actual atlas.
function humanSource(species){
 const value=String(species||'').normalize('NFKC').toLowerCase().trim();
 return !/(mouse|mice|murine|rat|macaque|monkey|rodent|nonhuman|animal|小鼠|大鼠|猕猴|猴|动物)/i.test(value)&&/(human|humans|homo sapiens|人类|成人|患者|被试|受试者|健康人)/i.test(value);
}
export function screenAtlasAnalysis(analysis,source){
 const mechanisms=[],catalogIds=new Set();
 for(const m of analysis.mechanisms){
  const proof=quoteProof(m.quote,source),screen=sourceScreen(m,source);
  const ids=m.regions.filter(id=>{
   const r=analysis.regions.find(r=>r.id===id);
   return r&&r.level==='region'&&humanSource(r.species)&&proof&&
    (proof.fragments.some(s=>mentionsRegion(s,r))||/\b(?:junction|region|area|site)s?\b|该脑区|该区域/.test(proof.fragments.join(' '))&&mentionsRegion(proof.prefix,r));
  });
  if(m.behavior&&m.finding)ids.forEach(id=>catalogIds.add(id));
  if(screen.status==='supported'&&m.behavior&&m.finding&&ids.length)mechanisms.push({...m,regions:ids,connections:m.connections.filter(c=>ids.includes(c.from)&&ids.includes(c.to))});
 }
 const kept=mechanisms.slice(0,6),evidenceIds=new Set(kept.flatMap(m=>m.regions)),ids=new Set([...catalogIds,...evidenceIds]);
 const catalogOnly=[...catalogIds].filter(id=>!evidenceIds.has(id)).length;
 return {...analysis,summary:'',regions:analysis.regions.filter(r=>ids.has(r.id)),mechanisms:kept,limitations:[...analysis.limitations,...(analysis.mechanisms.length>kept.length?[`提取筛选：${analysis.mechanisms.length-kept.length} 条缺少完整实验字段、连续原文依据或明确人脑定位，或超过本次 6 条上限，未进入证据图。`]:[]),...(catalogOnly?[`${catalogOnly} 个有原文名称依据的结构仅保留为解剖候选，未作为实验定位证据。`]:[])].slice(0,20)};
}
