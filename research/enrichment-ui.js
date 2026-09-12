import {enrichmentPoints} from './enrichment.js?v=evidence1';
export function lookupDescription(paper,region,entries,escape){
 const e=paper.enrichments?.[region.id];if(!e)return '';
 const points=enrichmentPoints(paper,region,entries);
 return `<details class="lookup-result"><summary>联网补全 · ${e.status==='complete'?'已检索':'部分完成'} · ${e.sources.length} 个来源</summary><p>${escape(e.review?.summary||e.note)}</p>${e.review?`<blockquote>${escape(e.review.quote)}</blockquote>`:''}${e.canonicalName?`<p>术语库标准名：${escape(e.canonicalName)}</p>`:''}${points.length?`<p>${escape(points[0].description)}</p>`:''}${e.points.length?`<p>坐标空间：MNI152 2009c nonlin asym · RAS · mm；外部图谱参考点不等于本论文的实验位置。</p>`:''}${e.sources.map(s=>`<p><a href="${escape(s.url)}" target="_blank" rel="noopener">${escape(s.title)}</a> · ${escape({ontology:'术语定义',abstract:'论文摘要',atlas:'图谱元数据'}[s.type]||s.type)}</p>`).join('')}${e.warnings.map(w=>`<p>${escape(w)}</p>`).join('')}<small>检索时间：${escape(e.checkedAt)}。补全不改写本文证据。</small></details>`;
}
