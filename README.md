# 脑区探索室 · Brain Atlas Lab

一个可在线访问、也可打包后离线运行的交互式脑区学习网站。

## 在线访问

https://tonyautumn.github.io/brain-atlas/

提交到 `main` 分支后，GitHub Actions 会自动把最新版发布到同一个网址。

## 包含内容

- 13 个主要脑区与两种示意视角
- 核心功能、典型实验、结果解读、记忆技巧和常见误区
- 搜索、系统筛选、记忆卡与随机测验
- 进阶专题系统：通路图、实验、关键文献、前沿争议和独立测验
- 学习进度与个人笔记本机保存
- 键盘操作和移动端适配

## 离线运行

双击 `Brain-Atlas-Offline.html` 即可。所有样式、数据和交互均已打包在单一文件中。文件名使用英文是为了避免 Windows 批处理和压缩软件的中文编码问题。

也可以打开源码目录中的 `index.html`。源码不需要本地服务器，断网时仍能运行。

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

如需在脑图中显示新区域，再在 `index.html` 的 SVG 中加入带有 `data-region="你的-id"` 的图形即可。界面会自动读取颜色、选中状态和无障碍标签。

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
