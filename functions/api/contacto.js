/* POST /api/contacto - the contact form.

   Accepts JSON (from js/site.js) or a plain form post (without JavaScript). It forwards the message
   by email through Resend when these are set in the Cloudflare Pages project (Settings > Variables):

     RESEND_API_KEY   the API key
     CONTACT_TO       where messages go, e.g. hola@argmin.cl
     CONTACT_FROM     a sender on a domain verified in Resend, e.g. "argmin <web@argmin.cl>"

   Until they are set it answers 503 not_configured, and the page says so instead of pretending the
   message was sent. A hidden field catches simple bots. */

const json = (body, status) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  const type = request.headers.get('Content-Type') || '';
  const wantsJson = type.includes('application/json');
  let data;
  try {
    data = wantsJson ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  const back = (code) => (wantsJson ? json({ ok: code === 'ok', error: code === 'ok' ? undefined : code }, code === 'ok' ? 200 : code === 'not_configured' ? 503 : 400)
    : Response.redirect(new URL(`/${data.lang === 'en' ? 'en/' : ''}?form=${code}#contacto`, request.url).toString(), 303));

  if (clean(data.website, 200)) return back('ok');   // the hidden field: a bot filled it
  const nombre = clean(data.nombre, 120), empresa = clean(data.empresa, 160), contacto = clean(data.contacto, 200), mensaje = clean(data.mensaje, 5000);
  if (!nombre || !contacto || !mensaje) return back('missing');
  if (!env.RESEND_API_KEY || !env.CONTACT_TO) return back('not_configured');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM || 'argmin <web@argmin.cl>',
      to: [env.CONTACT_TO],
      reply_to: /@/.test(contacto) ? contacto : undefined,
      subject: `argmin.cl: ${nombre}${empresa ? `, ${empresa}` : ''}`,
      text: `Nombre: ${nombre}\nEmpresa: ${empresa || '-'}\nContacto: ${contacto}\nIdioma: ${data.lang === 'en' ? 'en' : 'es'}\n\n${mensaje}\n`
    })
  });
  return back(res.ok ? 'ok' : 'send_failed');
}
