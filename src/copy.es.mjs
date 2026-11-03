/* The Spanish page (es-CL, tú). Headings break where the arrays break. {name} slots are filled by
   src/page.mjs; numbers come from the build (the example days, the calculator, src/examples.mjs). */
export default {
  lang: 'es-CL',
  locale: 'es-CL',
  path: '/',
  other: { lang: 'en', path: '/en/', label: 'English', short: 'EN' },
  meta: {
    title: 'argmin: optimización de stock, compras, rutas y turnos para pymes',
    description: 'Optimizamos stock, compras, rutas y turnos de pymes chilenas con sus propios datos, y cobramos contra el ahorro medido en pesos.',
    ogAlt: 'argmin. Tu operación, al mínimo costo.'
  },
  skip: 'Saltar al contenido',
  home: 'argmin, inicio',
  navLabel: 'Secciones',
  nav: [['#optimizamos', 'Qué optimizamos'], ['#como', 'Cómo trabajamos'], ['#precios', 'Precios'], ['#equipo', 'Equipo']],
  menuNav: [['#optimizamos', 'Qué optimizamos'], ['#como', 'Cómo trabajamos'], ['#precios', 'Precios'], ['#equipo', 'Equipo'], ['#preguntas', 'Preguntas'], ['#contacto', 'Contacto']],
  action: 'Agenda 30 minutos',
  menu: { open: 'Menú', close: 'Cerrar', label: 'Menú principal' },

  hero: {
    h1: ['Tu operación,', 'al mínimo costo.'],
    sub: 'Stock, compras, rutas y turnos para pymes, con los datos que ya tienes. Cobramos según lo que ahorres.',
    calc: 'Calcula cuánta plata tienes parada',
    pilot: 'Quedan {n} cupos en nuestro programa piloto.',
    pilotOpen: 'Nuestro programa piloto está abierto.'
  },

  stage: {
    group: 'Escenas',
    aria: 'Animación con datos de ejemplo: las rutas, el stock y los turnos de una pyme, de cómo están hoy al plan de mínimo costo.',
    scenes: {
      rutas: ['Rutas.', 'Qué camión lleva qué pedido, y en qué orden.'],
      stock: ['Stock.', 'Lo que sobra deja de comprarse; lo que falta llega a tiempo.'],
      turnos: ['Turnos.', 'La gente, en los días en que hay trabajo.'],
      minimo: ['argmin.', 'El punto donde tu costo es mínimo.'],
      compras: ['Compras.', 'A qué proveedor, cuánto y con qué anticipación.'],
      pronostico: ['Pronóstico.', 'Cuánto vas a vender, semana a semana.'],
      produccion: ['Producción.', 'Menos cambios de línea, más pedidos en el turno.']
    },
    tabs: [['rutas', 'Rutas'], ['stock', 'Stock'], ['turnos', 'Turnos']],
    pause: { on: 'Pausar', off: 'Seguir', again: 'Ver de nuevo' },
    key: ['Lo que hoy se pierde', 'El plan del modelo'],
    labels: {
      turnos: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      compras: ['Proveedor A', 'Proveedor B', 'Proveedor C'],
      pronostico: ['Pronóstico'],
      produccion: ['Máquina 1', 'Máquina 2']
    }
  },

  models: {
    h2: ['Si emites factura,', 'ya tienes datos.'],
    lead: 'Tus ventas y tus compras, producto por producto, están en tus documentos tributarios, tu ERP y tus planillas. Casi ninguna pyme las usa para decidir. Nosotros las ordenamos y las ponemos a trabajar. Si te faltan datos, armamos contigo la forma de empezar a juntarlos.',
    list: [
      ['stock', 'Stock y reposición', 'Cuánto pedir de cada producto y cuándo, para no quebrar stock ni llenar la bodega de lo que no se vende.'],
      ['compras', 'Compras', 'A qué proveedor, cuánto y con qué anticipación, según precios, plazos y lo que vas a vender.'],
      ['pronostico', 'Pronóstico de demanda', 'Cuánto vas a vender de cada producto, incluso de los que se venden poco y a saltos.'],
      ['rutas', 'Rutas y despachos', 'Qué camión lleva qué pedido y en qué orden, con ventanas horarias y capacidad.'],
      ['turnos', 'Turnos', 'Quién trabaja cuándo, para cubrir la demanda de cada hora sin horas extra de más, dentro de las 42 horas semanales que rigen desde abril de 2026.'],
      ['produccion', 'Producción', 'Qué fabricar primero y en qué máquina, para cumplir plazos con menos cambios de línea.']
    ],
    band: { alt: 'Comercio en la esquina de Campbell con Meiggs, Santiago, con gente en la vereda', caption: 'Barrio Meiggs, Santiago. Cada venta deja una factura, y cada factura es un dato.' }
  },

  calc: {
    h2: ['Plata parada', 'en bodega.'],
    before: 'Tengo',
    inv: { label: 'Valor del inventario, en pesos', unit: '$', value: '80.000.000' },
    mid1: 'en inventario. El',
    stale: { label: 'Porcentaje del inventario sin movimiento en 90 días', value: '30' },
    mid2: '% no se ha movido en 90 días, y me financio al',
    rate: { label: 'Tasa de financiamiento mensual, en porcentaje', value: '1,5' },
    after: '% mensual.',
    answer: ['parados en productos que no se mueven. Solo en intereses, te cuestan', 'al año:', 'UF.'],
    note: 'No cuenta arriendo de bodega, seguros ni productos que se vuelven obsoletos. Cuánto de ese stock sobra de verdad lo mide el diagnóstico.',
    cta: 'Pide el diagnóstico con estos números',
    message: 'Hola, tengo {inv} en inventario, el {stale} % sin moverse en 90 días, y me financio al {rate} % mensual. Quiero conversar sobre el diagnóstico.',
    help: 'Cambia los tres números: el resultado se calcula con los tuyos. Las flechas arriba y abajo también los cambian.',
    alt: 'Estanterías de una bodega, llenas de repuestos y cajas'
  },

  routes: {
    band: { alt: 'La Ruta 5 Norte vista desde el aire, entre campos y bodegas', caption: 'La Ruta 5 Norte desde el aire, saliendo de Santiago.' },
    h2: ['Mismos camiones,', 'menos kilómetros.'],
    lead: 'Un ejemplo con pedidos inventados: una distribuidora en Quilicura reparte {orders} pedidos con {trucks} camiones. En turquesa, el plan que arma una persona con criterio: cada camión su zona, y siempre al pedido más cercano. En azul marino, el que encuentra un modelo en tu navegador, ahora mismo.',
    again: 'Otro día, otros pedidos',
    busy: 'Resolviendo…',
    compare: 'Comparar con el plan a mano',
    mapTitle: 'Mapa de Santiago con la bodega, {orders} pedidos y las rutas de {trucks} camiones',
    caption: 'Calles: © colaboradores de OpenStreetMap. Distancias aproximadas: 1,35 veces la línea recta.',
    legend: ['Plan a mano', 'Plan del modelo', 'Bodega'],
    before: 'Plan hecho a mano',
    after: 'Plan del modelo',
    saving: 'Ahorro del día: {km} km, unos {pesos} a {cpk} por km. En 250 días hábiles, cerca de {year}.',
    stats: 'En 40 días de ejemplo como este, el modelo recortó entre {lo} y {hi} de los kilómetros, {mean} en promedio.',
    note: 'El costo por kilómetro es un supuesto para un camión 3/4: diésel cerca de $ 1.400 el litro y 8 km por litro (unos $ 175 por km), con el combustible como un 35 % del costo total. El diagnóstico usa el de tu flota.',
    unit: 'km'
  },

  gets: {
    h2: ['Lo que recibe', 'tu equipo.'],
    lead: 'No un informe que se archiva: herramientas que tu equipo usa cada semana, hechas con los datos que ya tienes. Estos tres ejemplos son de una distribuidora de repuestos inventada.',
    tag: 'Ejemplo',
    buy: {
      title: 'Compra sugerida para el lunes',
      meta: 'Distribuidora de repuestos: 2.140 productos activos, 3 proveedores',
      cols: ['Producto', 'Stock', 'Vende por semana', 'Pedir', 'Proveedor', 'Llega'],
      names: {
        filtro: 'Filtro de aceite, camión', pastilla: 'Pastillas de freno, eje delantero', aceite: 'Aceite 15W-40, bidón de 20 L',
        correa: 'Correa de alternador', ampolleta: 'Ampolletas H7 24 V, caja de 10', bateria: 'Batería 12 V 100 Ah'
      },
      days: { mar: 'martes', mie: 'miércoles', jue: 'jueves' },
      none: 'No pedir',
      total: 'Compra de la semana: {pesos}',
      finding: 'Esta semana no se piden aceite ni ampolletas: {pesos} que no quedan parados en bodega.',
      caption: 'La compra de la semana: qué pedir, a quién y cuándo llega.'
    },
    route: {
      title: 'Camión 2, martes',
      meta: '{n} entregas, {km} km, sale a las {t}',
      places: {
        taller: 'Taller mecánico', distribuidora: 'Distribuidora', frenos: 'Taller de frenos', buses: 'Empresa de buses',
        lubricentro: 'Lubricentro', transportes: 'Transportes', diesel: 'Servicio diésel'
      },
      packages: '{n} bultos',
      before: 'antes de las {t}',
      back: 'Vuelve a Quilicura a las {t}',
      done: 'Entregado',
      caption: 'La hoja de ruta de cada camión, en el teléfono del conductor.'
    },
    report: {
      title: 'Kilómetros por día',
      meta: 'Contra la línea base firmada en el diagnóstico',
      baseline: 'Línea base',
      months: { ago: 'Ago', sep: 'Sep', oct: 'Oct' },
      finding: 'Octubre: {km} km menos por día que la línea base ({pct}), unos {pesos} en el mes.',
      caption: 'Cada mes, el ahorro medido contra la línea base que firmaste.',
      unit: 'km'
    }
  },

  how: {
    h2: ['Cómo trabajamos.'],
    lead: 'Primero medimos, después cobramos. Cada proyecto parte de una línea base que firmas tú, con los números de tu operación hoy, y termina con el ahorro medido contra ella.',
    stages: [
      ['Conversación', '30 minutos. Nos cuentas cómo operas hoy y vemos si hay un problema que valga la pena resolver. Si no lo hay, te lo decimos.', 'Gratis.', 'vega', 'Un pasillo de La Vega Central, Santiago, lleno de gente y de cajas'],
      ['Diagnóstico', 'Dos semanas en tu operación. Revisamos qué datos tienes y cuáles faltan, firmamos la línea base (capital en bodega, quiebres de stock, horas, kilómetros) y te entregamos tres oportunidades con su ahorro estimado.', 'Precio fijo, que se abona al proyecto.', '', ''],
      ['Datos', 'Ordenamos lo que ya existe: documentos del SII, tu ERP, cartolas, planillas. Lo que falta lo empezamos a registrar con flujos automáticos, para que los datos se junten solos.', 'Parte del proyecto.', '', ''],
      ['Modelo', 'Construimos el modelo de stock, compras, rutas o turnos, con una herramienta que tu equipo usa todos los días.', 'Precio fijo, que conoces al cerrar el diagnóstico.', '', ''],
      ['Operación', 'Mensual. Mantenemos el modelo al día, lo revisamos y medimos el ahorro contra la línea base. Sin mantención, un modelo se degrada y el ahorro se pierde.', 'Mensual y opcional.', 'port', 'El puerto de San Antonio desde un cerro, con grúas y contenedores']
    ]
  },

  prices: {
    h2: ['Cobramos', 'contra el ahorro.'],
    rule: 'Un proyecto nunca cuesta más de un tercio del ahorro estimado de su primer año.',
    body: '¿Prefieres pagar por resultado? Un precio fijo menor más un porcentaje del ahorro medido durante el primer año, contra la línea base firmada.',
    note: 'Te damos el precio al cerrar el diagnóstico, en UF más IVA.',
    pilot: 'Programa piloto: quedan {n} cupos, con condiciones de lanzamiento a cambio de poder contar el caso.',
    pilotOpen: 'Programa piloto: condiciones de lanzamiento a cambio de poder contar el caso.',
    pilotCta: 'Postula al piloto',
    pilotMessage: 'Hola, quiero postular al programa piloto de argmin.'
  },

  team: {
    h2: ['Tres ingenieros,', 'en Santiago.'],
    letter: [
      'Somos Matías, Juan Pedro y Tomás. Estudiamos matemáticas e ingeniería en la UC y en la Universidad de los Andes, y llevamos años trabajando en optimización y en modelos que predicen la demanda.',
      'En las pymes vemos siempre lo mismo: la operación vive en planillas, los pedidos llegan por WhatsApp y nadie tiene tiempo de calcular cuánto cuesta hacerlo así. Las herramientas para calcularlo existen hace décadas; las usan las empresas grandes.',
      'argmin existe para llevarlas a empresas como la tuya, con una regla: todo se mide en pesos, contra una línea base que firmas tú.',
      'No vendemos licencias ni chatbots. Usamos software abierto, nos conectamos con lo que ya usas (Bsale, Defontana, Nubox, Buk, el SII, tus planillas) y te dejamos una herramienta que tu equipo entiende.'
    ],
    linkedin: 'LinkedIn'
  },

  faq: {
    h2: ['Preguntas.'],
    items: [
      ['¿Qué pasa con los datos de mi empresa?', 'Los tratamos como encargados, según la Ley 21.719 de protección de datos personales: contrato de encargo, cifrado, registro de accesos y el mínimo acceso necesario. Las claves, como la del SII, solo con autorización escrita.'],
      ['¿Y si no tengo datos ordenados?', 'Es lo más común. Si emites factura electrónica, ya tienes lo que vendes y lo que compras, producto por producto. Partimos de ahí y armamos contigo la forma de registrar lo que falta. El diagnóstico te dice qué datos hacen falta.'],
      ['¿Tengo que cambiar mi ERP o mis planillas?', 'No. Nos conectamos con lo que ya usas: documentos tributarios y Registro de Compras y Ventas del SII, tu ERP (Bsale, Defontana, Nubox, Buk u otro), cartolas bancarias, planillas y WhatsApp Business.'],
      ['¿Cómo miden el ahorro?', 'Antes de empezar firmamos una línea base con los números de tu operación hoy: capital en bodega, quiebres de stock, horas hombre o kilómetros. Al cerrar medimos los mismos números con el mismo método. La diferencia es el ahorro.'],
      ['¿Puedo usar fondos de Sercotec o Corfo?', 'Algunas convocatorias, como el Fondo Crece o el Kit Digital de Sercotec, financian consultoría y digitalización. Cada una tiene sus fechas y requisitos: te ayudamos a revisar si tu caso calza con alguna que esté abierta.'],
      ['¿Usan inteligencia artificial?', 'Donde sirve: para leer facturas, órdenes y correos, siempre con revisión humana. Las decisiones (cuánto comprar, qué ruta, qué turno) las toma un modelo matemático que puedes revisar.'],
      ['¿Qué significa argmin?', 'En matemáticas, el argmin es el punto donde una función llega a su mínimo. Para tu empresa, la combinación de stock, rutas y turnos que menos le cuesta.']
    ]
  },

  contact: {
    h2: ['Hablemos.'],
    rows: { whatsapp: 'WhatsApp', booking: 'Agenda 30 minutos', form: 'Escríbenos aquí' },
    waText: 'Hola, quiero agendar 30 minutos con argmin.',
    mailSubject: 'Agendar 30 minutos con argmin',
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
    legal: '{name}, RUT {rut}.',
    linkedin: 'argmin en LinkedIn',
    photos: 'Fotos, en escala de grises y recortadas',
    licence: 'Las fotos adaptadas se comparten bajo CC BY-SA 4.0.',
    via: 'vía Wikimedia Commons',
    by: 'de',
    map: 'Mapa: © colaboradores de OpenStreetMap (ODbL).'
  }
};
