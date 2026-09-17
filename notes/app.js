import {NAV,pathFor,navigationFor} from '../anatomy/navigation.js?v=search1';
import {describe,ATLAS} from '../anatomy/labels.js';
import {freshNote,cleanNote,noteURL,structureURL,titleOf,checkImage,packNotes,unpackNotes,LIMITS,validKey} from './model.js';
import {listNotes,getNote,saveNote,deleteNote,importNotes} from './store.js';
const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
let actionBusy=false;
let entries=new Map(),scope=null,current=null,rows=[],generation=0,savedGeneration=0,timer=null,saving=null,blocked=false,imageWork=null,urls=[],listRun=0;
const dirty=()=>!!current&&generation!==savedGeneration;
function message(s,error=false){$('pageStatus').textContent=s;$('pageStatus').classList.toggle('error-message',error);}
function status(s,error=false){$('saveStatus').textContent=s;$('saveStatus').classList.toggle('error-message',error);$('saveError').hidden=!error;}
function structure(key,fallback=''){
 const [kind,id]=String(key||'').split(':');
 if(kind==='group'&&NAV[id])return {key,label:NAV[id].label,path:pathFor(id)};
 const e=kind==='parcel'&&entries.get(id);if(e)return {key,label:describe(e).full+' · '+ATLAS[e.atlas].name,path:pathFor(navigationFor(e))};
 return {key,label:fallback||key||'全部结构',path:[]};
}
function updateAddress(){history.replaceState(null,'',noteURL(current?.structureKey||scope,current?.id));}
function edit(){if(!current)return;current.title=$('noteTitle').value;current.body=$('noteBody').value;generation++;status(blocked?'有未保存改动，请重试保存或另存副本。':'有改动，正在准备自动保存…',blocked);clearTimeout(timer);if(!blocked)timer=setTimeout(()=>flush(),700);}
async function flush(retry=false){
 clearTimeout(timer);if(imageWork)await imageWork;
 if(saving){await saving;return blocked?false:flush(retry);}
 if(retry)blocked=false;if(blocked)return false;if(!dirty())return true;
 const target=generation,id=current.id;let snapshot;
 try{snapshot=cleanNote(current);}catch(e){blocked=true;status(e.message,true);return false;}
 status('正在保存…');
 saving=(async()=>{try{const saved=await saveNote(snapshot);if(current?.id===id){current.revision=saved.revision;current.updatedAt=saved.updatedAt;savedGeneration=target;status(dirty()?'还有改动等待保存…':'已保存到此浏览器 · '+new Date(saved.updatedAt).toLocaleTimeString());}refreshList();return true;}catch(e){blocked=true;status(e.message+' 改动尚未保存。',true);return false;}finally{saving=null;}})();
 const ok=await saving;if(ok&&dirty())return flush();return ok;
}
function releaseImages(){for(const u of urls)URL.revokeObjectURL(u);urls=[];$('imageDialog').close();$('largeImage').removeAttribute('src');}
function renderImages(){
 releaseImages();const box=$('noteImages');box.replaceChildren();if(!current)return;
 current.images.forEach((image,index)=>{
  const figure=el('figure'),preview=el('button',null,'image-preview'),img=el('img');preview.type='button';preview.title='打开大图';
  const url=URL.createObjectURL(image.blob);urls.push(url);img.src=url;img.alt=image.caption||image.name;preview.append(img);
  preview.onclick=()=>{$('largeImage').src=url;$('largeImage').alt=image.caption||image.name;$('largeCaption').textContent=image.caption||image.name;$('imageDialog').showModal();};
  const caption=el('input');caption.value=image.caption;caption.maxLength=2000;caption.placeholder='图片说明（可选）';caption.setAttribute('aria-label','图片说明 '+(index+1));caption.oninput=()=>{image.caption=caption.value;img.alt=image.caption||image.name;edit();};
  const controls=el('div',null,'image-controls');controls.append(el('span',image.name));
  for(const [label,delta]of [['上移',-1],['下移',1]]){const b=el('button',label);b.type='button';b.disabled=index+delta<0||index+delta>=current.images.length;b.onclick=()=>{[current.images[index],current.images[index+delta]]=[current.images[index+delta],current.images[index]];renderImages();edit();};controls.append(b);}
  const remove=el('button','删除图片');remove.type='button';remove.onclick=()=>{if(!confirm('删除这张笔记图片？'))return;current.images.splice(index,1);renderImages();edit();};controls.append(remove);
  figure.append(preview,caption,controls);box.append(figure);
 });
}
function showEditor(note){
 clearTimeout(timer);current=note?cleanNote(note):null;generation=savedGeneration=0;blocked=false;
 $('editor').hidden=!current;$('emptyEditor').hidden=!!current;$('linkBox').hidden=true;$('saveError').hidden=true;
 if(!current){releaseImages();return;}
 const s=structure(current.structureKey,current.structureLabel);$('structureName').textContent=s.label;$('backToStructure').href=structureURL(current.structureKey);
 $('noteTitle').value=current.title;$('noteBody').value=current.body;
 const path=$('noteAncestry');path.replaceChildren();
 for(const id of s.path){const a=el('a',NAV[id].label);a.href=structureURL('group:'+id);path.append(a,el('span','›'));}
 path.append(el('span',s.label,'current-structure'));renderImages();status(current.revision?'已保存到此浏览器':'新笔记尚未保存');updateAddress();
}
async function refreshList(){
 const run=++listRun;
 try{const result=await listNotes(scope);if(run!==listRun)return;rows=result;$('listError').textContent='';renderList();}
 catch(e){if(run===listRun)$('listError').textContent=e.message+' 未清除已有笔记。';}
}
function renderList(){
 const query=$('filterNotes').value.trim().toLowerCase(),shown=rows.filter(n=>(n.title+' '+n.body+' '+n.structureLabel).toLowerCase().includes(query));
 $('noteCount').textContent=`${shown.length} 篇笔记`;$('noteList').replaceChildren();
 for(const n of shown){const a=el('a',null,'note-card');a.href=noteURL(n.structureKey,n.id);a.dataset.noteId=n.id;if(current?.id===n.id)a.setAttribute('aria-current','page');a.append(el('strong',titleOf(n)),el('small',structure(n.structureKey,n.structureLabel).label),el('small',`${new Date(n.updatedAt).toLocaleString()} · ${n.images.length} 张图片`));a.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();run(()=>openNote(n.id));};$('noteList').append(a);}
 if(!shown.length)$('noteList').append(el('p',query?'没有匹配的笔记。':'暂无笔记。','muted'));
}
async function openNote(id){if(!await flush())return;const n=await getNote(id);if(!n){message('此浏览器找不到该笔记。请先导入含此笔记的备份，再打开链接。',true);return;}showEditor(n);renderList();message('笔记已打开。');}
async function newNote(){
 if(!scope||!validKey(scope)){message('请先在左侧选择一个结构。',true);return;}if(!await flush())return;
 const s=structure(scope);showEditor(freshNote(scope,s.label));generation=1;updateAddress();await flush();setTimeout(()=>$('noteTitle').focus(),0);
}
async function changeScope(){
 const next=$('structurePick').value||null;if(!await flush()){$('structurePick').value=scope||'';return;}
 scope=next;showEditor(null);$('newNote').disabled=!scope;$('exportStructure').disabled=!scope;updateAddress();await refreshList();
}
async function addImages(files){
 if(!current||!files.length)return;if(imageWork){message('图片正在处理，请完成后再添加。');return;}
 const target=current.id;message('正在读取图片…');
 imageWork=(async()=>{try{
  if(current.images.length+files.length>LIMITS.images)throw Error('每篇笔记最多 20 张图片。');
  const added=[];for(const file of files){const blob=await checkImage(file,file.name||'截图');const probe=new Image(),url=URL.createObjectURL(blob);try{probe.src=url;await probe.decode();if(probe.naturalWidth*probe.naturalHeight>40000000)throw Error('图片分辨率超过 4000 万像素，请缩小后再添加。');}finally{URL.revokeObjectURL(url);}added.push({id:crypto.randomUUID(),name:(file.name||'粘贴截图.png').slice(0,300),caption:'',blob});}
  if(current?.id!==target)return;
  cleanNote({...current,images:[...current.images,...added]});current.images.push(...added);renderImages();edit();message(`已添加 ${added.length} 张图片，正在自动保存。`);
 }catch(e){message(e.message+' 此次图片未添加，已有笔记保留。',true);}finally{imageWork=null;}})();await imageWork;
}
function downloadJSON(raw,name){const blob=new Blob([JSON.stringify(raw)],{type:'application/json'});if(blob.size>LIMITS.backup)throw Error('备份过大，请按结构分别导出。');const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function exportBackup(onlyStructure=false){
 const ok=await flush();let notes,readFailed=false;
 try{notes=await listNotes(onlyStructure?scope:null);}catch(e){if(!current)throw e;notes=[];readFailed=true;message('存储暂时不可读，此次只能导出当前编辑器草稿。',true);}
 if((!ok||readFailed)&&current){const draft=cleanNote({...current,id:crypto.randomUUID(),revision:0,title:(current.title||'未命名笔记').slice(0,188)+'（未保存草稿）'});notes.push(draft);}
 const raw=await packNotes(notes);downloadJSON(raw,'Brain-Atlas-Notes-'+new Date().toISOString().slice(0,10)+'.json');message(`已生成 ${notes.length} 篇笔记的含图片备份。`);
}
async function importBackup(file){
 if(!file)return;if(file.size>LIMITS.backup)throw Error('备份文件不能超过 160 MB。');if(!await flush())return;
 const notes=await unpackNotes(JSON.parse(await file.text()));if(!confirm(`导入 ${notes.length} 篇笔记？同编号笔记将另存副本，不覆盖现有内容。`))return;
 const result=await importNotes(notes);await refreshList();message(`已导入 ${result.added} 篇，其中 ${result.copies} 篇因编号重复另存为副本。`);
}
async function duplicate(){
 if(!current)return;if(imageWork)await imageWork;clearTimeout(timer);if(saving)await saving;
 const copy=cleanNote({...current,id:crypto.randomUUID(),revision:0,title:(current.title||'未命名笔记').slice(0,190)+'（副本）',createdAt:new Date().toISOString()});
 // Keep the original editor intact until the copy has committed.
 const saved=await saveNote(copy);showEditor(saved);await refreshList();message('已另存为独立副本，原笔记未覆盖。');
}
async function reload(){if(!current)return;if((dirty()||blocked)&&!confirm('放弃编辑器内未保存的改动，重新载入已保存内容？'))return;if(imageWork)await imageWork;if(saving)await saving;clearTimeout(timer);const n=await getNote(current.id);if(!n)throw Error('此笔记已删除，编辑器内容保留，可另存副本。');showEditor(n);message('已重新载入。');}
async function remove(){if(!current||!confirm('删除此篇笔记及其中图片？建议先导出备份。'))return;if(!await flush())return;await deleteNote(current.id,current.revision);showEditor(null);updateAddress();await refreshList();message('已删除此篇笔记。');}
async function copyLink(){if(!current)return;if(!await flush())return;const link=noteURL(current.structureKey,current.id);$('linkText').value=link;$('linkBox').hidden=false;try{await navigator.clipboard.writeText(link);message('笔记链接已复制；内容仍只在本地保存。');}catch{$('linkText').focus();$('linkText').select();message('请复制已选中的笔记链接。');}}
async function run(fn){if(actionBusy)return;actionBusy=true;$('editor').inert=true;document.querySelector('.notes-sidebar').inert=true;try{await fn();}catch(e){message(e.message||'操作失败，已有数据保留。',true);}finally{actionBusy=false;$('editor').inert=false;document.querySelector('.notes-sidebar').inert=false;}}
function bind(){
 $('noteTitle').oninput=edit;$('noteBody').oninput=edit;$('filterNotes').oninput=renderList;
 $('structurePick').onchange=()=>run(changeScope);$('newNote').onclick=()=>run(newNote);$('saveNote').onclick=()=>run(()=>flush(true));
 $('copyNoteLink').onclick=()=>run(copyLink);$('duplicateNote').onclick=()=>run(duplicate);$('reloadNote').onclick=()=>run(reload);$('deleteNote').onclick=()=>run(remove);
 $('imageInput').onchange=e=>{const files=[...e.target.files];e.target.value='';run(()=>addImages(files));};
 $('importInput').onchange=e=>{const file=e.target.files[0];e.target.value='';run(()=>importBackup(file));};
 $('exportAll').onclick=()=>run(()=>exportBackup());$('exportStructure').onclick=()=>run(()=>exportBackup(true));
 $('closeImage').onclick=()=>$('imageDialog').close();
 $('editor').addEventListener('paste',e=>{const files=[...(e.clipboardData?.items||[])].filter(i=>i.kind==='file'&&i.type.startsWith('image/')).map(i=>i.getAsFile()).filter(Boolean);if(!files.length)return;e.preventDefault();const text=e.clipboardData.getData('text/plain');if(text&&e.target===$('noteBody')){$('noteBody').setRangeText(text,$('noteBody').selectionStart,$('noteBody').selectionEnd,'end');edit();}run(()=>addImages(files));});
 document.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files'))e.preventDefault();});
 document.addEventListener('drop',e=>{if(!e.dataTransfer?.files.length)return;e.preventDefault();if(current)run(()=>addImages([...e.dataTransfer.files]));else message('请先新建或打开一篇笔记。',true);});
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();run(()=>flush(true));}});
 window.addEventListener('beforeunload',e=>{if(dirty()||imageWork){e.preventDefault();e.returnValue='';}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&!blocked)flush();});
 window.addEventListener('structure-notes-changed',refreshList);
 window.addEventListener('focus',refreshList);
}
async function main(){
 bind();const params=new URL(location.href).searchParams;
 try{const response=await fetch('anatomy/data/manifest.json');if(!response.ok)throw Error('结构索引读取失败。');const manifest=await response.json();entries=new Map(manifest.entries.filter(e=>e.atlas!=='surface').map(e=>[e.id,e]));}
 catch(e){message(e.message+' 仍可查看已有笔记。',true);}
 const choices=[...Object.keys(NAV).map(id=>structure('group:'+id)),...entries.keys()].map(s=>typeof s==='string'?structure('parcel:'+s):s).sort((a,b)=>a.label.localeCompare(b.label,'zh-CN'));
 for(const s of choices){const option=el('option',s.label+(s.key.startsWith('group:')?' · 结构':''));option.value=s.key;$('structurePick').append(option);}
 scope=validKey(params.get('structure'))?params.get('structure'):null;
 if(scope&&![...$('structurePick').options].some(o=>o.value===scope)){const o=el('option',scope+'（当前词库未找到）');o.value=scope;$('structurePick').append(o);}
 $('structurePick').value=scope||'';$('newNote').disabled=!scope;$('exportStructure').disabled=!scope;
 await refreshList();window.notesReady=true;message('笔记库已打开，内容只保存在此浏览器。');
 if(params.get('note'))await openNote(params.get('note'));
 else if(params.get('new')==='1'&&scope)await newNote();
}
run(main);
