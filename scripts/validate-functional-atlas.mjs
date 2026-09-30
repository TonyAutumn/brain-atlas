import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {NETWORKS,DMN,networkEntries,describeFunctional,networkOf} from '../research/networks.js';
import {mappingOptions,resolveMappingCandidate} from '../research/model.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const manifest=read('anatomy/data/functional-manifest.json'),entries=manifest.entries,provenance=read('anatomy/functional-provenance.json');
const anatomy=read('anatomy/data/manifest.json').entries.filter(e=>e.atlas!=='surface'),all=[...anatomy,...entries];
assert.equal(entries.length,200);assert.equal(new Set(entries.map(e=>e.id)).size,200);assert.equal(new Set(entries.map(e=>e.label17)).size,200);
assert.equal(entries.reduce((sum,e)=>sum+e.voxelCount,0),provenance.sourceVoxelCount);
assert.equal(NETWORKS.length,24);
for(const scheme of [7,17]){
 const networks=NETWORKS.filter(n=>n.scheme===scheme);assert.equal(networks.length,scheme);
 const ids=networks.flatMap(n=>{const list=networkEntries(n,entries);assert(list.length);assert.deepEqual([...new Set(list.map(e=>e.hemisphere))].sort(),['L','R']);return list.map(e=>e.id);});
 assert.equal(ids.length,200);assert.equal(new Set(ids).size,200);
}
const dmn=networkEntries(DMN,entries);assert.equal(dmn.length,46);
for(const hemisphere of ['L','R'])for(const area of ['PFC','pCunPCC','Temp','Par'])assert(dmn.some(e=>e.hemisphere===hemisphere&&e.name.includes(area)),hemisphere+' '+area);
for(const file of manifest.files){
 const compressed=fs.readFileSync(new URL('../anatomy/data/'+file.name,import.meta.url));assert.equal(compressed.length,file.bytes);assert.equal(createHash('sha256').update(compressed).digest('hex'),file.sha256);
 const data=gunzipSync(compressed),buffer=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);
 for(const e of entries.filter(e=>e.file===file.name)){
  const v=new Int16Array(buffer,e.positionOffset,e.vertices*3),f=new Uint16Array(buffer,e.indexOffset,e.triangles*3);
  assert(e.vertices>0&&e.triangles>0&&e.vertices<65536);assert([...f].every(i=>i<e.vertices));
  for(let axis=0;axis<3;axis++){
   let min=Infinity,max=-Infinity;for(let i=axis;i<v.length;i+=3){const x=v[i]*e.positionScale;min=Math.min(min,x);max=Math.max(max,x);}
   assert(Math.abs(min-e.bounds[0][axis])<.04);assert(Math.abs(max-e.bounds[1][axis])<.04);
  }
  assert((e.center[0]<0)===(e.hemisphere==='L'));assert.equal(e.voxelMaskSha256.length,64);assert(describeFunctional(e).title);
 }
}
assert(!mappingOptions(all).some(o=>o.value.startsWith('parcel:schaefer')));
const region={name:'frontal lobe',level:'region',species:'human',hemisphere:'both'};
assert(resolveMappingCandidate(region,{target:'group:all',hemisphere:'both'},all).every(e=>e.atlas!=='schaefer200'));
for(const n of NETWORKS){assert.equal(networkOf({name:n.id})?.id,n.id);assert.equal(resolveMappingCandidate({...region,name:n.id,level:'network'},{target:'network:'+n.id,hemisphere:'both'},all).length,networkEntries(n,entries).length);}
assert.equal(networkOf({name:'salience network'}),null,'Do not pretend Yeo SalVentAttn is an exact salience-only atlas');
console.log('Functional atlas checks passed: 200 meshes, all 7/17 memberships, bilateral DMN core coverage, hashes, indices, bounds, coordinates and anatomical separation.');
