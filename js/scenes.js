/* scenes.js - the stages. The hero's stage plays the day once: the routes untangle and the truck drives the
   model's route, then the stock evens out, then the shifts move to where the demand is, then everything
   settles at the bottom of the cost curve, and it rests there. Rutas, Stock and Turnos replay one scene.
   Behind the offer, shooting stars draw the descents to the minimum, round and round; the pause button holds
   the day and the stars together, and once the day is over it holds the stars. Beside each service, a small
   stage shows that scene today and then with the model, each time it comes into view.

   Every stage is drawn by the build at rest (js/scene-layouts.js), so the page is complete without script.
   Here the marks are laid out again for the stage's real size and moved with the Web Animations API, from
   wherever they are, so a scene can be interrupted at any point. With reduced motion every scene is shown
   finished and nothing moves by itself. */
import { block, frame, layout, transform } from './scene-layouts.js';
import { drive } from './truck.js';

const NS = 'http://www.w3.org/2000/svg';
const EASE = 'cubic-bezier(.22, 1, .36, 1)';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, ms));
const json = (s, d) => { try { return JSON.parse(s); } catch { return d; } };

class Stage {
  constructor(root) {
    this.root = root;
    this.svg = root.querySelector('.stage-svg');
    this.fx = this.svg.querySelector('.fx');
    this.marks = [...this.svg.querySelectorAll('.mk')];
    this.truck = root.querySelector('.stage-truck');
    this.ctx = json(root.dataset.ctx, {});
    this.labels = json(root.dataset.labels, {});
    this.scene = root.dataset.scene;
    this.phase = 'after';
    this.token = 0;
    this.measure();
  }

