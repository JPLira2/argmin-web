---
name: argmin
description: Optimization for Chilean pymes, measured in pesos. Navy plates and one meltwater turquoise on a paper desk, lit from the upper left.
colors:
  paper: "#f6f7f4"
  paper-2: "#e9ebe6"
  sheet: "#ffffff"
  ink: "#111311"
  ink-2: "#3a3f3a"
  navy: "#1b2a47"
  navy-2: "#131f36"
  navy-3: "#263a60"
  navy-4: "#34507f"
  navy-note: "#b7bdc7"
  turquoise: "#22d3bb"
  turquoise-lit: "#3ddcc7"
  turquoise-deep: "#00897b"
typography:
  giant:
    fontFamily: "Sofia Sans Extra Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(64px, 15vw, 232px)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "0.004em"
  mega:
    fontFamily: "Sofia Sans Extra Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(48px, 8.8vw, 140px)"
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: "0.004em"
  head:
    fontFamily: "Sofia Sans Extra Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(40px, 5.6vw, 88px)"
    fontWeight: 900
    lineHeight: 0.96
    letterSpacing: "0.004em"
  state:
    fontFamily: "Sofia Sans, system-ui, sans-serif"
    fontSize: "clamp(22px, 2.2vw, 32px)"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "Sofia Sans, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.1vw, 19px)"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Sofia Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.45
rounded:
  plate: "16px"
  sheet: "10px"
  control: "6px"
  face: "50%"
spacing:
  s1: "8px"
  s2: "16px"
  s3: "24px"
  s4: "40px"
  s5: "64px"
  margin: "40px"
  inset: "12px"
  section: "clamp(88px, 8.6vw, 136px)"
components:
  button-primary:
    backgroundColor: "{colors.turquoise}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.turquoise-lit}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.small}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "48px"
  button-ink-hover:
    backgroundColor: "{colors.navy}"
  stage-tab:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.small}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  stage-tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  calc-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "4px 4px 0 0"
    padding: "0 0.22em"
  contact-row:
    backgroundColor: "{colors.navy-2}"
    textColor: "{colors.paper}"
    typography: "{typography.head}"
    rounded: "16px 16px 0 0"
    height: "112px"
  contact-row-hover:
    backgroundColor: "#314a78"
---

# Design System: argmin

## Overview

**Creative North Star: "Your data, rearranged to the minimum"**

argmin's site is a desk seen from above. Paper is the ground, and everything with a colour is an object lying
on it: navy plates for the first screen, the tools and the contact, one turquoise plate for the calculator,
white sheets for the map, the tool fragments, the questions and the founders' letter. Where two sections meet,
something crosses the edge, so nothing reads as a slide: the shelves photograph hangs over the calculator's
top, the map sheet lies across the foot of the highway photograph, the contact trays stack and rest on the
footer. The signature is the stage: the same 18 small blocks (orders, products, shifts) move from the plan a
pyme has today, with what it loses in turquoise, to the plan a model finds. Turquoise has one meaning across
the whole site, what is lost, and it also marks the one action that matters, so the colour is both the
problem and the way out.

The page proves instead of claiming. The route solve and the stock calculator run in the browser on the
visitor's screen, and the product appears as real fragments of its tools with example data, labelled as
such. Photographs are documentary and greyscale, one treatment for every picture.

The house lint's flat rules (no shadows or gradients at rest) are overridden here on purpose: the founders
asked for depth on 2 November 2026, after the flat version read like slides. Every shadow and gradient below
belongs to the depth system; none is decoration.

**Key Characteristics:**

- A paper desk with objects on it: navy plates (first screen, tools, contact), one turquoise plate (the
  calculator), white sheets. Never colour fields meeting edge to edge.
- One light, from the upper left. Plates are lit at the top left and cast navy shadows down and a little
  right; sheets lie at one of three heights.
- The navy plates carry gradient descent, the page's only texture: the level sets of an irregular cost surface
  and four runs down to its minimum, computed (`tools/descent.py`), never drawn by hand. It fades out towards
  the left of every plate, so it never sits behind a title. In the hero each run is a line its own shooting
  star draws, its steps lighting as the star passes: one every 6 s, round and round, and as the next sets off
  the last one's track is wiped, so one run shows at a time. The head goes out at the minimum and its tail
  slides in after it, every tail the same length on screen. At rest (no script, reduced motion) the last run
  shows. The lowest point, a small ring, sits in the clear between the offer and the scene's well, at every size.
