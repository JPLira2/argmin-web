/* calc.js - "Plata parada en bodega": how much money is tied up in stock that has not moved, and what it
   costs a year in interest alone, from the visitor's own three numbers:

     tied up     = inventory × idle share
     cost a year = tied up × ((1 + monthly rate)^12 − 1)

   No promised saving: how much of that stock is surplus is what the diagnostic measures. Money accepts any
   thousands separator; percentages take a comma or a point as the decimal mark; the arrow keys step each
   number (Shift for bigger steps). A field that does not parse keeps the last good answer and says so
   (aria-invalid). The answer is announced once the visitor stops typing (aria-busy while typing). The call
   under it carries the visitor's numbers into the message it opens. */
const form = document.querySelector('[data-calc]');

if (form) {
  const locale = form.dataset.locale;
  const es = locale === 'es-CL';
  const n0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nPct = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  let uf = parseFloat(form.dataset.uf);

  const inv = form.querySelector('#c-inv');
  const stale = form.querySelector('#c-stale');
  const rate = form.querySelector('#c-rate');
  const out = document.getElementById('c-out');
  const outCost = document.getElementById('c-cost');
  const outUf = document.getElementById('c-uf');
  const answer = out.closest('.calc-result');
  const cta = document.querySelector('.calc-cta');
  const fits = CSS.supports('field-sizing', 'content');

  const money = s => {
    const d = s.replace(/\D/g, '');
    return d ? parseInt(d, 10) : NaN;
  };
  const percent = s => {
    const t = s.trim().replace(',', '.');
    return /^(\d+(\.\d*)?|\.\d+)$/.test(t) ? parseFloat(t) : NaN;
  };
  const pesos = v => `${es ? '$' : 'CLP'} ${n0.format(v)}`;
  const size = el => { if (!fits) el.style.width = `${Math.max(2, el.value.length) + 0.7}ch`; };

  function update() {
    const I = money(inv.value), S = percent(stale.value), R = percent(rate.value);
    const ok = [[inv, I > 0], [stale, S >= 0 && S <= 100], [rate, R >= 0 && R <= 20]];
    ok.forEach(([el, good]) => { el.setAttribute('aria-invalid', String(!good)); size(el); });
    if (!ok.every(([, good]) => good)) return;
    const idle = I * (S / 100);
    const cost = idle * ((1 + R / 100) ** 12 - 1);
    out.textContent = pesos(Math.round(idle / 1000) * 1000);
    outCost.textContent = pesos(Math.round(cost / 1000) * 1000);
    outUf.textContent = n1.format(cost / uf);
    if (cta?.dataset.template) {
      const message = cta.dataset.template.replace('{inv}', pesos(I)).replace('{stale}', nPct.format(S)).replace('{rate}', nPct.format(R));
      cta.dataset.message = message;
      if (cta.dataset.wa) cta.href = `${cta.dataset.wa}?text=${encodeURIComponent(message)}`;
    }
  }

  function settle() {
    const I = money(inv.value);
    if (I > 0) inv.value = n0.format(I);
    update();
    answer.removeAttribute('aria-busy');
  }

  // up and down step the number under the caret: a million pesos (ten with Shift), one point, a tenth
  const steps = { inv: [1e6, 1e7], stale: [1, 10], rate: [0.1, 1] };
  form.addEventListener('keydown', e => {
    if ((e.key !== 'ArrowUp' && e.key !== 'ArrowDown') || !steps[e.target.name]) return;
    e.preventDefault();
    const el = e.target, sign = e.key === 'ArrowUp' ? 1 : -1, step = steps[el.name][e.shiftKey ? 1 : 0];
    if (el === inv) {
      const v = money(el.value);
      el.value = n0.format(Math.max(0, (v > 0 ? v : 0) + sign * step));
    } else {
      const v = percent(el.value), top = el === stale ? 100 : 20;
      const next = Math.min(top, Math.max(0, Math.round(((Number.isFinite(v) ? v : 0) + sign * step) * 10) / 10));
      el.value = nPct.format(next);
    }
    update();
  });

  form.addEventListener('input', () => { answer.setAttribute('aria-busy', 'true'); update(); });
  form.addEventListener('change', settle);
  form.addEventListener('focusout', settle);
  form.addEventListener('submit', e => { e.preventDefault(); settle(); });
  document.addEventListener('uf', e => { uf = e.detail.valor; update(); });
  update();
}
