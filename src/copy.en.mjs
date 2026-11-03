/* The English page. Same structure as copy.es.mjs. */
export default {
  lang: 'en',
  locale: 'en-US',
  path: '/en/',
  other: { lang: 'es-CL', path: '/', label: 'Español', short: 'ES' },
  meta: {
    title: 'argmin: stock, purchasing, routing and shift optimization for Chilean small businesses',
    description: 'We optimize stock, purchasing, routes and shifts for Chilean small businesses with their own data, and charge against savings measured in pesos.',
    ogAlt: 'argmin. Your operation, at minimum cost.'
  },
  skip: 'Skip to content',
  home: 'argmin, home',
  navLabel: 'Sections',
  nav: [['#optimizamos', 'What we optimize'], ['#como', 'How we work'], ['#precios', 'Pricing'], ['#equipo', 'Team']],
  menuNav: [['#optimizamos', 'What we optimize'], ['#como', 'How we work'], ['#precios', 'Pricing'], ['#equipo', 'Team'], ['#preguntas', 'Questions'], ['#contacto', 'Contact']],
  action: 'Book 30 minutes',
  menu: { open: 'Menu', close: 'Close', label: 'Main menu' },

  hero: {
    h1: ['Your operation,', 'at minimum cost.'],
    sub: 'Stock, purchasing, routes and shifts for small businesses, from your own data. We charge against what you save.',
    calc: 'Work out how much money sits idle',
    pilot: '{n} places left in our pilot programme.',
    pilotOpen: 'Our pilot programme is open.'
  },

  stage: {
    group: 'Scenes',
    aria: 'Animation with example data: a small business’s routes, stock and shifts, from how they are today to the lowest-cost plan.',
    scenes: {
      rutas: ['Routes.', 'Which truck carries which order, and in what sequence.'],
      stock: ['Stock.', 'What is surplus stops being bought; what is missing arrives on time.'],
      turnos: ['Shifts.', 'People on the days when there is work.'],
      minimo: ['argmin.', 'The point where your cost is lowest.'],
      compras: ['Purchasing.', 'Which supplier, how much and how far ahead.'],
      pronostico: ['Forecast.', 'How much you will sell, week by week.'],
      produccion: ['Production.', 'Fewer changeovers, more orders in the shift.']
    },
    tabs: [['rutas', 'Routes'], ['stock', 'Stock'], ['turnos', 'Shifts']],
    pause: { on: 'Pause', off: 'Resume', again: 'Play again' },
    key: ['What is lost today', 'The model’s plan'],
    labels: {
      turnos: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      compras: ['Supplier A', 'Supplier B', 'Supplier C'],
      pronostico: ['Forecast'],
      produccion: ['Machine 1', 'Machine 2']
    }
  },

  models: {
    h2: ['If you invoice,', 'you have data.'],
    lead: 'Every Chilean company issues electronic tax documents, and they list your sales and purchases product by product. Add your ERP and your spreadsheets, and most small businesses hold data they never use to decide anything. We put it in order and to work. Where data is missing, we help you start collecting it.',
    list: [
      ['stock', 'Stock and replenishment', 'How much of each product to order, and when, so you neither run out nor fill the warehouse with what doesn’t sell.'],
      ['compras', 'Purchasing', 'Which supplier, how much and how far ahead, given prices, lead times and what you will sell.'],
      ['pronostico', 'Demand forecasting', 'How much of each product you will sell, including the slow movers that sell in bursts.'],
      ['rutas', 'Routes and deliveries', 'Which truck carries which order, and in what sequence, within delivery windows and capacity.'],
      ['turnos', 'Shifts', 'Who works when, covering each hour’s demand without needless overtime, within the 42-hour week in force in Chile since April 2026.'],
      ['produccion', 'Production', 'What to make first and on which machine, to meet deadlines with fewer changeovers.']
    ],
    band: { alt: 'Shops on the corner of Campbell and Meiggs, Santiago, with people on the pavement', caption: 'Barrio Meiggs, Santiago. Every sale leaves an invoice, and every invoice is data.' }
  },

  calc: {
    h2: ['Money sitting', 'on shelves.'],
    before: 'I have',
    inv: { label: 'Inventory value, in Chilean pesos', unit: 'CLP', value: '80,000,000' },
    mid1: 'in inventory.',
    stale: { label: 'Share of inventory that has not moved in 90 days', value: '30' },
    mid2: '% of it hasn’t moved in 90 days, and I borrow at',
    rate: { label: 'Monthly interest rate, in percent', value: '1.5' },
    after: '% a month.',
    answer: ['sitting in products that don’t move. In interest alone, they cost you', 'a year:', 'UF.'],
    note: 'This leaves out warehouse rent, insurance and products that go obsolete. How much of that stock is truly surplus is what the diagnostic measures.',
    cta: 'Ask for the diagnostic with these numbers',
    message: 'Hi, I have {inv} in inventory, {stale} % of it idle for 90 days, and I borrow at {rate} % a month. I would like to talk about the diagnostic.',
    help: 'Change the three numbers: the result is worked out with yours. The up and down arrow keys change them too.',
    alt: 'Warehouse shelves full of spare parts and boxes'
  },

  routes: {
    band: { alt: 'Route 5 North seen from the air, between fields and warehouses', caption: 'Route 5 North from the air, leaving Santiago.' },
    h2: ['Same trucks,', 'fewer kilometres.'],
    lead: 'An example with made-up orders: a distributor in Quilicura delivers {orders} orders with {trucks} trucks. In turquoise, the plan a sensible person makes: each truck its zone, always driving on to the nearest order. In navy, the plan a model finds in your browser, right now.',
    again: 'Another day, other orders',
    busy: 'Solving…',
    compare: 'Compare with the plan by hand',
    mapTitle: 'Map of Santiago with the warehouse, {orders} orders and the routes of {trucks} trucks',
    caption: 'Streets: © OpenStreetMap contributors. Distances are approximate: 1.35 times the straight line.',
    legend: ['Planned by hand', 'The model’s plan', 'Warehouse'],
    before: 'Planned by hand',
    after: 'Planned by the model',
    saving: 'Saved today: {km} km, about {pesos} at {cpk} per km. Over 250 working days, close to {year}.',
    stats: 'Over 40 example days like this one, the model cut between {lo} and {hi} of the kilometres, {mean} on average.',
    note: 'The cost per kilometre is an assumption for a light truck: diesel near CLP 1,400 a litre at 8 km per litre (about CLP 175 per km), with fuel around 35 % of the total cost. The diagnostic uses your fleet’s own figure.',
    unit: 'km'
  },

  gets: {
    h2: ['What your team', 'gets.'],
    lead: 'Not a report that gets filed: tools your team uses every week, built on the data you already have. These three examples come from a made-up spare-parts distributor.',
    tag: 'Example',
    buy: {
      title: 'Suggested purchase for Monday',
      meta: 'Spare-parts distributor: 2,140 active products, 3 suppliers',
      cols: ['Product', 'Stock', 'Sells a week', 'Order', 'Supplier', 'Arrives'],
      names: {
        filtro: 'Oil filter, truck', pastilla: 'Brake pads, front axle', aceite: 'Engine oil 15W-40, 20 L drum',
        correa: 'Alternator belt', ampolleta: 'H7 24 V bulbs, box of 10', bateria: 'Battery 12 V 100 Ah'
      },
      days: { mar: 'Tuesday', mie: 'Wednesday', jue: 'Thursday' },
      none: 'Don’t order',
      total: 'This week’s purchase: {pesos}',
      finding: 'No oil or bulbs this week: {pesos} that doesn’t end up sitting in the warehouse.',
      caption: 'The week’s purchase: what to order, from whom, and when it arrives.'
    },
    route: {
      title: 'Truck 2, Tuesday',
      meta: '{n} deliveries, {km} km, leaves at {t}',
      places: {
        taller: 'Repair shop', distribuidora: 'Distributor', frenos: 'Brake workshop', buses: 'Bus company',
        lubricentro: 'Oil-change shop', transportes: 'Haulier', diesel: 'Diesel service'
      },
      packages: '{n} packages',
      before: 'before {t}',
      back: 'Back in Quilicura at {t}',
      done: 'Delivered',
      caption: 'Each truck’s route sheet, on the driver’s phone.'
    },
    report: {
      title: 'Kilometres a day',
      meta: 'Against the baseline signed in the diagnostic',
      baseline: 'Baseline',
      months: { ago: 'Aug', sep: 'Sep', oct: 'Oct' },
      finding: 'October: {km} km a day fewer than the baseline ({pct}), about {pesos} in the month.',
      caption: 'Every month, the saving measured against the baseline you signed.',
      unit: 'km'
    }
  },

  how: {
    h2: ['How we work.'],
    lead: 'We measure first and charge after. Every project starts from a baseline you sign, with your operation’s numbers today, and ends with the saving measured against it.',
    stages: [
      ['Conversation', '30 minutes. You tell us how you operate today and we see whether there is a problem worth solving. If there isn’t, we tell you.', 'Free.', 'vega', 'An aisle of La Vega Central market, Santiago, full of people and crates'],
      ['Diagnostic', 'Two weeks inside your operation. We review which data you have and which is missing, sign the baseline (capital in the warehouse, stock-outs, hours, kilometres) and hand you three opportunities with their estimated saving.', 'A fixed price, credited to the project.', '', ''],
      ['Data', 'We put in order what already exists: SII documents, your ERP, bank statements, spreadsheets. What is missing we start recording with automatic flows, so the data collects itself.', 'Part of the project.', '', ''],
      ['Model', 'We build the stock, purchasing, routing or shift model, with a tool your team uses every day.', 'A fixed price, known when the diagnostic closes.', '', ''],
      ['Operation', 'Monthly. We keep the model current, check it and measure the saving against the baseline. Without upkeep, a model degrades and the saving is lost.', 'Monthly, and optional.', 'port', 'The port of San Antonio from a hill, with cranes and containers']
    ]
  },

  prices: {
    h2: ['We charge', 'against savings.'],
    rule: 'A project never costs over a third of its first year’s estimated saving.',
    body: 'Prefer to pay for results? A lower fixed price plus a share of the saving measured over the first year, against the signed baseline.',
    note: 'You get the price when the diagnostic closes, in UF plus VAT (IVA). The UF is Chile’s inflation-indexed unit of account.',
    pilot: 'Pilot programme: {n} places left, on launch terms in exchange for being able to tell the story.',
    pilotOpen: 'Pilot programme: launch terms in exchange for being able to tell the story.',
    pilotCta: 'Apply for the pilot',
    pilotMessage: 'Hi, I would like to apply for the argmin pilot programme.'
  },

  team: {
    h2: ['Three engineers,', 'in Santiago.'],
    letter: [
      'We are Matías, Juan Pedro and Tomás. We studied mathematics and engineering at Pontificia Universidad Católica and Universidad de los Andes, and we have spent years on optimization and on models that forecast demand.',
      'In small businesses we keep seeing the same thing: operations run on spreadsheets, orders arrive on WhatsApp, and nobody has time to work out what it costs to do it that way. The tools to work it out have existed for decades; large companies use them.',
      'argmin exists to bring them to businesses like yours, with one rule: everything is measured in pesos, against a baseline you sign.',
      'We don’t sell licences or chatbots. We use open-source software, connect to what you already use (Bsale, Defontana, Nubox, Buk, the SII, your spreadsheets) and leave you a tool your team understands.'
    ],
    linkedin: 'LinkedIn'
  },

  faq: {
    h2: ['Questions.'],
    items: [
      ['What happens to my company’s data?', 'We handle it as data processors, under Chile’s data protection law (Ley 21.719): a processing agreement, encryption, access logs and the least access needed. Credentials, such as your SII password, only with written authorization.'],
      ['What if my data isn’t organised?', 'That is the usual case. If you issue electronic invoices, you already have what you sell and what you buy, product by product. We start there and set up with you a way to record what is missing. The diagnostic tells you which data you need.'],
      ['Do I have to change my ERP or my spreadsheets?', 'No. We connect to what you already use: SII tax documents and purchase and sales register, your ERP (Bsale, Defontana, Nubox, Buk or another), bank statements, spreadsheets and WhatsApp Business.'],
      ['How do you measure the saving?', 'Before we start we sign a baseline with your operation’s numbers today: capital in the warehouse, stock-outs, man-hours or kilometres. At the end we measure the same numbers the same way. The difference is the saving.'],
      ['Can I use Sercotec or Corfo funding?', 'Some calls, such as Sercotec’s Fondo Crece or Kit Digital, fund consulting and digitalization. Each has its own dates and requirements: we help you check whether your case fits one that is open.'],
      ['Do you use artificial intelligence?', 'Where it helps: to read invoices, orders and emails, always with a person checking. The decisions (how much to buy, which route, which shift) come from a mathematical model you can inspect.'],
      ['What does argmin mean?', 'In mathematics, the argmin is the point where a function reaches its minimum. For your company, the combination of stock, routes and shifts that costs it least.']
    ]
  },

  contact: {
    h2: ['Let’s talk.'],
    rows: { whatsapp: 'WhatsApp', booking: 'Book 30 minutes', form: 'Write to us here' },
    waText: 'Hi, I would like to book 30 minutes with argmin.',
    mailSubject: 'Booking 30 minutes with argmin',
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
    legal: '{name}, RUT {rut}.',
    linkedin: 'argmin on LinkedIn',
    photos: 'Photographs, in greyscale and cropped',
    licence: 'The adapted photographs are shared under CC BY-SA 4.0.',
    via: 'via Wikimedia Commons',
    by: 'by',
    map: 'Map: © OpenStreetMap contributors (ODbL).'
  }
};