- The marks are blocks with a lit top and a shaded side; the hero's scenes play in a well sunk into its plate.
- Display type is one ink, uppercase, never with an accented word.
- Motion explains a state change. Where the browser ties animation to the scroll, the hero sinks back as you
  leave it, each plate tips up into place within its first few hundred pixels on screen, and the tools' sheets
  settle flat as you reach them; never under reduced motion. The hero's one button (Pausar, Seguir) holds the
  day and the stars together, and once the day is over it holds the stars; they also stop while the hero is
  off screen.

## Colors

The palette is workwear and meltwater: navy plates, cool paper, ink, and a single turquoise, the colour of
the glacier lakes in the Andes.

### Primary

- **Turquoise** (`#22d3bb`): the main action (every primary button, with ink text at 9.9:1) and the
  calculator's plate. **Turquoise lit** (`#3ddcc7`) is the turquoise on navy (8.4:1; 9.6:1 in the hero's well)
  and under a pointer. **Turquoise deep** (`#00897b`) is the turquoise on paper (4:1): what is lost in every
  light figure, the plan by hand on the map, the "before" figure, focus rings on light grounds.

### Secondary

- **Workwear navy** (`#1b2a47`): the plates (first screen, tools, contact, the menu), the pilot, the open step
  and question, and in every light figure the plan of the model. **Navy deep** (`#131f36`) is the well the
  hero's scenes play in and the first contact tray; **navy step** (`#263a60`) carries furniture, hovers and
  the last tray; **navy line** (`#34507f`) draws the descent; **navy note** (`#b7bdc7`) is secondary text on
  navy (7.5:1).

### Neutral

- **Paper** (`#f6f7f4`): the desk, neutral and a hair cool, never cream.
- **Paper step** (`#e9ebe6`): the trays the service figures sit in, the form fields.
- **Sheet** (`#ffffff`): a sheet lying on the desk or held over a plate.
- **Ink** (`#111311`): all running text on light grounds and the footer, the floor under the contact plate.
  **Ink soft** (`#3a3f3a`): secondary notes only.

### Named Rules

**The Turquoise Means Waste Rule.** Turquoise marks what is lost, in every figure, and the primary action; it
never decorates a heading, a link or an icon. On paper it is always the deep turquoise; the bright one only on
navy, and as a fill with ink on it.

**The One Turquoise Plate Rule.** One section per page takes the turquoise plate: the calculator.

## Typography

**Display Font:** Sofia Sans Extra Condensed 900 (with Arial Narrow)
**Body Font:** Sofia Sans 400 to 600 (with system-ui)

One family in two widths. The display cut speaks at full volume in capitals; the text cut is calm.

### Hierarchy

- **Giant** (900, clamp 64 to 232 px, 0.86): the calculator's figure and the footer's address.
- **Mega** (900, clamp 48 to 140 px, 0.94): the contact heading, the route figures; the first screen's
  headline is set a touch smaller (clamp 48 to 132 px) so it keeps two lines in its seven columns.
- **Head** (900, clamp 40 to 88 px, 0.96): section headings and the contact rows.
- **Statement** (500 to 600, clamp 22 to 32 px, 1.3): the hero's supporting sentence, service names, the
  pricing rule, the calculator's sentence.
- **Body** (400, clamp 17 to 19 px, 1.55): running text, at most 58 characters a line.
- **Small** (600, 14 px, 1.45): captions, keys, controls, credits. Nothing meant to be read goes under 13 px.

### Named Rules

**The Two Lines Rule.** Every heading fits in two lines at every width; break where the copy's arrays break.

**The One Ink Rule.** A headline is one colour and one weight. Emphasis comes from size, never from a
coloured or italic word.

## Layout

