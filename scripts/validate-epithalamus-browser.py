"""Real WebGL regression for the new source, midline anatomy and appearance.

Uses isolated browser storage and synthetic local service responses, never Kimi.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import os
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

def state(page):
    return page.evaluate('() => window.brainAtlas.getRenderState()')

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            context=browser.new_context(viewport={'width':1440,'height':1000})
            context.route('**/favicon.ico',lambda route:route.fulfill(status=204,body=''))
            page=context.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
            page.goto(url)
            count=sum(e['atlas']!='surface' for e in json.loads((ROOT/'anatomy/data/manifest.json').read_text())['entries'])
            expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000)
            assert state(page)['mode']=='transparent'
            page.locator('#opacity3').evaluate("el => {el.value='37';el.dispatchEvent(new Event('input',{bubbles:true}));}")
            page.locator('#search3').fill('松果体')
            page.locator('#regionItems [data-group="pineal_gland"]').click()
            expect(page.locator('#atlasSelect')).to_have_value('allen2020')
            expect(page.locator('#detail3 h2')).to_have_text('松果体')
            page.locator('#anatomicalMode').click()
            page.wait_for_timeout(200)  # Allow the next render frame, including shader compilation.
            s=state(page)
            assert s['mode']=='anatomical' and s['isolated'] and not s['visibleShells']
            assert [m['id'] for m in s['visibleModels']]==['allen2020-M-10460']
            assert all(m['appearanceMix']==1 and m['opacity']==1 and not m['transparent'] for m in s['visibleModels'])
            expect(page.locator('#visibilityNote')).to_contain_text('模拟')
            page.locator('#clipAxis').select_option('x')
            page.locator('#clipAxis').select_option('none')
            artifacts=Path(os.environ.get('BRAIN_ATLAS_ARTIFACT_DIR','/tmp/brain-atlas-browser-artifacts'));artifacts.mkdir(parents=True,exist_ok=True)
            page.screenshot(path=str(artifacts/'pineal-appearance.png'))
            page.locator('#detail3 .detail-path [data-group="epithalamus"]').click()
            s=state(page);assert sorted(m['id'] for m in s['visibleModels'])==['allen2020-M-10460','cit-25','cit-26']
            expect(page.locator('#geometryCoverageNote')).to_contain_text('部分模型')
            page.screenshot(path=str(artifacts/'epithalamus.png'))
            page.locator('#search3').fill('LHb')
            page.locator('#regionItems [data-group="lateral_habenula"]').click()
            assert state(page)['visibleModels']==[]
            expect(page.locator('#detail3')).to_contain_text('暂无模型')
            page.locator('#anatomicalMode').click()
            assert state(page)['mode']=='transparent';expect(page.locator('#opacity3')).to_have_value('37')
            page.locator('#search3').fill('Hb')
            page.locator('#regionItems [data-id="cit-25"]').click()
            expect(page.locator('#detail3 .direct-parent')).to_contain_text('缰核复合体')
            page.locator('#markLearned').click()
            page.locator('#anatomicalMode').click();page.locator('#showWholeBrain').click()
            assert not state(page)['isolated'] and state(page)['visibleShells']
            page.reload();expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000)
            assert state(page)['mode']=='transparent'
            assert 'cit-25' in page.evaluate('() => window.brainAtlas.getKnown()')
            page.set_viewport_size({'width':390,'height':844})
            expect(page.locator('#anatomicalMode')).to_be_visible()
            bounds=page.locator('.render-mode-controls').bounding_box();assert bounds['x']>=0 and bounds['x']+bounds['width']<=390
            # A stale worker is rejected before sending a paper, with input retained.
            calls=[]
            context.route('https://atlas-test.invalid/health',lambda route:route.fulfill(headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'},json={'ok':True,'model':'test-model','capabilities':['atlas-candidate-v2','atlas-evidence-v1']}))
            context.route('https://atlas-test.invalid/analyze',lambda route:(calls.append('analyze'),route.abort()))
            page.set_viewport_size({'width':1440,'height':1000})
            page.goto(url+'papers.html')
            page.evaluate("() => {localStorage.setItem('brain-atlas-service-v1','https://atlas-test.invalid');sessionStorage.setItem('brain-atlas-access-v1','test-only-not-a-real-secret');}")
            page.reload();page.locator('#uploadBtn').click()
            text='TEST ONLY: A sufficiently long synthetic structural MRI paper. '*10
            page.locator('#paperText').fill(text);page.locator('#analyzeBtn').click()
            expect(page.locator('#uploadStatus')).to_contain_text('当前论文尚未发送',timeout=30000)
            expect(page.locator('#paperText')).to_have_value(text);assert calls==[]
            assert not errors,errors
            context.close();browser.close()
            print('Epithalamus browser checks passed: pineal/source switching, actual shaders, epithalamus partial coverage, missing-subnucleus negatives, clip/reversal, learned-ID reload, mobile layout, stale-worker preflight.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':run()
