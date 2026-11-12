// Short, curated learning notes. These do not change atlas geometry or saved IDs.
// A family overview is labelled explicitly; cytoarchitectonic parcels are not
// assigned invented one-to-one functions. See KNOWLEDGE.md for editorial policy.
export const KNOWLEDGE_VERSION='2026-11-12.1';
const ref=(title,url)=>({title,url});
const ut=(title,path)=>ref('UTHealth · '+title,'https://nba.uth.tmc.edu/neuroscience/'+path+'.html');
export const KNOWLEDGE_SOURCES={
 overview:ref('NIMH · Get to Know Your Brain','https://www.nimh.nih.gov/news/media/2023/get-to-know-your-brain'),
 atlas:ref('Julich-Brain · 细胞构筑图谱','https://julich-brain-atlas.de/atlas'),
 motor:ut('Motor Cortex','s3/chapter03'),
 somato:ut('Somatosensory Processes','s2/chapter05'),
 somatoPath:ut('Somatosensory Pathways','s2/chapter04'),
 vision:ut('Visual Processing: Cortical Pathways','s2/chapter15'),
 auditory:ut('Auditory System: Pathways and Reflexes','s2/chapter13'),
 association:ut('Association and Executive Processing','s4/chapter09'),
 language:ut('Language','s4/chapter08'),
 hippocampus:ut('Limbic System: Hippocampus','s4/chapter05'),
 amygdala:ut('Limbic System: Amygdala','s4/chapter06'),
 basal:ut('Basal Ganglia','s3/chapter04'),
 cerebellum:ut('Cerebellum','s3/chapter05'),
 hypothalamus:ut('Hypothalamus: Structural Organization','s4/chapter01'),
 autonomic:ut('Autonomic Nervous System and Thermoregulation','s4/chapter03'),
 amines:ut('Biogenic Amine Neurotransmitters','s1/chapter12'),
 acetylcholine:ut('Acetylcholine Neurotransmission','s1/chapter11'),
 descendingMotor:ut('Descending Motor Pathways','s3/chapter02'),
 olfaction:ut('Olfaction and Gustation','s2/chapter09'),
 eye:ut('Ocular Motor Control','s3/chapter08'),
 thalamus:ref('UTHealth · Thalamic Nuclei','https://nba.uth.tmc.edu/neuroanatomy/l5/Lab05p10_index.html'),
 brainstem:ref('Human Protein Atlas · 脑干解剖分区','https://www.proteinatlas.org/humanproteome/brain/midbrain'),
 insula:ref('Deen et al., 2011 · 岛叶的三类功能连接','https://pubmed.ncbi.nlm.nih.gov/21097516/'),
 amygdalaGroups:ref('Bzdok et al., 2013 · 人类杏仁核亚区','https://pubmed.ncbi.nlm.nih.gov/22806915/'),
 ca2:ref('Hitti & Siegelbaum, 2014 · 小鼠 CA2 与社会记忆','https://doi.org/10.1038/nature13028'),
 separation:ref('Lacy et al., 2011 · 人类 CA3/DG 与 CA1 的记忆表征','https://learnmem.cshlp.org/content/18/1/15.full'),
 cerebellarMap:ref('Buckner et al., 2011 · 人类小脑功能连接图谱','https://pubmed.ncbi.nlm.nih.gov/21795627/'),
 habenula:ref('Lawson et al., 2014 · 人类缰核与负性动机价值','https://pmc.ncbi.nlm.nih.gov/articles/PMC4136587/'),
 lateralHabenula:ref('Matsumoto & Hikosaka, 2007 · 猴外侧缰核与奖励信号','https://pubmed.ncbi.nlm.nih.gov/17522629/'),
 pineal:ref('Endotext · 松果体与褪黑素生理','https://www.ncbi.nlm.nih.gov/books/NBK550972/'),
 yeo:ref('Yeo et al., 2011 · 人类皮层 7 / 17 网络','https://doi.org/10.1152/jn.00338.2011'),
 schaefer:ref('Schaefer et al., 2018 · 功能皮层分区','https://doi.org/10.1093/cercor/bhx179'),
 olfactoryCircuit:ref('Zhou et al., 2019 · 人类嗅觉皮层连接','https://doi.org/10.7554/eLife.47177'),
 frontalPole:ref('Bludau et al., 2014 · 人类额极 Fp1 / Fp2','https://pubmed.ncbi.nlm.nih.gov/23702412/'),
 retrosplenial:ref('Takahashi et al., 1997 · 压后皮层损伤与定向障碍','https://pubmed.ncbi.nlm.nih.gov/9270578/'),
 md:ref('Peräkylä et al., 2017 · 人类丘脑背内侧核与工作记忆','https://pubmed.ncbi.nlm.nih.gov/28777058/'),
 reticular:ref('Wimmer et al., 2015 · 丘脑网状核与注意选择','https://doi.org/10.1038/nature15398')
};

