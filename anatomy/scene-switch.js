// Prepare offscreen; only the latest successful request may replace the view.
export function createSceneSwitch({prepare,install,discard}){
 let revision=0;
 return {
  cancel(){revision++;},
  async show(spec,options={}){
   const request=++revision;let next;
   try{next=await prepare(spec);}catch(error){if(request!==revision)return {stale:true};throw error;}
   if(request!==revision){discard(next);return {stale:true};}
   return install(next,spec,options);
  }
 };
}