  measure() {
    const r = this.svg.getBoundingClientRect();
    this.W = Math.max(1, r.width);
    this.H = Math.max(1, r.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.W.toFixed(1)} ${this.H.toFixed(1)}`);
    const mx = parseFloat(getComputedStyle(this.root).getPropertyValue('--stage-mx')) || 0;
    this.box = frame(this.W, this.H, mx);
  }

  lay(name) { return layout(name, this.box, this.ctx, this.labels); }

  // every mark is the same block, drawn for this stage's mark size
  size(m) {
    const b = block(m);
    for (const g of this.marks) {
      const [side, top, face] = g.children;
      side.setAttribute('d', b.side);
      top.setAttribute('d', b.top);
      for (const k in b.face) face.setAttribute(k, b.face[k]);
    }
  }

  // freeze every mark where it is now, so the next move starts from there
  halt() {
    for (const g of this.marks) {
      if (!g.move) continue;
      g.style.transform = getComputedStyle(g).transform;
      g.move.cancel();
      g.move = null;
    }
  }

  // the scene, at once: used on load, on resize and with reduced motion
  set(name, phase) {
    this.token++;
    this.halt();
    this.parkTruck(false);
    this.scene = name;
    this.phase = phase;
    this.L = this.lay(name);
    this.size(this.L.m);
    this.L[phase].forEach((p, i) => {
      const g = this.marks[i];
      g.style.transform = transform(p);
      g.classList.toggle('is-w', p.w);
    });
    this.fx.replaceChildren(...this.L.fx.map(f => this.make(f)));
    this.fx.dataset.phase = phase;
  }

  make(f) {
    let el;
    if (f.k === 'route') {
      el = document.createElementNS(NS, 'polyline');
      el.setAttribute('points', f.pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' '));
      el.setAttribute('class', `fx-route${f.w ? ' is-w' : ''}`);
    } else if (f.k === 'curve') {
      el = document.createElementNS(NS, 'path');
      el.setAttribute('d', f.d);
      el.setAttribute('class', 'fx-curve');
    } else if (f.k === 'text') {
      el = document.createElementNS(NS, 'text');
      el.setAttribute('x', f.x.toFixed(1));
      el.setAttribute('y', f.y.toFixed(1));
      el.setAttribute('text-anchor', f.anchor);
      el.setAttribute('class', 'fx-text');
      el.textContent = f.t;
    } else {
      el = document.createElementNS(NS, 'rect');
      for (const k of ['x', 'y', 'w', 'h']) el.setAttribute({ w: 'width', h: 'height' }[k] || k, f[k].toFixed(1));
      el.setAttribute('class', `fx-${f.k}`);
    }
    el.dataset.phase = f.phase;
    return el;
  }

  // the furniture of a new scene comes in as the old one goes
  swap(fx, phase) {
    const old = [...this.fx.children];
    const fresh = fx.map(f => this.make(f));
    old.forEach(el => el.classList.add('is-out'));
    fresh.forEach(el => { el.classList.add('is-new'); this.fx.append(el); });
    this.fx.dataset.phase = phase;
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => {
      fresh.forEach(el => el.classList.remove('is-new'));
      setTimeout(() => { old.forEach(el => el.remove()); resolve(); }, 280);
    })));
  }

  move(points, ms) {
    this.halt();
    return Promise.all(this.marks.map((g, i) => {
      const p = points[i], to = transform(p);
      const from = g.style.transform || getComputedStyle(g).transform;
      const delay = Math.min(i * 20, 340);
      if (p.w !== g.classList.contains('is-w')) setTimeout(() => g.classList.toggle('is-w', p.w), delay + ms * 0.4);
      if (from === to) return null;
      const a = g.animate([{ transform: from }, { transform: to }], { duration: ms, delay, easing: EASE, fill: 'forwards' });
      g.move = a;
      return a.finished.then(() => { g.style.transform = to; a.cancel(); if (g.move === a) g.move = null; }, () => {});
    }));
  }

  // the routes of the model draw themselves in; today's stay behind them, faint
  drawRoutes() {
    for (const el of this.fx.querySelectorAll('.fx-route:not(.is-w)')) {
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len} ${len}`;
      el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 950, easing: EASE });
    }
  }

  // one scene: its furniture, the marks as they stand today, a pause, then the model's plan
  async play(name, { hold = 1100 } = {}) {
    const t = ++this.token;
    this.parkTruck(false);
    this.scene = name;
    this.L = this.lay(name);
    this.size(this.L.m);
    await this.swap(this.L.fx, 'before');
    if (t !== this.token) return false;
    await this.move(this.L.before, 720);
    if (t !== this.token) return false;
    await wait(hold);
    if (t !== this.token) return false;
    return this.resolve(t);
  }

  async resolve(t = this.token) {
    this.phase = 'after';
    this.fx.dataset.phase = 'after';
    this.drawRoutes();
    await this.move(this.L.after, 860);
    if (t !== this.token) return false;
    if (this.scene === 'rutas' && this.truck && this.L.drive) {
      await wait(250);
      if (t !== this.token) return false;
      await this.driveTruck(t);
    }
    return t === this.token;
  }

  async driveTruck(t) {
    const r = this.svg.getBoundingClientRect(), o = this.root.getBoundingClientRect();
    const dx = r.left - o.left, dy = r.top - o.top;
    this.truck.style.width = `${(this.L.m * 2.7).toFixed(1)}px`;
    this.truck.style.height = `${(this.L.m * 2.7 / 1.2).toFixed(1)}px`;
    return drive(this.truck, this.L.drive.map(([x, y]) => [x + dx, y + dy]), { stillWanted: () => t === this.token });
  }

  parkTruck(show) {
    if (this.truck) this.truck.classList.toggle('is-on', show);
  }
}

