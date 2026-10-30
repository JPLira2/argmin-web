"""Render the 3D accents to PNG (needs the local server and Playwright with Chrome).

    python tools/props.py http://127.0.0.1:5174

Writes assets/3d/truck.webp (16 headings side by side, 540 x 450 each, heading k = k x 22.5 degrees,
the ground point under the truck at each frame's centre), assets/3d/bodega.webp and assets/3d/office.webp
(framed to fit), all at one scale by tools/props.html with a true isometric camera. Prints where the
doors and parking spots fall in the buildings' pictures, for css/site.css.
"""
import base64
import io
import sys
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
for name in ('bodega', 'office'):
    png(props[name]).save(out / f'{name}.webp', quality=92, method=6, alpha_quality=100)
for f in sorted(out.iterdir()):
    print(f.name, Image.open(f).size, f.stat().st_size // 1024, 'KB')
for name, at in props['spots'].items():
    print(name, {k: f'{100 * x:.2f}% {100 * y:.2f}%' for k, (x, y) in at.items()})
