import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {NAV,pathFor,navigationFor,childrenOf} from '../anatomy/navigation.js';
import {createSearchIndex,searchAtlas,conceptCoverage} from '../anatomy/search.js';
import {suggestMapping,resolveMappingCandidate,resolveMapping,createPaper,rematchPapers,validateBackup} from '../research/model.js';
import {analysisCapabilityError} from '../research/service-capabilities.js';
import {cleanMapping} from '../research/mapping-state.js';
import {displayState,applySurfaceMode} from '../anatomy/render-mode.js';
import {configureAppearance,applyAppearance} from '../anatomy/anatomical-appearance.js';
import * as THREE from '../anatomy/vendor/three.module.js';

const manifest=JSON.parse(fs.readFileSync(new URL('../anatomy/data/manifest.json',import.meta.url)));
const entries=manifest.entries.filter(e=>e.atlas!=='surface'),pineal=entries.find(e=>e.id==='allen2020-M-10460');
const old={entries:manifest.entries.filter(e=>e.atlas!=='allen2020'),files:manifest.files.filter(f=>!f.name.startsWith('allen2020-'))};
assert.equal(old.entries.length,460);
assert.equal(crypto.createHash('sha256').update(JSON.stringify(old)).digest('hex'),'812517300a1d978e6ebfe170db723c458911b23540f3863d42311eb95e7429b3','All original labels, coordinates, IDs and file checksums must remain intact');
assert.equal(pineal.hemisphere,'M');assert.equal(pineal.label,10460);assert(Math.abs(pineal.center[0])<.01);
assert.deepEqual(pathFor(navigationFor(pineal)),['all','cerebrum','diencephalon','epithalamus','pineal_gland']);
assert.deepEqual(childrenOf('habenular_complex').sort(),['lateral_habenula','medial_habenula']);
assert.deepEqual(conceptCoverage('habenular_complex',entries).parcels.map(e=>e.id).sort(),['cit-25','cit-26']);
const upper=conceptCoverage('epithalamus',entries);assert(upper.partial);assert.equal(upper.parcels.length,3);
assert(!NAV.epithalamus.aliases.includes('缰核'));
const index=createSearchIndex(entries),region=(name,hemisphere='unknown')=>({id:'r1',name,hemisphere,species:'human',level:'region'});
for(const query of ['松果体','pineal gland','pineal body','松果腺']){
 assert(searchAtlas(query,index).some(h=>h.id==='pineal_gland'),query);
 const mapping=suggestMapping(region(query),entries);assert(mapping,query);assert.equal(mapping.hemisphere,'unknown');
 assert.deepEqual(resolveMappingCandidate(region(query),mapping,entries).map(e=>e.id),[pineal.id]);
 assert.deepEqual(resolveMapping(region(query),mapping,entries),[],'Unknown laterality stays a candidate');
}
for(const [name,id] of [['MHb','medial_habenula'],['LHb','lateral_habenula'],['丘脑髓纹','stria_medullaris'],['缰连合','habenular_commissure'],['后连合','posterior_commissure']]){
 const hits=searchAtlas(name,index);assert(hits.some(h=>h.id===id));assert(!hits.some(h=>h.kind==='parcel'),name+' must not inherit its parent mesh');
 assert.equal(conceptCoverage(id,entries).hasGeometry,false);assert.equal(suggestMapping(region(name),entries),null);
}
for(const name of ['缰核','habenula','Hb'])assert.deepEqual(resolveMappingCandidate(region(name),suggestMapping(region(name),entries),entries).map(e=>e.id).sort(),['cit-25','cit-26']);
for(const name of ['lateral habenula','medial habenular nucleus'])assert.equal(suggestMapping(region(name),entries),null);
for(const side of ['L','R','both'])assert.equal(suggestMapping(region('pineal gland',side),entries),null,'Do not describe a midline-only organ as a lateral pair');
const midline=region('midline pineal gland','M'),mapped=suggestMapping(midline,entries);
assert.equal(mapped.hemisphere,'M');assert.deepEqual(resolveMapping(midline,mapped,entries).map(e=>e.id),[pineal.id]);
assert.equal(cleanMapping(mapped).hemisphere,'M');
const paper=createPaper({title:'TEST ONLY: midline preservation',regions:[midline],mechanisms:[]},entries,{source:'Private source must be retained',reviewed:true});
paper.mappings.r1={...mapped,confirmed:true};
const rematched=rematchPapers([paper],entries);assert.deepEqual(rematched.papers[0],paper);assert.equal(rematched.matched,0);
const restored=validateBackup({version:1,themes:[],papers:[paper]},entries).papers[0];
assert.equal(restored.source,paper.source);assert.deepEqual(restored.mappings,paper.mappings);assert.equal(restored.data.regions[0].hemisphere,'M');
assert(analysisCapabilityError({capabilities:['atlas-evidence-v1','atlas-candidate-v2']}));
assert.equal(analysisCapabilityError({capabilities:['atlas-evidence-v1','atlas-candidate-v2','atlas-midline-v1']}),'');
// Actual Three.js material, not a mirrored mock: reversible depth and shading policy.
const material=new THREE.MeshStandardMaterial({roughness:.78,metalness:.06});configureAppearance(material);
const colour=material.color.clone(),style={opacity:.37,depthWrite:false,depthTest:true,emissiveIntensity:.35};
applySurfaceMode(material,style,'anatomical');applyAppearance(material,'anatomical',pineal);
assert.equal(material.opacity,1);assert.equal(material.transparent,false);assert.equal(material.userData.tissueMix.value,1);
assert(displayState({renderMode:'anatomical',focusKind:'entry',isolate:false},true).isolate);
assert(!displayState({renderMode:'anatomical',focusKind:'group',isolate:false},false).isolate);
material.color.copy(colour);applySurfaceMode(material,style,'transparent');applyAppearance(material,'transparent',pineal);
assert.equal(material.opacity,.37);assert(material.transparent);assert.equal(material.userData.tissueMix.value,0);assert.equal(material.roughness,.78);
material.dispose();
console.log('Epithalamus checks passed: original asset preservation, hierarchy and negative subnuclei controls, midline candidate/evidence separation, backup preservation, service gating and reversible material policy.');
