// Display choices are independent of learning marks, notes and paper evidence.
import {NETWORKS,networkEntries} from '../research/networks.js?v=networkselect1';
export const SELECTION_VERSION='2026-09-30.1';
export const LEGACY_SELECTION_KEY='brain-atlas-selected-regions-v1';
export const SELECTION_KEY='brain-atlas-selected-regions-v2';
export function createRegionSelection(entries,storage){
 const valid=new Set(entries.map(e=>e.id)),manual=new Set(),networks=new Map();let persistent=!!storage;
 const allowed=new Map(NETWORKS.map(n=>[n.id,new Set(networkEntries(n,entries).map(e=>e.id))]));
 const clean=values=>new Set((Array.isArray(values)?values:[]).filter(id=>valid.has(id)));
 const union=()=>new Set([...manual,...[...networks.values()].flatMap(ids=>[...ids])]);
 const networkIds=()=>new Set([...networks.values()].flatMap(ids=>[...ids]));
 try{
  const raw=storage?.getItem(SELECTION_KEY),saved=raw?JSON.parse(raw):null;
  if(saved?.version===2){
   for(const id of clean(saved.manual))manual.add(id);
   for(const [name,ids]of Object.entries(saved.networks||{})){
    const accepted=new Set([...clean(ids)].filter(id=>allowed.get(name)?.has(id)));
    if(accepted.size)networks.set(name,accepted);
   }
  }else{
   for(const id of clean(JSON.parse(storage?.getItem(LEGACY_SELECTION_KEY)||'[]')))manual.add(id);
  }
 }catch{persistent=false;}
 function save(){try{storage?.setItem(SELECTION_KEY,JSON.stringify({version:2,manual:[...manual],networks:Object.fromEntries([...networks].map(([name,ids])=>[name,[...ids]]))}));persistent=!!storage;}catch{persistent=false;}}
 return {
  get ids(){return union();},get size(){return union().size;},get persistent(){return persistent;},has:id=>union().has(id),
  get networkIds(){return networkIds();},get networks(){return new Map([...networks].map(([name,ids])=>[name,new Set(ids)]));},
  // Inspecting an existing yellow parcel cannot silently convert it to a blue choice.
  add(values){const ids=union();let added=0;for(const id of values)if(valid.has(id)&&!ids.has(id)){manual.add(id);ids.add(id);added++;}if(added)save();return added;},
  addNetwork(name){const all=allowed.get(name);if(!all?.size)return 0;const chosen=networks.get(name)||new Set();let added=0;for(const id of all)if(!chosen.has(id)){chosen.add(id);added++;}if(added){networks.set(name,chosen);save();}return added;},
  removeNetwork(name){const changed=networks.delete(name);if(changed)save();return changed;},
  remove(id){let changed=manual.delete(id);for(const [name,ids]of networks){if(ids.delete(id))changed=true;if(!ids.size)networks.delete(name);}if(changed)save();return changed;},
  clear(){if(manual.size||networks.size){manual.clear();networks.clear();save();}}
 };
}
