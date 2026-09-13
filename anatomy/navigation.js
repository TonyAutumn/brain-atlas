// Anatomical learning hierarchy. Persistent atlas entry IDs and geometry stay separate.
const node=(label,parent,color,kind,note)=>({label,parent,color,kind,note});
export const NAV={
 all:node('全部结构',null,'#929dab','根节点','按解剖从属逐级浏览；路径不等同于功能网络。'),
 cerebrum:node('前脑 / 端脑','all','#a9b7ca','胚胎与宏观分区','包括大脑皮层、内侧颞叶结构及端脑皮层下灰质。'),
 cortex:node('大脑皮层','cerebrum','#b99aff','组织大类','按脑叶和皮层空间家族浏览图谱已收录的细胞构筑分区。'),
 frontal:node('额叶','cortex','#ffa878','脑叶','额叶内已收录的运动、前额叶和眶额分区。'),
 frontal_motor:node('运动与前运动皮层','frontal','#ff956f','皮层系统','中央前回、SMA、preSMA 等运动相关皮层。'),
 frontal_prefrontal:node('外侧前额叶','frontal','#ffad82','皮层区域群','额上回、额中回、额下回及额叶沟的已收录分区。'),
 frontal_orbital:node('眶额与额极','frontal','#ffc094','皮层区域群','眶额皮层、额极和额叶岛盖等分区。'),
 parietal:node('顶叶','cortex','#f0cf73','脑叶','顶叶内已收录的躯体感觉与联合皮层。'),
 parietal_somato:node('躯体感觉皮层','parietal','#efd064','皮层系统','中央后回、中央后沟及相关躯体感觉分区。'),
 parietal_superior:node('顶上小叶与顶内沟','parietal','#e7c459','皮层区域群','SPL 与 IPS 的已收录分区。'),
 parietal_inferior:node('顶下小叶与岛盖','parietal','#f3da8a','皮层区域群','IPL 与顶叶岛盖的已收录分区。'),
 temporal:node('颞叶','cortex','#74d5ba','脑叶','颞叶听觉、颞上区及海马旁皮层；海马本体另列。'),
 temporal_auditory:node('听觉皮层','temporal','#62c9ad','皮层系统','Heschl 回等听觉细胞构筑分区。'),
 temporal_superior:node('颞上回与颞上沟','temporal','#78d8bd','皮层区域群','STG、STS 的已收录分区。'),
 temporal_parahippocampal:node('海马旁与梨状皮层','temporal','#94dfca','皮层区域群','来源明确标注为颞部的海马旁回和梨状皮层。'),
 occipital:node('枕叶','cortex','#8caeff','脑叶','初级、次级及更高级视觉皮层。'),
 occipital_early:node('早期视觉皮层','occipital','#79a1ff','皮层系统','V1、V2 对应的 hOc1、hOc2 分区。'),
 occipital_extra:node('纹外视觉皮层','occipital','#9ab7ff','皮层系统','hOc3 及更高级枕叶视觉分区。'),
 insula:node('岛叶','cortex','#e39dd5','皮层区域','岛叶粒状、异颗粒与无颗粒等细胞构筑分区。'),
 insula_granular:node('粒状岛叶','insula','#d98bcc','细胞构筑区群','粒状岛叶分区。'),
 insula_dysgranular:node('异颗粒岛叶','insula','#e7a5db','细胞构筑区群','异颗粒岛叶分区。'),
 insula_agranular:node('无颗粒岛叶','insula','#efaee3','细胞构筑区群','无颗粒岛叶分区。'),
 cingulate:node('扣带皮层','cortex','#aacfa0','皮层区域','当前图谱收录的前扣带、膝前与膝下分区。'),
 cingulate_anterior:node('前扣带','cingulate','#9ac78f','皮层区域群','ACC 与膝前扣带分区。'),
 cingulate_subgenual:node('膝下扣带','cingulate','#bbd9b3','皮层区域群','sACC 等膝下分区。'),
 transition:node('交界及跨叶区域','cortex','#b4bbc9','空间分组','颞顶、枕颞和顶枕等跨叶或边界位置。'),
 transition_tpj:node('颞顶交界','transition','#aab4c5','皮层交界区','TPJ 相关分区。'),
 transition_ventral:node('腹侧枕颞表面','transition','#c0c6d0','皮层交界区','梭状回、枕颞沟与侧副沟分区。'),
 transition_parietooccipital:node('顶枕交界','transition','#9faabc','皮层交界区','顶枕沟等分区。'),
 unassigned:node('待核对位置','cortex','#b4bbc9','待整理','原始位置标签尚未对应到导航树。'),

 medial:node('内侧颞叶结构','cerebrum','#ffc36b','结构系统','海马结构、内嗅皮层与杏仁核是相邻但不同的结构。'),
 hippocampus:node('海马结构','medial','#ffc36b','结构复合体','海马本体、齿状回、下托复合体及相关过渡区。'),
 hippocampal_fields:node('海马本体 CA 区','hippocampus','#f6b94f','亚区群','CA1、CA2、CA3 等海马本体亚区。'),
 dentate:node('齿状回','hippocampus','#ffd482','亚结构','齿状回图谱分区。'),
 subicular:node('下托复合体','hippocampus','#e9a94c','亚结构复合体','下托及过渡下托；具体论文定义仍需核对。'),
 entorhinal:node('内嗅皮层','hippocampus','#ffdd98','邻近皮层','内嗅皮层细胞构筑分区。'),
 hippocampal_transition:node('海马过渡区','hippocampus','#eac27e','过渡区','海马—杏仁核等过渡分区。'),
 amygdala:node('杏仁核','medial','#f78fae','核团复合体','杏仁核核群与相关过渡区。'),
 amygdala_basolateral:node('基底外侧核群','amygdala','#f27e9f','核群','外侧核、基底核及副基底核等。'),
 amygdala_corticomedial:node('皮质内侧核群','amygdala','#fa9eb7','核群','皮质核、内侧核及相关核群。'),
 amygdala_centromedial:node('中央核群','amygdala','#ffadc2','核群','中央核及邻近分区。'),
 amygdala_transition:node('杏仁核过渡区','amygdala','#e88eaa','过渡区','杏仁核与邻近结构的过渡分区。'),

 deep:node('皮层下灰质','cerebrum','#8fd6ab','组织大类','端脑及间脑深部灰质；功能上相关不代表解剖上同属。'),
 basal:node('基底神经节','deep','#63d5b8','结构系统','纹状体、苍白球及相关核团的解剖导航；黑质位于中脑。'),
 dorsal_striatum:node('背侧纹状体','basal','#4fc7aa','亚系统','尾状核与壳核。'),
 caudate:node('尾状核','dorsal_striatum','#47bea2','核团','尾状核图谱分区。'),
 putamen:node('壳核','dorsal_striatum','#63d4b7','核团','壳核图谱分区。'),
 ventral_striatum:node('腹侧纹状体','basal','#69dfc0','亚系统','伏隔核及纹状体腹侧连续区域。'),
 nucleus_accumbens:node('伏隔核','ventral_striatum','#5ed6b6','核团','伏隔核图谱分区。'),
 dorsal_pallidum:node('背侧苍白球','basal','#77c9b8','核团复合体','苍白球外侧部与内侧部。'),
 ventral_basal_ganglia:node('腹侧基底神经节','basal','#4ee2bd','亚系统','包括腹侧苍白球等腹侧输出结构。'),
 ventral_pallidum:node('腹侧苍白球','ventral_basal_ganglia','#39d7b2','核团','腹侧苍白球（VP）是腹侧基底神经节的重要输出核团，不是腹侧纹状体本身。'),
 forebrain:node('基底前脑','deep','#d4ba84','结构区域','胆碱能细胞群、终纹床核和嗅结节等；并非单一核团。'),
 basal_forebrain_cholinergic:node('胆碱能基底前脑','forebrain','#d9bd7d','细胞群区域','Ch1–Ch4 等胆碱能细胞群对应区域。'),
 extended_amygdala:node('扩展杏仁核相关结构','forebrain','#cead80','结构群','终纹床核等相关结构。'),
 olfactory_forebrain:node('嗅觉腹侧前脑','forebrain','#dec594','结构群','嗅结节等腹侧前脑结构。'),
 thalamus:node('丘脑','deep','#a6dd79','核团复合体','按核群组织丘脑核团；膝状体也属于丘脑。'),
 thalamus_anterior:node('前核群','thalamus','#9fd56f','丘脑核群','丘脑前部核团。'),
 thalamus_medial:node('内侧核群','thalamus','#aade7e','丘脑核群','丘脑内侧核团。'),
 thalamus_ventrolateral:node('腹侧与外侧核群','thalamus','#b5e38d','丘脑核群','丘脑腹侧和外侧核团。'),
 thalamus_posterior:node('后部与枕核群','thalamus','#94cf68','丘脑核群','枕核及其他丘脑后部核团。'),
 thalamus_geniculate:node('膝状体','thalamus','#bee69c','丘脑核群','内侧、外侧膝状体。'),
 thalamus_intralaminar:node('板内与中线核群','thalamus','#addb85','丘脑核群','板内、中线及相关核团。'),
 subthalamus:node('丘脑底区','deep','#e4cc70','间脑区域','丘脑腹侧的丘脑底核与未定带。'),
 subthalamic_nucleus:node('丘脑底核','subthalamus','#dfc75f','核团','STN；参与基底节回路但解剖上位于间脑。'),
 zona_incerta:node('未定带','subthalamus','#ead782','核团','ZI；位于丘脑腹侧。'),
 diencephalon:node('其他间脑','deep','#d3b3e0','间脑区域','下丘脑、乳头体与上丘脑等结构。'),
 hypothalamus:node('下丘脑','diencephalon','#c8a3d9','核团区域','下丘脑及乳头核相关条目。'),
 epithalamus:node('上丘脑','diencephalon','#ddc2e8','间脑分区','缰核等上丘脑结构。'),

 brainstem:node('脑干','all','#ffad78','宏观结构','当前底座仅收录部分中脑核团；脑桥和延髓尚不完整。'),
 midbrain:node('中脑','brainstem','#ffad78','脑干分区','红核、黑质和腹侧被盖区等已收录核团。'),
 substantia_nigra:node('黑质','midbrain','#f49b68','核团复合体','黑质致密部与网状部。'),
 red_nucleus:node('红核','midbrain','#ffb887','核团','红核图谱分区。'),
 ventral_tegmental:node('腹侧被盖区及邻近核团','midbrain','#ffc49b','核团区域','VTA 等中脑腹侧被盖相关条目。'),

 cerebellum:node('小脑','all','#92a9ff','宏观结构','小脑分叶与深部核团分开浏览。'),
 cerebellar_lobules:node('小脑皮层分叶 / 蚓部','cerebellum','#92a9ff','宏观分叶','AAL 小脑分叶与蚓部。'),
 cerebellar_hemisphere:node('小脑半球分叶','cerebellar_lobules','#829cff','宏观分叶群','左右小脑半球分叶。'),
 cerebellar_vermis:node('小脑蚓部','cerebellar_lobules','#a2b6ff','宏观分叶群','中线蚓部分叶。'),
 cerebellar_nuclei:node('小脑深部核团','cerebellum','#c2a2f3','核团系统','顶核、中间核与齿状核。'),
 cerebellar_medial_nuclei:node('内侧与中间核','cerebellar_nuclei','#b391e9','核群','顶核与中间核。'),
 dentate_nucleus:node('齿状核','cerebellar_nuclei','#cdb3f7','核团','齿状核背侧和腹侧部分。')
};

