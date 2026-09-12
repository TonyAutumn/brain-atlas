// A saved correspondence is distinct from whether today's atlas can display it.
export function cleanMapping(value){
 if(!value||typeof value.target!=='string'||! /^(parcel|group|set|network):[a-zA-Z0-9_-]{1,150}$/.test(value.target)||!['L','R','both','unknown'].includes(value.hemisphere))return null;
 return {target:value.target,hemisphere:value.hemisphere,confirmed:value.confirmed===true};
}
export function cleanMappingHistory(history,regionIds){
 return (Array.isArray(history)?history:[]).slice(-12).map(h=>({savedAt:typeof h.savedAt==='string'?h.savedAt.slice(0,50):'',mappings:Object.fromEntries(regionIds.map(id=>[id,cleanMapping(h.mappings?.[id])]))}));
}
export function retainMappingHistory(previous,next){
 const byId=new Map(previous.papers.map(p=>[p.id,p]));
 return {...next,papers:next.papers.map(p=>{
  const old=byId.get(p.id);if(!old||JSON.stringify(old.mappings)===JSON.stringify(p.mappings))return p;
  return {...p,mappingHistory:[...(old.mappingHistory||[]),{savedAt:new Date().toISOString(),mappings:structuredClone(old.mappings)}].slice(-12)};
 })};
}
export function mappingChoices(region,mapping,options,isNetwork){
 const choices=options.filter(o=>isNetwork?o.value.startsWith('network:'):!o.value.startsWith('network:'));
 if(mapping?.target&&!choices.some(o=>o.value===mapping.target))choices.unshift({value:mapping.target,label:'已有对应 · '+mapping.target+'（保留记录）'});
 return choices;
}
