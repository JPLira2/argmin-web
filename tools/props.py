"""Render the truck sprite to WebP (needs the local server and Playwright with Chrome).

    python tools/props.py http://127.0.0.1:5174

Writes assets/3d/truck.webp: 16 headings side by side, 540 x 450 each, heading k = k x 22.5 degrees, the
ground point under the truck at each frame's centre, drawn by tools/props.html with a true isometric camera.
js/truck.js turns the sprite to the road.
"""
import base64
import io
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

base = sys.argv[1].rstrip('/')
out = Path(__file__).resolve().parent.parent / 'assets' / '3d'
out.mkdir(parents=True, exist_ok=True)


def png(url):
    return Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1]))).convert('RGBA')


with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page()
    pg.goto(base + '/tools/props.html')
    pg.wait_for_function("document.title === 'ready'", timeout=60000)
    props = pg.evaluate('window.PROPS')
    b.close()

frames = [png(u) for u in props['truck']]
w, h = frames[0].size
sheet = Image.new('RGBA', (w * len(frames), h), (0, 0, 0, 0))
for k, f in enumerate(frames):
    sheet.paste(f, (k * w, 0))
sheet.save(out / 'truck.webp', quality=92, method=6, alpha_quality=100)
origin = ('Origin: rendered by tools/props.html (three.js flat-shaded solids in the page palette, true isometric camera), '
          'sixteen headings at 22.5 degrees, assembled by tools/props.py; no image generation.')
(out / 'truck.webp.json').write_text(json.dumps({'prompt': origin, 'createdAt': datetime.now(timezone.utc).isoformat(timespec='seconds')}, indent=2) + '\n', encoding='utf-8')
f = out / 'truck.webp'
print(f.name, Image.open(f).size, f.stat().st_size // 1024, 'KB')