// Each profile is deliberately short enough to read beside the model.
const p=(title,summary,sources,hint='')=>({title,summary,sources,hint});
export const PROFILES={
 forebrain:p('前脑','包含端脑与间脑。将感知、记忆、动机和行动组织起来，也通过下丘脑等结构调节身体内部状态。',['overview','hypothalamus']),
 telencephalon:p('端脑','左右大脑半球及其深部结构的总称。皮层与基底节、海马、杏仁核等协作，支持感知、学习和行为选择。',['overview','basal']),
 cortex:p('大脑皮层','大脑表面的灰质，包含感觉、运动和联合区。复杂能力依赖多个区域协作，一个脑区通常参与多种功能。',['overview','association']),
 frontal:p('额叶','位于大脑前部，参与制定计划、保持目标、控制行为及组织随意运动。不同亚区还参与语言和价值判断。',['motor','language','association']),
 motor:p('运动与前运动皮层','把动作目标转化为运动计划和指令。初级运动区更接近动作执行，前运动区和辅助运动区更多参与准备与组织。',['motor']),
 m1:p('初级运动皮层','位于中央前回，是皮层向下控制随意运动的重要出口。主要影响对侧身体，尤其参与精细动作。',['motor']),
 sma:p('辅助运动区','位于额叶内侧，参与组织动作序列和双手协调，尤其与内部发起的动作有关。',['motor']),
 presma:p('前辅助运动区','位于辅助运动区前方，参与选择、切换和重新组织动作计划；与动作执行的关系较间接。',['motor']),
 premotor:p('前运动皮层','位于初级运动皮层前方，把感觉线索和当前目标用于动作准备，例如看到物体后准备伸手。',['motor']),
 sensorimotor:p('感觉运动皮层','中央沟两侧的区域将身体感觉与运动控制联系起来，参与触觉、本体感觉和随意动作。',['motor','somato']),
 fef:p('额眼区','额叶中参与控制眼动的区域，帮助根据目标选择注视位置，也与视觉空间注意相联系。',['eye']),
 prefrontal:p('外侧前额叶','帮助暂时保持并操作信息，依据目标选择规则、分配注意和调整行为，是工作记忆与认知控制的重要参与者。',['association']),
 broca:p('额下回 44 / 45 区','参与语言表达及对语音、句法或语义的选择与组合。多数人的语言加工偏左侧，但两侧也参与其他控制任务。',['language'],'44 / 45 区不是独立完成语言的单一中枢。'),
 orbitalPole:p('眶额与额极','包含功能不同的前额叶区域：眶额皮层参与价值和结果评估，额极参与更长程的目标与计划协调。',['association','olfaction']),
 ofc:p('眶额皮层','位于额叶底面，结合气味、味觉及情境评估结果的价值，并随经验调整选择。也是较高级嗅觉加工的重要区域。',['olfaction','association']),
 pole:p('额极','位于额叶最前端，参与保持长程目标、考虑备选方案及协调多个任务。它与眶额皮层相邻，但不是同一区域。',['frontalPole']),
 frontalOperculum:p('额叶岛盖','覆盖岛叶前上方，参与口面动作、言语及任务控制；邻近的岛盖—岛叶系统也参与味觉加工。',['language','olfaction']),
 parietal:p('顶叶','整合触觉、视觉与身体位置信息，支持空间注意、身体表征和视觉引导的动作。部分区域也参与数量与语言加工。',['somato','association']),
 somato:p('初级躯体感觉皮层','位于中央后回及邻近区域，处理对侧身体的触觉和位置感觉，帮助判断哪里被碰到、肢体处于什么姿态。',['somato']),
 area3a:p('3a 区','初级躯体感觉皮层的一部分，较多处理来自肌肉等的本体感觉，帮助感知肢体位置和运动状态。',['somato']),
 area3b:p('3b 区','初级躯体感觉皮层的重要皮肤感觉入口，处理触碰位置和局部触觉特征。',['somato']),
 area1:p('1 区','接收并进一步处理初级躯体感觉信息，参与辨别表面纹理等触觉特征。',['somato']),
 area2:p('2 区','整合皮肤触觉与本体感觉，参与判断物体的大小、形状及手部姿态。',['somato']),
 superiorParietal:p('顶上小叶与顶内沟','将视觉与身体位置信息结合，支持空间注意、伸手抓握和动作引导。不同细分区的侧重并不相同。',['association','motor']),
 inferiorParietal:p('顶下小叶','整合多种感觉与情境信息，参与注意、动作理解、语言和记忆等过程；角回与缘上回的功能有所不同。',['association','language']),
 angular:p('角回','位于顶下小叶后部，参与语义整合、情景回忆和多模态信息联系，部分范围与默认模式网络重叠。',['language','yeo']),
 supramarginal:p('缘上回','位于顶下小叶前部，参与感觉—动作整合、动作相关加工和语音加工，功能随侧别与亚区而变化。',['language','somato']),
 parietalOperculum:p('顶叶岛盖','外侧裂深处的躯体感觉加工区域，包含次级躯体感觉相关分区，参与触觉辨别及身体感觉整合。',['somato']),
 temporal:p('颞叶','参与声音、物体和语义信息的加工；内侧颞叶结构则对形成新记忆十分重要。颞叶不是单一的记忆区。',['auditory','language','hippocampus']),
 auditory:p('听觉皮层','分析声音的频率、时间变化等特征，再与周围区域协作识别声音和言语。颞横回包含较早期的听觉皮层。',['auditory']),
 superiorTemporal:p('颞上回与颞上沟','参与较复杂的声音、言语和多模态线索加工；部分颞上沟区域还对生物运动与社会线索敏感。',['auditory','language','association']),
 parahippocampalPiriform:p('海马旁与梨状皮层','这是两个相邻区域的浏览分组：海马旁皮层侧重场景与记忆情境，梨状皮层侧重气味加工。',['hippocampus','olfaction']),
 parahippocampal:p('海马旁皮层','位于内侧颞叶，与海马记忆系统相连，参与场景、环境布局和情境信息的加工。',['hippocampus']),
 piriform:p('梨状皮层','接受嗅球输入，是初级嗅觉皮层的重要组成。参与形成气味表征，并与情绪、记忆和价值相关区域协作。',['olfaction','olfactoryCircuit']),
 occipital:p('枕叶','位于大脑后部，包含多级视觉区域，逐步处理视野位置、边缘、形状、颜色和运动等信息。',['vision']),
 earlyVisual:p('早期视觉皮层','保留视野位置的有序映射，提取局部边缘和方向等特征，并把视觉信息传给后续加工区域。',['vision']),
 v1:p('初级视觉皮层 V1','主要位于距状沟周围，接收外侧膝状体输入，按视野位置分析边缘、方向等基本视觉特征。',['vision']),
 v2:p('次级视觉皮层 V2','接续 V1 的视觉加工，将局部特征进一步整合为轮廓、纹理和深度等信息，并与多条视觉通路相连。',['vision']),
 extrastriate:p('纹外视觉皮层','位于 V1 之外，进一步处理视觉形状、颜色、空间和运动信息。不同区域参与“是什么”及“在哪里、如何行动”等加工。',['vision']),
 mt:p('运动相关视觉皮层','hOc5 与运动敏感的 MT/V5 区域密切相关，参与判断物体运动的方向和速度。组织学与功能边界并非完全重合。',['vision','atlas']),
 ventralVisual:p('腹侧枕颞皮层','参与把视觉特征组合为可识别的物体、面孔或文字。不同亚区各有偏重，不能把整个梭状回都当作面孔区。',['vision','language']),
 parietoOccipital:p('顶枕交界','连接视觉加工与内侧顶叶的空间处理，参与场景、空间关系及视觉引导行为。不同分区的功能仍需结合具体任务。',['vision','association']),
 tpj:p('颞顶交界','位于颞叶与顶叶相接处，参与注意转移和社会信息加工等过程。不同实验所称 TPJ 的范围可能不同。',['association','yeo']),
 transition:p('跨叶交界区域','脑叶交界处常包含多模态联合皮层，连接不同信息加工系统；具体作用要看选中的颞顶、顶枕或枕颞区域。',['association']),
 insula:p('岛叶','隐藏在外侧裂深处，参与身体内部感受、味觉、疼痛及显著信息的整合，并与情绪和行为控制相联系。',['insula','olfaction']),
 granularInsula:p('粒状岛叶','主要位于岛叶较后部，较多参与身体感觉、痛温及内脏信号加工，是形成身体状态表征的参与区域。',['insula'],'颗粒类型与前后部功能分区并非一一对应。'),
 dysgranularInsula:p('异颗粒岛叶','处于岛叶细胞构筑的过渡范围，参与感觉、内脏状态与情绪信息的整合；各编号亚区不宜硬分配单一功能。',['insula','atlas']),
 agranularInsula:p('无颗粒岛叶','主要位于岛叶前腹侧，与眶额、杏仁核等相联系，参与身体状态、情绪和化学感觉信息的整合。',['insula','olfaction'],'不等于所有前岛叶，也不是完整的次级嗅觉皮层。'),
 cingulate:p('扣带皮层','沿胼胝体周围分布，连接情绪、行动与记忆系统。前部更多参与行为和身体状态调节，后部更多参与内部思考与记忆。',['association','yeo']),
 acc:p('前扣带皮层','参与将情绪、身体状态和任务需求用于行为调节，包括监控结果与调整行动；不同前扣带亚区的侧重有差异。',['association','autonomic']),
 subgenual:p('膝下扣带','位于胼胝体膝下方，与情绪、奖赏及自主神经调节相关区域紧密相连，参与情绪与身体状态的协调。',['autonomic','amygdala']),
 posteromedial:p('后内侧皮层','包含后扣带、压后皮层及邻近内侧顶叶范围，参与情景记忆、场景和内部导向加工。它是区域总称，不是单一脑区。',['hippocampus','yeo']),
 pcc:p('后扣带皮层','是默认模式网络的重要参与区域，常见于情景回忆、自我相关思考及内部与外部注意的调节。',['yeo','hippocampus']),
 retrosplenial:p('压后皮层','靠近胼胝体压部，连接场景、方向和记忆信息，帮助利用熟悉地标确定方位。',['retrosplenial']),
 precuneus:p('楔前叶','位于顶叶内侧，参与空间表象、情景回忆和自我相关加工。其不同部分连接不同网络，不能全部等同于 DMN。',['association','yeo']),
 medialTemporal:p('内侧颞叶结构','海马及邻近皮层帮助形成情景记忆，杏仁核更多参与情绪与重要性学习。这些相邻结构协作，但并不等同。',['hippocampus','amygdala']),
 hippocampus:p('海马结构','把经历中的人物、地点与情境联系起来，帮助形成新的情景记忆，也参与空间导航。它不是存放所有记忆的永久仓库。',['hippocampus']),
 ca:p('海马 CA 区','是海马本体的主要亚区，接收并传递记忆相关信息。CA1、CA2、CA3 的连接与计算特性不同。',['hippocampus']),
 ca1:p('海马 CA1','海马的重要输出环节，整合来自 CA3 与内嗅皮层的信息，参与情景记忆的编码、提取及新旧信息比较。',['hippocampus','separation']),
 ca2:p('海马 CA2','位于 CA1 与 CA3 之间的特殊亚区。小鼠研究显示它对识别熟悉同伴的社会记忆很重要。',['ca2'],'动物实验发现不能直接等同于已证实的人类功能。'),
 ca3:p('海马 CA3','具有丰富的局部回返连接，参与联结记忆；利用部分线索恢复已有记忆，是其重要计算模型之一。',['hippocampus','separation'],'人类 fMRI 常将 CA3 与齿状回合测，需留意分辨率。'),
 dentate:p('齿状回','接收内嗅皮层输入并联系 CA3，参与把相似经历区分开，减少记忆混淆；这种过程常称为模式分离。',['hippocampus','separation']),
 subicular:p('下托复合体','位于海马与周围皮层之间，是海马向皮层和皮层下传递信息的重要通路，参与记忆及空间情境加工。',['hippocampus'],'下托复合体的范围可能大于论文所称的单一下托。'),
 entorhinal:p('内嗅皮层','连接海马与广泛皮层，是记忆信息进出海马系统的重要接口，参与表征位置、对象及其关系。',['hippocampus']),
 hippocampalTransition:p('海马过渡区域','连接海马与相邻皮层或杏仁核范围，可放在记忆—情绪系统中理解；这些过渡标签本身不意味着一种独立功能。',['hippocampus','atlas']),
 amygdala:p('杏仁核','一组内侧颞叶核团，学习刺激的情绪与生物学意义，并影响记忆和身体反应。除了威胁，也参与奖励与社会信息加工。',['amygdala']),
 basolateral:p('杏仁核外侧基底核群','整合多种感觉与情境信息，参与学习线索与重要结果的联系，并调节情绪记忆。',['amygdala','amygdalaGroups']),
 centromedial:p('杏仁核中央内侧核群','与下丘脑、脑干及运动相关系统联系，参与把情绪相关信息转化为自主神经和行为反应。',['amygdala','amygdalaGroups']),
 superficialAmygdala:p('杏仁核浅表核群','与嗅觉及情绪相关区域相连，参与气味和社会情绪线索的加工；图谱的整个浅表核群不等于单个嗅觉亚核。',['amygdalaGroups','olfactoryCircuit']),
 corticomedial:p('杏仁核皮质内侧区域','包含与嗅觉和内脏状态有关的杏仁核范围，参与将气味等线索与情绪、动机联系起来。',['amygdala','olfaction']),
 amygdalaTransition:p('杏仁核过渡区域','处于杏仁核与邻近结构交界，适合结合情绪学习及纹状体等相邻系统理解；单独亚区的功能证据仍有限。',['amygdala','atlas']),
 amygdalaOther:p('杏仁核细分区','属于杏仁核的细胞构筑细分范围。可先了解杏仁核如何评估情绪和重要性；这些细小分区的独立人类功能尚不宜明确断言。',['amygdala','atlas']),
 deep:p('皮层下灰质','大脑深部的多个核团系统，参与动作选择、学习、情绪和动机。这里的结构功能不同，不能视为一个统一的“中心”。',['basal','amygdala']),
 basal:p('基底神经节','通过与皮层、丘脑相连的回路，帮助选择和调节动作，并参与习惯、强化学习及认知控制。',['basal']),
 dorsalStriatum:p('背侧纹状体','主要包括尾状核和壳核，是皮层信息进入基底节的重要入口，参与依据经验选择行为与形成熟练动作。',['basal']),
 caudate:p('尾状核','纹状体的一部分，与前额叶等区域构成回路，参与目标导向的行为选择、学习及眼动控制。',['basal']),
 putamen:p('壳核','纹状体的一部分，广泛连接感觉运动皮层，参与动作调节、技能学习及熟练行为的形成。',['basal']),
 ventralStriatum:p('腹侧纹状体','将奖励、情境和情绪信息用于动机与行为选择。伏隔核是重要组成，但腹侧纹状体不只包括伏隔核。',['basal','amygdala']),
 accumbens:p('伏隔核','腹侧纹状体的重要部分，参与奖励学习、动机和付出努力的行为选择，不能简单称作“快乐中心”。',['basal','amines']),
 pallidum:p('苍白球','参与基底节回路中的信息调节。外侧部多参与内部回路，内侧部是向丘脑等结构输出的重要环节。',['basal']),
 gpe:p('苍白球外侧部','与纹状体、丘脑底核及其他基底节结构相连，以抑制性信号调节回路活动，参与动作控制。',['basal']),
 gpi:p('苍白球内侧部','基底节的重要输出核团，持续调节丘脑及脑干活动，帮助控制哪些动作得到执行。',['basal']),
 ventralPallidum:p('腹侧苍白球','接收腹侧纹状体等输入，参与将奖励和动机转化为行为，是腹侧基底节的重要输出结构。',['basal','amygdala'],'腹侧苍白球与腹侧纹状体不是同一结构。'),
 basalForebrain:p('基底前脑','大脑底部的多个细胞群和核团，参与皮层状态、注意、记忆及动机调节；其中的胆碱能细胞群尤为重要。',['acetylcholine','hippocampus']),
 cholinergic:p('胆碱能基底前脑','向皮层和海马系统提供乙酰胆碱调节，帮助调节注意、学习及记忆状态；不同细胞群投射目标不同。',['hippocampus','acetylcholine']),
 ch4:p('Ch4 / Meynert 基底核','基底前脑的胆碱能细胞群，广泛调节大脑皮层活动，参与注意与学习记忆。它不代表整个基底前脑。',['acetylcholine','association']),
 ch123:p('Ch1–3 胆碱能细胞群','主要涉及内侧隔区及斜角带等范围，调节海马等目标区域的活动，参与记忆相关状态。',['hippocampus','acetylcholine']),
 extendedAmygdala:p('扩展杏仁核相关结构','包括终纹床核等相互联系的区域，参与持续的威胁、应激与动机调节，并联系自主神经和内分泌反应。',['amygdala','autonomic']),
 tubercle:p('嗅结节','兼具嗅觉输入与腹侧纹状体联系，把气味信息与奖励、动机和趋避行为联系起来。',['olfaction','olfactoryCircuit']),
 terminalIslands:p('嗅结节终末岛','嗅结节相关的细胞构筑结构，可结合气味—动机系统理解；其独立人类功能证据有限。',['olfaction','atlas'],'这是 TuTi 标签，不等于整个嗅结节 Tu。'),
 thalamus:p('丘脑','由许多功能不同的核团组成，调节感觉、运动和皮层之间的信息交流，也参与注意、记忆与觉醒。',['thalamus']),
 anteriorThalamus:p('丘脑前部记忆相关核群','与乳头体、扣带及海马系统相联系，参与情景记忆和空间方向信息的处理。',['thalamus','hippocampus']),
 md:p('丘脑背内侧核','与前额叶紧密相连，参与保持和调整任务相关信息、学习及决策；也联系嗅觉和情绪相关系统。',['thalamus','md']),
 motorThalamus:p('丘脑运动相关核群','联系基底节、小脑与运动皮层，参与调节动作准备和执行。不同核团接收的输入有所区别。',['thalamus','motor']),
 posteriorThalamus:p('丘脑后部核群','与感觉和联合皮层相连，参与感觉信息的整合与调节；细小核团的独立功能应结合具体实验。',['thalamus']),
 pulvinar:p('丘脑枕','丘脑后部的核群，联系视觉及联合皮层，参与注意选择和皮层间信息协调；各亚部的连接不同。',['thalamus','vision']),
 geniculate:p('膝状体','包含两个不同的感觉中继：外侧膝状体通往视觉皮层，内侧膝状体通往听觉皮层。',['vision','auditory']),
 lgn:p('外侧膝状体','丘脑中的视觉中继，接收视网膜信息并传向初级视觉皮层，同时受注意和皮层反馈调节。',['vision']),
 mgn:p('内侧膝状体','丘脑中的听觉中继，接收下丘等输入并传向听觉皮层，参与声音信息的选择与处理。',['auditory']),
 intralaminar:p('丘脑板内与中线核群','联系皮层和纹状体，参与觉醒、注意及行为状态的调节；不同核团还联系记忆和动机系统。',['thalamus']),
 cmThalamus:p('丘脑中央中核','属于板内核群，与纹状体及运动相关系统联系，参与注意和行为状态的调节。',['thalamus'],'此处 CM 是丘脑中央中核，不是杏仁核中央内侧核群。'),
 vpl:p('丘脑腹后外侧核','将来自躯干和四肢的触觉、本体感觉及部分痛温信息中继到躯体感觉皮层。',['somatoPath']),
 vpm:p('丘脑腹后内侧核','主要处理中继来自面部的躯体感觉，与处理躯干和四肢的 VPL 相区别。',['somatoPath']),
 vpmpc:p('丘脑腹后内侧核小细胞部','是灵长类味觉通路的重要丘脑中继，联系脑干味觉输入与岛叶—岛盖味觉皮层。',['olfaction']),
 reticular:p('丘脑网状核','包绕丘脑的薄层抑制性核团，调节其他丘脑核团的信息通行，参与注意及睡眠节律。',['thalamus','reticular'],'它不直接把感觉信息投射到大脑皮层。'),
 subthalamus:p('丘脑底区','位于丘脑腹侧，包含丘脑底核和未定带等结构，参与运动及感觉—行为状态调节。',['basal','brainstem']),
 stn:p('丘脑底核','基底节回路中的兴奋性核团，参与调节动作选择与抑制。功能上联系基底节，解剖上位于间脑。',['basal']),
 zi:p('未定带','位于丘脑腹侧的异质核团区域，联系感觉、运动和状态调节系统；不同部分作用不同，不能归为单一功能。',['atlas','brainstem']),
 diencephalon:p('间脑','包含丘脑、下丘脑、上丘脑和丘脑底区等，连接信息中继、身体稳态、节律与行为调节。',['hypothalamus','thalamus']),
 hypothalamus:p('下丘脑','协调体温、饮食、饮水和昼夜节律，通过自主神经与垂体调节身体状态，使行为与内部需求相适应。',['hypothalamus','autonomic']),
 mammillary:p('乳头核','位于下丘脑乳头体内，与海马及丘脑前核联系，参与记忆和方向信息处理；不是单纯的内分泌核团。',['hippocampus','hypothalamus']),
 epithalamus:p('上丘脑','包含缰核与松果体等功能不同的结构：缰核联系动机与学习系统，松果体通过褪黑素传递昼夜节律信息。',['habenula','pineal']),
 habenula:p('缰核复合体','位于丘脑后上方，连接前脑与中脑调节系统，参与奖励、厌恶和行为调整。内侧与外侧缰核的回路不同。',['habenula'],'现有整枚缰核模型不能区分内、外侧亚核。'),
 lateralHabenula:p('外侧缰核','参与对不利结果及奖励缺失的学习，并影响中脑调节系统；猴实验发现它可传递负性奖励信号。',['lateralHabenula','habenula']),
 medialHabenula:p('内侧缰核','主要通过缰核—脚间核通路联系中脑，参与状态与动机调节。其作用与外侧缰核并不相同。',['brainstem','atlas']),
 pineal:p('松果体','位于中线的神经内分泌器官，夜间分泌较多褪黑素，向身体传递明暗周期和生物钟的时间信息。',['pineal']),
 stria:p('丘脑髓纹','通向缰核的传入纤维通路，帮助把前脑相关信息送入缰核调节系统；它是白质束，不是核团。',['brainstem','atlas']),
 habenularCommissure:p('缰连合','靠近松果体柄，连接两侧缰核相关区域的纤维通路。连合描述的是跨中线连接，而非独立的信息处理核团。',['brainstem','atlas']),
 posteriorCommissure:p('后连合','位于中脑导水管上端附近，包含跨中线纤维，联系眼动与瞳孔反射相关系统。',['eye']),
 brainstem:p('脑干','连接大脑、小脑与脊髓，包含调节呼吸、循环、觉醒及基本反射的核团，也有大量感觉和运动通路通过。',['overview','autonomic']),
 midbrain:p('中脑','脑干的上部，包含上丘、下丘、黑质、红核和被盖等区域，参与定向反应、动作及觉醒和动机调节。',['brainstem','motor','amines']),
 nigra:p('黑质','中脑核团复合体。致密部以多巴胺调节纹状体，网状部则是基底节的重要抑制性输出，两者作用不同。',['basal','amines']),
 snc:p('黑质致密部','向纹状体提供多巴胺调节，参与动作、学习和行为选择；与以抑制性输出为主的黑质网状部不同。',['basal','amines']),
 snr:p('黑质网状部','基底节的重要抑制性输出核团，影响丘脑和上丘等结构，参与动作及眼动控制。',['basal']),
 red:p('红核','位于中脑被盖，与小脑和运动系统紧密联系。其大、小细胞部参与不同连接回路，不能视作功能完全相同。',['motor','cerebellum']),
 redSmall:p('红核小细胞部','与下橄榄核及小脑构成联系，参与运动调节相关回路；在人类红核中占较大比例。',['cerebellum']),
 redLarge:p('红核大细胞部','与红核脊髓通路相关，参与运动控制；该通路在人类相较许多其他哺乳类更为弱化。',['descendingMotor']),
 vta:p('腹侧被盖区','包含多巴胺等不同神经元，联系腹侧纹状体和前额叶，参与奖励学习、动机与行为调整。',['amines','basal']),
 pbp:p('臂旁色素核','中脑腹侧被盖相关的核团，与多巴胺系统相联系。它不是脑桥的臂旁核复合体，不能用后者的内脏感觉功能直接解释。',['brainstem','amines']),
 tectum:p('中脑顶盖','位于中脑背侧，主要包含上丘与下丘；上丘更多参与定向和眼动，下丘更多参与听觉加工。',['eye','auditory']),
 superiorColliculus:p('上丘','整合视觉及其他感觉信息，帮助把眼睛和头部转向重要目标，是快速定向反应的重要参与者。',['eye']),
 inferiorColliculus:p('下丘','中脑的主要听觉整合区域，汇集脑干听觉信息并联系内侧膝状体，参与声音的时间和空间加工。',['auditory']),
 tegmentum:p('被盖','脑干中的解剖区域总称，包含多种核团和通路，参与觉醒、运动和自主神经调节；不能等同于 VTA。',['brainstem','autonomic']),
 pag:p('导水管周围灰质','环绕中脑导水管，协调防御、疼痛调节及自主神经反应，使身体反应与当前情境相适应。',['autonomic']),
 aqueduct:p('中脑导水管','连接第三脑室与第四脑室的狭窄通道，让脑脊液流通。它是腔隙通路，没有可归属的神经计算功能。',['brainstem']),
 peduncle:p('大脑脚','位于中脑腹侧的结构区域，大脑脚底包含大量皮层下行纤维，把运动及其他信号传向脑干与脊髓。',['motor','brainstem']),
 pons:p('脑桥','位于中脑与延髓之间，连接大脑和小脑，并包含参与面部感觉运动、睡眠及呼吸调节的核团。',['cerebellum','autonomic']),
 pontineTegmentum:p('脑桥被盖','脑桥背侧的核团与通路区域，参与觉醒、睡眠、眼动及自主神经调节；其内的各核团有不同作用。',['brainstem','autonomic']),
 pontineBase:p('脑桥基底部与脑桥核','接收大脑皮层信息并经桥小脑纤维送入小脑，帮助把动作计划和认知相关信息交给小脑参与调节。',['cerebellum']),
 lc:p('蓝斑','脑桥中的主要去甲肾上腺素细胞群，广泛调节皮层和其他区域，参与觉醒、注意与应激状态。',['amines']),
 parabrachial:p('臂旁核复合体','位于脑桥，整合内脏、呼吸及味觉等身体信号，并联系下丘脑和杏仁核等调节系统。',['autonomic','olfaction']),
 dorsalTegmental:p('背侧被盖核','与乳头体等构成方向相关回路，可放在头朝向和空间定向系统中理解；精细机制主要来自动物研究。',['hippocampus']),
 pontomesencephalic:p('中脑—脑桥交界','多个觉醒和运动相关核团分布于此，联系基底节、丘脑与脑干网络；这是解剖区域，不是单一功能中心。',['amines','brainstem']),
 pedunculopontine:p('脚桥被盖核','位于中脑—脑桥交界，包含胆碱能及其他细胞群，参与觉醒、睡眠和动作调节，并与基底节相连。',['acetylcholine','basal']),
 laterodorsal:p('背外侧被盖核','位于脑桥上部附近，包含胆碱能等细胞群，与丘脑和中脑系统相连，参与觉醒、睡眠及动机调节。',['acetylcholine']),
 raphe:p('中缝核群','沿脑干中线分布，是脑内血清素的重要来源，参与睡眠—觉醒、情绪及疼痛等多种状态调节。',['amines']),
 dorsalRaphe:p('背侧中缝核','主要位于中脑附近，向前脑等区域广泛投射，参与情绪、动机及觉醒调节；血清素不是简单的“快乐信号”。',['amines']),
 medianRaphe:p('正中中缝核','位于上部脑干，向海马及其他前脑区域提供血清素等调节，参与脑状态与记忆相关活动。',['amines','hippocampus']),
 medulla:p('延髓','脑干最下部，连接脊髓，包含呼吸、循环和吞咽等重要调节回路，以及感觉上行和运动下行通路。',['autonomic','somatoPath']),
 olive:p('下橄榄核','经攀缘纤维向小脑提供信号，参与小脑的时间协调与运动学习。它与听觉通路中的上橄榄核不同。',['cerebellum']),
 solitary:p('孤束核','延髓中的内脏感觉和味觉中继，接收迷走、舌咽等输入，参与呼吸、血压及消化相关反射。',['autonomic','olfaction']),
 ambiguus:p('疑核','主要包含支配咽喉等肌肉的运动神经元，参与吞咽和发声，也含有调节心脏的迷走神经元。',['autonomic']),
 gracile:p('薄束核','延髓的躯体感觉中继，主要接收下半身的精细触觉和本体感觉，再经内侧丘系传向丘脑。',['somatoPath']),
 cuneate:p('楔束核','延髓的躯体感觉中继，主要接收上半身的精细触觉和本体感觉，与主要处理下半身信息的薄束核相区别。',['somatoPath']),
 hypoglossal:p('舌下神经核','延髓中的运动核团，支配大部分舌肌，参与舌的精细运动，从而支持进食、吞咽和发音。',['brainstem']),
 cerebellum:p('小脑','通过比较预测与反馈帮助协调、校正动作，并参与运动学习。部分区域也与语言、注意和其他认知过程相联系。',['cerebellum','cerebellarMap']),
 cerebellarCortex:p('小脑皮层分叶','小脑表面的分叶参与感觉运动与认知回路。解剖分叶边界不等于功能网络边界，同一分叶可包含不同功能区域。',['cerebellarMap']),
 cerebellarMotor:p('小脑运动相关分叶','这些分叶主要包含感觉运动表征，参与动作的协调、时序和误差校正。具体身体部位仍需结合功能定位。',['cerebellum','cerebellarMap']),
 cerebellarCrus:p('小脑 Crus I / II','与大脑联合皮层广泛联系，常见于工作记忆、语言和执行控制等认知任务；并非整个分叶只承担一种功能。',['cerebellarMap']),
 cerebellarVI:p('小脑 VI 小叶','处于运动相关与联合功能区域交汇范围，参与运动协调，也可在语言和认知任务中被招募。',['cerebellarMap']),
 cerebellarVII:p('小脑 VIIb 小叶','后叶的一部分，包含与大脑联合网络相联系的范围，参与认知及部分感觉运动处理。',['cerebellarMap']),
 cerebellarIX:p('小脑 IX 小叶','后下方的小脑分叶，不同部位涉及前庭和联合网络联系；不宜把整个 IX 小叶简单标为同一网络。',['cerebellum','cerebellarMap']),
 cerebellarX:p('小脑 X 小叶','绒球—小结叶的组成部分，与前庭系统联系，参与平衡、眼动稳定和眼头协调。',['cerebellum']),
 vermis:p('小脑蚓部','小脑中线区域，较多参与躯干、姿势、平衡及眼动协调；不同分叶还联系不同的功能回路。',['cerebellum']),
 cerebellarNuclei:p('小脑深部核团','汇集小脑皮层与传入信号，是小脑向丘脑、脑干等输出的重要通道，参与动作及其他功能的调节。',['cerebellum']),
 medialCerebellarNuclei:p('顶核与中间核','顶核更多联系姿势和平衡相关系统；中间核更多联系肢体动作调节。两者都是小脑深部输出结构。',['cerebellum']),
 fastigial:p('小脑顶核','接收蚓部等输入并联系前庭核和脑干网状结构，参与姿势、平衡以及眼头协调。',['cerebellum']),
 interposed:p('小脑中间核','接收小脑中间区等信息，联系红核和丘脑，参与肢体动作的在线调节与误差校正。',['cerebellum']),
 dentateNucleus:p('小脑齿状核','小脑最大的深部核团，联系丘脑和大脑皮层，参与动作规划，也包含与认知回路有关的范围。',['cerebellum','cerebellarMap'],'小脑齿状核不是海马的齿状回。')
};

