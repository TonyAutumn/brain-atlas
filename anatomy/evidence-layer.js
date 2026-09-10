import * as THREE from './vendor/three.module.js';
// Connections are schematic curves between atlas display centres, never tractography.
export function buildEvidenceLayer(spec,entries){
 const group=new THREE.Group(),anchors=new Map(),ids=new Set(),colors=new Map(),byId=new Map(entries.map(e=>[e.id,e]));
 for(const node of (spec.nodes||[]).slice(0,500)){
  const parcels=(node.entryIds||[]).map(id=>byId.get(id)).filter(Boolean);if(!parcels.length)continue;
  const box=new THREE.Box3();for(const e of parcels){ids.add(e.id);if(node.kind==='network')colors.set(e.id,'#b58aff');box.expandByPoint(new THREE.Vector3(...e.bounds[0]));box.expandByPoint(new THREE.Vector3(...e.bounds[1]));}
  anchors.set(node.id,box.getCenter(new THREE.Vector3()));
 }
 for(const link of (spec.links||[]).slice(0,600)){
  const a=anchors.get(link.from),b=anchors.get(link.to);if(!a||!b||a.distanceTo(b)<.5)continue;
  const midpoint=a.clone().add(b).multiplyScalar(.5);midpoint.z+=Math.min(18,a.distanceTo(b)*.16);
  const curve=new THREE.QuadraticBezierCurve3(a,midpoint,b),geometry=new THREE.BufferGeometry().setFromPoints(curve.getPoints(45));
  const inferred=['hypothesis','review','effective'].includes(link.kind),color=inferred?'#d8b5ff':'#39b9ff';
  const material=new THREE.LineDashedMaterial({color,transparent:true,opacity:.9,dashSize:inferred?1.8:link.kind==='association'?3:1000,gapSize:inferred?2.5:1.8,depthTest:false});
  const line=new THREE.Line(geometry,material);line.computeLineDistances();line.renderOrder=20;line.userData.evidence=link;group.add(line);
 }
 return {group,ids,colors,dispose(){group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}};
}