// ---------- the hero: the day, played once, and the stars behind it ----------
function hero(root, stars) {
  const stage = new Stage(root);
  const buttons = [...root.querySelectorAll('[data-play]')];
  const pause = root.querySelector('[data-pause]');
  const cap = root.querySelector('.stage-cap');
  const caps = json(root.dataset.caps, {});
  const order = ['rutas', 'stock', 'turnos', 'minimo'];
  const holds = { rutas: 1300, stock: 2300, turnos: 2300, minimo: 0 };
  let state = 'idle';            // idle, playing, paused (the day held), done (the day over), still (the stars held after it)
  let gate = null, run = 0, seen = true;
  const held = () => state === 'paused' || state === 'still';

  const say = name => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.play === name)));
    const [title, text] = caps[name] || ['', ''];
    cap.querySelector('strong').textContent = title;
    cap.querySelector('span').textContent = text;
  };
  // the button says what it will do, pause or go on, and the stars stop with it, and while the hero is out of sight
  const label = () => {
    pause.textContent = pause.dataset[held() ? 'off' : 'on'];
    pause.setAttribute('aria-pressed', String(held()));
    stars?.hold(held() || !seen);
  };
  // the sequence waits here while paused or off screen
  const go = () => (state === 'paused' || !seen ? new Promise(r => { gate = r; }) : Promise.resolve());
  const free = () => { if (gate && state !== 'paused' && seen) { const g = gate; gate = null; g(); } };

  async function sequence() {
    const mine = ++run;
    if (state !== 'paused') state = 'playing';   // paused before the day began: it waits at the start
    stars?.start();
    label();
    for (const name of order) {
      await go();
      if (mine !== run) return;
      say(name);
      const ok = name === 'rutas' && stage.scene === 'rutas' && stage.phase === 'before'
        ? await stage.resolve() : await stage.play(name);
      if (!ok || mine !== run) return;
      await wait(holds[name]);
    }
    if (mine !== run) return;
    state = 'done';
    label();
  }

  stage.set('rutas', reduced ? 'after' : 'before');
  root.classList.add('ready');
  say('rutas');

  buttons.forEach(b => b.addEventListener('click', async () => {
    run++;                         // the sequence stops; this scene plays on its own (held stars stay held)
    state = held() ? 'still' : 'done';
    label();
    say(b.dataset.play);
    root.querySelector('.stage-cap').setAttribute('aria-live', 'polite');
    if (reduced) { stage.set(b.dataset.play, 'after'); return; }
    if (b.dataset.play === 'rutas') { stage.set('rutas', 'before'); await wait(500); stage.resolve(); }
    else stage.play(b.dataset.play, { hold: 900 });
  }));

  pause.addEventListener('click', () => {
    if (state === 'playing' || state === 'idle') state = 'paused';
    else if (state === 'paused') state = 'playing';
    else state = state === 'still' ? 'done' : 'still';   // the day is over: the button holds the stars, and lets them go
    label();
    free();
  });

  const reset = () => { run++; state = held() ? 'still' : 'done'; label(); stage.set(stage.scene, 'after'); };
  // with reduced motion nothing moves by itself, so there is nothing to pause
  if (reduced) { state = 'done'; pause.hidden = true; return { stage, reset }; }
  label();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; label(); free(); }, { threshold: 0.25 }).observe(root);
  }
  const start = () => wait(650).then(sequence);
  const html = document.documentElement;
  if (html.classList.contains('go')) start();
  else new MutationObserver((_, mo) => { if (html.classList.contains('go')) { mo.disconnect(); start(); } })
    .observe(html, { attributes: true, attributeFilter: ['class'] });
  return { stage, reset };
}

// ---------- a service's stage: today, then the model, each time it comes into view ----------
function figure(root) {
  const stage = new Stage(root);
  const reset = () => stage.set(stage.scene, stage.phase);
  if (reduced || !('IntersectionObserver' in window)) {
    stage.set(stage.scene, 'after');
    root.classList.add('ready');
    return { stage, reset };
  }
  stage.set(stage.scene, 'before');
  root.classList.add('ready');
  // it plays once it is well in view; once it is wholly out of sight it goes back to today, unseen, to play again
  let armed = true, visit = 0;
  new IntersectionObserver(entries => {
    const e = entries[entries.length - 1];   // the latest, when several arrive at once
    if (!e.isIntersecting) {
      if (!armed) { armed = true; visit++; stage.set(stage.scene, 'before'); }
      return;
    }
    if (!armed || e.intersectionRatio < 0.6) return;
    armed = false;
    const mine = ++visit;
    wait(450).then(() => { if (mine === visit) stage.resolve(); });
  }, { threshold: [0, 0.6] }).observe(root);
  return { stage, reset };
}

