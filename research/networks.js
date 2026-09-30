import {atlasCode} from './mapping-rules.js?v=epithalamus1';
export const NETWORK_COLOR='#ffd34e';
export const NETWORK_SOURCE='https://github.com/ThomasYeoLab/CBIG/blob/1735ecc7c2e91ceac51f5e3da31d2ef59c8856ae/stable_projects/brain_parcellation/Schaefer2018_LocalGlobal/README.md';
export const NETWORK_NOTE='按 Schaefer 2018 的 200 个皮层分区及官方 Yeo 网络归属显示。仅覆盖该图谱的皮层范围，不含皮层下与小脑；不是论文激活范围。7 网络与 17 网络是两套归属，不是严格的父子层级。';
const coarse=[
 ['DMN','Default','默认模式网络',['default mode network','default-mode network','默认模式网络','缺省模式网络']],
 ['VIS','Vis','视觉网络',['visual network','视觉网络']],
 ['SMN','SomMot','躯体感觉运动网络',['somatomotor network','sensorimotor network','感觉运动网络','躯体感觉运动网络']],
 ['DAN','DorsAttn','背侧注意网络',['dorsal attention network','背侧注意网络']],
 ['SAL-VAN','SalVentAttn','显著性 / 腹侧注意网络',['salience/ventral attention network','salience ventral attention network','显著性/腹侧注意网络']],
 ['LIM','Limbic','边缘网络',['limbic network','边缘网络']],
 ['FPN','Cont','额顶控制网络',['frontoparietal network','frontoparietal control network','control network','额顶控制网络','额顶网络']]
];
const fine=[['VisCent','中央视觉'],['VisPeri','周边视觉'],['SomMotA','感觉运动 A'],['SomMotB','感觉运动 B'],['DorsAttnA','背侧注意 A'],['DorsAttnB','背侧注意 B'],['SalVentAttnA','显著性 / 腹侧注意 A'],['SalVentAttnB','显著性 / 腹侧注意 B'],['LimbicA','边缘 A'],['LimbicB','边缘 B'],['ContA','控制 A'],['ContB','控制 B'],['ContC','控制 C'],['DefaultA','默认模式 A'],['DefaultB','默认模式 B'],['DefaultC','默认模式 C'],['TempPar','颞顶网络']];
const common={color:NETWORK_COLOR,source:NETWORK_SOURCE,note:NETWORK_NOTE};
export const NETWORKS=[...coarse.map(([id,code,label,aliases])=>({...common,id,code,label,aliases,scheme:7,scope:'Yeo 7 · Schaefer 200 皮层范围'})),...fine.map(([code,label])=>({...common,id:'Y17-'+code,code,label,aliases:[],scheme:17,scope:'Yeo 17 · Schaefer 200 皮层范围'}))];
export const DMN=NETWORKS[0];
// Retain the user's old four-parcel selections until explicitly removed.
export const LEGACY_DMN={id:'DMN-legacy',label:'旧 DMN 角回参考',legacy:true,color:NETWORK_COLOR,source:'https://pubmed.ncbi.nlm.nih.gov/11209064/',note:'此前选中的 PGa / PGp 已保留，仍可用 × 取消。选择上方 DMN 可载入新的 46 个标准皮层分区。'};
export const SAVED_NETWORKS=[...NETWORKS,LEGACY_DMN];
export const isFunctional=e=>e.atlas==='schaefer200';
export function networkEntries(network,entries){return entries.filter(e=>network.legacy?e.atlas==='julich'&&['PGa','PGp'].includes(atlasCode(e)):isFunctional(e)&&e['network'+network.scheme]===network.code);}
export function networkOf(r){
 const name=(r.name||'').normalize('NFKC').trim().toLowerCase();
 return NETWORKS.find(n=>name===n.id.toLowerCase()||name===n.label.toLowerCase()||n.aliases.some(a=>name===a.toLowerCase())||new RegExp('(?:^|[\\s(])'+n.id+'(?:$|[\\s)])','i').test(name))||null;
}
export function recordKind(r){return networkOf(r)||r.level==='network'?'network':r.level==='celltype'||r.level==='neuron'?'cell':'region';}
export function kindLabel(r){return {network:'功能网络',cell:'细胞 / 神经元',region:'解剖结构'}[recordKind(r)];}
const AREAS={AntTemp:'前颞叶',Aud:'听觉皮层',Cent:'中央区',Cingm:'中扣带',Cingp:'后扣带',ExStr:'纹外视觉皮层',ExStrInf:'下部纹外视觉皮层',ExStrSup:'上部纹外视觉皮层',FEF:'额眼区',FrMed:'内侧额叶',FrOper:'额叶岛盖',IPL:'顶下小叶',IPS:'顶内沟',Ins:'岛叶',OFC:'眶额皮层',PFCd:'背侧前额叶',PFCl:'外侧前额叶',PFCld:'背外侧前额叶',PFClv:'腹外侧前额叶',PFCm:'内侧前额叶',PFCmp:'后内侧前额叶',PFCv:'腹侧前额叶',PHC:'海马旁皮层',ParMed:'内侧顶叶',ParOcc:'顶枕区',ParOper:'顶叶岛盖',PostC:'中央后回',PrC:'中央前回',Rsp:'压后皮层',S2:'次级躯体感觉区',SPL:'顶上小叶',StriCal:'距状沟纹状皮层',Striate:'纹状皮层',Temp:'颞叶',TempOcc:'颞枕区',TempPar:'颞顶区',TempPole:'颞极',pCun:'楔前叶',pCunPCC:'楔前叶 / 后扣带'};
export function describeFunctional(e){
 const parts=e.name17.split('_'),area=parts.length>4?parts.slice(3,-1).join('_'):null;
 const network=NETWORKS.find(n=>n.scheme===17&&n.code===e.network17);
 const title=(AREAS[area]||network?.label||area||'功能皮层分区')+' · '+e.label;
 const side=e.hemisphere==='L'?'左侧':'右侧';return {title,side,full:side+' '+title,search:(title+' '+e.name+' '+e.name17).toLowerCase()};
}
