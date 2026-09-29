"""Exercise cumulative manual selections with real WebGL and isolated storage."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json, os
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
KEY='brain-atlas-selected-regions-v1'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
def chosen(page):return page.evaluate('() => window.brainAtlas.getSelections()')
def view(page):return page.evaluate('() => window.brainAtlas.getRenderState()')
def visible(page):return sorted(m['id'] for m in view(page)['visibleModels'])
def select(page,query,id):
    page.locator('#search3').fill(query)
    page.locator(f'#regionItems [data-id="{id}"]').click()
def group(page,query,id):
    page.locator('#search3').fill(query)
    page.locator(f'#regionItems [data-group="{id}"]').click()

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    artifacts=Path(os.environ.get('BRAIN_ATLAS_ARTIFACT_DIR','/tmp/brain-atlas-browser-artifacts'));artifacts.mkdir(parents=True,exist_ok=True)
    count=sum(e['atlas']!='surface' for e in json.loads((ROOT/'anatomy/data/manifest.json').read_text())['entries'])
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            context=browser.new_context(viewport={'width':1440,'height':1000})
            context.route('**/favicon.ico',lambda r:r.fulfill(status=204,body=''))
            page=context.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
            page.goto(url)
            expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000)
            page.evaluate("() => {localStorage.setItem('multi-test-unrelated','keep');}")
            select(page,'PGa','julich-L-62');select(page,'p32','julich-L-90');select(page,'Hb','cit-25')
            expected=['julich-L-62','julich-L-90','cit-25']
            assert chosen(page)==expected
            expect(page.locator('#selectedItems li')).to_have_count(3)
            select(page,'Hb','cit-25');assert chosen(page)==expected
            assert set(expected).issubset(visible(page))
            assert all(m['colour']=='39b9ff' for m in view(page)['visibleModels'] if m['id'] in expected)
            page.locator('#isolateSelections').click();assert visible(page)==sorted(expected)
            page.locator('#atlasSelect').select_option('allen2020')
            page.locator('#hemiControls [data-hemi="R"]').click()
            assert chosen(page)==expected and visible(page)==sorted(expected)
            group(page,'LHb','lateral_habenula')
            expect(page.locator('#addGroupSelection')).to_be_disabled()
            assert chosen(page)==expected and visible(page)==sorted(expected)
            page.locator('#solidMode').click();assert visible(page)==sorted(expected)
            page.locator('#anatomicalMode').click();assert visible(page)==sorted(expected)
            assert all(m['appearanceMix']==1 and m['opacity']==1 for m in view(page)['visibleModels'])
            page.locator('#clipAxis').select_option('x');page.locator('#clipAxis').select_option('none')
            page.locator('[data-remove-selection="cit-25"]').click()
            expected=expected[:2];assert chosen(page)==expected and visible(page)==sorted(expected)
            page.reload();expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000)
            assert chosen(page)==expected
            page.locator('#showWholeBrain').click();assert chosen(page)==expected
            page.locator('#resetView').click();assert chosen(page)==expected
            expect(page.locator('#selectionCount')).to_have_text('已选 2 个模型')
            page.locator('#clearSelections').click();assert chosen(page)==[]
            group(page,'VTA','ventral_tegmental');page.locator('#addGroupSelection').click()
            assert sorted(chosen(page))==['cit-21','cit-22']
            page.locator('#addGroupSelection').click();assert len(chosen(page))==2
            page.locator('[data-remove-selection="cit-21"]').click();assert chosen(page)==['cit-22']
            # Preview a manually assembled cortical combination, not a network preset.
            page.locator('#clearSelections').click()
            for query,id in [('PGa','julich-L-62'),('PGa','julich-R-62'),('p32','julich-L-90'),('p32','julich-R-90')]:select(page,query,id)
            page.locator('#focusSelections').click();page.locator('#selectionPanel').scroll_into_view_if_needed()
            page.screenshot(path=str(artifacts/'multi-region-selection.png'))
            saved=chosen(page)
            page.set_viewport_size({'width':390,'height':844})
            page.locator('#selectionPanel').scroll_into_view_if_needed()
            rect=page.locator('#selectionPanel').bounding_box();assert rect['x']>=0 and rect['x']+rect['width']<=390
            expect(page.locator('[data-remove-selection="julich-L-62"]')).to_be_visible()
            page.screenshot(path=str(artifacts/'multi-region-mobile.png'))
            page.locator('[data-remove-selection="julich-L-62"]').click();assert len(chosen(page))==3
            assert page.evaluate("() => localStorage.getItem('multi-test-unrelated')")=='keep'
            # Manual atlas choices must never leak into a paper's evidence scene.
            saved=chosen(page);page.goto(url+'?embed=research')
            page.wait_for_function('window.atlasReady === true',timeout=60000)
            assert chosen(page)==[];expect(page.locator('#selectionPanel')).to_be_hidden()
            page.evaluate("() => window.brainAtlas.showEvidence({nodes:[{id:'a',entryIds:['cit-21']}],links:[]})")
            assert visible(page)==['cit-21']
            page.evaluate("() => window.brainAtlas.select('cit-21')")
            assert page.evaluate('(key) => JSON.parse(localStorage.getItem(key))',KEY)==saved
            assert not errors,errors
            context.close()
            fallback=browser.new_context(viewport={'width':1440,'height':1000})
            fallback.add_init_script("const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:orig.call(this,t,...a);};")
            page=fallback.new_page();page.goto(url);page.wait_for_function('window.catalogReady === true')
            select(page,'PGa','julich-L-62');select(page,'Hb','cit-25')
            assert len(chosen(page))==2;expect(page.locator('#focusSelections')).to_be_disabled()
            page.locator('[data-remove-selection="cit-25"]').click();assert chosen(page)==['julich-L-62']
            fallback.close();browser.close()
            print('Multi-selection browser checks passed: additive UI/cross-atlas display, filters and empty concepts, real materials, explicit removal, persistence, group add, mobile and evidence isolation.')
    finally:server.shutdown();server.server_close()
if __name__=='__main__':run()
