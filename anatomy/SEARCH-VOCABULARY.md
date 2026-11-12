# 检索称谓核对 · 2026-11-12

本轮检查全部 459 个解剖模型、200 个 Schaefer 功能分区和现有层级目录。逐项清单见 [SEARCH-AUDIT.md](SEARCH-AUDIT.md)。左右模型共用词表，但保留独立编号和侧别；同一个源名称只需核对一次命名。

## 本次修正

- 将位置缩写展开为英文全称及中文常用称呼，例如 SFG / superior frontal gyrus、FusG / fusiform gyrus、HESCHL / Heschl's gyrus / transverse temporal gyrus。
- 补充丘脑核团的常见词序与写法，例如 VPL / ventral posterolateral nucleus / ventral posterior lateral nucleus；保留 CM、MD、MV 等标签的不同含义。
- 补充海马、杏仁核、基底前脑、基底节、中脑和小脑称谓，例如 HATA 全称、NBM / Meynert、SNpc / SNpr、GPe / GPi、LGB / MGB，以及小脑分叶的阿拉伯和罗马数字。
- 原搜索漏掉全部 200 个功能分区。本次加入两套官方原名、功能分区位置缩写及网络名称；DLPFC / VLPFC 根据 PFCld / PFClv 原标签返回功能分区，不把所有外侧前额叶模型标成 DLPFC。
- 支持大小写、全角字母、空格、连字符、下划线、直/弯所有格撇号，以及前后置 left / right / LH / RH 和中文侧别。显示筛选仍不限制全库搜索；查询中明确的侧别会缩小结果。
- 概念和模型仍显示各自名称、图谱和范围。网络可从搜索结果直接选择，延续黄色组合选择。

## 命名边界

此处是**检索入口**，不是新分区本体，也不改变实验文献自动匹配规则。粗粒度名称可以找出已收录的部分分区；检索命中不表示网格覆盖完整结构。

- CM 同时列出丘脑中央中核和杏仁核中央内侧核群；加上全称可区分。SN 也可能命中黑质及显著性/腹侧注意组合。
- LGN 不给 MGN；MD 不给 MV；PBN 不给 PBP；被盖总称不给 VTA 同义关系；pre-SMA 与 SMA proper 分开。
- hOc3d / V3d、hOc4d / V3A、hOc4v / V4 和 hOc5 / V5 按来源文献提供检索对应。细胞构筑与功能边界不是严格相等，不将 MT+ 扩充成新模型。
- Ch1、Ch2、Ch3 指向现有 Ch123 **合并标签**，并不产生三个独立模型。LB/BLA 等核群称呼也不拆成来源没有提供的亚核。
- Schaefer 位置词表示原标签的范围线索，不将功能分区改成同名解剖区。SAL-VAN 的 salience / ventral attention，以及 FPN 的 executive / central executive，是常见文献检索称呼，保留本站实际采用的 Yeo 方案与范围。
- SOC 保留为已有次级嗅觉皮层参考组合；不因其它文献使用相同缩写而虚构未收录结构。
- 没有公认单独全称的细胞构筑标签（例如 IFS3、Id8、FG5）保留原代码，并补充所属位置全称，不编造功能名。

## 来源

1. 本仓库的 Julich 3.1、CIT168、AAL、Allen 源清单和 [SOURCES.md](SOURCES.md)：原始名称、位置代码、分叶及图谱范围。
2. [FSL / Jülich histological atlas reference table](https://web.mit.edu/fsl_v5.0.10/fsl/doc/wiki/Atlases%282f%29Juelich.html)：Broca、运动、躯体感觉、视觉、听觉、海马与杏仁核的历史对应名称。
3. [Malikovic et al., 2007, hOc5 / V5](https://juser.fz-juelich.de/record/55854)：hOc5 的细胞构筑与功能定位关系。
4. [Kujovic et al., 2013, dorsal extrastriate cortex](https://pmc.ncbi.nlm.nih.gov/articles/PMC3535362/)：hOc3d / V3d 与 hOc4d / V3A 的对应和范围限制。
5. [Kedo et al., receptor-driven multimodal mapping of the human amygdala](https://juser.fz-juelich.de/record/841229)：杏仁核纤维区命名；IF、MF 与 VTM 不被称作独立灰质核。
6. [Thomas Yeo Lab / Schaefer2018](https://github.com/ThomasYeoLab/CBIG/tree/master/stable_projects/brain_parcellation/Schaefer2018_LocalGlobal)：本仓库保存的 7 / 17 网络原始标签；位置词按原代码展开。
7. 现有 [structure-catalog.js](structure-catalog.js) 的来源：脑干、上丘脑及仅层级条目的命名。

## 验证与维护

运行 node scripts/validate-search-vocabulary.mjs，检查每个源标签、每条新增检索词、侧别输入和易混淆负例。原有全库搜索、层级、网络选择、知识卡片、文献匹配和存储验证继续执行。

python scripts/validate-discovery-browser.py 新增实际输入英文全称、所有格、侧别，点击功能分区，以及从搜索选中 DMN 的浏览器回归；使用独立临时浏览器数据，不读取个人笔记。

node scripts/audit-search-vocabulary.mjs 重新生成逐项清单。功能区原名或模型目录变化时，回归检查所有新条目是否仍有检索扩展。这里只维护搜索词，不修改源 manifest、几何、个人数据或文献证据判定。
