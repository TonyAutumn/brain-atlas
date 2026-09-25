"""Real browser tests for geometry associations, without user data or provider calls."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import json
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

def run():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
            context = browser.new_context(viewport={'width':1440,'height':1000})
            page = context.new_page()
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(url,wait_until='domcontentloaded')
            page.wait_for_function('window.catalogReady === true')
            count=sum(e['atlas']!='surface' for e in json.loads((ROOT/'anatomy/data/manifest.json').read_text())['entries'])
            expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=60000)
            assert page.evaluate('window.atlasReady === true')
            page.locator('#search3').fill('tegmentum')
            expect(page.locator('#regionItems .concept-item[data-group="tegmentum"]')).to_contain_text('部分模型')
            page.locator('#regionItems .concept-item[data-group="tegmentum"]').click()
            page.wait_for_function("window.brainAtlas.getVisibleModelIds().length === 6")
            expect(page.locator('#atlasSelect')).to_have_value('cit168')
            expect(page.locator('#detail3 .atlas-badge')).to_have_text('部分模型')
            expect(page.locator('#geometryCoverageNote')).to_contain_text('脑桥被盖目前没有模型')
            expected_tegmentum=['cit-15','cit-16','cit-19','cit-20','cit-21','cit-22']
            assert sorted(page.evaluate('window.brainAtlas.getVisibleModelIds()'))==expected_tegmentum
            expect(page.locator('#focusGroup')).to_be_enabled()
            page.locator('#focusGroup').click()
            page.locator('#isolate3').check()
            assert sorted(page.evaluate('window.brainAtlas.getVisibleModelIds()'))==expected_tegmentum
            expect(page.locator('#visibilityNote')).to_contain_text('非完整结构边界')
            page.locator('#linkedModelDetails summary').click()
            expect(page.locator('#linkedModelDetails [data-id]')).to_have_count(10)
            page.locator('#linkedModelDetails [data-id="julich-L-18"]').click()
            expect(page.locator('#atlasSelect')).to_have_value('julich')
            assert page.evaluate('window.brainAtlas.getSelection()')=='julich-L-18'
            assert page.evaluate("window.brainAtlas.getEntry('julich-L-18').nav")=='red_nucleus'
            page.locator('#search3').fill('cerebral peduncle')
            page.locator('#regionItems .concept-item[data-group="cerebral_peduncle"]').click()
            page.wait_for_function('window.brainAtlas.getVisibleModelIds().length === 10')
            expect(page.locator('#detail3 .atlas-badge')).to_have_text('部分模型')
            expect(page.locator('#geometryCoverageNote')).to_contain_text('广义大脑脚')
            expect(page.locator('#geometryCoverageNote')).to_contain_text('脚底仍无模型')
            expected_peduncle=expected_tegmentum+['cit-13','cit-14','cit-17','cit-18']
            assert sorted(page.evaluate('window.brainAtlas.getVisibleModelIds()'))==sorted(expected_peduncle)
            assert len(page.evaluate("window.brainAtlas.getModelCoverage('cerebral_peduncle').entryIds"))==18
            page.locator('#isolate3').check()
            assert sorted(page.evaluate('window.brainAtlas.getVisibleModelIds()'))==sorted(expected_peduncle)
            page.locator('#detail3 .structure-link[data-group="crus_cerebri"]').click()
            expect(page.locator('#detail3 h2')).to_have_text('大脑脚底')
            expect(page.locator('#focusGroup')).to_be_disabled()
            expect(page.locator('#isolate3')).to_be_disabled()
            assert page.evaluate('window.brainAtlas.getVisibleModelIds()')==[]
            page.locator('#detail3 .direct-parent [data-group="cerebral_peduncle"]').click()
            expect(page.locator('#detail3 h2')).to_have_text('大脑脚')
            page.wait_for_function('window.brainAtlas.getVisibleModelIds().length === 10')
            for name in ['dorsal_raphe','locus_coeruleus','tectum','amygdala_corticomedial','pontomesencephalic']:
                page.evaluate('(id)=>window.brainAtlas.selectGroup(id)',name)
                assert page.evaluate('window.brainAtlas.getVisibleModelIds()')==[],name
                expect(page.locator('#focusGroup')).to_be_disabled()
                expect(page.locator('#linkedModelDetails')).to_have_count(0)
            assert not errors,errors
            context.close()
            fallback=browser.new_context(viewport={'width':1024,'height':900})
            fallback.add_init_script("const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};")
            page=fallback.new_page()
            page.goto(url)
            page.wait_for_function('window.catalogReady === true')
            page.evaluate("window.brainAtlas.selectGroup('tegmentum')")
            expect(page.locator('#detail3 .atlas-badge')).to_have_text('部分模型')
            expect(page.locator('#focusGroup')).to_be_disabled()
            assert len(page.evaluate("window.brainAtlas.getModelCoverage('tegmentum').entryIds"))==10
            page.locator('#linkedModelDetails summary').click()
            page.locator('#linkedModelDetails [data-id="cit-21"]').click()
            expect(page.locator('#detail3 h2')).to_contain_text('VTA')
            fallback.close()
            # Metadata stays available if actual model downloads fail; no made-up geometry appears.
            failed=browser.new_context(viewport={'width':1440,'height':1000})
            failed.route('**/data/cit168-*-midbrain-0.bin.gz',lambda route:route.abort())
            page=failed.new_page()
            page.goto(url)
            page.wait_for_function('window.catalogReady === true')
            page.wait_for_function("document.getElementById('modelStatus').textContent.includes('组模型未加载')",timeout=60000)
            page.evaluate("window.brainAtlas.selectGroup('tegmentum')")
            assert page.evaluate('window.brainAtlas.getVisibleModelIds()')==[]
            expect(page.locator('#toast3')).to_contain_text('部分模型未加载')
            assert len(page.evaluate("window.brainAtlas.getModelCoverage('tegmentum').entryIds"))==10
            failed.close()
            browser.close()
            print('Geometry browser checks passed: real visible mesh IDs, partial coverage, auto source, focus/isolation, cross-atlas links, upward navigation, negative controls, no-WebGL fallback and failed downloads.')
    finally:
        server.shutdown()
        server.server_close()

if __name__=='__main__':
    run()
