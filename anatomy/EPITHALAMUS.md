# 上丘脑、缰核与松果体 · 2026-09-25

上丘脑现在是父级。缰核复合体下列内侧缰核（MHb）和外侧缰核（LHb）；松果体、丘脑髓纹、缰连合、后连合有独立入口、中英文名称及从属/相关关系。

| 结构 | 当前三维数据 | 显示范围 |
| --- | --- | --- |
| 上丘脑 | CIT168 缰核 + Allen 2020 松果体 | 部分模型；不是连续、完整的上丘脑边界 |
| 缰核复合体 | 原 CIT168 `cit-25`、`cit-26` | 左右整个缰核，原顶点和 ID 不变 |
| 内侧/外侧缰核 | 无独立分割 | 仅层级，不能用整个缰核替代 |
| 松果体 | Allen Human Reference Atlas 3D 2020，标签 10460 | 一份中线模型，不拆成左右 |
| 丘脑髓纹、缰连合、后连合 | 无对应分割 | 仅层级，相关位置不产生虚构网格 |

搜索“缰核”会找到缰核复合体与原有左右模型。“上丘脑”不再作为缰核模型的同义词；进入上丘脑时显示已收录子结构，并明确标记部分覆盖。搜索 MHb/LHb 不会返回整个缰核作为该亚核的模型。

这是学习导航，不是对各图谱本体的统一替代。Allen 原本体将纤维束单独分类，后连合归入中脑纤维系统；本站保留这些说明及相关入口。

## 松果体来源与可复现处理

- Ding SL, Royall JJ, Sunkin SM, Facer BAC, Lesnar P, Bernard A, Ng L, Lein ES (2020). *Allen Human Reference Atlas – 3D, 2020*. Version 1.0.0, RRID:SCR_017764. © 2019 Allen Institute for Brain Science. CC BY 4.0（官方说明自 2022-09-01 起适用）。
- [官方说明、空间与许可](https://community.brain-map.org/t/allen-human-reference-atlas-3d-2020-new/405)
- [官方双侧 annotation_full.nii.gz](https://download.alleninstitute.org/informatics-archive/allen_human_reference_atlas_3d_2020/version_1/annotation_full.nii.gz)
- [官方结构名称和 ID](https://download.alleninstitute.org/informatics-archive/allen_human_reference_atlas_3d_2020/version_1/examples/voxel_count/voxel_count.csv)

仅提取 `pineal body` / 10460。来源为 MNI ICBM152 2009b 非线性对称模板，0.5 mm 体素，RAS 毫米。使用原 NIfTI qform，未平移、缩放拟合其他图谱，也未重新配准。双侧完整标注中该标签有 792 体素（99 mm³）；来源 CSV 的计数对应原始单侧版本，不能拿来直接代替完整标注的计数。

由标签体素的暴露面生成网格，进行 4 对 Taubin 轻度平滑（0.5 / −0.53），最后量化为 0.05 mm。网格不是概率等值面，不是个体边界，平滑也不增加 0.5 mm 原始分辨率。模板版本不同，因此和 CIT168、Julich 及外壳的叠加只用于空间学习。

运行 `python scripts/build-epithalamus.py` 可重复生成；依赖 NumPy、SciPy、nibabel。脚本核对下载文件 SHA-256，只替换新增松果体条目，不重建旧网格。[处理记录与校验值](pineal-provenance.json)保留源链接、仿射矩阵、标签、体素数和输出信息。新增网格按来源 CC BY 4.0 分发。

此前考虑的 Razavi et al. (2021) 松果体概率图谱下载站在本轮未能取得数据，因此本次使用的是 Allen 官方分割，不将两者混称。

## 文献与旧记录

精确的缰核/松果体术语可建立候选。MHb/LHb、纤维束不回退到整个缰核。侧别不明仍保留候选；只有原文明示或人工核对后才选择“中线”，不会推断为双侧实验结果。已有候选、人工核对状态、历史、笔记和学习 ID 保留。新版词表会补充缺失匹配，不覆盖已有目标。

分析服务新增 `atlas-midline-v1` 能力；更新网站不会自动部署用户的 Cloudflare Worker。页面在发送新论文前核对服务能力，旧版本会提示更新并保留用户选择的文件，不直接发起付费分析。
