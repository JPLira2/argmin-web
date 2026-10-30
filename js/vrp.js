/* vrp.mjs - the example delivery day and its solve. Shared by the page (js/routes.js) and the
   build (tools/build.mjs), so the numbers printed in the HTML are the ones the browser computes.

   A distributor in Quilicura has 18 orders and two trucks of 10 stops each. "Today's plan" is the
   naive one: orders go to the trucks in turn, in the order they arrived. The solve is a local search
   (2-opt, relocate, swap, 2-opt*) started from that plan, then perturbed and searched again; every
   improvement is recorded so the page can draw the routes untangling. Distances are 1.35 times the
   straight line, a stand-in for streets. Everything here is example data. */

export const ROAD_FACTOR = 1.35;
export const COST_PER_KM = 500;          // CLP per km, an assumption stated on the page
export const TRUCKS = 2;
export const CAPACITY = 10;              // stops per truck
export const ORDERS = 18;
export const DEFAULT_SEED = 3;

export const DEPOT = { lat: -33.3626, lon: -70.7300 };   // Quilicura, the industrial side

// comunas of Santiago, roughly at their commercial centres (example data)
export const PLACES = [
  ['Santiago', -33.4489, -70.6693], ['Providencia', -33.4314, -70.6093], ['Las Condes', -33.4110, -70.5670],
  ['Vitacura', -33.3880, -70.5720], ['Ñuñoa', -33.4569, -70.5976], ['La Reina', -33.4450, -70.5400],
  ['Peñalolén', -33.4870, -70.5450], ['La Florida', -33.5227, -70.5988], ['Puente Alto', -33.6050, -70.5780],
  ['La Pintana', -33.5840, -70.6340], ['San Bernardo', -33.5920, -70.7000], ['El Bosque', -33.5620, -70.6750],
  ['La Cisterna', -33.5300, -70.6640], ['San Miguel', -33.4970, -70.6510], ['San Joaquín', -33.4950, -70.6280],
  ['Macul', -33.4870, -70.5990], ['La Granja', -33.5340, -70.6250], ['San Ramón', -33.5390, -70.6440],
  ['Lo Espejo', -33.5200, -70.6900], ['Pedro Aguirre Cerda', -33.4920, -70.6770], ['Cerrillos', -33.4950, -70.7150],
  ['Maipú', -33.5100, -70.7580], ['Estación Central', -33.4570, -70.6980], ['Lo Prado', -33.4440, -70.7250],
  ['Pudahuel', -33.4400, -70.7600], ['Quinta Normal', -33.4290, -70.6980], ['Cerro Navia', -33.4250, -70.7440],
  ['Renca', -33.4050, -70.7280], ['Independencia', -33.4170, -70.6650], ['Recoleta', -33.4060, -70.6400],
  ['Conchalí', -33.3840, -70.6750], ['Huechuraba', -33.3700, -70.6350], ['Lo Barnechea', -33.3550, -70.5250],
  ['Quilicura', -33.3550, -70.7150]
];

// ---------- small seeded random ----------
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- the day ----------
export function makeDay(seed) {
  const r = rng(seed);
  const pool = PLACES.slice();
  const stops = [];
  while (stops.length < ORDERS) {
    const [name, lat, lon] = pool.splice(Math.floor(r() * pool.length), 1)[0];
    stops.push({ name, lat: lat + (r() - 0.5) * 0.014, lon: lon + (r() - 0.5) * 0.016 });
  }
  return { seed, stops };   // stops are listed in the order the orders arrived
}

