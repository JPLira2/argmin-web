"""Turn the found photographs into drawings that can draw themselves as the page scrolls.

    python -I tools/drawings.py            (all)        python -I tools/drawings.py shelves   (one)

For each photograph in draft/originals:
  1. crop to the frame the page uses, equalise contrast (CLAHE);
  2. ink: edges (Canny on a smoothed image), thinned to one pixel, traced into polylines, smoothed
     (Chaikin) and simplified (Ramer-Douglas-Peucker); short scraps are dropped;
  3. tone: the image quantised into two flat shades (shadow, mid), cleaned and traced into polygons.
Writes assets/draw/<name>.svg: tones first, then the ink in ten groups ordered left to right, every
path with pathLength="1" so CSS can draw it with one variable (--p, set by js/draw.js on scroll).
Colours are written as attributes (so the file reads on its own, as an <img>) and the page's CSS
overrides them when the drawing is inlined, so a palette change needs no rebuild.
The drawings are adaptations of CC BY-SA / CC BY / CC0 photographs: credited in the footer, and
shared under the same licence.
"""
import site
import sys
from pathlib import Path

sys.path.append(site.getusersitepackages())  # OpenCV, scikit-image, NumPy; -I keeps the photo folder off sys.path
import cv2
import numpy as np
from skimage.morphology import skeletonize

ROOT = Path(__file__).resolve().parent.parent
SRC, DST = ROOT / "draft" / "originals", ROOT / "assets" / "draw"
W = 1600  # drawing width in px (the viewBox)

# per photograph: file, crop box (fractions x0, y0, x1, y1), Canny low/high, blur, CLAHE clip, tone percentiles
PICS = {
    "shelves": ("pallereoler-i-remise-3-01.jpg", (0.0, 0.08, 1.0, 0.92), 34, 96, 1.4, 2.0, (16, 46)),
    "meiggs": ("campbell-con-meiggs-barrio-meiggs-santiago-20200204.jpg", (0.0, 0.0, 1.0, 0.94), 40, 110, 1.8, 2.0, (18, 48)),
    "vega": ("la-vega-central-en-santiago.jpg", (0.0, 0.06, 1.0, 0.9), 46, 120, 2.0, 2.2, (18, 48)),
    "ruta5": ("ruta-5-norte-chile-vistaaerea.jpg", (0.0, 0.34, 1.0, 0.70), 18, 52, 1.6, 4.0, (20, 52)),
    "port": ("puerto-san-antonio-13022826444.jpg", (0.0, 0.16, 1.0, 0.72), 30, 84, 1.6, 2.6, (18, 50)),
}


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    d = b - a
    n = np.hypot(*d) or 1e-9
    dist = np.abs(d[1] * (pts[:, 0] - a[0]) - d[0] * (pts[:, 1] - a[1])) / n
    i = int(np.argmax(dist))
    if dist[i] <= eps:
        return np.array([a, b])
    return np.vstack([rdp(pts[: i + 1], eps)[:-1], rdp(pts[i:], eps)])


def chaikin(pts, n=2):
    for _ in range(n):
        if len(pts) < 3:
            return pts
        q = 0.75 * pts[:-1] + 0.25 * pts[1:]
        r = 0.25 * pts[:-1] + 0.75 * pts[1:]
        mid = np.empty((2 * len(q), 2))
        mid[0::2], mid[1::2] = q, r
        pts = np.vstack([pts[:1], mid, pts[-1:]])
    return pts


def trace(skel):
    """Walk a one-pixel skeleton into polylines (each pixel used once)."""
    h, w = skel.shape
    on = set(zip(*np.nonzero(skel)))
    nb = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    deg = {p: sum((p[0] + dy, p[1] + dx) in on for dy, dx in nb) for p in on}
    seen, lines = set(), []
    starts = [p for p in on if deg[p] != 2] + [p for p in on if deg[p] == 2]
    for s in starts:
        if s in seen:
            continue
        line, cur = [s], s
        seen.add(s)
        while True:
            nxt = None
            for dy, dx in nb:
                q = (cur[0] + dy, cur[1] + dx)
                if q in on and q not in seen:
                    nxt = q
                    break
            if nxt is None:
                break
            line.append(nxt)
            seen.add(nxt)
            cur = nxt
            if deg[cur] > 2:
                break
        if len(line) > 1:
            lines.append(np.array([(x, y) for y, x in line], float))
    return lines


def ink(gray, lo, hi, blur, scale):
    g = cv2.GaussianBlur(gray, (0, 0), blur)
    e = cv2.Canny(g, lo, hi, L2gradient=True) > 0
    sk = skeletonize(e)
    out = []
    for ln in trace(sk):
        if len(ln) < 14:  # scraps
            continue
        ln = rdp(chaikin(ln, 2), 0.9) * scale
        out.append(ln)
    return out


def tones(gray, pcts, scale):
    g = cv2.medianBlur(gray, 9)
    shadow, mid = np.percentile(g, pcts)
    layers = []
    for thresh in (mid, shadow):  # lighter area first, darker on top
        m = (g <= thresh).astype(np.uint8) * 255
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
        cs, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        d = []
        for c in cs:
            if cv2.contourArea(c) < 260:
                continue
            p = rdp(c[:, 0, :].astype(float), 1.6) * scale
            if len(p) >= 3:
                d.append("M" + "L".join(f"{x:.0f} {y:.0f}" for x, y in p) + "Z")
        layers.append(" ".join(d))
    return layers


def make(name):
    file, crop, lo, hi, blur, clip, pcts = PICS[name]
    im = cv2.imread(str(SRC / file))
    h, w = im.shape[:2]
    x0, y0, x1, y1 = (int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h))
    im = im[y0:y1, x0:x1]
    work = 1200 / im.shape[1]
    im = cv2.resize(im, (1200, int(im.shape[0] * work)), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    gray = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8)).apply(gray)
    scale = W / 1200
    H = int(round(im.shape[0] * scale))

    strokes = ink(gray, lo, hi, blur, scale)
    strokes.sort(key=lambda p: p[:, 0].min())  # left to right
    groups = [[] for _ in range(10)]
    for i, p in enumerate(strokes):
        groups[min(9, i * 10 // len(strokes))].append(p)
    t_mid, t_dark = tones(gray, pcts, scale)

    def poly(p):
        return '<path pathLength="1" d="M' + "L".join(f"{x:.1f} {y:.1f}" for x, y in p) + '"/>'

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" class="drawing">',
           f'<path class="tone tone-mid" fill="#c6e2f7" d="{t_mid}"/>', f'<path class="tone tone-dark" fill="#79acd9" d="{t_dark}"/>',
           '<g class="ink" fill="none" stroke="#18284a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">']
    for k, grp in enumerate(groups):
        svg.append(f'<g class="g{k}">' + "".join(poly(p) for p in grp) + "</g>")
    svg.append("</g></svg>\n")
    DST.mkdir(parents=True, exist_ok=True)
    out = DST / f"{name}.svg"
    out.write_text("".join(svg), encoding="utf-8")
    pts = sum(len(p) for p in strokes)
    print(f"{name:8s} {W}x{H}  {len(strokes)} strokes, {pts} points, {out.stat().st_size // 1024} KB")


for n in (sys.argv[1:] or PICS):
    make(n)
