"""Real renderer checks in disposable browser storage. No Kimi or user data."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

def snapshot(page):
    return page.evaluate('() => window.brainAtlas.getRenderState()')

def assert_opaque(items):
    assert items, 'Expected actual loaded geometry'
    assert all(m['opacity']==1 and m['transparent'] is False and m['depthWrite'] and m['depthTest'] for m in items), items

def search_open(page,query,selector):
    page.locator('#search3').fill(query)
    page.locator('#regionItems '+selector).click()

def run():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            context=browser.new_context(viewport={'width':1440,'height':1000})
            page=context.new_page(); errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(url)
            page.wait_for_function('() => window.atlasReady === true',timeout=60000)
            count=sum(e['atlas']!='surface' for e in json.loads((ROOT/'anatomy/data/manifest.json').read_text())['entries'])
            expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=60000)
            original=snapshot(page)
            assert original['mode']=='transparent' and not original['isolated']
            assert all(m['transparent'] and m['opacity']<1 for m in original['visibleModels'])
            assert len(original['visibleShells'])==2
            page.locator('#opacity3').evaluate("el => {el.value='37';el.dispatchEvent(new Event('input',{bubbles:true}));}")
            page.evaluate("() => localStorage.setItem('render-test-preserved','keep')")
            page.locator('#solidMode').click()
            expect(page.locator('#solidMode')).to_have_attribute('aria-pressed','true')
            assert_opaque(snapshot(page)['visibleModels']);assert_opaque(snapshot(page)['visibleShells'])
            expect(page.locator('#opacity3')).to_have_value('37');expect(page.locator('#opacity3')).to_be_disabled()
            search_open(page,'VTA','[data-id="cit-21"]')
            expect(page.locator('#isolate3')).to_be_checked()
            s=snapshot(page);assert s['isolated'] and not s['visibleShells']
            assert [m['id'] for m in s['visibleModels']]==['cit-21'];assert_opaque(s['visibleModels'])
            page.locator('#solidMode').click()
            s=snapshot(page);assert s['selected']=='cit-21' and not s['isolated']
            assert len(s['visibleModels'])==2 and len(s['visibleShells'])==2
            assert all(m['transparent'] and m['opacity']==.37 for m in s['visibleShells'])
            # Explicit manual isolation survives a round trip between surface modes.
            page.locator('#isolate3').check();page.locator('#solidMode').click();page.locator('#solidMode').click()
            assert snapshot(page)['isolated'];assert not snapshot(page)['visibleShells']
            page.locator('#isolate3').uncheck()
            page.locator('#solidMode').click();page.locator('#showWholeBrain').click()
            s=snapshot(page);assert s['mode']=='solid' and s['selected'] is None and s['group']=='all' and not s['isolated']
            assert len(s['visibleShells'])==2;assert_opaque(s['visibleShells'])
            # Concepts automatically isolate all their available parcels, not an arbitrary side.
            search_open(page,'VTA','[data-group="ventral_tegmental"]')
            s=snapshot(page);assert sorted(m['id'] for m in s['visibleModels'])==['cit-21','cit-22'];assert not s['visibleShells']
            assert_opaque(s['visibleModels'])
            # Exercise the actual canvas pointer route while an opaque group is visible.
            box=page.locator('#brainCanvas').bounding_box()
            for y in [.5,.45,.55,.4,.6]:
                for x in [.5,.45,.55,.4,.6]:
                    page.mouse.click(box['x']+box['width']*x,box['y']+box['height']*y)
                    if snapshot(page)['selected']: break
                if snapshot(page)['selected']: break
            s=snapshot(page);assert s['selected'] in ['cit-21','cit-22'], 'Canvas pick must select a visible VTA mesh'
            assert len(s['visibleModels'])==1 and not s['visibleShells'];assert_opaque(s['visibleModels'])
            page.locator('#detail3 .detail-path [data-group="midbrain_tegmentum"]').click()
            s=snapshot(page);assert s['selected'] is None and s['group']=='midbrain_tegmentum' and s['isolated'];assert not s['visibleShells']
            assert_opaque(s['visibleModels'])
            page.locator('#regionColors').check();assert_opaque(snapshot(page)['visibleModels'])
            # Empty concepts must not leave the previously selected solid model on screen.
            search_open(page,'tectum','[data-group="tectum"]')
            s=snapshot(page);assert s['visibleModels']==[] and not s['isolated']
            expect(page.locator('#focusGroup')).to_be_disabled();expect(page.locator('#geometryCoverageNote')).to_be_visible()
            page.locator('#showWholeBrain').click()
            # Opaque mode hides the shell, but preserves the complete evidence set and its links.
            page.evaluate("() => window.brainAtlas.showEvidence({nodes:[{id:'a',entryIds:['cit-21']},{id:'b',entryIds:['cit-22']}],links:[{from:'a',to:'b',kind:'association'}]})")
            s=snapshot(page);assert not s['visibleShells'] and len(s['visibleModels'])==2;assert_opaque(s['visibleModels'])
            page.evaluate("() => window.brainAtlas.select('cit-21')")
            s=snapshot(page);assert [m['id'] for m in s['visibleModels']]==['cit-21'] and not s['visibleShells']
            # Reset is an escape route without silently changing the chosen surface mode.
            page.locator('#resetView').click()
            s=snapshot(page);assert s['mode']=='solid' and not s['isolated'] and s['selected'] is None
            expect(page.locator('#clipAxis')).to_have_value('none')
            page.locator('#solidMode').focus();page.locator('#solidMode').press('Space')
            expect(page.locator('#solidMode')).to_have_attribute('aria-pressed','false')
            assert page.evaluate("() => localStorage.getItem('render-test-preserved')")=='keep'
            # Both new controls fit on a narrow screen and remain actionable.
            page.set_viewport_size({'width':390,'height':844})
            expect(page.locator('#solidMode')).to_be_visible();expect(page.locator('#showWholeBrain')).to_be_visible()
            page.locator('#solidMode').click();page.locator('#showWholeBrain').click()
            rect=page.locator('.render-mode-controls').bounding_box();assert rect['x']>=0 and rect['x']+rect['width']<=390
            assert not errors,errors
            context.close()
            fallback=browser.new_context(viewport={'width':1024,'height':900})
            fallback.add_init_script("const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/i.test(t)?null:orig.call(this,t,...a);}")
            page=fallback.new_page();page.goto(url);page.wait_for_function('() => window.catalogReady === true')
            expect(page.locator('#solidMode')).to_be_disabled()
            search_open(page,'LC','[data-group="locus_coeruleus"]')
            expect(page.locator('#detail3 h2')).to_have_text('蓝斑')
            page.locator('#showWholeBrain').click();assert snapshot(page)['group']=='all'
            fallback.close();browser.close()
            print('Opaque browser checks passed: real material opacity/pass/depth, search and canvas selection, automatic parcel/group isolation, reversible transparency, full-brain/reset, evidence preservation, mobile controls and no-WebGL fallback.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':run()
