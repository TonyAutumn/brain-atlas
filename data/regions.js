window.BRAIN_REGIONS = [
  {
    id: "frontal", name: "额叶", latin: "Frontal lobe", system: "cortex", view: "lateral", color: "#F3A46B",
    summary: "负责计划、抑制、决策与随意运动，是把目标变成行动的“总导演”。",
    functions: ["执行控制与工作记忆", "反应抑制与冲突监控", "随意运动与语言产生"],
    experiment: {name: "Stroop / Go–No-go", question: "人能否压住自动反应，按当前目标行动？", method: "比较一致与冲突试次，或要求对 Go 刺激反应、对 No-go 刺激停止。", signal: "冲突条件反应时更长；抑制失败率反映控制能力。"},
    memory: {title: "额头 = 规划台", text: "摸一下额头：先在这里“想好”，再让身体行动。额叶就是计划、控制和动作的前台。"},
    pitfall: "额叶不是单一的“理性中心”；其不同亚区承担运动、语言和价值判断等不同功能。",
    relations: ["basal-ganglia", "parietal"],
    quiz: {q: "当任务要求压住一个已经准备好的按键反应时，最直接涉及哪个大区？", options: ["额叶", "枕叶", "小脑", "颞叶"], answer: 0, why: "反应抑制与执行控制主要依赖前额叶—基底神经节环路。"}
  },
  {
    id: "parietal", name: "顶叶", latin: "Parietal lobe", system: "cortex", view: "lateral", color: "#E9CB68",
    summary: "整合触觉、视觉与身体位置，帮助你定位物体、分配空间注意并操作数量。",
    functions: ["躯体感觉整合", "空间注意与视觉引导动作", "数量与心理旋转"],
    experiment: {name: "心理旋转实验", question: "大脑是否像转动物体一样旋转心理表征？", method: "判断两个不同角度的三维图形是否相同，并记录反应时。", signal: "角度差越大，反应时通常越长；斜率反映旋转速度。"},
    memory: {title: "头顶 = 空间雷达", text: "顶叶在头顶，像一台雷达：它把“我在哪里、东西在哪里、手该伸向哪里”放到同一张地图。"},
    pitfall: "空间忽视并非简单的视力丧失，而是对一侧空间的注意与表征障碍。",
    relations: ["frontal", "occipital"],
    quiz: {q: "Shepard–Metzler 心理旋转任务最常用来研究哪类能力？", options: ["空间表征", "恐惧条件化", "语言产生", "生理稳态"], answer: 0, why: "心理旋转要求操作物体的空间表征，顶叶参与尤其明显。"}
  },
  {
    id: "temporal", name: "颞叶", latin: "Temporal lobe", system: "cortex", view: "lateral", color: "#E98B91",
    summary: "处理听觉、物体与面孔识别，并与语言理解和记忆系统紧密相连。",
    functions: ["听觉加工", "语义与语言理解", "物体、面孔识别"],
    experiment: {name: "双耳分听实验", question: "两耳同时收到不同信息时，注意会选择哪一路？", method: "左右耳同时呈现不同音节，要求复述一侧或报告听到的内容。", signal: "正确率的耳侧差异可反映注意选择与语言侧化。"},
    memory: {title: "太阳穴旁 = 耳机房", text: "颞叶就在耳朵附近：先记住“听”，再联想到它也负责理解声音代表的语言与物体。"},
    pitfall: "“颞叶负责记忆”过于笼统；陈述性记忆更具体地依赖内侧颞叶系统。",
    relations: ["hippocampus", "amygdala"],
    quiz: {q: "双耳分听任务主要用来研究什么？", options: ["听觉注意与侧化", "运动协调", "体温调节", "视觉皮层定位"], answer: 0, why: "双耳分听操纵左右耳输入，是研究听觉选择性注意与语言侧化的经典范式。"}
  },
  {
    id: "occipital", name: "枕叶", latin: "Occipital lobe", system: "cortex", view: "lateral", color: "#8BC7B8",
    summary: "视觉信息进入大脑皮层后的第一站，并逐步分析边缘、颜色、运动和形状。",
    functions: ["初级视觉加工", "颜色与形状分析", "视觉运动信息处理"],
    experiment: {name: "视觉场定位实验", question: "视野中的位置如何映射到视觉皮层？", method: "在屏幕不同位置闪现刺激，同时记录 fMRI 或 EEG 反应。", signal: "刺激位置与枕叶激活位置呈有规律的视网膜拓扑映射。"},
    memory: {title: "后脑勺 = 放映厅", text: "眼睛长在前面，视觉皮层却在后面。把枕叶想成后脑勺里的放映厅。"},
    pitfall: "看见不是枕叶独立完成的；识别“是什么”和判断“在哪里”还需颞叶、顶叶通路。",
    relations: ["parietal", "temporal"],
    quiz: {q: "视觉刺激在屏幕上的位置与皮层激活位置形成系统映射，这称为什么？", options: ["视网膜拓扑组织", "躯体拓扑组织", "长时程增强", "动作电位全或无"], answer: 0, why: "枕叶视觉区保留视网膜空间关系，形成视网膜拓扑地图。"}
  },
  {
    id: "insula", name: "岛叶", latin: "Insula", system: "cortex", view: "deep", color: "#8FAEEB",
    summary: "把心跳、呼吸和内脏状态带入主观体验，也参与疼痛、厌恶与显著性检测。",
    functions: ["内感受与身体状态", "疼痛和厌恶体验", "显著性检测"],
    experiment: {name: "心跳知觉任务", question: "人能多准确地感知自己的内部身体信号？", method: "要求被试在一段时间内计数心跳，或判断声音是否与心跳同步。", signal: "客观准确性、主观信心与岛叶活动可被分开比较。"},
    memory: {title: "岛 = 身体内部的观察站", text: "岛叶藏在外侧裂深处，像一座隐蔽小岛；它监测身体内部的潮汐——心跳、呼吸和不适。"},
    pitfall: "心跳计数会受先验知识影响，不能把成绩直接等同于纯粹的内感受能力。",
    relations: ["amygdala", "frontal"],
    quiz: {q: "判断声音是否与自己心跳同步，最常用来研究哪种加工？", options: ["内感受", "语义启动", "空间忽视", "程序性学习"], answer: 0, why: "任务要求感知身体内部信号，岛叶是内感受网络的重要节点。"}
  },
  {
    id: "hippocampus", name: "海马", latin: "Hippocampus", system: "deep", view: "deep", color: "#C58BD4",
    summary: "帮助形成新的情景记忆和空间地图，让经历带着时间、地点被保存。",
    functions: ["情景记忆形成", "空间导航", "关系绑定与记忆巩固"],
    experiment: {name: "虚拟导航 / H.M. 病例", question: "新记忆形成是否依赖内侧颞叶？", method: "让被试学习虚拟路线并回忆地标；病例研究比较术前术后的记忆能力。", signal: "新情景记忆受损但部分技能学习保留，提示记忆系统并非单一。"},
    memory: {title: "海马 = 记忆的地图册", text: "把“海马”想成在海里认路的动物：它把人物、地点和时间装订成一页经历。"},
    pitfall: "海马不是永久存放所有记忆的“硬盘”，更像新情景记忆的快速编码与索引系统。",
    relations: ["temporal", "amygdala"],
    quiz: {q: "H.M. 手术后最突出的困难是什么？", options: ["形成新的陈述性记忆", "识别基本颜色", "维持呼吸节律", "完成简单反射"], answer: 0, why: "双侧内侧颞叶切除造成严重顺行性遗忘，而部分程序性学习仍可保留。"}
  },
  {
    id: "amygdala", name: "杏仁核", latin: "Amygdala", system: "deep", view: "deep", color: "#EE7E77",
    summary: "快速评估威胁和生物学意义，参与情绪学习并增强重要事件的记忆。",
    functions: ["威胁检测", "恐惧条件化", "情绪记忆调节"],
    experiment: {name: "恐惧条件化", question: "中性线索怎样获得威胁意义？", method: "将中性声音与轻微厌恶刺激配对，之后单独呈现声音。", signal: "皮肤电、惊跳反射或瞳孔扩大显示条件性恐惧反应。"},
    memory: {title: "杏仁 = 情绪警报器", text: "杏仁核形状像杏仁，功能像烟雾报警器：先标记“重要或危险”，再调动身体和记忆。"},
    pitfall: "杏仁核不只处理恐惧，也参与奖励、社会线索和广义的情绪显著性。",
    relations: ["hippocampus", "hypothalamus"],
    quiz: {q: "中性声音与厌恶刺激反复配对后，声音单独引起皮肤电增强。这是什么？", options: ["恐惧条件化", "视觉适应", "语义饱和", "心理旋转"], answer: 0, why: "中性条件刺激获得了威胁意义，杏仁核参与这种联结学习。"}
  },
  {
    id: "thalamus", name: "丘脑", latin: "Thalamus", system: "deep", view: "deep", color: "#76B7D4",
    summary: "多数感觉信息通往皮层的中继与调节站，也参与注意、唤醒和皮层节律。",
    functions: ["感觉信息中继", "注意选择", "唤醒与皮层协调"],
    experiment: {name: "空间线索任务", question: "注意线索如何增强随后出现的感觉信号？", method: "先给出可能位置的线索，再呈现目标，比较有效与无效线索试次。", signal: "有效线索缩短反应时；丘脑枕核与皮层注意网络共同调节信息。"},
    memory: {title: "丘脑 = 中央车站", text: "几乎所有感觉列车都先到丘脑换乘，再前往不同皮层；嗅觉是常被记住的例外。"},
    pitfall: "丘脑并非被动转发器，它会依据注意与脑状态主动调节信息通行。",
    relations: ["cortex", "brainstem"],
    quiz: {q: "下列哪种感觉通常不先经丘脑中继就到达初级皮层？", options: ["嗅觉", "视觉", "听觉", "躯体感觉"], answer: 0, why: "嗅觉通路是经典例外；其他主要感觉均有丘脑中继核。"}
  },
  {
    id: "hypothalamus", name: "下丘脑", latin: "Hypothalamus", system: "deep", view: "deep", color: "#F2B85B",
    summary: "维持体温、饥饿、口渴、昼夜节律和激素平衡，把神经活动连接到内分泌系统。",
    functions: ["稳态调节", "内分泌控制", "动机与昼夜节律"],
    experiment: {name: "稳态操纵实验", question: "身体缺水、能量变化如何转化为动机和行为？", method: "操纵饮水、进食或光照条件，记录行为、激素和生理指标。", signal: "摄入行为与激素节律随内部状态改变，显示负反馈调节。"},
    memory: {title: "下丘脑 = 身体恒温器", text: "它虽小，却像恒温器和总务处：温度、吃喝、睡眠、激素都要保持在合适范围。"},
    pitfall: "稳态不是保持绝对不变，而是在目标范围内动态预测和调节。",
    relations: ["thalamus", "amygdala"],
    quiz: {q: "体温、饥饿与激素调节最直接依赖哪个结构？", options: ["下丘脑", "胼胝体", "枕叶", "小脑"], answer: 0, why: "下丘脑连接自主神经和内分泌系统，是稳态调节核心。"}
  },
  {
    id: "basal-ganglia", name: "基底神经节", latin: "Basal ganglia", system: "deep", view: "deep", color: "#7795C9",
    summary: "帮助选择动作、建立习惯，并利用奖励预测误差更新行为策略。",
    functions: ["动作选择与启动", "习惯和程序学习", "奖励学习"],
    experiment: {name: "序列反应时任务", question: "人能否在没有明确意识时学会动作序列？", method: "对不同位置刺激按键，序列规律在练习后突然改变。", signal: "规律阶段反应变快，序列被打乱后反应变慢，提示隐性序列学习。"},
    memory: {title: "基底神经节 = 动作闸门", text: "它不是直接发出动作，而像地铁闸门：放行合适动作、压住竞争动作，重复后形成习惯通道。"},
    pitfall: "“基底节”并非一个核团，而是一组相互连接的深部结构与环路。",
    relations: ["frontal", "thalamus"],
    quiz: {q: "序列反应时任务中，隐藏规律被打乱后反应突然变慢，说明出现了什么？", options: ["隐性序列学习", "视觉失认", "语言侧化", "感觉适应"], answer: 0, why: "即使说不出规律，被试的反应仍显示已学会序列，涉及基底神经节。"}
  },
  {
    id: "corpus-callosum", name: "胼胝体", latin: "Corpus callosum", system: "deep", view: "deep", color: "#D9C6A5",
    summary: "连接左右大脑半球，使感觉、动作和认知信息能够跨半球整合。",
    functions: ["半球间信息传递", "双侧感觉运动整合", "功能侧化协调"],
    experiment: {name: "裂脑实验", question: "当两半球无法直接交流时，各自能做什么？", method: "向单侧视野短暂呈现刺激，要求被试说出或用手选择所见物体。", signal: "语言报告与非言语选择出现分离，揭示半球侧化与通路限制。"},
    memory: {title: "胼胝体 = 跨江大桥", text: "左右半球像江两岸，胼胝体是最大的信息桥；切断后两岸仍运转，但难以直接交换消息。"},
    pitfall: "裂脑不等于出现两个完整人格，实验效应高度依赖刺激位置、任务和残余连接。",
    relations: ["frontal", "parietal"],
    quiz: {q: "裂脑研究中，把图片短暂呈现在左视野主要先到达哪个半球？", options: ["右半球", "左半球", "两半球同时", "小脑"], answer: 0, why: "视野信息交叉投射；左视野主要进入右半球，胼胝体切断后难以传给左半球语言区。"}
  },
  {
    id: "cerebellum", name: "小脑", latin: "Cerebellum", system: "support", view: "lateral", color: "#A8C971",
    summary: "比较预期与实际结果，校正动作误差，也参与时间预测和部分认知自动化。",
    functions: ["运动协调与误差校正", "平衡和姿势", "时间预测与学习"],
    experiment: {name: "棱镜适应实验", question: "视觉和动作不一致时，大脑怎样逐步校正？", method: "戴偏转视野的棱镜眼镜反复指向目标，之后摘下眼镜再测试。", signal: "误差逐渐减小；摘镜后出现反方向后效，说明内部模型被更新。"},
    memory: {title: "小脑 = 动作校准器", text: "它像相机防抖：每次比较“本来想怎样”和“实际怎样”，再把下一次动作调准。"},
    pitfall: "小脑不只服务运动；语言、时间与预测任务中也可见其作用，但具体机制仍在研究。",
    relations: ["brainstem", "frontal"],
    quiz: {q: "棱镜适应中，摘下棱镜后出现反方向偏差，最能说明什么？", options: ["内部运动模型被更新", "视觉永久受损", "语言记忆增强", "恐惧消退"], answer: 0, why: "后效说明系统并非临时补偿，而是小脑相关的感觉—运动映射发生了学习。"}
  },
  {
    id: "brainstem", name: "脑干", latin: "Brainstem", system: "support", view: "lateral", color: "#67A9A0",
    summary: "连接大脑与脊髓，维持呼吸、心率、睡眠—觉醒和多种基本反射。",
    functions: ["呼吸与心血管调节", "睡眠和觉醒", "基本反射与传导"],
    experiment: {name: "惊跳反射范式", question: "快速防御反应如何受情绪和注意调节？", method: "播放突然的强声，记录眨眼肌电，并比较不同情境。", signal: "惊跳幅度会被威胁情境增强，显示基础反射可受高层状态调节。"},
    memory: {title: "脑干 = 生命主干道", text: "它是大脑通往身体的主干道，也维持最基础的自动运行：呼吸、心跳、清醒。"},
    pitfall: "脑干包含中脑、脑桥和延髓，不是功能单一的一根“电缆”。",
    relations: ["cerebellum", "thalamus"],
    quiz: {q: "呼吸节律、心率调节和基本觉醒最依赖哪个区域？", options: ["脑干", "顶叶", "海马", "胼胝体"], answer: 0, why: "脑干包含维持生命功能和觉醒水平的重要核团。"}
  }
];

window.BRAIN_SYSTEMS = {
  all: {name: "全部", color: "#163846"},
  cortex: {name: "皮层", color: "#F3A46B"},
  deep: {name: "深部", color: "#8FAEEB"},
  support: {name: "后脑", color: "#8DB765"}
};
