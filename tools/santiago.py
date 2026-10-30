"""Santiago's motorways and the Mapocho, from OpenStreetMap, as a small drawing file.

    python -I tools/santiago.py <overpass roads.json>

Input: an Overpass `out geom` dump of motorway/trunk ways and the Río Mapocho inside the box below.
Output: data/santiago.json with the box, the projection and a few simplified polylines in a
1000 x 750 frame (4:3, north up). Map data © OpenStreetMap contributors, ODbL.
"""
import json
import math
import sys
from pathlib import Path

S, W, N, E = -33.62, -70.84, -33.32, -70.50
LAT0 = (S + N) / 2
KX = 111.32 * math.cos(math.radians(LAT0))   # km per degree of longitude here
KY = 110.57                                  # km per degree of latitude
FRAME_W, FRAME_H = 1000, 750


def project(lat, lon):
    """(lat, lon) -> km east and south of the box's north-west corner."""
    return (lon - W) * KX, (N - lat) * KY


width_km, height_km = (E - W) * KX, (N - S) * KY
scale = min(FRAME_W / width_km, FRAME_H / height_km)
ox, oy = (FRAME_W - width_km * scale) / 2, (FRAME_H - height_km * scale) / 2


def to_frame(lat, lon):
    x, y = project(lat, lon)
    return ox + x * scale, oy + y * scale


def rdp(pts, eps):
    """Ramer-Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, -1.0
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + x2 * y1 - y2 * x1) / norm
        if d > dmax:
            i, dmax = k, d
    if dmax <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[: i + 1], eps)[:-1] + rdp(pts[i:], eps)


def kind(tags):
    if tags.get("waterway") == "river":
        return "river"
    return "road"


data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
lines = {"road": [], "river": []}
for way in data["elements"]:
    geom = way.get("geometry")
    if not geom or len(geom) < 2:
        continue
    pts = [to_frame(p["lat"], p["lon"]) for p in geom]
    pts = rdp(pts, 1.1)
    if len(pts) >= 2:
        lines[kind(way.get("tags", {}))].append([[round(x, 1), round(y, 1)] for x, y in pts])

# carriageways come in pairs and in hundreds of short pieces; keep every piece but drop near-duplicates
def key(line):
    return tuple(round(v / 6) for p in (line[0], line[-1]) for v in p)


seen, roads = set(), []
for ln in lines["road"]:
    k = key(ln)
    if k in seen or tuple(reversed(k)) in seen:
        continue
    seen.add(k)
    roads.append(ln)

out = {
    "box": {"south": S, "west": W, "north": N, "east": E},
    "projection": {"lat0": LAT0, "kx": KX, "ky": KY, "scale": scale, "ox": ox, "oy": oy, "frame": [FRAME_W, FRAME_H]},
    "credit": "© OpenStreetMap contributors (ODbL)",
    "roads": roads,
    "river": lines["river"],
}
dest = Path(__file__).resolve().parent.parent / "data" / "santiago.json"
dest.parent.mkdir(exist_ok=True)
dest.write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
print(len(roads), "road lines,", len(lines["river"]), "river lines,", dest.stat().st_size // 1024, "KB")
