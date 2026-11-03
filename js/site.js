/* site.js - the page around the live parts (plain script, no dependencies).

   - the entrance: the headline lines rise once the fonts are in; the bar, the offer and the button are
     there from the first frame
   - section headings rise once as they come into view, and the parts after them follow, a beat apart
   - the bar takes a ground once the page moves; the burger opens the menu over the page (narrow screens)
   - how we work and the questions: one open at a time
   - the contact form: a disclosure that opens in place, then a real request to /api/contacto (no fake
     success); calls that carry a message (the calculator's, the pilot's) fill it in and open it
   - today's UF from /api/uf, for the calculator
   Everything here only adds: without it the page is complete and still. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var smooth = reduced ? 'auto' : 'smooth';

  /* ---------- entrance, once the fonts are in (no reflow mid-rise) ---------- */
  function go() { root.classList.add('go'); }
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise(function (r) { setTimeout(r, 700); })]).then(function () { requestAnimationFrame(go); });
  setTimeout(go, 1800);   // never hold the headline back longer than this

  /* ---------- headings and the parts after them rise once ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var parts = '.models-lead, .model, .calc-form, .calc-result, .calc-foot, .routes-copy .body, .map, .specs, .routes-foot, ' +
      '.gets-top .body, .gets-item, .how-top .body, .steps, .prices-body, .letter, .qs, .rows';
    var io = new IntersectionObserver(function (entries) {
      var arriving = entries.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
      arriving.forEach(function (e, i) {
        if (e.target.classList.contains('rise')) e.target.style.setProperty('--rise', (i * 0.07).toFixed(2) + 's');
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
    var below = function (el) { return el.getBoundingClientRect().top > innerHeight; };   // already on screen: leave it be
    document.querySelectorAll('.head, .contact-h').forEach(function (h) {
      if (!h.querySelector('.ln') || !below(h)) return;
      h.classList.add('rv');
      io.observe(h);
    });
    document.querySelectorAll(parts).forEach(function (el) {
      if (!below(el)) return;
      el.classList.add('rise', 'rv');
      io.observe(el);
    });
  }

  /* ---------- the bar and the menu ---------- */
  // the bar carries no id: "#top" (the wordmark, "Volver arriba") is the top of the document only while no
  // element is called that, and a fixed bar is always in view, so scrolling to it went nowhere
  var top = document.querySelector('.top');
  function onScroll() { top.classList.toggle('solid', scrollY > 12); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = top.querySelector('.burger');
  var menu = document.getElementById('menu');
  var behind = [document.getElementById('main'), document.querySelector('.end'), document.querySelector('.skip')];
  var shut;
  function setMenu(open, refocus) {
    if (open === (burger.getAttribute('aria-expanded') === 'true')) return;
    burger.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    behind.forEach(function (el) { if (el) el.inert = open; });   // the page behind is out of reach while it is open
    clearTimeout(shut);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('open'); }); });
    } else {
      menu.classList.remove('open');
      shut = setTimeout(function () { menu.hidden = true; }, reduced ? 0 : 200);
      if (refocus) burger.focus();
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true', false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false, true); });
  }

  /* ---------- one open at a time ---------- */
  function oneOpen(items, btnSel, canClose) {
    items.forEach(function (item) {
      var btn = item.querySelector(btnSel);
      btn.addEventListener('click', function () {
        var opening = !item.classList.contains('is-open');
        if (!opening && !canClose) return;
        items.forEach(function (o) {
          var open = o === item && opening;
          o.classList.toggle('is-open', open);
          o.querySelector(btnSel).setAttribute('aria-expanded', String(open));
        });
      });
    });
  }
  oneOpen(Array.prototype.slice.call(document.querySelectorAll('.step')), '.step-btn', false);
  oneOpen(Array.prototype.slice.call(document.querySelectorAll('.q')), '.q-btn', true);

  /* ---------- the contact form: it opens in place ---------- */
  var formBtn = document.getElementById('form-btn');
  var panel = document.getElementById('form-panel');
  var form = document.querySelector('[data-form]');
  var folding;
  // open: in the layout first, then it unfolds; shut: it folds, then leaves the layout
  function setForm(open, focus, now) {
    clearTimeout(folding);
    formBtn.setAttribute('aria-expanded', String(open));
    panel.inert = !open;
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.remove('is-shut'); }); });
      if (focus) setTimeout(function () { panel.querySelector('input').focus({ preventScroll: true }); }, reduced ? 0 : 340);
    } else {
      panel.classList.add('is-shut');
      if (now || reduced) panel.hidden = true;
      else folding = setTimeout(function () { panel.hidden = true; }, 340);
    }
  }
  if (formBtn && panel) {
    setForm(false, false, true);
    formBtn.addEventListener('click', function () { setForm(formBtn.getAttribute('aria-expanded') !== 'true', true); });
  }

  // a call that carries a message: with WhatsApp the link already holds it; without, it fills the form
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-prefill]');
    if (!a || a.dataset.wa || !form) return;
    e.preventDefault();
    form.querySelector('[name="mensaje"]').value = a.dataset.message || '';
    setForm(true, false);
    // once it has unfolded, the form comes to the middle of the screen with the name ready
    setTimeout(function () {
      form.scrollIntoView({ behavior: smooth, block: 'center' });
      form.querySelector('[name="nombre"]').focus({ preventScroll: true });
    }, reduced ? 0 : 360);
  });

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = form.querySelector('.form-status');
    var send = form.querySelector('.submit');
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    data.lang = form.dataset.lang;
    var missing = ['nombre', 'contacto', 'mensaje'].filter(function (k) { return !data[k]; });
    form.querySelectorAll('[required]').forEach(function (f) { f.setAttribute('aria-invalid', String(missing.indexOf(f.name) >= 0)); });
    if (missing.length) { status.textContent = form.dataset.missing; form.querySelector('[name="' + missing[0] + '"]').focus(); return; }
    send.disabled = true;
    status.textContent = form.dataset.sending;
    fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { code: r.status, body: j }; }); })
      .then(function (res) {
        if (res.code === 200 && res.body.ok) { status.textContent = form.dataset.ok; form.reset(); }
        else status.textContent = res.code === 503 ? form.dataset.off : form.dataset.error;
      })
      .catch(function () { status.textContent = form.dataset.error; })
      .then(function () { send.disabled = false; });
  });

  /* ---------- today's UF (from the site's root, found from this script's own address) ---------- */
  fetch(new URL('../api/uf', document.currentScript.src), { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !(j.valor > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(j.fecha)) return;
      document.dispatchEvent(new CustomEvent('uf', { detail: j }));
    })
    .catch(function () { /* the build-time value stays */ });
})();
