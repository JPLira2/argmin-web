/* scene-layouts.js - where the 18 marks stand in each scene, for a stage of any size. Shared by the page
   (js/scenes.js moves the marks) and the build (tools/build.mjs draws each stage's resting scene, so the
   stage is a finished picture before any script runs).

   A scene has two moments: "before", the plan a pyme has today, with what it loses marked as waste (red on
   the page), and "after", the plan a model finds. The 18 marks are the same objects in every scene (the
   orders, the products, the shifts, the jobs), so moving from one scene to the next is the data being
   rearranged, never replaced. A mark is { x, y, r, s, w }: centre, rotation in degrees, scale, waste.
   The furniture (a target line, the day columns, the routes, the cost curve) is a list of plain shapes,
   each shown in one moment or both, so the page and the build draw it the same way.

   Positions are in the stage's own pixels: the page sets the SVG's viewBox to its rendered size, so a
   mark is the same size on a phone and on a desktop, and the scene spreads to fill the stage. */

export const N = 18;
export const SCENES = ['rutas', 'stock', 'turnos', 'compras', 'pronostico', 'produccion', 'minimo'];

const mk = ([x, y], w = false, r = 0, s = 1) => ({ x, y, r, s, w });

// the mark's size for a stage: big enough to read across the first screen, small enough for six levels of
// stock and 18 columns of a forecast
export function markSize(box) {
  const cw = box.x1 - box.x0, ch = box.y1 - box.y0;
  return Math.max(10, Math.min(34, ch / 9, cw / 16));
}

// the stage's working area: clear of the edges by a little more than a mark, and sideways at least the
// page's own margin (mx), so a stage that bleeds to the screen's edges still lines up with the text above it
export function frame(W, H, mx = 0) {
  const pad = Math.max(14, Math.min(W, H) * 0.06), side = Math.max(pad, mx);
  return { x0: side, y0: pad, x1: W - side, y1: H - pad };
}
const LABELS = 86;   // the column the supplier and machine names take, in px

// ---------- stock: six products, a target level, what sits above it fills what is missing ----------
function stock(box, m) {
  const { x0, x1, y1 } = box, cw = x1 - x0, step = m * 1.32;
  const heights = [6, 1, 5, 0, 4, 2], target = 3;            // 18 marks; 6 too many, 6 missing
  const cx = i => x0 + cw * (i + 0.5) / heights.length;
  const base = y1 - m / 2;
  const at = (i, k) => [cx(i), base - k * step];
  const before = [], missing = [];
  heights.forEach((h, i) => {
    for (let k = 0; k < h; k++) before.push({ p: at(i, k), w: k >= target });
    for (let k = h; k < target; k++) missing.push(at(i, k));
  });
  let next = 0;
  const after = before.map(b => mk(b.w ? missing[next++] : b.p));
  const line = base - (target - 1) * step - m / 2 - (step - m) / 2;
  return {
    before: before.map(b => mk(b.p, b.w)),
    after,
    fx: [
      ...missing.map(([x, y]) => ({ k: 'ghost', x: x - m / 2, y: y - m / 2, w: m, h: m, phase: 'before' })),
      { k: 'bar', x: x0 - m * 0.4, y: line - 2, w: cw + m * 0.8, h: 4, phase: 'both' }
    ]
  };
}

// ---------- turnos: a week of shifts against the week's demand ----------
function turnos(box, m, labels = []) {
  const { x0, x1, y1 } = box, cw = x1 - x0, step = m * 1.32;
  const demand = [1, 1, 2, 2, 4, 5, 3], today = [3, 3, 3, 3, 2, 2, 2];   // 6 idle shifts early, 6 short late
  const cx = d => x0 + cw * (d + 0.5) / 7;
  const base = y1 - m / 2 - (labels.length ? m * 0.9 : 0);
  const at = (d, k) => [cx(d), base - k * step];
  const before = [], missing = [];
  today.forEach((h, d) => {
    for (let k = 0; k < h; k++) before.push({ p: at(d, k), w: k >= demand[d] });
    for (let k = h; k < demand[d]; k++) missing.push(at(d, k));
  });
  let next = 0;
  const after = before.map(b => mk(b.w ? missing[next++] : b.p));
  const fx = demand.map((n, d) => ({
    k: 'band', x: cx(d) - m * 0.82, y: base - (n - 1) * step - m * 0.82, w: m * 1.64, h: (n - 1) * step + m * 1.64, phase: 'both'
  }));
  labels.forEach((t, d) => fx.push({ k: 'text', x: cx(d), y: y1, t, anchor: 'middle', phase: 'both' }));
  return { before: before.map(b => mk(b.p, b.w)), after, fx };
}

