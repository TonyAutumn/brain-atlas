// Rendering policy only. No atlas IDs, coordinates or saved user data are changed.
export const RENDER_MODE_VERSION='2026-09-29.1';
export const isSolid=state=>['solid','anatomical'].includes(state.renderMode);
export function displayState(state,hasSelection){
 const multi=!!state.selectedIds?.size;
 const automatic=!!hasSelection&&isSolid(state)&&(multi?!state.selectionContext:['entry','group','evidence'].includes(state.focusKind));
 return {...state,focusKind:multi?'multi':state.focusKind,isolate:!!hasSelection&&(!!state.isolate||automatic),automaticIsolation:automatic};
}
export function applySurfaceMode(material,style,mode){
 const solid=isSolid({renderMode:mode}),transparent=!solid;
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