function haversine(a, b) {
  const R = 6371, toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad, dLon = (b.lon - a.lon) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// distance matrix: index 0 is the depot, 1..n the stops
export function matrix(day) {
  const pts = [DEPOT, ...day.stops];
  return pts.map(a => pts.map(b => haversine(a, b) * ROAD_FACTOR));
}

export const routeKm = (D, route) => {
  let km = 0, prev = 0;
  for (const s of route) { km += D[prev][s]; prev = s; }
  return km + D[prev][0];
};
export const planKm = (D, plan) => plan.reduce((t, r) => t + routeKm(D, r), 0);
const clone = plan => plan.map(r => r.slice());

// a sensible plan by hand: each truck takes its half of the city (split by direction from the
// depot), and the driver always goes on to the nearest stop not yet visited
export function naivePlan(day, D = matrix(day)) {
  const angle = s => Math.atan2(s.lat - DEPOT.lat, (s.lon - DEPOT.lon) * Math.cos(DEPOT.lat * Math.PI / 180));
  const bySector = day.stops.map((s, i) => ({ i: i + 1, a: angle(s) })).sort((p, q) => p.a - q.a);
  const half = Math.ceil(bySector.length / TRUCKS);
  return Array.from({ length: TRUCKS }, (_, k) => {
    const left = bySector.slice(k * half, (k + 1) * half).map(p => p.i);
    const route = [];
    let at = 0;
    while (left.length) {
      let j = 0;
      for (let x = 1; x < left.length; x++) if (D[at][left[x]] < D[at][left[j]]) j = x;
      at = left.splice(j, 1)[0];
      route.push(at);
    }
    return route;
  });
}

// ---------- local search ----------
// best improving move among the four neighbourhoods; returns the new plan or null
function bestMove(D, plan) {
  let best = null, gain = 1e-9;
  const n = plan.length;
  // 2-opt inside each route
  for (let k = 0; k < n; k++) {
    const r = plan[k], m = r.length;
    for (let i = 0; i < m - 1; i++) for (let j = i + 1; j < m; j++) {
      const a = i ? r[i - 1] : 0, b = r[i], c = r[j], d = j + 1 < m ? r[j + 1] : 0;
      const g = D[a][b] + D[c][d] - D[a][c] - D[b][d];
      if (g > gain) { gain = g; best = () => { const p = clone(plan); p[k] = [...r.slice(0, i), ...r.slice(i, j + 1).reverse(), ...r.slice(j + 1)]; return p; }; }
    }
  }
  // relocate one stop anywhere (same or other route)
  for (let k = 0; k < n; k++) for (let i = 0; i < plan[k].length; i++) {
    const r = plan[k], s = r[i], a = i ? r[i - 1] : 0, b = i + 1 < r.length ? r[i + 1] : 0;
    const remove = D[a][s] + D[s][b] - D[a][b];
    for (let l = 0; l < n; l++) {
      if (l !== k && plan[l].length >= CAPACITY) continue;
      const t = l === k ? r.filter((_, x) => x !== i) : plan[l];
      for (let j = 0; j <= t.length; j++) {
        const c = j ? t[j - 1] : 0, d = j < t.length ? t[j] : 0;
        const g = remove - (D[c][s] + D[s][d] - D[c][d]);
        if (g > gain) { gain = g; best = () => { const p = clone(plan); p[k] = p[k].filter((_, x) => x !== i); const q = l === k ? p[k] : p[l]; q.splice(j, 0, s); return p; }; }
      }
    }
  }
  // swap two stops between routes
  for (let k = 0; k < n; k++) for (let l = k + 1; l < n; l++) for (let i = 0; i < plan[k].length; i++) for (let j = 0; j < plan[l].length; j++) {
    const r = plan[k], t = plan[l], s = r[i], u = t[j];
    const a = i ? r[i - 1] : 0, b = i + 1 < r.length ? r[i + 1] : 0, c = j ? t[j - 1] : 0, d = j + 1 < t.length ? t[j + 1] : 0;
    const g = D[a][s] + D[s][b] + D[c][u] + D[u][d] - (D[a][u] + D[u][b] + D[c][s] + D[s][d]);
    if (g > gain) { gain = g; best = () => { const p = clone(plan); p[k][i] = u; p[l][j] = s; return p; }; }
  }
  // 2-opt*: exchange the tails of two routes
  for (let k = 0; k < n; k++) for (let l = k + 1; l < n; l++) {
    const r = plan[k], t = plan[l];
    for (let i = 0; i <= r.length; i++) for (let j = 0; j <= t.length; j++) {
      if (i + (t.length - j) > CAPACITY || j + (r.length - i) > CAPACITY) continue;
      const a = i ? r[i - 1] : 0, b = i < r.length ? r[i] : 0, c = j ? t[j - 1] : 0, d = j < t.length ? t[j] : 0;
      const g = D[a][b] + D[c][d] - D[a][d] - D[c][b];
      if (g > gain) { gain = g; best = () => { const p = clone(plan); p[k] = [...r.slice(0, i), ...t.slice(j)]; p[l] = [...t.slice(0, j), ...r.slice(i)]; return p; }; }
    }
  }
  return best ? best() : null;
}

function descend(D, plan, steps) {
  let next = bestMove(D, plan);
  while (next) {
    plan = next;
    if (steps) steps.push(clone(plan));
    next = bestMove(D, plan);
  }
  return plan;
}

// move a few stops to random places, keeping capacity
function perturb(D, plan, r) {
  const p = clone(plan);
  for (let m = 0; m < 3; m++) {
    const k = Math.floor(r() * p.length);
    if (!p[k].length) continue;
    const s = p[k].splice(Math.floor(r() * p[k].length), 1)[0];
    const open = p.map((q, i) => i).filter(i => p[i].length < CAPACITY);
    const l = open[Math.floor(r() * open.length)];
    p[l].splice(Math.floor(r() * (p[l].length + 1)), 0, s);
  }
  return p;
}

/* Solve a day. Returns { D, naive, best, steps }: steps are the plans after each accepted
   improvement, starting from the naive plan, so drawing them in order shows the search. */
export function solve(day, iterations = 160) {
  const D = matrix(day);
  const naive = naivePlan(day, D);
  const steps = [clone(naive)];
  let best = descend(D, clone(naive), steps), bestKm = planKm(D, best);
  const r = rng(day.seed ^ 0x9e3779b9);
  for (let it = 0; it < iterations; it++) {
    const cand = descend(D, perturb(D, best, r));
    const km = planKm(D, cand);
    if (km < bestKm - 1e-6) { best = cand; bestKm = km; steps.push(clone(best)); }
  }
  return { D, naive, best, steps, naiveKm: planKm(D, naive), bestKm };
}

// ---------- the map frame: same projection as tools/santiago.py (1000 x 750, north up) ----------
export const FRAME = { w: 1000, h: 750, west: -70.84, north: -33.32, kx: 111.32 * Math.cos(-33.47 * Math.PI / 180), ky: 110.57, scale: 0, ox: 0, oy: 0 };
{
  const widthKm = (-70.50 - FRAME.west) * FRAME.kx, heightKm = (FRAME.north - -33.62) * FRAME.ky;
  FRAME.scale = Math.min(FRAME.w / widthKm, FRAME.h / heightKm);
  FRAME.ox = (FRAME.w - widthKm * FRAME.scale) / 2;
  FRAME.oy = (FRAME.h - heightKm * FRAME.scale) / 2;
}
export function toFrame(p) {
  return [FRAME.ox + (p.lon - FRAME.west) * FRAME.kx * FRAME.scale, FRAME.oy + (FRAME.north - p.lat) * FRAME.ky * FRAME.scale];
}
