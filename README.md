# argmin.cl

The site of argmin: optimization and automation for Chilean pymes. One page in Spanish (`/`) and
English (`/en/`), static HTML, CSS and JavaScript with no framework, served by Cloudflare Pages.

## What is on the page

The page is one delivery day. A road runs down it, mostly in a lane kept free on the right, and a
truck drives it as the visitor scrolls (`js/story.js`). It leaves at 8:00 in the first screen, docks at
the warehouse beside the stock calculator, delivers on calle Meiggs, takes the Ruta 5 Norte in the
drawing, passes the route solve, and parks for good at the office in the contact section. The
pictures are drawings made from photographs that draw themselves as they arrive (`js/draw.js`). The
truck, warehouse and office are rendered 3D props.

1. **Tu operación, al mínimo costo.** The first screen, over a drawing of the port of San Antonio.
2. **"Plata parada en bodega".** A calculator: the visitor types their inventory, the share that has
   not moved in 90 days and their financing rate, and reads what it costs a year in interest, in pesos
   and UF.
3. **"Si emites factura, ya tienes datos".** The six problems argmin optimizes, a street drawing, and
   the Ruta 5 band.
4. **The route solve.** An example day (18 made-up orders, 2 trucks, Santiago) is solved in the
   browser by `js/vrp.js`: the hand-made plan, then the search untangling it, with kilometres and
   pesos.
5. **How we work, prices in UF + IVA with today's pesos, the founders' letter, questions, contact.**

A fixed bar holds the wordmark and the menu (a burger that opens a full-screen menu). Without script
the bar shows the language link and the call instead, the drawings show finished, and there is no road.
With reduced motion the road is drawn whole and the truck waits at the warehouse.

## Working on it

```bash
node tools/build.mjs                  # renders index.html and en/index.html from src/
python -m http.server 5174            # then open http://127.0.0.1:5174/
```

Copy lives in `src/copy.es.mjs` and `src/copy.en.mjs`. Contact details live in `src/config.mjs`. The
page template is `src/page.mjs`. Rebuild after any change there.

Other tools, run only when their inputs change:

| Tool | Makes | Needs |
| --- | --- | --- |
| `python -I tools/drawings.py [name]` | `assets/draw/*.svg`, drawings from the photographs in `draft/originals/` | OpenCV, scikit-image, NumPy |
| `python tools/props.py http://127.0.0.1:5174` | `assets/3d/truck.webp` (16 headings), `bodega.webp`, `office.webp`; prints the door and parking spots for `css/site.css` | Playwright with Chrome; `tools/props.html` loads three.js from a CDN |
| `python -I tools/wordmark.py <katex fonts dir>` | `assets/wordmark.svg`, `assets/favicon.svg` (Computer Modern outlines) | fontTools; KaTeX_Main-Regular.ttf and KaTeX_Math-Italic.ttf |
| `python -I tools/santiago.py <roads.json>` | `data/santiago.json` (OpenStreetMap motorways and the Mapocho) | an Overpass dump |
| `python tools/og.py http://127.0.0.1:5174` | `favicon.ico`, `assets/apple-touch-icon.png`, `assets/og-es.jpg`, `assets/og-en.jpg` | Playwright with Chrome |

## Deploying (Cloudflare Pages)

- **Build:** none. The output directory is the repository root, and Pages picks up `functions/`
  automatically.
- **`/api/uf`** reads today's UF from SII's table and caches it for six hours. If SII is unreachable,
  the page keeps the UF value written at build time, with its date.
- **`/api/contacto`** sends the form through Resend once these variables are set in the Pages project:
  - `RESEND_API_KEY`;
  - `CONTACT_TO` (where messages go);
  - `CONTACT_FROM` (a sender on a domain verified in Resend).

  Until then the form says it is not connected and offers the email address. It never pretends a
  message was sent.
- **`_headers`** sets a strict Content-Security-Policy, with a hash for the one inline script, plus
  caching. Rebuilding refreshes it.

## Pending

- [ ] **Get the domain:** register **argmin.cl** at NIC Chile, point it at Cloudflare Pages, and create
      the mailbox for `hola@argmin.cl`.
- [ ] **Real values:** replace the sample figures with real ones, and confirm the sample copy:
  - "the first conversation is free";
  - the $ 500 per km assumption (diesel near $ 1.400 a litre, 8 km per litre, fuel about 35 % of the
    cost);
  - the calculator's defaults, and the example day's numbers (computed, and labelled as example data);
  - measured results from real projects, once there are some.
- [ ] **Blog.**
- [ ] **Optimize for Google:** verify argmin.cl in Search Console and submit `sitemap.xml`, set up a
      Google Business Profile, and tune the titles and descriptions to what pymes search for.
- [ ] Add the WhatsApp business number and the 30-minute booking link in `src/config.mjs`. Until then
      those links open an email.
- [ ] Replace the founders' initials with their photos (`.faces` in `src/page.mjs`).
- [ ] Set the Resend variables, then send a test message.

## Credits

- **Drawings** made from these photographs (Wikimedia Commons), credited in the footer and shared
  under CC BY-SA 4.0, as the share-alike originals require:
  - "Pallereoler i Remise 3 01" by Leif Jørgensen (CC BY-SA 4.0);
  - "Campbell con Meiggs, Barrio Meiggs, Santiago" by Carlos Figueroa (CC BY-SA 4.0);
  - "La Vega Central en Santiago" by Mx. Granger (CC0);
  - "Ruta 5 Norte(Chile) vistaaerea" by Ivotoledo45 (CC BY-SA 4.0);
  - "Puerto San Antonio" by Sebastián Betancourt (CC BY 2.0).
- **Map data:** © OpenStreetMap contributors (ODbL).
- **Type:** Sofia Sans and Sofia Sans Extra Condensed (OFL). The wordmark is drawn from KaTeX's
  Computer Modern outlines (MIT).
