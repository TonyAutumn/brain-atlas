import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NAV,pathFor,navigationFor,inGroup} from '../anatomy/navigation.js';
import {createSearchIndex,searchAtlas,conceptCoverage} from '../anatomy/search.js';
import {SOURCES} from '../anatomy/structure-catalog.js';
const manifest=JSON.parse(fs.readFileSync(process.env.ATLAS_MANIFEST||new URL('../anatomy/data/manifest.json',import.meta.url),'utf8'));
const entries=manifest.entries.filter(e=>e.atlas!=='surface');
const before=JSON.stringify(entries),index=createSearchIndex(entries);
assert.equal(JSON.stringify(entries),before,'Building search must not mutate stored atlas IDs or geometry');
for(const [id,n] of Object.entries(NAV)){
 assert(!n.parent||NAV[n.parent],`Unknown parent: ${id}`);
 assert.equal(pathFor(id)[0],'all',`Not rooted: ${id}`);
 assert.equal(new Set(pathFor(id)).size,pathFor(id).length,`Cycle: ${id}`);
 for(const ref of n.references)assert(SOURCES[ref],`Missing reference: ${id}/${ref}`);
 for(const other of n.related)assert(NAV[other],`Missing related concept: ${id}/${other}`);
}
for(const e of entries){assert(NAV[navigationFor(e)],`Unclassified: ${e.name}`);assert.notEqual(navigationFor(e),'unassigned',e.name);}
const search=q=>searchAtlas(q,index);
for(const q of ['VTA','vta','ＶＴＡ','ventral tegmental area','ventral-tegmental-area','Ventral_Tegmental_Area','腹侧被盖区']){
 const hits=search(q);
 assert(hits.some(h=>h.kind==='concept'&&h.id==='ventral_tegmental'),q);
 assert.deepEqual(hits.filter(h=>h.kind==='parcel').map(h=>h.id).sort(),['cit-21','cit-22'],q);
}
for(const [q,id] of [['tectum','tectum'],['顶盖','tectum'],['四叠体','tectum'],['tegmentum','tegmentum'],['被盖','tegmentum'],['midbrain tegmentum','midbrain_tegmentum'],['脑桥','pons'],['LC','locus_coeruleus'],['PAG','periaqueductal_gray'],['DRN','dorsal_raphe'],['PPTg','pedunculopontine']])assert(search(q).some(h=>h.kind==='concept'&&h.id===id),q);
for(const id of ['tectum','superior_colliculus','inferior_colliculus','tegmentum','pons','locus_coeruleus','medulla'])assert.equal(conceptCoverage(id,entries).hasGeometry,false,id);
assert.equal(search('tegmentum')[0].id,'tegmentum');
assert(!search('tegmentum').some(h=>h.kind==='parcel'&&['cit-21','cit-22'].includes(h.id)),'Tegmentum is not a VTA alias');
assert.equal(search('IC')[0].id,'inferior_colliculus');
assert(!search('IC').some(h=>h.kind==='parcel'),'IC must not match letters in Julich');
assert.deepEqual(search('nonexistent-structure-xyz'),[]);assert.deepEqual(search(''),[]);
assert.deepEqual(search(' () - '),[]);
assert.deepEqual(pathFor('ventral_tegmental'),['all','brainstem','midbrain','midbrain_tegmentum','ventral_tegmental']);
assert.deepEqual(pathFor('superior_colliculus'),['all','brainstem','midbrain','tectum','superior_colliculus']);
assert(pathFor('thalamus').includes('diencephalon'));assert(!pathFor('thalamus').includes('telencephalon'));
for(const id of ['julich-L-18','julich-R-18','julich-L-109','julich-R-109','cit-15','cit-16'])assert.equal(navigationFor(entries.find(e=>e.id===id)),'red_nucleus',id);
for(const id of ['cit-17','cit-18','julich-L-93','julich-R-93','julich-L-181','julich-R-181'])assert.equal(navigationFor(entries.find(e=>e.id===id)),'substantia_nigra',id);
for(const id of ['cit-19','cit-20'])assert.equal(navigationFor(entries.find(e=>e.id===id)),'parabrachial_pigmented',id);
assert.equal(navigationFor({name:'Unrecognized test-only label',category:'midbrain',atlas:'test',label:999}),'midbrain_other');
assert.equal(entries.filter(e=>inGroup(e,'ventral_tegmental')).length,2,'Only actual VTA parcels belong to VTA');
for(const q of ['SNr','SNc','GPe','GPi','NRp','NRm'])assert(search(q).some(h=>h.kind==='parcel'),q);
for(const [q,labels] of [['LGN',[92]],['MGN',[16]]]){
 const found=search(q).filter(h=>h.kind==='parcel').map(h=>h.id).sort();
 assert.deepEqual(found,entries.filter(e=>e.atlas==='julich'&&labels.includes(e.label)).map(e=>e.id).sort(),q+' must not inherit sibling aliases');
}
assert(!search('MD').some(h=>h.kind==='parcel'&&/julich-[LR]-138$/.test(h.id)),'MD is not the medioventral thalamic parcel');
// The catalogue is not an evidence validator: existing species/side/provenance gates remain separate.
console.log(`Discovery checks passed: ${entries.length} entries from ${manifest.version}, ${Object.keys(NAV).length-1} hierarchy nodes, bilingual aliases, independent global search, geometry-free concepts, canonical source labels and unchanged IDs.`);
