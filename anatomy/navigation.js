// Extend the original learning hierarchy; retain its curated cortical routing.
import {NAV,navigationFor as originalNavigationFor,mappingGroups as originalMappingGroups} from './navigation-base.js';
import {installCatalog,canonicalGroup} from './structure-catalog.js';
installCatalog(NAV);
export {NAV};
export function navigationFor(e){return canonicalGroup(e)||originalNavigationFor(e);}
export function pathFor(group){
 const path=[],seen=new Set();
 for(let id=group;id&&NAV[id];id=NAV[id].parent){if(seen.has(id))throw Error('Anatomical hierarchy cycle: '+id);seen.add(id);path.unshift(id);}
 return path;
}
export function childrenOf(group){return Object.keys(NAV).filter(id=>NAV[id].parent===group);}
export function inGroup(e,group){return group==='all'||pathFor(e.nav||navigationFor(e)).includes(group);}
export function topGroup(group){return pathFor(group)[1]||'all';}
export function hierarchyFor(e){return [...pathFor(e.nav||navigationFor(e)).map(id=>({id,...NAV[id]})),{id:e.id,label:e.text?.title||e.name,kind:'图谱分区',atlas:e.atlas}];}
export function navigationText(e){return hierarchyFor(e).map(n=>n.label).join(' › ');}
// Knowledge-only concepts are deliberately not automatic evidence-mapping targets.
export function mappingGroups(){return originalMappingGroups();}
