import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import * as THREE from '../anatomy/vendor/three.module.js';
import {describe} from '../anatomy/labels.js';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('anatomy/data/manifest.json',root)));
let faces=0;const names=new Set();
for(const file of manifest.files){
 const data=fs.readFileSync(new URL('anatomy/data/'+file.name,root));
 if(crypto.createHash('sha256').update(data).digest('hex')!==file.sha256)throw Error(file.name+' checksum');
 const raw=zlib.gunzipSync(data);const buffer=raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength);
 for(const e of manifest.entries.filter(e=>e.file===file.name)){
  if(names.has(e.id))throw Error('duplicate id');names.add(e.id);
  const v=Float32Array.from(new Int16Array(buffer,e.positionOffset,e.vertices*3),a=>a*e.positionScale);
  const f=new Uint16Array(buffer,e.indexOffset,e.triangles*3);
  if(f.some(i=>i>=e.vertices))throw Error(e.id+' invalid index');
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(v,3));geo.setIndex(new THREE.BufferAttribute(f,1));geo.computeVertexNormals();geo.computeBoundingBox();
  if(geo.getAttribute('normal').array.some(v=>!Number.isFinite(v)))throw Error(e.id+' nonfinite normal');
  const max=geo.boundingBox.max.toArray(),min=geo.boundingBox.min.toArray();
  if(max.some((v,i)=>Math.abs(v-e.bounds[1][i])>.04)||min.some((v,i)=>Math.abs(v-e.bounds[0][i])>.04))throw Error(e.id+' bounds mismatch');
  if(e.atlas!=='surface'&&!describe(e).title)throw Error(e.id+' missing label');
  faces+=f.length/3;geo.dispose();
 }
}
for(const path of ['index.html','basics.html']){
 const html=fs.readFileSync(new URL(path,root),'utf8');
 for(const [,ref]of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(/^(https?:|data:|\.\/)/.test(ref))continue;
  if(!fs.existsSync(new URL(ref,root)))throw Error('Missing asset '+ref);
 }
}
console.log(`${names.size} meshes / ${faces} triangles: checksums, GPU geometry, normals, bounds, labels and local page assets verified.`);