const GROUP_PROFILES={
 cerebrum:'forebrain',telencephalon:'telencephalon',cortex:'cortex',
 frontal:'frontal',frontal_motor:'motor',frontal_prefrontal:'prefrontal',frontal_orbital:'orbitalPole',
 parietal:'parietal',parietal_somato:'somato',parietal_superior:'superiorParietal',parietal_inferior:'inferiorParietal',
 temporal:'temporal',temporal_auditory:'auditory',temporal_superior:'superiorTemporal',temporal_parahippocampal:'parahippocampalPiriform',
 occipital:'occipital',occipital_early:'earlyVisual',occipital_extra:'extrastriate',
 insula:'insula',insula_granular:'granularInsula',insula_dysgranular:'dysgranularInsula',insula_agranular:'agranularInsula',
 cingulate:'cingulate',cingulate_anterior:'acc',cingulate_subgenual:'subgenual',
 transition:'transition',transition_tpj:'tpj',transition_ventral:'ventralVisual',transition_parietooccipital:'parietoOccipital',
 posteromedial_cortex:'posteromedial',posterior_cingulate:'pcc',retrosplenial_cortex:'retrosplenial',precuneus:'precuneus',
 medial:'medialTemporal',hippocampus:'hippocampus',hippocampal_fields:'ca',dentate:'dentate',subicular:'subicular',entorhinal:'entorhinal',hippocampal_transition:'hippocampalTransition',
 amygdala:'amygdala',amygdala_basolateral:'basolateral',amygdala_corticomedial:'corticomedial',amygdala_centromedial:'centromedial',amygdala_transition:'amygdalaTransition',amygdala_superficial:'superficialAmygdala',amygdala_other:'amygdalaOther',
 deep:'deep',basal:'basal',dorsal_striatum:'dorsalStriatum',caudate:'caudate',putamen:'putamen',ventral_striatum:'ventralStriatum',nucleus_accumbens:'accumbens',dorsal_pallidum:'pallidum',ventral_basal_ganglia:'ventralPallidum',ventral_pallidum:'ventralPallidum',
 forebrain:'basalForebrain',basal_forebrain_cholinergic:'cholinergic',extended_amygdala:'extendedAmygdala',olfactory_forebrain:'tubercle',
 thalamus:'thalamus',thalamus_anterior:'anteriorThalamus',thalamus_medial:'md',thalamus_ventrolateral:'thalamus',thalamus_posterior:'posteriorThalamus',thalamus_geniculate:'geniculate',thalamus_intralaminar:'intralaminar',thalamus_reticular:'reticular',
 subthalamus:'subthalamus',subthalamic_nucleus:'stn',zona_incerta:'zi',diencephalon:'diencephalon',hypothalamus:'hypothalamus',epithalamus:'epithalamus',
 habenular_complex:'habenula',medial_habenula:'medialHabenula',lateral_habenula:'lateralHabenula',pineal_gland:'pineal',stria_medullaris:'stria',habenular_commissure:'habenularCommissure',posterior_commissure:'posteriorCommissure',
 brainstem:'brainstem',midbrain:'midbrain',substantia_nigra:'nigra',red_nucleus:'red',ventral_tegmental:'vta',parabrachial_pigmented:'pbp',
 tectum:'tectum',superior_colliculus:'superiorColliculus',inferior_colliculus:'inferiorColliculus',tegmentum:'tegmentum',midbrain_tegmentum:'tegmentum',periaqueductal_gray:'pag',cerebral_aqueduct:'aqueduct',cerebral_peduncle:'peduncle',crus_cerebri:'peduncle',
 pons:'pons',pontine_tegmentum:'pontineTegmentum',basilar_pons:'pontineBase',pontine_nuclei:'pontineBase',locus_coeruleus:'lc',parabrachial_nuclei:'parabrachial',dorsal_tegmental_nucleus:'dorsalTegmental',pontomesencephalic:'pontomesencephalic',pedunculopontine:'pedunculopontine',laterodorsal_tegmental:'laterodorsal',
 raphe_nuclei:'raphe',dorsal_raphe:'dorsalRaphe',median_raphe:'medianRaphe',medulla:'medulla',inferior_olive:'olive',solitary_nucleus:'solitary',nucleus_ambiguus:'ambiguus',gracile_nucleus:'gracile',cuneate_nucleus:'cuneate',hypoglossal_nucleus:'hypoglossal',
 cerebellum:'cerebellum',cerebellar_lobules:'cerebellarCortex',cerebellar_hemisphere:'cerebellarCortex',cerebellar_vermis:'vermis',cerebellar_nuclei:'cerebellarNuclei',cerebellar_medial_nuclei:'medialCerebellarNuclei',dentate_nucleus:'dentateNucleus'
};

