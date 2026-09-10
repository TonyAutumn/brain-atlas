const open=()=>new Promise((resolve,reject)=>{
 const r=indexedDB.open('brain-atlas-papers-v1',1);
 r.onupgradeneeded=()=>r.result.createObjectStore('library');
 r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('浏览器无法打开本地文献库。请检查存储权限。'));
});
export async function readLibrary(){
 const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('library'),r=tx.objectStore('library').get('current');r.onsuccess=()=>resolve(r.result||{version:1,themes:['濒死体验'],papers:[]});r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();});
}
export async function saveLibrary(library){
 const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction('library','readwrite'),store=tx.objectStore('library'),read=store.get('current');let conflict=false,nextRevision=0;
  read.onsuccess=()=>{const current=read.result?.revision||0;if(current!==(library.revision||0)){conflict=true;tx.abort();return;}nextRevision=current+1;store.put({...library,revision:nextRevision},'current');};
  tx.oncomplete=()=>{library.revision=nextRevision;db.close();resolve();};
  tx.onerror=()=>{db.close();reject(Error('文献库保存失败，可能空间不足。请先导出备份。'));};
  tx.onabort=()=>{db.close();reject(Error(conflict?'文献库已发生其他更新。请导出当前结果，刷新页面后再合并。':'保存已中断。'));};
 });
}
