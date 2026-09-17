// Notes use stable structure/parcel IDs, never the current translated label as a key.
export const LIMITS = Object.freeze({image:10*1024*1024, total:50*1024*1024, images:20, text:500000, backup:160*1024*1024, notes:1000});
export const TYPES = ['image/png','image/jpeg','image/gif','image/webp'];
export const validKey = key => typeof key==='string' && /^(group|parcel):[a-zA-Z0-9][a-zA-Z0-9_-]{0,100}$/.test(key);
export const validId = id => typeof id==='string' && /^[a-zA-Z0-9-]{1,80}$/.test(id) && !['constructor','prototype','__proto__'].includes(id);
export function freshNote(key,label='') {
 if(!validKey(key))throw Error('请先选择一个结构。');
 const now=new Date().toISOString();
 return {id:crypto.randomUUID(),structureKey:key,structureLabel:label,title:'',body:'',images:[],revision:0,createdAt:now,updatedAt:now};
}
function text(value,max,name) {if(typeof value!=='string'||value.length>max)throw Error(name+'无效或过长。');return value;}
export function cleanNote(n) {
 if(!n||!validId(n.id)||!validKey(n.structureKey))throw Error('笔记编号或结构关联无效。');
 if(!Number.isSafeInteger(n.revision)||n.revision<0)throw Error('笔记版本无效。');
 if(!Array.isArray(n.images)||n.images.length>LIMITS.images)throw Error('每篇笔记最多保存 20 张图片。');
 const seen=new Set();let total=0;
 const images=n.images.map(i=>{
  if(!i||!validId(i.id)||seen.has(i.id)||!(i.blob instanceof Blob)||!TYPES.includes(i.blob.type)||!i.blob.size||i.blob.size>LIMITS.image)throw Error('图片无效：支持 PNG、JPEG、GIF、WebP，每张不超过 10 MB。');
  seen.add(i.id);total+=i.blob.size;
  return {id:i.id,name:text(i.name,300,'图片名'),caption:text(i.caption||'',2000,'图片说明'),blob:i.blob};
 });
 if(total>LIMITS.total)throw Error('每篇笔记的图片总量不能超过 50 MB。');
 for(const k of ['createdAt','updatedAt'])if(typeof n[k]!=='string'||!Number.isFinite(Date.parse(n[k])))throw Error('笔记时间无效。');
 return {id:n.id,structureKey:n.structureKey,structureLabel:text(n.structureLabel||'',500,'结构名'),title:text(n.title,200,'标题'),body:text(n.body,LIMITS.text,'正文'),images,revision:n.revision,createdAt:n.createdAt,updatedAt:n.updatedAt};
}
export function noteURL(key,id=null,create=false) {
 const url=new URL('../notes.html',import.meta.url);
 if(validKey(key))url.searchParams.set('structure',key);
 if(validId(id))url.searchParams.set('note',id);
 if(create)url.searchParams.set('new','1');
 return url.href;
}
export function structureURL(key) {const url=new URL('../index.html',import.meta.url);if(validKey(key))url.searchParams.set('structure',key);return url.href;}
export const titleOf=n=>n.title.trim()||'未命名笔记';
export async function checkImage(blob,name='图片') {
 if(!(blob instanceof Blob)||!blob.size||blob.size>LIMITS.image)throw Error(name+'：每张图片不能超过 10 MB。');
 const b=new Uint8Array(await blob.slice(0,12).arrayBuffer());
 const ascii=(a,z)=>String.fromCharCode(...b.slice(a,z));
 const type=b[0]===137&&ascii(1,4)==='PNG'?'image/png':b[0]===255&&b[1]===216&&b[2]===255?'image/jpeg':/^GIF8[79]a$/.test(ascii(0,6))?'image/gif':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'image/webp':null;
 if(!type)throw Error(name+'：请选择 PNG、JPEG、GIF 或 WebP 图片。');
 return blob.type===type?blob:new Blob([blob],{type});
}
function toDataURL(blob) {return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('图片导出失败。'));r.readAsDataURL(blob);});}
export async function packNotes(notes) {
 if(!Array.isArray(notes)||notes.length>LIMITS.notes)throw Error('备份笔记数量超过 1000 篇。');
 const result=[];let bytes=0;
 for(const raw of notes){const n=cleanNote(raw),images=[];for(const i of n.images){const {blob,...meta}=i;bytes+=blob.size;if(bytes>100*1024*1024)throw Error('此次备份图片超过 100 MB，请按结构分别导出。');images.push({...meta,data:await toDataURL(blob)});}result.push({...n,images});}
 return {format:'brain-atlas-structure-notes',version:1,exportedAt:new Date().toISOString(),notes:result};
}
export async function unpackNotes(raw) {
 if(raw?.format!=='brain-atlas-structure-notes'||raw.version!==1||!Array.isArray(raw.notes)||raw.notes.length>LIMITS.notes)throw Error('不是受支持的结构笔记备份。');
 const ids=new Set(),result=[];let bytes=0;
 for(const source of raw.notes){
  if(!source||!validId(source.id)||ids.has(source.id)||!Array.isArray(source.images)||source.images.length>LIMITS.images)throw Error('备份存在无效或重复笔记。');ids.add(source.id);
  const images=[];
  for(const i of source.images){
   if(typeof i?.data!=='string'||i.data.length>Math.ceil(LIMITS.image/3)*4+100)throw Error('备份中的图片过大或无效。');
   const m=/^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(i.data);if(!m)throw Error('备份图片格式无效，不导入外部链接或 HTML。');
   const binary=atob(m[2]);bytes+=binary.length;if(bytes>100*1024*1024)throw Error('单次导入的图片不能超过 100 MB。');
   const blob=await checkImage(new Blob([Uint8Array.from(binary,c=>c.charCodeAt(0))],{type:m[1]}));if(blob.type!==m[1])throw Error('备份图片类型与内容不符。');
   images.push({id:i.id,name:i.name,caption:i.caption||'',blob});
  }
  result.push(cleanNote({...source,images}));
 }
 return result;
}