// ---------- compras: three suppliers over twelve weeks ----------
function compras(box, m, labels = []) {
  const { x0, y0, x1, y1 } = box, step = m * 1.32;
  const lx = x0 + (labels.length ? LABELS : 0), cw = x1 - lx, ch = y1 - y0;
  const lane = l => y0 + ch * (l + 0.5) / 3;
  const wx = w => lx + cw * (w + 0.5) / 12;
  // today: every order to the first supplier, in clumps, and six rushed orders at the end
  const before = [];
  for (let w = 0; w < 6; w++) for (const row of [-0.5, 0.5]) before.push(mk([wx(w), lane(0) + row * step]));
  for (let w = 9; w < 12; w++) for (const row of [-0.5, 0.5]) before.push(mk([wx(w), lane(0) + row * step], true));
  // the model: each supplier for what it does best, a steady rhythm
  const after = [];
  for (let l = 0; l < 3; l++) for (let j = 0; j < 6; j++) after.push(mk([wx(j * 2 + (l === 1 ? 1 : 0) + (l === 2 ? 0.5 : 0)), lane(l)]));
  const fx = [0, 1, 2].map(l => ({ k: 'band', x: lx - m * 0.6, y: lane(l) - step, w: cw + m * 1.2, h: step * 2, phase: 'both' }));
  labels.forEach((t, l) => fx.push({ k: 'text', x: x0, y: lane(l) + m * 0.32, t, anchor: 'start', phase: 'both' }));
  return { before, after, fx };
}

// ---------- pronóstico: twelve weeks of sales, six to forecast ----------
function pronostico(box, m, labels = []) {
  const { x0, y0, x1, y1 } = box, cw = x1 - x0, ch = y1 - y0;
  const wx = w => x0 + cw * (w + 0.5) / 18;
  const s = Math.min(1, cw / 18 / (m * 1.25));
  const mid = y0 + ch * 0.52, amp = ch * 0.3;
  const sales = w => Math.sin((w / 12) * Math.PI * 2 - 1.2) * 0.85 + [0.1, -0.12, 0.06, 0.14, -0.08, 0.02][w % 6];
  const mean = Array.from({ length: 12 }, (_, w) => sales(w)).reduce((a, b) => a + b, 0) / 12;
  const before = [], after = [];
  for (let w = 0; w < 18; w++) {
    const y = mid - amp * sales(w);
    if (w < 12) { before.push(mk([wx(w), y], false, 0, s)); after.push(mk([wx(w), y], false, 0, s)); }
    else { before.push(mk([wx(w), mid - amp * mean], true, 0, s)); after.push(mk([wx(w), y], false, 0, s)); }
  }
  const edge = (wx(11) + wx(12)) / 2;
  const fx = [{ k: 'band', x: edge, y: y0 - m * 0.2, w: x1 - edge + m * 0.6, h: ch + m * 0.4, phase: 'both' }];
  if (labels[0]) fx.push({ k: 'text', x: edge + m * 0.4, y: y0 + m * 0.7, t: labels[0], anchor: 'start', phase: 'both' });
  return { before, after, fx };
}

