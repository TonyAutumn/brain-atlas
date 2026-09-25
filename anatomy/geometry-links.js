// Display associations are deliberately separate from anatomical ancestry and evidence mapping.
import {NAV,inGroup,navigationFor} from './navigation.js?v=epithalamus1';
export const GEOMETRY_LINK_VERSION='2026-09-25.1';
const relation=(includeGroups,note,references)=>Object.freeze({includeGroups:Object.freeze(includeGroups),note,references:Object.freeze(references),preferredSource:'cit168'});
export const GEOMETRY_RELATIONS=Object.freeze({
 tegmentum:relation(['midbrain_tegmentum','pontine_tegmentum'],
  '部分模型：按被盖总称关联已收录的中脑被盖子结构，包括红核、VTA 和臂旁色素核。脑桥被盖目前没有模型。这些分区不是整个被盖的完整边界，也没有被合并成一个新模型。',
  [{title:'Human Protein Atlas · Midbrain anatomical divisions',url:'https://www.proteinatlas.org/humanproteome/brain/midbrain'},{title:'NLM MeSH · Tegmentum Mesencephali',url:'https://www.ncbi.nlm.nih.gov/mesh/D013681'}]),
 cerebral_peduncle:relation(['crus_cerebri','midbrain_tegmentum','substantia_nigra'],
  '部分模型（广义大脑脚）：依 NLM MeSH 的广义定义关联中脑被盖内已收录核团和黑质；脚底仍无模型。此显示不是大脑脚底的白质纤维束，也不是完整大脑脚轮廓。狭义脚底请进入“大脑脚底”条目。',
  [{title:'NLM MeSH · Cerebral Peduncle（广义定义与下级结构）',url:'https://www.ncbi.nlm.nih.gov/mesh/D065850'}])
});
export function inGeometryGroup(entry,group){
 if(!entry||entry.atlas==='surface'||!Object.hasOwn(NAV,group))return false;
 if(inGroup(entry,group))return true;
 // Never propagate generic related, spatial proximity, or an ancestor's geometry to a missing child.
 const relation=GEOMETRY_RELATIONS[group];
 return !!relation&&relation.includeGroups.some(id=>inGroup(entry,id));
}
export function conceptCoverage(group,entries){
 const parcels=entries.filter(e=>inGeometryGroup(e,group));
 const relation=GEOMETRY_RELATIONS[group];
 const hasGeometry=parcels.length>0;
 const partial=hasGeometry&&(!!relation||!parcels.some(e=>(e.nav||navigationFor(e))===group));
 return {parcels,sources:[...new Set(parcels.map(e=>e.atlas))],hasGeometry,partial,
  label:!hasGeometry?'仅层级':partial?'部分模型':'分区模型',
  note:relation?.note||(group==='epithalamus'?'部分模型：显示 CIT168 的左右缰核及 Allen 2020 的中线松果体。各来源保留独立模板空间，不合并为整个上丘脑；内/外侧缰核和纤维结构尚无独立分割。':group==='habenular_complex'?'CIT168 的整个缰核参考模型；未区分内侧缰核与外侧缰核，不代表整个上丘脑。':group==='pineal_gland'?'Allen 2020 松果体分割，MNI ICBM152 2009b 非线性对称空间。中线结构只显示一份；不代表概率图或个体精确边界。':hasGeometry?'显示已收录图谱分区；来源边界与分割尺度各不相同，不保证覆盖该结构的完整体积。':'当前已导入图谱没有可确认的对应分割；不会用附近结构、父结构或相似名称代替。'),
  references:relation?.references||[],includeGroups:relation?.includeGroups||[],preferredSource:group==='epithalamus'?'all':relation?.preferredSource||null};
}
