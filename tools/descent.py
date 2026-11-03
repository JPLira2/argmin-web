"""The texture of the navy plates: gradient descent on an irregular cost surface, drawn as a map.

    python tools/descent.py

The cost is a funnel down to one minimum, made uneven by hills and shoulders, with a narrow trough on the way
in, so its level sets wander instead of nesting as ellipses. From four places around it, plain gradient
descent (one fixed step size) runs until it reaches the minimum: it curves round the hills, takes long steps
where the slope is steep, and zig-zags across the trough at the end. Nothing is drawn by hand: the rings are
contours of f, the dots are the iterates, and every run is checked to end at the minimum.

Writes:
  src/descent.json    the drawing for the first screen, where each run is drawn by a shooting star (the page
                      draws it inline; js/scenes.js keeps the minimum beside the offer at every size); each
                      step carries its place along its run, so it lights as the star passes
  assets/descent.svg  the same drawing at rest (the level sets and the run that stays), as white lines on
                      nothing: a mask for the other navy plates
"""
import json
import math
from pathlib import Path

import numpy as np
from skimage import measure

W, H = 1280, 768
root = Path(__file__).resolve().parent.parent

# the land: (height, x, y, spread along, spread across, turn in degrees); negative heights are hollows
FEATURES = [
    (0.95, 905, 175, 112, 82, 20), (0.75, 1195, 560, 150, 112, -10), (0.62, 770, 470, 125, 100, 0),
    (0.55, 1235, 105, 92, 125, 0), (0.50, 520, 230, 165, 120, 30), (0.42, 300, 575, 185, 140, 0),
    (0.38, 1010, 30, 120, 70, -15), (0.35, 640, 690, 150, 90, 10),
    (-0.32, 640, 92, 110, 90, 0), (-0.28, 985, 655, 120, 90, 0), (-0.22, 300, 300, 130, 110, 0),
    (-1.15, 1018, 334, 190, 70, -8),          # the trough the descents come down, just short of the minimum
]
CENTRE = (1075.0, 323.0)                      # the funnel's centre; the true minimum is found below
STARTS = [(1268, 22), (36, 330), (560, 18), (1268, 470)]   # in the order the page flies them; the last one stays
LR = 5000.0                                    # across the trough, 1.4 times the step that lands on its floor: a few zig-zags, then it settles


def f(x, y):
    dx, dy = x - CENTRE[0], y - CENTRE[1]
    v = np.sqrt((dx / 170) ** 2 + (dy / 150) ** 2 + 1)
    for a, cx, cy, sa, sb, turn in FEATURES:
        t = math.radians(turn)
        u = (x - cx) * math.cos(t) + (y - cy) * math.sin(t)
        w = -(x - cx) * math.sin(t) + (y - cy) * math.cos(t)
        v = v + a * np.exp(-(u * u / (2 * sa * sa) + w * w / (2 * sb * sb)))
    return v


def grad(x, y, h=0.5):
    return (f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)


ys, xs = np.mgrid[0:H, 0:W].astype(np.float64)
F = f(xs, ys)
# the minimum, on the grid and then refined by descent
iy, ix = np.unravel_index(np.argmin(F), F.shape)
mx, my = float(ix), float(iy)
for _ in range(400):
    gx, gy = grad(mx, my)
    mx, my = mx - 800 * gx, my - 800 * gy
MIN = (mx, my)


def run(x, y):
    pts = [(x, y)]
    for _ in range(160):
        gx, gy = grad(x, y)
        x, y = x - LR * gx, y - LR * gy
        pts.append((x, y))
        if math.hypot(x - MIN[0], y - MIN[1]) < 2.5:
            break
    return pts


paths = []
for s in STARTS:
    pts = run(*s)
    end = math.hypot(pts[-1][0] - MIN[0], pts[-1][1] - MIN[1])
    assert end < 6, f'the descent from {s} stopped {end:.0f}px from the minimum'
    paths.append(pts)

levels = np.linspace(F.min() + 0.06, np.percentile(F, 97), 34)


def ring(c):
    pts = [(int(round(p[1])), int(round(p[0]))) for p in c]
    keep = [pts[0]] + [p for i, p in enumerate(pts[1:], 1) if p != pts[i - 1]]
    if len(keep) < 3:
        return ''
    return (f'M{keep[0][0]} {keep[0][1]}l' + ' '.join(f'{x - px} {y - py}' for (px, py), (x, y) in zip(keep, keep[1:]))).replace(' -', '-')


rings = ''.join(ring(measure.approximate_polygon(c, tolerance=0.7)) for lv in levels for c in measure.find_contours(F, lv))
line = lambda pts: 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
on = lambda x, y: -12 < x < W + 12 and -12 < y < H + 12

def along(pts):
    cum = [0.0]
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        cum.append(cum[-1] + math.hypot(bx - ax, by - ay))
    return [c / cum[-1] for c in cum]


drawing = {'W': W, 'H': H, 'min': [round(MIN[0], 1), round(MIN[1], 1)], 'rings': rings,
           'paths': [{'d': line(p), 'dots': [[round(x, 1), round(y, 1), round(f, 3)] for (x, y), f in zip(p[1:-1], along(p)[1:-1]) if on(x, y)]}
                     for p in paths]}
(root / 'src' / 'descent.json').write_text(json.dumps(drawing, separators=(',', ':')) + '\n', encoding='utf-8')

dots = ''.join(f'<circle cx="{x}" cy="{y}" r="2.4"/>' for p in drawing['paths'][-1:] for x, y, _ in p['dots'])
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'
       f'<path fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.3" stroke-linejoin="round" d="{rings}"/>'
       f'<g fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round">{"".join(f"<path d=\"{p[chr(100)]}\"/>" for p in drawing["paths"][-1:])}</g>'
       f'<g fill="#fff">{dots}</g>'
       f'<circle cx="{MIN[0]:.1f}" cy="{MIN[1]:.1f}" r="7" fill="none" stroke="#fff" stroke-width="2"/></svg>\n')
(root / 'assets' / 'descent.svg').write_text(svg, encoding='utf-8')
print(f'minimum at {MIN[0]:.0f}, {MIN[1]:.0f}; {len(levels)} levels; descents of '
      + ', '.join(str(len(p) - 1) for p in paths) + ' steps; '
      + f'{len(svg) // 1024} KB mask, {len(json.dumps(drawing)) // 1024} KB inline')
