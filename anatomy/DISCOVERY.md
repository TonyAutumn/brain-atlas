# 全库检索与独立层级库 · 2026-09-17.1

## 使用

首页保留一个搜索框。输入中文名、英文名或常用缩写即可；不必先选择图谱或进入正确的分组。搜索始终覆盖全部图谱、双侧条目和结构概念，不受“只看已学习”限制。三维显示图谱仍分开，避免把不同来源的重叠边界误当作同一结构。

- VTA / 腹侧被盖区 / ventral tegmental area：可查看层级，点击左右侧模型会自动切换 CIT168。
- tectum / 顶盖 / 四叠体：进入中脑顶盖，继续查看上丘、下丘。
- tegmentum / 被盖：先显示总称，可继续查看中脑被盖或脑桥被盖；不是 VTA 的别名。
- PAG、LC、DRN、PPTg、LDT、NTS 等：当前主要是层级知识条目，不伪造坐标或三维表面。

每个结构说明直接上级、完整路径、下属结构、相关位置及来源。跨脑干的核群、跨界定位分组和相关术语有明确说明，并非所有节点都是互斥的组织体积。没有模型的节点不再禁用。大结构有部分子模型也不表示具有完整边界。本词库是学习索引，不是完整的人脑本体。

## 实现与兼容

`navigation-base.js` 保留原始导航数据及皮层路由；`structure-catalog.js` 保存补充概念、检索词、来源和当前 Julich 3.1 / CIT168 的标签映射；`navigation.js` 是统一入口。`search.js` 在概念与全部模型条目上建立独立索引，并复用已有 `research/mapping-rules.js` 的命名词表。

原始 `manifest.json`、模型字节、模型编号、学习记录键、文献存储、匹配目标和备份格式不变。归类更正会更新当前显示的路径及分组成员，不删除已有文献记录。结构概念检索不是证据审核，不放宽物种、侧别或来源门槛，不自动把无模型节点当作可定位证据。

修正了 NRp/NRm 与 Nucleus Ruber 被放进 VTA、连字符写法的黑质网状部被漏分、BST/Tu 等被基底前脑泛匹配提前截获，以及部分丘脑核群仅凭 anterior/posterior 等词被误分类的问题。未识别的中脑标签进入待核对分组，不再默认归入 VTA。前脑、端脑、间脑区分展示；内嗅皮层与海马结构采用明确分开的学习路径。

索引先于模型初始化。WebGL 不可用或模型请求失败时，名称和层级仍可查看。静态资源入口更新为 `search1`，不清除浏览器数据。

## 来源与范围

补充说明以结构位置与命名为限，没有复制来源中的功能综述或表达量数据。

- Human Protein Atlas, Midbrain — https://www.proteinatlas.org/humanproteome/brain/midbrain
- Human Protein Atlas, Pons — https://www.proteinatlas.org/humanproteome/brain/pons
- Human Protein Atlas, human brain structure list — https://v24.proteinatlas.org/humanproteome/brain/data
- NLM MeSH, Pontine Tegmentum — https://www.ncbi.nlm.nih.gov/mesh/68065821
- 本仓库各图谱原始标签、版本和许可 — [SOURCES.md](SOURCES.md)

参考资料的分类口径并非完全一致。这里按中脑、脑桥、延髓组织脑干；不把所有资料里的宽泛分类或检索入口词直接当成严格同义关系。脚桥/背外侧被盖核使用跨界定位分组；PBP 与脑桥臂旁核复合体严格区分。CIT168 的 PBP 和 VTA 独立标签也不直接合并。

## 回归

`node scripts/validate-discovery.mjs`：全库别名检索、无模型概念、从属关系、标签交叉映射、缩写边界和原始数据不变。

`node scripts/validate-navigation.mjs`：全模型导航、归属锚点、整组/单区强调、资源引用。

`python scripts/validate-discovery-browser.py`：真实浏览器下测试默认全局搜索、跨图谱点击、无模型结构的上下级、学习记录保留、被盖语义区分及无 WebGL 降级。仅使用临时浏览器上下文，不访问个人文献库或 Kimi API。

持续集成另运行所有现有验证脚本。模型索引版本与层级词库版本分别保存，避免把新增词条误当成新增模型。
