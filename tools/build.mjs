/* Renders the site: index.html (es-CL) and en/index.html from src/page.mjs and the two copy decks,
   plus assets/santiago.svg, sitemap.xml, robots.txt and _headers.

     node tools/build.mjs

   The example day on the page is solved here with the same code the browser runs (js/vrp.js),
   so the numbers in the HTML are real before any script loads. */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '../src/config.mjs';
import credits from '../src/credits.mjs';
import en from '../src/copy.en.mjs';
import es from '../src/copy.es.mjs';
import page from '../src/page.mjs';
import { COST_PER_KM, DEFAULT_SEED, DEPOT, makeDay, planKm, solve, toFrame } from '../js/vrp.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s); };

// ---------- the example day, and how it goes over 40 days ----------
const day = makeDay(DEFAULT_SEED);
const run = solve(day);
const savings = [];
for (let s = 1; s <= 40; s++) {
  const r = solve(makeDay(s === 1 ? DEFAULT_SEED : 1000 + s));
  savings.push(100 * (1 - r.bestKm / r.naiveKm));
}
const naiveKm = Math.round(run.naiveKm), bestKm = Math.round(run.bestKm);

// the solved plan as SVG, for readers without scripts (js/routes.js redraws and animates it)
const pts = [DEPOT, ...day.stops].map(toFrame);
const poly = (r, k) => `<polyline class="route r${k + 1}" points="${[0, ...r, 0].map(i => pts[i].map(v => v.toFixed(1)).join(',')).join(' ')}"/>`;
const planSvg = `<g class="routes">${run.best.map(poly).join('')}</g><g class="stops">${day.stops.map((_, i) =>
  `<circle class="stop" cx="${pts[i + 1][0].toFixed(1)}" cy="${pts[i + 1][1].toFixed(1)}" r="7"/>`).join('')}</g>` +
  `<rect class="depot" x="${(pts[0][0] - 9).toFixed(1)}" y="${(pts[0][1] - 9).toFixed(1)}" width="18" height="18"/>`;

const example = {
  seed: DEFAULT_SEED, cpk: COST_PER_KM, naiveKm, bestKm, savedKm: naiveKm - bestKm, svg: planSvg,
  stats: { lo: Math.min(...savings), hi: Math.max(...savings), mean: savings.reduce((a, b) => a + b, 0) / savings.length }
};
if (Math.abs(planKm(run.D, run.best) - run.bestKm) > 1e-6) throw new Error('solver bookkeeping');

// ---------- the calculator's defaults (same formula as js/calc.js) ----------
const calcDefault = { cost: 80_000_000 * 0.30 * ((1 + 0.015) ** 12 - 1) };

// ---------- drawing sizes, read from their viewBox (tools/drawings.py) ----------
const draws = Object.fromEntries(credits.map(p => {
  const [, , w, h] = readFileSync(join(root, 'assets/draw', `${p.file}.svg`), 'utf8').match(/viewBox="([\d. ]+)"/)[1].split(' ').map(Number);
  return [p.file, { w, h }];
}));

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
    page(c, { config, credits, draws, wordmark, example, uf, calcDefault, inlineScript }));
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
console.log(`built: index.html, en/index.html | example ${naiveKm} -> ${bestKm} km | 40 days ${example.stats.lo.toFixed(1)}-${example.stats.hi.toFixed(1)}%, mean ${example.stats.mean.toFixed(1)}%`);
for (const t of todo) console.log('  TODO', t);
