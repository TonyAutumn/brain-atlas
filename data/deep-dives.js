window.DEEP_DIVE_TOPICS = [
  {
    id: "interoception-self-consciousness",
    number: "01",
    title: "内感受、身体自我与意识",
    subtitle: "从身体传入信号，到“这是我的身体、这是我的感受”",
    updated: "2026-07",
    level: "进阶",
    accent: "#D8735A",
    thesis: "内感受不是岛叶单独读取身体的过程，而是身体、脑干、丘脑、岛叶、扣带与全脑网络共同进行的预测、校正和调节。它为情绪与身体自我提供基础，但不能被简单等同于意识本身。",
    objectives: [
      "说清两条主要上行通路",
      "区分后岛叶与前岛叶",
      "读懂 HEP、心跳任务和身体错觉",
      "判断相关、因果与临床标志物证据"
    ],
    pathway: [
      {
        id: "sensors", order: "A", name: "身体传感器", short: "压力、化学与内脏状态",
        examples: "动脉压力感受器、化学感受器、心肺和胃肠机械感受器、痛温与免疫信号",
        role: "把血压、氧合、心跳、胃肠牵张、温度和组织状态转换为神经或体液信号。",
        caution: "内感受远不止心跳；心肺、胃肠、呼吸、疼痛、温度和免疫状态可能具有不同编码机制。",
        color: "#D8735A"
      },
      {
        id: "brainstem", order: "B", name: "脑干整合", short: "NTS 与臂旁核",
        examples: "迷走/舌咽传入 → 孤束核（NTS）；脊髓薄层 I → 脊髓丘脑通路；臂旁核（PBN）参与中继",
        role: "在意识出现之前完成大量稳态反射，并把身体状态送往丘脑、下丘脑、杏仁核和皮层。",
        caution: "脑干不是被动电缆；它已经在选择、整合并调节身体信号。",
        color: "#4F8D86"
      },
      {
        id: "thalamus", order: "C", name: "丘脑与皮层入口", short: "感觉中继与状态调节",
        examples: "腹后内侧丘脑等核团；与岛叶、扣带、躯体感觉区相连",
        role: "将不同来源的身体信号按状态和注意需要送入皮层，同时参与唤醒和皮层节律协调。",
        caution: "不同内感受模态并不都沿完全相同的丘脑路线。",
        color: "#6CA9C5"
      },
      {
        id: "posterior-insula", order: "D", name: "后岛叶", short: "较具体的身体状态地图",
        examples: "以颗粒型皮层为主，接收较直接的丘脑—皮层输入；与痛温、心肺和内脏感觉相关",
        role: "更接近“身体现在发生了什么”的感觉表征，并计算来自身体的信号与预测之间的偏差。",
        caution: "把后岛叶叫作唯一的“初级内感受皮层”仍是简化；躯体感觉区、扣带和其他区域也参与。",
        color: "#7D9BCB"
      },
      {
        id: "anterior-insula", order: "E", name: "前岛叶—dACC", short: "显著性、主观感受与行动",
        examples: "前岛叶（AI）、背侧前扣带（dACC）、杏仁核、眶额和前额叶",
        role: "把身体状态与情境、目标、情绪和信心结合，形成可报告感受，并通过自主神经和行为更新身体。",
        caution: "前岛叶活动不等于“意识位置”；它也参与注意切换、认知控制、疼痛与社会情绪。",
        color: "#B276B2"
      },
      {
        id: "whole-system", order: "F", name: "全身—全脑闭环", short: "预测、误差与稳态行动",
        examples: "显著性网络、默认网络、下丘脑、导水管周围灰质、脑干自主神经核团",
        role: "大脑不仅读取身体，还提前预测能量需要，并用行为、自主神经和内分泌反应改变身体。",
        caution: "最新证据更支持分布式系统，而不是一条从身体到前岛叶的单向阶梯。",
        color: "#D29A45"
      }
    ],
    models: [
      {
        id: "ascending", name: "上行表征模型", tag: "基础框架",
        claim: "身体信号逐级从脑干、丘脑、后岛叶到前岛叶，最终成为可报告的主观感受。",
        useful: "适合建立解剖主干，理解为什么后岛叶更接近感觉输入、前岛叶更接近整合。",
        limit: "容易把系统误记成单向流水线，也难解释预测、注意和情境如何改变同一身体信号。"
      },
      {
        id: "predictive", name: "预测性内感受", tag: "计算框架",
        claim: "高层产生身体状态预测，低层传回预测误差；注意与精度加权决定哪类信号更能影响体验。",
        useful: "可连接情绪、焦虑、身体所有权、安慰剂效应和主动推断。",
        limit: "许多实验同时符合注意或一般显著性解释，预测误差与精度常缺乏直接、独立测量。"
      },
      {
        id: "allostatic", name: "异稳态—内感受系统", tag: "前沿更新",
        claim: "内感受服务于异稳态：大脑提前调配身体资源。显著性网络与默认网络在多个内脏运动枢纽重叠。",
        useful: "把岛叶放回全脑—全身系统，解释身体调节、自我相关加工和脑网络枢纽为何相连。",
        limit: "功能连接揭示协同而非信息流方向；网络模型仍需因果干预和跨模态验证。"
      }
    ],
    experiments: [
      {
        id: "heartbeat-discrimination", name: "心跳辨别任务", year: "方法基础", badge: "行为",
        question: "被试能否判断外部声音与自己的心跳同步？",
        design: "同步记录 ECG；在不同延迟下播放声音，要求判断同步/不同步，并同时报告信心。",
        readout: "正确率或心理测量曲线衡量表现；准确率与信心的对应关系衡量元认知觉察。",
        inference: "比单纯心跳计数更少依赖心率知识，但结果仍受心跳感觉位置、延迟假设和任务难度影响。",
        warning: "不要把某一个心跳任务分数当作统一的“内感受能力”。"
      },
      {
        id: "cardiac-rhi", name: "心脏同步身体所有权错觉", year: "Suzuki et al., 2013", badge: "身体自我",
        question: "与心跳同步的视觉反馈能否让虚拟手更像“我的手”？",
        design: "虚拟手表面随被试实时心跳同步或异步闪烁，再测量所有权评分与位置漂移。",
        readout: "同步条件增强部分身体所有权与自我定位体验，说明外感受与内感受可以共同约束身体模型。",
        inference: "身体所有权不是纯视觉—触觉整合；内部节律也能参与“这是我”的归属判断。",
        warning: "后续研究并非都支持心脏内感受与橡胶手错觉强度稳定相关。"
      },
      {
        id: "intracranial-hep", name: "颅内 EEG × 全身错觉", year: "Park et al., 2018", badge: "直接记录",
        question: "心跳诱发反应来自哪里，它是否随身体自我改变？",
        design: "在癫痫患者岛叶、岛盖等电极记录 HEP；部分患者完成虚拟全身错觉任务。",
        readout: "心跳后相位集中主要见于岛叶/岛盖，也见于杏仁核和额颞区；岛叶 HEP 随自我认同操纵变化。",
        inference: "为脑—心信号与身体自我提供较直接的电生理证据，并提示 HEP 可能源于相位重置。",
        warning: "颅内样本小且来自临床人群，电极覆盖由治疗需要决定。"
      },
      {
        id: "doc-hep", name: "HEP × 意识障碍", year: "Candia-Rivera et al., 2021", badge: "临床",
        question: "无行为反应患者是否仍保留可检测的意识相关脑—心交互？",
        design: "分析昏迷后患者静息 EEG 中与每次心跳时间锁定的脑反应，并与临床意识诊断比较。",
        readout: "HEP 的空间和时间特征捕捉到部分残余意识信息，为床旁评估提供候选标志物。",
        inference: "身体信号相关脑活动可能补充纯外部刺激范式，尤其适合无法运动或交流的患者。",
        warning: "HEP 不是独立的“意识探测器”，不能替代重复临床评估与其他 EEG/fMRI 指标。"
      },
      {
        id: "lifu", name: "聚焦超声扰动岛叶", year: "Strohman et al., 2024", badge: "因果干预",
        question: "改变前/后岛叶或 dACC 活动会不会改变 HEP？",
        design: "16 名健康参与者分别接受前岛叶、后岛叶、dACC 或假刺激的低强度聚焦超声，同时记录 EEG–ECG。",
        readout: "不同靶点刺激均可降低部分 HEP 成分，且效应随靶点和声压不同。",
        inference: "从相关成像迈向可操纵深部皮层的因果检验。",
        warning: "这是小样本概念验证；靶向精度、声场传播和重复性仍需更大研究确认。"
      }
    ],
    papers: [
      {
        year: "2004", authors: "Critchley et al.", title: "Neural systems supporting interoceptive awareness",
        journal: "Nature Neuroscience", kind: "经典成像", strength: "奠基",
        finding: "心跳觉察表现与右前岛叶活动相关；岛叶灰质体积也与主观内感受表现相关。",
        meaning: "支持前岛叶与可报告身体感受的联系，但属于相关证据。",
        url: "https://pubmed.ncbi.nlm.nih.gov/14730305/"
      },
      {
        year: "2009", authors: "Khalsa et al.", title: "The pathways of interoceptive awareness",
        journal: "Nature Neuroscience", kind: "病损与药理", strength: "关键反例",
        finding: "双侧岛叶和 ACC 严重损伤患者仍能在异丙肾上腺素诱发强烈心跳时报告感觉。",
        meaning: "岛叶重要但并非唯一通路；强身体信号可经躯体感觉或其他路径进入觉察。",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2787640/"
      },
      {
        year: "2013", authors: "Suzuki et al.", title: "Multisensory integration across exteroceptive and interoceptive domains modulates self-experience",
        journal: "Neuropsychologia", kind: "身体错觉", strength: "经典",
        finding: "让虚拟手的视觉变化与心跳同步，可调节身体所有权和自我体验。",
        meaning: "内部节律可以和视觉信号一起塑造身体模型。",
        url: "https://pubmed.ncbi.nlm.nih.gov/23993906/"
      },
      {
        year: "2018", authors: "Park et al.", title: "Neural responses to heartbeats and their role in bodily self-consciousness",
        journal: "Cerebral Cortex", kind: "颅内 EEG", strength: "直接记录",
        finding: "岛叶/岛盖出现心跳锁定相位重置；岛叶 HEP 随全身错觉中的自我认同变化。",
        meaning: "把脑—心电生理信号与身体自我联系起来。",
        url: "https://academic.oup.com/cercor/article/28/7/2351/3862200"
      },
      {
        year: "2021", authors: "Candia-Rivera et al.", title: "Neural responses to heartbeats detect residual signs of consciousness",
        journal: "Journal of Neuroscience", kind: "意识障碍", strength: "临床前沿",
        finding: "静息 HEP 特征能提供部分昏迷后患者残余意识的信息。",
        meaning: "提示脑—心交互可能成为意识评估的补充维度。",
        url: "https://www.jneurosci.org/content/41/24/5251"
      },
      {
        year: "2024", authors: "Strohman et al.", title: "Low-intensity focused ultrasound to the insula differentially modulates the HEP",
        journal: "Clinical Neurophysiology", kind: "聚焦超声", strength: "概念验证",
        finding: "针对前岛叶、后岛叶与 dACC 的低强度聚焦超声对 HEP 产生靶点相关影响。",
        meaning: "提供无创深部靶向的因果研究路线，但样本仅 16 人。",
        url: "https://pubmed.ncbi.nlm.nih.gov/39366795/"
      },
      {
        year: "2025", authors: "Zhang et al.", title: "Cortical and subcortical mapping of the human allostatic–interoceptive system using 7 Tesla fMRI",
        journal: "Nature Neuroscience", kind: "7T 精细成像", strength: "前沿地图",
        finding: "90 人 7T fMRI 复现并扩展分布式异稳态—内感受系统，并覆盖更多脑干核团。",
        meaning: "把内感受从“岛叶中心论”推进为全脑网络与脑干共同系统。",
        url: "https://www.nature.com/articles/s41593-025-02087-x"
      },
      {
        year: "2025", authors: "Minenko et al.", title: "Comparison of three behavioral cardioception tasks and HEPs",
        journal: "Scientific Reports", kind: "测量比较", strength: "方法警告",
        finding: "48 名参与者的心跳敲击、辨别、计数和 HEP 并未形成一致的共同指标。",
        meaning: "“内感受”是多维构念；任务不同，测到的过程可能不同。",
        url: "https://www.nature.com/articles/s41598-025-08779-5"
      }
    ],
    frontiers: [
      {
        status: "正在重画地图", title: "从岛叶中心转向全脑异稳态系统", evidence: "2025 年 7T fMRI 在 90 人中细化扣带和脑干拓扑，并发现与动物示踪连接高度吻合的分布式系统。",
        question: "这些静息连接怎样在饥饿、缺氧、疼痛或濒死等强状态中改变信息流？", tone: "teal"
      },
      {
        status: "测量危机", title: "心跳任务并不测同一个东西", evidence: "计数、辨别、敲击、主观问卷与 HEP 的相关常不稳定；先验心率知识和时间估计会污染结果。",
        question: "能否建立跨心脏、呼吸和胃肠模态，且具有心理测量可靠性的任务组合？", tone: "amber"
      },
      {
        status: "因果方法起步", title: "开始直接扰动深部岛叶", evidence: "低强度聚焦超声可以非侵入性靶向前/后岛叶与 dACC，并对 HEP 产生初步可测影响。",
        question: "靶点效应能否重复，并能否选择性改变身体感受而非一般注意或疼痛？", tone: "violet"
      },
      {
        status: "谨慎的临床希望", title: "脑—心交互能否辅助检测残余意识", evidence: "HEP 在意识障碍患者中包含诊断相关信息，但受到心脏状态、伪迹、损伤位置和分析方法影响。",
        question: "它能否在多中心数据中增加诊断和预后价值，而不只是在小样本中分类成功？", tone: "red"
      }
    ],
    quiz: [
      {
        q: "哪一结构更接近较具体的身体状态感觉表征？",
        options: ["后岛叶", "前额叶背外侧部", "胼胝体", "初级视觉皮层"], answer: 0,
        why: "后岛叶接收较直接的丘脑—皮层内感受输入；前岛叶更强调跨模态、情境与可报告感受的整合。"
      },
      {
        q: "Khalsa 等（2009）的双侧岛叶/ACC 病损病例最直接挑战了什么说法？",
        options: ["岛叶是内感受觉察的唯一路径", "丘脑参与感觉中继", "心跳能影响情绪", "脑干调节自主神经"], answer: 0,
        why: "患者仍能感到药理诱发的强烈心跳，说明替代通路可以支持部分觉察。"
      },
      {
        q: "心跳诱发电位 HEP 是怎样获得的？",
        options: ["把 EEG 按 ECG 的心跳事件对齐并平均", "只计算平均心率", "对岛叶进行结构 MRI", "记录被试按键次数"], answer: 0,
        why: "HEP 是与心跳事件（常用 ECG R 峰）时间锁定的脑电反应。"
      },
      {
        q: "为什么不能只用心跳计数判断一个人的总体内感受能力？",
        options: ["它会受时间估计和心率知识影响", "它只能在动物中完成", "它必须使用 7T MRI", "它只测视觉注意"], answer: 0,
        why: "计数成绩可能来自先验知识或估时，且与辨别、敲击、HEP 等指标的关系并不稳定。"
      },
      {
        q: "2025 年 7T fMRI 研究带来的主要更新是什么？",
        options: ["内感受依赖分布式全脑—脑干系统", "内感受只位于右前岛叶", "HEP 已成为临床金标准", "心跳计数完全无效"], answer: 0,
        why: "研究复现并细化了覆盖皮层、皮层下和脑干的异稳态—内感受系统。"
      },
      {
        q: "关于 HEP 与意识，当前最严谨的结论是哪一个？",
        options: ["HEP 可补充残余意识评估，但不能单独确诊", "出现 HEP 就证明有完整意识", "没有 HEP 就证明没有意识", "HEP 与意识研究无关"], answer: 0,
        why: "现有临床结果有希望，但 HEP 仍受多种生理与方法因素影响，需要与临床和其他神经指标联合。"
      }
    ]
  }
];
