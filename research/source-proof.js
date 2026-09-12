// Text checks are a screening aid, not a substitute for checking the experiment.
const fold=s=>String(s||'').normalize('NFKC').replace(/\u00ad/g,'').toLowerCase();
const escapePattern=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function quoteProof(quote,source){
 const text=fold(source),parts=fold(quote).replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g,'').split(/\.{3,}|…+/).map(s=>s.trim()).filter(Boolean);
 if(!parts.length||parts.length>6||parts.join('').length<25)return null;
 let end=0,start=-1;const fragments=[];
 for(const part of parts){
  const tokens=part.match(/[\p{L}\p{N}]+/gu)||[];if(tokens.length<3)return null;
  // PDF-extracted citation numbers may follow a word. Numerical terms in the quote remain mandatory.
  const pattern=tokens.map((t,i)=>escapePattern(t)+(i<tokens.length-1?(!/\d$/.test(t)&&!/^\d/.test(tokens[i+1])?'(?:[0-9]{1,3}(?:[–,-][0-9]{1,3})*)?':'')+'[^\\p{L}\\p{N}]*':'')).join('');
  const suffix=/\d$/.test(tokens.at(-1))?'':'(?:[0-9]{1,3}(?:[–,-][0-9]{1,3})*)?';
  const re=new RegExp('(?<![\\p{L}\\p{N}])'+pattern+suffix+'(?![\\p{L}\\p{N}])','gu');re.lastIndex=end;const match=re.exec(text);if(!match)return null;
  if(start<0)start=match.index;end=re.lastIndex;if(end-start>6000)return null;fragments.push(match[0]);
 }
 return {fragments,context:text.slice(Math.max(0,start-220),end),prefix:text.slice(Math.max(0,start-220),start)};
}
export function evidenceNames(region){
 const name=String(region.name||'').replace(/^(left|right|bilateral)\s+|^(左侧|右侧|双侧)/i,'');
 return [...new Set([name,name.replace(/\s*\([^()]*\)\s*$/,'').trim(),...[...name.matchAll(/\(([A-Za-z][A-Za-z0-9 .-]{1,30})\)/g)].map(m=>m[1])])].filter(Boolean);
}
export function mentionsRegion(text,region,extra=[]){
 const value=fold(text);
 return [...evidenceNames(region),...extra].some(name=>{
  const words=fold(name).match(/[\p{L}\p{N}]+/gu);if(!words?.length)return false;
  const expression=words.map(escapePattern).join('[^\\p{L}\\p{N}]*');
  return new RegExp('(?<![\\p{L}\\p{N}])'+expression+'(?:s)?(?![\\p{L}\\p{N}])','u').test(value);
 });
}
export function sourceScreen(mechanism,source){
 if(['hypothesis','review'].includes(mechanism.evidenceType)||mechanism.origin==='interpretation')return {reason:'背景或解释性假说，未形成实测定位证据',status:'background'};
 if(!mechanism.regions?.length)return {reason:'没有涉及可定位的脑结构',status:'background'};
 if(!mechanism.method?.trim()||!mechanism.locator?.trim())return {reason:'缺少实验方法或原文位置',status:'evidence'};
 if(/could (?:explain|be explained|be driven)|might account for|may explain|hypothetical|可能解释|或可解释|可能由此解释/i.test(mechanism.quote||''))return {reason:'摘录属于机制推测，不能作为该体验的实测定位依据',status:'background'};
 const proof=quoteProof(mechanism.quote,source);
 if(!proof)return {reason:'摘录未能在所存正文中核验，需核对原文',status:'evidence'};
 return {proof,status:'supported'};
}