// ---------- the descents: the drawing covers the plate cut round its minimum, so the lowest point always lands
// in the clear between the offer and the well, towards the right, whole, at every size (without script the
// build's centred cut stands). Layout sizes, not drawn ones, so the hero sinking back changes nothing ----------
function pin(sky) {
  const plate = sky.parentElement, W = plate.clientWidth, H = plate.clientHeight;
  const side = plate.querySelector('.hero-side'), well = plate.querySelector('.stage-hero');
  if (!W || !H || !side || !well) return;
  const below = side.offsetTop + side.offsetHeight;
  const ax = 0.84, ay = (well.offsetTop > below ? (below + well.offsetTop) / 2 : 0.42 * H) / H;
  const vw = Number(sky.dataset.w), vh = Number(sky.dataset.h), [mx, my] = sky.dataset.min.split(' ').map(Number);
  // the smallest zoom that covers the plate and leaves room to put the minimum there
  const s = Math.max(W / vw, H / vh, W * ax / mx, W * (1 - ax) / (vw - mx), H * ay / my, H * (1 - ay) / (vh - my));
  const w = W / s, h = H / s;
  sky.setAttribute('viewBox', `${(mx - ax * w).toFixed(1)} ${(my - ay * h).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
}

// ---------- the descents' shooting stars: each run is a line its own star draws, one every 6 s, round and round;
// as the next sets off, the track of the one before is wiped. The star keeps the descent's own time: it reaches
// the steps one beat after another (tools/descent.py), so it runs fast down the long first steps and slows as they
// shrink, settling into the minimum the way the descent does; between steps its speed changes smoothly (a
// monotone cubic through the beats). The line and its steps are svg, on the same beats. The star is painted on a
// canvas over the drawing, because an svg stroke cannot fade along its length: its tail is one tapered ribbon,
// a hairline where it ends and full at the head, its colour rising from the line's own blue to white, and as long
// as the star is fast, so it shortens as the star slows and draws into the head as it comes to rest ----------
function smooth(xs, ys) {
  // a monotone cubic (Fritsch and Carlson) through the points: value and slope at any x
  const n = xs.length, h = [], d = [], m = [];
  for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
    m[i] = d[i - 1] * d[i] <= 0 ? 0 : (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
  }
  return x => {
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const t = Math.min(1, Math.max(0, (x - xs[i]) / h[i])), t2 = t * t, t3 = t2 * t;
    return [(2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (3 * t2 - 2 * t3) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1],
      ((6 * t2 - 6 * t) * ys[i] + (6 * t - 6 * t2) * ys[i + 1]) / h[i] + (3 * t2 - 4 * t + 1) * m[i] + (3 * t2 - 2 * t) * m[i + 1]];
  };
}

function flight(sky, canvas) {
  const runs = [...sky.querySelectorAll('.run')];
  const GAP = 6000, FLY = 3000, LAND = 450, WIPE = 800, P = GAP * runs.length;
  const TAIL = 0.3, LONGEST = 120, SHORTEST = 12, GLOW = 8;   // the tail: as long as 0.3 s of flight, within these
  const LINE = [74, 107, 166], STAR = [240, 246, 255];       // the line's blue, the head's white
  const ctx = canvas.getContext('2d');
  const num = s => s.split(' ').map(Number);
  // each run sampled once, a point every unit along it, with its beats
  const tracks = runs.map(run => {
    const path = run.querySelector('.trail'), L = path.getTotalLength(), pts = [];
    for (let s = 0; s <= L; s++) { const q = path.getPointAtLength(s); pts.push([q.x, q.y]); }
    const f = num(run.dataset.f), t = num(run.dataset.t);
    return { L, pts, f, t, place: smooth(t, f.map(v => v * L)) };
  });
  const at = (tr, s) => tr.pts[Math.max(0, Math.min(tr.pts.length - 1, Math.round(s)))];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  let anims = null, held = true, frame = 0;

  function star(tr, phase) {
    const flying = phase <= FLY;
    const [s, rate] = flying ? tr.place(phase / FLY) : [tr.L, 0];
    const speed = rate / FLY * 1000;                               // units a second
    const settle = flying ? 1 : Math.max(0, 1 - (phase - FLY) / LAND);
    const long = Math.min(LONGEST, Math.max(SHORTEST, speed * TAIL)) * settle;
    const from = Math.max(0, s - long);
    // the tail, one ribbon: the run's points from its end to the head, widened along their normals
    const spine = [];
    for (let u = Math.ceil(from); u < s; u += 2) spine.push(at(tr, u));
    spine.push(at(tr, s));
    if (spine.length > 1 && long > 1) {
      const left = [], right = [];
      spine.forEach((p, i) => {
        const a = spine[Math.max(0, i - 1)], b = spine[Math.min(spine.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
        const u = i / (spine.length - 1), w = 0.1 + 1.25 * u ** 1.4;
        left.push([p[0] - dy / n * w, p[1] + dx / n * w]);
        right.push([p[0] + dy / n * w, p[1] - dx / n * w]);
      });
      const [x0, y0] = spine[0], [x1, y1] = spine[spine.length - 1];
      const fill = ctx.createLinearGradient(x0, y0, x1, y1);
      fill.addColorStop(0, rgba(LINE, 0));
      fill.addColorStop(0.6, rgba(LINE.map((v, j) => Math.round(v + (STAR[j] - v) * 0.45)), (0.45 * settle).toFixed(3)));
      fill.addColorStop(1, rgba(STAR, (0.95 * settle).toFixed(3)));
      ctx.fillStyle = fill;
      ctx.beginPath();
      left.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
      ctx.closePath();
      ctx.fill();
    }
    // the head: a small core in a soft glow, fading as it comes to rest
    const [hx, hy] = at(tr, s);
    const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, GLOW);
    glow.addColorStop(0, rgba(STAR, (0.38 * settle).toFixed(3)));
    glow.addColorStop(1, rgba(STAR, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(hx, hy, GLOW, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = rgba(STAR, settle.toFixed(3));
    ctx.beginPath();
    ctx.arc(hx, hy, 1.7, 0, 2 * Math.PI);
    ctx.fill();
  }

  function draw() {
    const dpr = devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const vb = sky.viewBox.baseVal, k = dpr * w / vb.width;          // the drawing's units, as pinned, to pixels
    ctx.setTransform(k, 0, 0, k, -vb.x * k, -vb.y * k);
    const now = Number(anims[0].currentTime) || 0;
    tracks.forEach((tr, i) => {
      const local = now - i * GAP;
      if (local < 0) return;
      const phase = local % P;
      if (phase <= FLY + LAND) star(tr, phase);
    });
    frame = held ? 0 : requestAnimationFrame(draw);
  }

  const begin = () => {
    sky.classList.add('fly');
    anims = runs.flatMap((run, i) => {
      const tr = tracks[i], hit = FLY / P;
      const timing = { duration: P, delay: i * GAP, iterations: Infinity, fill: 'both' };
      const out = [
        // the run stays until the next sets off, then its track is wiped
        run.animate([{ opacity: 1 }, { opacity: 1, offset: GAP / P }, { opacity: 0, offset: (GAP + WIPE) / P }, { opacity: 0 }], timing),
        // the line grows behind the head, on the same beats
        run.querySelector('.trail').animate([...tr.t.map((t, j) => ({ strokeDashoffset: 1 - tr.f[j], offset: t * hit })),
          { strokeDashoffset: 0 }], timing)
      ];
      // each step lights on its beat
      for (const c of run.querySelectorAll('.iterates circle')) {
        const t = Number(c.dataset.t) * hit;
        out.push(c.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 0, transform: 'scale(0)', offset: t },
          { opacity: 1, transform: 'scale(1.4)', offset: t + 0.012 }, { opacity: 1, transform: 'scale(1)', offset: t + 0.035 },
          { opacity: 1, transform: 'scale(1)' }], timing));
      }
      return out;
    });
  };
  return {
    start() { if (!anims) begin(); this.hold(held); },
    hold(on) {
      held = on;
      anims?.forEach(a => (on ? a.pause() : a.play()));
      cancelAnimationFrame(frame);
      frame = anims && !on ? requestAnimationFrame(draw) : 0;   // held, the canvas keeps the star where it stopped
    }
  };
}

const stages = [];
const top = document.querySelector('[data-stage="hero"]');
const descent = document.querySelector('.hero .descent');
if (descent) {
  pin(descent);
  document.fonts?.ready.then(() => pin(descent));   // the headline in its own face moves the offer and the well
}
const comets = document.querySelector('.hero .comets');
const stars = descent && comets && !reduced ? flight(descent, comets) : null;
if (top) stages.push(hero(top, stars));
document.querySelectorAll('[data-stage="fig"]').forEach(root => stages.push(figure(root)));

// a new size lays every stage out again, finished: a resize is not the moment to replay anything
let resizing;
addEventListener('resize', () => {
  clearTimeout(resizing);
  resizing = setTimeout(() => {
    if (descent) pin(descent);
    stages.forEach(({ stage, reset }) => {
      const W = stage.W, H = stage.H;
      stage.measure();
      if (Math.abs(stage.W - W) > 1 || Math.abs(stage.H - H) > 1) reset();
    });
  }, 160);
});
