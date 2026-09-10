export const EVIDENCE={association:'统计关联',causal:'干预证据',anatomical:'解剖连接',effective:'模型估计的有向关系',hypothesis:'机制假说',review:'综述归纳'};
export const ORIGINS={study:'本文研究',cited:'本文引用的研究',interpretation:'作者解释'};
const str=(v,n=2000)=>typeof v==='string'?v.trim().slice(0,n):'';
const arr=(v,max)=>{if(!Array.isArray(v))return [];if(v.length>max)throw Error('条目过多，请分段分析。');return v;};
export function canonicalTheme(value){
 const name=str(value,80).replace(/\s+/g,' ');
 return /^(nde|ndes|near[- ]death experiences?|濒死体验|近死体验)$/i.test(name)?'濒死体验':name;
}
export function themeList(values){return [...new Map(values.map(canonicalTheme).filter(Boolean).map(v=>[v.toLowerCase(),v])).values()];}
export function validateAnalysis(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('分析结果不是有效对象。');
 const title=str(input.title,500);if(!title)throw Error('分析结果缺少论文标题。');
 const regions=arr(input.regions,60).map((r,i)=>({id:str(r.id,60)||`r${i+1}`,name:str(r.name,300),hemisphere:['L','R','both','unknown'].includes(r.hemisphere)?r.hemisphere:'unknown',species:str(r.species,100)||'未报告',level:['region','network','celltype','neuron'].includes(r.level)?r.level:'region',locator:str(r.locator,400)}));
 const validId=id=>/^[a-zA-Z][a-zA-Z0-9_-]{0,59}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
 if(regions.some(r=>!r.name||!validId(r.id))||new Set(regions.map(r=>r.id)).size!==regions.length)throw Error('脑区名称缺失或编号无效、重复。');
 const ids=new Set(regions.map(r=>r.id));
 const mechanisms=arr(input.mechanisms,30).map((m,i)=>{
  const evidenceType=Object.hasOwn(EVIDENCE,m.evidenceType)?m.evidenceType:'hypothesis';
  const refs=arr(m.regions,60).filter(id=>ids.has(id));
  const connections=arr(m.connections,60).map(c=>({from:str(c.from,60),to:str(c.to,60),directed:c.directed===true&&['causal','anatomical','effective'].includes(evidenceType)}));
  if(connections.some(c=>!ids.has(c.from)||!ids.has(c.to)||c.from===c.to))throw Error('连接引用了不存在或重复的端点。');
  for(const c of connections)for(const id of [c.from,c.to])if(!refs.includes(id))refs.push(id);
  return {id:str(m.id,60)||`m${i+1}`,title:str(m.title,200)||'未命名机制',claim:str(m.claim,3000),method:str(m.method,1000),evidenceType,origin:Object.hasOwn(ORIGINS,m.origin)?m.origin:'interpretation',regions:refs,connections,locator:str(m.locator,500),quote:str(m.quote,1200),limitations:str(m.limitations,2000)};
 });
 if(mechanisms.some(m=>!validId(m.id))||new Set(mechanisms.map(m=>m.id)).size!==mechanisms.length)throw Error('机制编号无效或重复。');
 return {title,authors:str(input.authors,1000),year:str(String(input.year||''),20),doi:str(input.doi,250),studyType:str(input.studyType,200),species:str(input.species,200),task:str(input.task,3000),summary:str(input.summary,4000),themes:themeList(arr(input.themes,12)),limitations:arr(input.limitations,20).map(v=>str(v,1000)),regions,mechanisms};
}
export function quoteCheck(quote,source){
 const clean=s=>s.normalize('NFKC').replace(/[\s\u00ad]+/g,'').toLowerCase();
 return !quote?'missing':clean(source).includes(clean(quote))?'matched':'unmatched';
}
export function annotateQuotes(analysis,source){
 return {...analysis,mechanisms:analysis.mechanisms.map(m=>({...m,quoteStatus:quoteCheck(m.quote,source)}))};
}