// Exact, case-sensitive codes, scoped to atlas AND category. CM in amygdala
// must never match CM in thalamus; neither should Tu match TuTi or Fo match Fp.
const JULICH=new Map();
function bind(category,codes,key,scope='region'){
 for(const code of codes.split('|')){
  const identity=category+':'+code;
  if(JULICH.has(identity))throw new Error('Duplicate knowledge identity: '+identity);
  JULICH.set(identity,{key,scope});
 }
}
bind('cortex','1','area1');bind('cortex','2','area2');bind('cortex','3a','area3a');bind('cortex','3b','area3b');
bind('cortex','4a|4p','m1','family');
bind('cortex','6mp','sma');bind('cortex','6ma','presma');
bind('cortex','6r1|6d1|6d2|6d3|6v1|6v2|6v3','premotor','family');
bind('cortex','8d1|8d2|8v1|8v2|SFG2|SFG3|SFG4|MFG1|MFG2|MFG4|MFG5|IFJ1|IFJ2|IFS1|IFS2|IFS3|IFS4|SFS1|SFS2','prefrontal','family');
bind('cortex','44|45','broca','family');
bind('cortex','Fp1|Fp2','pole','family');
bind('cortex','Fo1|Fo2|Fo3|Fo4|Fo5|Fo6|Fo7','ofc','family');
bind('cortex','Op5|Op6|Op7|Op8|Op9|Op10','frontalOperculum','family');
bind('cortex','5Ci|5L|5M|7A|7M|7P|7PC|hIP1|hIP2|hIP3|hIP4|hIP5|hIP6|hIP7|hIP8','superiorParietal','family');
bind('cortex','PF|PFt|PFm|PFcm|PFop','supramarginal','family');
bind('cortex','PGa|PGp','angular','family');
bind('cortex','Op1|Op2|Op3|Op4','parietalOperculum','family');
bind('cortex','TPJ','tpj');
bind('cortex','Te 1.0|Te 1.1|Te 1.2|Te 2.1|Te 2.2|Te 3|TeI|TI','auditory','family');
bind('cortex','STS1|STS2','superiorTemporal','family');
bind('cortex','Ph1|Ph2|Ph3','parahippocampal','family');
bind('cortex','PirT|PirTB','piriform','family');
bind('cortex','FG1|FG2|FG3|FG4|FG5|CoS1|OTS1','ventralVisual','family');
bind('cortex','hOc1','v1');bind('cortex','hOc2','v2');bind('cortex','hOc5','mt');
bind('cortex','hOc3d|hOc3v|hOc4d|hOc4v|hOc4la|hOc4lp','extrastriate','family');
bind('cortex','hOc6|hPO1','parietoOccipital','family');
bind('cortex','Ia1|Ia2|Ia3','agranularInsula','family');
bind('cortex','Id1|Id2|Id3|Id4|Id5|Id6|Id7|Id8|Id9|Id10','dysgranularInsula','family');
bind('cortex','Ig1|Ig2|Ig3','granularInsula','family');
bind('cortex','p24ab|p24c|p32|33','acc','family');
bind('cortex','s24|s32|25','subgenual','family');
bind('hippocampus','CA1','ca1');bind('hippocampus','CA2','ca2');bind('hippocampus','CA3','ca3');
bind('hippocampus','DG','dentate');bind('hippocampus','EC','entorhinal');bind('hippocampus','Subc','subicular');
bind('hippocampus','TrS','subicular','family');bind('hippocampus','HATA','hippocampalTransition','family');
bind('amygdala','LB','basolateral');bind('amygdala','CM','centromedial');bind('amygdala','SF','superficialAmygdala');
bind('amygdala','Astr','amygdalaTransition','family');bind('amygdala','VTM|IF|MF','amygdalaOther','family');
bind('basal','BST','extendedAmygdala','family');bind('basal','Ch 4','ch4');bind('basal','Ch 123','ch123');
bind('basal','Tu','tubercle');bind('basal','TuTi','terminalIslands');bind('basal','VP','ventralPallidum');
bind('basal','AcbM|AcbL','accumbens','family');bind('basal','FuP|FuCd','ventralStriatum','family');
bind('thalamus','AM|AV|LD','anteriorThalamus','family');bind('thalamus','MD','md');
bind('thalamus','VA|VAmc|VLA|VLP|VIM|VM','motorThalamus','family');
bind('thalamus','PUa|PUm|PUi|PUl','pulvinar','family');
bind('thalamus','Po|LP|Li|Sg|VPi','posteriorThalamus','family');
bind('thalamus','Pv|Pf|CL|sPf','intralaminar','family');
bind('thalamus','MV','thalamus','family');
bind('thalamus','CM','cmThalamus');bind('thalamus','Rt','reticular');
bind('thalamus','CGL','lgn');bind('thalamus','CGM','mgn');
bind('thalamus','VPL','vpl');bind('thalamus','VPM','vpm');bind('thalamus','VPMpc','vpmpc');bind('thalamus','ZI','zi');
bind('midbrain','STN','stn');bind('midbrain','SNC','snc');bind('midbrain','SNR','snr');
bind('midbrain','NRp','redSmall');bind('midbrain','NRm','redLarge');
bind('cerebellum','Nfast','fastigial');bind('cerebellum','Ninterp','interposed');
bind('cerebellum','Ndentv|Ndentd','dentateNucleus','family');

