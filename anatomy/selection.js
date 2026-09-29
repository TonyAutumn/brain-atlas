// Manual display choices are separate from learning marks and paper evidence.
export const SELECTION_VERSION='2026-09-29.1';
export const SELECTION_KEY='brain-atlas-selected-regions-v1';
export function createRegionSelection(entries,storage){
 const valid=new Set(entries.map(e=>e.id)),ids=new Set();let persistent=!!storage;
 try{
  const saved=JSON.parse(storage?.getItem(SELECTION_KEY)||'[]');
  if(Array.isArray(saved))for(const id of saved)if(valid.has(id))ids.add(id);
 }catch{persistent=false;}
 function save(){try{storage?.setItem(SELECTION_KEY,JSON.stringify([...ids]));persistent=!!storage;}catch{persistent=false;}}
 return {
  get ids(){return new Set(ids);},get size(){return ids.size;},get persistent(){return persistent;},has:id=>ids.has(id),
  add(values){let added=0;for(const id of values)if(valid.has(id)&&!ids.has(id)){ids.add(id);added++;}if(added)save();return added;},
  remove(id){const changed=ids.delete(id);if(changed)save();return changed;},
  clear(){if(ids.size){ids.clear();save();}}
 };
}
