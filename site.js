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

  /* ---- compte a rebours compact (en-tete et menu mobile) ---- */
  var pastilles = document.querySelectorAll('.cd-mini');
  if (pastilles.length) {
    var ouverture = new Date('2027-01-01T00:00:00+01:00').getTime();

    var majPastilles = function () {
      var reste = ouverture - Date.now();
      var texte;
      if (reste <= 0) {
        texte = 'ouvert';
      } else {
        var jours = Math.floor(reste / 86400000);
        if (jours >= 1) {
          texte = 'J-' + jours;
        } else {
          var heures = Math.floor(reste / 3600000);
          texte = heures >= 1 ? 'H-' + heures : 'imminent';
        }
      }
      for (var i = 0; i < pastilles.length; i++) {
        pastilles[i].textContent = texte;
      }
    };

    majPastilles();
    setInterval(majPastilles, 60000);
  }

  /* ---- demonstration : trois ecrans qui se remplissent ---- */
  var demo = document.getElementById('demo');
  if (demo) {
    var tels = demo.querySelectorAll('.tel');
    var minuteries = [];
    var horloge = 0;

    /* planifie une action a un instant absolu depuis le debut du cycle */
    var plus = function (ms, action) {
      horloge += ms;
      minuteries.push(setTimeout(action, horloge));
    };

    var actif = function (n) {
      for (var i = 0; i < tels.length; i++) {
        tels[i].classList.toggle('est-actif', i === n);
      }
    };

    var saisir = function (champ, vitesse) {
      var texte = champ.getAttribute('data-saisie') || '';
      plus(0, function () { champ.classList.add('saisit'); });
      for (var i = 1; i <= texte.length; i++) {
        (function (n) {
          plus(vitesse, function () { champ.textContent = texte.slice(0, n); });
        })(i);
      }
      plus(120, function () { champ.classList.remove('saisit'); });
    };

    var montrer = function (el, delai) {
      plus(delai, function () { if (el) { el.classList.add('visible'); } });
    };

    var appuyer = function (bouton, delai) {
      plus(delai, function () { if (bouton) { bouton.classList.add('appuye'); } });
      plus(220, function () { if (bouton) { bouton.classList.remove('appuye'); } });
    };

    var remettre = function () {
      for (var i = 0; i < minuteries.length; i++) { clearTimeout(minuteries[i]); }
      minuteries = [];
      horloge = 0;
      var champs = demo.querySelectorAll('[data-saisie]');
      for (var c = 0; c < champs.length; c++) {
        champs[c].textContent = '';
        champs[c].classList.remove('saisit');
      }
      var masques = demo.querySelectorAll('[data-carte], [data-ligne], [data-total], [data-note]');
      for (var m = 0; m < masques.length; m++) { masques[m].classList.remove('visible'); }
      var boutons = demo.querySelectorAll('[data-bouton]');
      for (var b = 0; b < boutons.length; b++) { boutons[b].classList.remove('appuye'); }
    };

    /* etat final, sans animation : mouvement reduit ou onglet inactif */
    var figer = function () {
      remettre();
      var champs = demo.querySelectorAll('[data-saisie]');
      for (var c = 0; c < champs.length; c++) {
        champs[c].textContent = champs[c].getAttribute('data-saisie');
      }
      var masques = demo.querySelectorAll('[data-carte], [data-ligne], [data-total], [data-note]');
      for (var m = 0; m < masques.length; m++) { masques[m].classList.add('visible'); }
      for (var t = 0; t < tels.length; t++) { tels[t].classList.add('est-actif'); }
    };

    var cycle = function () {
      remettre();

      /* ecran 1 : on publie la course */
      plus(300, function () { actif(0); });
      var champs1 = tels[0].querySelectorAll('[data-saisie]');
      for (var i = 0; i < champs1.length; i++) {
        plus(190, function () {});
        saisir(champs1[i], 23);
      }
      appuyer(tels[0].querySelector('[data-bouton]'), 450);

      /* ecran 2 : un confrere verifie la reprend */
      plus(500, function () { actif(1); });
      montrer(tels[1].querySelector('[data-carte]'), 280);
      var lignes2 = tels[1].querySelectorAll('[data-ligne]');
      for (var j = 0; j < lignes2.length; j++) { montrer(lignes2[j], 170); }
      appuyer(tels[1].querySelector('[data-bouton]'), 520);

      /* ecran 3 : le partage */
      plus(500, function () { actif(2); });
      var lignes3 = tels[2].querySelectorAll('[data-ligne]');
      for (var k = 0; k < lignes3.length; k++) { montrer(lignes3[k], 230); }
      montrer(tels[2].querySelector('[data-total]'), 330);
      montrer(tels[2].querySelector('[data-note]'), 280);

      /* respiration, puis on recommence */
      plus(2600, cycle);
    };

    if (reduceMotion) {
      figer();
    } else {
      cycle();
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          for (var i = 0; i < minuteries.length; i++) { clearTimeout(minuteries[i]); }
          minuteries = [];
        } else {
          cycle();
        }
      });
    }
  }
})();
