export const GROUPS = {all:'全部',cortex:'皮层',hippocampus:'海马',amygdala:'杏仁核',thalamus:'丘脑',basal:'基底节 / 前脑',midbrain:'中脑',diencephalon:'间脑',cerebellum:'小脑'};
export const ATLAS = {julich:{name:'Julich-Brain 3.1',url:'https://doi.org/10.1126/science.abb4588',type:'细胞构筑分区',description:'从群体参考分区图提取的表面。分区来源于组织学细胞构筑；当前显示不包含个体差异的完整概率分布。'},cit168:{name:'CIT168',url:'https://doi.org/10.1038/sdata.2018.63',type:'皮层下概率图谱',description:'来源提供的概率等值面经过平滑与网格简化；其范围是参考边界，不代表每个个体中相同的核团边界。'},aal:{name:'AAL',url:'https://doi.org/10.1006/nimg.2001.0978',type:'宏观解剖分区',description:'小脑分叶的宏观解剖参考。与组织学定义的深部小脑核团来自不同分区体系。'}};
const SPECIAL={
 'CA1 (Hippocampus)':'海马 CA1 区','CA2 (Hippocampus)':'海马 CA2 区','CA3 (Hippocampus)':'海马 CA3 区','DG (Hippocampus)':'齿状回','Subc (Hippocampus, Subicular complex)':'下托复合体','TrS (Hippocampus, Transsubiculum)':'过渡下托','HATA (Hippocampus)':'海马–杏仁核过渡区','Area EC (Hippocampal Region, Entorhinal Cortex)':'内嗅皮层',
 'LB (Amygdala)':'杏仁核外侧基底核群','CM (Amygdala)':'杏仁核中央内侧核群','SF (Amygdala)':'杏仁核浅表核群','Astr (Amygdala)':'杏仁–纹状体过渡区','VTM (Amygdala)':'杏仁核 VTM 区','IF (Amygdala)':'杏仁核 IF 区','MF (Amygdala)':'杏仁核 MF 区',
 'STN (Subthalamus)':'丘脑底核','SNC (Midbrain, Substantia Nigra pars compacta)':'黑质致密部','SNR (Midbrain, Substantia Nigra pars reticulata)':'黑质网状部','NRp (Midbrain, Nucleus Ruber, parvocellular part)':'红核小细胞部','NRm (Midbrain, Nucleus Ruber, magnocellular part)':'红核大细胞部','CGL (Metathalamus)':'外侧膝状体','CGM (Metathalamus)':'内侧膝状体','ZI (Thalamus, zona incerta)':'未定带',
 'Nfast (Cerebellum, Fastigial Nucleus)':'小脑顶核','Ninterp (Cerebellum, Interposed Nucleus)':'小脑中间核','Ndentv (Cerebellum, Ventral Dentate Nucleus)':'齿状核腹侧部','Ndentd (Cerebellum, Dorsal Dentate Nucleus)':'齿状核背侧部','BST (Basal Forebrain, Bed Nucleus)':'终纹床核','Ch 4 (Basal Forebrain)':'基底前脑 Ch4 细胞群','Ch 123 (Basal Forebrain)':'基底前脑 Ch1–3 细胞群','AcbM (Ventral Striatum, Medial Accumbens)':'伏隔核内侧部','AcbL (Ventral Striatum, Lateral Accumbens)':'伏隔核外侧部','VP (Ventral Pallidum)':'腹侧苍白球','Tu (Basal Forebrain, Tuberculum)':'嗅结节','TuTi (Basal Forebrain, Terminal islands)':'嗅结节终末岛','FuP (Ventral Striatum, Fundus of Putamen)':'壳核底部','FuCd (Ventral Striatum, Fundus of Caudate Nucleus)':'尾状核底部'
};
const THAL={Po:'后核',LD:'背外侧核',PUm:'丘脑枕内侧部',PUi:'丘脑枕下部',VA:'腹前核腹侧部',AM:'前内侧核',VLP:'腹外侧后核',Li:'界核',Rt:'网状核',Pv:'室旁核',PUa:'丘脑枕前部',MD:'背内侧核',Pf:'束旁核',PUl:'丘脑枕外侧部',LP:'后外侧核',VM:'腹内侧核',CM:'中央中核',VAmc:'腹前核大细胞部',MV:'内腹核',VIM:'腹中间核',CL:'中央外侧核',VPL:'腹后外侧核',Sg:'膝上核',VLA:'腹外侧前核',VPM:'腹后内侧核',AV:'前腹侧核',sPf:'束旁下核',VPMpc:'腹后内侧核小细胞部',VPi:'腹后下核'};
const AREAS={PostCG:'中央后回',PostCS:'中央后沟',PreCG:'中央前回',LOC:'外侧枕叶',IPL:'顶下小叶',SPL:'顶上小叶',CoS:'侧副沟',Insula:'岛叶',SFG:'额上回',MFG:'额中回',IFG:'额下回',IFJ:'额下交界区',HESCHL:'颞横回',STS:'颞上沟',STG:'颞上回',FusG:'梭状回',OFC:'眶额皮层',IPS:'顶内沟',POS:'顶枕沟',FPole:'额极',POperc:'顶叶岛盖',IFS:'额下沟',SFS:'额上沟',PhG:'海马旁回',Cuneus:'楔叶',LingG:'舌回',OTS:'枕颞沟',ACC:'前扣带皮层',pACC:'膝前前扣带皮层',sACC:'膝下前扣带皮层'};
const CIT={'Putamen':'壳核','Caudate':'尾状核','Nucleus Accumbens':'伏隔核','Extended Amygdala':'扩展杏仁核','Globus Pallidus externa':'苍白球外侧部','Globus Pallidus interna':'苍白球内侧部','Substantia Nigra pars compacta':'黑质致密部','Red Nucleus':'红核','Substantia-Nigra-pars-reticulata':'黑质网状部','Parabrachial Pigmented':'臂旁色素核','Ventral Tegmental Area':'腹侧被盖区（VTA）','Ventral Pallidum':'腹侧苍白球','Habenular Nucleus':'缰核','Hypothalamus':'下丘脑','Mammillary Nucleus':'乳头核','Subthalamic Nucleus':'丘脑底核'};
export function describe(e){
 const s=e.name.trim(),side={L:'左侧',R:'右侧',M:'中线'}[e.hemisphere]||'';
 let title=SPECIAL[s];
 if(e.atlas==='cit168')title=CIT[s.slice(2).trim()]||s.slice(2);
 if(!title&&e.category==='thalamus'){const code=s.split(' ')[0];if(THAL[code])title='丘脑'+THAL[code];}
 if(!title&&e.atlas==='aal')title=s.replace(/Cerebelum|Cerebellum/g,'小脑').replace('Vermis','小脑蚓部').replace(/_[LR]$/,'').replaceAll('_',' ');
 if(!title&&s.startsWith('Area ')){
  const code=s.slice(5,s.indexOf(' ('));
  const loc=s.slice(s.indexOf('(')+1,-1);
  let place=Object.entries(AREAS).find(([a])=>loc===a||loc.startsWith(a+','))?.[1];
  if(loc.includes('preSMA'))place='前辅助运动区';else if(loc.includes('SMA'))place='辅助运动区';
  if(loc.includes('Frontal Operculum'))place='额叶岛盖';
  if(loc.includes('Piriform'))place='梨状皮层';
  if(code==='hOc1')place='初级视觉皮层 V1';
  if(code==='hOc2')place='次级视觉皮层 V2';
  if(code==='TPJ')place='颞顶交界区';
  title=(place||GROUPS[e.category]||'皮层')+' · '+code+' 区';
 }
 title=title||s;
 const full=side+' '+title;
 return {title,full,side,search:(full+' '+s+' '+(e.label||'')+' '+(s.includes('Subc')?'subiculum 下托':'')+' '+(s.includes('DG (')?'dentate gyrus 齿状回':'')+' '+(s.includes('Ventral Tegmental')?'vta':'')+' '+(s.includes('Ch 4')?'Meynert 基底核':'')).toLowerCase()};
}
export const LOCATION={cortex:'位于大脑皮层。可切换单侧半球或剖切，查看脑沟内及半球内侧的分区。',hippocampus:'位于内侧颞叶的海马结构及邻近皮层。选择 CA1、齿状回与下托，比较它们相邻但不等同的空间范围。',amygdala:'位于内侧颞叶前部。这里区分杏仁核内部的核群及过渡区；核群不等同于单个神经元。',thalamus:'位于间脑深部。显示的是不同丘脑核及邻近结构，可从内侧、背侧和冠状剖切观察。',basal:'位于皮层下与基底前脑。不同图谱对核团与细胞群的定义不同，请同时保留原始标签。',midbrain:'位于中脑及邻近深部。缩小外壳不透明度，可比较红核、黑质各部等结构的位置。',diencephalon:'位于间脑深部。这里使用 CIT168 图谱的参考等值面。',cerebellum:'位于后颅窝的小脑。AAL 描述宏观分叶，Julich 描述深部核团，两者属于不同层次。'};
