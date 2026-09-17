// Rendering policy only. No atlas IDs, coordinates or saved user data are changed.
export const RENDER_MODE_VERSION='2026-09-17.1';
export const isSolid=state=>state.renderMode==='solid';
export function displayState(state,hasSelection){
 const automatic=!!hasSelection&&isSolid(state)&&['entry','group','evidence'].includes(state.focusKind);
 return {...state,isolate:!!hasSelection&&(!!state.isolate||automatic),automaticIsolation:automatic};
}
export function applySurfaceMode(material,style,mode){
 const solid=mode==='solid',transparent=!solid;
 // Only recompile when the rendering pass changes, not on every selection.
 if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}
 material.opacity=solid?1:style.opacity;
 material.depthWrite=solid?true:!!style.depthWrite;
 material.depthTest=solid?true:style.depthTest!==false;
 if('emissiveIntensity' in style)material.emissiveIntensity=solid?Math.min(style.emissiveIntensity,.08):style.emissiveIntensity;
}
// An opaque shell must not let picking select a structure hidden behind it.
export function isOccludedByShell(hitDistance,shellDistance,solid){
 return solid&&Number.isFinite(shellDistance)&&shellDistance+.05<hitDistance;
}
