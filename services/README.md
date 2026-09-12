# 个人 Kimi 分析服务

`papers.html` 是 GitHub Pages 上的主题文献库。Kimi 调用需要运行此服务；把这段代码上传到 GitHub 本身不会启动后端。页面的「连接 Kimi → 第一次使用」提供完整配置步骤和复制代码按钮。

## 一次性配置

1. 在 Cloudflare Workers 控制台新建一个 Worker（可从 Hello World 开始）。
2. 使用 `kimi-worker.js` 的完整内容替换默认代码并部署。该文件无外部依赖。
3. 在 Settings → Variables and Secrets 添加两个 **Secret**：
   - `MOONSHOT_API_KEY`：现有 Kimi 开放平台 API 密钥。
   - `ACCESS_TOKEN`：至少 24 字符的随机个人访问码；页面可生成 48 位十六进制访问码。
4. 可选变量：`KIMI_MODEL`（默认 `kimi-k2.6`）；`MOONSHOT_BASE_URL`（默认 `https://api.moonshot.cn/v1`，也支持国际区 `https://api.moonshot.ai/v1`）；`ALLOWED_ORIGIN`（默认 `https://tonyautumn.github.io`，只填 origin，不包含 `/brain-atlas/` 路径）。
5. 保存并重新部署，把 Worker 的 HTTPS 网址和访问码填入网站「连接 Kimi」，点击测试连接。测试会核对服务、Kimi 密钥及模型列表，不分析论文。

访问码与 Kimi 密钥不同；二者都不要提交到公开仓库。网站只保存服务网址，访问码仅保存到当前标签页 sessionStorage。备份不包含连接设置。服务不提供公共免认证调用入口。

## 分析流程与范围

- `POST /analyze` 接受 multipart 表单：`file` 或 `text` 二选一，可带 `figures`、`themes`、`chosenTheme`。
- 单篇文件最大 12 MB，可选 PDF、TXT、MD、DOCX；最多 3 张 PNG/JPEG/WebP 图表，每张 2 MB；总请求不超过 20 MB。正文上限 18 万字符，超过时明确停止，不截掉末尾冒充全文分析。
- PDF 使用 Kimi `file-extract` 提取文本；PDF 中的图片不会自动转成视觉输入。关键图表可通过附图输入交给支持视觉的模型。扫描件提取不足时需要先 OCR。
- 以 `application/x-ndjson` 返回阶段消息、心跳、警告、结果或错误。无伪造百分比；超时/取消/无效 JSON/被截断的结果不作为成功分析保存。
- 文件提取后调用 `/chat/completions`，不提供工具调用。论文与图表是待分析资料，不作为服务指令。模型使用 JSON Mode，另行验证结构、编号和连接端点。前端核对短引文是否出现在提取文本中；文本匹配不等于学术结论正确。
- 每次请求只删除它自己在 Kimi 上上传的临时文件；从不列出或清除其他文件。删除失败会提示。浏览器中保留原文件和提取文本；服务本身不建立云端文献库、不写入 GitHub、不记录论文正文或密钥日志。供应商的数据处理受各自条款约束。
- 同篇正文 SHA-256 相同的文件在本地拦截重复分析。不会自动重试付费请求。模型调用与 Worker 使用可能收费，以账户实际方案为准。

## 主题与解剖对应

一篇文献可以有多个主题。NDE、near-death experience、近死体验等主题名规范为「濒死体验」。主题重命名到已有名称会合并，文献 ID 和每条机制的原始来源保留。

机制证据区分统计关联、干预、解剖连接、有效连接模型、假说、综述；同时区分本文研究、引用研究和作者解释。共同激活不会被程序自动补成连线。有向标志只允许出现在干预、解剖或有效连接类别，仍须人工检查其含义。

自动图谱匹配采取保守规则：精确名称/缩写候选或已列明的大结构；人类且侧别明确才自动投图。动物、侧别未知、细胞类型和单神经元留在证据列表中。大结构高亮是已收录分区集合，不能代表更精细的论文定位。

三维连线是显示中心之间的示意曲线，不是纤维重建或传导顺序。主题汇总不会把不同论文的节点 ID 合并后推导新的链路。每条机制卡片仍附对应论文、方法、原文位置、摘录与限制。

## 维护与验证

编辑 `kimi-core.js` 和 `../research/schema.js` 后执行 `node scripts/build-kimi-worker.mjs` 重新生成独立服务文件。运行 `node scripts/validate-research.mjs` 验证保守匹配、主题规范、文献来源隔离、备份结构、几何及服务协议。测试使用模拟 Kimi 响应，不代表已通过真实密钥调用或浏览器验收。

官方接口依据（2026-09-10 核对）：

- [Kimi 文件问答](https://platform.kimi.com/docs/guide/use-kimi-api-for-file-based-qa)
- [获取提取文本](https://platform.kimi.com/docs/api/files-content)
- [JSON Mode](https://platform.kimi.com/docs/guide/use-json-mode-feature-of-kimi-api)
- [Kimi K2.6 参数](https://platform.kimi.com/docs/guide/kimi-k2-6-quickstart)
- [Cloudflare 控制台部署](https://developers.cloudflare.com/workers/get-started/dashboard/)


## 自动联网补全（lookup1）

更新 Worker 后 `/health` 返回 `capabilities: ["enrich-v1"]`。`POST /enrich` 接受 multipart `regions`（1–4 项 JSON）和 `source`（既有提取文本）。前端在论文保存后自动调用，也提供已有论文批量入口、重试和取消。原论文与逐项完成结果分别保存；失败不回滚原文。

来源为固定 HTTPS 接口：EMBL-EBI OLS4（UBERON / CL）、Europe PMC 摘要、siibra API（Julich v3.1 与 HarvardOxford thr25）。访问公共来源时不携带 Kimi 密钥，也不跟随重定向或请求模型提供的网址。服务只从实际响应取得来源链接和图谱坐标；Kimi 仅复核来源内容，返回的摘录须原样存在于该来源。没有读取论文全文的检索结果标为摘要。

siibra `hasAnnotation.bestViewPoint` 被保存为外部图谱显示参考点，限定 MNI152 ICBM 2009c nonlinear asymmetric、RAS、mm。它不是论文激活峰、核团完整体积或单神经元位置。本版不执行坐标空间转换或下载新网格。细胞仅在纯人类记录、侧别明确、引用明确含 human 与所属结构时生成每侧一个示意标记；鼠和混合物种记录不投射为人脑位置。

结果保存在浏览器 IndexedDB 的 `paper.enrichments`，JSON 备份包含来源、日期、摘录和参考点。已完成条目不重复检索；新论文可复用之前的确切术语匹配，但不继承另一篇的推断、坐标或细胞证据。新的任务需要网页保持打开。

验证：`node scripts/validate-enrichment.mjs` 覆盖模拟检索、鉴权、摘录核验、坐标空间、逐条流式保存、失败、别名复用、备份和示意点。真实公共接口已读取得到响应；付费 Kimi 与用户部署的 Worker 需要配置后验证。
