// Progressive enhancement through the atlas's public catalogue API. No model/store migration.
import {listNotes} from './store.js';
import {noteURL,structureURL,validKey,titleOf} from './model.js?v=epithalamus1';
const detail=document.getElementById('detail3');
const element=(tag,text,className)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;};
let refreshing=0,started=false;
function context(){
 const api=window.brainAtlas;if(!api)return null;
 const entry=detail.querySelector('.current-parcel')?api.getEntry(api.getSelection()):null;
 const id=entry?.nav||api.getGroup(),structure=api.getStructure(id);if(!structure)return null;
 return {key:entry?'parcel:'+entry.id:'group:'+id,label:entry?entry.text.full:structure.label,path:structure.path,entry,structure};
}
function groupButton(id,label){const b=element('button',label,'ancestor-link');b.type='button';b.dataset.group=id;b.title='转到 '+label;return b;}
function enhance(){
 const c=context();if(!c||detail.querySelector('#structureNotes'))return;
 const parentId=c.entry?c.entry.nav:c.structure.parent;
 const parent=parentId&&window.brainAtlas.getStructure(parentId),parentBox=detail.querySelector('.direct-parent');
 if(parent&&parentBox){const label=parentBox.querySelector('strong');if(label)label.replaceWith(groupButton(parentId,'← '+parent.label));}
 const ids=c.path.slice(1);
 detail.querySelectorAll('.hierarchy-list .hierarchy-step').forEach((row,i)=>{const id=ids[i],strong=row.querySelector('strong');if(!id||!strong)return;const b=groupButton(id,window.brainAtlas.getStructure(id).label);if(!c.entry&&id===c.structure.id)b.setAttribute('aria-current','location');strong.replaceWith(b);});
 const section=element('section',null,'detail-section structure-notes');section.id='structureNotes';section.dataset.key=c.key;
 section.append(element('h3','我的笔记'));
 const actions=element('div',null,'note-entry-actions');
 const create=element('a','新建笔记','note-action');create.href=noteURL(c.key,null,true);create.target='_blank';create.rel='noopener';create.dataset.noteAction='new';
 const open=element('a','打开笔记','note-action');open.href=noteURL(c.key);open.target='_blank';open.rel='noopener';open.dataset.noteAction='open';actions.append(create,open);section.append(actions);
 if(c.entry){const a=element('a','查看上级结构的笔记','note-parent-link');a.href=noteURL('group:'+c.entry.nav);a.target='_blank';a.rel='noopener';section.append(a);}
 const list=element('div','正在读取本地笔记…','structure-note-list');section.append(list);
 section.append(element('p','文字和图片保存在此浏览器；笔记不会公开上传。','micro-note'));
 const anchor=detail.querySelector('.direct-parent')||detail.querySelector('.latin3')||detail.querySelector('h2');
 if(anchor)anchor.after(section);else detail.append(section);
 refreshNotes();
}
async function refreshNotes(){
 const section=detail.querySelector('#structureNotes');if(!section)return;const serial=++refreshing,key=section.dataset.key,list=section.querySelector('.structure-note-list');
 try{const notes=await listNotes(key);if(serial!==refreshing||!section.isConnected)return;list.replaceChildren();if(!notes.length){list.append(element('p','暂无笔记，点击“新建笔记”开始。','micro-note'));return;}
  for(const n of notes.slice(0,5)){const a=element('a',titleOf(n),'saved-note-link');a.href=noteURL(key,n.id);a.target='_blank';a.rel='noopener';list.append(a);}
  if(notes.length>5){const more=element('a',`查看全部 ${notes.length} 篇笔记`);more.href=noteURL(key);more.target='_blank';more.rel='noopener';list.append(more);}
 }catch{if(section.isConnected)list.textContent='本地笔记暂时无法读取，请打开笔记页重试。';}
}
async function applyAddress(){
 const key=new URL(location.href).searchParams.get('structure');if(!validKey(key))return;
 const [kind,id]=key.split(':'),api=window.brainAtlas;
 if(kind==='group'&&typeof api.getStructure(id)?.label==='string')await api.selectGroup(id);
 else if(kind==='parcel'&&api.getEntry(id))await api.select(id);
 else return;
 enhance();
}
function start(){
 if(started||!window.brainAtlas)return false;started=true;enhance();
 applyAddress().catch(console.error);
 window.addEventListener('structure-notes-changed',refreshNotes);
 window.addEventListener('focus',refreshNotes);
 window.addEventListener('pageshow',()=>{enhance();refreshNotes();});
 window.addEventListener('popstate',()=>applyAddress().catch(console.error));
 window.notesIntegrationReady=true;return true;
}
if(detail){
 // Watch only replacement of the detail's direct children, not typing or asynchronous note lists.
 new MutationObserver(()=>{if(!started)start();enhance();}).observe(detail,{childList:true});
 if(!start()){let tries=0;const timer=setInterval(()=>{if(start()||++tries>600)clearInterval(timer);},100);}
}
