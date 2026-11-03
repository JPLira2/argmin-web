"""The texture of the navy plates: gradient descent on an irregular cost surface, drawn as a map.

    python tools/descent.py

The cost is a funnel down to one minimum, made uneven by hills and shoulders, with a narrow trough on the way
in, so its level sets wander instead of nesting as ellipses. From four places around it, plain gradient
descent (one fixed step size) runs until it reaches the minimum: it curves round the hills, takes long steps
where the slope is steep, and zig-zags across the trough at the end. Nothing is drawn by hand: the lines are
contours of f, the dots are the iterates, and every run is checked to end at the minimum.

Drawn as a cartographer would: the level sets are traced on a grid twice as fine as the drawing, kept to a
tenth of a pixel and drawn as smooth curves (Catmull-Rom through the traced points), so no facet shows at any
zoom; every fifth one is an index contour, twice the weight of the thin ones between. Each run is a smooth
trajectory through its steps.

Writes:
  assets/descent-map.svg  the level sets, in the plate's line colour: the first screen draws it inside its own
                          drawing, so the map, the runs and the minimum share one frame
  src/descent.json        the runs, for the first screen to fly as shooting stars (js/scenes.js), each step with
                          its place along its run, and the minimum
  assets/descent.svg      the same map at rest (the level sets and the run that stays) as white lines on nothing:
                          a mask for the other navy plates
"""
import json
import math
from pathlib import Path

import numpy as np
from skimage import measure

W, H = 1280, 768
FINE = 2                                       # the level sets are traced on a grid this many times finer
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
# in the order the page flies them; the last stays at rest. All four come in through the open pocket right of and
# below the hero's words (none crosses them at any width): from the upper right, from behind the stage on the right,
# rising from behind it on the left, and straight in from the right
STARTS = [(1268, 150), (1268, 540), (1020, 768), (1268, 330)]
PACE = 0.45                                    # a step takes time as its length to this power: long steps go fast, short ones slow
LR = 5000.0                                    # across the trough, 1.4 times the step that lands on its floor: a few zig-zags, then it settles
LEVELS, INDEX = 35, 5                          # the level sets, and every fifth an index contour


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


ys, xs = np.mgrid[0:H * FINE, 0:W * FINE].astype(np.float64) / FINE
F = f(xs, ys)
# the minimum, on the grid and then refined by descent
iy, ix = np.unravel_index(np.argmin(F), F.shape)
mx, my = ix / FINE, iy / FINE
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


# ---------- smooth curves: Catmull-Rom through the points, written as cubic Beziers to a tenth of a pixel ----------
def segments(pts, closed):
    n = len(pts)
    at = (lambda i: pts[i % n]) if closed else (lambda i: pts[min(max(i, 0), n - 1)])
    for i in range(n if closed else n - 1):
        (ax, ay), (bx, by), (cx, cy), (dx, dy) = at(i - 1), at(i), at(i + 1), at(i + 2)
        yield (bx, by), (bx + (cx - ax) / 6, by + (cy - ay) / 6), (cx - (dx - bx) / 6, cy - (dy - by) / 6), (cx, cy)


def curve(pts, closed=False):
    r = lambda v: round(v, 1)
    cx, cy = r(pts[0][0]), r(pts[0][1])
    out = [f'M{cx:g} {cy:g}']
    for _, c1, c2, end in segments(pts, closed):
        nums = []
        for px, py in (c1, c2, end):
            nums += [r(r(px) - cx), r(r(py) - cy)]
        out.append('c' + ' '.join(f'{v:g}' for v in nums))
        cx, cy = r(end[0]), r(end[1])
    return (''.join(out) + ('z' if closed else '')).replace(' -', '-')


def length(seg, k=16):
    p0, p1, p2, p3 = seg
    pt = lambda t: tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d
                         for a, b, c, d in zip(p0, p1, p2, p3))
    q = [pt(i / k) for i in range(k + 1)]
    return sum(math.dist(a, b) for a, b in zip(q, q[1:]))


