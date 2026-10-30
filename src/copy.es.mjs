/* The Spanish page (es-CL, tú). Headings break where the arrays break. */
export default {
  lang: 'es-CL',
  locale: 'es-CL',
  path: '/',
  other: { lang: 'en', path: '/en/', label: 'English', short: 'EN' },
  meta: {
    title: 'argmin: optimización de stock, compras, rutas y turnos para pymes',
    description: 'Optimizamos stock, compras, rutas y turnos de pymes chilenas con modelos matemáticos y sus propios datos, y cobramos contra el ahorro medido en pesos. Diagnóstico de 2 semanas desde 15 UF.',
    ogAlt: 'argmin. Tu operación, al mínimo costo.'
  },
  skip: 'Saltar al contenido',
  home: 'argmin, inicio',
  navLabel: 'Secciones',
  nav: [['#optimizamos', 'Qué optimizamos'], ['#como', 'Cómo trabajamos'], ['#precios', 'Precios'], ['#equipo', 'Equipo'], ['#contacto', 'Contacto']],
  action: 'Agenda 30 minutos',
  menu: { open: 'Menú', close: 'Cerrar', label: 'Menú principal' },
  story: {
    salida: '8:00. Sale el camión.',
    pedido1: 'Primera entrega.',
    bodega: 'Vuelve a bodega: ¿cuánto stock está parado?',
    pedido2: 'Cada entrega deja una factura.',
    ruta5: 'Ruta 5 Norte: cada kilómetro cuesta.',
    solve: '18 pedidos, 2 camiones.',
    destino: 'Llegó. Ahora, hablemos.'
  },

  hero: {
    h1: ['Tu operación,', 'al mínimo costo.'],
    sub: 'Optimizamos stock, compras, rutas y turnos de tu pyme con modelos matemáticos y tus datos, y cobramos contra el ahorro en pesos.'
  },

  calc: {
    h2: ['Plata parada', 'en bodega.'],
    before: 'Tengo',
    inv: { label: 'Valor del inventario, en pesos', unit: '$', value: '80.000.000' },
    mid1: 'en inventario. El',
    stale: { label: 'Porcentaje del inventario sin movimiento en 90 días', value: '30' },
    mid2: '% no se ha movido en 90 días, y me financio al',
    rate: { label: 'Tasa de financiamiento mensual, en porcentaje', value: '1,5' },
    after: '% mensual.',
    answer: ['es lo que te cuesta al año esa plata parada, solo en intereses. Son', 'UF.'],
    note: 'No cuenta arriendo de bodega, seguros ni productos que se vuelven obsoletos. Cuánto de ese stock sobra de verdad lo mide el diagnóstico.',
    link: 'Pide el diagnóstico',
    hint: '¡Interactúa!',
    help: 'Cambia los tres números: el resultado se calcula con los tuyos.',
    alt: 'Repuestos ordenados en las estanterías de una bodega'
  },

  models: {
    h2: ['Si emites factura,', 'ya tienes datos.'],
    lead: 'Tus ventas y tus compras, producto por producto, están en tus documentos tributarios, tu ERP y tus planillas. Casi ninguna pyme las usa para decidir. Nosotros las ordenamos y las ponemos a trabajar. Si te faltan datos, armamos contigo la forma de empezar a juntarlos.',
    alt: 'Comercio mayorista en la calle Meiggs, Santiago',
    band: { alt: 'La Ruta 5 Norte vista desde el aire, entre campos y bodegas', caption: 'La Ruta 5 Norte desde el aire, saliendo de Santiago hacia el norte.' },
    list: [
      ['Stock y reposición', 'Cuánto pedir de cada producto y cuándo, para no quebrar stock ni llenar la bodega de lo que no se vende.'],
      ['Compras', 'A qué proveedor, cuánto y con qué anticipación, según precios, plazos y lo que vas a vender.'],
      ['Pronóstico de demanda', 'Cuánto vas a vender de cada producto, incluso de los que se venden poco y a saltos.'],
      ['Rutas y despachos', 'Qué camión lleva qué pedido y en qué orden, con ventanas horarias y capacidad.'],
      ['Turnos', 'Quién trabaja cuándo, para cubrir la demanda de cada hora sin horas extra de más.'],
      ['Producción', 'Qué fabricar primero y en qué máquina, para cumplir plazos con menos cambios de línea.']
    ]
  },

  routes: {
    h2: ['Mismos camiones,', 'menos kilómetros.'],
    lead: 'Un ejemplo de los seis, con pedidos inventados: una distribuidora en Quilicura reparte 18 pedidos con 2 camiones. Primero, el plan que arma una persona con criterio: cada camión su zona, y siempre al pedido más cercano. Después, el que encuentra un modelo en tu navegador, ahora mismo.',
    again: 'Otro día, otros pedidos',
    mapTitle: 'Mapa de Santiago con la bodega, 18 pedidos y las rutas de dos camiones',
    caption: 'Calles: © colaboradores de OpenStreetMap. Distancias aproximadas: 1,35 veces la línea recta.',
    legend: ['Camión 1', 'Camión 2', 'Bodega'],
    before: 'Plan hecho a mano',
    after: 'Plan del modelo',
    saving: 'Ahorro del día: {km} km, unos {pesos} a {cpk} por km. En 250 días hábiles, cerca de {year}.',
    stats: 'En 40 días de ejemplo como este, el modelo recortó entre {lo} y {hi} de los kilómetros, {mean} en promedio.',
    note: 'El costo por kilómetro es un supuesto para un camión 3/4: diésel cerca de $ 1.400 el litro y 8 km por litro (unos $ 175 por km), con el combustible como un 35 % del costo total. El diagnóstico usa el de tu flota.',
    unit: 'km'
  },

  how: {
    h2: ['Cómo trabajamos.'],
    lead: 'Primero medimos, después cobramos. Cada proyecto parte de una línea base que firmas tú, y termina con el ahorro medido contra ella.',
    stages: [
      ['Conversación', '30 minutos, gratis. Nos cuentas cómo operas hoy y vemos si hay un problema que valga la pena resolver. Si no lo hay, te lo decimos.', 'vega', 'La Vega Central, Santiago'],
      ['Diagnóstico', 'Dos semanas en tu operación. Revisamos qué datos tienes y cuáles faltan, firmamos la línea base (capital en bodega, quiebres de stock, horas, kilómetros) y te entregamos tres oportunidades con su ahorro estimado.', 'shelves', 'Repuestos en estanterías'],
      ['Datos', 'Ordenamos lo que ya existe: documentos del SII, tu ERP, cartolas, planillas. Lo que falta lo empezamos a registrar con flujos automáticos, para que los datos se junten solos.', '', ''],
      ['Modelo', 'Construimos el modelo de stock, compras, rutas o turnos, con una herramienta que tu equipo usa todos los días.', 'ruta5', 'La Ruta 5 Norte desde el aire'],
      ['Operación', 'Mensual. Mantenemos el modelo al día, lo monitoreamos y medimos el ahorro contra la línea base. Sin mantención, un modelo se degrada y el ahorro se pierde.', 'port', 'El puerto de San Antonio']
    ]
  },

  prices: {
    h2: ['Lo que cuesta.'],
    tiers: [
      { name: 'Diagnóstico', price: '15 a 25', unit: 'UF', from: 15,
        lines: ['2 semanas', 'Mapa de procesos y datos', 'Línea base firmada', '3 oportunidades con ahorro estimado', 'Se abona al proyecto'],
        cta: 'Agenda 30 minutos', href: 'booking' },
      { name: 'Proyecto', price: '40 a 300', unit: 'UF', from: 40,
        lines: ['Datos y automatización: 40 a 120 UF, de 3 a 6 semanas', 'Optimización: 100 a 300 UF, de 6 a 10 semanas', 'Integraciones con SII, ERP, banco y planillas', 'Modelo de stock, compras, rutas o turnos', 'Nunca más de un tercio del ahorro estimado del primer año'],
        cta: 'Cómo trabajamos', href: '#como' },
      { name: 'Operación', price: '8 a 30', unit: 'UF al mes', from: 8,
        lines: ['Contrato anual', 'Hosting y monitoreo', 'Soporte y ajustes', 'Medición del ahorro', 'Mejoras menores'],
        cta: 'Escríbenos por WhatsApp', href: 'whatsapp' }
    ],
    pesos: 'Hoy, {n} UF = {pesos}',
    note: 'Precios más IVA. UF del {date}: {uf} (SII). ¿Prefieres pagar por resultado? Un precio fijo menor más un 10 % a 20 % del ahorro medido en el primer año, contra la línea base firmada.'
  },

  team: {
    h2: ['Tres ingenieros,', 'en Santiago.'],
    letter: [
      'Somos Matías, Juan Pedro y Tomás. Estudiamos matemáticas e ingeniería en la UC y en la Universidad de los Andes, y llevamos años trabajando en optimización, aprendizaje automático y simulación.',
      'En las pymes vemos siempre lo mismo: la operación vive en planillas, los pedidos llegan por WhatsApp y nadie tiene tiempo de calcular cuánto cuesta hacerlo así. Las herramientas para calcularlo existen hace décadas; las usan las empresas grandes.',
      'argmin existe para llevarlas a empresas como la tuya, con una regla: todo se mide en pesos, contra una línea base que firmas tú.',
      'No vendemos licencias ni chatbots. Usamos solvers abiertos, nos conectamos con lo que ya usas (Bsale, Defontana, Nubox, Buk, el SII, tus planillas) y te dejamos una herramienta que tu equipo entiende.',
      'La primera conversación dura 30 minutos y no cuesta nada.'
    ],
    people: [['Matías Morgado', 'MM'], ['Juan Pedro Lira', 'JL'], ['Tomás Erdmannsdörffer', 'TE']]
  },

  faq: {
    h2: ['Preguntas.'],
    cards: [
      ['Privacidad', '¿Qué pasa con los datos de mi empresa?', 'Los tratamos como encargados: contrato de encargo de tratamiento, cifrado, gestor de secretos, registro de accesos y el mínimo acceso necesario. Las claves, como la del SII, solo con autorización escrita.'],
      ['Sin datos', '¿Y si no tengo datos ordenados?', 'Es lo más común. Si emites factura electrónica, ya tienes lo que vendes y lo que compras, producto por producto. Partimos de ahí y armamos contigo la forma de registrar lo que falta. El diagnóstico te dice qué datos hacen falta.'],
      ['Sistemas', '¿Tengo que cambiar mi ERP o mis planillas?', 'No. Nos conectamos con lo que ya usas: documentos tributarios y Registro de Compras y Ventas del SII, tu ERP (Bsale, Defontana, Nubox, Buk u otro), cartolas bancarias, planillas y WhatsApp Business.'],
      ['Ahorro', '¿Cómo miden el ahorro?', 'Antes de empezar firmamos una línea base con números de tu operación: capital en bodega, quiebres de stock, horas hombre o kilómetros. Al cerrar medimos los mismos números con el mismo método. La diferencia es el ahorro.'],
      ['Pago', '¿Y si no confío en el ahorro estimado?', 'Puedes pagar por resultado: un precio fijo menor más un 10 % a 20 % del ahorro medido durante el primer año.'],
      ['IA', '¿Usan inteligencia artificial?', 'Donde sirve: para leer facturas, órdenes y correos, siempre con revisión humana. Las decisiones (cuánto comprar, qué ruta, qué turno) las toma un modelo matemático que puedes revisar.']
    ]
  },

  contact: {
    h2: ['Hablemos.'],
    rows: { whatsapp: 'WhatsApp', booking: 'Agenda 30 minutos', form: 'Escríbenos aquí' },
    waText: 'Hola, quiero agendar 30 minutos con argmin.',
    mailSubject: 'Agendar 30 minutos con argmin',
    form: {
      name: 'Nombre', company: 'Empresa', contact: 'Correo o teléfono', message: '¿Qué quieres resolver?',
      submit: 'Enviar', privacy: 'Usamos tus datos solo para responderte.',
      sending: 'Enviando…', ok: 'Recibido. Te escribimos pronto.',
      error: 'No pudimos enviarlo. Escríbenos a {email}.',
      off: 'El formulario todavía no está conectado. Escríbenos a {email}.',
      missing: 'Falta tu nombre, cómo contactarte o qué quieres resolver.'
    }
  },

  footer: {
    about: ['argmin, Santiago de Chile.', 'Optimización y automatización para pymes.'],
    back: 'Volver arriba',
    place: 'Santiago, 2026',
    photos: 'Dibujos a partir de fotos',
    licence: 'Los dibujos se comparten bajo CC BY-SA 4.0.',
    via: 'vía Wikimedia Commons',
    by: 'de',
    map: 'Mapa: © colaboradores de OpenStreetMap (ODbL).'
  }
};
