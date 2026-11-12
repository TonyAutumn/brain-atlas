import fs from 'node:fs';
import {NAV} from '../anatomy/navigation.js';
import {createSearchIndex} from '../anatomy/search.js';
import {VOCABULARY_VERSION,CONCEPT_TERMS,parcelVocabulary,functionalVocabulary} from '../anatomy/search-vocabulary.js';
import {NETWORKS,describeFunctional} from '../research/networks.js';
import {describe} from '../anatomy/labels.js';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const anatomy=read('anatomy/data/manifest.json').entries.filter(e=>e.atlas!=='surface');
const functional=read('anatomy/data/functional-manifest.json').entries;
const clean=s=>String(s||'').replaceAll('|',' / ').replaceAll('\n',' ');
const rows=new Map();
for(const e of anatomy){
 const key=e.atlas+':'+e.name.trim().replace(/^[LR] /,'').replace(/_[LR]$/,'');
 if(!rows.has(key))rows.set(key,{entry:e,ids:[]});
 rows.get(key).ids.push(e.id);
}
let md='# 全目录检索核对清单\n\n版本：'+VOCABULARY_VERSION+'。自动生成于源目录，修改词表后运行 node scripts/audit-search-vocabulary.mjs。\n\n';
md+='覆盖 '+anatomy.length+' 个解剖模型（'+rows.size+' 种去侧别源名称）、'+functional.length+' 个功能分区、'+(Object.keys(NAV).length-1)+' 个层级节点。待核对占位分组仍不对外作为可检索结构。所有名称均保留来源定义；检索入口不表示完全相同的分割边界。方法与来源见 [SEARCH-VOCABULARY.md](SEARCH-VOCABULARY.md)。\n\n';
md+='## 解剖模型逐项核对\n\n| 图谱 / 原始名称 | 显示名称 | 关联模型 ID | 本轮维护的检索入口 |\n| --- | --- | --- | --- |\n';
for(const {entry:e,ids} of rows.values())md+='| '+clean(e.atlas+' / '+e.name.replace(/^[LR] /,'').replace(/_[LR]$/,''))+' | '+clean(describe(e).title)+' | '+ids.join(', ')+' | '+parcelVocabulary(e).map(clean).join('；')+' |\n';
md+='\n## 层级目录逐项核对\n\n| ID | 中文名称 | 英文与检索入口 |\n| --- | --- | --- |\n';
for(const [id,n] of Object.entries(NAV).filter(([id])=>id!=='all')){
 md+='| '+id+' | '+clean(n.label)+' | '+[...new Set([n.english,...n.aliases,...(CONCEPT_TERMS[id]||[])])].map(clean).join('；')+' |\n';
}
md+='\n## 功能分区逐项核对\n\n7 / 17 网络原名均加入搜索。以下位置词按官方 17 网络标签展开；未提供单独位置标签的条目仅按原名及网络检索，不猜测解剖位置。\n\n| ID | 官方 7 网络名 | 官方 17 网络名 | 显示名称 | 位置检索入口 |\n| --- | --- | --- | --- | --- |\n';
for(const e of functional){
 const fields=functionalVocabulary(e,[]).filter(x=>x!==e.name&&x!==e.name17);
 md+='| '+e.id+' | '+e.name+' | '+e.name17+' | '+clean(describeFunctional(e).title)+' | '+fields.map(clean).join('；')+' |\n';
}
md+='\n## 搜索中的组合入口\n\n| ID | 名称 | 查询字段 | 模型数 |\n| --- | --- | --- | --- |\n';
for(const p of createSearchIndex([...anatomy,...functional]).filter(x=>x.kind==='preset'))md+='| '+p.id+' | '+clean(p.label)+' | '+p.fields.map(clean).join('；')+' | '+p.parcels.length+' |\n';
fs.writeFileSync(new URL('anatomy/SEARCH-AUDIT.md',root),md);
console.log('Audited '+rows.size+' unique anatomical names, '+anatomy.length+' anatomical models, '+functional.length+' functional parcels, '+(Object.keys(NAV).length-1)+' hierarchy nodes.');
