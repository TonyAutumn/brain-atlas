export const DMN={id:'DMN',label:'默认模式网络',color:'#b58aff',codes:['PGa','PGp'],note:'功能网络参考：紫色仅显示当前底座可对应的双侧角回分区（PGa/PGp）。未加载完整功能网络模板，未覆盖内侧前额叶、后扣带等核心节点；这些分区不等于 DMN 边界或本文激活范围。',source:'https://pubmed.ncbi.nlm.nih.gov/11209064/'};
export function networkOf(r){return /\bDMN\b|default[ -]mode network|默认模式网络|缺省模式网络/i.test(r.name||'')?DMN:null;}
export function recordKind(r){return networkOf(r)||r.level==='network'?'network':r.level==='celltype'||r.level==='neuron'?'cell':'region';}
export function kindLabel(r){return {network:'功能网络',cell:'细胞 / 神经元',region:'解剖结构'}[recordKind(r)];}
