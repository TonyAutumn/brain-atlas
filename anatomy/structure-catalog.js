// Anatomical concepts and search vocabulary, independent of meshes and saved parcel IDs.
// A concept without a mesh is still a valid, searchable learning entry.
export const CATALOG_VERSION='2026-09-25.1';
export const SOURCES={
 epithalamus:{title:'Allen Human Reference Atlas 2020 · 人脑结构标签与层级',url:'https://download.alleninstitute.org/informatics-archive/allen_human_reference_atlas_3d_2020/version_1/examples/voxel_count/voxel_count.csv'},
 pineal:{title:'Allen Human Reference Atlas – 3D, 2020 · 来源、空间与许可',url:'https://community.brain-map.org/t/allen-human-reference-atlas-3d-2020-new/405'},
 midbrain:{title:'Human Protein Atlas · Midbrain (anatomical divisions)',url:'https://www.proteinatlas.org/humanproteome/brain/midbrain'},
 pons:{title:'Human Protein Atlas · Pons (anatomical divisions)',url:'https://www.proteinatlas.org/humanproteome/brain/pons'},
 brain:{title:'Human Protein Atlas · Human brain structure list',url:'https://v24.proteinatlas.org/humanproteome/brain/data'},
 pontine:{title:'NLM MeSH · Pontine Tegmentum',url:'https://www.ncbi.nlm.nih.gov/mesh/68065821'},
 posteromedial:{title:'Vogt & Laureys, 2005 · Posterior cingulate, precuneal and retrosplenial cortices',url:'https://pubmed.ncbi.nlm.nih.gov/16186025/'},
 posteromedialHuman:{title:'Rolls et al., 2023 · Human posterior cingulate, retrosplenial and medial parietal cortex',url:'https://pubmed.ncbi.nlm.nih.gov/36178249/'},
 posteriorCingulate:{title:'Leech & Sharp, 2014 · The role of the posterior cingulate cortex in cognition and disease',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC3891440/'},
 precuneus:{title:'Cavanna & Trimble, 2006 · The precuneus: functional anatomy and behavioural correlates',url:'https://pubmed.ncbi.nlm.nih.gov/16399806/'},
 retrosplenial:{title:'Vann et al., 2009 · What does the retrosplenial cortex do?',url:'https://pubmed.ncbi.nlm.nih.gov/19812579/'},
 atlas:{title:'本站图谱原始标签、来源及范围说明',url:'anatomy/SOURCES.md'}
};
// id, Chinese label, primary parent, English name, aliases, kind, note, sources, related IDs
const EXTRA=[
 ['habenular_complex','缰核复合体','epithalamus','Habenular nuclei',['habenula','habenulae','habenular nucleus','habenular complex','Hb','缰核','缰核群'],'核团复合体','属于上丘脑，分为内侧缰核和外侧缰核。当前 CIT168 左右网格表示整个缰核，未区分内、外侧部；它们不能代表整个上丘脑。',['epithalamus','atlas'],['stria_medullaris','habenular_commissure','pineal_gland']],
 ['medial_habenula','内侧缰核','habenular_complex','Medial habenular nucleus',['medial habenula','MHb','MHN','缰核内侧部'],'核团','缰核复合体的内侧部分。当前只有名称与从属关系，不能用整个缰核的网格代替这一亚核。',['epithalamus'],['lateral_habenula']],
 ['lateral_habenula','外侧缰核','habenular_complex','Lateral habenular nucleus',['lateral habenula','LHb','LHN','缰核外侧部'],'核团','缰核复合体的外侧部分。当前图谱未单独分割，不能将整个缰核的左右模型冒充外侧缰核。',['epithalamus'],['medial_habenula']],
 ['pineal_gland','松果体','epithalamus','Pineal gland',['pineal body','epiphysis cerebri','glandula pinealis','Pin','松果腺','松果腺体'],'中线神经内分泌器官','属于上丘脑的中线结构，与缰核分别列出。三维表面来自 Allen 2020 人脑图谱的松果体标签，保留来源坐标，不拆成左右两枚。',['epithalamus','pineal'],['habenular_complex','habenular_commissure','posterior_commissure']],
 ['stria_medullaris','丘脑髓纹','epithalamus','Stria medullaris of thalamus',['stria medullaris','stria medullaris thalami','habenular stria','SM','SMT','髓纹'],'白质纤维束','与缰核相联系的传入纤维束，沿丘脑内侧上缘走行；不是缰核本身。本学习导航置于上丘脑相关结构，Allen 来源本体则将纤维束另行分类。当前暂无对应分割。',['epithalamus'],['habenular_complex']],
 ['habenular_commissure','缰连合','epithalamus','Habenular commissure',['commissura habenularum','commissure of habenula','缰核连合'],'连合纤维束','连接两侧缰核相关区域的连合纤维，靠近松果体柄；与后连合分开。当前只提供层级与位置关系。',['epithalamus'],['habenular_complex','pineal_gland','posterior_commissure']],
 ['posterior_commissure','后连合','epithalamus','Posterior commissure',['commissura posterior','epithalamic commissure','后联合'],'连合纤维束','靠近松果体柄下方、中脑导水管上端的中线连合。本学习导航置于上丘脑相关结构；Allen 来源本体将其另列于中脑纤维系统，不据此虚构单一从属标准。当前暂无对应分割。',['epithalamus'],['pineal_gland','habenular_commissure','midbrain']],
 ['telencephalon','端脑（大脑半球）','cerebrum','Telencephalon',['cerebral hemispheres','端脑','大脑半球'],'前脑分区','端脑与间脑同属前脑；端脑包括大脑皮层及端脑深部结构。',['brain']],
 ['posteromedial_cortex','后内侧皮层（总称）','cortex','Posteromedial cortex',['posterior medial cortex','posteromedial cortical region','posterior medial cortical region','PMC','后内侧皮质','后部内侧皮层','后部内侧皮质'],'跨区皮层总称','文献中的后内侧皮层通常指内侧后部的一组相邻皮层，而不是边界固定的单一脑区；常涉及后扣带皮层、压后皮层与楔前叶，但具体纳入范围随研究和图谱而异。本站将总称与各具体结构分开，当前不为它虚构整体三维边界。',['posteromedial','posteromedialHuman'],['posterior_cingulate','retrosplenial_cortex','precuneus']],
 ['posterior_cingulate','后扣带皮层','cingulate','Posterior cingulate cortex',['posterior cingulate','posterior cingulate gyrus','PCC','后扣带皮质','后扣带回'],'扣带皮层分区','位于扣带皮层后部。常按 Brodmann 23、31 区讨论，但论文和图谱边界并不完全一致；它与楔前叶、压后皮层相邻，却不是三者的同义词。',['posteriorCingulate','posteromedial'],['posteromedial_cortex','retrosplenial_cortex','precuneus']],
 ['retrosplenial_cortex','压后皮层','cingulate','Retrosplenial cortex',['retrosplenial area','RSC','脾后皮层','压后皮质','脾后皮质'],'皮层分区','位于胼胝体压部后方附近，常与 Brodmann 29、30 区相关。它与后扣带皮层相邻且在文献中有时被合并讨论，但应保留为独立结构。',['retrosplenial','posteromedial'],['posteromedial_cortex','posterior_cingulate','precuneus']],
 ['precuneus','楔前叶','parietal','Precuneus',['precuneal cortex','PCu','楔前皮层','楔前皮质'],'内侧顶叶结构','位于顶叶内侧面，是内侧顶叶的一部分；它与后扣带皮层及压后皮层相邻，不能仅凭“后内侧皮层”一词确定论文实际指向哪一部分。',['precuneus','posteromedialHuman'],['posteromedial_cortex','posterior_cingulate','retrosplenial_cortex']],
 ['tectum','中脑顶盖','midbrain','Tectum',['tectum mesencephali','midbrain tectum','tectal plate','quadrigeminal plate','corpora quadrigemina','顶盖','四叠体','四叠体板'],'中脑分区','位于中脑导水管背侧，包括上丘与下丘。当前只有层级条目，没有完整顶盖三维模型。',['midbrain']],
 ['superior_colliculus','上丘','tectum','Superior colliculus',['superior colliculi','SC','上四叠体'],'核团及表面隆起','属于中脑顶盖；不要与丘脑的外侧膝状体混同。',['midbrain']],
 ['inferior_colliculus','下丘','tectum','Inferior colliculus',['inferior colliculi','IC','下四叠体'],'核团及表面隆起','属于中脑顶盖；不要与丘脑的内侧膝状体混同。',['midbrain']],
 ['tegmentum','被盖（总称）','brainstem','Tegmentum',['被盖','脑干被盖'],'跨分区术语','被盖不是 VTA 的同义词。请按上下文区分中脑被盖和脑桥被盖；下方列出相关分区，不把它们合并为一个模型。',['midbrain','pontine'],['midbrain_tegmentum','pontine_tegmentum']],
 ['midbrain_tegmentum','中脑被盖','midbrain','Midbrain tegmentum',['tegmentum mesencephali','mesencephalic tegmentum'],'中脑分区','中脑被盖包括红核、腹侧被盖区等结构。可显示的子结构只是局部参考，不能代表整个被盖的边界。',['midbrain'],['tegmentum','substantia_nigra']],
 ['periaqueductal_gray','导水管周围灰质','midbrain_tegmentum','Periaqueductal gray',['periaqueductal grey','periaqueductal gray matter','PAG','中央灰质','中脑导水管周围灰质'],'灰质区域','围绕中脑导水管。结构名称和从属关系可学习，但本站尚无该结构的三维分区。',['midbrain']],
 ['cerebral_aqueduct','中脑导水管','midbrain','Cerebral aqueduct',['aqueduct of Sylvius','mesencephalic aqueduct','导水管'],'脑室通道','中脑内连接第三、第四脑室的通道；不是灰质核团。',['midbrain']],
 ['cerebral_peduncle','大脑脚','midbrain','Cerebral peduncle',['cerebral peduncles','pedunculus cerebri'],'宏观结构术语','大脑脚有广义和狭义用法；脚底与被盖不是同义词。此处单列脚底，并提供相关结构入口，不据名称推断完整几何。',['midbrain'],['midbrain_tegmentum','substantia_nigra']],
 ['crus_cerebri','大脑脚底','cerebral_peduncle','Crus cerebri',['crura cerebri','basis pedunculi','basis pedunculi cerebri','脚底','大脑脚底部'],'白质区域','大脑脚腹侧的主要白质纤维区域。',['midbrain']],
 ['parabrachial_pigmented','臂旁色素核','midbrain_tegmentum','Parabrachial pigmented nucleus',['parabrachial pigmented','PBP'],'图谱核团','CIT168 将 PBP 与 VTA 分别标注。PBP 不是脑桥的臂旁核复合体；这里保留来源的独立边界。',['atlas'],['ventral_tegmental']],
 ['midbrain_other','其他中脑条目（待核对）','midbrain','Other midbrain structures',[],'待核对分组','尚未识别的中脑标签留在这里，不再自动归入 VTA。',['atlas']],
 ['pons','脑桥','brainstem','Pons',['pontine','桥脑'],'脑干分区','脑桥位于中脑与延髓之间，区分脑桥基底部与脑桥被盖；当前没有对应三维模型。',['pons']],
 ['pontine_tegmentum','脑桥被盖','pons','Pontine tegmentum',['tegmentum pontis','dorsal pons','tegmentum of pons'],'脑桥分区','脑桥背侧部，与中脑被盖连续。它不是 VTA，也不是单一核团。',['pons','pontine'],['tegmentum']],
 ['basilar_pons','脑桥基底部','pons','Basilar pons',['basis pontis','ventral pons','basilar part of pons','脑桥腹侧部'],'脑桥分区','与脑桥被盖相区分的腹侧部分。',['pons']],
 ['pontine_nuclei','脑桥核','basilar_pons','Pontine nuclei',['pontine nucleus','脑桥核群'],'核群','位于脑桥基底部的核群。',['pons']],
 ['locus_coeruleus','蓝斑','pontine_tegmentum','Locus coeruleus',['locus caeruleus','LC','蓝斑核'],'核团','位于脑桥被盖、第四脑室附近；当前仅提供结构关系。',['pons']],
 ['parabrachial_nuclei','臂旁核复合体','pontine_tegmentum','Parabrachial nuclei',['parabrachial nucleus','parabrachial complex','PBN','PB','臂旁核'],'核团复合体','脑桥被盖的臂旁核复合体，包括内侧和外侧臂旁核；不等于中脑的臂旁色素核 PBP。',['pons']],
 ['dorsal_tegmental_nucleus','背侧被盖核','pontine_tegmentum','Dorsal tegmental nucleus',['DTN','dorsal tegmental nucleus of Gudden','Gudden背侧被盖核'],'核团','脑桥被盖内的特定核团，不是整个被盖。',['pons']],
 ['pontomesencephalic','中脑—脑桥交界相关结构','brainstem','Pontomesencephalic junction',['mesopontine junction','中脑脑桥交界'],'跨界定位分组','用于索引跨中脑与脑桥分界的结构，不是额外的一块脑组织。具体范围依物种和图谱定义。',['midbrain','pons'],['midbrain','pons']],
 ['pedunculopontine','脚桥被盖核','pontomesencephalic','Pedunculopontine tegmental nucleus',['pedunculopontine nucleus','PPT','PPTg','PPN','PPTN','脚桥核'],'核团','位于中脑—脑桥交界相关被盖区域；不同图谱的分界和命名不同，不强行限定为仅在某一侧。',['midbrain','brain']],
 ['laterodorsal_tegmental','背外侧被盖核','pontomesencephalic','Laterodorsal tegmental nucleus',['laterodorsal tegmentum','LDT','LDTg','外背侧被盖核'],'核团','被盖内的特定核团；不等于整个 tegmentum，也不等于背侧被盖核 DTN。',['pons','brain']],
 ['raphe_nuclei','中缝核群','brainstem','Raphe nuclei',['raphe nucleus','raphe','中缝核'],'跨脑干核群','跨脑干不同水平分布的一组核团，不是单个连续核团；以下只列部分常见成员。',['midbrain','brain']],
 ['dorsal_raphe','背侧中缝核','raphe_nuclei','Dorsal raphe nucleus',['dorsal raphe','DRN','DR','中缝背核'],'核团','位于中脑及邻近上部脑桥水平。主路径表示所属核群，相关入口表示所在区域。',['midbrain'],['midbrain_tegmentum','pontine_tegmentum']],
 ['median_raphe','正中中缝核','raphe_nuclei','Median raphe nucleus',['median raphe','MRN','MnR','中缝正中核'],'核团','中缝核群成员，位于中脑—脑桥相关水平；不要与 dorsal raphe 混同。',['midbrain'],['pontomesencephalic']],
 ['medulla','延髓','brainstem','Medulla oblongata',['medulla','myelencephalon'],'脑干分区','位于脑桥尾侧并连续至脊髓；当前补充的是层级知识，不是三维分割。',['brain']],
 ['inferior_olive','下橄榄核复合体','medulla','Inferior olivary complex',['inferior olive','inferior olivary nucleus','IO','下橄榄核'],'核团复合体','属于延髓；不要与脑桥的上橄榄复合体混同。',['brain']],
 ['solitary_nucleus','孤束核','medulla','Nucleus of the solitary tract',['nucleus tractus solitarii','solitary nucleus','NTS','NST'],'核团','延髓内的核团；孤束核与孤束（纤维束）不是同一结构。',['brain']],
 ['nucleus_ambiguus','疑核','medulla','Nucleus ambiguus',['ambiguus nucleus'],'核团','延髓内的脑神经相关核团。',['brain']],
 ['gracile_nucleus','薄束核','medulla','Gracile nucleus',['nucleus gracilis'],'核团','延髓内的核团，与薄束纤维通路区分。',['brain']],
 ['cuneate_nucleus','楔束核','medulla','Cuneate nucleus',['nucleus cuneatus'],'核团','延髓内的核团，与中脑楔形核不是同义词。',['brain']],
 ['hypoglossal_nucleus','舌下神经核','medulla','Hypoglossal nucleus',['motor hypoglossal nucleus','nucleus nervi hypoglossi'],'脑神经核','延髓内的舌下神经运动核。',['brain']],
 ['amygdala_superficial','杏仁核浅表核群','amygdala','Superficial amygdala group',['superficial amygdala','SF amygdala'],'核群','对应 Julich 的 SF 标签，不将它误放到过渡区。',['atlas']],
 ['amygdala_other','其他杏仁核分区','amygdala','Other amygdala parcels',[],'待核对核群','保留 VTM、IF、MF 等原始分区；未核实的核群关系不凭缩写推断。',['atlas']],
 ['thalamus_reticular','丘脑网状核','thalamus','Thalamic reticular nucleus',['reticular nucleus of thalamus','TRN','Rt'],'核团','对应 Julich Rt；与脑干网状结构区分。',['atlas']]
];
const TERMS={
 all:['Brain',['全脑','大脑','brain atlas']],cerebrum:['Forebrain',['prosencephalon','前脑']],
 cortex:['Cerebral cortex',['cortex','大脑皮质']],frontal:['Frontal lobe',[]],parietal:['Parietal lobe',[]],temporal:['Temporal lobe',[]],occipital:['Occipital lobe',[]],
 insula:['Insula',['insular cortex','岛皮层']],cingulate:['Cingulate cortex',['cingulate gyrus','扣带回']],
 frontal_motor:['Motor and premotor cortex',['premotor cortex','运动皮层','前运动皮层']],frontal_prefrontal:['Lateral prefrontal cortex',['prefrontal cortex','PFC','前额叶']],frontal_orbital:['Orbitofrontal and frontopolar cortex',['眶额与额极']],
 parietal_somato:['Somatosensory cortex',['S1','somatosensory','躯体感觉皮层']],parietal_superior:['Superior parietal lobule',['SPL','intraparietal sulcus','IPS']],parietal_inferior:['Inferior parietal lobule',['IPL','parietal operculum']],
 temporal_auditory:['Auditory cortex',['Heschl gyrus','听觉皮层']],temporal_superior:['Superior temporal cortex',['superior temporal gyrus','STG','superior temporal sulcus','STS']],
 occipital_early:['Early visual cortex',['早期视觉皮层']],occipital_extra:['Extrastriate visual cortex',['纹外皮层']],
 cingulate_anterior:['Anterior cingulate cortex',['ACC','前扣带皮层']],cingulate_subgenual:['Subgenual anterior cingulate cortex',['sACC','sgACC','膝下前扣带']],
 transition_tpj:['Temporoparietal junction',['TPJ','temporo-parietal junction','颞顶联合区']],
 medial:['Medial temporal structures',['medial temporal lobe','MTL','内侧颞叶']],hippocampus:['Hippocampal formation',['hippocampus','海马']],hippocampal_fields:['Hippocampus proper',['Cornu ammonis','CA fields','海马本体']],dentate:['Dentate gyrus',['DG','齿状回']],subicular:['Subicular complex',['subiculum','下托']],entorhinal:['Entorhinal cortex',['EC']],
 amygdala:['Amygdala',[]],amygdala_basolateral:['Basolateral amygdala group',['BLA','basolateral amygdala']],amygdala_centromedial:['Centromedial amygdala group',['centromedial amygdala','CM amygdala']],amygdala_corticomedial:['Corticomedial amygdala group',[]],
 deep:['Telencephalic subcortical gray matter',['皮层下灰质']],basal:['Basal ganglia',['basal nuclei','基底节']],dorsal_striatum:['Dorsal striatum',[]],ventral_striatum:['Ventral striatum',['VS']],caudate:['Caudate nucleus',['caudate']],putamen:['Putamen',[]],nucleus_accumbens:['Nucleus accumbens',['NAc','NAcc','Acb']],dorsal_pallidum:['Dorsal pallidum',['globus pallidus','GP','苍白球']],ventral_basal_ganglia:['Ventral basal ganglia',[]],ventral_pallidum:['Ventral pallidum',['VP']],
 forebrain:['Basal forebrain',['BF']],basal_forebrain_cholinergic:['Cholinergic basal forebrain',['胆碱能基底前脑']],extended_amygdala:['Extended amygdala related structures',['BNST','BST','bed nucleus of the stria terminalis','终纹床核']],olfactory_forebrain:['Olfactory basal forebrain',['olfactory tubercle','Tu','嗅结节']],
 diencephalon:['Diencephalon',['间脑']],thalamus:['Thalamus',[]],thalamus_geniculate:['Geniculate bodies',['LGN','MGN','lateral geniculate','medial geniculate','外侧膝状体','内侧膝状体']],thalamus_anterior:['Anterior thalamic nuclei',[]],thalamus_medial:['Medial thalamic nuclei',['mediodorsal thalamus','MD']],thalamus_posterior:['Posterior thalamic nuclei',['pulvinar','丘脑枕']],thalamus_intralaminar:['Intralaminar and midline thalamic nuclei',['intralaminar thalamus','midline thalamus']],thalamus_ventrolateral:['Ventral and lateral thalamic nuclei',[]],
 subthalamus:['Subthalamus',[]],subthalamic_nucleus:['Subthalamic nucleus',['STN']],zona_incerta:['Zona incerta',['ZI']],hypothalamus:['Hypothalamus',[]],epithalamus:['Epithalamus',['上丘脑']],
 brainstem:['Brainstem',['brain stem','truncus encephali']],midbrain:['Midbrain',['mesencephalon']],substantia_nigra:['Substantia nigra',['SN','黑质']],red_nucleus:['Red nucleus',['nucleus ruber','RN']],ventral_tegmental:['Ventral tegmental area',['VTA','area tegmentalis ventralis','腹侧被盖区','腹侧被盖']],
 cerebellum:['Cerebellum',[]],cerebellar_lobules:['Cerebellar lobules',['小脑皮层']],cerebellar_hemisphere:['Cerebellar hemispheres',[]],cerebellar_vermis:['Cerebellar vermis',['vermis','蚓部']],cerebellar_nuclei:['Deep cerebellar nuclei',[]],cerebellar_medial_nuclei:['Fastigial and interposed nuclei',['fastigial nucleus','interposed nucleus','小脑顶核','小脑中间核']],dentate_nucleus:['Dentate nucleus',['小脑齿状核']]
};
export function installCatalog(nav){
 for(const [id,label,parent,english,aliases,kind,note,references,related=[]] of EXTRA){nav[id]={label,parent,english,aliases,kind,note,references,related,color:nav[parent]?.color||'#a9b7ca'};}
 for(const [id,[english,aliases]] of Object.entries(TERMS))if(nav[id])Object.assign(nav[id],{english,aliases});
 // Keep existing IDs; distinguish the forebrain from its telencephalic subdivision.
 Object.assign(nav.cerebrum,{label:'前脑',note:'前脑包括端脑和间脑，两者不是同义词。'});
 for(const id of ['cortex','medial','deep'])nav[id].parent='telencephalon';
 nav.deep.note='端脑深部灰质的导航分组；间脑结构另列在前脑之下。';
 Object.assign(nav.diencephalon,{parent:'cerebrum',label:'间脑',note:'包括丘脑、下丘脑、上丘脑和丘脑底区等。'});
 nav.thalamus.parent='diencephalon';nav.subthalamus.parent='diencephalon';
 Object.assign(nav.epithalamus,{note:'间脑的一个分区，包括缰核复合体、松果体及相关纤维结构。当前关联的缰核和松果体只是已收录部分，不是整个上丘脑的连续边界；各来源保留自己的分割空间。',references:['epithalamus','pineal']});
 nav.entorhinal.parent='medial';
 Object.assign(nav.ventral_tegmental,{parent:'midbrain_tegmentum',label:'腹侧被盖区（VTA）',note:'VTA 位于中脑被盖。当前关联 CIT168 的 VTA 标签；不代表整个被盖，也不自动合并 PBP。',references:['midbrain','atlas']});
 nav.red_nucleus.parent='midbrain_tegmentum';
 nav.substantia_nigra.note='黑质位于中脑，被盖与脚底的交界附近；保留致密部和网状部的各图谱定义。';
 nav.amygdala_centromedial.label='中央内侧核群';
 nav.brainstem.note='脑干分为中脑、脑桥和延髓。模型只覆盖部分核团；其他条目仍可查看从属关系。';
 for(const [id,n] of Object.entries(nav)){n.english??=id.replaceAll('_',' ');n.aliases??=[];n.references??=['atlas'];n.related??=[];}
}
// Deterministic source-label crosswalk. Geometry and persistent IDs are never renamed.
const JULICH={18:'red_nucleus',109:'red_nucleus',93:'substantia_nigra',181:'substantia_nigra',88:'subthalamic_nucleus',15:'zona_incerta',16:'thalamus_geniculate',92:'thalamus_geniculate',38:'extended_amygdala',51:'olfactory_forebrain',154:'olfactory_forebrain',68:'ventral_striatum',136:'ventral_striatum',113:'basal_forebrain_cholinergic',166:'basal_forebrain_cholinergic',119:'nucleus_accumbens',202:'nucleus_accumbens',185:'ventral_pallidum',75:'amygdala_basolateral',141:'amygdala_centromedial',191:'amygdala_superficial',5:'amygdala_transition',66:'amygdala_other',149:'amygdala_other',188:'amygdala_other',172:'subicular',173:'subicular',52:'thalamus_reticular',39:'thalamus_anterior',184:'thalamus_anterior',74:'thalamus_medial',138:'thalamus_medial',61:'thalamus_intralaminar',79:'thalamus_intralaminar',131:'thalamus_intralaminar',156:'thalamus_intralaminar',190:'thalamus_intralaminar',9:'thalamus_posterior',23:'thalamus_posterior',24:'thalamus_posterior',47:'thalamus_posterior',63:'thalamus_posterior',81:'thalamus_posterior',103:'thalamus_posterior',169:'thalamus_posterior',12:'thalamus_ventrolateral',31:'thalamus_ventrolateral',45:'thalamus_ventrolateral',125:'thalamus_ventrolateral',137:'thalamus_ventrolateral',151:'thalamus_ventrolateral',168:'thalamus_ventrolateral',176:'thalamus_ventrolateral',178:'thalamus_ventrolateral',193:'thalamus_ventrolateral',194:'thalamus_ventrolateral'};
const CIT=['putamen','caudate','nucleus_accumbens','extended_amygdala','dorsal_pallidum','dorsal_pallidum','substantia_nigra','red_nucleus','substantia_nigra','parabrachial_pigmented','ventral_tegmental','ventral_pallidum','habenular_complex','hypothalamus','hypothalamus','subthalamic_nucleus'];
export function canonicalGroup(e){
  if(e.atlas==='allen2020'&&e.label===10460)return 'pineal_gland';
 if(e.atlas==='julich'&&JULICH[e.label])return JULICH[e.label];
 if(e.atlas==='cit168'&&Number.isInteger(e.label)&&e.label>=1&&e.label<=32)return CIT[Math.floor((e.label-1)/2)];
 if(e.category==='midbrain'){
  const name=String(e.name||'').replace(/[-_]/g,' ');
  if(/substantia\s+nigra|\bSN[CR]\b/i.test(name))return 'substantia_nigra';
  if(/red nucleus|nucleus ruber|\b(?:RN|NRp|NRm)\b/i.test(name))return 'red_nucleus';
  if(/ventral tegmental area|\bVTA\b/i.test(name))return 'ventral_tegmental';
  if(/parabrachial pigmented/i.test(name))return 'parabrachial_pigmented';
  return 'midbrain_other';
 }
 return null;
}
export function parcelAliases(e){
 const s=String(e.name||'');const names=[];
 if(/Ch 4/.test(s))names.push('Ch4','Meynert','nucleus basalis of Meynert','Meynert基底核');
 if(/pars[ -]compacta/i.test(s))names.push('SNc','SNC','黑质致密部');
 if(/pars[ -]reticulata/i.test(s))names.push('SNr','SNR','SNpr','黑质网状部');
 if(/\bNRp\b|parvocellular part/i.test(s)&&/Ruber|NRp/.test(s))names.push('NRp','红核小细胞部');
 if(/\bNRm\b|magnocellular part/i.test(s)&&/Ruber|NRm/.test(s))names.push('NRm','红核大细胞部');
 if(/Globus Pallidus externa/i.test(s))names.push('GPe','苍白球外侧部');
 if(/Globus Pallidus interna/i.test(s))names.push('GPi','苍白球内侧部');
 if(/CGL \(/.test(s))names.push('LGN','lateral geniculate nucleus','外侧膝状体');
 if(/CGM \(/.test(s))names.push('MGN','medial geniculate nucleus','内侧膝状体');
 return names;
}
