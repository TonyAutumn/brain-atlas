"""Integrated network selection, yellow WebGL materials, migration and evidence isolation."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json, os
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
OLD='brain-atlas-selected-regions-v1'
KEY='brain-atlas-selected-regions-v2'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
def view(page):return page.evaluate('() => window.brainAtlas.getRenderState()')
def chosen(page):return page.evaluate('() => window.brainAtlas.getSelections()')
def yellow(page,ids):
    models={m['id']:m for m in view(page)['visibleModels']}
    assert all(id in models and models[id]['colour']=='ffd34e' for id in ids),models

def run():
    entries=json.loads((ROOT/'anatomy/data/manifest.json').read_text())['entries']
    count=sum(e['atlas']!='surface' for e in entries)
    ids=[e['id'] for e in entries if e['atlas']=='julich' and any(e['name'].startswith('Area '+code+' (') for code in ['PGa','PGp'])]
    assert len(ids)==4,ids
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    artifacts=Path(os.environ.get('BRAIN_ATLAS_ARTIFACT_DIR','/tmp/brain-atlas-browser-artifacts'));artifacts.mkdir(parents=True,exist_ok=True)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            context=browser.new_context(viewport={'width':1440,'height':1000})
            context.route('**/favicon.ico',lambda r:r.fulfill(status=204,body=''))
            page=context.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(url);expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000)
            page.evaluate('(data)=>{localStorage.setItem(data.old,JSON.stringify(data.ids));localStorage.setItem("network-unrelated","keep");}',{'old':OLD,'ids':[ids[0],'cit-25']})
            page.reload();expect(page.locator('#networkSelect')).to_be_enabled()
            assert chosen(page)==[ids[0],'cit-25']
            expect(page.get_by_role('navigation',name='主导航').get_by_role('link',name='功能网络',exact=True)).to_have_count(0)
            page.locator('#networkSelect').select_option('DMN')
            expect(page.locator('#selectedItems li')).to_have_count(5)
            expect(page.locator('#selectedItems .network-selected')).to_have_count(4)
            expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000)
            yellow(page,ids)
            page.locator('#isolateSelections').click()
            assert set(m['id'] for m in view(page)['visibleModels'])==set(ids+['cit-25'])
            page.locator('#atlasSelect').select_option('allen2020');page.locator('#hemiControls [data-hemi="R"]').click();yellow(page,ids)
            page.locator('#regionColors').check();yellow(page,ids)
            page.locator('#solidMode').click();yellow(page,ids)
            page.locator('#anatomicalMode').click();yellow(page,ids)
            assert all(m['appearanceMix']==1 and m['opacity']==1 for m in view(page)['visibleModels'])
            page.locator('#selectedItems [data-inspect-selection="'+ids[1]+'"]').click();yellow(page,ids)
            page.locator('#selectedItems [data-remove-selection="'+ids[1]+'"]').click();assert ids[1] not in chosen(page)
            page.reload();expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000)
            assert ids[1] not in chosen(page);yellow(page,[i for i in ids if i!=ids[1]])
            page.locator('#networkSelect').select_option('DMN');yellow(page,ids)
            page.locator('[data-remove-network="DMN"]').click();assert chosen(page)==[ids[0],'cit-25']
            assert view(page)['networkIds']==[]
            page.locator('#networkSelect').select_option('DMN');page.locator('#showWholeBrain').click();page.locator('#resetView').click();yellow(page,ids)
            page.locator('#clearSelections').click();page.reload();expect(page.locator('#networkSelect')).to_be_enabled();assert chosen(page)==[]
            # Old links now enter the anatomy picker; consumed query parameters cannot re-add removed members.
            page.goto(url+'papers.html?record=network#recordPanel')
            page.wait_for_url(url+'*#selectionPanel');expect(page.locator('#selectionCount')).to_have_text('已选 4 个模型')
            assert 'network=' not in page.url and 'papers.html' not in page.url
            expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000);yellow(page,ids)
            page.locator('[data-remove-selection="'+ids[1]+'"]').click();page.reload();expect(page.locator('#networkSelect')).to_be_enabled();assert ids[1] not in chosen(page)
            page.locator('#networkSelect').select_option('DMN');page.locator('#search3').fill('p32');page.locator('#regionItems [data-id="julich-L-90"]').click()
            page.locator('#focusSelections').click();page.locator('#selectionPanel').scroll_into_view_if_needed()
            expect(page.locator('#modelStatus')).to_contain_text(f'{count} 个模型条目',timeout=90000);yellow(page,ids)
            assert next(m for m in view(page)['visibleModels'] if m['id']=='julich-L-90')['colour']=='39b9ff'
            page.screenshot(path=str(artifacts/'network-selection-yellow.png'))
            page.set_viewport_size({'width':390,'height':844});page.locator('#selectionPanel').scroll_into_view_if_needed()
            box=page.locator('#networkSelect').bounding_box();assert box['x']>=0 and box['x']+box['width']<=390
            page.screenshot(path=str(artifacts/'network-selection-mobile.png'))
            page.locator('[data-remove-network="DMN"]').click();assert chosen(page)==['julich-L-90']
            page.locator('#networkSelect').select_option('DMN');saved=page.evaluate('(key)=>localStorage.getItem(key)',KEY)
            page.goto(url+'?embed=research');page.wait_for_function('window.atlasReady === true',timeout=60000)
            expect(page.locator('#selectionPanel')).to_be_hidden();assert chosen(page)==[]
            page.evaluate("() => window.brainAtlas.showEvidence({nodes:[{id:'n',kind:'network',entryIds:['julich-L-62']},{id:'a',entryIds:['cit-21']}],links:[]})")
            yellow(page,['julich-L-62']);assert set(m['id'] for m in view(page)['visibleModels'])=={'julich-L-62','cit-21'}
            assert page.evaluate('(key)=>localStorage.getItem(key)',KEY)==saved
            assert page.evaluate('()=>localStorage.getItem("network-unrelated")')=='keep'
            page.goto(url+'papers.html');expect(page.locator('#recordTabs [data-kind="network"]')).to_have_count(0)
            expect(page.locator('#saveStatus')).to_contain_text('本机文献库',timeout=20000)
            assert not errors,errors
            context.close()
            fallback=browser.new_context();fallback.add_init_script("const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:orig.call(this,t,...a);};")
            page=fallback.new_page();page.goto(url);expect(page.locator('#networkSelect')).to_be_enabled()
            page.locator('#networkSelect').select_option('DMN');expect(page.locator('#selectionCount')).to_have_text('已选 4 个模型')
            page.locator('[data-remove-selection="'+ids[0]+'"]').click();assert len(chosen(page))==3
            page.locator('[data-remove-network="DMN"]').click();assert chosen(page)==[]
            fallback.close();browser.close()
            print('Integrated network browser checks passed: yellow materials in every mode, source overlaps, explicit removal, migration/reload, legacy links, mobile, evidence isolation and no-WebGL UI.')
    finally:server.shutdown();server.server_close()
if __name__=='__main__':run()