A 12-column grid with 24 px gutters and one pair of outer margins (40 px desktop, 28 px tablet, 24 px phone).
Plates sit in from the screen's edges (12 px, 10, 8) and pad their content so its text lines up with the
page's margins. A section on the desk keeps 88 to 136 px above itself (72 on phones); only the last one
before a plate keeps it below too, so the desk has one rhythm. A heading sits 64 px above what it introduces
(40 px on phones). Breakpoints: 1179 px (the section links fold into the menu), 899 px (one column; the tool
sheets lie flat and keep a desk width), 599 px (phone type), 359 px (the bar's button folds into the menu).

## Elevation & Depth

One light, from the upper left. Shadows are tinted navy (teal under the turquoise plate), offset down and a
little right, and soft:

- **Lift 1**, sheets at rest (closed steps, questions): `0 1px 2px` and `1px 6px 14px -6px`.
- **Lift 2**, raised sheets (the letter, the photographs, open and hovered states): `0 2px 4px` and
  `3px 18px 36px -14px`.
- **Lift 3**, plates and the map: `0 4px 10px` and `6px 40px 80px -30px`.

Plates add a lit top edge (a 1 px inset highlight) and a soft light from the upper left. The turquoise plate is
meltwater: three soft pools on the turquoise (an aqua light from the upper left, a glacier-blue cast up on the
right, the depth down on the right), each fading along a cosine over nine stops so no pool has an edge or a
change of pace. Every plate's gradient is dithered: a seamless blue-noise tile around mid-grey
(`tools/grain.py`) laid on with soft-light moves each pixel a shade or two, so wide gradients never break into
8-bit steps and their colours stay as they are. Wells and trays are sunk: an inset shadow, no
outline. The tool sheets over the navy plate are held 0, 20 and 40 px high; they arrive on a plane tipped 14
degrees away that settles flat as you scroll to them, pivoting on its foot so nothing swings out past the plate.
The marks are blocks (face, lit top, shaded side) casting a soft shadow on their tray. Controls stay flat:
the depth is in the surfaces. A surface declares its elevation once, a shadow or a tone step, never a border
under a shadow.

## Shapes

Plates have 16 px corners (14 on phones), sheets 10 px, controls 6 px, the calculator's inputs 4 px at the
top. The founders' portraits are the one round shape. Thick bars (4 px) are graphic elements: the stock target,
the end of a shift, the cost curve, the calculator inputs' underline.

## Components

### Buttons

- **Primary:** turquoise, ink text, 14 px Sofia Sans 600, 48 px tall (44 on phones), 6 px corners, flat.
  Hover goes to turquoise lit; press scales to 0.97 in 0.1 s.
- **Ink:** the same shape in ink, for the turquoise plate (the calculator's call). Hover goes to navy.
- **Text button:** a 2 px underline that opens up on hover; disabled while it works ("Resolviendo…").

### Inputs

The calculator's three numbers are paper boxes on the turquoise plate with ink text and a 4 px ink underline,
sized to their content; an invalid value turns the box ink. Form fields are paper step, sunk, 6 px corners, no
border at rest; focus draws a 3 px deep turquoise ring, and an invalid field takes an ink border.

### Navigation

Wordmark left, four section links, the other language, and the turquoise "Agenda 30 minutos". Transparent with
paper text over the hero plate; paper ground and a soft shadow once the page moves; without script it leaves
with the hero. Under 1180 px the links fold into a full-screen navy plate, the descent and all, set in display
type.

### The Stage (signature)

18 blocks over a scene's furniture (a target bar, day columns, supplier lanes, the cost curve, routes). Every
scene has two moments: today, with what is lost in turquoise, and the model's plan. The blocks are the same
objects in every scene and move between arrangements (0.72 s in, 0.86 s to the plan, 20 ms stagger, ease
`cubic-bezier(.22, 1, .36, 1)`). A block is as deep as a quarter of a mark, less than the smallest gap between
two marks, so neighbours never cover each other. The hero's stage is a well sunk into its plate and plays the
day once, with Rutas, Stock and Turnos buttons and a pause; each service's stage is a tray pressed into the
desk that plays each time it comes into view. Reduced motion shows every scene finished.

### Product fragments

Pieces of argmin's tools with example data, marked `data-ui`: white sheets with quiet 1 px lines inside, 13 to
17 px Sofia Sans, tabular figures, an "Ejemplo" tag, and one finding stated in navy. They float over the navy
"tools" plate.

### Contact

A navy plate; the three ways in are trays stacked one over the next, rounded at the top, each casting a shadow
up onto the one above and stepping from navy deep to navy step. The plate rests on the ink footer.

## Do's and Don'ts

### Do:

- **Do** use turquoise only for what is lost and for the primary action, and the deep turquoise on paper.
- **Do** let something cross where two sections meet: a sheet over a photograph, a photograph over a plate.
- **Do** show the mechanism with real or labelled example data: a solve, a calculation, a tool fragment.
- **Do** keep every picture greyscale and credited in the footer.
- **Do** keep content visible without script: stages are drawn by the build at rest.

### Don't:

- **Don't** lay colour fields edge to edge or stack bands of paper: the page is a desk with objects, not
  slides.
- **Don't** put shadows or glows on buttons, or a border under a shadow; no glass, no blur, no generated
  noise. The only texture is the descent.
- **Don't** use the bright turquoise on paper for text, lines or marks (1.8:1).
- **Don't** let the texture sit behind a title: it fades out towards the left of every plate (and the top, on
  phones, where the headline runs the width).
- **Don't** invent proof: no clients, logos, testimonials or results until they are real.
- **Don't** bring back the page-long truck: it appears in the hero's route scene and the route solve only.
