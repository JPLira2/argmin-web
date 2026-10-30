/* The page, rendered once per language by tools/build.mjs. `c` is a copy deck (copy.es.mjs or
   copy.en.mjs), `x` the build context: config, wordmark, the example day, the UF, drawing sizes.
   The story (a truck that drives the page as it scrolls, js/story.js) runs through the [data-mark]
   points in document order (ways and pins); css/site.css places them. */

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : `{${k}}`));
// a heading's authored lines, each in its own mask for the rise; the space keeps them apart when read aloud
const lines = arr => arr.map(l => `<span class="ln"><span>${esc(l)}</span></span>`).join(' ');

// a drawing made from a photograph: the <img> shows it finished; js/draw.js swaps in the inline SVG and
// draws it as it scrolls into view (or once, on load, with on = 'load'); fit is its preserveAspectRatio
function draw(x, name, alt, cls, { fit = 'xMidYMid slice', on = '' } = {}) {
  const s = x.draws[name];
  return `<figure class="draw ${cls}" data-draw="/assets/draw/${name}.svg" data-fit="${fit}"${on ? ` data-on="${on}"` : ''}><img src="/assets/draw/${name}.svg" width="${s.w}" height="${s.h}" alt="${esc(alt)}" loading="${on === 'load' ? 'eager' : 'lazy'}" decoding="async"></figure>`;
}
// marks on the truck's road: a way bends it, a stop has a caption; a park stop holds the truck a while
// (park="end": for good), facing heading k of the sprite (k x 22.5 degrees)
const way = cls => `<span class="way ${cls}" data-mark aria-hidden="true"></span>`;
const stop = (cls, cap, park = '', face = '') =>
  `<span class="pin ${cls}" data-mark${park ? ` data-park="${park}"` : ''}${face !== '' ? ` data-face="${face}"` : ''} aria-hidden="true"><span class="pin-cap">${esc(cap)}</span></span>`;

