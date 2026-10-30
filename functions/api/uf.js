/* GET /api/uf -> { valor, fecha, fuente } for today in Chile, read from SII's UF table
   (https://www.sii.cl/valores_y_fechas/uf/uf<year>.htm) and cached for six hours.
   The page carries a build-time value with its date, so a failure here costs nothing visible. */

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const TTL = 6 * 60 * 60;

const json = (body, status = 200, maxAge = 0) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': maxAge ? `public, max-age=${maxAge}` : 'no-store'
  }
});

function todayInChile() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).map(p => [p.type, p.value]));
  return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day) };
}

// SII's page: one <div class='meses' id='mes_octubre'> per month, then <strong>day</strong></th><td>41.237,01</td>
export function parseUf(html, month, day) {
  const start = html.search(new RegExp(`id=['"]mes_${MONTHS[month - 1]}['"]`));
  if (start < 0) return null;
  const next = html.indexOf('mes_', start + 8);
  const block = html.slice(start, next < 0 ? undefined : next);
  const cell = /<strong>\s*(\d{1,2})\s*<\/strong>\s*<\/th>\s*<td[^>]*>\s*([\d.]+,\d+)\s*<\/td>/g;
  for (let m = cell.exec(block); m; m = cell.exec(block)) {
    if (Number(m[1]) === day) return Number(m[2].replace(/\./g, '').replace(',', '.'));
  }
  return null;
}

export async function onRequestGet({ request, waitUntil }) {
  const cache = caches.default;
  const { y, m, d } = todayInChile();
  const fecha = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const key = new Request(new URL(`/api/uf?d=${fecha}`, request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  let html;
  try {
    const res = await fetch(`https://www.sii.cl/valores_y_fechas/uf/uf${y}.htm`, { cf: { cacheTtl: TTL, cacheEverything: true } });
    if (!res.ok) return json({ error: 'sii_unavailable' }, 502);
    html = await res.text();
  } catch {
    return json({ error: 'sii_unreachable' }, 502);
  }
  const valor = parseUf(html, m, d);
  if (!valor) return json({ error: 'not_found', fecha }, 502);

  const body = json({ valor, fecha, fuente: 'SII' }, 200, TTL);
  waitUntil(cache.put(key, body.clone()));
  return body;
}
