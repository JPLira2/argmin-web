/* The English page. Same structure as copy.es.mjs. */
export default {
  lang: 'en',
  locale: 'en-US',
  path: '/en/',
  other: { lang: 'es-CL', path: '/', label: 'Español', short: 'ES' },
  meta: {
    title: 'argmin: stock, purchasing, routing and shift optimization for Chilean small businesses',
    description: 'We optimize stock, purchasing, routes and shifts for Chilean small businesses with mathematical models and their own data, and charge against savings measured in pesos. A 2-week diagnostic from 15 UF.',
    ogAlt: 'argmin. Your operation, at minimum cost.'
  },
  skip: 'Skip to content',
  home: 'argmin, home',
  navLabel: 'Sections',
  nav: [['#optimizamos', 'What we optimize'], ['#como', 'How we work'], ['#precios', 'Prices'], ['#equipo', 'Team'], ['#contacto', 'Contact']],
  action: 'Book 30 minutes',
  menu: { open: 'Menu', close: 'Close', label: 'Main menu' },
  story: {
    salida: '8:00. The truck leaves.',
    pedido1: 'First delivery.',
    bodega: 'Back to the warehouse: how much stock is sitting idle?',
    pedido2: 'Every delivery leaves an invoice.',
    ruta5: 'Route 5 North: every kilometre costs.',
    solve: '18 orders, 2 trucks.',
    destino: 'Arrived. Now, let’s talk.'
  },

  hero: {
    h1: ['Your operation,', 'at minimum cost.'],
    sub: 'We optimize a small business’s stock, purchasing, routes and shifts with mathematical models and its own data, and charge against measured savings.'
  },

  calc: {
    h2: ['Money sitting', 'on shelves.'],
    before: 'I have',
    inv: { label: 'Inventory value, in Chilean pesos', unit: 'CLP', value: '80,000,000' },
    mid1: 'in inventory.',
    stale: { label: 'Share of inventory that has not moved in 90 days', value: '30' },
    mid2: '% of it hasn’t moved in 90 days, and I borrow at',
    rate: { label: 'Monthly interest rate, in percent', value: '1.5' },
    after: '% a month.',
    answer: ['is what that idle stock costs you a year, in interest alone. That is', 'UF.'],
    note: 'This leaves out warehouse rent, insurance and products that go obsolete. How much of that stock is truly surplus is what the diagnostic measures.',
    link: 'Ask for the diagnostic',
    hint: 'Try it!',
    help: 'Change the three numbers: the result is worked out with yours.',
    alt: 'Spare parts on warehouse shelves'
  },

  models: {
    h2: ['If you invoice,', 'you have data.'],
    lead: 'Every Chilean company issues electronic tax documents, and they list your sales and purchases product by product. Add your ERP and your spreadsheets, and most small businesses hold data they never use to decide anything. We put it in order and to work. Where data is missing, we help you start collecting it.',
    alt: 'Wholesale trade on Meiggs street, Santiago',
    band: { alt: 'Route 5 North seen from the air, between fields and warehouses', caption: 'Route 5 North from the air, leaving Santiago for the north.' },
    list: [
      ['Stock and replenishment', 'How much of each product to order, and when, so you neither run out nor fill the warehouse with what doesn’t sell.'],
      ['Purchasing', 'Which supplier, how much and how far ahead, given prices, lead times and what you will sell.'],
      ['Demand forecasting', 'How much of each product you will sell, including the slow movers that sell in bursts.'],
      ['Routes and deliveries', 'Which truck carries which order, and in what sequence, within delivery windows and capacity.'],
      ['Shifts', 'Who works when, covering each hour’s demand without needless overtime.'],
      ['Production', 'What to make first and on which machine, to meet deadlines with fewer changeovers.']
    ]
  },

  routes: {
    h2: ['Same trucks,', 'fewer kilometres.'],
    lead: 'One example of the six, with made-up orders: a distributor in Quilicura delivers 18 orders with 2 trucks. First, the plan a sensible person makes: each truck its zone, always driving on to the nearest order. Then the plan a model finds in your browser, right now.',
    again: 'Another day, other orders',
    mapTitle: 'Map of Santiago with the warehouse, 18 orders and two trucks’ routes',
    caption: 'Streets: © OpenStreetMap contributors. Distances are approximate: 1.35 times the straight line.',
    legend: ['Truck 1', 'Truck 2', 'Warehouse'],
    before: 'Planned by hand',
    after: 'Planned by the model',
    saving: 'Saved today: {km} km, about {pesos} at {cpk} per km. Over 250 working days, close to {year}.',
    stats: 'Over 40 example days like this one, the model cut between {lo} and {hi} of the kilometres, {mean} on average.',
    note: 'The cost per kilometre is an assumption for a light truck: diesel near CLP 1,400 a litre at 8 km per litre (about CLP 175 per km), with fuel around 35 % of the total cost. The diagnostic uses your fleet’s own figure.',
    unit: 'km'
  },

  how: {
    h2: ['How we work.'],
    lead: 'We measure first and charge after. Every project starts from a baseline you sign, and ends with the saving measured against it.',
    stages: [
      ['Conversation', '30 minutes, free. You tell us how you operate today and we see whether there is a problem worth solving. If there isn’t, we tell you.', 'vega', 'La Vega Central market, Santiago'],
      ['Diagnostic', 'Two weeks inside your operation. We review which data you have and which is missing, sign the baseline (capital in the warehouse, stock-outs, hours, kilometres) and hand you three opportunities with their estimated saving.', 'shelves', 'Spare parts on shelves'],
      ['Data', 'We put in order what already exists: SII documents, your ERP, bank statements, spreadsheets. What is missing we start recording with automatic flows, so the data collects itself.', '', ''],
      ['Model', 'We build the stock, purchasing, routing or shift model, with a tool your team uses every day.', 'ruta5', 'Route 5 North from the air'],
      ['Operation', 'Monthly. We keep the model current, monitor it and measure the saving against the baseline. Without upkeep, a model degrades and the saving is lost.', 'port', 'The port of San Antonio']
    ]
  },

  prices: {
    h2: ['What it costs.'],
    tiers: [
      { name: 'Diagnostic', price: '15 to 25', unit: 'UF', from: 15,
        lines: ['2 weeks', 'Process and data map', 'Signed baseline', '3 opportunities with estimated saving', 'Credited to the project'],
        cta: 'Book 30 minutes', href: 'booking' },
      { name: 'Project', price: '40 to 300', unit: 'UF', from: 40,
        lines: ['Data and automation: 40 to 120 UF, 3 to 6 weeks', 'Optimization: 100 to 300 UF, 6 to 10 weeks', 'Integrations with SII, ERP, bank and spreadsheets', 'Stock, purchasing, routing or shift model', 'At most a third of the first year’s estimated saving'],
        cta: 'How we work', href: '#como' },
      { name: 'Operation', price: '8 to 30', unit: 'UF a month', from: 8,
        lines: ['Annual contract', 'Hosting and monitoring', 'Support and adjustments', 'Saving measured', 'Minor improvements'],
        cta: 'Message us on WhatsApp', href: 'whatsapp' }
    ],
    pesos: 'Today, {n} UF = {pesos}',
    note: 'Prices exclude VAT (IVA). The UF is Chile’s inflation-indexed unit of account; on {date} it was {uf} (SII). Prefer to pay for results? A lower fixed price plus 10 % to 20 % of the saving measured in the first year, against the signed baseline.'
  },

  team: {
    h2: ['Three engineers,', 'in Santiago.'],
    letter: [
      'We are Matías, Juan Pedro and Tomás. We studied mathematics and engineering at Pontificia Universidad Católica and Universidad de los Andes, and we have spent years on optimization, machine learning and simulation.',
      'In small businesses we keep seeing the same thing: operations run on spreadsheets, orders arrive on WhatsApp, and nobody has time to work out what it costs to do it that way. The tools to work it out have existed for decades; large companies use them.',
      'argmin exists to bring them to businesses like yours, with one rule: everything is measured in pesos, against a baseline you sign.',
      'We don’t sell licences or chatbots. We use open solvers, connect to what you already use (Bsale, Defontana, Nubox, Buk, the SII, your spreadsheets) and leave you a tool your team understands.',
      'The first conversation takes 30 minutes and costs nothing.'
    ],
    people: [['Matías Morgado', 'MM'], ['Juan Pedro Lira', 'JL'], ['Tomás Erdmannsdörffer', 'TE']]
  },

  faq: {
    h2: ['Questions.'],
    cards: [
      ['Privacy', 'What happens to my company’s data?', 'We handle it as data processors: a processing agreement, encryption, a secrets manager, access logs and the least access needed. Credentials, such as your SII password, only with written authorization.'],
      ['No data', 'What if my data isn’t organised?', 'That is the usual case. If you issue electronic invoices, you already have what you sell and what you buy, product by product. We start there and set up with you a way to record what is missing. The diagnostic tells you which data you need.'],
      ['Systems', 'Do I have to change my ERP or my spreadsheets?', 'No. We connect to what you already use: SII tax documents and purchase and sales register, your ERP (Bsale, Defontana, Nubox, Buk or another), bank statements, spreadsheets and WhatsApp Business.'],
      ['Saving', 'How do you measure the saving?', 'Before we start we sign a baseline with your operation’s numbers: capital in the warehouse, stock-outs, man-hours or kilometres. At the end we measure the same numbers the same way. The difference is the saving.'],
      ['Payment', 'What if I don’t trust the estimated saving?', 'You can pay for results: a lower fixed price plus 10 % to 20 % of the saving measured over the first year.'],
      ['AI', 'Do you use artificial intelligence?', 'Where it helps: to read invoices, orders and emails, always with a person checking. The decisions (how much to buy, which route, which shift) come from a mathematical model you can inspect.']
    ]
  },

  contact: {
    h2: ['Let’s talk.'],
    rows: { whatsapp: 'WhatsApp', booking: 'Book 30 minutes', form: 'Write to us here' },
    waText: 'Hi, I would like to book 30 minutes with argmin.',
    mailSubject: 'Booking 30 minutes with argmin',
    form: {
      name: 'Name', company: 'Company', contact: 'Email or phone', message: 'What do you want to solve?',
      submit: 'Send', privacy: 'We use your details only to reply to you.',
      sending: 'Sending…', ok: 'Received. We’ll write to you soon.',
      error: 'We couldn’t send it. Write to {email}.',
      off: 'The form isn’t connected yet. Write to {email}.',
      missing: 'Please add your name, how to reach you and what you want to solve.'
    }
  },

  footer: {
    about: ['argmin, Santiago, Chile.', 'Optimization and automation for small businesses.'],
    back: 'Back to top',
    place: 'Santiago, 2026',
    photos: 'Drawings after photographs',
    licence: 'The drawings are shared under CC BY-SA 4.0.',
    via: 'via Wikimedia Commons',
    by: 'by',
    map: 'Map: © OpenStreetMap contributors (ODbL).'
  }
};
