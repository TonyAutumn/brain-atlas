"""Catalogue/3D integration checks in a disposable browser; never calls Kimi.
Run: pip install playwright==1.57.0; playwright install chromium;
     python scripts/validate-discovery-browser.py
REQUIRE_WEBGL=1 also requires successful real-renderer/model initialization.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
KNOWN = "brain-atlas-anatomy-known-v1"

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def run() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{server.server_port}/"
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            context.add_init_script(f"localStorage.setItem({json.dumps(KNOWN)}, '[\"julich-L-172\"]'); localStorage.setItem('test-only-preserved', 'keep');")
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(url, wait_until="domcontentloaded")
            page.wait_for_function("window.catalogReady === true")
            assert page.evaluate("window.brainAtlas.getGroup()") == "all"
            assert "julich-L-172" in page.evaluate("window.brainAtlas.getKnown()")
            search = page.locator("#search3")
            search.fill("VTA")
            expect(page.locator('#regionItems [data-id="cit-21"]')).to_have_count(1)
            expect(page.locator('#regionItems [data-id="cit-22"]')).to_have_count(1)
            page.locator('#regionItems [data-id="cit-21"]').click()
            expect(page.locator("#atlasSelect")).to_have_value("cit168")
            expect(page.locator("#detail3 h2")).to_contain_text("VTA")
            assert page.evaluate("window.brainAtlas.getSelection()") == "cit-21"
            # A narrow group and existing display filters must not suppress global hits.
            page.evaluate("void window.brainAtlas.selectGroup('cortex')")
            page.locator("#knownOnly").click()
            page.locator('#hemiControls [data-hemi="L"]').click()
            search.fill("ＶＴＡ")
            expect(page.locator('#regionItems [data-id="cit-21"]')).to_have_count(1)
            expect(page.locator('#regionItems [data-id="cit-22"]')).to_have_count(1)
            page.locator('#regionItems [data-id="cit-22"]').click()
            assert page.evaluate("window.brainAtlas.getSelection()") == "cit-22"
            page.locator("#markLearned").click()
            assert set(page.evaluate("window.brainAtlas.getKnown()")).issuperset({"julich-L-172", "cit-22"})
            search.fill("tectum")
            page.locator('#regionItems [data-group="tectum"]').press("Enter")
            expect(page.locator("#detail3 h2")).to_have_text("中脑顶盖")
            expect(page.locator("#focusGroup")).to_be_disabled()
            expect(page.locator("#isolate3")).to_be_disabled()
            expect(page.locator("#detail3 .coord-grid")).to_have_count(0)
            assert page.evaluate("window.brainAtlas.getSelection()") is None
            page.locator('#detail3 .structure-link[data-group="superior_colliculus"]').click()
            expect(page.locator("#detail3 .hierarchy-list")).to_contain_text("中脑顶盖")
            expect(page.locator("#detail3 h2")).to_have_text("上丘")
            page.locator('#detail3 .detail-path [data-group="tectum"]').click()
            expect(page.locator("#detail3 h2")).to_have_text("中脑顶盖")
            search.fill("tegmentum")
            page.locator('#regionItems [data-group="tegmentum"]').click()
            expect(page.locator("#detail3 h2")).to_have_text("被盖（总称）")
            page.locator('#detail3 .structure-link[data-group="midbrain_tegmentum"]').click()
            expect(page.locator('#detail3 .structure-link[data-group="ventral_tegmental"]')).to_have_count(1)
            page.locator('#detail3 .structure-link[data-group="ventral_tegmental"]').click()
            expect(page.locator("#detail3 .hierarchy-list")).to_contain_text("中脑被盖")
            assert page.evaluate("window.brainAtlas.getEntry('julich-L-18').nav") == "red_nucleus"
            assert page.evaluate("window.brainAtlas.getEntry('cit-17').nav") == "substantia_nigra"
            assert page.evaluate("localStorage.getItem('test-only-preserved')") == "keep"
            assert set(page.evaluate("JSON.parse(localStorage.getItem('brain-atlas-anatomy-known-v1'))")).issuperset({"julich-L-172", "cit-22"})
            if os.environ.get("REQUIRE_WEBGL") == "1":
                page.wait_for_function("window.atlasReady === true", timeout=60000)
                page.evaluate("window.brainAtlas.select('cit-21')")
                expect(page.locator("#isolate3")).to_be_enabled()
                page.locator("#isolate3").check()
                expect(page.locator("#isolate3")).to_be_checked()
                page.locator("#isolate3").uncheck()
            normal_3d = page.evaluate("window.atlasReady === true")
            assert not errors, errors
            context.close()
            # Disable real WebGL creation. Search and hierarchy must remain usable.
            fallback = browser.new_context(viewport={"width": 1024, "height": 900})
            fallback.add_init_script("const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};")
            page = fallback.new_page()
            page.goto(url, wait_until="domcontentloaded")
            page.wait_for_function("window.catalogReady === true")
            page.locator("#search3").fill("LC")
            page.locator('#regionItems [data-group="locus_coeruleus"]').click()
            expect(page.locator("#detail3 h2")).to_have_text("蓝斑")
            expect(page.locator("#detail3 .hierarchy-list")).to_contain_text("脑桥被盖")
            expect(page.locator("#loadText")).to_contain_text("三维图形暂不可用")
            fallback.close()
            browser.close()
            print(f"Browser checks passed: global/bilingual search, source reveal, geometry-free ancestry, keyboard activation, saved learning state, tegmentum disambiguation, and no-WebGL fallback. Normal-context 3D ready: {normal_3d}.")
    finally:
        server.shutdown()
        server.server_close()

if __name__ == "__main__":
    run()
