/* scenes.js - the stages. The hero's stage plays the day once: the routes untangle and the truck drives the
   model's route, then the stock evens out, then the shifts move to where the demand is, then everything
   settles at the bottom of the cost curve, and it rests there. Rutas, Stock and Turnos replay one scene;
   the pause button stops the sequence (and replays it once it has ended). Beside each service, a small
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

// ---------- the hero: the day, played once ----------
function hero(root) {
  const stage = new Stage(root);
  const buttons = [...root.querySelectorAll('[data-play]')];
  const pause = root.querySelector('[data-pause]');
  const cap = root.querySelector('.stage-cap');
  const caps = json(root.dataset.caps, {});
  const order = ['rutas', 'stock', 'turnos', 'minimo'];
  const holds = { rutas: 1300, stock: 2300, turnos: 2300, minimo: 0 };
  let state = 'idle';            // idle, playing, paused, done
  let gate = null, run = 0, seen = true;
  // the descents behind the offer: a shooting star down each while the day plays; the pause button holds them
  // (css), and so does the hero leaving the screen
  const sky = root.closest('.hero')?.querySelector('.descent');
  const fly = () => {
    if (!sky) return;
    sky.classList.remove('fly');
    sky.getBoundingClientRect();                 // a fresh start: the stars fly from the top of their paths
    sky.classList.add('fly');
  };

  const say = name => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.play === name)));
    const [title, text] = caps[name] || ['', ''];
    cap.querySelector('strong').textContent = title;
    cap.querySelector('span').textContent = text;
  };
  // the button says what it will do: pause while the day plays (or is about to), go on when paused, replay at the end
  const label = () => {
    pause.textContent = pause.dataset[state === 'paused' ? 'off' : state === 'done' ? 'again' : 'on'];
    pause.setAttribute('aria-pressed', String(state === 'paused'));
  };
  // the sequence waits here while paused or off screen
  const go = () => (state === 'paused' || !seen ? new Promise(r => { gate = r; }) : Promise.resolve());
  const free = () => { if (gate && state !== 'paused' && seen) { const g = gate; gate = null; g(); } };

  async function sequence() {
    const mine = ++run;
    if (state !== 'paused') state = 'playing';   // paused before the day began: it waits at the start
    label();
    fly();
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
    run++;                         // the sequence stops; this scene plays on its own
    state = 'done';
    label();
    say(b.dataset.play);
    root.querySelector('.stage-cap').setAttribute('aria-live', 'polite');
    if (reduced) { stage.set(b.dataset.play, 'after'); return; }
    if (b.dataset.play === 'rutas') { stage.set('rutas', 'before'); await wait(500); stage.resolve(); }
    else stage.play(b.dataset.play, { hold: 900 });
  }));

  pause.addEventListener('click', () => {
    if (state === 'playing' || state === 'idle') { state = 'paused'; label(); return; }
    if (state === 'paused') { state = 'playing'; label(); free(); return; }
    if (reduced) { say('rutas'); stage.set('rutas', 'after'); return; }
    stage.set('rutas', 'before');
    say('rutas');
    wait(400).then(sequence);
  });

  const reset = () => { run++; state = 'done'; label(); stage.set(stage.scene, 'after'); };
  if (reduced) { state = 'done'; label(); return { stage, reset }; }
  label();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; sky?.classList.toggle('is-away', !seen); free(); }, { threshold: 0.25 }).observe(root);
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

const stages = [];
const top = document.querySelector('[data-stage="hero"]');
const descent = document.querySelector('.hero .descent');
if (descent) {
  // each step lights when its star reaches it: its place along its run, for the css to time it by
  descent.querySelectorAll('.steps circle').forEach(c => c.style.setProperty('--f', c.dataset.f));
  pin(descent);
  document.fonts?.ready.then(() => pin(descent));   // the headline in its own face moves the offer and the well
}
if (top) stages.push(hero(top));
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
