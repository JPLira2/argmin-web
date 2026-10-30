/* calc.js - "Plata parada en bodega": what idle stock costs in interest alone, from the visitor's
   own three numbers:

     cost a year = inventory × idle share × ((1 + monthly rate)^12 − 1)

   No promised saving: how much of that stock is surplus is what the diagnostic measures. Money
   accepts any thousands separator; percentages take a comma or a point as the decimal mark. A field
   that does not parse keeps the last good answer and says so (aria-invalid). The answer is announced
   once the visitor stops typing (aria-busy while typing). */
const form = document.querySelector('[data-calc]');

if (form) {
  const locale = form.dataset.locale;
  const es = locale === 'es-CL';
  const n0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  let uf = parseFloat(form.dataset.uf);

  const inv = form.querySelector('#c-inv');
  const stale = form.querySelector('#c-stale');
  const rate = form.querySelector('#c-rate');
  const out = document.getElementById('c-out');
  const outUf = document.getElementById('c-uf');
  const answer = out.closest('.calc-result');
  const fits = CSS.supports('field-sizing', 'content');

  const money = s => {
    const d = s.replace(/\D/g, '');
    return d ? parseInt(d, 10) : NaN;
  };
  const percent = s => {
    const t = s.trim().replace(',', '.');
    return /^(\d+(\.\d*)?|\.\d+)$/.test(t) ? parseFloat(t) : NaN;
  };
  const size = el => { if (!fits) el.style.width = `${Math.max(2, el.value.length) + 0.7}ch`; };

  function update() {
    const I = money(inv.value), S = percent(stale.value), R = percent(rate.value);
    const ok = [[inv, I > 0], [stale, S >= 0 && S <= 100], [rate, R >= 0 && R <= 20]];
    ok.forEach(([el, good]) => { el.setAttribute('aria-invalid', String(!good)); size(el); });
    if (!ok.every(([, good]) => good)) return;
    const cost = I * (S / 100) * ((1 + R / 100) ** 12 - 1);
    out.textContent = `${es ? '$' : 'CLP'} ${n0.format(Math.round(cost / 1000) * 1000)}`;
    outUf.textContent = n1.format(cost / uf);
  }

  function settle() {
    const I = money(inv.value);
    if (I > 0) inv.value = n0.format(I);
    update();
    answer.removeAttribute('aria-busy');
  }

  form.addEventListener('input', () => { answer.setAttribute('aria-busy', 'true'); update(); });
  form.addEventListener('change', settle);
  form.addEventListener('focusout', settle);
  form.addEventListener('submit', e => { e.preventDefault(); settle(); });
  document.addEventListener('uf', e => { uf = e.detail.valor; update(); });
  update();

  /* the hint: a small slanted note, "¡Interactúa!", just above a number box, with a short hooked arrow
     into it. Both are set from where the boxes really are (any width, either language): the box is the
     last one on the sentence's first line, where the space above is free. It draws itself once when the
     calculator comes into view, and steps aside as soon as the visitor types. */
  const section = form.closest('.calc');
  const hint = section.querySelector('.calc-hint');
  const arrow = section.querySelector('.calc-arrow');
  if (hint && arrow) {
    const line = arrow.querySelector('.calc-arrow-line');
    const head = arrow.querySelector('.calc-arrow-head');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const f = n => n.toFixed(1);

    const draw = () => {
      const base = section.getBoundingClientRect();
      const col = hint.offsetParent.getBoundingClientRect();
      const boxes = [inv, stale, rate].map(el => el.getBoundingClientRect());
      const first = Math.min(...boxes.map(r => r.top));
      const box = boxes.filter(r => r.top - first < 4).sort((a, b) => b.right - a.right)[0];
      const cx = box.left + box.width / 2;
      const w = hint.offsetWidth, h = hint.offsetHeight;
      const left = Math.min(cx + 26, col.right - w - 8);     // to the right of the box, inside the column
      const top = box.top - h - 22;
      hint.style.left = `${f(left - col.left)}px`;
      hint.style.top = `${f(top - col.top)}px`;
      // out of the note's left end, then down into the box; straight down when the note had to sit over it
      const ex = cx - base.left, ey = box.top - 5 - base.top;
      const hooked = cx < left - 12;
      const sx = (hooked ? left - 6 : left + 10) - base.left, sy = (hooked ? top + h * 0.6 : top + h + 4) - base.top;
      line.setAttribute('d', hooked
        ? `M${f(sx)} ${f(sy)}C${f(sx - 16)} ${f(sy)} ${f(ex)} ${f(ey - 14)} ${f(ex)} ${f(ey)}`
        : `M${f(sx)} ${f(sy)}C${f(sx)} ${f(sy + 8)} ${f(ex)} ${f(ey - 8)} ${f(ex)} ${f(ey)}`);
      head.setAttribute('d', `M${f(ex - 5)} ${f(ey - 7)}L${f(ex)} ${f(ey)}L${f(ex + 5)} ${f(ey - 7)}`);   // the end runs straight down
    };

    const play = () => {
      draw();
      if (!still) {
        const len = line.getTotalLength();
        line.style.strokeDasharray = String(len);
        line.style.strokeDashoffset = String(len);
        line.getBoundingClientRect();
        line.style.transition = 'stroke-dashoffset .6s cubic-bezier(.22, 1, .36, 1)';
        line.style.strokeDashoffset = '0';
      }
      section.classList.add('hinted');
    };

    if (still || !('IntersectionObserver' in window)) play();
    else {
      const io = new IntersectionObserver(entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        io.disconnect();
        play();
      }, { threshold: 0.4 });
      io.observe(section);
    }
    const redraw = () => {
      if (!section.classList.contains('hinted')) return;
      line.style.transition = ''; line.style.strokeDasharray = ''; line.style.strokeDashoffset = '';
      draw();
    };
    addEventListener('resize', redraw);
    if (document.fonts) document.fonts.ready.then(redraw);
    form.addEventListener('input', () => section.classList.add('used'), { once: true });
  }
}