// ---------- producción: two machines, one shift; fewer changeovers fit more jobs ----------
function produccion(box, m, labels = []) {
  const { x0, y0, x1, y1 } = box, ch = y1 - y0;
  const lx = x0 + (labels.length ? LABELS : 0), cw = x1 - lx;
  const sw = cw / 10;
  const lane = l => y0 + ch * (l + 0.5) / 2;
  const sx = s => lx + sw * (s + 0.5);
  // J a job, C a changeover between products; both machines are full until the end of the shift
  const today = ['JCJCJCJCJ', 'JCJJCJJJJ'];
  const before = [], after = [];
  today.forEach((row, l) => {
    const jobs = [], changes = [];
    [...row].forEach((c, s) => (c === 'J' ? jobs : changes).push(s));
    jobs.forEach(s => before.push(mk([sx(s), lane(l)])));
    changes.forEach(s => before.push(mk([sx(s), lane(l)], true)));
    // the model groups the products: the jobs close up and only one changeover is left, at the end
    jobs.forEach((s, j) => after.push(mk([sx(j), lane(l)])));
    changes.forEach((s, j) => after.push(mk([sx(jobs.length + j), lane(l)], jobs.length + j === row.length - 1)));
  });
  const end = lx + sw * 9 + sw * 0.1;
  const fx = [
    ...[0, 1].map(l => ({ k: 'band', x: lx - m * 0.5, y: lane(l) - m * 0.9, w: sw * 9 + m * 0.5, h: m * 1.8, phase: 'both' })),
    { k: 'bar', x: end, y: lane(0) - m * 1.3, w: 4, h: lane(1) - lane(0) + m * 2.6, phase: 'both' }
  ];
  labels.slice(0, 2).forEach((t, l) => fx.push({ k: 'text', x: x0, y: lane(l) + m * 0.32, t, anchor: 'start', phase: 'both' }));
  return { before, after, fx };
}

// ---------- rutas: the day's stops, the plan by hand, the plan of the model ----------
// ctx.rutas = { depot: [x, y], stops: [[x, y] x 18], naive: [[stop indices] per truck], best: [...] }
// in map-frame coordinates; the scene fits them to the stage, stretching sideways at most 2.4 times
function rutas(box, m, ctx) {
  const r = ctx && ctx.rutas;
  if (!r) return minimo(box, m);
  const pts = [r.depot, ...r.stops];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const cw = box.x1 - box.x0, ch = box.y1 - box.y0;
  const sy = ch / (by1 - by0), sx = Math.min(cw / (bx1 - bx0), sy * 2.4);
  const ox = box.x0 + (cw - (bx1 - bx0) * sx) / 2;
  const fit = ([x, y]) => [ox + (x - bx0) * sx, box.y0 + (y - by0) * sy];
  const P = pts.map(fit);
  const line = route => [0, ...route, 0].map(i => P[i]);
  const stops = P.slice(1).map(p => mk(p, false, 0, 0.62));
  const d = m * 1.15;
  return {
    before: stops,
    after: stops,
    fx: [
      ...r.naive.map(route => ({ k: 'route', pts: line(route), w: true, phase: 'before' })),
      ...r.best.map(route => ({ k: 'route', pts: line(route), w: false, phase: 'after' })),
      { k: 'depot', x: P[0][0] - d / 2, y: P[0][1] - d / 2, w: d, h: d, phase: 'both' }
    ],
    drive: line(r.best.reduce((a, b) => (b.length > a.length ? b : a)))
  };
}

// ---------- mínimo: the cost curve; everything settles at its lowest point ----------
function minimo(box, m) {
  const { x0, y0, x1, y1 } = box, cw = x1 - x0, step = m * 1.32;
  const u0 = 0.62, A = 1 / (u0 * u0), B = 0.55 / ((1 - u0) * (1 - u0));
  const cost = u => (u < u0 ? A * (u0 - u) ** 2 : B * (u - u0) ** 2);
  const top = y0 + m * 0.6, bottom = y1 - 2;
  const at = u => [x0 + u * cw, bottom - cost(u) * (bottom - top)];
  const d = Array.from({ length: 65 }, (_, i) => at(i / 64)).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const lift = m / 2 + 4, ui = i => 0.05 + 0.9 * i / (N - 1);
  const s = Math.min(1, cw * 0.9 / (N - 1) / (m * 1.15));   // on a narrow stage, small enough not to touch along the curve
  const before = Array.from({ length: N }, (_, i) => {
    const [x, y] = at(ui(i));
    return mk([x, y - lift], cost(ui(i)) > 0.3, 0, s);
  });
  // the pile at the foot, 6, 5, 4 and 3 high: the marks nearest the foot make its bottom row, the next ones the
  // row above, and so on, each row in the marks' own order across, so the pile is built from the bottom up
  const [mx] = at(u0), after = [], near = [...Array(N).keys()].sort((a, b) => Math.abs(ui(a) - u0) - Math.abs(ui(b) - u0));
  let k = 0;
  [6, 5, 4, 3].forEach((n, row) => {
    near.slice(k, k + n).sort((a, b) => a - b)
      .forEach((i, j) => { after[i] = mk([mx + (j - (n - 1) / 2) * step, bottom - lift - row * step]); });
    k += n;
  });
  // on the way there (the page only): every mark slides down the curve together, keeping its order, to lie side
  // by side at the foot, a step apart; then the pile is stacked. Only where the row fits on the curve
  const i0 = (u0 - 0.05) / 0.9 * (N - 1), v = i => u0 + (i - i0) * step / cw;
  const fits = v(0) > 0.02 && v(N - 1) < 0.98;
  const slide = (i, e) => { const [x, y] = at(ui(i) + (v(i) - ui(i)) * e); return [x, y - lift]; };
  const via = fits ? before.map((_, i) => mk(slide(i, 1))) : undefined;
  return { before, after, via, slide, fx: [{ k: 'curve', d, phase: 'both' }] };
}

