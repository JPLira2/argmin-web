/* The example data in "Lo que recibe tu equipo": a spare-parts distributor's week, made up and labelled as
   such on the page. Numbers only; the words are in the copy decks under the same keys. tools/build.mjs works
   out every total from these, so what the page states adds up. */
export default {
  // the purchase list: [key, stock, sold a week, to order, unit cost in CLP, supplier, arrives (day key)];
  // usual is what was bought each week before, for the lines the model says not to order
  buy: [
    ['filtro', 18, 22, 40, 7900, 'A', 'jue'],
    ['pastilla', 6, 9, 18, 38500, 'B', 'mie'],
    ['aceite', 31, 12, 0, 58900, '', '', 20],
    ['correa', 3, 4, 8, 14200, 'A', 'jue'],
    ['ampolleta', 54, 5, 0, 21500, '', '', 10],
    ['bateria', 4, 3, 6, 129900, 'C', 'mar']
  ],
  // a driver's day: [time, place key, comuna, packages, deliver before]
  route: {
    leaves: '8:00', back: '11:40', km: 41,
    stops: [
      ['8:20', 'taller', 'Renca', 3, ''],
      ['8:45', 'distribuidora', 'Cerro Navia', 6, ''],
      ['9:10', 'frenos', 'Lo Prado', 2, '10:00'],
      ['9:40', 'buses', 'Estación Central', 8, '11:00'],
      ['10:10', 'lubricentro', 'Quinta Normal', 2, ''],
      ['10:40', 'transportes', 'Conchalí', 5, ''],
      ['11:05', 'diesel', 'Huechuraba', 2, '']
    ]
  },
  // the monthly report: km a day, the signed baseline and three months after; working days in a month
  report: { baseline: 412, months: [['ago', 389], ['sep', 371], ['oct', 352]], days: 22 }
};
