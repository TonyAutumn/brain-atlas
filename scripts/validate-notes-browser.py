"""Disposable real-browser tests; no existing user browser, API keys, or external services."""
import base64, functools, json, pathlib, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
from playwright.sync_api import sync_playwright, expect
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
PNG=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1xkAAAAASUVORK5CYII=')
# Force no WebGL for this test: notes and hierarchy must not depend on the renderer.
NO_GL="""const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:old.call(this,t,...a)};"""
errors=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
  context=browser.new_context();context.add_init_script(NO_GL)
  atlas=context.new_page();atlas.on('pageerror',lambda e:errors.append(str(e)))
  atlas.goto(base+'index.html?structure=group:superior_colliculus')
  atlas.wait_for_function('window.notesIntegrationReady && window.brainAtlas.getGroup()==="superior_colliculus"')
  expect(atlas.locator('#detail3 .direct-parent [data-group="tectum"]')).to_be_visible()
  atlas.locator('#detail3 .direct-parent [data-group="tectum"]').click()
  atlas.wait_for_function('window.brainAtlas.getGroup()==="tectum"')
  atlas.locator('#detail3 .hierarchy-list [data-group="brainstem"]').click()
  atlas.wait_for_function('window.brainAtlas.getGroup()==="brainstem"')
  atlas.evaluate("window.brainAtlas.selectGroup('tectum')")
  with atlas.expect_popup() as pop: atlas.locator('[data-note-action="new"]').click()
  note=pop.value;note.on('pageerror',lambda e:errors.append(str(e)));note.on('dialog',lambda d:d.accept())
  expect(note.locator('body')).to_have_attribute('data-notes-ready','true');expect(note.locator('#noteTitle')).to_be_visible()
  note.locator('#noteTitle').fill('顶盖测试笔记')
  note.locator('#noteBody').fill('保留文字 <img src=x onerror="window.injected=true">')
  note.locator('#imageInput').set_input_files({'name':'test.png','mimeType':'image/png','buffer':PNG})
  expect(note.locator('#noteImages img')).to_have_count(1)
  note.locator('#noteImages input').fill('上丘与下丘的关系')
  note.locator('#saveNote').click();expect(note.locator('#saveStatus')).to_contain_text('已保存到此浏览器')
  note.locator('#noteImages .image-preview').click()
  if not note.locator('#imageDialog').is_visible(): print('Preview state:',note.evaluate("() => ({open:document.querySelector('#imageDialog').open,src:document.querySelector('#largeImage').getAttribute('src'),editorInert:document.querySelector('#editor').inert,ready:document.querySelector('#saveStatus').textContent})"),'Page errors:',errors,flush=True)
  expect(note.locator('#imageDialog')).to_be_visible();note.locator('#closeImage').click()
  note.locator('#imageInput').set_input_files([{'name':f'limit-{i}.png','mimeType':'image/png','buffer':PNG} for i in range(21)])
  expect(note.locator('#pageStatus')).to_contain_text('最多 20 张图片')
  expect(note.locator('#noteImages img')).to_have_count(1)
  note.locator('#noteBody').evaluate("""(node,b64)=>{const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));const dt=new DataTransfer();dt.items.add(new File([bytes],'paste.png',{type:'image/png'}));node.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));}""",base64.b64encode(PNG).decode())
  expect(note.locator('#noteImages img')).to_have_count(2)
  note.locator('#saveNote').click();expect(note.locator('#saveStatus')).to_contain_text('已保存到此浏览器')
  original_url=note.url;original_id=parse_qs(urlparse(original_url).query)['note'][0]
  note.reload();expect(note.locator('body')).to_have_attribute('data-notes-ready','true');expect(note.locator('#noteImages img')).to_have_count(2)
  expect(note.locator('#noteImages input').first).to_have_value('上丘与下丘的关系')
  assert not note.evaluate('Boolean(window.injected)')
  expect(atlas.locator('.saved-note-link')).to_have_count(1)
  note.locator('#copyNoteLink').click();expect(note.locator('#linkText')).to_have_value(original_url)
  # Same-origin linked reopening and conflict protection.
  other=context.new_page();other.on('dialog',lambda d:d.accept());other.goto(original_url);expect(other.locator('body')).to_have_attribute('data-notes-ready','true');expect(other.locator('#noteTitle')).to_have_value('顶盖测试笔记')
  other.locator('#noteBody').fill('另一标签页已保存版本');other.locator('#saveNote').click();expect(other.locator('#saveStatus')).to_contain_text('已保存到此浏览器')
  note.locator('#noteBody').fill('本标签页未保存冲突版本');note.locator('#saveNote').click();expect(note.locator('#saveStatus')).to_contain_text('其他标签页')
  assert note.evaluate("async id=>(await (await import('./notes/store.js')).getNote(id)).body",original_id)=='另一标签页已保存版本'
  note.locator('#duplicateNote').click();expect(note.locator('#saveStatus')).to_contain_text('已保存到此浏览器')
  assert parse_qs(urlparse(note.url).query)['note'][0]!=original_id
  expect(note.locator('#noteBody')).to_have_value('本标签页未保存冲突版本')
  # Wrap mutation in a function that returns no callable: do not invoke the installed throwing stub.
  note.evaluate("() => {window.savedPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new DOMException('test quota','QuotaExceededError')};}")
  note.locator('#noteBody').fill('配额失败后仍保留');note.locator('#saveNote').click();expect(note.locator('#saveStatus')).to_contain_text('尚未保存')
  expect(note.locator('#noteBody')).to_have_value('配额失败后仍保留')
  note.evaluate('() => {IDBObjectStore.prototype.put=window.savedPut;}');note.locator('#saveNote').click();expect(note.locator('#saveStatus')).to_contain_text('已保存到此浏览器')
  # Raster data are included in the backup and restored in an independent browser context.
  with note.expect_download() as dl: note.locator('#exportAll').click()
  raw=pathlib.Path(dl.value.path()).read_text();backup=json.loads(raw);assert len(backup['notes'])==2
  assert backup['notes'][0]['images'][0]['data'].startswith('data:image/png;base64,')
  fresh=browser.new_context();page=fresh.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept());page.goto(base+'notes.html');expect(page.locator('body')).to_have_attribute('data-notes-ready','true')
  payload={'name':'backup.json','mimeType':'application/json','buffer':raw.encode()}
  page.locator('#importInput').set_input_files(payload);expect(page.locator('#pageStatus')).to_contain_text('已导入 2 篇')
  expect(page.locator('.note-card')).to_have_count(2)
  page.goto(original_url);expect(page.locator('body')).to_have_attribute('data-notes-ready','true');expect(page.locator('#noteImages img')).to_have_count(2);expect(page.locator('#noteBody')).to_have_value('另一标签页已保存版本')
  page.locator('#importInput').set_input_files(payload);expect(page.locator('#pageStatus')).to_contain_text('2 篇因编号重复')
  expect(page.locator('.note-card')).to_have_count(4)
  # Geometry-free and per-parcel scopes remain separate.
  page.goto(base+'notes.html?structure=parcel:cit-21&new=1');expect(page.locator('body')).to_have_attribute('data-notes-ready','true');expect(page.locator('#editor')).to_be_visible();expect(page.locator('#noteImages img')).to_have_count(0)
  page.locator('#noteBody').fill('左侧图谱条目专用');page.locator('#saveNote').click();expect(page.locator('#saveStatus')).to_contain_text('已保存到此浏览器');expect(page.locator('.note-card')).to_have_count(1)
  page.locator('#backToStructure').click();page.wait_for_function('window.notesIntegrationReady && window.brainAtlas.getSelection()==="cit-21"');expect(page.locator('#detail3 .direct-parent [data-group="ventral_tegmental"]')).to_be_visible()
  page.locator('#detail3 .direct-parent [data-group="ventral_tegmental"]').click();page.wait_for_function('window.brainAtlas.getGroup()==="ventral_tegmental"')
  assert not errors,errors
  browser.close()
 print('Notes browser checks passed: upward ancestry, geometry-free/parcel entry links, multiple notes, PNG upload/paste/caption/preview, reload, linked reopening, conflict copies, quota retry, backup roundtrip and non-destructive import.')
finally: server.shutdown()
