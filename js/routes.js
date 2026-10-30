/* routes.js - the live solve. When the map comes into view it draws the example day as planned by
   hand, then replays the search untangling it: every redraw is a plan the solver accepted, and the
   model's figure is that plan's length, so the number falls because the routes got shorter, not
   because a counter runs. "Otro día, otros pedidos" draws a new random day and solves it the same
   way. With reduced motion the solved plan is shown at once. */
import { DEFAULT_SEED, DEPOT, makeDay, planKm, solve, toFrame } from './vrp.js';

const fig = document.querySelector('[data-routes]');

if (fig) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = fig.querySelector('.map-plan');
  const title = svg.querySelector('title');
  const specs = document.querySelector('.specs');
  const beforeEl = document.getElementById('r-before');
  const afterEl = document.getElementById('r-after');
  const savingEl = document.getElementById('r-saving');
  const again = document.getElementById('r-new');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const locale = fig.dataset.locale;
  const es = locale === 'es-CL';
  const cpk = Number(fig.dataset.cpk);
  const n0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const money = v => `${es ? '$' : 'CLP'} ${n0.format(v)}`;
  const million = v => (es ? `$ ${n1.format(v / 1e6)} millones` : `CLP ${n1.format(v / 1e6)} million`);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let token = 0;

  const make = (name, attrs) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  const points = (pts, route) => [0, ...route, 0].map(i => `${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`).join(' ');

  function draw(day, plan) {
    const pts = [DEPOT, ...day.stops].map(toFrame);
    const routes = make('g', { class: 'routes' });
    const stops = make('g', { class: 'stops' });
    const lines = plan.map((r, k) => routes.appendChild(make('polyline', { class: `route r${k + 1}`, points: points(pts, r) })));
    day.stops.forEach((_, i) => stops.appendChild(make('circle', { class: 'stop', cx: pts[i + 1][0].toFixed(1), cy: pts[i + 1][1].toFixed(1), r: 7 })));
    const depot = make('rect', { class: 'depot', x: (pts[0][0] - 9).toFixed(1), y: (pts[0][1] - 9).toFixed(1), width: 18, height: 18 });
    svg.replaceChildren(title, routes, stops, depot);
    return { pts, lines };
  }

  function show(naiveKm, km, done) {
    beforeEl.textContent = n0.format(Math.round(naiveKm));
    afterEl.textContent = n0.format(Math.round(km));
    if (!done) return;
    const saved = Math.round(naiveKm) - Math.round(km);
    savingEl.textContent = fig.dataset.saving
      .replace('{km}', n0.format(saved))
      .replace('{pesos}', money(Math.round(saved * cpk / 100) * 100))
      .replace('{cpk}', money(cpk))
      .replace('{year}', million(saved * cpk * 250));
  }

  async function play(seed) {
    const mine = ++token;
    const day = makeDay(seed);
    const res = solve(day);
    if (reduced) { draw(day, res.best); show(res.naiveKm, res.bestKm, true); return; }

    specs.setAttribute('aria-busy', 'true');
    const { pts, lines } = draw(day, res.naive);
    show(res.naiveKm, res.naiveKm, false);
    // the plan by hand draws in
    for (const l of lines) {
      const len = l.getTotalLength();
      l.style.strokeDasharray = String(len);
      l.style.strokeDashoffset = String(len);
      l.getBoundingClientRect();
      l.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22, 1, .36, 1)';
      l.style.strokeDashoffset = '0';
    }
    await wait(1600);
    if (mine !== token) return;
    for (const l of lines) { l.style.transition = ''; l.style.strokeDasharray = ''; l.style.strokeDashoffset = ''; }

    // the search, about two and a half seconds in all
    const steps = res.steps.slice(1);
    const dt = Math.max(180, Math.min(450, 2500 / Math.max(1, steps.length)));
    for (const plan of steps) {
      await wait(dt);
      if (mine !== token) return;
      plan.forEach((r, k) => lines[k].setAttribute('points', points(pts, r)));
      show(res.naiveKm, planKm(res.D, plan), false);
    }
    show(res.naiveKm, res.bestKm, true);
    specs.removeAttribute('aria-busy');
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      play(Number(fig.dataset.seed) || DEFAULT_SEED);
    }, { threshold: 0.3 });
    io.observe(fig);
  }
  again.addEventListener('click', () => play(1 + Math.floor(Math.random() * 1e9)));
}
