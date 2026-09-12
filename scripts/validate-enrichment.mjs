import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lookupRegion,atlasPoint} from '../services/enrichment-core.js';
import worker from '../services/kimi-worker.js';
import {cleanEnrichment} from '../research/enrichment-schema.js';
import {applyEnrichment,enrichmentPoints,reuseKnownMappings} from '../research/enrichment.js';
import {createPaper,validateBackup} from '../research/model.js';
import {buildEvidenceLayer} from '../anatomy/evidence-layer.js';
import {readLookupStream} from '../research/lookup-client.js';
const entries=JSON.parse(fs.readFileSync(new URL('../anatomy/data/manifest.json',import.meta.url))).entries.filter(e=>e.atlas!=='surface');
const region={id:'r1',name:'Synthetic hippocampal alias',species:'人类',level:'region',hemisphere:'both'};
const space='minds/core/referencespace/v1.0.0/dafcffc5-4826-4bf1-8ff6-46b8a31ff8e2';
const detail={name:'hippocampus',versionIdentifier:'Synthetic atlas reference',hasAnnotation:{bestViewPoint:{coordinateSpace:{'@id':space},coordinates:[{value:24},{value:-18},{value:-20}]}}};
const originalFetch=globalThis.fetch;let calls=[],badQuote=false,failPublic=false;
globalThis.fetch=async(url,options={})=>{
 const u=new URL(url);calls.push({u,options});assert.equal(options.redirect,'manual');
 if(u.hostname==='api.moonshot.cn'){
  assert(options.headers.Authorization);if(u.pathname.endsWith('/models'))return Response.json({data:[{id:'kimi-k2.6'}]});
  const body=JSON.parse(options.body);assert(!body.tools);return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({sourceId:'term0',quote:badQuote?'A fabricated quotation never returned by sources.':'Synthetic human hippocampal terminology for testing.',summary:'Synthetic test only',parentName:'',parentSpecies:'human',position:[100,100,100]})}}]});
 }
 assert.equal(options.headers.Authorization,undefined,'Never send Kimi credentials to public sources');
 if(failPublic)return new Response('{}',{status:503});
 if(u.pathname.endsWith('/api/search'))return Response.json({response:{docs:[{label:'hippocampus',description:['Synthetic human hippocampal terminology for testing.'],exact_synonyms:[region.name]}]}});
 if(u.pathname.includes('/rest/search'))return Response.json({resultList:{result:[{source:'MED',id:'123',title:'Synthetic study',abstractText:'Test only.'}]}});
 if(u.pathname.endsWith('/regions'))return Response.json({items:[{name:'hippocampus'}]});
 if(u.pathname.includes('/regions/'))return Response.json(detail);
 throw Error('Unexpected request '+url);
};
try{
 const lookup=await lookupRegion(region,new AbortController().signal);assert.equal(lookup.canonicalName,'hippocampus');assert.equal(lookup.points.length,1);
 assert.equal(atlasPoint({...detail,hasAnnotation:{bestViewPoint:{...detail.hasAnnotation.bestViewPoint,coordinateSpace:{'@id':'mouse'}}}},'atlas0'),null);
 const paper=createPaper({title:'Synthetic',regions:[region],mechanisms:[]},entries);assert.equal(paper.mappings.r1,null);
 const updated=applyEnrichment(paper,'r1',lookup,entries);assert.equal(updated.mappings.r1.target,'group:hippocampus');assert.equal(paper.mappings.r1,null);assert.equal(updated.mappings.r1.confirmed,false);
 const backed=validateBackup({version:1,papers:[updated],themes:[]},entries);assert.equal(backed.papers[0].enrichments.r1.sources.length,3);
 const reused=reuseKnownMappings(paper,[updated],entries);assert.equal(reused.mappings.r1.target,'group:hippocampus');assert.equal(reused.enrichments.r1.points.length,0);
 const rejected=cleanEnrichment({...lookup,points:[{...lookup.points[0],space:'Talairach'}],review:{sourceId:'term0',quote:'invented'}});assert.equal(rejected.points.length,0);assert.equal(rejected.review,null);
 const cell={...region,name:'Synthetic human cell',level:'celltype'};
 const quote='Human synthetic cells are described in hippocampus for this software test only.';
 const cellPaper=createPaper({title:'Cell test',regions:[cell],mechanisms:[]},entries);
 const withCell=applyEnrichment(cellPaper,'r1',{...lookup,review:{sourceId:'term0',quote,parentName:'hippocampus',parentSpecies:'human',summary:'test'},sources:[{id:'term0',type:'ontology',url:'https://www.ebi.ac.uk/ols4/api/search',title:'Test only',text:quote}]},entries);
 const points=enrichmentPoints(withCell,cell,entries);assert.equal(points.length,2);assert(points.every(p=>p.type==='cell-illustration'));
 assert.equal(enrichmentPoints(withCell,{...cell,species:'小鼠'},entries).length,0);
 const layer=buildEvidenceLayer({nodes:[],links:[],points},entries);assert.equal(layer.markers.length,2);assert(!layer.pointBounds.isEmpty());layer.dispose();
 const env={MOONSHOT_API_KEY:'fake-not-secret',ACCESS_TOKEN:'synthetic-access-token-123456',ALLOWED_ORIGIN:'https://tonyautumn.github.io'},headers={Origin:env.ALLOWED_ORIGIN,Authorization:'Bearer '+env.ACCESS_TOKEN};
 async function request(){const f=new FormData();f.append('regions',JSON.stringify([region]));const waits=[];const res=await worker.fetch(new Request('https://service/enrich',{method:'POST',headers,body:f}),env,{waitUntil:p=>waits.push(p)});const events=[];await readLookupStream(res,e=>events.push(e),new AbortController().signal);await Promise.all(waits);return events;}
 let events=await request();const item=events.find(e=>e.type==='item');assert(item.enrichment.review);assert.equal(item.enrichment.points[0].position[0],24,'Ignore model coordinate output');assert.equal(events.at(-1).type,'result');
 badQuote=true;events=await request();assert.equal(events.find(e=>e.type==='item').enrichment.review,null);assert.equal(events.find(e=>e.type==='item').enrichment.status,'partial');
 failPublic=true;const failed=await lookupRegion(region,new AbortController().signal);assert.equal(failed.status,'partial');assert.equal(failed.points.length,0);assert.equal(failed.sources.length,0);
 const before=calls.length;const denied=await worker.fetch(new Request('https://service/enrich',{method:'POST',headers:{Origin:env.ALLOWED_ORIGIN}}),env);assert.equal(denied.status,401);assert.equal(calls.length,before);
 await assert.rejects(()=>readLookupStream(new Response('{"type":"item"}\n',{headers:{'Content-Type':'application/x-ndjson'}}),()=>{},new AbortController().signal),/中断/);
 console.log('Enrichment passed: fixed-host credential isolation, source-checked review, space checks, no model coordinates, exact alias reuse, cell illustration restrictions, clickable marker geometry, backup roundtrip, authentication, streamed partial results and failures. Provider responses were mocked.');
}finally{globalThis.fetch=originalFetch;}
