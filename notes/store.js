import {cleanNote,validId,validKey} from './model.js';
export const DB_NAME='brain-atlas-structure-notes-v1';
let pending;
const channel=typeof window!=='undefined'&&typeof BroadcastChannel!=='undefined'?new BroadcastChannel(DB_NAME):null;
function changed(key){if(typeof window==='undefined')return;window.dispatchEvent(new CustomEvent('structure-notes-changed',{detail:{key}}));channel?.postMessage({key});}
if(channel)channel.onmessage=e=>window.dispatchEvent(new CustomEvent('structure-notes-changed',{detail:e.data}));
function database(){
 if(pending)return pending;
 pending=new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(Error('此浏览器不支持本地笔记存储。'));return;}
  const r=indexedDB.open(DB_NAME,1);let abandoned=false;
  r.onupgradeneeded=()=>{const s=r.result.createObjectStore('notes',{keyPath:'id'});s.createIndex('structureKey','structureKey');};
  r.onerror=()=>reject(r.error||Error('无法打开本地笔记库。'));
  r.onblocked=()=>{abandoned=true;reject(Error('笔记库被其他旧标签页占用，请关闭旧标签页后重试。'));};
  r.onsuccess=()=>{const db=r.result;if(abandoned){db.close();return;}db.onversionchange=()=>{db.close();pending=null;};resolve(db);};
 }).catch(e=>{pending=null;throw e;});return pending;
}
export async function listNotes(key=null){
 if(key!==null&&!validKey(key))throw Error('结构编号无效。');
 const db=await database();
 return new Promise((resolve,reject)=>{const tx=db.transaction('notes','readonly'),s=tx.objectStore('notes'),r=key?s.index('structureKey').getAll(key):s.getAll();let rows=[];r.onsuccess=()=>{rows=r.result;};tx.oncomplete=()=>resolve(rows.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));tx.onabort=()=>reject(tx.error||Error('笔记读取失败。'));tx.onerror=()=>{};});
}
export async function getNote(id){if(!validId(id))throw Error('笔记编号无效。');const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('notes','readonly'),r=tx.objectStore('notes').get(id);let row=null;r.onsuccess=()=>{row=r.result||null;};tx.oncomplete=()=>resolve(row);tx.onabort=()=>reject(tx.error||Error('笔记读取失败。'));tx.onerror=()=>{};});}
export function conflict(){const e=Error('此笔记已在其他标签页修改或删除。未覆盖其他版本；请另存副本或重新载入。');e.code='conflict';return e;}
// Read revision and write in ONE transaction. Resolve only after the transaction commits.
export async function saveNote(raw){
 const note=cleanNote(raw),db=await database();
 const saved=await new Promise((resolve,reject)=>{
  const tx=db.transaction('notes','readwrite'),s=tx.objectStore('notes'),r=s.get(note.id);let error,result;
  r.onsuccess=()=>{const old=r.result;if((old?.revision||0)!==note.revision||(!old&&note.revision!==0)||old&&old.structureKey!==note.structureKey){error=conflict();tx.abort();return;}result={...note,revision:note.revision+1,createdAt:old?.createdAt||note.createdAt,updatedAt:new Date().toISOString()};try{s.put(result);}catch(e){error=e;tx.abort();}};
  tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(error||tx.error||Error('笔记保存失败；改动仍保留在编辑器中。'));tx.onerror=()=>{};
 });changed(note.structureKey);return saved;
}
export async function deleteNote(id,revision){
 if(!validId(id)||!Number.isSafeInteger(revision))throw Error('笔记编号或版本无效。');const db=await database();let key;
 await new Promise((resolve,reject)=>{const tx=db.transaction('notes','readwrite'),s=tx.objectStore('notes'),r=s.get(id);let error;r.onsuccess=()=>{if(!r.result||r.result.revision!==revision){error=conflict();tx.abort();return;}key=r.result.structureKey;s.delete(id);};tx.oncomplete=resolve;tx.onabort=()=>reject(error||tx.error||Error('删除失败。'));tx.onerror=()=>{};});changed(key);
}
// Import is atomic and additive. Colliding IDs become copies; existing notes are never overwritten.
export async function importNotes(input){
 const rows=input.map(cleanNote),db=await database();let copies=0;
 await new Promise((resolve,reject)=>{const tx=db.transaction('notes','readwrite'),s=tx.objectStore('notes');for(const note of rows){const r=s.get(note.id);r.onsuccess=()=>{const copy=!!r.result;copies+=Number(copy);s.add({...note,id:copy?crypto.randomUUID():note.id,title:copy?(note.title||'未命名笔记').slice(0,190)+'（导入副本）':note.title,revision:1});};}tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('导入失败，未写入此次备份中的任何笔记。'));tx.onerror=()=>{};});changed(null);return {added:rows.length,copies};
}
