import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshNote,cleanNote,validKey,noteURL,structureURL,unpackNotes,checkImage} from '../notes/model.js';
const note=freshNote('group:tectum','中脑顶盖');
assert.equal(note.structureKey,'group:tectum');assert.equal(note.revision,0);
assert.deepEqual(cleanNote(note),note);
for(const key of ['tectum','group:<script>','parcel:../../','__proto__','group:'])assert(!validKey(key),key);
assert.equal(new URL(noteURL(note.structureKey,note.id)).searchParams.get('note'),note.id);
assert.equal(new URL(structureURL('parcel:cit-21')).searchParams.get('structure'),'parcel:cit-21');
assert.throws(()=>cleanNote({...note,title:'x'.repeat(201)}));
assert.throws(()=>cleanNote({...note,images:[{id:'i1',name:'bad.svg',caption:'',blob:new Blob(['<svg/>'],{type:'image/svg+xml'})}]}));
await assert.rejects(checkImage(new Blob(['not an image'])));
await assert.rejects(unpackNotes({format:'other',version:1,notes:[]}));
const backup={format:'brain-atlas-structure-notes',version:1,notes:[note]};
assert.equal((await unpackNotes(backup))[0].structureKey,'group:tectum');
await assert.rejects(unpackNotes({...backup,notes:[note,note]}));
await assert.rejects(unpackNotes({...backup,notes:[{...note,images:[{id:'image1',data:'https://invalid.example/image.png'}]}]}));
const root=new URL('../',import.meta.url);
for(const file of ['notes.html','notes/app.js','notes/model.js','notes/store.js','notes/atlas-integration.js']){
 const content=fs.readFileSync(new URL(file,root),'utf8');
 const refs=file.endsWith('.html')?[...content.matchAll(/(?:src|href)="([^"#]+)"/g)]:[...content.matchAll(/from ['"]([^'"]+)['"]/g)];
 for(const [,ref]of refs){if(/^(https?:|data:)/.test(ref))continue;assert(fs.existsSync(new URL(ref,new URL(file,root))),`Missing asset ${file}: ${ref}`);}
}
console.log('Notes model checks passed: stable IDs, limits, image formats, backup validation and local imports. No user data used.');
