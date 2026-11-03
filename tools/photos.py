"""Make the web copies of the found photographs: cropped to the frame the page uses, in greyscale.

    python -I tools/photos.py

For each photograph in draft/originals: crop to its frame, turn to greyscale, stretch the contrast a little
(the darkest and lightest half percent clipped), and save two widths as WebP in assets/photos/<name>-<w>.webp.
Writes assets/photos/photos.json with each frame's size, which tools/build.mjs reads for width, height and
srcset, and beside every copy a <file>.json naming where it came from (its provenance, read from the download
record in draft/originals/credits.json). One treatment for every picture keeps the photographs, taken by
different people in different light, looking like one set. The copies are adaptations of CC BY-SA / CC BY / CC0 photographs: credited in the
footer, and shared under CC BY-SA 4.0.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC, DST = ROOT / "draft" / "originals", ROOT / "assets" / "photos"
WIDTHS = (960, 1920)

# per photograph: file, crop box (fractions x0, y0, x1, y1) of the original, the frame's use on the page
PHOTOS = {
    "shelves": ("pallereoler-i-remise-3-01.jpg", (0, 0, 1, 1)),                          # calculator, 4:3
    "meiggs": ("campbell-con-meiggs-barrio-meiggs-santiago-20200204.jpg", (0, 0.22, 1, 0.865)),  # band, 21:9
    "ruta5": ("ruta-5-norte-chile-vistaaerea.jpg", (0, 0.36, 1, 0.6825)),                 # band, 21:9
    "vega": ("la-vega-central-en-santiago.jpg", (0, 0.08, 1, 0.92)),                      # how we work, 16:10
    "port": ("puerto-san-antonio-13022826444.jpg", (0, 0.04, 1, 0.94)),                   # how we work, 16:10
}

DST.mkdir(parents=True, exist_ok=True)
record = {Path(c["file"]).name: c for c in json.loads((SRC / "credits.json").read_text(encoding="utf-8"))}
now = datetime.now(timezone.utc).isoformat(timespec="seconds")
sizes = {}
for name, (file, (x0, y0, x1, y1)) in PHOTOS.items():
    im = Image.open(SRC / file)
    w, h = im.size
    im = im.crop((round(x0 * w), round(y0 * h), round(x1 * w), round(y1 * h)))
    im = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=0.5)
    for width in WIDTHS:
        out = im if im.width <= width else im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        out.save(DST / f"{name}-{width}.webp", quality=74, method=6)
        c = record[file]
        origin = (f'Origin: "{c["title"]}" by {c["creator"]}, {c["license"]}, {c["page"]}, via {c["via"]}; '
                  f"cropped to {x0:g},{y0:g} to {x1:g},{y1:g} of the original and turned to greyscale by tools/photos.py.")
        (DST / f"{name}-{width}.webp.json").write_text(json.dumps({"prompt": origin, "createdAt": now}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sizes[name] = {"w": im.width, "h": im.height, "widths": [x for x in WIDTHS if x <= im.width] or [im.width]}
    print(name, im.size, [f"{(DST / f'{name}-{x}.webp').stat().st_size // 1024} KB" for x in WIDTHS])
(DST / "photos.json").write_text(json.dumps(sizes, indent=1) + "\n", encoding="utf-8")
