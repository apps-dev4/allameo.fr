(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var burger   = document.getElementById('burger');
  var drawer   = document.getElementById('drawer');
  var backdrop = document.getElementById('drawerBackdrop');
  var closeBtn = document.getElementById('drawerClose');

  if (burger && drawer && backdrop) {
    var FOCUSABLE = 'a[href], button:not([disabled])';
    var isOpen = false;

    var openDrawer = function () {
      if (isOpen) return;
      isOpen = true;
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var first = drawer.querySelector(FOCUSABLE);
      if (first) first.focus();
    };

    var closeDrawer = function () {
      if (!isOpen) return;
      isOpen = false;
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus();
    };

    burger.addEventListener('click', openDrawer);
    backdrop.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeDrawer();
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;

      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key !== 'Tab') return;

      var items = drawer.querySelectorAll(FOCUSABLE);
      if (!items.length) return;
      var first = items[0];
      var last  = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    var wide = window.matchMedia('(min-width: 721px)');
    var onWide = function (e) { if (e.matches) closeDrawer(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    for (var i = 0; i < revealables.length; i++) revealables[i].classList.add('in');
  } else {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach(function (el) { obs.observe(el); });
  }


  var form = document.getElementById('formPartenariat');
  var formMsg = document.getElementById('formMessage');

  if (form && formMsg) {
    var ENDPOINT = 'https://allameo.app/api/contact';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.reportValidity()) return;

      var bouton = form.querySelector('button[type="submit"]');
      var donnees = {};
      new FormData(form).forEach(function (v, k) { donnees[k] = v; });
      donnees.consentement = form.consentement.checked;
      donnees.source = 'allameo.com';

      bouton.disabled = true;
      formMsg.className = 'f-msg';
      formMsg.textContent = 'Envoi en cours…';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees)
      })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          formMsg.className = 'f-msg ok';
          formMsg.textContent = 'Message envoyé. Nous revenons vers vous sous deux jours ouvrés.';
        })
        .catch(function () {
          formMsg.className = 'f-msg ko';
          formMsg.innerHTML = "L'envoi a échoué. Écrivez-nous directement à " +
            '<a href="mailto:contact@allameo.com">contact@allameo.com</a>.';
        })
        .then(function () { bouton.disabled = false; });
    });
  }

  var toTop  = document.getElementById('toTop');
  var header = document.querySelector('.site-header');

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  if (toTop || header) {
    var ticking = false;

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        if (toTop)  toTop.classList.toggle('is-visible', y > 600);
        if (header) header.classList.toggle('is-scrolled', y > 40);
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
