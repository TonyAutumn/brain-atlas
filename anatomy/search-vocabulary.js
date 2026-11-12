// Search-only vocabulary. Never used to infer evidence matches or change model IDs.
// Full audit, sources and approximate functional correspondences: SEARCH-VOCABULARY.md.
export const VOCABULARY_VERSION='2026-11-12.1';
const words=s=>s.split('|').filter(Boolean);
const table=rows=>Object.fromEntries(Object.entries(rows).map(([k,v])=>[k,words(v)]));
export const CONCEPT_TERMS=table({
 cortex:'cerebral cortical gray matter|大脑皮层',insula:'insular cortex|insular lobe|island of Reil|岛皮质|脑岛',
 frontal_motor:'motor cortex|premotor cortex|运动皮质|前运动区',
 frontal_prefrontal:'lateral prefrontal cortex|LPFC|前额皮层|前额皮质',
 frontal_orbital:'orbitofrontal cortex|orbital frontal cortex|OFC|frontopolar cortex|frontal pole|额极皮层|眶额皮质|眶额叶',
 parietal_somato:'somatosensory cortex|somatic sensory cortex|躯体感觉皮质',
 parietal_superior:'superior parietal cortex|SPC|顶上皮层',
 parietal_inferior:'inferior parietal cortex|IPC|顶下皮层',
 temporal_auditory:'auditory cortex|Heschl gyrus|Heschl gyri|transverse temporal gyrus|transverse temporal gyri|听皮层|赫施尔回',
 temporal_superior:'superior temporal cortex|颞上皮层',
 temporal_parahippocampal:'parahippocampal gyrus|PHG|parahippocampal cortex|PHC|海马旁皮层',
 occipital_early:'early visual cortex|EVC|早期视觉皮质',
 occipital_extra:'extrastriate cortex|extrastriate visual cortex|纹外视觉皮质',
 insula_granular:'granular insula|granular insular cortex|颗粒岛皮层',
 insula_dysgranular:'dysgranular insula|dysgranular insular cortex|异颗粒岛皮层',
 insula_agranular:'agranular insula|agranular insular cortex|无颗粒岛皮层',
 cingulate:'cingulate cortex|cingulate gyrus|扣带皮质',
 cingulate_anterior:'anterior cingulate gyrus|ACG|前扣带回|前扣带皮质',
 cingulate_subgenual:'subgenual cingulate cortex|subgenual ACC|sgACC|subcallosal cingulate cortex|膝下前扣带皮层',
 transition:'cortical junctions|跨叶皮层',
 transition_tpj:'temporo parietal junction|temporal parietal junction|颞顶接合区',
 transition_ventral:'ventral occipitotemporal cortex|ventral occipito temporal cortex|VOTC|腹侧枕颞皮层',
 transition_parietooccipital:'parieto occipital junction|parieto occipital sulcus|POS|顶枕沟',
 hippocampus:'hippocampal formation|HF|HPC|海马体|海马构成',
 hippocampal_fields:'Ammon horn|cornu ammonis|阿蒙角|阿蒙氏角',
 dentate:'fascia dentata|FD|齿状回',
 subicular:'subicular complex|subiculum|SUB|下托皮层',
 entorhinal:'entorhinal cortex|ERC|EC|内嗅皮质',
 hippocampal_transition:'hippocampal transition areas|hippocampal amygdaloid transition area|HATA|海马杏仁核过渡区',
 amygdala:'amygdaloid complex|amygdaloid body|AMY|杏仁体|杏仁复合体',
 amygdala_basolateral:'laterobasal amygdala|laterobasal group|latero basal amygdala|LB|基底外侧杏仁核群',
 amygdala_corticomedial:'corticomedial amygdala|cortico medial amygdala|皮质内侧杏仁核群',
 amygdala_centromedial:'centromedial amygdala|central medial amygdala|CM|中央内侧杏仁核群',
 amygdala_superficial:'superficial amygdala nuclei|superficial nuclear group|SF',
 amygdala_transition:'amygdalostriatal transition area|amygdalo striatal transition area|Astr|杏仁纹状体过渡区',
 basal:'basal nuclei|BG|基底核|基底核群',dorsal_striatum:'dorsal striatum|DS|neostriatum|新纹状体',
 ventral_striatum:'ventral striatum|VStr|腹侧纹状体',caudate:'nucleus caudatus|CN|Cd|尾核',
 putamen:'Put|壳',nucleus_accumbens:'accumbens nucleus|accumbens|NA|NAC|伏隔核',
 dorsal_pallidum:'globus pallidus|pallidum|GP|苍白球',
 forebrain:'basal forebrain|BF|基底前脑',
 basal_forebrain_cholinergic:'basal forebrain cholinergic nuclei|basal forebrain cholinergic system|BFCN',
 extended_amygdala:'extended amygdala|bed nucleus of stria terminalis|bed nuclei of the stria terminalis|终纹床核',
 olfactory_forebrain:'olfactory tubercle|olfactory tuberculum|OT|嗅结节',
 thalamus_anterior:'anterior nuclei of thalamus|anterior thalamic nuclear group|ATN|丘脑前核群',
 thalamus_medial:'medial nuclei of thalamus|丘脑内侧核群',
 thalamus_ventrolateral:'ventral thalamic nuclei|lateral thalamic nuclei|丘脑腹侧核群|丘脑外侧核群',
 thalamus_posterior:'posterior nuclei of thalamus|pulvinar nuclei|Pul|枕核|丘脑后核群',
 thalamus_geniculate:'metathalamus|lateral geniculate body|medial geniculate body|LGB|MGB|后丘脑',
 thalamus_intralaminar:'intralaminar nuclei of thalamus|midline nuclei of thalamus|丘脑板内核群|丘脑中线核群',
 thalamus_reticular:'reticular thalamic nucleus|reticular nucleus|nucleus reticularis thalami|RTN|NRT|丘脑网状核',
 subthalamic_nucleus:'subthalamic nucleus of Luys|Luys nucleus|nucleus subthalamicus|丘脑下核|路易斯核',
 zona_incerta:'zona incerta|未定区',hypothalamus:'hypothalamic region|丘脑下部',
 substantia_nigra:'substantia nigra|黑质核',red_nucleus:'nucleus ruber|rubral nucleus|红核',
 ventral_tegmental:'ventral tegmental area of Tsai|Tsai ventral tegmental area',
 cerebellar_lobules:'cerebellar cortex|cerebellar cortical lobules|小脑皮质',
 cerebellar_nuclei:'cerebellar deep nuclei|deep cerebellar nuclei|DCN|小脑核',
 cerebellar_medial_nuclei:'fastigial nucleus|nucleus fastigii|interposed nuclei|interpositus nucleus|顶核|中间核',
 dentate_nucleus:'nucleus dentatus|DN|齿状核',
 pineal_gland:'pineal|epiphysis|松果腺',
 periaqueductal_gray:'central gray|central grey|periaqueductal grey matter|导水管周围灰质',
 cerebral_aqueduct:'aqueductus cerebri|Sylvian aqueduct|Sylvius aqueduct|大脑导水管',
 locus_coeruleus:'locus ceruleus|locus coeruleus nucleus|LC nucleus',
 pedunculopontine:'pedunculo pontine tegmental nucleus|pedunculopontine tegmentum|PPTg',
 laterodorsal_tegmental:'latero dorsal tegmental nucleus|LDTN',
 median_raphe:'nucleus raphe medianus|median raphe|正中缝核',
 dorsal_raphe:'nucleus raphe dorsalis|dorsal raphe|背缝核',
 inferior_olive:'inferior olivary nuclei|ION|IO complex',
 solitary_nucleus:'solitary tract nucleus|nucleus solitarius|nucleus of solitary tract',
 nucleus_ambiguus:'NAmb|Amb',gracile_nucleus:'gracilis nucleus|Gr',
 cuneate_nucleus:'cuneatus nucleus|Cu',hypoglossal_nucleus:'hypoglossal motor nucleus|XII nucleus',
 retrosplenial_cortex:'retrosplenial cortical area|RSP|胼胝体压后皮层',
 precuneus:'precuneal cortex|PrCun|PCUN|楔前叶皮层'
});
export const LOCATION_TERMS=table({
 PostCG:'postcentral gyrus|post central gyrus|PoCG|中央后回',
 PostCS:'postcentral sulcus|post central sulcus|中央后沟',
 PreCG:'precentral gyrus|pre central gyrus|PrCG|中央前回',
 PreCS:'precentral sulcus|中央前沟',
 SFG:'superior frontal gyrus|额上回',MFG:'middle frontal gyrus|额中回',
 IFG:'inferior frontal gyrus|额下回',IFS:'inferior frontal sulcus|额下沟',
 SFS:'superior frontal sulcus|额上沟',IFJ:'inferior frontal junction|额下交界区',
 IPL:'inferior parietal lobule|inferior parietal cortex|顶下小叶',
 SPL:'superior parietal lobule|superior parietal cortex|顶上小叶',
 IPS:'intraparietal sulcus|intra parietal sulcus|顶内沟',
 'Frontal Operculum':'frontal opercular cortex|frontal operculum|额叶岛盖',
 POperc:'parietal operculum|parietal opercular cortex|顶叶岛盖',
 HESCHL:'Heschl gyrus|Heschl gyri|Heschl transverse gyrus|transverse temporal gyrus|transverse temporal gyri|HG|颞横回|赫施尔回',
 STG:'superior temporal gyrus|颞上回',STS:'superior temporal sulcus|颞上沟',
 SMG:'supramarginal gyrus|缘上回',FusG:'fusiform gyrus|fusiform cortex|FG|梭状回',
 PhG:'parahippocampal gyrus|PHG|parahippocampal cortex|PHC|海马旁回|海马旁皮质',
 OFC:'orbitofrontal cortex|orbito frontal cortex|orbital frontal cortex|眶额皮层|眶额皮质',
 FPole:'frontal pole|frontopolar cortex|fronto polar cortex|FPC|额极|额极皮层',
 CoS:'collateral sulcus|侧副沟',OTS:'occipitotemporal sulcus|occipito temporal sulcus|枕颞沟',
 POS:'parieto occipital sulcus|parietooccipital sulcus|顶枕沟',
 LOC:'lateral occipital cortex|lateral occipital complex|外侧枕叶皮层',
 CalcS:'calcarine sulcus|calcarine fissure|距状沟|距状裂',
 Cuneus:'cuneus cortex|楔叶',LingG:'lingual gyrus|LG|舌回',
 ACC:'anterior cingulate cortex|anterior cingulate gyrus|前扣带皮层',
 pACC:'pregenual anterior cingulate cortex|pregenual ACC|pgACC|膝前前扣带皮层',
 sACC:'subgenual anterior cingulate cortex|subgenual ACC|sgACC|膝下前扣带皮层',
 Insula:'insular cortex|insular lobe|island of Reil|脑岛|岛叶|岛皮质',
 SMA:'supplementary motor area|SMA proper|辅助运动区',
 preSMA:'pre supplementary motor area|preSMA|前辅助运动区',
 PiriformCortexMesial:'piriform cortex|pyriform cortex|piriform|梨状皮层|梨状皮质'
});
const EXACT=table({
 '1':'BA1|Brodmann area 1','2':'BA2|Brodmann area 2',
 '3a':'BA3a|Brodmann area 3a','3b':'BA3b|Brodmann area 3b',
 '4a':'BA4a|Brodmann area 4a|BA4|Brodmann area 4|primary motor cortex|M1',
 '4p':'BA4p|Brodmann area 4p|BA4|Brodmann area 4|primary motor cortex|M1',
 '25':'BA25|Brodmann area 25','33':'BA33|Brodmann area 33',
 '44':'BA44|Brodmann area 44|Broca area|Broca region|布洛卡区|布罗卡区',
 '45':'BA45|Brodmann area 45|Broca area|Broca region|布洛卡区|布罗卡区',
 hOc1:'V1|primary visual cortex|striate cortex|BA17|Brodmann area 17|初级视皮层|纹状皮层',
 hOc2:'V2|secondary visual cortex|BA18|Brodmann area 18|次级视皮层',
 hOc3d:'V3d|dorsal V3|dorsal third visual area',
 hOc3v:'V3v|ventral V3|ventral third visual area',
 hOc4d:'V3A|visual area V3A',hOc4v:'V4v|V4|ventral visual area V4',
 hOc5:'V5|MT|hMT|middle temporal visual area|visual motion area|MT V5',
 '6ma':'pre supplementary motor area|preSMA|前辅助运动区',
 '6mp':'supplementary motor area|SMA proper|辅助运动区',
 'Te 1.0':'primary auditory cortex|A1|AI|初级听觉皮层',
 'Te 1.1':'primary auditory cortex|A1|AI|初级听觉皮层',
 'Te 1.2':'primary auditory cortex|A1|AI|初级听觉皮层',
 DG:'dentate gyrus|fascia dentata|FD|齿状回',
 Subc:'subicular complex|subiculum|SUB|下托|下托复合体',
 TrS:'transsubiculum|trans subiculum|过渡下托',
 HATA:'hippocampal amygdaloid transition area|hippocampo amygdaloid transition area|hippocampal amygdala transition area|海马杏仁核过渡区',
 EC:'entorhinal cortex|EC|ERC|内嗅皮质',
 LB:'laterobasal amygdala|laterobasal nuclear group|basolateral amygdala|BLA|基底外侧杏仁核群',
 CM:'centromedial amygdala|centromedial nuclear group|中央内侧杏仁核群',
 SF:'superficial amygdala|superficial nuclear group|浅表杏仁核群',
 Astr:'amygdalostriatal transition area|amygdalo striatal transition area|杏仁纹状体过渡区',
 IF:'intermediate fiber bundle of amygdala|intermediate fiber|杏仁核中间纤维束',
 MF:'medial fiber bundle of amygdala|medial fiber|杏仁核内侧纤维束',
 VTM:'ventromedial part of stria terminalis|ventromedial fiber bundle of amygdala|杏仁核腹内侧纤维束',
 STN:'subthalamic nucleus|nucleus subthalamicus|Luys nucleus|丘脑下核',
 SNC:'SNc|SNpc|substantia nigra pars compacta|compact part of substantia nigra|黑质致密部',
 SNR:'SNr|SNpr|substantia nigra pars reticulata|reticular part of substantia nigra|黑质网状部',
 NRp:'parvocellular red nucleus|parvocellular part of red nucleus|RNp|红核小细胞部',
 NRm:'magnocellular red nucleus|magnocellular part of red nucleus|RNm|红核大细胞部',
 CGL:'LGN|LGB|lateral geniculate nucleus|lateral geniculate body|corpus geniculatum laterale|外侧膝状核',
 CGM:'MGN|MGB|medial geniculate nucleus|medial geniculate body|corpus geniculatum mediale|内侧膝状核',
 Nfast:'fastigial nucleus|nucleus fastigii|FN|小脑顶核',
 Ninterp:'interposed nucleus|interposed nuclei|interpositus nucleus|IN|小脑中间核',
 Ndentv:'ventral dentate nucleus|ventral part of dentate nucleus|齿状核腹侧部',
 Ndentd:'dorsal dentate nucleus|dorsal part of dentate nucleus|齿状核背侧部',
 BST:'BNST|BST|bed nucleus of stria terminalis|bed nucleus of the stria terminalis|bed nuclei of the stria terminalis|终纹床核',
 'Ch 4':'Ch4|NBM|NB|nucleus basalis|nucleus basalis of Meynert|Meynert nucleus|Meynert basal nucleus|梅纳特基底核|迈纳特基底核',
 'Ch 123':'Ch1 Ch2 Ch3|Ch1|Ch2|Ch3|medial septal nucleus|diagonal band of Broca|Broca diagonal band|内侧隔核|斜角带核',
 AcbM:'medial nucleus accumbens|medial accumbens nucleus|medial accumbens|伏隔核内侧部',
 AcbL:'lateral nucleus accumbens|lateral accumbens nucleus|lateral accumbens|伏隔核外侧部',
 VP:'ventral pallidum|腹侧苍白球',Tu:'olfactory tubercle|olfactory tuberculum|OT|嗅结节',
 TuTi:'terminal islands|islands of Calleja|Calleja islands|ICj|嗅结节终末岛|卡列哈岛',
 FuP:'fundus of putamen|putamen fundus|壳核底部',FuCd:'fundus of caudate nucleus|caudate fundus|尾状核底部',
 ZI:'zona incerta|未定带'
});
const THALAMUS=table({
 Po:'posterior|posterior thalamic|Po',
 LD:'lateral dorsal|laterodorsal|dorsolateral|LD',
 PUm:'medial pulvinar|PuM|medial part of pulvinar',
 PUi:'inferior pulvinar|PuI|inferior part of pulvinar',
 VA:'ventral anterior|ventroanterior|VA',
 AM:'anteromedial|anterior medial|AM',
 VLP:'ventral lateral posterior|ventrolateral posterior|VLp',
 Li:'limitans|Li',
 Rt:'reticular|reticular thalamic|TRN|RTN|NRT',
 Pv:'paraventricular thalamic|paraventricular|PVT|PV',
 PUa:'anterior pulvinar|PuA|anterior part of pulvinar',
 MD:'mediodorsal|dorsomedial|dorsal medial|MD|MDN',
 Pf:'parafascicular|PF|Pf',
 PUl:'lateral pulvinar|PuL|lateral part of pulvinar',
 LP:'lateral posterior|lateroposterior|LP',
 VM:'ventral medial|ventromedial|VM',
 CM:'centromedian|centre median|centromedial thalamic|CM|CMN',
 VAmc:'magnocellular ventral anterior|ventral anterior magnocellular|VAmc',
 MV:'medioventral|medial ventral|MV',
 VIM:'ventral intermediate|ventralis intermedius|Vim',
 CL:'central lateral|centrolateral|CL',
 VPL:'ventral posterolateral|ventral posterior lateral|ventroposterolateral|VPL',
 Sg:'suprageniculate|SG',
 VLA:'ventral lateral anterior|ventrolateral anterior|VLa',
 VPM:'ventral posteromedial|ventral posterior medial|ventroposteromedial|VPM',
 AV:'anteroventral|anterior ventral|AV',
 sPf:'subparafascicular|SPF',
 VPMpc:'parvocellular ventral posteromedial|ventral posteromedial parvocellular|VPMpc',
 VPi:'ventral posterior inferior|ventroposterior inferior|VPI'
});
const CIT=table({
 Putamen:'Put|putamen|壳核',Caudate:'CN|Cd|caudate nucleus|nucleus caudatus|尾状核',
 'Nucleus Accumbens':'NAc|NAcc|Acb|accumbens nucleus|伏隔核',
 'Extended Amygdala':'extended amygdala|EA|扩展杏仁核',
 'Globus Pallidus externa':'GPe|external globus pallidus|external segment of globus pallidus|globus pallidus pars externa|lateral globus pallidus|苍白球外节|苍白球外侧部',
 'Globus Pallidus interna':'GPi|internal globus pallidus|internal segment of globus pallidus|globus pallidus pars interna|medial globus pallidus|苍白球内节|苍白球内侧部',
 'Substantia Nigra pars compacta':'SNc|SNpc|compact part of substantia nigra|黑质致密部',
 'Substantia Nigra pars reticulata':'SNr|SNpr|reticular part of substantia nigra|黑质网状部',
 'Red Nucleus':'RN|nucleus ruber|rubral nucleus|红核',
 'Parabrachial Pigmented':'PBP|parabrachial pigmented nucleus|臂旁色素核',
 'Ventral Tegmental Area':'VTA|ventral tegmental area of Tsai|腹侧被盖区',
 'Ventral Pallidum':'VP|ventral pallidum|腹侧苍白球',
 'Habenular Nucleus':'Hb|habenula|habenular nuclei|habenular complex|缰核',
 Hypothalamus:'hypothalamus|下丘脑',
 'Mammillary Nucleus':'mammillary body|mammillary bodies|mamillary body|mammillary nuclei|MB|乳头体|乳头核',
 'Subthalamic Nucleus':'STN|subthalamic nucleus|nucleus subthalamicus|Luys nucleus|丘脑下核'
});
const ROMAN={'1':'I','2':'II','3':'III','4':'IV','5':'V','6':'VI','7':'VII','7b':'VIIb','8':'VIII','9':'IX','10':'X'};
export function parcelVocabulary(e){
 const s=String(e.name||'').trim(),code=s.replace(/^Area /,'').split(' (')[0],out=[code];
 if(e.atlas==='julich'){
  // CM (Thalamus) and CM (Amygdala) must not inherit each other's expansion.
  if(e.category==='thalamus'&&THALAMUS[code]){
   for(const term of THALAMUS[code]){
    out.push(term);
    if(term.length>4)out.push(term+' nucleus',term+' nucleus of thalamus',term+' thalamic nucleus','thalamic '+term+' nucleus');
   }
  }else out.push(...(EXACT[code]||[]));
  const loc=s.slice(s.indexOf('(')+1,-1).split(',').map(t=>t.trim());
  for(const key of loc)if(LOCATION_TERMS[key])out.push(key,...LOCATION_TERMS[key]);
  if(/^CA[123]$/.test(code))out.push('cornu ammonis '+code.slice(2),'hippocampal field '+code,'hippocampal subfield '+code,'Ammon horn '+code.slice(2));
  if(/^IFJ\d/.test(code))out.push('IFJ','inferior frontal junction','额下交界区');
  if(/^I[agd]\d/.test(code))out.push(...({Ia:CONCEPT_TERMS.insula_agranular,Id:CONCEPT_TERMS.insula_dysgranular,Ig:CONCEPT_TERMS.insula_granular}[code.slice(0,2)]||[]));
 }else if(e.atlas==='cit168'){
  const key=s.replace(/^[LR] /,'').replaceAll('-',' ');out.push(...(CIT[key]||[]));
 }else if(e.atlas==='aal'){
  const bare=s.replace(/_[LR]$/,''),isVermis=bare.startsWith('Vermis'),part=bare.replace(/^(Cerebelum|Cerebellum|Vermis)_/,'');
  const arabic=part.replaceAll('_',' '),roman=part.split('_').map(n=>ROMAN[n]||n).join(' ');
  const prefix=isVermis?'vermis':'cerebellar';
  out.push(prefix+' '+arabic,prefix+' '+roman,prefix+' lobule '+arabic,prefix+' lobule '+roman);
  if(!isVermis)out.push('cerebellum '+arabic,'cerebellum '+roman);
  if(/^Crus[12]$/.test(part)){const n=part.slice(-1),r=ROMAN[n];out.push('Crus '+n,'Crus '+r,'cerebellum Crus '+r,'cerebellar Crus '+r,'小脑 Crus '+r);}
  if(isVermis){out.push('cerebellar vermis '+roman,'小脑蚓部 '+roman);
   if(part==='6')out.push('declive');if(part==='7')out.push('folium and tuber');
   if(part==='8')out.push('pyramis');if(part==='9')out.push('uvula');if(part==='10')out.push('nodulus','nodular lobule','小结');
  }else{if(part==='10')out.push('flocculus','绒球');if(part==='9')out.push('cerebellar tonsil','小脑扁桃体');if(part==='8')out.push('biventer lobule','biventral lobule','二腹小叶');}
 }else if(e.atlas==='allen2020')out.push(...CONCEPT_TERMS.pineal_gland,'pineal gland','epiphysis cerebri');
 return [...new Set(out)];
}