def clock(pts):
    # when the star reaches each step, as a share of its flight: one step per beat, a long step taking a little
    # longer than a short one but far less than its length, so the star slows as the steps shrink, as the descent does
    beats = [length(seg) ** PACE for seg in segments(pts, False)]
    t = [0.0]
    for b in beats:
        t.append(t[-1] + b)
    return [v / t[-1] for v in t]


def along(pts):
    # each step's place along its run, measured on the curve that is drawn
    cum = [0.0]
    for seg in segments(pts, False):
        cum.append(cum[-1] + length(seg))
    return [c / cum[-1] for c in cum]


# ---------- the level sets: traced fine, thinned only where the line is straight, drawn as curves ----------
levels = np.linspace(F.min() + 0.06, np.percentile(F, 97), LEVELS)
thin, index = [], []
for k, lv in enumerate(levels):
    for c in measure.find_contours(F, lv):
        c = measure.approximate_polygon(c, tolerance=0.9) / FINE           # 0.45 px off the true line at most
        pts = [(float(p[1]), float(p[0])) for p in c]
        if len(pts) < 3:
            continue
        closed = math.dist(pts[0], pts[-1]) < 0.01
        if closed:
            pts = pts[:-1]
        (index if k % INDEX == INDEX - 1 else thin).append(curve(pts, closed))

on = lambda x, y: -12 < x < W + 12 and -12 < y < H + 12
GAP = 6                                        # a step is marked only this far from the last mark and the minimum


def marks(p):
    # the steps to draw, with the moment each lights; the last zig-zags crowd the minimum, so a step closer than
    # GAP to the one marked before it, or to the minimum, goes unmarked rather than piling into a bead
    out, last = [], None
    for (x, y), t in zip(p[1:-1], clock(p)[1:-1]):
        if on(x, y) and math.dist((x, y), MIN) >= GAP and (last is None or math.dist((x, y), last) >= GAP):
            out.append([round(x, 1), round(y, 1), round(t, 4)])
            last = (x, y)
    return out


drawing = {'W': W, 'H': H, 'min': [round(MIN[0], 1), round(MIN[1], 1)],
           # each run: its curve; where each step falls along it (f) and when the star reaches it (t), both 0 to 1;
           # and the steps to draw, with the moment each one lights
           'paths': [{'d': curve(p), 'f': [round(v, 4) for v in along(p)], 't': [round(v, 4) for v in clock(p)],
                      'dots': marks(p)}
                     for p in paths]}
(root / 'src' / 'descent.json').write_text(json.dumps(drawing, separators=(',', ':')) + '\n', encoding='utf-8')

lines = lambda d, stroke, opacity, width: (f'<path fill="none" stroke="{stroke}" stroke-opacity="{opacity}" stroke-width="{width}" '
                                           f'stroke-linecap="round" stroke-linejoin="round" d="{"".join(d)}"/>')
head = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" shape-rendering="geometricPrecision">'
# the map for the first screen, in the plate's line colour: hairlines, and every fifth line at twice the weight
(root / 'assets' / 'descent-map.svg').write_text(
    head + lines(thin, '#34507f', '.6', '.75') + lines(index, '#3d5c92', '.95', '1.5') + '</svg>\n', encoding='utf-8')
# the mask for the other plates: the same map, the run that stays and the minimum, white on nothing
last = drawing['paths'][-1]
dots = ''.join(f'<circle cx="{x}" cy="{y}" r="1.8"/>' for x, y, _ in last['dots'])
mask = (head + lines(thin, '#fff', '.55', '.75') + lines(index, '#fff', '.95', '1.5') + lines([last['d']], '#fff', '1', '1.4')
        + f'<g fill="#fff">{dots}<circle cx="{MIN[0]:.1f}" cy="{MIN[1]:.1f}" r="2.6"/></g></svg>\n')
(root / 'assets' / 'descent.svg').write_text(mask, encoding='utf-8')
size = lambda name: (root / 'assets' / name).stat().st_size // 1024
print(f'minimum at {MIN[0]:.0f}, {MIN[1]:.0f}; {LEVELS} levels ({len(index)} index lines); descents of '
      + ', '.join(str(len(p) - 1) for p in paths) + ' steps; '
      + f'map {size("descent-map.svg")} KB, mask {size("descent.svg")} KB, inline {len(json.dumps(drawing)) // 1024} KB')
