(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* quick eased scroll to in-page anchors (fixed duration, so long pages stay snappy) */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var t = id ? document.getElementById(id) : null;
      if (!t) return;
      e.preventDefault();
      var off = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hd'), 10) || 64;
      var to = Math.max(0, t.getBoundingClientRect().top + window.scrollY - (id === 'algus' ? 0 : off + 6));
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      if (reduce) { window.scrollTo(0, to); return; }
      var from = window.scrollY, dist = to - from, t0 = null, dur = 420;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), k = 1 - Math.pow(1 - p, 3);
        window.scrollTo(0, from + dist * k);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  });

  /* header state */
  var hd = $('.hd');
  function onScroll() { hd.classList.toggle('is-solid', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var btn = $('.menu-btn'), nav = $('#nav');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Sulge menüü' : 'Ava menüü');
    nav.classList.toggle('open', open);
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); btn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });

  /* reveal on scroll */
  var rvs = $$('.rv');
  rvs.forEach(function (el, i) {
    var sib = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
    el.style.setProperty('--rd', Math.min(sib % 4, 3) * 0.08 + 's');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }

  /* hero: spray light follows pointer, photo drifts slowly on scroll */
  var hero = $('.hero'), hp = $('.hero-photo');
  if (hero && !reduce) {
    if (window.matchMedia('(pointer:fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        if (hp) hp.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* pre-select the surface from the service cards */
  var sel = $('#f-pind');
  $$('a[data-surface]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-surface');
      if (v && sel) sel.value = v;
    });
  });

  /* lightbox */
  var tiles = $$('.tile');
  var lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count');
  var cur = 0, lastFocus = null;

  function show(i) {
    cur = (i + tiles.length) % tiles.length;
    var t = tiles[cur];
    var small = $('img', t);
    lbImg.style.animation = 'none';
    void lbImg.offsetWidth;
    lbImg.style.animation = '';
    lbImg.src = t.getAttribute('data-full');
    lbImg.alt = small ? small.getAttribute('alt') : '';
    lbCap.textContent = t.getAttribute('data-cap') || '';
    lbCount.textContent = (cur + 1) + ' / ' + tiles.length;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i);
    if (typeof lb.showModal === 'function') { if (!lb.open) lb.showModal(); }
    else lb.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  }
  function closeLb() {
    if (typeof lb.close === 'function' && lb.open) lb.close(); else lb.removeAttribute('open');
  }
  lb.addEventListener('close', function () {
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  });
  tiles.forEach(function (t, i) { t.addEventListener('click', function () { openLb(i); }); });
  $('.lb-close', lb).addEventListener('click', closeLb);
  $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
  $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
    else if (e.key === 'Escape' && typeof lb.showModal !== 'function') closeLb();
  });
  /* swipe */
  var sx = null, sy = null;
  lb.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = sy = null;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.4) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
  /* preload neighbours when opened */
  lbImg.addEventListener('load', function () {
    [cur + 1, cur - 1].forEach(function (n) {
      var t = tiles[(n + tiles.length) % tiles.length], im = new Image();
      im.src = t.getAttribute('data-full');
    });
  });

  /* form: validate, then compose a mailto */
  var form = $('#paringuvorm'), err = $('#f-err');
  var labels = { 'f-pind': 'pind', 'f-m2': 'suurus (m²)', 'f-linn': 'linn või vald' };
  function clearInvalid(el) { el.removeAttribute('aria-invalid'); }
  $$('input,select,textarea', form).forEach(function (el) { el.addEventListener('input', function () { clearInvalid(el); err.textContent = ''; }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var missing = [];
    ['f-pind', 'f-m2', 'f-linn'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el.value.trim()) { el.setAttribute('aria-invalid', 'true'); missing.push(labels[id]); }
    });
    if (missing.length) {
      err.textContent = 'Palun täitke: ' + missing.join(', ') + '.';
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var subject = 'Survepesu päring: ' + v('f-pind') + ', ' + v('f-m2') + ' m², ' + v('f-linn');
    var body = 'Tere!\n\nPind: ' + v('f-pind') + '\nSuurus: ' + v('f-m2') + ' m²\nLinn või vald: ' + v('f-linn') + '\n' +
      (v('f-nimi') ? 'Nimi: ' + v('f-nimi') + '\n' : '') +
      (v('f-soov') ? '\nSoov ja kirjeldus:\n' + v('f-soov') + '\n' : '') +
      '\nVõimalusel lisan pildi pinnast.\n';
    err.textContent = '';
    window.location.href = 'mailto:vesipesu1@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
