"""Draw the argmin wordmark from Computer Modern outlines (KaTeX's fonts).

    python -I tools/wordmark.py <dir with KaTeX_Main-Regular.ttf and KaTeX_Math-Italic.ttf>

Writes assets/wordmark.svg (arg min, with x set under min as a display-style limit, the way
\\operatorname*{arg\\,min}_x prints in a paper) and assets/favicon.svg (the italic x on light blue).
Glyphs become paths, so the page ships no math font. fill is currentColor.
"""
import site
import sys
from pathlib import Path

sys.path.append(site.getusersitepackages())  # fontTools; -I keeps the font folder off sys.path
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

src = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / "assets"
main = TTFont(src / "KaTeX_Main-Regular.ttf")
ital = TTFont(src / "KaTeX_Math-Italic.ttf")


def glyph(font, ch):
    gs = font.getGlyphSet()
    return gs, gs[font.getBestCmap()[ord(ch)]]


def place(font, ch, x, y, s=1.0):
    """Path data for one glyph with its origin at (x, y), y pointing down; returns (d, advance, bounds)."""
    gs, g = glyph(font, ch)
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
    g.draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
    bp = BoundsPen(gs)
    g.draw(TransformPen(bp, (s, 0, 0, -s, x, y)))
    return pen.getCommands(), g.width * s, bp.bounds


def svg(paths, bounds, pad, extra=""):
    x0, y0, x1, y1 = bounds
    x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.0f} {y0:.0f} {x1 - x0:.0f} {y1 - y0:.0f}">'
            f'{extra}<path fill="currentColor" d="{" ".join(paths)}"/></svg>\n')


def union(a, b):
    return (min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])) if a else b


# ---- wordmark: arg\,min with x under min ----
THIN = 1000 * 3 / 18          # TeX's \, (thin space), in font units
SCRIPT = 0.7                  # script size
SUB_DROP = 640                # baseline of the limit below the operator's baseline

paths, box, x = [], None, 0.0
for ch in "arg":
    d, adv, b = place(main, ch, x, 0)
    paths.append(d); box = union(box, b); x += adv
x += THIN
min_left = x
for ch in "min":
    d, adv, b = place(main, ch, x, 0)
    paths.append(d); box = union(box, b); x += adv
min_right = x
_, gx = glyph(ital, "x")
w = gx.width * SCRIPT
d, _, b = place(ital, "x", (min_left + min_right) / 2 - w / 2, SUB_DROP, SCRIPT)
paths.append(d); box = union(box, b)
(out / "wordmark.svg").write_text(svg(paths, box, 10), encoding="utf-8")

# ---- favicon: the italic x on light blue ----
_, gx = glyph(ital, "x")
d, adv, b = place(ital, "x", 0, 0)
cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
side = 1000
fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side} {side}">'
       f'<rect width="{side}" height="{side}" fill="#a6d2f3"/>'
       f'<g transform="translate({side / 2 - cx * 1.55:.0f} {side / 2 - cy * 1.55:.0f}) scale(1.55)">'
       f'<path fill="#111311" d="{d}"/></g></svg>\n')
(out / "favicon.svg").write_text(fav, encoding="utf-8")
print("wordmark box", [round(v) for v in box], "->", out / "wordmark.svg")
