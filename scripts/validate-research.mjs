import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateAnalysis,themeList,quoteCheck} from '../research/schema.js';
import {createPaper,suggestMapping,resolveMapping,evidenceScene,mechanismRows,validateBackup} from '../research/model.js';
import {buildEvidenceLayer} from '../anatomy/evidence-layer.js';
import worker from '../services/kimi-worker.js';

const root=new URL('../',import.meta.url),entries=JSON.parse(fs.readFileSync(new URL('anatomy/data/manifest.json',root))).entries.filter(e=>e.atlas!=='surface');
// Synthetic test-only evidence; no example research is shipped into the user's library.
const fixture={title:'TEST ONLY: paper A',authors:'Test',year:'2026',species:'人类',themes:['NDE','濒死体验'],regions:[{id:'r1',name:'CA1',hemisphere:'L',species:'人类',level:'region'},{id:'r2',name:'CA3',hemisphere:'R',species:'人类',level:'region'}],mechanisms:[{id:'m1',title:'TEST mechanism',claim:'Synthetic relationship',evidenceType:'association',origin:'study',regions:['r1','r2'],connections:[{from:'r1',to:'r2',directed:true}],quote:'Synthetic relationship'}]};
const analysis=validateAnalysis(fixture);assert.equal(analysis.mechanisms[0].connections[0].directed,false);
assert.deepEqual(themeList(['NDE','near-death experience','濒死体验']),['濒死体验']);
assert.equal(quoteCheck('a  b','A\nb'),'matched');assert.equal(quoteCheck('unseen','paper'),'unmatched');
const paper=createPaper(analysis,entries,{source:'Synthetic relationship'});assert(paper.mappings.r1);assert.equal(resolveMapping(paper.data.regions[0],paper.mappings.r1,entries).length,1);
for(const r of [{...analysis.regions[0],species:'小鼠'},{...analysis.regions[0],level:'neuron'},{...analysis.regions[0],hemisphere:'unknown'}])assert.equal(suggestMapping(r,entries),null);
const p2=createPaper({...analysis,title:'TEST ONLY: paper B'},entries),rows=mechanismRows([paper,p2]);
const spec=evidenceScene(rows,entries);assert.equal(spec.nodes.length,4);assert.equal(spec.links.length,2);assert.notEqual(spec.links[0].from,spec.links[1].from,'Do not join paths from different papers');
assert.equal(evidenceScene(rows,entries,{confirmedOnly:true}).nodes.length,0);
paper.mappings.r1.confirmed=true;assert.equal(evidenceScene(rows,entries,{confirmedOnly:true}).nodes.length,1);
const layer=buildEvidenceLayer(spec,entries);assert.equal(layer.group.children.length,2);assert(layer.ids.size===2);layer.dispose();
const backed=validateBackup({version:1,themes:['濒死体验'],papers:[paper,p2]},entries);assert.equal(backed.papers.length,2);assert.equal(backed.papers[0].mappings.r1.confirmed,true);
assert.throws(()=>validateAnalysis({...fixture,mechanisms:[{...fixture.mechanisms[0],connections:[{from:'r1',to:'missing'}]}]}));
assert.throws(()=>validateAnalysis({...fixture,regions:[{...fixture.regions[0],id:'constructor'}]}));

