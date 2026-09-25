// A display material on the original atlas geometry, not histology or new detail.
export const APPEARANCE_VERSION='2026-09-25.1';
export const isAnatomical=state=>state.renderMode==='anatomical';

// Object-space colour variation stays attached to the source mesh while rotating.
// No vertices, coordinates, normals, parcel IDs or persistent records are altered.
export function configureAppearance(material){
 const mix={value:0};
 material.userData.tissueMix=mix;
 material.onBeforeCompile=shader=>{
  shader.uniforms.atlasTissueMix=mix;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 atlasPosition;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\natlasPosition = position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
uniform float atlasTissueMix;
varying vec3 atlasPosition;
float atlasHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float atlasGrain(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(atlasHash(i),atlasHash(i+vec3(1,0,0)),f.x),mix(atlasHash(i+vec3(0,1,0)),atlasHash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(atlasHash(i+vec3(0,0,1)),atlasHash(i+vec3(1,0,1)),f.x),mix(atlasHash(i+vec3(0,1,1)),atlasHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}`)
   .replace('#include <color_fragment>',`#include <color_fragment>
if(atlasTissueMix > .5){
 float tissueTone = (atlasGrain(atlasPosition*.28)-.5)*.09 + (atlasGrain(atlasPosition*5.0)-.5)*.035;
 diffuseColor.rgb *= 1.0 + tissueTone;
}`);
 };
 material.customProgramCacheKey=()=>APPEARANCE_VERSION;
}

export function applyAppearance(material,mode,entry){
 const enabled=mode==='anatomical';
 if(material.userData.tissueMix)material.userData.tissueMix.value=enabled?1:0;
 material.roughness=enabled?.72:.78;
 material.metalness=enabled?0:.06;
 if(enabled){
  material.color.set(entry.atlas==='surface'?'#d9c3b5':entry.category==='cerebellum'?'#cdb6ad':'#c7b5ab');
  material.emissive.set('#000000');material.emissiveIntensity=0;
 }
}
