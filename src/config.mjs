/* What the page needs from the real world. Empty or placeholder values are listed by
   `node tools/build.mjs` on every build until they are filled. */
export default {
  site: 'https://argmin.cl',
  email: 'hola@argmin.cl',            // needs argmin.cl registered (NIC Chile) and a mailbox
  whatsapp: '',                       // business number with country code, digits only, e.g. 56912345678
  booking: '',                        // 30-minute booking page (Cal.com, Google Calendar appointments...)
  ufFallback: { value: 41237.01, date: '2026-10-29' }   // SII; the page asks /api/uf for today's
};