/* The scene for a stage: its marks before and after, its furniture, and (for routes) the road the truck
   drives. labels are the short words a scene can set beside its drawing (days, suppliers, "hoy"). */
export function layout(name, box, ctx = {}, labels = {}) {
  const m = markSize(box);
  const scene = { rutas: () => rutas(box, m, ctx), stock: () => stock(box, m), turnos: () => turnos(box, m, labels.turnos),
    compras: () => compras(box, m, labels.compras), pronostico: () => pronostico(box, m, labels.pronostico),
    produccion: () => produccion(box, m, labels.produccion), minimo: () => minimo(box, m) }[name] || (() => minimo(box, m));
  // stack: the scene stands blocks on top of one another (a block is lifted up over others); otherwise it is a
  // plan seen from above (a block is lifted towards the eye and passes over)
  return { m, stack: !['rutas', 'compras', 'pronostico', 'produccion'].includes(name), ...scene() };
}

/* A mark is a small block seen from above and to the right, lit from the upper left: its face, the top the
   light falls on and the side in shade. The block is as deep as a quarter of a mark, less than the smallest
   gap between two marks at rest (a third of a mark), so neighbouring blocks never cover each other. */
export function block(m) {
  const h = m / 2, d = m * 0.24, dx = d * 0.8, dy = -d * 0.6, f = v => v.toFixed(1);
  return {
    face: { x: f(-h), y: f(-h), width: f(m), height: f(m) },
    top: `M${f(-h)} ${f(-h)}L${f(h)} ${f(-h)}L${f(h + dx)} ${f(-h + dy)}L${f(-h + dx)} ${f(-h + dy)}Z`,
    side: `M${f(h)} ${f(-h)}L${f(h + dx)} ${f(-h + dy)}L${f(h + dx)} ${f(h + dy)}L${f(h)} ${f(h)}Z`
  };
}
export function blockMarkup(m) {
  const b = block(m);
  return `<path class="s" d="${b.side}"/><path class="t" d="${b.top}"/><rect class="f" x="${b.face.x}" y="${b.face.y}" width="${b.face.width}" height="${b.face.height}"/>`;
}

// a mark as a CSS transform (the page) and as an SVG attribute (the build)
export const transform = p => `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.r}deg) scale(${p.s})`;
export const attr = p => `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})${p.r ? ` rotate(${p.r})` : ''}${p.s !== 1 ? ` scale(${p.s})` : ''}`;

// furniture as SVG markup, for the build (js/scenes.js makes the same elements with the DOM)
export function fxMarkup(fx) {
  const ph = f => ` data-phase="${f.phase}"`;
  return fx.map(f => {
    if (f.k === 'route') return `<polyline class="fx-route${f.w ? ' is-w' : ''}"${ph(f)} points="${f.pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}"/>`;
    if (f.k === 'curve') return `<path class="fx-curve"${ph(f)} d="${f.d}"/>`;
    if (f.k === 'text') return `<text class="fx-text"${ph(f)} x="${f.x.toFixed(1)}" y="${f.y.toFixed(1)}" text-anchor="${f.anchor}">${f.t}</text>`;
    return `<rect class="fx-${f.k}"${ph(f)} x="${f.x.toFixed(1)}" y="${f.y.toFixed(1)}" width="${f.w.toFixed(1)}" height="${f.h.toFixed(1)}"/>`;
  }).join('');
}