const CIT={
 Putamen:'putamen',Caudate:'caudate','Nucleus Accumbens':'accumbens','Extended Amygdala':'extendedAmygdala',
 'Globus Pallidus externa':'gpe','Globus Pallidus interna':'gpi','Substantia Nigra pars compacta':'snc','Substantia-Nigra-pars-reticulata':'snr',
 'Red Nucleus':'red','Parabrachial Pigmented':'pbp','Ventral Tegmental Area':'vta','Ventral Pallidum':'ventralPallidum','Habenular Nucleus':'habenula','Hypothalamus':'hypothalamus','Mammillary Nucleus':'mammillary','Subthalamic Nucleus':'stn'
};
const LOBULES={'Crus1':'cerebellarCrus','Crus2':'cerebellarCrus','3':'cerebellarMotor','4_5':'cerebellarMotor','6':'cerebellarVI','7b':'cerebellarVII','8':'cerebellarMotor','9':'cerebellarIX','10':'cerebellarX'};

const networkProfiles={
 Default:p('默认模式网络','在情景回忆、自我相关思考和想象未来时经常参与活动。它在静息时也活跃，并非“什么都不做”的网络。',['yeo']),
 Vis:p('视觉网络','协同处理视野位置、形状、颜色和运动等视觉信息，包含早期与较高级视觉皮层。',['vision','yeo']),
 SomMot:p('躯体感觉运动网络','将身体感觉与运动相关活动相联系，参与触觉、本体感觉及动作控制。',['somato','motor','yeo']),
 DorsAttn:p('背侧注意网络','依据当前目标把注意投向相关位置或特征，并与眼动及视觉引导行为协调。',['yeo','association']),
 SalVentAttn:p('显著性 / 腹侧注意网络','参与发现重要或意外事件、转移注意，并把身体状态与任务需求用于行为调整。',['yeo','insula']),
 Limbic:p('边缘网络','这套皮层标签主要包含眶额和前颞叶范围，参与价值、情绪及相关信息加工；不等于完整的边缘系统。',['yeo','olfaction']),
 Cont:p('额顶控制网络','协调工作记忆、规则和目标导向的行为，帮助在任务需求变化时灵活调整信息处理。',['yeo','association']),
 TempPar:p('颞顶网络','Yeo 17 中独立划出的颞顶相关皮层网络，可结合社会与多模态信息加工理解；不等于一个解剖 TPJ 区。',['yeo','association']),
 OLF:p('嗅觉回路','气味信息从嗅球到梨状等初级嗅觉皮层，再与眶额、岛叶和情绪记忆系统协作，形成气味辨认与价值体验。',['olfaction','olfactoryCircuit'],'黄色模型展示已收录的部分区域，不是完整纤维通路。'),
 POC:p('初级嗅觉皮层','主要指直接接受嗅球投射的皮层范围，参与气味表征。梨状皮层是重要组成；本组合还包括已收录的嗅结节。',['olfaction','olfactoryCircuit'],'POC 的范围会随文献定义变化；当前模型仅覆盖一部分。'),
 SOC:p('次级嗅觉相关皮层','眶额及部分岛叶等区域结合气味、味觉、情境和价值，参与较高级的嗅觉加工。',['olfaction','olfactoryCircuit'],'SOC 不是边界统一的单个脑区；当前为较宽的解剖参考。')
};
const FINE_FAMILY={VisCent:'Vis',VisPeri:'Vis',SomMotA:'SomMot',SomMotB:'SomMot',DorsAttnA:'DorsAttn',DorsAttnB:'DorsAttn',SalVentAttnA:'SalVentAttn',SalVentAttnB:'SalVentAttn',LimbicA:'Limbic',LimbicB:'Limbic',ContA:'Cont',ContB:'Cont',ContC:'Cont',DefaultA:'Default',DefaultB:'Default',DefaultC:'Default',TempPar:'TempPar'};
const FUNCTIONAL_AREAS={AntTemp:'temporal',Aud:'auditory',Cent:'sensorimotor',Cingm:'cingulate',Cingp:'pcc',ExStr:'extrastriate',ExStrInf:'extrastriate',ExStrSup:'extrastriate',FEF:'fef',FrMed:'frontal',FrOper:'frontalOperculum',IPL:'inferiorParietal',IPS:'superiorParietal',Ins:'insula',OFC:'ofc',PFCd:'prefrontal',PFCl:'prefrontal',PFCld:'prefrontal',PFClv:'prefrontal',PFCm:'frontal',PFCmp:'frontal',PFCv:'frontal',PHC:'parahippocampal',ParMed:'precuneus',ParOcc:'parietoOccipital',ParOper:'parietalOperculum',PostC:'somato',PrC:'m1',Rsp:'retrosplenial',S2:'parietalOperculum',SPL:'superiorParietal',StriCal:'v1',Striate:'v1',Temp:'temporal',TempOcc:'ventralVisual',TempPar:'tpj',TempPole:'temporal',pCun:'precuneus',pCunPCC:'posteromedial'};

