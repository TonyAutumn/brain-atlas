import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSearchIndex,searchAtlas,normalizeSearch} from '../anatomy/search.js';
import {NAV} from '../anatomy/navigation.js';
import {CONCEPT_TERMS,parcelVocabulary,functionalVocabulary,FUNCTIONAL_AREA_TERMS} from '../anatomy/search-vocabulary.js';
import {NETWORKS} from '../research/networks.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const anatomy=read('../anatomy/data/manifest.json').entries.filter(e=>e.atlas!=='surface');
const functional=read('../anatomy/data/functional-manifest.json').entries;
const entries=[...anatomy,...functional],before=JSON.stringify(entries),index=createSearchIndex(entries);
const search=q=>searchAtlas(q,index);
const ids=q=>search(q).filter(h=>h.kind==='parcel').map(h=>h.id).sort();
const pair=n=>['julich-L-'+n,'julich-R-'+n].sort();
const exact=(q,want)=>assert.deepEqual(ids(q),want.slice().sort(),q);
let checks=0;
for(const e of entries){
 assert(search(e.name).some(h=>h.id===e.id),'Raw name lost: '+e.id);
 if(e.name17)assert(search(e.name17).some(h=>h.id===e.id),'17-network name lost: '+e.id);
 const fields=e.atlas==='schaefer200'?functionalVocabulary(e,NETWORKS):parcelVocabulary(e);
 assert(fields.length>1,'No reviewed expansion: '+e.id);
 for(const field of fields){
  assert(search(field).some(h=>h.id===e.id),e.id+' missing '+field);checks++;
 }
}
for(const [id,fields] of Object.entries(CONCEPT_TERMS)){
 assert(NAV[id],'Unknown vocabulary concept '+id);
 for(const q of fields){assert(search(q).some(h=>h.kind==='concept'&&h.id===id),id+' missing '+q);checks++;}
}
for(const e of functional){
 const area=e.name17.split('_').slice(3,-1).join('_');
 assert(!area||FUNCTIONAL_AREA_TERMS[area],'Unreviewed functional location '+area);
}
for(const [q,n] of [
 ['ventral posterolateral nucleus',168],['ventroposteromedial nucleus',178],
 ['paraventricular thalamic nucleus',61],['central lateral nucleus',156],
 ['dorsomedial thalamic nucleus',74],['medioventral nucleus',138],
 ['lateral geniculate body',92],['medial geniculate body',16],
 ['hippocampal amygdaloid transition area',153],['cornu ammonis 1',146],
 ['fascia dentata',120],['NBM',113],['ventral dentate nucleus',56],
 ['SNpc',93],['Heschl gyrus',10]
]){
 const found=ids(q);assert(found.includes('julich-L-'+n)&&found.includes('julich-R-'+n),q);
}
exact('GPe',['cit-9','cit-10']);exact('GPi',['cit-11','cit-12']);
exact('PVT',pair(61));exact('LGN',pair(92));exact('MGN',pair(16));
exact('CM',[...pair(131),...pair(141)]);
exact('dentate gyrus',pair(120));
exact('ventral dentate nucleus',pair(56));
exact('BA4',[...pair(76),...pair(142)]);exact('BA 44',pair(59));
assert(search('midline thalamic nuclei').some(h=>h.id==='thalamus_intralaminar'));
exact('V3A',pair(106));exact('V5',pair(189));
exact('IC',[]);
exact('preSMA',pair(122));
assert(!ids('SMA proper').includes('julich-L-122'),'preSMA is not SMA proper');
assert(!ids('MD').includes('julich-L-138'),'MD is not MV');
assert(!ids('LGN').includes('julich-L-16'),'LGN is not MGN');
assert(!ids('PBN').some(id=>id==='cit-19'||id==='cit-20'),'PBN is not PBP');
assert(!ids('tegmentum').some(id=>id==='cit-21'||id==='cit-22'),'Tegmentum is not VTA');
assert(!ids('SOC').length,'SOC remains a preset, not an invented model');
assert(search('SOC').some(h=>h.kind==='preset'&&h.id==='SOC'));
assert(search('DMN').some(h=>h.kind==='preset'&&h.id==='DMN'));
assert(search('default mode network').some(h=>h.kind==='preset'&&h.id==='DMN'));
assert(search('Y17-DefaultA').some(h=>h.kind==='preset'&&h.id==='Y17-DefaultA'));
const dl=functional.filter(e=>e.name17.split('_').includes('PFCld')).map(e=>e.id);
exact('lateral geniculate nucleus (LGN)',pair(92));
exact('left lateral geniculate nucleus (LGN)',['julich-L-92']);
exact('dorsolateral prefrontal cortex (DLPFC)',dl);
exact('Brodmann area 44 (BA44)',pair(59));
exact('caudate (LGN)',[]);
exact('DLPFC',dl);exact('dorsolateral prefrontal cortex',dl);
exact('left DLPFC',functional.filter(e=>dl.includes(e.id)&&e.hemisphere==='L').map(e=>e.id));
for(const q of ['left LGN','LGN left','LH LGN','L-LGN','左侧LGN','左半球 LGN','ＬＥＦＴ　ＬＧＮ'])exact(q,['julich-L-92']);
for(const q of ['right LGN','LGN R','RH LGN','右侧 LGN'])exact(q,['julich-R-92']);
assert.deepEqual(ids("Heschl's gyrus"),ids('Heschl gyrus'));
assert.deepEqual(ids('Heschl’s gyri'),ids('Heschl gyri'));
assert.deepEqual(ids('ventral-posterolateral_nucleus'),ids('ventral posterolateral nucleus'));
assert.equal(normalizeSearch("Brodmann’s area 44"),'brodmann area 44');
assert.deepEqual(search(''),[]);assert.deepEqual(search(' - () '),[]);assert.deepEqual(search('no-such-region-xyz'),[]);
assert.equal(JSON.stringify(entries),before,'Search changed source data');
const embedded=createSearchIndex(anatomy,{includePresets:false});
assert(!embedded.some(h=>h.kind==='preset'||h.atlas==='schaefer200'),'Evidence embed changed scope');
console.log('Search vocabulary checks passed: '+anatomy.length+' anatomy + '+functional.length+' functional entries; '+checks+' vocabulary retrievals, full source labels, hemisphere queries, network presets and ambiguous abbreviations.');
