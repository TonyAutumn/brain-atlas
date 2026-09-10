# 脑区探索室 · Brain Atlas Lab

一个可在线访问、也可打包后离线运行的交互式脑区学习网站。

## 在线访问

https://tonyautumn.github.io/brain-atlas/

提交到 `main` 分支后，GitHub Actions 会自动把最新版发布到同一个网址。

## 三维解剖（首页）

首页现为真实解剖三维空间，支持旋转、平移、缩放、半球显示、外壳透明度、矢状/冠状/轴状裁切、中英文检索、点击详情、定位放大、区域着色及浏览器本地学习记录。

- Julich-Brain v3.1：400 个左右分开计数的精细分区；包含海马 CA1/CA2/CA3、齿状回、下托复合体，岛叶亚区、丘脑核团、杏仁核核群及小脑深部核团。
- CIT168：32 个左右分开的皮层下条目，单独切换显示。
- AAL：26 个小脑分叶条目。
- ICBM152 2009：真实解剖参考表面。458 是可选图谱条目数，包含不同图谱的重叠结构，并非人脑的唯一脑区总数。

三维模块位于 `anatomy/`，全部显示资产随站点分发。首次加载约 11 MB；不依赖外部 CDN。通过 HTTPS 网址打开，需要支持 WebGL 与 DecompressionStream 的现代浏览器。三维模块不包含在旧的单文件离线版中。

选择大结构时以固定颜色突出整组（如皮层紫色、海马金色、丘脑绿色），具体亚区使用亮蓝色。「隐藏其他结构」或「只看当前选择」会保留当前整组／单个亚区并隐藏参考外壳；再次关闭即可恢复背景。

导航分为「大结构 → 脑叶或核团分组 → 图谱条目」，详情路径可点击返回上级。大脑皮层下提供额叶、顶叶、颞叶、枕叶、岛叶、扣带皮层和交界及跨叶区域；其他入口分别组织海马与杏仁核、深部核团、脑干、小脑。图谱通过独立下拉框切换，未收录入口置灰。分组高亮只覆盖当前图谱收录的分区，不等于完整脑叶体积。

导航映射位于 `anatomy/navigation.js`，独立于原始标签、几何和学习记录 ID。运行 `node scripts/validate-navigation.mjs` 核对归属、关键解剖位置、整组选择和单区隔离。

数据来源、许可、坐标和转换方法见 [anatomy/SOURCES.md](anatomy/SOURCES.md)。运行 `node scripts/validate-anatomy.mjs` 验证资产、网格与标签。`scripts/build-anatomy.py` 可从已下载的源图谱重新生成网格（需 NumPy/SciPy）。

基础内容现在位于 `basics.html`，旧的专题、卡片、测验及笔记均保留；原有浏览器记录使用原键，不迁移或清空。后续论文证据应通过稳定的图谱 ID 关联，不把示意节点冒充单神经元。

## 包含内容

- 13 个主要脑区与两种示意视角
- 核心功能、典型实验、结果解读、记忆技巧和常见误区
- 搜索、系统筛选、记忆卡与随机测验
- 进阶专题系统：通路图、实验、关键文献、前沿争议和独立测验
- 学习进度与个人笔记本机保存
- 键盘操作和移动端适配

## 离线运行

双击 `Brain-Atlas-Offline.html` 即可。所有样式、数据和交互均已打包在单一文件中。文件名使用英文是为了避免 Windows 批处理和压缩软件的中文编码问题。

基础版也可以打开 `basics.html`。三维首页请通过在线网址访问。

## 扩展新脑区

主要内容集中在 `data/regions.js`。复制一个脑区对象并修改以下字段：

- `id`、`name`、`latin`：唯一标识和中英文名
- `system`：`cortex`、`deep` 或 `support`
- `view`：默认定位到 `lateral` 或 `deep`
- `summary`、`functions`：简介与核心功能
- `experiment`：实验名称、研究问题、基本做法与结果指标
- `memory`、`pitfall`：记忆技巧与常见误区
- `quiz`：测验题、选项、正确答案与解释

进阶专题集中在 `data/deep-dives.js`。每个专题包含 `pathway`、`models`、`experiments`、`papers`、`frontiers` 和 `quiz`，后续可以按相同结构逐个加入新的脑区或神经回路。

如需在脑图中显示新区域，再在 `basics.html` 的 SVG 中加入带有 `data-region="你的-id"` 的图形即可。界面会自动读取颜色、选中状态和无障碍标签。

## 目录结构

```text
brain-atlas/
├── index.html             页面结构与交互式 SVG 脑图
├── styles.css             完整视觉与响应式样式
├── app.js                 搜索、卡片、测验和本地进度逻辑
├── data/regions.js        可扩展脑区知识库
├── data/deep-dives.js     可扩展进阶专题知识库
├── scripts/build-offline.mjs
├── Open-Brain-Atlas.bat    Windows 一键启动
├── Brain-Atlas-Offline.html 单文件成品（推荐）
└── .github/workflows/pages.yml 自动发布配置
```

> 本站脑图为教学示意，比例和边界经过简化，不用于临床诊断或精确定位。
