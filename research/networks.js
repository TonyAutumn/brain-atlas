import {atlasCode} from './mapping-rules.js?v=epithalamus1';
export const NETWORK_COLOR='#ffd34e';
export const DMN={id:'DMN',label:'默认模式网络',color:NETWORK_COLOR,codes:['PGa','PGp'],scope:'双侧角回 PGa / PGp · 部分参考',note:'黄色显示当前已收录的双侧角回分区（PGa/PGp），不是完整 DMN。尚未覆盖内侧前额叶、后扣带等核心节点；分区不等于功能网络边界或论文激活范围。',source:'https://pubmed.ncbi.nlm.nih.gov/11209064/'};
export const NETWORKS=[DMN];
export function networkEntries(network,entries){return entries.filter(e=>e.atlas==='julich'&&network.codes.includes(atlasCode(e)));}
export function networkOf(r){return /\bDMN\b|default[ -]mode network|默认模式网络|缺省模式网络/i.test(r.name||'')?DMN:null;}
export function recordKind(r){return networkOf(r)||r.level==='network'?'network':r.level==='celltype'||r.level==='neuron'?'cell':'region';}
export function kindLabel(r){return {network:'功能网络',cell:'细胞 / 神经元',region:'解剖结构'}[recordKind(r)];}
