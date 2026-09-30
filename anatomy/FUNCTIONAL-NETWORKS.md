# 功能网络的皮层范围

三维解剖页的网络选择使用 Schaefer 2018 **200 个皮层分区**。每个分区直接由官方 FSL MNI152 1 mm 标签体积生成，按官方 Yeo 7 / 17 网络归属加入已选，统一黄色显示。不会用邻近的 Julich 解剖分区代替功能分区。

| Yeo 7 网络 | 官方代码 | 分区数（左右合计） |
|---|---|---:|
| 默认模式 DMN | Default | 46 |
| 视觉 VIS | Vis | 29 |
| 躯体感觉运动 SMN | SomMot | 35 |
| 背侧注意 DAN | DorsAttn | 26 |
| 显著性 / 腹侧注意 SAL-VAN | SalVentAttn | 22 |
| 边缘 LIM | Limbic | 12 |
| 额顶控制 FPN | Cont | 30 |

另提供全部 17 网络方案：VisCent、VisPeri、SomMotA/B、DorsAttnA/B、SalVentAttnA/B、LimbicA/B、ContA/B/C、DefaultA/B/C、TempPar。**7 与 17 网络不是严格嵌套的层级**；同一个几何分区分别保存两种官方归属。显著性 / 腹侧注意是此方案的联合类别，不声称等同于任何论文单独定义的 SN 或 VAN。

DMN 的 46 个分区包括双侧前额叶、后内侧皮层、顶叶与颞叶标签。详情显示原始分区名及两套归属；中文位置标签参考官方缩写表，不把不同图谱中的同名结构视为边界一致。

## 选择与旧数据

选择多个网络会累计去重，刷新保留。删除一个网络只移除这一选择来源，其他网络或此前手动选中的重叠分区保留；单个分区的 × 则移除该分区的所有选择来源。再次明确选择该网络可以补回已移除的成员。旧版本的 4 个角回参考保留为“旧 DMN 角回参考”，由用户用 × 取消，不会静默替换。

原有 459 个解剖模型、结构导航、学习标记、笔记、文献和历史对应均保留。功能模型单独存储，按选择加载，不加入解剖层级或冒充实验定位。网络索引临时加载失败时，不覆写已保存的选择。

## 可重建与核对

- [固定版本的官方来源](https://github.com/ThomasYeoLab/CBIG/blob/1735ecc7c2e91ceac51f5e3da31d2ef59c8856ae/stable_projects/brain_parcellation/Schaefer2018_LocalGlobal/README.md)
- [Schaefer et al. 2018](https://doi.org/10.1093/cercor/bhx179)；[Yeo et al. 2011](https://doi.org/10.1152/jn.00338.2011)
- `functional-provenance.json` 记录源文件 SHA-256、源仿射与处理方法。
- `../scripts/build-functional-networks.py` 验证 7 / 17 标签体积的全部 200 个分区逐体素一一对应；保留所有非零源体素，没有按重叠比例猜测网络归属。
- `../scripts/validate-functional-atlas.mjs` 验证所有模型文件哈希、坐标、网格索引、边界、双侧覆盖、两套网络的完整性，以及功能/解剖候选的隔离。
- CBIG 数据和代码遵循 [MIT 许可](SCHAEFER-LICENSE.txt)。

这是群体皮层参考图谱，**不含皮层下和小脑**。FSL MNI152 与页面上其他图谱使用的模板版本不同，叠加用于空间参考，并非个体配准。表面平滑不增加源数据分辨率，网络范围也不代表某篇论文的激活范围。
