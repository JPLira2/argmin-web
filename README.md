# argmin.cl

The site of argmin: optimization and automation for Chilean pymes. One page in Spanish (`/`) and
English (`/en/`), static HTML, CSS and JavaScript with no framework, served by Cloudflare Pages.

## What is on the page

The page shows the same 18 marks (orders, products, shifts) moving from the plan a pyme has today, with
what it loses in turquoise, to the plan a model finds. The marks are small blocks, drawn by
`js/scene-layouts.js` and moved by `js/scenes.js`. The page is a paper desk with objects on it: navy
plates and one turquoise plate, lit from the upper left, white sheets, overlaps where sections meet,
and gradient descent drawn faintly across the navy (`tools/descent.py`). Greyscale photographs; Sofia
Sans and its extra condensed cut. `DESIGN.md` has the system.

1. **Tu operación, al mínimo costo.** A navy first screen. Under the headline, a stage plays the day
   once: the routes untangle and the truck drives the model's route (`js/truck.js`), the stock evens
   out, the shifts move to where the demand is, and everything settles at the bottom of the cost curve.
   Rutas, Stock and Turnos replay a scene; the pause button stops the day and replays it at the end.
2. **"Si emites factura, ya tienes datos".** The six things argmin optimizes, each beside its own small
   tray of blocks that plays each time it comes into view, then a photograph of calle Meiggs.
3. **"Plata parada en bodega".** A calculator on the turquoise plate: the visitor types their inventory, the
   share that has not moved in 90 days and their financing rate (the arrow keys step them), and reads
   the money tied up and what it costs a year in interest, in pesos and UF. Its button carries those
   numbers into WhatsApp, or into the form when there is no number yet.
4. **The route solve.** An example day (40 made-up orders, 4 trucks, Santiago) is solved in the browser
   by `js/vrp.js`: the plan by hand in turquoise, then the search untangling it in navy, with kilometres and
   pesos; then the truck drives the longest route, and the plan by hand can be laid over to compare.
5. **"Lo que recibe tu equipo".** Three pieces of the tools, with example data (`src/examples.mjs`): the
   week's purchase list, a driver's route sheet and the monthly saving against the baseline.
6. **How we work, how we charge (no amounts until prices are fixed), the founders' letter, questions,
   contact.**

A fixed bar holds the wordmark, the sections, the language and "Agenda 30 minutos" (on narrow screens,
the action and a burger that opens a full-screen menu). Without script the stages show their finished
scene and every section is complete; with reduced motion nothing moves by itself.

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
| `python -I tools/photos.py` | `assets/photos/*.webp` and `photos.json`: the photographs in `draft/originals/`, cropped and in greyscale | Pillow |
| `python tools/props.py http://127.0.0.1:5174` | `assets/3d/truck.webp`: the truck in 16 headings | Playwright with Chrome; `tools/props.html` loads three.js from a CDN |
| `python -I tools/wordmark.py <katex fonts dir>` | `assets/wordmark.svg`, `assets/favicon.svg` (Computer Modern outlines) | fontTools; KaTeX_Main-Regular.ttf and KaTeX_Math-Italic.ttf |
| `python -I tools/santiago.py <roads.json>` | `data/santiago.json` (OpenStreetMap motorways and the Mapocho) | an Overpass dump |
| `python tools/descent.py` | `src/descent.json` and `assets/descent.svg`: the texture of the navy plates, gradient descent on an irregular cost surface (its level sets and five runs to the minimum), as the drawing the first screen flies and as the mask for the other plates | numpy, scikit-image |
| `python tools/og.py http://127.0.0.1:5174` | `favicon.ico`, `assets/apple-touch-icon.png`, `assets/og-es.jpg`, `assets/og-en.jpg` | Playwright with Chrome |

## Deploying (Cloudflare Pages)

- **Build:** none. The output directory is the repository root, and Pages picks up `functions/`
  automatically.
- **Links are relative** (styles, scripts, fonts, pictures, the language switch, the API calls), so the
  same files also work under a folder: the preview on GitHub Pages, https://jplira2.github.io/argmin-web/,
  runs everything except `functions/` (the UF falls back to the build's value, and the form says it is off).
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

`node tools/build.mjs` lists everything still missing on every build. Each item is a placeholder in
`src/config.mjs` or a copy deck; the page leaves out what an empty one would show.

- [ ] **Get the domain:** register **argmin.cl** at NIC Chile, point it at Cloudflare Pages, and create
      the mailbox for `hola@argmin.cl`.
- [ ] **Contact:** the WhatsApp business number and the 30-minute booking link (`whatsapp`, `booking`).
      Until then those links open an email.
- [ ] **People and company:** each founder's LinkedIn URL and a square photo (`team`), argmin's LinkedIn
      page (`linkedin`), and the razón social and RUT (`company`) once the SpA is registered.
- [ ] **Pilot:** confirm the number of open places (`pilot.open`, then `confirmed: true`), or set it to 0
      to hide the pilot lines. Once the client agrees, one honest line on the pilot under way
      (`proof.status`) and, later, measured results (`proof.cases`).
- [ ] **Prices:** the page says how argmin charges; amounts in UF go in once they are fixed.
- [ ] **Real values:** the $ 500 per km assumption and its diesel price (check CNE Bencina en Línea), the
      calculator's defaults, and the example data in "Lo que recibe tu equipo".
- [ ] **Footage:** ten seconds filmed at a pilot client's warehouse (with permission) would replace a
      photograph band; no honest clip of this world exists in the open collections.
- [ ] **Blog.**
- [ ] **Optimize for Google:** verify argmin.cl in Search Console and submit `sitemap.xml`, set up a
      Google Business Profile, and tune the titles and descriptions to what pymes search for.
- [ ] Set the Resend variables, then send a test message.

## Credits

- **Photographs** (Wikimedia Commons), cropped and turned to greyscale, credited in the footer and shared
  under CC BY-SA 4.0, as the share-alike originals require:
  - "Pallereoler i Remise 3 01" by Leif Jørgensen (CC BY-SA 4.0);
  - "Campbell con Meiggs, Barrio Meiggs, Santiago" by Carlos Figueroa (CC BY-SA 4.0);
  - "La Vega Central en Santiago" by Mx. Granger (CC0);
  - "Ruta 5 Norte(Chile) vistaaerea" by Ivotoledo45 (CC BY-SA 4.0);
  - "Puerto San Antonio" by Sebastián Betancourt (CC BY 2.0).
- **Map data:** © OpenStreetMap contributors (ODbL).
- **Type:** Sofia Sans and Sofia Sans Extra Condensed (OFL). The wordmark is drawn from KaTeX's
  Computer Modern outlines (MIT).