export default function page(c, x) {
  const es = c.lang.startsWith('es');
  const n0 = new Intl.NumberFormat(c.locale, { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat(c.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const n2 = new Intl.NumberFormat(c.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pesos = v => (es ? `$ ${n0.format(v)}` : `CLP ${n0.format(v)}`);
  const million = v => (es ? `$ ${n1.format(v / 1e6)} millones` : `CLP ${n1.format(v / 1e6)} million`);
  const pct = v => `${n0.format(v)} %`;
  const [y, m, d] = x.uf.date.split('-').map(Number);
  const ufDate = new Intl.DateTimeFormat(es ? 'es-CL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
  const ufText = es ? `$ ${n2.format(x.uf.value)}` : `CLP ${n2.format(x.uf.value)}`;

  const mail = `mailto:${x.config.email}`;
  const booking = x.config.booking || `${mail}?subject=${encodeURIComponent(c.contact.mailSubject)}`;
  const whatsapp = x.config.whatsapp
    ? `https://wa.me/${x.config.whatsapp}?text=${encodeURIComponent(c.contact.waText)}`
    : `${mail}?subject=${encodeURIComponent(c.contact.mailSubject)}`;
  const href = h => (h === 'booking' ? booking : h === 'whatsapp' ? whatsapp : h);
  const ext = h => (/^https?:/.test(h) ? ' rel="noopener" target="_blank"' : '');
  const url = x.config.site + c.path;

  const ex = x.example;
  const saving = fill(c.routes.saving, {
    km: n0.format(ex.savedKm), pesos: pesos(Math.round(ex.savedKm * ex.cpk / 100) * 100),
    cpk: pesos(ex.cpk), year: million(ex.savedKm * ex.cpk * 250)
  });
  const stats = fill(c.routes.stats, { lo: pct(ex.stats.lo), hi: pct(ex.stats.hi), mean: pct(ex.stats.mean) });

  const credits = x.credits.map(p =>
    `<a href="${p.page}">“${esc(p.title)}”</a> ${c.footer.by} ${esc(p.author)} (<a href="${p.licenceUrl}">${esc(p.licence)}</a>)`).join('; ');

  return `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.meta.title)}</title>
<meta name="description" content="${esc(c.meta.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="es-CL" href="${x.config.site}/">
<link rel="alternate" hreflang="en" href="${x.config.site}/en/">
<link rel="alternate" hreflang="x-default" href="${x.config.site}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="argmin">
<meta property="og:title" content="${esc(c.meta.title)}">
<meta property="og:description" content="${esc(c.meta.description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${es ? 'es_CL' : 'en_US'}">
<meta property="og:image" content="${x.config.site}/assets/og-${es ? 'es' : 'en'}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.meta.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f6f7f4">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/sofia-sans-extra-condensed-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css">
<script>${x.inlineScript}</script>
<script src="/js/site.js" defer></script>
<script type="module" src="/js/calc.js"></script>
<script type="module" src="/js/routes.js"></script>
<script type="module" src="/js/draw.js"></script>
<script type="module" src="/js/story.js"></script>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'argmin', url: `${x.config.site}/`,
    email: x.config.email, description: c.meta.description, areaServed: 'CL',
    address: { '@type': 'PostalAddress', addressLocality: 'Santiago', addressCountry: 'CL' },
    founder: c.team.people.map(([name]) => ({ '@type': 'Person', name }))
  })}</script>
</head>
<body>
<a class="skip" href="#main">${esc(c.skip)}</a>
<header class="top" id="top">
  <a class="wm" href="#top" aria-label="${esc(c.home)}">${x.wordmark}</a>
  <a class="top-alt" href="${c.other.path}" hreflang="${c.other.lang}" lang="${c.other.lang}">${esc(c.other.label)}</a>
  <a class="top-alt btn" href="${esc(booking)}"${ext(booking)}>${esc(c.action)}</a>
  <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${esc(c.menu.open)}"><i></i><i></i><i></i></button>
</header>
<nav class="menu" id="menu" aria-label="${esc(c.menu.label)}" hidden>
  <ul class="menu-list">${c.nav.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul>
  <div class="menu-foot">
    <a class="btn btn-light" href="${esc(booking)}"${ext(booking)}>${esc(c.action)}</a>
    <a href="${c.other.path}" hreflang="${c.other.lang}" lang="${c.other.lang}">${esc(c.other.label)}</a>
    <a href="${mail}" translate="no">${esc(x.config.email)}</a>
  </div>
</nav>

<main id="main">
  <section class="hero" aria-labelledby="hero-h">
    <div class="hero-copy">
      <h1 class="mega" id="hero-h">${lines(c.hero.h1)}</h1>
      <p class="hero-sub">${esc(c.hero.sub)}</p>
      <a class="btn hero-cta" href="${esc(booking)}"${ext(booking)}>${esc(c.action)}</a>
    </div>
    ${draw(x, 'port', '', 'hero-ground', { fit: 'xMidYMin slice', on: 'load' })}
    ${stop('s-salida cap-left', c.story.salida)}${way('w-h1')}${stop('s-pedido1 cap-left', c.story.pedido1)}${way('w-h2')}
  </section>

  <section class="calc" id="calculadora" aria-labelledby="calc-h">
    ${way('w-c1')}
    <div class="calc-head">
      <h2 class="head" id="calc-h">${lines(c.calc.h2)}</h2>
      <p class="calc-hint" aria-hidden="true">${esc(c.calc.hint)}</p>
    </div>
    ${draw(x, 'shelves', c.calc.alt, 'draw-calc', { fit: 'xMidYMid meet' })}
    <svg class="calc-arrow" aria-hidden="true" focusable="false"><path class="calc-arrow-line"/><path class="calc-arrow-head"/></svg>
    <p class="sr" id="c-help">${esc(c.calc.help)}</p>
    <form class="calc-form state" data-calc data-uf="${x.uf.value}" data-locale="${c.locale}" novalidate>
      <p>${esc(c.calc.before)} <span class="field"><label class="sr" for="c-inv">${esc(c.calc.inv.label)}</label><span class="unit">${esc(c.calc.inv.unit)}</span>&nbsp;<input id="c-inv" name="inv" inputmode="numeric" autocomplete="off" spellcheck="false" aria-describedby="c-help" value="${c.calc.inv.value}" size="${c.calc.inv.value.length}"></span> ${esc(c.calc.mid1)} <span class="field"><label class="sr" for="c-stale">${esc(c.calc.stale.label)}</label><input id="c-stale" name="stale" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="c-help" value="${c.calc.stale.value}" size="${c.calc.stale.value.length}"></span>&nbsp;${esc(c.calc.mid2)} <span class="field"><label class="sr" for="c-rate">${esc(c.calc.rate.label)}</label><input id="c-rate" name="rate" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="c-help" value="${c.calc.rate.value}" size="${c.calc.rate.value.length}"></span>&nbsp;${esc(c.calc.after)}</p>
    </form>
    <div class="calc-result" aria-live="polite">
      <p class="calc-fig"><output id="c-out" for="c-inv c-stale c-rate">${pesos(Math.round(x.calcDefault.cost / 1000) * 1000)}</output></p>
      <p class="state calc-says">${esc(c.calc.answer[0])} <output id="c-uf">${n1.format(x.calcDefault.cost / x.uf.value)}</output>&nbsp;${esc(c.calc.answer[1])}</p>
    </div>
    <div class="prop prop-bodega">${way('w-c2')}<img src="/assets/3d/bodega.webp" width="661" height="556" alt="" loading="lazy" decoding="async">${stop('s-bodega cap-left', c.story.bodega, 'bodega', 8)}</div>
    <div class="calc-foot">
      <p class="body">${esc(c.calc.note)}</p>
      <a class="link" href="#contacto">${esc(c.calc.link)}</a>
    </div>
    ${way('w-c3')}
  </section>

  <section class="models" id="optimizamos" aria-labelledby="models-h">
    ${way('w-m1')}
    <div class="models-top">
      <div class="models-lead">
        <h2 class="head" id="models-h">${lines(c.models.h2)}</h2>
        <p class="body">${esc(c.models.lead)}</p>
      </div>
      <div class="models-pic">${way('w-mp')}${draw(x, 'meiggs', c.models.alt, 'draw-models', { fit: 'xMidYMid meet' })}${stop('s-pedido2 cap-up', c.story.pedido2)}${way('w-m2')}</div>
    </div>
    <ul class="model-list">
${c.models.list.map(([t, d]) => `      <li><h3 class="head">${esc(t)}</h3><p class="body">${esc(d)}</p></li>`).join('\n')}
    </ul>
    <div class="band">
      ${draw(x, 'ruta5', c.models.band.alt, 'draw-band')}
      <p class="band-cap">${esc(c.models.band.caption)}</p>
      ${way('w-m3')}${way('w-b0')}${way('w-b1')}${stop('s-ruta5 cap-right', c.story.ruta5)}${way('w-b2')}
    </div>
  </section>

  <section class="routes" id="ejemplo" aria-labelledby="routes-h">
    ${way('w-r1')}
    <div class="routes-top">
      ${stop('s-solve cap-lane', c.story.solve)}
      <div class="routes-copy">
        <h2 class="head" id="routes-h">${lines(c.routes.h2)}</h2>
        <p class="body">${esc(c.routes.lead)}</p>
        <button class="textbtn" type="button" id="r-new">${esc(c.routes.again)}</button>
      </div>
      <figure class="map" data-routes data-seed="${ex.seed}" data-locale="${c.locale}" data-cpk="${ex.cpk}" data-saving="${esc(c.routes.saving)}">
        <div class="map-frame">
          <img class="map-base" src="/assets/santiago.svg" alt="" width="1000" height="750">
          <p class="map-key"><span class="key"><i class="k1"></i>${esc(c.routes.legend[0])}</span><span class="key"><i class="k2"></i>${esc(c.routes.legend[1])}</span><span class="key"><i class="k3"></i>${esc(c.routes.legend[2])}</span></p>
          <svg class="map-plan" viewBox="0 0 1000 750" role="img" aria-labelledby="map-title"><title id="map-title">${esc(c.routes.mapTitle)}</title>${ex.svg}</svg>
        </div>
        <figcaption>${esc(c.routes.caption)}</figcaption>
      </figure>
    </div>
    <div class="specs" aria-live="polite">
      <figure class="spec"><p class="spec-fig"><span id="r-before">${n0.format(ex.naiveKm)}</span>&nbsp;${c.routes.unit}</p><figcaption class="spec-cap">${esc(c.routes.before)}</figcaption></figure>
      <figure class="spec"><p class="spec-fig"><span id="r-after">${n0.format(ex.bestKm)}</span>&nbsp;${c.routes.unit}</p><figcaption class="spec-cap">${esc(c.routes.after)}</figcaption></figure>
    </div>
    <div class="routes-foot">
      <p class="state" id="r-saving">${esc(saving)}</p>
      <p class="body">${esc(stats)}</p>
      <p class="small">${esc(c.routes.note)}</p>
    </div>
  </section>

  <section class="how" id="como" aria-labelledby="how-h">
    ${way('w-o1')}
    <div class="how-top">
      <h2 class="head" id="how-h">${lines(c.how.h2)}</h2>
      <p class="body">${esc(c.how.lead)}</p>
    </div>
    <ol class="stages">
${c.how.stages.map(([t, p, pic, alt], i) => `      <li class="stage${i === 0 ? ' is-open' : ''}" data-stage="${i}">
        <h3 class="stage-h"><button class="stage-btn" type="button" id="stage-${i}-btn" aria-expanded="${i === 0}" aria-controls="stage-${i}"><span>${esc(t)}</span></button></h3>
        <div class="stage-body" id="stage-${i}" role="region" aria-labelledby="stage-${i}-btn">
          <p class="body">${esc(p)}</p>
          ${pic ? draw(x, pic, alt, 'stage-pic') : ''}
        </div>
      </li>`).join('\n')}
    </ol>
  </section>

  <section class="prices" id="precios" aria-labelledby="prices-h">
    <h2 class="head" id="prices-h">${lines(c.prices.h2)}</h2>
    <ol class="tiers">
${c.prices.tiers.map((t, i) => `      <li class="tier tier-${i + 1}">
        <div class="tier-in">
          <h3 class="tier-name">${esc(t.name)}</h3>
          <p class="tier-price">${esc(t.price)}</p>
          <p class="tier-unit">${esc(t.unit)}</p>
          <p class="tier-pesos" data-pesos="${t.from}" data-template="${esc(c.prices.pesos)}">${esc(fill(c.prices.pesos, { n: t.from, pesos: pesos(Math.round(t.from * x.uf.value)) }))}</p>
          <ul class="tier-lines">${t.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
        </div>
        <a class="tier-cta" href="${esc(href(t.href))}"${ext(href(t.href))}>${esc(t.cta)}</a>
      </li>`).join('\n')}
    </ol>
    <p class="body prices-note" data-uf-note="${esc(c.prices.note)}">${esc(fill(c.prices.note, { date: ufDate, uf: ufText }))}</p>
  </section>

  <section class="team" id="equipo" aria-labelledby="team-h">
    ${way('w-t1')}${way('w-t2')}
    <h2 class="head" id="team-h">${lines(c.team.h2)}</h2>
    <article class="letter">
      <div class="faces" aria-hidden="true">${c.team.people.map(([, ini], i) => `<span class="face face-${i + 1}">${ini}</span>`).join('')}</div>
${c.team.letter.map(p => `      <p>${esc(p)}</p>`).join('\n')}
      <p class="sign">${c.team.people.map(([name]) => `<span>${esc(name)}</span>`).join('')}</p>
    </article>
  </section>

  <section class="faq" id="preguntas" aria-labelledby="faq-h">
    ${way('w-f1')}
    <h2 class="head" id="faq-h">${lines(c.faq.h2)}</h2>
    <div class="cards">
${c.faq.cards.map(([tab, q, a], i) => `      <div class="card card-${(i % 3) + 1}${i === 0 ? ' is-open' : ''}">
        <h3 class="card-h"><button class="card-btn" type="button" id="q-${i}-btn" aria-expanded="${i === 0}" aria-controls="q-${i}"><span class="tab">${esc(tab)}</span><span class="q">${esc(q)}</span></button></h3>
        <div class="card-a" id="q-${i}" role="region" aria-labelledby="q-${i}-btn"><div class="card-a-in"><p class="body">${esc(a)}</p></div></div>
      </div>`).join('\n')}
    </div>
  </section>

  <section class="contact" id="contacto" aria-labelledby="contact-h">
    ${way('w-k1')}
    <div class="contact-top">
      <h2 class="head" id="contact-h">${lines(c.contact.h2)}</h2>
      <div class="prop prop-office">${way('w-k2')}<img src="/assets/3d/office.webp" width="543" height="487" alt="" loading="lazy" decoding="async">${stop('s-destino cap-left', c.story.destino, 'end', 8)}</div>
    </div>
    <ul class="rows">
      <li><a class="row" href="${esc(whatsapp)}"${ext(whatsapp)}>${esc(c.contact.rows.whatsapp)}</a></li>
      <li><a class="row" href="${esc(booking)}"${ext(booking)}>${esc(c.contact.rows.booking)}</a></li>
      <li class="row-wrap">
        <button class="row" type="button" id="form-btn" aria-expanded="true" aria-controls="form-panel">${esc(c.contact.rows.form)}</button>
        <div class="form-panel" id="form-panel">
          <form class="form" action="/api/contacto" method="post" data-form data-lang="${es ? 'es' : 'en'}"
                data-sending="${esc(c.contact.form.sending)}" data-ok="${esc(c.contact.form.ok)}"
                data-error="${esc(fill(c.contact.form.error, { email: x.config.email }))}" data-off="${esc(fill(c.contact.form.off, { email: x.config.email }))}"
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
        </div>
      </li>
    </ul>
  </section>
</main>

<footer class="end">
  <div class="end-top">
    <p>${c.footer.about.map(esc).join('<br>')}</p>
    <a class="link" href="#top">${esc(c.footer.back)}</a>
  </div>
  <p class="end-mail" translate="no"><a href="${mail}">${esc(x.config.email.split('@')[0])}@<wbr>${esc(x.config.email.split('@')[1])}</a></p>
  <div class="end-meta">
    <a href="${c.other.path}" hreflang="${c.other.lang}" lang="${c.other.lang}">${esc(c.other.label)}</a>
    <p class="credits">${c.footer.photos}: ${credits}, ${c.footer.via}. ${esc(c.footer.licence)} ${esc(c.footer.map)}</p>
    <p>${esc(c.footer.place)}</p>
  </div>
</footer>
<div class="story" aria-hidden="true">
  <svg class="story-svg" focusable="false"><path class="road-rim"/><path class="road-plan"/><path class="road-case"/><path class="road-done"/></svg>
  <div class="truck"></div>
</div>
</body>
</html>
`;
}
