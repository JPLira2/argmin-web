"""Icons and share images, rendered from the real page.

    python tools/og.py http://127.0.0.1:5174

Needs Playwright with Chrome. Writes favicon.ico (16/32/48) and assets/apple-touch-icon.png from
assets/favicon.svg, and assets/og-es.jpg / og-en.jpg (1200 x 630): the first screen of each page with
reduced motion, so the stage rests on the routes solved, without the bar's button and the scene controls.
"""
import io
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

base = sys.argv[1].rstrip("/")
root = Path(__file__).resolve().parent.parent
svg = (root / "assets" / "favicon.svg").read_text(encoding="utf-8")

with sync_playwright() as p:
    try:
        browser = p.chromium.launch(channel="chrome")
    except Exception:
        browser = p.chromium.launch()

    pg = browser.new_page(viewport={"width": 180, "height": 180})
    pg.set_content(f'<style>html,body{{margin:0}}svg{{display:block;width:180px;height:180px}}</style>{svg}')
    png = pg.screenshot(clip={"x": 0, "y": 0, "width": 180, "height": 180})
    Image.open(io.BytesIO(png)).convert("RGB").save(root / "assets" / "apple-touch-icon.png")
    icon = Image.open(io.BytesIO(png)).convert("RGBA")
    icon.save(root / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    for lang, path in (("es", "/"), ("en", "/en/")):
        # rendered at 1600 x 840 (the same shape) and scaled down: the whole first screen, ground included
        ctx = browser.new_context(viewport={"width": 1600, "height": 840}, device_scale_factor=1, reduced_motion="reduce")
        pg = ctx.new_page()
        pg.goto(base + path, wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        pg.add_style_tag(content=".burger,.top-cta,.stage-ctl{visibility:hidden}")
        pg.wait_for_timeout(1500)
        shot = pg.screenshot(clip={"x": 0, "y": 0, "width": 1600, "height": 840})
        Image.open(io.BytesIO(shot)).convert("RGB").resize((1200, 630), Image.LANCZOS).save(root / "assets" / f"og-{lang}.jpg", quality=86)
        ctx.close()
    browser.close()

# provenance beside each picture: what made it (no image generation)
now = datetime.now(timezone.utc).isoformat(timespec="seconds")
made = {
    "apple-touch-icon.png": "Origin: assets/favicon.svg (the wordmark's x in Computer Modern on navy) rasterised by tools/og.py.",
    "og-es.jpg": "Origin: the first screen of / at 1600 x 840 with reduced motion, captured by tools/og.py and scaled to 1200 x 630.",
    "og-en.jpg": "Origin: the first screen of /en/ at 1600 x 840 with reduced motion, captured by tools/og.py and scaled to 1200 x 630.",
}
for name, origin in made.items():
    (root / "assets" / f"{name}.json").write_text(json.dumps({"prompt": origin, "createdAt": now}, indent=2) + "\n", encoding="utf-8")
print("icons and share images written")
