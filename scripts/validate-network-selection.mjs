import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRegionSelection,SELECTION_KEY,LEGACY_SELECTION_KEY} from '../anatomy/selection.js';
import {NETWORKS,DMN,NETWORK_COLOR,networkEntries} from '../research/networks.js';
import {displayState} from '../anatomy/render-mode.js';
import {emphasis} from '../anatomy/visual-state.js';
const entries=JSON.parse(fs.readFileSync(new URL('../anatomy/data/manifest.json',import.meta.url))).entries.filter(e=>e.atlas!=='surface');
const parcels=networkEntries(DMN,entries),ids=parcels.map(e=>e.id),overlap=ids[0],unrelated='cit-25';
assert.equal(parcels.length,4);assert.deepEqual([...new Set(parcels.map(e=>e.hemisphere))].sort(),['L','R']);
const legacy=JSON.stringify([overlap,unrelated]),saved=new Map([[LEGACY_SELECTION_KEY,legacy],['notes','unchanged']]);
const storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
let selection=createRegionSelection(entries,storage);
assert.deepEqual([...selection.ids],[overlap,unrelated]);assert.equal(selection.networkIds.size,0);
assert.equal(selection.addNetwork('DMN'),4);assert.equal(selection.size,5);assert.equal(selection.addNetwork('DMN'),0);assert.equal(selection.addNetwork('unregistered'),0);
assert.equal(selection.add([ids[1]]),0,'Inspecting a yellow model is not an additional manual selection');
for(const renderMode of ['transparent','solid','anatomical']){
 const state=displayState({group:'all',focusKind:'none',selectedIds:selection.ids,networkIds:selection.networkIds,renderMode,colors:true},true);
 assert.equal(emphasis(entries.find(e=>e.id===unrelated),state,true).colour,'#39b9ff');
 for(const entry of parcels)assert.equal(emphasis(entry,state,true).colour,NETWORK_COLOR);
}
selection=createRegionSelection(entries,storage);assert.equal(selection.networkIds.size,4);
selection.remove(ids[1]);selection=createRegionSelection(entries,storage);
assert.equal(selection.networkIds.size,3);assert(!selection.has(ids[1]),'Reload cannot reinstate a removed network member');
assert.equal(selection.addNetwork('DMN'),1,'Explicitly selecting the network again fills removed members');
selection.removeNetwork('DMN');assert.deepEqual([...selection.ids],[overlap,unrelated],'Whole network removal preserves previous manual choices');
selection.addNetwork('DMN');selection.remove(overlap);selection.removeNetwork('DMN');assert.deepEqual([...selection.ids],[unrelated],'A parcel × removes all its selection sources');
selection.addNetwork('DMN');const clone=selection.networks;clone.get('DMN').clear();assert.equal(selection.networkIds.size,4);
selection.clear();selection=createRegionSelection(entries,storage);assert.equal(selection.size,0,'Empty v2 must not revive stale v1 choices');
assert.equal(saved.get(LEGACY_SELECTION_KEY),legacy);assert.equal(saved.get('notes'),'unchanged');
saved.set(SELECTION_KEY,JSON.stringify({version:2,manual:['missing',unrelated],networks:{DMN:[ids[0],unrelated,'missing'],FAKE:[ids[1]]}}));
selection=createRegionSelection(entries,storage);assert.deepEqual([...selection.networkIds],[ids[0]]);assert.equal(selection.size,2);
const blocked=createRegionSelection(entries,{getItem(){return null;},setItem(){throw Error('quota');}});blocked.addNetwork('DMN');assert.equal(blocked.size,4);assert.equal(blocked.persistent,false);
for(const n of NETWORKS){assert(n.source.startsWith('https://'));assert(n.scope.includes('部分'));}
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');assert(!html.includes('record=network'));assert(html.includes('id="networkSelect"'));
console.log('Network selection checks passed: yellow reference colour, exact existing membership, source-aware removal, legacy migration, persistence, storage failure and integrated navigation.');
