import fs from 'node:fs';
import assert from 'node:assert/strict';
import {NAV,navigationFor,inGroup,pathFor,childrenOf,navigationText} from '../anatomy/navigation.js';
import {emphasis,showShell} from '../anatomy/visual-state.js';

const root=new URL('../',import.meta.url);
const entries=JSON.parse(fs.readFileSync(new URL('anatomy/data/manifest.json',root))).entries.filter(e=>e.atlas!=='surface');
const top=childrenOf('all');
for(const e of entries){
 e.nav=navigationFor(e);
 assert(NAV[e.nav],`Missing navigation: ${e.name}`);
 assert.notEqual(e.nav,'unassigned',`Review new source label: ${e.name}`);
 assert.equal(top.filter(id=>inGroup(e,id)).length,1,`Overlapping/missing parent: ${e.name}`);
 assert.equal(pathFor(e.nav).length,3,`Incomplete path: ${e.name}`);
}
// Anatomical anchors and boundaries from the source labels, across both sides.
const anchors={
 'Area 4a (PreCG)':'frontal','Area 3b (PostCG)':'parietal',
 'Area Te 1.0 (HESCHL)':'temporal','Area hOc1 (V1, 17, CalcS)':'occipital',
 'Area Ia1 (Insula)':'insula','Area p32 (pACC)':'cingulate',
 'Area TPJ (STG, SMG)':'transition','Area FG1 (FusG)':'transition',
 'Area hPO1 (POS)':'transition','CA1 (Hippocampus)':'hippocampus',
 'STN (Subthalamus)':'subthalamus','ZI (Thalamus, zona incerta)':'subthalamus',
 'SNC (Midbrain, Substantia Nigra pars compacta)':'midbrain',
 'Ch 4 (Basal Forebrain)':'forebrain'
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
const cit=entries.filter(e=>e.atlas==='cit168');
assert.equal(cit.filter(e=>inGroup(e,'cortex')).length,0);
assert.equal(cit.filter(e=>inGroup(e,'diencephalon')).length,6);
assert.equal(cit.filter(e=>inGroup(e,'subthalamus')).length,2);
// Source inspection only: verify local imports and page controls, without a browser.
const html=fs.readFileSync(new URL('index.html',root),'utf8');
const app=fs.readFileSync(new URL('anatomy/app.js',root),'utf8');
for(const [,id]of app.matchAll(/\$\('([^']+)'\)/g))assert((html+app).includes(`id="${id}"`),`Missing control: ${id}`);
for(const file of ['index.html','anatomy/app.js','anatomy/visual-state.js','anatomy/navigation.js']){
 const content=fs.readFileSync(new URL(file,root),'utf8');
 const refs=file.endsWith('.html')?[...content.matchAll(/(?:src|href)="([^"#]+)"/g)]:[...content.matchAll(/from ['"]([^'"]+)['"]/g)];
 for(const [,ref]of refs){if(/^(https?:|data:)/.test(ref))continue;assert(fs.existsSync(new URL(ref,new URL(file,root))),`Missing asset: ${ref}`);}
}
console.log(`${entries.length} entries: complete navigation paths, anatomical anchors, group/region emphasis, isolation and local references verified.`);
