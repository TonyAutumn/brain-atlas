import fs from 'node:fs';
import assert from 'node:assert/strict';
import {NAV,navigationFor,inGroup,pathFor} from '../anatomy/navigation.js';
import {conceptCoverage,createSearchIndex,searchAtlas} from '../anatomy/search.js';
import {GEOMETRY_RELATIONS,inGeometryGroup} from '../anatomy/geometry-links.js';
import {emphasis} from '../anatomy/visual-state.js';
import {displayState} from '../anatomy/render-mode.js';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('anatomy/data/manifest.json',root)));
const entries=manifest.entries.filter(e=>e.atlas!=='surface');
const before=JSON.stringify(entries),ancestry=Object.fromEntries(entries.map(e=>[e.id,pathFor(navigationFor(e))]));
const concepts=Object.keys(NAV).filter(id=>id!=='all');
const ids=items=>items.map(e=>e.id).sort();
assert.deepEqual(Object.keys(GEOMETRY_RELATIONS).sort(),['cerebral_peduncle','tegmentum']);
for(const [id,relation] of Object.entries(GEOMETRY_RELATIONS)){
 assert(NAV[id]);assert(relation.references.length>0);assert.match(relation.note,/部分模型/);
 for(const group of relation.includeGroups)assert(NAV[group],`${id}/${group}`);
}
for(const e of entries){assert(fs.existsSync(new URL('anatomy/data/'+e.file,root)),`Missing model: ${e.id}`);assert(e.vertices>0&&e.triangles>0);}
const index=createSearchIndex(entries);
for(const id of concepts){
 const cov=conceptCoverage(id,entries);
 const native=entries.filter(e=>inGroup(e,id));
 const expected=entries.filter(e=>inGroup(e,id)||(GEOMETRY_RELATIONS[id]?.includeGroups||[]).some(g=>inGroup(e,g)));
 assert.deepEqual(ids(cov.parcels),ids(expected),`Coverage ${id}`);
 assert.equal(cov.hasGeometry,expected.length>0,id);
 assert.equal(new Set(ids(cov.parcels)).size,cov.parcels.length,`Duplicate ${id}`);
 for(const e of native)assert(cov.parcels.some(p=>p.id===e.id),`Lost existing membership ${id}/${e.id}`);
 const hit=index.find(h=>h.kind==='concept'&&h.id===id);
 if(hit){assert.deepEqual([...hit.parcels].sort(),ids(expected));assert.equal(hit.coverageLabel,cov.label);}
 const state={group:id,focusKind:'group',selected:null,colors:false,isolate:true,hemi:'both'};
 for(const e of entries){assert.equal(inGeometryGroup(e,id),expected.includes(e));assert.equal(emphasis(e,state).inSelection,expected.includes(e),`Renderer emphasis ${id}/${e.id}`);}
}
const tegmentum=conceptCoverage('tegmentum',entries),peduncle=conceptCoverage('cerebral_peduncle',entries);
assert.equal(tegmentum.parcels.length,10);assert.equal(peduncle.parcels.length,18);
assert.equal(tegmentum.parcels.filter(e=>e.atlas==='cit168').length,6);
assert.equal(peduncle.parcels.filter(e=>e.atlas==='cit168').length,10);
for(const cov of [tegmentum,peduncle]){assert(cov.partial);assert.equal(cov.label,'部分模型');assert.equal(cov.preferredSource,'cit168');}
assert.match(peduncle.note,/广义/);assert.match(peduncle.note,/脚底仍无模型/);
assert.deepEqual(ids(tegmentum.parcels),ids(entries.filter(e=>inGroup(e,'midbrain_tegmentum'))));
assert(!tegmentum.parcels.some(e=>inGroup(e,'substantia_nigra')));
const missing=['amygdala_corticomedial','tectum','superior_colliculus','inferior_colliculus','periaqueductal_gray','cerebral_aqueduct','crus_cerebri','pons','pontine_tegmentum','basilar_pons','pontine_nuclei','locus_coeruleus','parabrachial_nuclei','dorsal_tegmental_nucleus','pontomesencephalic','pedunculopontine','laterodorsal_tegmental','raphe_nuclei','dorsal_raphe','median_raphe','medulla','inferior_olive','solitary_nucleus','nucleus_ambiguus','gracile_nucleus','cuneate_nucleus','hypoglossal_nucleus','unassigned','midbrain_other'];
assert.deepEqual(concepts.filter(id=>!conceptCoverage(id,entries).hasGeometry).sort(),missing.sort());
for(const id of missing)assert.equal(conceptCoverage(id,entries).label,'仅层级');
assert.deepEqual(conceptCoverage('unknown-invalid-id',entries).parcels,[]);
for(const shell of manifest.entries.filter(e=>e.atlas==='surface'))assert(!inGeometryGroup(shell,'all'));
assert.equal(conceptCoverage('all',entries).parcels.length,458);
assert.deepEqual(ids(entries.filter(e=>inGroup(e,'tegmentum'))),[],'Display link must not rewrite anatomical ancestry');
assert.deepEqual(ids(entries.filter(e=>inGroup(e,'cerebral_peduncle'))),[]);
assert.deepEqual(ancestry,Object.fromEntries(entries.map(e=>[e.id,pathFor(navigationFor(e))])));
assert.equal(JSON.stringify(entries),before,'Associations must not mutate IDs, geometry or entry metadata');
assert.deepEqual(searchAtlas('VTA',index).filter(h=>h.kind==='parcel').map(h=>h.id).sort(),['cit-21','cit-22']);
assert(!searchAtlas('tegmentum',index).some(h=>h.kind==='parcel'&&['cit-21','cit-22'].includes(h.id)),'Part-of is not a synonym');
const linkedBefore=concepts.filter(id=>entries.some(e=>inGroup(e,id))),linkedAfter=concepts.filter(id=>conceptCoverage(id,entries).hasGeometry);
assert.deepEqual(linkedAfter.filter(id=>!linkedBefore.includes(id)).sort(),['cerebral_peduncle','tegmentum']);
assert.equal(linkedBefore.length,84);assert.equal(linkedAfter.length,86);
const app=fs.readFileSync(new URL('anatomy/app.js',root),'utf8');
assert(app.includes('sourceFits(e)&&inGeometryGroup(e,state.group)'));
assert(app.includes("evidenceLayer.group.visible=!(display.isolate&&state.focusKind==='entry')"),'Evidence visibility must use the effective isolation state');
// Default/transparent modes retain the legacy evidence behavior for every manual state.
for(const focusKind of ['entry','group','evidence'])for(const isolate of [false,true])for(const renderMode of [undefined,'transparent']){
 const state={focusKind,isolate,renderMode},display=displayState(state,true);
 assert.equal(!(display.isolate&&focusKind==='entry'),!(isolate&&focusKind==='entry'),'Preserve transparent evidence visibility');
}
// Solid entry inspection hides schematic overlays; the complete evidence view keeps them.
assert(displayState({focusKind:'entry',renderMode:'solid',isolate:false},true).isolate);
const evidence=displayState({focusKind:'evidence',renderMode:'solid',isolate:false},true);
assert(evidence.isolate&&evidence.focusKind!=='entry','Solid evidence hides its shell but retains the evidence layer');
for(const file of ['anatomy/geometry-links.js','anatomy/GEOMETRY-AUDIT.md','scripts/validate-geometry-browser.py'])assert(fs.existsSync(new URL(file,root)),file);
console.log(`Geometry links verified: ${entries.length} unchanged models; ${concepts.length} concepts; ${linkedBefore.length} -> ${linkedAfter.length} linked; ${missing.length-2} anatomical concepts without meshes plus 2 empty review groups. Explicit partial associations only; ancestry, search aliases and evidence visibility preserved.`);
