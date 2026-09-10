// Names target only structures actually present in the shipped atlas manifest.
export const RULES=[
 ['TPJ',['temporoparietal junction','temporo-parietal junction','TPJ','颞顶联合区','颞顶交界区'],['TPJ'],'近似候选：Julich 的 Area TPJ；不代表论文中所有 TPJ 定义或实际激活范围。'],
 ['ACC',['anterior cingulate cortex','ACC','前扣带皮层','前扣带回'],['25','33','p24ab','p24c','p32','s24','s32'],'已收录前扣带分区集合；不包含整个扣带回，也不等于实验激活掩膜。'],
 ['OFC',['orbitofrontal cortex','OFC','眶额皮层'],['Fo1','Fo2','Fo3','Fo4','Fo5','Fo6','Fo7'],'已收录眶额分区集合。'],
 ['DG',['dentate gyrus','DG','齿状回'],['DG']],
 ['EC',['entorhinal cortex','EC','内嗅皮层'],['EC']],
 ['Subc',['subiculum','subicular complex','下托','下托复合体'],['Subc'],'近似候选：下托复合体，范围可能大于论文中的下托亚区。'],
 ['V1',['primary visual cortex','V1','初级视觉皮层','BA17'],['hOc1']],
 ['V2',['secondary visual cortex','V2','次级视觉皮层','BA18'],['hOc2']],
 ['M1',['primary motor cortex','M1','初级运动皮层'],['4a','4p']],
 ['S1',['primary somatosensory cortex','S1','初级躯体感觉皮层'],['1','2','3a','3b']],
 ['AG',['angular gyrus','AG','角回'],['PGa','PGp'],'已收录角回细胞构筑分区集合。'],
 ['SMG',['supramarginal gyrus','SMG','缘上回'],['PF','PFcm','PFm','PFop','PFt'],'已收录缘上回分区候选集合；边界需结合论文定义核对。'],
 ['VTA',['ventral tegmental area','VTA','腹侧被盖区'],['Ventral Tegmental Area']],
 ['NAc',['nucleus accumbens','NAc','NAcc','伏隔核'],['Nucleus Accumbens']],
 ['caudate',['caudate nucleus','尾状核'],['Caudate']],
 ['putamen',['壳核'],['Putamen']],
 ['hypothalamus',['下丘脑'],['Hypothalamus']],
 ['STN',['subthalamic nucleus','STN','丘脑底核'],['STN']],
 ['MD',['mediodorsal thalamus','mediodorsal thalamic nucleus','丘脑背内侧核'],['MD']]
];
export function nameVariants(name){
 const full=String(name||'').normalize('NFKC').trim();
 const stripped=full.replace(/^(?:(?:left|right|bilateral)\s+|左侧|右侧|双侧)/i,'');
 // Parentheses may contain an abbreviation. Never discard arbitrary descriptors.
 return [...new Set([full,stripped,stripped.replace(/\s*\([^()]*\)\s*$/,'').trim(),...[...stripped.matchAll(/\(([A-Za-z][A-Za-z0-9 .-]{0,24})\)/g)].map(m=>m[1])])];
}
export const atlasName=e=>e.name.replace(/^[LR] /,'').replace(/_[LR]$/,'').trim();
export const atlasCode=e=>atlasName(e).replace(/^Area /,'').split(' (')[0];
