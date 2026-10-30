/* story.js - the truck.

   A road runs down the page through the points the page marks for it ([data-mark], in document
   order): a centripetal Catmull-Rom curve, drawn as a dotted plan with the stretch already driven
   solid. A truck (a sixteen-heading isometric sprite, assets/3d/truck.webp, frame k heading k x 22.5
   degrees) rides it with the scroll, about READ of the way down the screen. A pin with data-park
   holds it for a while (the warehouse) or for good (the destination), turned to face the door
   (data-face). Decorative: aria-hidden, nothing to focus, and without script there is no road. */
const READ = 0.62;      // where the truck rides, as a share of the screen's height
const ALPHA = 0.4;      // scroll per pixel of road, at least: a sideways stretch takes some scrolling too
const DWELL = 0.45;     // how long a park holds the truck, in screens of scroll
const TURN = 150;       // px of road over which the truck turns to face a door
const COS30 = Math.cos(Math.PI / 6), SIN30 = 0.5;

const story = document.querySelector('.story');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (story) {
  const svg = story.querySelector('.story-svg');
  const [rim, plan, cas, done] = svg.querySelectorAll('path');
  const truck = story.querySelector('.truck');
  let pts = [], cum = [], knots = [], parks = [], L = 0, tw = 0, th = 0;

  // the marks, in page coordinates; repeated points merge (a park keeps its role)
  function marks() {
    const out = [];
    document.querySelectorAll('[data-mark]').forEach(el => {
      if (!el.getClientRects().length) return;
      const r = el.getBoundingClientRect();
      const m = { x: r.left + scrollX, y: r.top + scrollY, park: el.dataset.park || '', face: el.dataset.face };
      const prev = out[out.length - 1];
      if (prev && Math.hypot(m.x - prev.x, m.y - prev.y) < 6) { if (m.park) Object.assign(prev, { park: m.park, face: m.face }); return; }
      out.push(m);
    });
    return out;
  }

  // centripetal Catmull-Rom through the marks, as cubic Beziers (no loops, no cusps)
  function curve(P) {
    const n = P.length;
    const p = i => (i < 0 ? [2 * P[0].x - P[1].x, 2 * P[0].y - P[1].y]
      : i >= n ? [2 * P[n - 1].x - P[n - 2].x, 2 * P[n - 1].y - P[n - 2].y] : [P[i].x, P[i].y]);
    const d = (a, b) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])) || 1e-6;
    const segs = [];
    for (let i = 0; i < n - 1; i++) {
      const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
      const d1 = d(p0, p1), d2 = d(p1, p2), d3 = d(p2, p3);
      const c1 = [0, 1].map(k => (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2)));
      const c2 = [0, 1].map(k => (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2)));
      segs.push([p1, c1, c2, p2]);
    }
    return segs;
  }

  // sample the road every few pixels; returns the road length at each mark
  function sample(segs) {
    pts = []; cum = [];
    const at = [0];
    let s = 0, px = 0, py = 0;
    segs.forEach(([a, b, c, e], i) => {
      const n = Math.max(8, Math.ceil(Math.hypot(e[0] - a[0], e[1] - a[1]) / 4));
      for (let j = i ? 1 : 0; j <= n; j++) {
        const t = j / n, u = 1 - t;
        const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0];
        const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1];
        if (pts.length) s += Math.hypot(x - px, y - py);
        pts.push(x, y); cum.push(s); px = x; py = y;
      }
      at.push(s);
    });
    return at;
  }

  function build() {
    // every measurement first (the marks, the page, the sprite), then every write
    tw = truck.offsetWidth; th = truck.offsetHeight;
    const W = document.documentElement.clientWidth;
    const end = document.querySelector('.end');
    const H = Math.ceil(end ? end.getBoundingClientRect().bottom + scrollY : document.documentElement.scrollHeight);
    const M = marks();
    if (M.length < 2) { story.classList.remove('ready'); return; }
    const segs = curve(M);
    const at = sample(segs);
    L = cum[cum.length - 1];
    M.forEach((m, i) => { m.s = at[i]; });

    const d = 'M' + segs[0][0].map(v => v.toFixed(1)).join(' ') +
      segs.map(([, b, c, e]) => 'C' + [b, c, e].map(q => q.map(v => v.toFixed(1)).join(' ')).join(' ')).join('');
    story.style.height = H + 'px';
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    [rim, plan, cas, done].forEach(p => p.setAttribute('d', d));
    [cas, done].forEach(p => { p.setAttribute('pathLength', L.toFixed(1)); p.style.strokeDasharray = `${L.toFixed(1)} ${L.toFixed(1)}`; });

    // scroll -> road: each mark is reached when it crosses the riding line, never faster than ALPHA allows;
    // a park adds a stretch of scroll where the truck stays put
    const vh = innerHeight;
    knots = []; parks = [];
    let k = 0, prevS = 0;
    M.forEach((m, i) => {
      k = i ? Math.max(m.y - READ * vh, k + ALPHA * (m.s - prevS)) : 0;
      knots.push([k, m.s]);
      prevS = m.s;
      if (m.park) {
        parks.push({ s: m.s, face: m.face === undefined ? null : +m.face * Math.PI / 8 });
        if (m.park !== 'end' && i < M.length - 1) { k += DWELL * vh; knots.push([k, m.s]); }
      }
    });
    story.classList.add('ready');
    place();
  }

  function sAt(y) {
    if (y <= knots[0][0]) return knots[0][1];
    const z = knots[knots.length - 1];
    if (y >= z[0]) return z[1];
    let lo = 0, hi = knots.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (knots[mid][0] <= y) lo = mid; else hi = mid; }
    const [k0, s0] = knots[lo], [k1, s1] = knots[hi];
    return k1 > k0 ? s0 + (s1 - s0) * (y - k0) / (k1 - k0) : s1;
  }

  function point(s) {
    s = Math.min(L, Math.max(0, s));
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
    const f = cum[hi] > cum[lo] ? (s - cum[lo]) / (cum[hi] - cum[lo]) : 0;
    return [pts[2 * lo] + (pts[2 * hi] - pts[2 * lo]) * f, pts[2 * lo + 1] + (pts[2 * hi + 1] - pts[2 * lo + 1]) * f];
  }

  // the sprite's heading for a direction on screen: undo the isometric projection (x runs 30 degrees
  // down to the right, z 30 degrees down to the left), then the angle about the vertical
  function heading(dx, dy) {
    const a = dx / COS30, b = dy / SIN30;
    return Math.atan2(a - b, a + b);
  }

  function place() {
    if (!knots.length) return;
    const s = reduced ? (parks.find(p => p.face !== null) || { s: 0 }).s : sAt(scrollY);
    const [x, y] = point(s);
    const [x0, y0] = point(s - 10), [x1, y1] = point(s + 10);
    let phi = heading(x1 - x0, y1 - y0);
    parks.forEach(p => {
      if (p.face === null) return;
      const w = 1 - Math.abs(s - p.s) / TURN;
      if (w <= 0) return;
      const e = w * w * (3 - 2 * w);
      let diff = (p.face - phi) % (2 * Math.PI);
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;
      phi += e * diff;
    });
    const frame = ((Math.round(phi / (Math.PI / 8)) % 16) + 16) % 16;
    truck.style.transform = `translate3d(${Math.round(x - tw / 2)}px, ${Math.round(y - th / 2)}px, 0)`;
    truck.style.backgroundPosition = `${(frame * 100 / 15).toFixed(4)}% 0`;
    const left = (L - (reduced ? L : s)).toFixed(1);
    cas.style.strokeDashoffset = left;
    done.style.strokeDashoffset = left;
  }

  let queued = false, rebuild = false;
  function frame() {
    queued = false;
    if (rebuild) { rebuild = false; build(); } else place();
  }
  function queue(again) {
    if (again) rebuild = true;
    if (!queued) { queued = true; requestAnimationFrame(frame); }
  }
  if (!reduced) addEventListener('scroll', () => queue(false), { passive: true });
  addEventListener('resize', () => queue(true));
  addEventListener('load', () => queue(true));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => queue(true));
  // anything that moves the page (an opened question, the form, a late picture) moves the marks
  if ('ResizeObserver' in window) new ResizeObserver(() => queue(true)).observe(document.querySelector('main') || document.body);
  build();
}
