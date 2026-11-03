# Product

<!-- impeccable:product-schema 1 -->

Written on 2 November 2026 from the repository (README, `src/copy.*.mjs`, `draft/plan-de-empresa.md`) without an
interview: the founders asked for the work to proceed with placeholders. Lines marked *(inferred)* are hypotheses
from those documents; lines marked *(open)* wait for the founders.

## Platform

web

## Users

- Owners and operations managers of Chilean pymes (annual sales between 2.400 and 100.000 UF) with a physical
  operation: inventory, a delivery fleet or shifts. Often the owner decides alone, reads on a phone, and judges a
  supplier by whether it talks in pesos.
- First vertical *(inferred, a hypothesis in the business plan)*: B2B distribution and spare parts, with freight
  transport next to it.

## Product Purpose

argmin optimizes a pyme's stock, purchasing, routes, shifts and production with mathematical models and the
company's own data (tax documents, ERP, bank statements, spreadsheets), and charges against the saving measured in
pesos against a baseline the client signs. Success is a measured saving the client recognizes, and a monthly
subscription that keeps the model working.

## Positioning

Mathematical optimization, not generic "AI automation": replenishment with intermittent demand, routing, shift
planning and production scheduling with real solvers, connected to the Chilean systems pymes already use, with every
result measured against a signed baseline.

## Operating Context

- Data lives in SII documents (electronic invoices, Registro de Compras y Ventas), ERPs (Bsale, Defontana, Nubox,
  Buk), bank statements, spreadsheets and WhatsApp.
- The first contact is a free 30-minute conversation; then a two-week diagnostic, a project and a monthly operation.
- Prices are in UF plus IVA. The rule: a project never costs more than a third of the first year's estimated saving;
  a pay-for-results option exists.

## Capabilities and Constraints

- Static site: plain HTML, CSS and JavaScript rendered by `tools/build.mjs`, served by Cloudflare Pages with a strict
  Content-Security-Policy (`_headers`): no inline styles, no third-party hosts.
- Spanish (es-CL, tú) is the main page; English mirrors it.
- Prices are not fixed yet *(open)*: the page states how argmin charges, not amounts.
- A pilot runs in November and December 2026 *(inferred from the business plan; the client's name is not public)*.
- Not yet available *(open)*: WhatsApp number, booking link, LinkedIn pages, RUT and razón social, founders'
  photos, measured results.

## Brand Commitments

- Name: argmin, always lower case; the wordmark is drawn from Computer Modern ("arg min" with x below).
- Voice: plain Chilean Spanish, tú, short sentences, pesos before percentages, no hype, no "IA" as the pitch.
- No generated-page look: the founders keep a checklist of its tells in `draft/` (not published).

## Evidence on Hand

- Real: the in-browser route solve (`js/vrp.js`) and the stock calculator, both computed on the page.
- Real: found photographs of Santiago and of a warehouse (Wikimedia Commons, credited in the footer).
- Absent, never to be invented: clients, logos, testimonials, case results, business statistics. Example data is
  always labelled as example data.

## Product Principles

1. Everything is measured in pesos, against a baseline the client signs.
2. Show the mechanism working instead of claiming it.
3. Plain language first: the owner should not need to know what a model is.
4. Honest by default: example data says so; missing proof stays missing.

## Accessibility & Inclusion

WCAG 2.2 AA: contrast, keyboard access, visible focus, reduced motion respected, the page complete without script.
