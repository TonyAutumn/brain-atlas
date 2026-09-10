# 三维解剖数据来源与使用范围

本模块用于非商业的个人解剖学习。蓝色表示选择或本地学习记录，不表示神经活动。没有生成单神经元或未经文献支持的连接。

## Julich-Brain v3.1 — 400 个左右分开的图谱条目

- Amunts K, Mohlberg H, Bludau S, Zilles K (2020). Julich-Brain: A 3D probabilistic atlas of the human brain’s cytoarchitecture. Science, 369, 988–992. https://doi.org/10.1126/science.abb4588
- 2023 v3.1 数据集：https://search.kg.ebrains.eu/instances/f1fe19e8-99bd-44bc-9616-a52850680777
- 实际下载的离散分区及标签：https://github.com/niivue/niivue-demo-images/tree/main/Juelich31
- 许可证按数据来源保留：CC BY-NC-SA。由该数据生成的 `julich-*.bin.gz` 同样按来源许可证共享；非商业使用、署名、相同方式共享。
- `JulichBrainAtlas31_LH.nii.gz` / `RH.nii.gz`；保留 1 mm 网格及 NIfTI sform 空间变换，ICBM152 2009 参考空间。`Julich.json` 提供原始标签。
- 排除背景和 7 个 GapMap 标签，余下每侧 200 个条目。细胞构筑标签的网格是群体分区的显示边界，不是单神经元或个体确定边界。
- 特别保留 `Subc (Hippocampus, Subicular complex)` 为下托复合体，不擅自改成更狭义的下托亚区。

## CIT168 — 32 个左右分开的皮层下条目

- Pauli WM, Nili AN, Tyszka JM (2018). A high-resolution probabilistic in vivo atlas of human subcortical brain nuclei. Scientific Data, 5, 180063. https://doi.org/10.1038/sdata.2018.63
- 原始数据：https://osf.io/jkzwp/
- 实际使用的 `CIT168.mz3` 与 `CIT168.json`：https://github.com/niivue/niivue-demo-images/tree/main/CIT168
- 许可证：CC BY 4.0。`cit168-*.bin.gz` 保留该许可证。
- 使用来源提供的已转换至 MNI152-2009c 的网格，依据每顶点整数标签拆分，没有重新定位。来源的表面处理是约 2 mm FWHM 平滑、0.5×各结构最大概率等值面与网格简化。不是绝对 50% 群体概率边界。
- CIT168 与 Julich 分开切换；同名结构的范围不被当作严格等同。

## ICBM152 2009 参考外壳

- 实际使用：https://github.com/neurolabusc/surf-ice/blob/master/sample/mni152_2009mini.mz3
- 网格源自真实参考脑解剖，非手绘或几何球体。保留原始顶点；按三角形中心的 X 正负划成两个显示组，因此中线附近跨中线三角形仍有少量跨越。
- 模型只提供空间背景。参考脑、Julich、CIT168 及 AAL 的模板版本和分区方法并不完全相同，不能用于临床或个体精确配准。
- Surf Ice 项目及其原始资源的许可与署名适用于该源模型：https://github.com/neurolabusc/surf-ice

## AAL — 26 个小脑分叶条目

- Tzourio-Mazoyer N et al. (2002). Automated anatomical labeling of activations in SPM using a macroscopic anatomical parcellation of the MNI MRI single-subject brain. NeuroImage, 15, 273–289. https://doi.org/10.1006/nimg.2001.0978
- 使用 NiiVue 示例库的 `aal.nii.gz` 与 `aal.json`：https://github.com/niivue/niivue/tree/main/packages/niivue/demos/images
- 仅提取小脑宏观分叶和蚓部；不将分叶与 Julich 的细胞构筑核团合并为同一层级。保留该数据的来源使用条件及分发项目的署名声明。

## 可复现处理

### 学习导航（2026-09-10）

`navigation.js` 是站点的学习索引，不是 Julich 或 CIT168 官方新增层级。按原始标签中的解剖位置建立入口，不按网格中心猜测脑叶，不改变任何原始标签、坐标、表面或 ID。皮层分组使用来源标签的脑回/沟位置；梭状回、枕颞沟、侧副沟、顶枕沟及颞顶交界保守放入「交界及跨叶区域」。这种分组不声称每个分区都跨越两叶；目的是避免单凭位置简称强制确定脑叶归属。

STN 原始标签明确注明 Subthalamus，导航与 ZI 一同放入丘脑底部；中脑导航保留红核、黑质等中脑结构。CIT168 原始标签中的下丘脑、缰核、乳头核列入其他间脑。AAL 小脑分叶与 Julich 小脑深部核团分别导航。来源标签见上文对应数据仓库；图谱的宏观、微观与连接层级背景见 [EBRAINS Human Brain Atlas](https://ebrains.eu/data-tools-services/brain-atlases/human-brain)。

大结构或脑叶高亮是已收录分区的集合，不是完整脑叶轮廓、白质分割或脑叶体积估计。脑干当前仅收录部分中脑核团。

`scripts/build-anatomy.py` 从上述文件生成显示网格。Julich / AAL：提取标签体素暴露面，合并共享顶点，进行 4 对 λ=0.5、μ=−0.53 的 Taubin 平滑，应用原始 sform affine。没有添加空间细节或提高原始分辨率。未平滑体素掩膜才是分区的原始表达。

网格使用小端 int16 顶点（×0.05 mm）与 uint16 三角形索引；显示量化误差不超过 0.025 mm，按组 gzip 压缩。`manifest.json` 记录文件 SHA-256、每条目原始标签、顶点数、三角形数、边界、显示中心与字节偏移。文件中心是网格顶点平均值，不是激活峰或质心的实测定位。

Three.js r160 与 OrbitControls 按 MIT 许可分发，全文见 `vendor/LICENSE-three.txt`。界面脚本不依赖外部 CDN。
