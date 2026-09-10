// Semantic emphasis is independent of atlas-provided region colours.
export const GROUP_COLORS={cortex:'#b99aff',hippocampus:'#ffc36b',amygdala:'#f78fae',thalamus:'#a6dd79',basal:'#63d5b8',midbrain:'#ffad78',diencephalon:'#e4cc70',cerebellum:'#92a9ff'};
export function emphasis(entry,state,learned=false){
 const selected=state.focusKind==='entry'&&entry.id===state.selected;
 const group=state.group!=='all'&&entry.category===state.group;
 const groupSelected=state.focusKind==='group'&&group;
 const inSelection=selected||groupSelected;
 const tint=GROUP_COLORS[entry.category]||'#a0adbf';
 const original=state.colors&&entry.color?`rgb(${entry.color.join(',')})`:null;
 const colour=selected?'#39b9ff':learned?'#1675b2':original||(group?tint:entry.category==='cortex'?'#b3bdcc':'#a0adbf');
 return {inSelection,colour,opacity:selected?.97:groupSelected?.84:learned?.70:group?.58:state.colors?.42:entry.category==='cortex'?.095:.30,
  emissive:selected?'#0877b5':learned?'#06395a':group?tint:'#000000',
  emissiveIntensity:selected?.65:learned?.32:group?.12:0,
  depthWrite:selected||groupSelected||learned,depthTest:!selected||state.isolate,order:selected?10:groupSelected?4:learned?5:0};
}
export function showShell(state,hemisphere,opacity){
 return !state.isolate&&(state.hemi==='both'||hemisphere===state.hemi)&&opacity>0;
}
