import {sourceScreen,mentionsRegion} from '../research/source-proof.js';
// The worker can check source support; the browser checks availability in its actual atlas.
export function screenAtlasAnalysis(analysis,source){
 const mechanisms=[];
 for(const m of analysis.mechanisms){
  const screen=sourceScreen(m,source);if(screen.status!=='supported'||!m.behavior||!m.finding)continue;
  const ids=m.regions.filter(id=>{
   const r=analysis.regions.find(r=>r.id===id);
   return r&&r.level==='region'&&/^(human|humans|homo sapiens|人类|成人)$/i.test(r.species.trim())&&r.hemisphere!=='unknown'&&
    (screen.proof.fragments.some(s=>mentionsRegion(s,r))||/\b(?:junction|region|area|site)s?\b|该脑区|该区域/.test(screen.proof.fragments.join(' '))&&mentionsRegion(screen.proof.prefix,r));
  });
  if(ids.length)mechanisms.push({...m,regions:ids,connections:m.connections.filter(c=>ids.includes(c.from)&&ids.includes(c.to))});
 }
 const kept=mechanisms.slice(0,6),ids=new Set(kept.flatMap(m=>m.regions));
 return {...analysis,summary:'',regions:analysis.regions.filter(r=>ids.has(r.id)),mechanisms:kept,limitations:[...analysis.limitations,...(analysis.mechanisms.length>kept.length?[`提取筛选：${analysis.mechanisms.length-kept.length} 条缺少行为、连续原文依据或明确人脑定位，或超过本次 6 条上限，未进入证据图。`]:[])].slice(0,20)};
}
