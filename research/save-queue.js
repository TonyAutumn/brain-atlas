// One writer per tab. A queued snapshot includes every preceding local edit.
export function createSaveQueue(save, initialRevision=0){
 let tail=Promise.resolve(),revision=initialRevision;
 return snapshot=>{
  const task=tail.then(async()=>{const next={...snapshot,revision};await save(next);revision=next.revision;return revision;});
  tail=task.catch(()=>{});
  return task;
 };
}
