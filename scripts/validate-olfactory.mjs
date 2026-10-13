import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OLFACTORY_PRESETS} from '../anatomy/olfactory-circuit.js';
import {NETWORKS,DISPLAY_PRESETS,networkEntries,networkOf} from '../research/networks.js';
import {createRegionSelection,SELECTION_KEY} from '../anatomy/selection.js';
import {createSearchIndex,searchAtlas} from '../anatomy/search.js';
import {displayState} from '../anatomy/render-mode.js';
import {emphasis} from '../anatomy/visual-state.js';
const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url)));
const anatomy=read('anatomy/data/manifest.json').entries.filter(e=>e.atlas!=='surface');
const entries=[...anatomy,...read('anatomy/data/functional-manifest.json').entries];
const expected={POC:[17,51,130],SOC:[36,42,60,65,89,98,110,159,192,203],OLF:[17,36,42,48,51,60,65,74,89,98,110,130,159,191,192,203]};
assert.equal(NETWORKS.length,24,'Keep Yeo 7/17 memberships separate from curated display sets');
assert.equal(DISPLAY_PRESETS.length,27);
for(const p of OLFACTORY_PRESETS){
 const ids=networkEntries(p,entries).map(e=>e.id).sort();
 assert.deepEqual(ids,expected[p.id].flatMap(label=>['julich-L-'+label,'julich-R-'+label]).sort());
 assert.equal(networkEntries(p,[{atlas:'test',name:'Area PirT (test)'}]).length,0);
 assert(p.missing.includes('前嗅核 AON')&&p.missing.includes('额部梨状皮层 PirF'));
 assert(p.sources.every(s=>s.url.startsWith('https://')));
 assert.equal(networkOf({name:p.id}),null,'Ambiguous POC/SOC abbreviations must not silently become paper network evidence');
}
const index=createSearchIndex(anatomy);
for(const [query,id] of [['POC','POC'],['ｐｏｃ','POC'],['primary olfactory cortex','POC'],['初级嗅觉皮层','POC'],['SOC','SOC'],['secondary olfactory cortex','SOC'],['嗅觉','OLF']])assert.equal(searchAtlas(query,index)[0]?.id,id,query);
assert(!createSearchIndex(anatomy,{includePresets:false}).some(h=>h.kind==='preset'));
assert(!searchAtlas('SOC',index).some(h=>h.kind==='parcel'),'A broad functional term is not an exact anatomical alias');
const saved=new Map(),storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
let selection=createRegionSelection(entries,storage);
selection.add(['julich-L-17']);selection.addNetwork('POC');selection.addNetwork('SOC');selection.addNetwork('OLF');selection.addNetwork('DMN');
assert.equal(selection.size,78);assert.equal(selection.networkIds.size,78);
for(const mode of ['transparent','solid','anatomical']){
 const state=displayState({group:'all',selectedIds:selection.ids,networkIds:selection.networkIds,renderMode:mode},true);
 for(const e of networkEntries(OLFACTORY_PRESETS[0],entries))assert.equal(emphasis(e,state,false).colour,'#ffd34e');
}
selection.removeNetwork('OLF');assert.equal(selection.size,72,'POC/SOC/DMN shared choices survive removing OLF');
selection.remove('julich-R-17');selection=createRegionSelection(entries,storage);assert(!selection.has('julich-R-17'));
assert.equal(selection.addNetwork('POC'),1);selection.removeNetwork('POC');assert(selection.has('julich-L-17'),'Manual choice survives removing POC');
selection.clear();selection=createRegionSelection(entries,storage);assert.equal(selection.size,0);assert.equal(JSON.parse(saved.get(SELECTION_KEY)).version,2);
console.log('Olfactory checks passed: 32 exact bilateral reference meshes, POC/SOC search, bounded coverage, overlapping yellow selections, removal and reload.');