export function pathFor(group){const path=[];for(let id=group;id&&NAV[id];id=NAV[id].parent)path.unshift(id);return path;}
export function childrenOf(group){return Object.keys(NAV).filter(id=>NAV[id].parent===group);}
const has=(s,...patterns)=>patterns.some(p=>typeof p==='string'?s.includes(p):p.test(s));
export function navigationFor(e){
 const s=e.name,loc=s.includes('(')?s.slice(s.indexOf('(')+1,-1).split(',')[0]:'';
 if(e.category==='cortex'){
  if(s.startsWith('Area TPJ '))return 'transition_tpj';
  if(loc==='POS')return 'transition_parietooccipital';
  if(['FusG','OTS','CoS'].includes(loc))return 'transition_ventral';
  if(loc==='Insula')return has(s,/Ia\d|agranular/i)?'insula_agranular':has(s,/Id\d|dysgranular/i)?'insula_dysgranular':'insula_granular';
  if(['ACC','pACC','sACC'].includes(loc))return loc==='sACC'?'cingulate_subgenual':'cingulate_anterior';
  if(['PreCG','preSMA','SMA'].includes(loc))return 'frontal_motor';
  if(['SFG','MFG','IFG','IFS','SFS'].includes(loc))return 'frontal_prefrontal';
  if(['OFC','FPole','Frontal Operculum'].includes(loc))return 'frontal_orbital';
  if(['PostCG','PostCS'].includes(loc))return 'parietal_somato';
  if(['SPL','IPS'].includes(loc))return 'parietal_superior';
  if(['IPL','POperc'].includes(loc))return 'parietal_inferior';
  if(loc==='HESCHL')return 'temporal_auditory';
  if(['STG','STS'].includes(loc))return 'temporal_superior';
  if(['PhG','PiriformCortexMesial'].includes(loc))return 'temporal_parahippocampal';
  if(/^Area hOc[12] /.test(s))return 'occipital_early';
  if(loc==='LOC'||['Cuneus','LingG'].includes(loc)||/^Area hOc/.test(s))return 'occipital_extra';
  return 'unassigned';
 }
 if(e.category==='hippocampus'){
  if(/^CA\d/.test(s))return 'hippocampal_fields';
  if(/Dentate|DG /.test(s))return 'dentate';
  if(/Subc|subiculum/i.test(s))return 'subicular';
  if(/Entorhinal|EC /.test(s))return 'entorhinal';
  return 'hippocampal_transition';
 }
 if(e.category==='amygdala'){
  if(has(s,/lateral|basal|accessory basal|LB |CMN/i))return 'amygdala_basolateral';
  if(has(s,/central|Ce[A-Z]?\b/i))return 'amygdala_centromedial';
  if(has(s,/cortical|medial|CoN/i))return 'amygdala_corticomedial';
  return 'amygdala_transition';
 }
 if(/(^|\s)STN\s|Subthalamic Nucleus/i.test(s))return 'subthalamic_nucleus';
 if(/(^|\s)ZI\s|zona incerta/i.test(s))return 'zona_incerta';
 if(e.category==='basal'){
  if(/Ventral Pallidum|VP \(/i.test(s))return 'ventral_pallidum';
  if(/Nucleus Accumbens|NAcc|accumbens/i.test(s))return 'nucleus_accumbens';
  if(/Caudate/i.test(s))return 'caudate';
  if(/Putamen/i.test(s))return 'putamen';
  if(/Globus Pallidus|GPe|GPi|Pallidum/i.test(s))return 'dorsal_pallidum';
  if(/Basal Forebrain|Ch [1-4]/.test(s))return 'basal_forebrain_cholinergic';
  if(/Bed Nucleus|BNST/i.test(s))return 'extended_amygdala';
  if(/Olfactory Tubercle/i.test(s))return 'olfactory_forebrain';
  return 'basal';
 }
 if(e.category==='thalamus'){
  if(/geniculate|LGN|MGN/i.test(s))return 'thalamus_geniculate';
  if(/pulvinar|posterior/i.test(s))return 'thalamus_posterior';
  if(/anterior/i.test(s))return 'thalamus_anterior';
  if(/medial|mediodorsal/i.test(s))return 'thalamus_medial';
  if(/intralaminar|centromedian|parafascicular|midline/i.test(s))return 'thalamus_intralaminar';
  return 'thalamus_ventrolateral';
 }
 if(e.category==='diencephalon')return /habenula/i.test(s)?'epithalamus':'hypothalamus';
 if(e.category==='midbrain'){
  if(/Substantia Nigra|SN[CR]/i.test(s))return 'substantia_nigra';
  if(/Red Nucleus|RN \(/i.test(s))return 'red_nucleus';
  return 'ventral_tegmental';
 }
 if(e.category==='cerebellum'){
  if(e.atlas==='aal')return e.hemisphere==='M'?'cerebellar_vermis':'cerebellar_hemisphere';
  if(/Dentate/i.test(s))return 'dentate_nucleus';
  return 'cerebellar_medial_nuclei';
 }
 return NAV[e.category]?e.category:'unassigned';
}
export function inGroup(e,group){return group==='all'||pathFor(e.nav||navigationFor(e)).includes(group);}
export function topGroup(group){return pathFor(group)[1]||'all';}
export function hierarchyFor(e){return [...pathFor(e.nav||navigationFor(e)).map(id=>({id,...NAV[id]})),{id:e.id,label:e.text?.title||e.name,kind:'图谱分区',atlas:e.atlas}];}
export function navigationText(e){return hierarchyFor(e).map(n=>n.label).join(' › ');}
const MAPPABLE=new Set(['cortex','frontal','parietal','temporal','occipital','insula','cingulate','transition','medial','hippocampus','amygdala','deep','basal','dorsal_striatum','ventral_striatum','dorsal_pallidum','ventral_basal_ganglia','ventral_pallidum','forebrain','thalamus','subthalamus','diencephalon','brainstem','midbrain','cerebellum','cerebellar_lobules','cerebellar_nuclei']);
export function mappingGroups(){return [...MAPPABLE].filter(id=>NAV[id]);}
