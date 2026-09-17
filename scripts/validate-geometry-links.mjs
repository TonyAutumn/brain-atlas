import fs from 'node:fs';
import assert from 'node:assert/strict';
import {NAV,navigationFor,inGroup} from '../anatomy/navigation.js';
import {conceptCoverage} from '../anatomy/search.js';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('anatomy/data/manifest.json',root)));
const entries=manifest.entries.filter(e=>e.atlas!=='surface');
for(const e of entries){e.nav=navigationFor(e);assert(fs.existsSync(new URL('anatomy/data/'+e.file,root)),`Missing model file: ${e.id}`);}
const concepts=Object.keys(NAV).filter(id=>id!=='all');
const missing=concepts.filter(id=>!conceptCoverage(id,entries).hasGeometry);
console.log('GEOMETRY_AUDIT_COUNTS '+JSON.stringify({entries:entries.length,concepts:concepts.length,linked:concepts.length-missing.length,unlinked:missing.length}));
for(const id of missing)console.log('GEOMETRY_AUDIT_UNLINKED '+JSON.stringify({id,label:NAV[id].label,english:NAV[id].english,related:NAV[id].related.map(target=>({id:target,models:conceptCoverage(target,entries).parcels.map(e=>e.id)}))}));
for(const id of concepts.filter(id=>!missing.includes(id)))console.log('GEOMETRY_AUDIT_LINKED '+JSON.stringify({id,label:NAV[id].label,models:conceptCoverage(id,entries).parcels.length,direct:entries.filter(e=>e.nav===id).map(e=>({id:e.id,name:e.name}))}));