const env={MOONSHOT_API_KEY:'test-key-not-real',ACCESS_TOKEN:'test-access-not-real-123456789',ALLOWED_ORIGIN:'https://tonyautumn.github.io'};
const headers={Origin:env.ALLOWED_ORIGIN,Authorization:'Bearer '+env.ACCESS_TOKEN};
let calls=[],failChat=false,truncate=false,invalid=false,redirectStatus=0;
const realFetch=globalThis.fetch;
globalThis.fetch=async(url,options={})=>{
 calls.push({url,options});assert.equal(options.headers.Authorization,'Bearer test-key-not-real');
 assert.equal(options.redirect,'manual','Workers requests must handle redirects without forwarding credentials');
 if(redirectStatus)return new Response(null,{status:redirectStatus,headers:{Location:'https://redirect-target.invalid/collect'}});
 if(url.endsWith('/models'))return Response.json({data:[{id:'kimi-k2.6'}]});
 if(url.endsWith('/files')&&options.method==='POST')return Response.json({id:'test_file'});
 if(url.endsWith('/files/test_file/content'))return new Response('Synthetic relationship. '.repeat(10));
 if(url.endsWith('/files/test_file')&&options.method==='DELETE')return Response.json({deleted:true});
 if(url.endsWith('/chat/completions')){
  if(failChat)return new Response('{}',{status:429});
  const body=JSON.parse(options.body);assert.equal(body.model,'kimi-k2.6');assert.equal(body.messages[0].role,'system');assert.equal(body.messages[1].role,'user');assert.equal(body.response_format.type,'json_object');assert(!body.tools);
  return Response.json({model:'kimi-k2.6',choices:[{finish_reason:truncate?'length':'stop',message:{content:invalid?'not JSON':JSON.stringify(fixture)}}],usage:{total_tokens:123}});
 }
 throw Error('Unexpected endpoint: '+url);
};
try{
 assert.equal((await worker.fetch(new Request('https://test/health',{headers:{Origin:env.ALLOWED_ORIGIN}}),env)).status,401);
 assert.equal((await worker.fetch(new Request('https://test/health',{headers:{...headers,Origin:'https://other.invalid'}}),env)).status,403);
 assert.equal((await worker.fetch(new Request('https://test/health',{headers}),{})).status,503);
 assert.equal(calls.length,0,'Unauthorized/unconfigured calls must not contact Kimi');
 assert.equal((await(await worker.fetch(new Request('https://test/health',{headers}),env)).json()).ok,true);
 for(const status of [301,302,303,307,308]){
  calls=[];redirectStatus=status;
  const response=await worker.fetch(new Request('https://test/health',{headers}),env);
  assert.equal(response.status,502);assert.match((await response.json()).error,/重定向/);
  assert.equal(calls.length,1,'Do not follow Location or retry a redirected authenticated request');
  assert.equal(calls[0].url,'https://api.moonshot.cn/v1/models');
 }
 redirectStatus=0;calls=[];
 async function request(file=true){const form=new FormData();if(file)form.append('file',new Blob(['%PDF synthetic fixture'],{type:'application/pdf'}),'test.pdf');else form.append('text','Synthetic relationship. '.repeat(10));form.append('chosenTheme','濒死体验');const waits=[];const response=await worker.fetch(new Request('https://test/analyze',{method:'POST',headers,body:form}),env,{waitUntil:p=>waits.push(p)});const events=(await response.text()).trim().split('\n').map(s=>JSON.parse(s));await Promise.all(waits);return events;}
 let events=await request();assert.equal(events.at(-1).type,'result');assert.equal(events.at(-1).analysis.title,fixture.title);assert(events.some(e=>e.stage==='extract'));assert(calls.some(c=>c.options.method==='DELETE'));
 calls=[];failChat=true;events=await request();assert.equal(events.at(-1).type,'error');assert(!events.some(e=>e.type==='result'));assert(calls.some(c=>c.options.method==='DELETE'),'Clean up only the file uploaded by this request, even on failure');
 failChat=false;truncate=true;events=await request(false);assert.equal(events.at(-1).type,'error');truncate=false;invalid=true;events=await request(false);assert.equal(events.at(-1).type,'error');
}finally{globalThis.fetch=realFetch;}

// Static source checks, not browser/DOM interaction tests.
const html=fs.readFileSync(new URL('papers.html',root),'utf8'),app=fs.readFileSync(new URL('research/app.js',root),'utf8');
for(const [,id]of app.matchAll(/\$\('([^']+)'\)/g))assert((html+app).includes(`id="${id}"`),`Missing control: ${id}`);
for(const file of ['papers.html','research/app.js','research/model.js','research/schema.js','research/store.js','anatomy/evidence-layer.js']){
 const source=fs.readFileSync(new URL(file,root),'utf8');const refs=file.endsWith('.html')?[...source.matchAll(/(?:src|href)="([^"#]+)"/g)]:[...source.matchAll(/from ['"]([^'"]+)['"]/g)];
 for(const [,ref]of refs){if(/^(https?:|data:)/.test(ref))continue;assert(fs.existsSync(new URL(ref,new URL(file,root))),`Missing asset: ${ref}`);}
}
console.log('Research checks passed: topic aliases, provenance isolation, conservative atlas mapping, backup validation, schematic geometry, authenticated Kimi protocol, cleanup and failure handling. Kimi responses were mocked; no paid or browser calls were made.');
