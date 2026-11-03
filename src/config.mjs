/* What the page needs from the real world. An empty value is a placeholder: the page leaves out what it would
   show (the contact links fall back to email), and `node tools/build.mjs` lists every one on each build until
   it is filled. */
export default {
  site: 'https://argmin.cl',
  email: 'hola@argmin.cl',            // needs argmin.cl registered (NIC Chile) and a mailbox
  whatsapp: '',                       // business number with country code, digits only, e.g. 56912345678
  booking: '',                        // 30-minute booking page (Cal.com, Google Calendar appointments...)
  linkedin: '',                       // argmin's LinkedIn page URL here
  company: { name: '', rut: '' },     // razón social and RUT here, once the SpA is registered
  team: [                             // each founder's LinkedIn URL here, and a square photo (192 px or more) in assets/team/
    { name: 'Matías Morgado', initials: 'MM', linkedin: '', photo: '' },
    { name: 'Juan Pedro Lira', initials: 'JL', linkedin: '', photo: '' },
    { name: 'Tomás Erdmannsdörffer', initials: 'TE', linkedin: '', photo: '' }
  ],
  pilot: { open: 3, confirmed: false },   // pilot places still open (0 hides the pilot lines); the page shows the number only once confirmed
  proof: {
    status: '',                       // one honest line on the pilot under way, once the client agrees to it
    cases: []                         // measured results, once there are some: { company, sector, result, quote, person }
  },
  ufFallback: { value: 41237.01, date: '2026-10-29' }   // SII; the page asks /api/uf for today's
};