export const FUNCTIONAL_AREA_TERMS=table({
 AntTemp:'anterior temporal cortex|前颞叶',Aud:'auditory cortex|听觉皮层',
 Cent:'central cortex|中央区',Cingm:'middle cingulate cortex|midcingulate cortex|MCC|中扣带皮层',
 Cingp:'posterior cingulate cortex|PCC|后扣带皮层',
 ExStr:'extrastriate cortex|纹外视觉皮层',ExStrInf:'inferior extrastriate cortex|下部纹外视觉皮层',
 ExStrSup:'superior extrastriate cortex|上部纹外视觉皮层',
 FEF:'frontal eye field|frontal eye fields|额眼区',
 FrMed:'medial frontal cortex|内侧额叶',FrOper:'frontal operculum|额叶岛盖',
 IPL:'inferior parietal lobule|顶下小叶',IPS:'intraparietal sulcus|顶内沟',
 Ins:'insula|insular cortex|岛叶',OFC:'orbitofrontal cortex|眶额皮层',
 PFCd:'dorsal prefrontal cortex|背侧前额叶',
 PFCl:'lateral prefrontal cortex|LPFC|外侧前额叶',
 PFCld:'dorsolateral prefrontal cortex|dorso lateral prefrontal cortex|DLPFC|dlPFC|背外侧前额叶|背外侧前额叶皮层',
 PFClv:'ventrolateral prefrontal cortex|ventro lateral prefrontal cortex|VLPFC|vlPFC|腹外侧前额叶|腹外侧前额叶皮层',
 PFCm:'medial prefrontal cortex|mPFC|内侧前额叶',
 PFCmp:'posterior medial prefrontal cortex|posteromedial prefrontal cortex|后内侧前额叶',
 PFCv:'ventral prefrontal cortex|腹侧前额叶',
 PHC:'parahippocampal cortex|parahippocampal gyrus|PHG|海马旁皮层',
 ParMed:'medial parietal cortex|内侧顶叶',ParOcc:'parieto occipital cortex|顶枕区',
 ParOper:'parietal operculum|顶叶岛盖',PostC:'postcentral gyrus|中央后回',
 PrC:'precentral gyrus|中央前回',Rsp:'retrosplenial cortex|RSC|压后皮层',
 S2:'secondary somatosensory cortex|SII|次级躯体感觉皮层',
 SPL:'superior parietal lobule|顶上小叶',
 StriCal:'calcarine striate cortex|距状沟纹状皮层',Striate:'striate cortex|纹状皮层',
 Temp:'temporal cortex|颞叶',TempOcc:'temporo occipital cortex|颞枕区',
 TempPole:'temporal pole|颞极',pCun:'precuneus|precuneal cortex|PCu|楔前叶',
 pCunPCC:'precuneus posterior cingulate cortex|precuneus|PCC|楔前叶|后扣带皮层'
});
const NETWORK_TERMS=table({
 DMN:'default mode network|default network|DMN|默认网络|缺省网络',
 VIS:'visual network|VN|VIS|视觉网络',
 SMN:'somatomotor network|somato motor network|sensorimotor network|sensory motor network|SMN|感觉运动网络',
 DAN:'dorsal attention network|DAN|背侧注意网络',
 'SAL-VAN':'salience ventral attention network|salience network|ventral attention network|SN|SAN|VAN|显著性网络|突显网络|腹侧注意网络',
 LIM:'limbic network|LN|边缘网络',
 FPN:'frontoparietal control network|fronto parietal control network|frontoparietal network|executive control network|FPCN|ECN|CEN|FPN|执行控制网络|中央执行网络|额顶控制网络',
 VisCent:'central visual network|central visual|中央视觉网络',
 VisPeri:'peripheral visual network|peripheral visual|周边视觉网络',
 SomMotA:'somatomotor network A|sensorimotor network A',
 SomMotB:'somatomotor network B|sensorimotor network B',
 DorsAttnA:'dorsal attention network A',DorsAttnB:'dorsal attention network B',
 SalVentAttnA:'salience ventral attention network A',SalVentAttnB:'salience ventral attention network B',
 LimbicA:'limbic network A',LimbicB:'limbic network B',
 ContA:'control network A|frontoparietal control network A',
 ContB:'control network B|frontoparietal control network B',
 ContC:'control network C|frontoparietal control network C',
 DefaultA:'default mode network A|DMN A',DefaultB:'default mode network B|DMN B',
 DefaultC:'default mode network C|DMN C',TempPar:'temporo parietal network|temporoparietal network|颞顶网络'
});
export const networkVocabulary=n=>[n.id,n.code,n.label,...(n.aliases||[]),...(NETWORK_TERMS[n.id]||NETWORK_TERMS[n.code]||[])].filter(Boolean);
export function functionalVocabulary(e,networks){
 const area=e.name17.split('_').slice(3,-1).join('_');
 const members=networks.filter(n=>e['network'+n.scheme]===n.code);
 return [e.name,e.name17,area,...(FUNCTIONAL_AREA_TERMS[area]||[]),...members.flatMap(networkVocabulary)].filter(Boolean);
}
