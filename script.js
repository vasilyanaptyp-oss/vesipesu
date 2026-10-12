(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* mobile menu */
  var burger = doc.getElementById('burger');
  var nav = doc.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Sulge menüü' : 'Ava menüü');
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 960) setMenu(false);
  });

  /* header shadow */
  var header = doc.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* before / after slider */
  var cmp = doc.getElementById('cmp');
  var range = doc.getElementById('cmp-range');
  if (cmp && range) {
    var upd = function () { cmp.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', upd);
    upd();
    if (!reduce && 'IntersectionObserver' in window) {
      var played = false;
      var demo = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting || played) return;
        played = true;
        var t0 = null, from = 50;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / 1800, 1);
          var v = from + Math.sin(p * Math.PI * 2) * 18 * (1 - p * 0.3);
          if (doc.activeElement === range) return;
          range.value = Math.round(v);
          upd();
          if (p < 1) requestAnimationFrame(step); else { range.value = 50; upd(); }
        }
        requestAnimationFrame(step);
        demo.disconnect();
      }, { threshold: 0.6 });
      demo.observe(cmp);
    }
  }

  /* reveal on scroll */
  var items = doc.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(el);
    });
  }

  /* request form -> prefilled mailto */
  var form = doc.getElementById('form');
  var err = doc.getElementById('form-err');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var name = f.name.value.trim();
      var phone = f.phone.value.trim();
      var email = f.email.value.trim();
      var addr = f.addr.value.trim();
      var service = f.service.value;
      var msg = f.msg.value.trim();
      [f.name, f.phone, f.email].forEach(function (el) { el.removeAttribute('aria-invalid'); });
      var problem = '';
      if (!name) { problem = 'Palun lisa oma nimi.'; f.name.setAttribute('aria-invalid', 'true'); f.name.focus(); }
      else if (!phone && !email) { problem = 'Lisa vähemalt telefon või e-post, et saaksime vastata.'; f.phone.setAttribute('aria-invalid', 'true'); f.email.setAttribute('aria-invalid', 'true'); f.phone.focus(); }
      else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { problem = 'E-posti aadress ei paista korrektne.'; f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); }
      if (problem) { err.textContent = problem; err.hidden = false; return; }
      err.hidden = true;
      var nl = '\r\n';
      var body = 'Tere!' + nl + nl +
        'Soovin pakkumist.' + nl + nl +
        'Teenus: ' + service + nl +
        'Objekti aadress: ' + (addr || '-') + nl +
        'Nimi: ' + name + nl +
        'Telefon: ' + (phone || '-') + nl +
        'E-post: ' + (email || '-') + nl + nl +
        (msg ? 'Sõnum:' + nl + msg + nl + nl : '') +
        'Head aega!';
      var href = 'mailto:vesipesu1@gmail.com?subject=' + encodeURIComponent('Päring: ' + service) +
        '&body=' + encodeURIComponent(body);
      var a = doc.createElement('a');
      a.href = href;
      a.style.display = 'none';
      doc.body.appendChild(a);
      a.click();
      doc.body.removeChild(a);
    });
  }
})();
