/* draw.js - the drawings draw themselves.

   Each <figure data-draw> holds an <img> of a drawing made from a photograph (tools/drawings.py). Near
   the screen the SVG is fetched and put inline, and its ink is drawn in ten groups, left to right, as
   the figure comes up the screen; the two tones fill in at the end. A drawing never undraws. One with
   data-on="load" (the first screen's ground) draws once by itself, with the entrance. Without script,
   or if the fetch fails, the <img> shows the finished drawing. */
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const figs = [...document.querySelectorAll('[data-draw]')];
const files = new Map();
const live = new Set();          // inline and not finished: driven by the scroll

const clamp = v => Math.min(1, Math.max(0, v));

function get(url) {
  if (!files.has(url)) files.set(url, fetch(url).then(r => (r.ok ? r.text() : Promise.reject(new Error(r.status)))));
  return files.get(url);
}

// p in 0..1: the ink groups by p = .85 (each path has pathLength 1, dashes 1 2), the tones from .7 to 1
function paint(fig, p) {
  if (p <= fig.p) return;
  fig.p = p;
  fig.groups.forEach((g, k) => {
    const v = (clamp(k + 1 - p * 11.765) * 1.02).toFixed(3);
    if (g.dataset.v !== v) { g.style.strokeDashoffset = v; g.dataset.v = v; }
  });
  fig.style.setProperty('--tone', clamp((p - 0.7) / 0.3).toFixed(3));
  if (p >= 1) live.delete(fig);
}

function play(fig) {
  const run = () => {
    const t0 = performance.now();
    const step = now => {
      const t = clamp((now - t0) / 2400);
      paint(fig, 1 - (1 - t) ** 2);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (root.classList.contains('go')) { run(); return; }
  const mo = new MutationObserver(() => { if (root.classList.contains('go')) { mo.disconnect(); run(); } });
  mo.observe(root, { attributes: true, attributeFilter: ['class'] });
}

function inline(fig) {
  get(fig.dataset.draw).then(text => {
    const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
    if (svg.nodeName !== 'svg') throw new Error('not an svg');
    const img = fig.querySelector('img');
    const node = document.importNode(svg, true);
    node.setAttribute('preserveAspectRatio', fig.dataset.fit || 'xMidYMid slice');
    node.setAttribute('focusable', 'false');
    if (img.alt) { node.setAttribute('role', 'img'); node.setAttribute('aria-label', img.alt); }
    else node.setAttribute('aria-hidden', 'true');
    fig.groups = [...node.querySelectorAll('.ink > g')];
    fig.p = -1;
    paint(fig, reduced ? 1 : 0);
    img.replaceWith(node);
    fig.classList.add('inline');
    if (reduced) return;
    if (fig.dataset.on === 'load') play(fig);
    else { live.add(fig); queue(); }
  }).catch(() => fig.classList.add('flat'));
}

let queued = false;
function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
function update() {
  queued = false;
  const vh = innerHeight;
  // every position first, then every write: no layout forced in between
  [...live].map(fig => [fig, fig.getBoundingClientRect()]).forEach(([fig, r]) => {
    if (r.height) paint(fig, clamp((vh * 0.95 - r.top) / (vh * 0.5 + r.height * 0.4)));
  });
}
addEventListener('scroll', queue, { passive: true });
addEventListener('resize', queue);

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    inline(e.target);
  }), { rootMargin: '0px 0px 80% 0px' });
  figs.forEach(f => io.observe(f));
} else figs.forEach(inline);
