/* truck.js - the truck, for the two moments it appears: the hero's route scene and the route solve.

   The sprite (assets/3d/truck.webp, rendered by tools/props.html) holds sixteen isometric headings, frame k
   facing k x 22.5 degrees, with the ground point under the truck at each frame's centre. drive() moves an
   element along a polyline once, at an even pace with a soft start and stop, turning the sprite to the road
   as it goes, and leaves it parked at the last point. Decorative: the element is aria-hidden. */
const COS30 = Math.cos(Math.PI / 6), SIN30 = 0.5;

// the sprite's heading for a direction on screen: undo the isometric projection (x runs 30 degrees down to
// the right, z 30 degrees down to the left), then the angle about the vertical
function heading(dx, dy) {
  const a = dx / COS30, b = dy / SIN30;
  return Math.atan2(a - b, a + b);
}

export function face(el, dx, dy) {
  const k = ((Math.round(heading(dx, dy) / (Math.PI / 8)) % 16) + 16) % 16;
  el.style.backgroundPosition = `${(k * 100 / 15).toFixed(4)}% 0`;
}

export function place(el, x, y) {
  el.style.transform = `translate3d(${Math.round(x - el.offsetWidth / 2)}px, ${Math.round(y - el.offsetHeight / 2)}px, 0)`;
}

/* Drive el along pts ([[x, y], ...], in the element's offset parent's pixels). Resolves when parked, or
   early (false) when stillWanted() turns false, so a newer scene can take the stage. */
export function drive(el, pts, { speed = 0.4, min = 1400, max = 2800, stillWanted = () => true } = {}) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1];
  const at = s => {
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i++;
    const f = cum[i] > cum[i - 1] ? (s - cum[i - 1]) / (cum[i] - cum[i - 1]) : 0;
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
  };
  const ms = Math.max(min, Math.min(max, L / speed));
  const [x0, y0] = pts[0], [x1, y1] = pts[1];
  place(el, x0, y0);
  face(el, x1 - x0, y1 - y0);
  el.classList.add('is-on');
  return new Promise(resolve => {
    const t0 = performance.now();
    const step = now => {
      if (!stillWanted()) { resolve(false); return; }
      const t = Math.min(1, (now - t0) / ms), e = t * t * (3 - 2 * t);
      const s = e * L, [x, y] = at(s), [ax, ay] = at(Math.max(0, s - 8)), [bx, by] = at(Math.min(L, s + 8));
      place(el, x, y);
      if (bx !== ax || by !== ay) face(el, bx - ax, by - ay);
      if (t < 1) requestAnimationFrame(step); else resolve(true);
    };
    requestAnimationFrame(step);
  });
}
