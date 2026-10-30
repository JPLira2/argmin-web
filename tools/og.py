"""Icons and share images, rendered from the real page.

    python tools/og.py http://127.0.0.1:5174

Needs Playwright with Chrome. Writes favicon.ico (16/32/48) and assets/apple-touch-icon.png from
assets/favicon.svg, and assets/og-es.jpg / og-en.jpg (1200 x 630): the first screen of each page,
after its entrance (the ground drawn, the truck waiting at its first stop), without the buttons.
"""
import io
import sys
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
        ctx = browser.new_context(viewport={"width": 1600, "height": 840}, device_scale_factor=1)
        pg = ctx.new_page()
        pg.goto(base + path, wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        pg.add_style_tag(content=".burger,.btn{visibility:hidden}")
        pg.wait_for_timeout(4200)
        shot = pg.screenshot(clip={"x": 0, "y": 0, "width": 1600, "height": 840})
        Image.open(io.BytesIO(shot)).convert("RGB").resize((1200, 630), Image.LANCZOS).save(root / "assets" / f"og-{lang}.jpg", quality=86)
        ctx.close()
    browser.close()
print("icons and share images written")
