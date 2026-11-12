"""Verify brief knowledge during real selections, including notes and mobile.

Disposable storage only; no model service, user notes, or credentials are used.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json, os
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def check(page,key):
    card=page.locator('#regionKnowledge')
    expect(card).to_have_count(1)
    expect(card).to_have_attribute('data-knowledge',key)
    expect(card.locator('.knowledge-summary')).to_be_visible()
    assert not card.locator('details').evaluate('el=>el.open')
    assert page.locator('#detail3').evaluate('el=>el.scrollTop')==0
    assert page.evaluate("""() => {
      const card=document.querySelector('#regionKnowledge');
      const meta=document.querySelector('#detail3 .latin3');
      return card.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_FOLLOWING;
    }""")

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    entries=json.loads((ROOT/'anatomy/data/manifest.json').read_text())['entries']
    count=sum(e['atlas']!='surface' for e in entries)
    artifacts=Path(os.environ.get('BRAIN_ATLAS_ARTIFACT_DIR','/tmp/brain-atlas-browser-artifacts'))
    artifacts.mkdir(parents=True,exist_ok=True)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            context=browser.new_context(viewport={'width':1440,'height':1000})
            context.route('**/favicon.ico',lambda r:r.fulfill(status=204,body=''))
            page=context.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(url+'?structure=parcel:julich-L-146')
            expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000)
            check(page,'ca1')
            page.wait_for_function('window.notesIntegrationReady')
            expect(page.locator('#structureNotes')).to_have_count(1)
            # Reading a source changes no learning or selection state.
            before=page.evaluate('() => [window.brainAtlas.getSelections(),window.brainAtlas.getKnown()]')
            page.locator('.knowledge-sources summary').click()
            expect(page.locator('.knowledge-sources a').first).to_be_visible()
            assert page.evaluate('() => [window.brainAtlas.getSelections(),window.brainAtlas.getKnown()]')==before
            page.locator('.knowledge-sources summary').click()
            page.screenshot(path=str(artifacts/'knowledge-ca1-desktop.png'))
            # A new inspection must return to the introduction after long notes.
            page.locator('#detail3').evaluate('el=>el.scrollTop=el.scrollHeight')
            page.locator('#search3').fill('CM')
            page.locator('#regionItems [data-id="julich-L-141"]').click()
            check(page,'centromedial')
            page.locator('#search3').fill('CM')
            page.locator('#regionItems [data-id="julich-L-131"]').click()
            check(page,'cmThalamus')
            assert len(page.evaluate('window.brainAtlas.getSelections()'))==3
            page.evaluate("window.brainAtlas.selectGroup('superior_colliculus')")
            check(page,'superiorColliculus')
            expect(page.locator('#detail3')).to_contain_text('暂无模型')
            expect(page.locator('#structureNotes')).to_have_count(1)
            page.locator('#detail3 .direct-parent [data-group="tectum"]').click()
            check(page,'tectum')
            # Network and parcel summaries are also directly in the anatomy view.
            page.locator('#networkSelect').select_option('DMN')
            check(page,'Default')
            selected=page.evaluate('window.brainAtlas.getSelections()')
            assert len(selected)==49 and 'julich-L-146' in selected
            member=next(id for id in selected if id.startswith('schaefer200-'))
            page.locator('#detail3 [data-id="'+member+'"]').click()
            expect(page.locator('#regionKnowledge')).to_have_count(1)
            expect(page.locator('.knowledge-hint')).to_contain_text('专属作用')
            assert page.evaluate('window.brainAtlas.getSelections()')==selected
            expect(page.locator('#structureNotes')).to_have_count(0)
            for preset in ['POC','SOC']:
                page.locator('#networkSelect').select_option(preset)
                check(page,preset)
            # The compact description and its source toggle fit the mobile panel.
            page.set_viewport_size({'width':390,'height':844})
            page.evaluate("window.brainAtlas.select('julich-L-146')")
            page.evaluate('window.scrollTo(0,0)')
            check(page,'ca1')
            expect(page.locator('#detail3')).to_be_visible()
            card=page.locator('#regionKnowledge').bounding_box()
            panel=page.locator('#detail3').bounding_box()
            assert 0<=card['x'] and card['x']+card['width']<=390
            assert card['y']>=panel['y'] and card['y']+card['height']<=panel['y']+panel['height']
            assert page.locator('#detail3').evaluate('el=>el.scrollWidth<=el.clientWidth')
            page.screenshot(path=str(artifacts/'knowledge-ca1-mobile.png'))
            page.reload();page.wait_for_function('window.atlasReady === true',timeout=90000)
            assert set(selected).issubset(page.evaluate('window.brainAtlas.getSelections()'))
            assert page.evaluate('window.brainAtlas.getKnown()')==before[1]
            assert not errors,errors
            # Knowledge remains useful if the device cannot create WebGL.
            fallback=browser.new_context(viewport={'width':1440,'height':1000})
            fallback.add_init_script("const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:old.call(this,t,...a)};")
            plain=fallback.new_page();plain.goto(url+'?structure=parcel:julich-L-44')
            plain.wait_for_function("window.notesIntegrationReady && window.brainAtlas.getSelection()==='julich-L-44'",timeout=30000)
            check(plain,'ca2')
            expect(plain.locator('.knowledge-summary')).to_contain_text('小鼠')
            fallback.close();context.close();browser.close()
            print('Knowledge browser checks passed: quick entry/group/network/circuit summaries, source folding, scroll reset, same-name negatives, notes integration, preserved multiselection/learning, mobile first-view fit and no-WebGL fallback.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':run()
