// Learning navigation, separate from atlas labels, geometry and persistent IDs.
// A navigation group is not an additional atlas parcel or a complete lobe volume.
const node=(label,parent,color,note)=>({label,parent,color,note});
export const NAV={
 all:node('全部结构',null,'#929dab','选择一个大结构，再展开脑叶、亚区或核团。条目数随当前图谱变化，左右分开计数。'),
 cortex:node('大脑皮层','all','#b99aff','按脑叶及其他空间区域浏览皮层。这里显示当前图谱收录的细胞构筑分区，不包含完整脑叶的白质，也不代表脑叶的全部体积。'),
 frontal:node('额叶','cortex','#ffa878','中央前回、额上回、额中回、额下回、眶额皮层、额极与额叶岛盖等位置的已收录皮层分区。'),
 parietal:node('顶叶','cortex','#f0cf73','中央后回、中央后沟、顶上与顶下小叶、顶内沟和顶叶岛盖的已收录皮层分区。'),
 temporal:node('颞叶','cortex','#74d5ba','颞横回、颞上回、颞上沟、海马旁回及来源明确标注为颞部的梨状皮层分区。海马亚区与内嗅皮层另列在「海马 / 杏仁核」中。'),
 occipital:node('枕叶','cortex','#8caeff','包括初级、次级视觉皮层以及楔叶、舌回和外侧枕叶的已收录分区。顶枕沟等边界位置另列在「交界及跨叶区域」。'),
 insula:node('岛叶','cortex','#e39dd5','岛叶内部的粒状、异颗粒与无颗粒等细胞构筑分区。覆盖岛叶的额叶与顶叶岛盖分别列在相应脑叶下。'),
 cingulate:node('扣带皮层','cortex','#aacfa0','当前收录的是前扣带及膝前、膝下分区。扣带皮层沿半球内侧分布，这一入口不等于整个边缘系统，也不表示后扣带已完整收录。'),
 transition:node('交界及跨叶区域','cortex','#b4bbc9','包括颞顶交界、梭状回、枕颞沟、侧副沟和顶枕沟的已收录分区。这些位置跨脑叶或邻近边界，当前导航不强行把它们归入单一脑叶。'),
 unassigned:node('待核对位置','cortex','#b4bbc9','原始位置标签尚未对应到导航分组；保留原始名称与空间位置。'),
 medial:node('海马 / 杏仁核','all','#ffc36b','内侧颞叶相关结构的学习入口。海马结构、内嗅皮层与杏仁核分开列出；这个入口不表示它们是同一种组织。'),
 hippocampus:node('海马及邻近皮层','medial','#ffc36b','包含 CA1–3、齿状回、下托复合体、过渡下托、海马–杏仁核过渡区及内嗅皮层。邻近皮层与海马亚区保留各自的图谱定义。'),
 amygdala:node('杏仁核及过渡区','medial','#f78fae','包括图谱收录的杏仁核核群及相关过渡区；CIT168 的扩展杏仁核与 Julich 核群不能直接等同。'),
 deep:node('深部核团','all','#8fd6ab','按空间位置细分丘脑、纹状体与苍白球、基底前脑及其他间脑结构。黑质虽然参与基底节回路，解剖导航仍放在中脑下。'),
 thalamus:node('丘脑','deep','#a6dd79','丘脑各核团及内、外侧膝状体。丘脑底核和未定带另列在「丘脑底部」，避免与丘脑核混为一组。'),
 basal:node('纹状体 / 苍白球','deep','#63d5b8','当前图谱中的纹状体及苍白球相关结构。这里只按空间位置组织，不等同于完整基底节功能回路。'),
 forebrain:node('基底前脑','deep','#d4ba84','包括当前图谱收录的胆碱能细胞群、终纹床核和嗅结节等结构。这是位置学习分组，不表示它们具有相同的细胞类型。'),
 subthalamus:node('丘脑底部','deep','#e4cc70','丘脑底核（STN）与未定带（ZI）位于丘脑腹侧的间脑区域。这里将它们与中脑、丘脑核分别导航。'),
 diencephalon:node('其他间脑','deep','#d3b3e0','CIT168 收录的下丘脑、乳头核与缰核等间脑结构，保留各自原始标签。切换到 CIT168 可浏览这些条目。'),
 brainstem:node('脑干','all','#ffad78','当前底座只收录部分中脑核团；脑桥、延髓尚未添加。此入口不会把现有少数核团当作完整脑干。'),
 midbrain:node('中脑核团','brainstem','#ffad78','包括图谱收录的红核、黑质各部，以及 CIT168 的腹侧被盖区等中脑结构。'),
 cerebellum:node('小脑','all','#92a9ff','宏观小脑分叶与深部核团分开浏览。AAL 分叶和 Julich 核团来自不同图谱与分区层级。'),
 cerebellar_lobules:node('小脑分叶 / 蚓部','cerebellum','#92a9ff','AAL 图谱收录的小脑宏观分叶及蚓部。这里展示分叶表面，不代表小脑的单细胞层。'),
 cerebellar_nuclei:node('小脑深部核团','cerebellum','#c2a2f3','Julich 图谱收录的顶核、中间核及齿状核背侧、腹侧部分。')
};
export function pathFor(group){
 const path=[];for(let id=group;id&&NAV[id];id=NAV[id].parent)path.unshift(id);return path;
}
export function childrenOf(group){return Object.keys(NAV).filter(id=>NAV[id].parent===group);}
export function navigationFor(e){
 const s=e.name;
 if(e.category==='cortex'){
  const loc=s.slice(s.indexOf('(')+1,-1).split(',')[0];
  if(s.startsWith('Area TPJ ')||['FusG','OTS','CoS','POS'].includes(loc))return 'transition';
  if(['ACC','pACC','sACC'].includes(loc))return 'cingulate';
  if(loc==='Insula')return 'insula';
  if(['PreCG','SFG','MFG','IFG','IFS','SFS','OFC','FPole','preSMA','SMA','Frontal Operculum'].includes(loc))return 'frontal';
  if(['PostCG','PostCS','SPL','IPL','IPS','POperc'].includes(loc))return 'parietal';
  if(['HESCHL','STG','STS','PhG','PiriformCortexMesial'].includes(loc))return 'temporal';
  if(['LOC','Cuneus','LingG'].includes(loc)||/^Area hOc[12] /.test(s))return 'occipital';
  return 'unassigned';
 }
 if(/^(STN |ZI )|Subthalamic Nucleus/.test(s))return 'subthalamus';
 if(e.category==='basal')return /Basal Forebrain/.test(s)?'forebrain':'basal';
 if(e.category==='cerebellum')return e.atlas==='aal'?'cerebellar_lobules':'cerebellar_nuclei';
 return e.category;
}
export function inGroup(e,group){return group==='all'||pathFor(e.nav||navigationFor(e)).includes(group);}
export function topGroup(group){return pathFor(group)[1]||'all';}
export function navigationText(e){return pathFor(e.nav||navigationFor(e)).map(id=>NAV[id].label).join(' ');}