function resolved(key,scope='region',profiles=PROFILES){
 const profile=profiles[key];if(!profile)return null;
 return {...profile,key,scope,references:profile.sources.map(id=>KNOWLEDGE_SOURCES[id])};
}
export function knowledgeForGroup(id){
 // Root / bookkeeping placeholders are not anatomical concepts.
 if(!Object.hasOwn(GROUP_PROFILES,id))return null;
 return resolved(GROUP_PROFILES[id]);
}
export function knowledgeForNetwork(network){
 if(!network)return null;
 if(network.legacy)return resolved('angular','family');
 const key=network.kind==='circuit'?network.id:network.scheme===17?FINE_FAMILY[network.code]:network.code;
 const result=resolved(key,network.scheme===17?'network-family':'network',networkProfiles);
 if(result&&network.scheme===17)result.hint='这里概述相关功能方向；A / B / C 标签不代表已确定的单一功能。';
 return result;
}
export function knowledgeForEntry(entry){
 if(!entry||entry.atlas==='surface')return null;
 if(entry.atlas==='schaefer200'){
  const area=(entry.name17||'').split('_').slice(3,-1).join('_');
  const result=resolved(FUNCTIONAL_AREAS[area],'functional-area')||resolved(entry.network7,'network-family',networkProfiles);
  if(result){
   result.hint=(result.scope==='network-family'?'概述相关网络':'概述所属区域')+'；不能据此推断这个功能分区的专属作用。';
   result.references=[...result.references,KNOWLEDGE_SOURCES.schaefer];
  }
  return result;
 }
 if(entry.atlas==='julich'){
  const code=entry.name.trim().replace(/^Area /,'').split(' (')[0];
  const match=JULICH.get(entry.category+':'+code);
  return match?resolved(match.key,match.scope):null;
 }
 if(entry.atlas==='cit168')return resolved(CIT[entry.name.trim().replace(/^[LR] /,'')]);
 if(entry.atlas==='allen2020'&&entry.name==='Pineal body')return resolved('pineal');
 if(entry.atlas==='aal'){
  const name=entry.name.replace(/_[LR]$/,'');
  if(/^Vermis_(1_2|3|4_5|6|7|8|9|10)$/.test(name))return resolved(name==='Vermis_10'?'cerebellarX':'vermis','family');
  return resolved(LOBULES[name.replace(/^Cerebelum_/,'')],'family');
 }
 return null;
}

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderKnowledgeCard(knowledge){
 if(!knowledge)return '';
 const family=['family','functional-area','network-family'].includes(knowledge.scope);
 const scope=family?(knowledge.scope==='network-family'?'相关网络概述':'所属区域概述')+' · '+knowledge.title:'';
 return `<section id="regionKnowledge" class="region-knowledge" aria-labelledby="regionKnowledgeTitle" data-knowledge="${escape(knowledge.key)}" data-scope="${escape(knowledge.scope)}"><h3 id="regionKnowledgeTitle">简要介绍</h3>${scope?`<p class="knowledge-scope">${escape(scope)}</p>`:''}<p class="knowledge-summary">${escape(knowledge.summary)}</p>${knowledge.hint?`<p class="knowledge-hint">${escape(knowledge.hint)}</p>`:''}<details class="knowledge-sources"><summary>参考资料</summary>${knowledge.references.map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)} ↗</a>`).join('')}${family?'<p>区域或网络概述不表示每个细分区都具有完全相同的功能。</p>':''}</details></section>`;
}
