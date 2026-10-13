// Curated anatomical display sets, not an extra Yeo network or an activation atlas.
// IDs refer only to existing Julich meshes; no neighboring parcel fills a missing area.
export const OLFACTORY_SOURCES=[
 {title:'Zhou et al., 2019 · 人类初级嗅觉皮层及功能通路',url:'https://doi.org/10.7554/eLife.47177'},
 {title:'Djordjevic et al., 2005 · 嗅觉表象中的梨状、眶额与岛叶活动',url:'https://pubmed.ncbi.nlm.nih.gov/15652314/'},
 {title:'Gottfried & Zald, 2005 · 人类嗅觉眶额皮层的定位差异',url:'https://pubmed.ncbi.nlm.nih.gov/16213593/'},
 {title:'Noto et al., 2021 · 嗅觉杏仁核亚区',url:'https://doi.org/10.3389/fnsys.2021.752320'},
 {title:'Julich-Brain · 本站三维分区来源',url:'https://doi.org/10.1126/science.abb4588'}
];
const primary={label:'POC · 初级嗅觉皮层的已收录部分',codes:['PirT','PirTB','Tu'],note:'显示双侧梨状皮层 PirT、PirTB 和嗅结节 Tu，共 6 个图谱模型。PirT / PirTB 是本图谱的细胞构筑分区，不等同于所有研究的前 / 后梨状皮层划分。'};
const secondary={label:'SOC · 次级嗅觉相关皮层参考',codes:['Fo1','Fo2','Fo3','Fo4','Fo5','Fo6','Fo7','Ia1','Ia2','Ia3'],note:'显示双侧眶额 Fo1–Fo7 与无颗粒岛叶 Ia1–Ia3，共 20 个解剖参考模型。SOC 常以眶额皮层为核心，纳入范围随研究而异；这里显示整个已收录解剖分区，不表示它们全部属于嗅觉专属皮层或全部被激活。'};
const associated={label:'相关区域 · 边界较宽的参考',codes:['EC','SF','MD'],note:'另显示双侧内嗅皮层 EC、杏仁核浅表核群 SF 和丘脑背内侧核 MD，共 6 个参考模型。EC / SF 的整体网格不能代替文献中的嗅觉亚区；MD 是相关通路节点，不是初级嗅觉皮层。'};
export const OLFACTORY_NOTE='按嗅觉文献组织已有解剖模型，黄色表示组合选择。这不是 Yeo 的第 8 个网络，也不是专用嗅觉功能分区图；模型边界与嗅觉功能范围并不等同。';
const missing='当前未收录嗅球、嗅束、前嗅核 AON 和额部梨状皮层 PirF 的独立模型；杏仁核 MeA / CoA / PAC 及内嗅皮层的嗅觉亚区也未分别分割。下方数量只统计可显示模型，不表示完整覆盖。';
const common={kind:'circuit',color:'#ffd34e',scope:'Julich-Brain · 部分解剖参考',source:OLFACTORY_SOURCES[0].url,sources:OLFACTORY_SOURCES,note:OLFACTORY_NOTE,missing};
export const OLFACTORY_PRESETS=[
 {...common,id:'OLF',label:'嗅觉回路 · 已收录参考',aliases:['嗅觉','嗅觉系统','嗅觉通路','olfactory circuit','olfactory pathway','olfactory network','olfaction'],sections:[primary,secondary,associated]},
 {...common,id:'POC',label:'初级嗅觉皮层 POC · 部分范围',aliases:['初级嗅觉皮层','初级嗅皮层','一级嗅觉皮层','primary olfactory cortex'],sections:[primary]},
 {...common,id:'SOC',label:'次级嗅觉皮层 SOC · 解剖参考',aliases:['次级嗅觉皮层','次级嗅皮层','二级嗅觉皮层','secondary olfactory cortex'],sections:[secondary]}
].map(p=>({...p,atlasCodes:p.sections.flatMap(s=>s.codes)}));
