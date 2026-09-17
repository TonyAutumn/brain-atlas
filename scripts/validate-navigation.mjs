import fs from 'node:fs';
import assert from 'node:assert/strict';
import {NAV,navigationFor,inGroup,pathFor,childrenOf,navigationText,hierarchyFor,mappingGroups} from '../anatomy/navigation.js';
import {emphasis,showShell} from '../anatomy/visual-state.js';

const root=new URL('../',import.meta.url);
const entries=JSON.parse(fs.readFileSync(new URL('anatomy/data/manifest.json',root))).entries.filter(e=>e.atlas!=='surface');
const top=childrenOf('all');
for(const e of entries){
 e.nav=navigationFor(e);
 assert(NAV[e.nav],`Missing navigation: ${e.name}`);
 assert.notEqual(e.nav,'unassigned',`Review new source label: ${e.name}`);
 assert.equal(top.filter(id=>inGroup(e,id)).length,1,`Overlapping/missing parent: ${e.name}`);
 assert(pathFor(e.nav).length>=4,`Incomplete path: ${e.name}`);
 assert(pathFor(e.nav).length<=9,`Unwieldy path: ${e.name}`);
 const hierarchy=hierarchyFor(e);
 assert.equal(hierarchy.at(-1).id,e.id,`Missing atlas leaf: ${e.name}`);
 assert.equal(hierarchy.at(-2).id,e.nav,`Wrong direct parent: ${e.name}`);
}
// Anatomical anchors and boundaries from the source labels, across both sides.
const anchors={
 'Area 4a (PreCG)':'frontal_motor','Area 3b (PostCG)':'parietal_somato',
 'Area Te 1.0 (HESCHL)':'temporal_auditory','Area hOc1 (V1, 17, CalcS)':'occipital_early',
 'Area Ia1 (Insula)':'insula_agranular','Area p32 (pACC)':'cingulate_anterior',
 'Area TPJ (STG, SMG)':'transition_tpj','Area FG1 (FusG)':'transition_ventral',
 'Area hPO1 (POS)':'transition_parietooccipital','CA1 (Hippocampus)':'hippocampal_fields',
 'STN (Subthalamus)':'subthalamic_nucleus','ZI (Thalamus, zona incerta)':'zona_incerta',
 'SNC (Midbrain, Substantia Nigra pars compacta)':'substantia_nigra',
 'Ch 4 (Basal Forebrain)':'basal_forebrain_cholinergic'
};
for(const [name,group]of Object.entries(anchors)){
 const pair=entries.filter(e=>e.name===name);assert.equal(pair.length,2,name);
 for(const e of pair)assert.equal(e.nav,group,name);
}
const state={group:'cortex',focusKind:'group',selected:null,colors:false,isolate:true,hemi:'both'};
const motor=entries.find(e=>e.name==='Area 4a (PreCG)');
const vision=entries.find(e=>e.name==='Area hOc1 (V1, 17, CalcS)');
const subiculum=entries.find(e=>e.id==='julich-L-172');
assert(emphasis(motor,state).inSelection);assert(emphasis(vision,state).inSelection);
assert(!emphasis(subiculum,state).inSelection);
state.group='frontal';assert(emphasis(motor,state).inSelection);assert(!emphasis(vision,state).inSelection);
assert.equal(emphasis(motor,state).colour,NAV.frontal.color);
state.focusKind='entry';state.selected=motor.id;
assert.equal(entries.filter(e=>emphasis(e,state).inSelection).length,1);
assert.equal(emphasis(motor,state).colour,'#39b9ff');
assert.equal(emphasis(motor,state).depthTest,true);
assert.equal(emphasis(subiculum,state,true).colour,'#1675b2');
assert(!showShell(state,'L',.18));assert(!showShell(state,'R',.18));
state.isolate=false;assert(showShell(state,'L',.18));
assert(navigationText(motor).includes('额叶'));
const vp=entries.filter(e=>/Ventral Pallidum/.test(e.name));
assert.equal(vp.length,4);
for(const e of vp){
 assert.equal(e.nav,'ventral_pallidum');
 for(const group of ['cerebrum','deep','basal','ventral_basal_ganglia','ventral_pallidum'])assert(inGroup(e,group),`VP missing ${group}`);
 assert(navigationText(e).includes('皮层下灰质 › 基底神经节 › 腹侧基底神经节 › 腹侧苍白球'));
}
assert(mappingGroups().includes('ventral_pallidum'));
const cit=entries.filter(e=>e.atlas==='cit168');
assert.equal(cit.filter(e=>inGroup(e,'cortex')).length,0);
// Diencephalon now includes the subthalamic subdivision, not only the old miscellaneous group.
assert.equal(cit.filter(e=>inGroup(e,'diencephalon')).length,8);
assert.equal(cit.filter(e=>inGroup(e,'subthalamus')).length,2);
// Source inspection only; browser interaction checks live in validate-discovery-browser.py.
const html=fs.readFileSync(new URL('index.html',root),'utf8');
const app=fs.readFileSync(new URL('anatomy/app.js',root),'utf8');
for(const [,id]of app.matchAll(/\$\('([^']+)'\)/g))assert((html+app).includes(`id="${id}"`),`Missing control: ${id}`);
for(const file of ['index.html','anatomy/app.js','anatomy/visual-state.js','anatomy/navigation.js','anatomy/search.js']){
 const content=fs.readFileSync(new URL(file,root),'utf8');
 const refs=file.endsWith('.html')?[...content.matchAll(/(?:src|href)="([^"#]+)"/g)]:[...content.matchAll(/from ['"]([^'"]+)['"]/g)];
 for(const [,ref]of refs){if(/^(https?:|data:)/.test(ref))continue;assert(fs.existsSync(new URL(ref,new URL(file,root))),`Missing asset: ${ref}`);}
}
console.log(`${entries.length} entries: complete navigation paths, anatomical anchors, group/region emphasis, isolation and local references verified.`);
