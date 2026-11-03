/* The page, rendered once per language by tools/build.mjs. `c` is a copy deck (copy.es.mjs or
   copy.en.mjs), `x` the build context: config, wordmark, the example days, the UF, the photographs'
   sizes, the example data. Every stage is drawn here at rest (js/scene-layouts.js), so the page is a
   finished picture before any script runs; js/scenes.js lays the stages out again for their real size
   and moves them. */
import { attr, blockMarkup, frame, fxMarkup, layout } from '../js/scene-layouts.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : `{${k}}`));
// a heading's authored lines, each in its own mask for the rise; the space keeps them apart when read aloud
const lines = arr => arr.map(l => `<span class="ln"><span>${esc(l)}</span></span>`).join(' ');

// a found photograph, in its greyscale web copies (tools/photos.py); sizes says how wide it is shown
function photo(x, name, alt, cls, sizes, eager = false) {
  const p = x.photos[name];
  const set = p.widths.map(w => `${x.up}assets/photos/${name}-${w}.webp ${w}w`).join(', ');
  return `<img class="${cls}" src="${x.up}assets/photos/${name}-${p.widths[p.widths.length - 1]}.webp" srcset="${set}" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
}

// a stage at rest: the scene's furniture and its 18 marks, at the moment given, in a viewBox the page
// replaces with its real size
function stage(scene, { W, H, mx = 0, ctx = {}, labels = {}, phase = 'after', aria }) {
  const L = layout(scene, frame(W, H, mx), ctx, labels);
  const shape = blockMarkup(L.m);
  const marks = L[phase].map(p => `<g class="mk${p.w ? ' is-w' : ''}" transform="${attr(p)}">${shape}</g>`).join('');
  return `<svg class="stage-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}" focusable="false"><g class="fx" data-phase="${phase}">${fxMarkup(L.fx)}</g><g class="mks">${marks}</g></svg>`;
}

export default function page(c, x) {
  // links inside the site are relative, so the same files work at a domain's root (argmin.cl) and under a
  // folder (GitHub Pages, /argmin-web/): `up` climbs from this page's folder to the site's
  x = { ...x, up: '../'.repeat(c.path.split('/').filter(Boolean).length) };
  const other = x.up + c.other.path.slice(1);
  const es = c.lang.startsWith('es');
  const cfg = x.config;
  const n0 = new Intl.NumberFormat(c.locale, { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat(c.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pesos = v => (es ? `$ ${n0.format(v)}` : `CLP ${n0.format(v)}`);
  const million = v => (es ? `$ ${n1.format(v / 1e6)} millones` : `CLP ${n1.format(v / 1e6)} million`);
  const pct = v => `${n0.format(v)} %`;

  const mail = `mailto:${cfg.email}`;
  const booking = cfg.booking || `${mail}?subject=${encodeURIComponent(c.contact.mailSubject)}`;
  const waBase = cfg.whatsapp ? `https://wa.me/${cfg.whatsapp}` : '';
  const whatsapp = waBase ? `${waBase}?text=${encodeURIComponent(c.contact.waText)}` : `${mail}?subject=${encodeURIComponent(c.contact.mailSubject)}`;
  const ext = h => (/^https?:/.test(h) ? ' rel="noopener" target="_blank"' : '');
  // a call that carries a message: to WhatsApp when there is a number, otherwise into the form below
  const prefill = message => (waBase
    ? `href="${esc(`${waBase}?text=${encodeURIComponent(message)}`)}" data-prefill data-wa="${esc(waBase)}" data-message="${esc(message)}"${ext(waBase)}`
    : `href="#contacto" data-prefill data-message="${esc(message)}"`);
  const url = cfg.site + c.path;

  // ---------- the stages ----------
  const labels = c.stage.labels;
  const heroStage = stage('rutas', { W: 1440, H: 340, mx: 28, ctx: x.stages.hero, labels, aria: c.stage.aria });
  const figStage = scene => stage(scene, {
    W: 660, H: 220, ctx: x.stages.fig, labels, aria: c.stage.scenes[scene].join(' ')
  });
  const stageData = (scene, ctx) => `data-scene="${scene}" data-ctx="${esc(JSON.stringify(ctx))}" data-labels="${esc(JSON.stringify(labels))}"`;

  // ---------- the descents behind the first screen (tools/descent.py): the level sets and four runs to the
  // minimum; each run is a line its own shooting star draws (js/scenes.js sets them flying), its steps lighting
  // as the star passes ----------
  const sky = x.descent;
  const run = p => `<g class="run"><path class="trail" pathLength="1" d="${p.d}"/>`
    + `<g class="iterates">${p.dots.map(([cx, cy, f]) => `<circle cx="${cx}" cy="${cy}" r="1.8" data-f="${f}"/>`).join('')}</g>`
    + '</g>';
  const descent = `<svg class="descent" viewBox="0 0 ${sky.W} ${sky.H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" data-w="${sky.W}" data-h="${sky.H}" data-min="${sky.min.join(' ')}">`
    + `<image class="descent-map" href="${x.up}assets/descent-map.svg" width="${sky.W}" height="${sky.H}"/>` + sky.paths.map(run).join('')
    + `<circle class="descent-min" cx="${sky.min[0]}" cy="${sky.min[1]}" r="2.6"/></svg>`
    + '<canvas class="comets" aria-hidden="true"></canvas>';   // the stars, painted (js/scenes.js)

  // ---------- the route example ----------
  const ex = x.example;
  const saving = fill(c.routes.saving, {
    km: n0.format(ex.savedKm), pesos: pesos(Math.round(ex.savedKm * ex.cpk / 100) * 100),
    cpk: pesos(ex.cpk), year: million(ex.savedKm * ex.cpk * 250)
  });
  const stats = fill(c.routes.stats, { lo: pct(ex.stats.lo), hi: pct(ex.stats.hi), mean: pct(ex.stats.mean) });
  const fleet = { orders: n0.format(ex.orders), trucks: n0.format(ex.trucks) };

  // ---------- what the team gets: the example data, with its totals worked out ----------
  const xs = x.examples, g = c.gets;
  const ordered = xs.buy.filter(r => r[3] > 0).reduce((t, r) => t + r[3] * r[4], 0);
  const avoided = xs.buy.filter(r => r[3] === 0).reduce((t, r) => t + r[7] * r[4], 0);
  const buyRows = xs.buy.map(([k, stock, week, order, , sup, day]) => `<tr${order ? '' : ' class="is-skip"'}><th scope="row">${esc(g.buy.names[k])}</th><td>${n0.format(stock)}</td><td>${n0.format(week)}</td><td>${order ? n0.format(order) : esc(g.buy.none)}</td><td>${sup ? esc(sup) : ''}</td><td>${day ? esc(g.buy.days[day]) : ''}</td></tr>`).join('');
  const rt = xs.route;
  const stops = rt.stops.map(([t, place, comuna, pk, by], i) => `<li class="${i < 2 ? 'is-done' : i === 2 ? 'is-now' : ''}"><span class="ui-time">${t}</span><span class="ui-place">${esc(g.route.places[place])}<span>${esc(comuna)}${by ? `, ${esc(fill(g.route.before, { t: by }))}` : ''}</span></span><span class="ui-pk">${i < 2 ? esc(g.route.done) : esc(fill(g.route.packages, { n: pk }))}</span></li>`).join('');
  const rp = xs.report, last = rp.months[rp.months.length - 1][1], fewer = rp.baseline - last;
  const bars = [[g.report.baseline, rp.baseline, true], ...rp.months.map(([k, v]) => [g.report.months[k], v, false])];
  const chart = (() => {
    const W = 320, H = 190, top = 26, bottom = 156, max = rp.baseline, bw = 46, gap = (W - 24 - bars.length * bw) / (bars.length - 1);
    return `<svg class="ui-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(bars.map(([l, v]) => `${l}: ${v} ${g.report.unit}`).join(', '))}">${bars.map(([label, v, base], i) => {
      const bx = 12 + i * (bw + gap), h = (v / max) * (bottom - top), y = bottom - h;
      const show = base || i === bars.length - 1;
      return `<g class="${base ? 'is-base' : ''}"><title>${esc(`${label}: ${v} ${g.report.unit}`)}</title><rect x="${bx.toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}"/>${show ? `<text x="${(bx + bw / 2).toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle">${v}</text>` : ''}<text class="ui-axis" x="${(bx + bw / 2).toFixed(1)}" y="${H - 12}" text-anchor="middle">${esc(label)}</text></g>`;
    }).join('')}</svg>`;
  })();

  // ---------- the team and the proof, from config ----------
  const team = cfg.team;
  // the pilot: open places only once the founders confirm the number; until then, that it is open
  const pilotOpen = cfg.pilot && cfg.pilot.open > 0;
  const pilotLine = (t, open) => (cfg.pilot.confirmed ? fill(t, { n: cfg.pilot.open }) : open);
  const credits = x.credits.map(p =>
    `<a href="${p.page}">“${esc(p.title)}”</a> ${c.footer.by} ${esc(p.author)} (<a href="${p.licenceUrl}">${esc(p.licence)}</a>)`).join('; ');
  const sameAs = [cfg.linkedin, ...team.map(p => p.linkedin)].filter(Boolean);

  return `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.meta.title)}</title>
<meta name="description" content="${esc(c.meta.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="es-CL" href="${cfg.site}/">
<link rel="alternate" hreflang="en" href="${cfg.site}/en/">
<link rel="alternate" hreflang="x-default" href="${cfg.site}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="argmin">
<meta property="og:title" content="${esc(c.meta.title)}">
<meta property="og:description" content="${esc(c.meta.description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${es ? 'es_CL' : 'en_US'}">
<meta property="og:image" content="${cfg.site}/assets/og-${es ? 'es' : 'en'}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.meta.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1b2a47">
<link rel="icon" href="${x.up}assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${x.up}favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="${x.up}assets/apple-touch-icon.png">
<link rel="preload" href="${x.up}assets/fonts/sofia-sans-extra-condensed-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${x.up}css/site.css">
<script>${x.inlineScript}</script>
<script src="${x.up}js/site.js" defer></script>
<script type="module" src="${x.up}js/scenes.js"></script>
<script type="module" src="${x.up}js/calc.js"></script>
<script type="module" src="${x.up}js/routes.js"></script>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'argmin', url: `${cfg.site}/`,
    email: cfg.email, description: c.meta.description, areaServed: 'CL',
    address: { '@type': 'PostalAddress', addressLocality: 'Santiago', addressCountry: 'CL' },
    founder: team.map(p => ({ '@type': 'Person', name: p.name, ...(p.linkedin ? { sameAs: p.linkedin } : {}) })),
    ...(sameAs.length && cfg.linkedin ? { sameAs: [cfg.linkedin] } : {})
  })}</script>
</head>
<body>
<a class="skip" href="#main">${esc(c.skip)}</a>
<header class="top">
  <a class="wm" href="#top" aria-label="${esc(c.home)}">${x.wordmark}</a>
  <nav class="nav" aria-label="${esc(c.navLabel)}">${c.nav.map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join('')}</nav>
  <a class="lang" href="${other}" hreflang="${c.other.lang}" lang="${c.other.lang}">${esc(c.other.label)}</a>
  <a class="btn top-cta" href="${esc(booking)}"${ext(booking)}>${esc(c.action)}</a>
  <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${esc(c.menu.open)}"><i></i><i></i><i></i></button>
</header>
<nav class="menu" id="menu" aria-label="${esc(c.menu.label)}" hidden>
  <ul class="menu-list">${c.menuNav.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul>
  <div class="menu-foot">
    <a class="btn" href="${esc(booking)}"${ext(booking)}>${esc(c.action)}</a>
    <a href="${other}" hreflang="${c.other.lang}" lang="${c.other.lang}">${esc(c.other.label)}</a>
    <a href="${mail}" translate="no">${esc(cfg.email)}</a>
  </div>
</nav>

<main id="main">
  <section class="hero" aria-labelledby="hero-h">
    ${descent}
    <h1 class="mega" id="hero-h">${lines(c.hero.h1)}</h1>
    <div class="hero-side">
      <p class="hero-sub">${esc(c.hero.sub)}</p>
      <p class="hero-act"><a class="btn hero-cta" href="${esc(booking)}"${ext(booking)}>${esc(c.action)}</a> <a class="link" href="#calculadora">${esc(c.hero.calc)}</a></p>
      ${pilotOpen ? `<p class="hero-pilot">${esc(pilotLine(c.hero.pilot, c.hero.pilotOpen))}</p>` : ''}
    </div>
    <div class="stage stage-hero" data-stage="hero" ${stageData('rutas', x.stages.hero)} data-caps="${esc(JSON.stringify(c.stage.scenes))}">
      <div class="stage-bar">
        <div class="stage-ctl" role="group" aria-label="${esc(c.stage.group)}">${c.stage.tabs.map(([k, t], i) => `<button class="stage-tab" type="button" data-play="${k}" aria-pressed="${i === 0}">${esc(t)}</button>`).join('')}<button class="stage-pause" type="button" data-pause aria-pressed="false" data-on="${esc(c.stage.pause.on)}" data-off="${esc(c.stage.pause.off)}">${esc(c.stage.pause.on)}</button></div>
        <p class="stage-cap"><strong>${esc(c.stage.scenes.rutas[0])}</strong> <span>${esc(c.stage.scenes.rutas[1])}</span></p>
        <p class="stage-key"><span class="key-w">${esc(c.stage.key[0])}</span> <span class="key-a">${esc(c.stage.key[1])}</span></p>
      </div>
      ${heroStage}
      <div class="stage-truck" aria-hidden="true"></div>
    </div>
  </section>

  <section class="models" id="optimizamos" aria-labelledby="models-h">
    <div class="models-top">
      <h2 class="head" id="models-h">${lines(c.models.h2)}</h2>
      <div class="models-lead">
        <p class="body">${esc(c.models.lead)}</p>
        <p class="stage-key key-light"><span class="key-w">${esc(c.stage.key[0])}</span> <span class="key-a">${esc(c.stage.key[1])}</span></p>
      </div>
    </div>
    <ul class="model-list">
${c.models.list.map(([scene, t, d]) => `      <li class="model">
        <div class="model-text"><h3 class="model-h">${esc(t)}</h3><p class="body">${esc(d)}</p></div>
        <div class="stage stage-fig" data-stage="fig" ${stageData(scene, x.stages.fig)}>${figStage(scene)}</div>
      </li>`).join('\n')}
    </ul>
    <figure class="band">
      ${photo(x, 'meiggs', c.models.band.alt, 'band-img', '100vw')}
      <figcaption class="band-cap">${esc(c.models.band.caption)}</figcaption>
    </figure>
  </section>

  <section class="calc" id="calculadora" aria-labelledby="calc-h">
    <h2 class="head calc-head" id="calc-h">${lines(c.calc.h2)}</h2>
    <figure class="calc-pic">${photo(x, 'shelves', c.calc.alt, 'calc-img', '(max-width: 899px) 100vw, 42vw')}</figure>
    <p class="sr" id="c-help">${esc(c.calc.help)}</p>
    <form class="calc-form state" data-calc data-uf="${x.uf.value}" data-locale="${c.locale}" novalidate>
      <p>${esc(c.calc.before)} <span class="field"><label class="sr" for="c-inv">${esc(c.calc.inv.label)}</label><span class="unit">${esc(c.calc.inv.unit)}</span>&nbsp;<input id="c-inv" name="inv" inputmode="numeric" autocomplete="off" spellcheck="false" aria-describedby="c-help" value="${c.calc.inv.value}" size="${c.calc.inv.value.length}"></span> ${esc(c.calc.mid1)} <span class="field"><label class="sr" for="c-stale">${esc(c.calc.stale.label)}</label><input id="c-stale" name="stale" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="c-help" value="${c.calc.stale.value}" size="${c.calc.stale.value.length}"></span>&nbsp;${esc(c.calc.mid2)} <span class="field"><label class="sr" for="c-rate">${esc(c.calc.rate.label)}</label><input id="c-rate" name="rate" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="c-help" value="${c.calc.rate.value}" size="${c.calc.rate.value.length}"></span>&nbsp;${esc(c.calc.after)}</p>
    </form>
    <div class="calc-result" aria-live="polite">
      <p class="calc-fig"><output id="c-out" for="c-inv c-stale">${pesos(x.calcDefault.idle)}</output></p>
      <p class="state calc-says">${esc(c.calc.answer[0])} <output id="c-cost" for="c-inv c-stale c-rate">${pesos(Math.round(x.calcDefault.cost / 1000) * 1000)}</output> ${esc(c.calc.answer[1])} <output id="c-uf">${n1.format(x.calcDefault.cost / x.uf.value)}</output>&nbsp;${esc(c.calc.answer[2])}</p>
    </div>
    <div class="calc-foot">
      <p class="body">${esc(c.calc.note)}</p>
      <a class="btn btn-ink calc-cta" ${prefill(fill(c.calc.message, { inv: pesos(80e6), stale: c.calc.stale.value, rate: c.calc.rate.value }))} data-template="${esc(c.calc.message)}">${esc(c.calc.cta)}</a>
    </div>
  </section>

  <section class="routes" id="ejemplo" aria-labelledby="routes-h">
    <figure class="band band-top">
      ${photo(x, 'ruta5', c.routes.band.alt, 'band-img', '100vw')}
      <figcaption class="band-cap">${esc(c.routes.band.caption)}</figcaption>
    </figure>
    <div class="routes-top">
      <div class="routes-copy">
        <h2 class="head" id="routes-h">${lines(c.routes.h2)}</h2>
        <p class="body">${esc(fill(c.routes.lead, fleet))}</p>
        <p class="routes-ctl"><button class="textbtn" type="button" id="r-new" data-busy="${esc(c.routes.busy)}">${esc(c.routes.again)}</button> <button class="textbtn" type="button" id="r-compare" aria-pressed="false" hidden>${esc(c.routes.compare)}</button></p>
      </div>
      <figure class="map" data-routes data-seed="${ex.seed}" data-locale="${c.locale}" data-cpk="${ex.cpk}" data-saving="${esc(c.routes.saving)}">
        <div class="map-frame">
          <img class="map-base" src="${x.up}assets/santiago.svg" alt="" width="1000" height="750">
          <svg class="map-plan" viewBox="0 0 1000 750" role="img" aria-labelledby="map-title"><title id="map-title">${esc(fill(c.routes.mapTitle, fleet))}</title>${ex.svg}</svg>
          <div class="map-truck" aria-hidden="true"></div>
          <p class="map-key"><span class="key"><i class="k-plan"></i>${esc(c.routes.legend[0])}</span><span class="key"><i class="k-model"></i>${esc(c.routes.legend[1])}</span><span class="key"><i class="k-depot"></i>${esc(c.routes.legend[2])}</span></p>
          <p class="map-credit">${esc(c.routes.caption)}</p>
        </div>
      </figure>
    </div>
    <div class="specs" aria-live="polite">
      <figure class="spec spec-before"><p class="spec-fig"><span id="r-before">${n0.format(ex.naiveKm)}</span>&nbsp;${c.routes.unit}</p><figcaption class="spec-cap">${esc(c.routes.before)}</figcaption></figure>
      <figure class="spec spec-after"><p class="spec-fig"><span id="r-after">${n0.format(ex.bestKm)}</span>&nbsp;${c.routes.unit}</p><figcaption class="spec-cap">${esc(c.routes.after)}</figcaption></figure>
    </div>
    <div class="routes-foot">
      <p class="state" id="r-saving">${esc(saving)}</p>
      <p class="body">${esc(stats)}</p>
      <p class="small">${esc(c.routes.note)}</p>
    </div>
  </section>

  <section class="gets" id="herramientas" aria-labelledby="gets-h">
    <div class="gets-top">
      <h2 class="head" id="gets-h">${lines(g.h2)}</h2>
      <p class="body">${esc(g.lead)}</p>
    </div>
    <div class="gets-grid">
      <figure class="gets-item gets-buy">
        <div class="ui ui-buy" data-ui>
          <div class="ui-head"><p class="ui-title">${esc(g.buy.title)}</p><p class="ui-meta">${esc(g.buy.meta)}</p><span class="ui-tag">${esc(g.tag)}</span></div>
          <div class="ui-scroll"><table class="ui-table"><thead><tr>${g.buy.cols.map(t => `<th scope="col">${esc(t)}</th>`).join('')}</tr></thead><tbody>${buyRows}</tbody></table></div>
          <div class="ui-foot"><p class="ui-total">${esc(fill(g.buy.total, { pesos: pesos(ordered) }))}</p><p class="ui-finding">${esc(fill(g.buy.finding, { pesos: pesos(avoided) }))}</p></div>
        </div>
        <figcaption>${esc(g.buy.caption)}</figcaption>
      </figure>
      <figure class="gets-item gets-route">
        <div class="ui ui-route" data-ui>
          <div class="ui-head"><p class="ui-title">${esc(g.route.title)}</p><p class="ui-meta">${esc(fill(g.route.meta, { n: rt.stops.length, km: rt.km, t: rt.leaves }))}</p><span class="ui-tag">${esc(g.tag)}</span></div>
          <ol class="ui-stops">${stops}</ol>
          <p class="ui-back">${esc(fill(g.route.back, { t: rt.back }))}</p>
        </div>
        <figcaption>${esc(g.route.caption)}</figcaption>
      </figure>
      <figure class="gets-item gets-report">
        <div class="ui ui-report" data-ui>
          <div class="ui-head"><p class="ui-title">${esc(g.report.title)}</p><p class="ui-meta">${esc(g.report.meta)}</p><span class="ui-tag">${esc(g.tag)}</span></div>
          ${chart}
          <p class="ui-finding">${esc(fill(g.report.finding, { km: fewer, pct: pct(100 * fewer / rp.baseline), pesos: pesos(fewer * rp.days * ex.cpk) }))}</p>
        </div>
        <figcaption>${esc(g.report.caption)}</figcaption>
      </figure>
    </div>
  </section>

  <section class="how" id="como" aria-labelledby="how-h">
    <div class="how-top">
      <h2 class="head" id="how-h">${lines(c.how.h2)}</h2>
      <p class="body">${esc(c.how.lead)}</p>
    </div>
    <ol class="steps">
${c.how.stages.map(([t, p, cost, pic, alt], i) => `      <li class="step${i === 0 ? ' is-open' : ''}${pic ? ' has-pic' : ''}" data-step="${i}">
        <h3 class="step-h"><button class="step-btn" type="button" id="step-${i}-btn" aria-expanded="${i === 0}" aria-controls="step-${i}"><span>${esc(t)}</span></button></h3>
        <div class="step-body" id="step-${i}" role="region" aria-labelledby="step-${i}-btn">
          <div class="step-text"><p class="body">${esc(p)}</p><p class="step-cost">${esc(cost)}</p></div>
          ${pic ? `<figure class="step-pic">${photo(x, pic, alt, 'step-img', '(max-width: 899px) 100vw, 34vw')}</figure>` : ''}
        </div>
      </li>`).join('\n')}
    </ol>
  </section>

  <section class="prices" id="precios" aria-labelledby="prices-h">
    <h2 class="head" id="prices-h">${lines(c.prices.h2)}</h2>
    <div class="prices-body">
      <p class="prices-rule">${esc(c.prices.rule)}</p>
      <p class="body">${esc(c.prices.body)}</p>
      <p class="small">${esc(c.prices.note)}</p>
      ${pilotOpen ? `<div class="pilot"><p class="state">${esc(pilotLine(c.prices.pilot, c.prices.pilotOpen))}</p><a class="btn" ${prefill(c.prices.pilotMessage)}>${esc(c.prices.pilotCta)}</a></div>` : ''}
      ${cfg.proof.status ? `<p class="pilot-status">${esc(cfg.proof.status)}</p>` : ''}
    </div>
  </section>

  <section class="team" id="equipo" aria-labelledby="team-h">
    <h2 class="head" id="team-h">${lines(c.team.h2)}</h2>
    <article class="letter">
      <ul class="faces">${team.map(p => `<li class="face">${p.photo ? `<img src="${esc(p.photo)}" width="192" height="192" alt="${esc(p.name)}" loading="lazy" decoding="async">` : `<span aria-hidden="true">${esc(p.initials)}</span>`}</li>`).join('')}</ul>
${c.team.letter.map(p => `      <p>${esc(p)}</p>`).join('\n')}
      <p class="sign">${team.map(p => `<span>${esc(p.name)}${p.linkedin ? ` <a class="sign-in" href="${esc(p.linkedin)}"${ext(p.linkedin)}>${esc(c.team.linkedin)}</a>` : ''}</span>`).join('')}</p>
    </article>
  </section>

  <section class="faq" id="preguntas" aria-labelledby="faq-h">
    <h2 class="head" id="faq-h">${lines(c.faq.h2)}</h2>
    <div class="qs">
${c.faq.items.map(([q, a], i) => `      <div class="q${i === 0 ? ' is-open' : ''}">
        <h3 class="q-h"><button class="q-btn" type="button" id="q-${i}-btn" aria-expanded="${i === 0}" aria-controls="q-${i}">${esc(q)}</button></h3>
        <div class="q-a" id="q-${i}" role="region" aria-labelledby="q-${i}-btn"><div class="q-a-in"><p class="body">${esc(a)}</p></div></div>
      </div>`).join('\n')}
    </div>
  </section>

  <section class="contact" id="contacto" aria-labelledby="contact-h">
    <h2 class="mega contact-h" id="contact-h">${lines(c.contact.h2)}</h2>
    <ul class="rows">
      <li><a class="row" href="${esc(whatsapp)}"${ext(whatsapp)}><span>${esc(c.contact.rows.whatsapp)}</span></a></li>
      <li><a class="row" href="${esc(booking)}"${ext(booking)}><span>${esc(c.contact.rows.booking)}</span></a></li>
      <li class="row-wrap">
        <button class="row" type="button" id="form-btn" aria-expanded="true" aria-controls="form-panel"><span>${esc(c.contact.rows.form)}</span></button>
        <div class="form-panel" id="form-panel"><div class="form-panel-in">
          <form class="form" action="${x.up}api/contacto" method="post" data-form data-lang="${es ? 'es' : 'en'}"
                data-sending="${esc(c.contact.form.sending)}" data-ok="${esc(c.contact.form.ok)}"
                data-error="${esc(fill(c.contact.form.error, { email: cfg.email }))}" data-off="${esc(fill(c.contact.form.off, { email: cfg.email }))}"
                data-missing="${esc(c.contact.form.missing)}">
            <div class="f"><label for="f-name">${esc(c.contact.form.name)}</label><input id="f-name" name="nombre" autocomplete="name" required></div>
            <div class="f"><label for="f-company">${esc(c.contact.form.company)}</label><input id="f-company" name="empresa" autocomplete="organization"></div>
            <div class="f"><label for="f-contact">${esc(c.contact.form.contact)}</label><input id="f-contact" name="contacto" autocomplete="email" spellcheck="false" required></div>
            <div class="f f-wide"><label for="f-msg">${esc(c.contact.form.message)}</label><textarea id="f-msg" name="mensaje" rows="4" required></textarea></div>
            <div class="hp" aria-hidden="true"><label for="f-web">Web</label><input id="f-web" name="website" tabindex="-1" autocomplete="off"></div>
            <div class="form-end">
              <button class="submit" type="submit">${esc(c.contact.form.submit)}</button>
              <p class="small">${esc(c.contact.form.privacy)}</p>
            </div>
            <p class="form-status" role="status" aria-live="polite"></p>
          </form>
        </div></div>
      </li>
    </ul>
  </section>
</main>

<footer class="end">
  <div class="end-top">
    <p>${c.footer.about.map(esc).join('<br>')}</p>
    <a class="link" href="#top">${esc(c.footer.back)}</a>
  </div>
  <p class="end-mail" translate="no"><a href="${mail}">${esc(cfg.email.split('@')[0])}@<wbr>${esc(cfg.email.split('@')[1])}</a></p>
  <div class="end-meta">
    <p class="end-links"><a href="${other}" hreflang="${c.other.lang}" lang="${c.other.lang}">${esc(c.other.label)}</a>${cfg.linkedin ? ` <a href="${esc(cfg.linkedin)}"${ext(cfg.linkedin)}>${esc(c.footer.linkedin)}</a>` : ''}</p>
    <p class="credits">${c.footer.photos}: ${credits}, ${c.footer.via}. ${esc(c.footer.licence)} ${esc(c.footer.map)}</p>
    <p>${cfg.company.name && cfg.company.rut ? `${esc(fill(c.footer.legal, cfg.company))}<br>` : ''}${esc(c.footer.place)}</p>
  </div>
</footer>
</body>
</html>
`;
}
