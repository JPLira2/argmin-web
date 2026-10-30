/* site.js - the page around the live parts (plain script, no dependencies).

   - the entrance: the headline lines rise, then the rest of the first screen
   - section headings and the price steps rise once, as they come into view
   - the bar (always there) takes a ground once the page moves; the burger opens the menu over the page
   - the accordion (how we work) and the question cards: one open at a time
   - the contact form: a disclosure, then a real request to /api/contacto (no fake success)
   - today's UF from /api/uf, which updates every peso figure that depends on it
   Everything here only adds: without it the page is complete and still. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var es = root.lang.indexOf('es') === 0;
  var locale = es ? 'es-CL' : 'en-US';

  /* ---------- entrance, once the fonts are in (no reflow mid-rise) ---------- */
  function go() { root.classList.add('go'); }
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise(function (r) { setTimeout(r, 900); })]).then(function () { requestAnimationFrame(go); });
  setTimeout(go, 2500);   // never leave the first screen blank

  /* ---------- headings and price steps rise once ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.head').forEach(function (h) {
      if (h.closest('.hero') || !h.querySelector('.ln')) return;
      if (h.getBoundingClientRect().top < innerHeight) return;   // already on screen: leave it be
      h.classList.add('rv');
      io.observe(h);
    });
    var tiers = document.querySelector('.tiers');
    if (tiers && tiers.getBoundingClientRect().top > innerHeight) { tiers.classList.add('rv'); io.observe(tiers); }
  }

  /* ---------- the bar and the menu ---------- */
  var top = document.getElementById('top');
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
      shut = setTimeout(function () { menu.hidden = true; }, reduced ? 0 : 450);
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
  oneOpen(Array.prototype.slice.call(document.querySelectorAll('.stage')), '.stage-btn', false);
  oneOpen(Array.prototype.slice.call(document.querySelectorAll('.card')), '.card-btn', true);

  /* ---------- the contact form ---------- */
  var formBtn = document.getElementById('form-btn');
  var panel = document.getElementById('form-panel');
  if (formBtn && panel) {
    panel.hidden = true;
    formBtn.setAttribute('aria-expanded', 'false');
    formBtn.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      formBtn.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('input').focus();
    });
  }
  var form = document.querySelector('[data-form]');
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

  /* ---------- today's UF ---------- */
  var note = document.querySelector('[data-uf-note]');
  fetch('/api/uf', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !(j.valor > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(j.fecha)) return;
      var n0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
      var n2 = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      var money = function (v, f) { return (es ? '$ ' : 'CLP ') + (f || n0).format(v); };
      document.querySelectorAll('[data-pesos]').forEach(function (el) {
        var n = +el.dataset.pesos;
        el.textContent = el.dataset.template.replace('{n}', n).replace('{pesos}', money(Math.round(n * j.valor)));
      });
      if (note) {
        var d = j.fecha.split('-').map(Number);
        var date = new Intl.DateTimeFormat(es ? 'es-CL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
          .format(new Date(Date.UTC(d[0], d[1] - 1, d[2])));
        note.textContent = note.dataset.ufNote.replace('{date}', date).replace('{uf}', money(j.valor, n2));
      }
      document.dispatchEvent(new CustomEvent('uf', { detail: j }));
    })
    .catch(function () { /* the build-time value stays, with its date */ });
})();
