/* Renders the site: index.html (es-CL) and en/index.html from src/page.mjs and the two copy decks,
   plus assets/santiago.svg, sitemap.xml, robots.txt and _headers.

     node tools/build.mjs

   The example days on the page are solved here with the same code the browser runs (js/vrp.js),
   so the numbers in the HTML are real before any script loads. Placeholders still empty in
   src/config.mjs are listed at the end of every build. */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '../src/config.mjs';
import credits from '../src/credits.mjs';
import en from '../src/copy.en.mjs';
import es from '../src/copy.es.mjs';
import examples from '../src/examples.mjs';
import page from '../src/page.mjs';
import { COST_PER_KM, DEFAULT_SEED, DEPOT, FLEET, SMALL, makeDay, planKm, solve, toFrame } from '../js/vrp.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s); };

// ---------- the route section's day (a fleet of four), and how it goes over 40 days ----------
const FLEET_SEED = 26;     // a typical day: its saving sits near the 40-day mean
const day = makeDay(FLEET_SEED, FLEET);
const run = solve(day);
const savings = [];
for (let s = 1; s <= 40; s++) {
  const r = solve(makeDay(s === 1 ? FLEET_SEED : 1000 + s, FLEET));
  savings.push(100 * (1 - r.bestKm / r.naiveKm));
}
const naiveKm = Math.round(run.naiveKm), bestKm = Math.round(run.bestKm);

// the solved plan as SVG, for readers without scripts (js/routes.js redraws and animates it)
const pts = [DEPOT, ...day.stops].map(toFrame);
const poly = r => `<polyline class="route is-model" points="${[0, ...r, 0].map(i => pts[i].map(v => v.toFixed(1)).join(',')).join(' ')}"/>`;
const planSvg = `<g class="routes">${run.best.map(poly).join('')}</g><g class="stops">${day.stops.map((_, i) =>
  `<circle class="stop" cx="${pts[i + 1][0].toFixed(1)}" cy="${pts[i + 1][1].toFixed(1)}" r="6"/>`).join('')}</g>` +
  `<rect class="depot" x="${(pts[0][0] - 9).toFixed(1)}" y="${(pts[0][1] - 9).toFixed(1)}" width="18" height="18"/>`;

const example = {
  seed: FLEET_SEED, cpk: COST_PER_KM, orders: FLEET.orders, trucks: FLEET.trucks, naiveKm, bestKm, savedKm: naiveKm - bestKm, svg: planSvg,
  stats: { lo: Math.min(...savings), hi: Math.max(...savings), mean: savings.reduce((a, b) => a + b, 0) / savings.length }
};
if (Math.abs(planKm(run.D, run.best) - run.bestKm) > 1e-6) throw new Error('solver bookkeeping');

// ---------- the stages' route scenes: small days, as map-frame points and stop orders ----------
const routeScene = seed => {
  const d = makeDay(seed, SMALL), r = solve(d);
  const round = p => p.map(v => Math.round(v * 10) / 10);
  return { rutas: { depot: round(toFrame(DEPOT)), stops: d.stops.map(st => round(toFrame(st))), naive: r.naive, best: r.best } };
};
const stages = { hero: routeScene(DEFAULT_SEED), fig: routeScene(7) };

// ---------- the calculator's defaults (same formula as js/calc.js) ----------
const calcDefault = { idle: 80_000_000 * 0.30, cost: 80_000_000 * 0.30 * ((1 + 0.015) ** 12 - 1) };

// ---------- the photographs' frames (tools/photos.py) ----------
const photos = JSON.parse(readFileSync(join(root, 'assets/photos/photos.json'), 'utf8'));

// ---------- the descents behind the first screen (tools/descent.py) ----------
const descent = JSON.parse(readFileSync(join(root, 'src/descent.json'), 'utf8'));

// ---------- the wordmark, inline ----------
const wordmark = readFileSync(join(root, 'assets/wordmark.svg'), 'utf8').trim()
  .replace('<svg ', '<svg class="wm-svg" aria-hidden="true" focusable="false" ');

// ---------- the base map ----------
const map = JSON.parse(readFileSync(join(root, 'data/santiago.json'), 'utf8'));
const pl = lines => lines.map(l => `<polyline points="${l.map(p => p.join(',')).join(' ')}"/>`).join('');
const stroke = (c, o, w) => `fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
out('assets/santiago.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 750"><g ${stroke('#0b6b46', 0.55, 2.4)}>${pl(map.river)}</g><g ${stroke('#111311', 0.28, 1.6)}>${pl(map.roads)}</g></svg>\n`);

// ---------- the pages ----------
const inlineScript = "document.documentElement.classList.add('js')";
const uf = config.ufFallback;
for (const c of [es, en]) {
  out(c.path === '/' ? 'index.html' : 'en/index.html',
    page(c, { config, credits, photos, wordmark, example, stages, examples, uf, calcDefault, inlineScript, descent }));
}

// ---------- crawl and headers ----------
const today = new Date().toISOString().slice(0, 10);
const alt = `<xhtml:link rel="alternate" hreflang="es-CL" href="${config.site}/"/><xhtml:link rel="alternate" hreflang="en" href="${config.site}/en/"/>`;
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url><loc>${config.site}/</loc><lastmod>${today}</lastmod>${alt}</url>
<url><loc>${config.site}/en/</loc><lastmod>${today}</lastmod>${alt}</url>
</urlset>
`);
out('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${config.site}/sitemap.xml\n`);
const hash = createHash('sha256').update(inlineScript).digest('base64');
out('_headers', `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/assets/*
  Cache-Control: public, max-age=604800
/data/*
  Cache-Control: public, max-age=604800
/css/*
  Cache-Control: public, max-age=3600
/js/*
  Cache-Control: public, max-age=3600
`);

// ---------- what is still missing ----------
const todo = [];
if (!config.whatsapp) todo.push('whatsapp number (src/config.mjs): WhatsApp links fall back to email');
if (!config.booking) todo.push('booking link (src/config.mjs): "Agenda 30 minutos" falls back to email');
if (!config.linkedin) todo.push("argmin's LinkedIn URL (src/config.mjs): the footer leaves the link out");
for (const p of config.team) {
  if (!p.linkedin) todo.push(`LinkedIn URL for ${p.name} (src/config.mjs, team)`);
  if (!p.photo) todo.push(`photo of ${p.name} (src/config.mjs, team): the letter shows the initials`);
}
if (!config.company.name || !config.company.rut) todo.push('razón social and RUT (src/config.mjs, company): the footer leaves them out');
if (config.pilot.open > 0 && !config.pilot.confirmed) todo.push(`pilot places: the page says the pilot is open, with no number, until you confirm ${config.pilot.open} (src/config.mjs, pilot: confirmed: true), or set open to 0`);
if (!config.proof.status && !config.proof.cases.length) todo.push('measured results (src/config.mjs, proof): none yet, so the page claims none');
todo.push('prices in UF: left off the page until they are fixed (src/copy.*.mjs, prices)');
todo.push('the $ 500 per km assumption and its diesel price (js/vrp.js, routes.note in src/copy.*.mjs): check against CNE Bencina en Línea');
console.log(`built: index.html, en/index.html | example ${naiveKm} -> ${bestKm} km (${FLEET.orders} orders, ${FLEET.trucks} trucks) | 40 days ${example.stats.lo.toFixed(1)}-${example.stats.hi.toFixed(1)}%, mean ${example.stats.mean.toFixed(1)}%`);
for (const t of todo) console.log('  TODO', t);
