/* =====================================================================
   LM Visuals — main orchestrator
   Smooth scroll (Lenis), navigation, hero, cursor, then boot modules.
   ===================================================================== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var navEl = document.getElementById('site-nav');

  function navHeight() { return navEl ? navEl.offsetHeight : 0; }

  /* ---------- Smooth scrolling ---------- */
  var lenis = null;
  function initSmoothScroll() {
    if (prefersReduced || typeof window.Lenis === 'undefined') return;
    document.documentElement.classList.add('lenis');
    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToTarget(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var offset = -(navHeight() - 1);
    if (lenis) {
      lenis.scrollTo(el, { offset: offset, duration: 1.2 });
    } else {
      var y = el.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  }
  window.LMVScroll = { to: scrollToTarget, lenis: function () { return lenis; } };

  /* ---------- Navigation ---------- */
  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    var progress = document.getElementById('scroll-progress');

    // sticky background state + progress bar
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      navEl.classList.toggle('is-scrolled', y > 40);
      if (progress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var p = h > 0 ? Math.min(1, y / h) : 0;
        progress.style.transform = 'scaleX(' + p + ')';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // mobile menu
    function setMenu(open) {
      if (!menu || !toggle) return;
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    }
    if (toggle) toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Escape closes the mobile menu and returns focus to the toggle
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) {
        setMenu(false);
        if (toggle) toggle.focus();
      }
    });

    // anchor links → smooth scroll (+ close mobile menu)
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        setMenu(false);
        scrollToTarget(el);
      });
    });

    // active link via IntersectionObserver
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link[href^="#"]'));
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute('href')] = l; });
    var sections = links
      .map(function (l) { return document.querySelector(l.getAttribute('href')); })
      .filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (l) { l.classList.remove('is-active'); });
            var active = byId['#' + en.target.id];
            if (active) active.classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { obs.observe(s); });
    }
  }

  /* ---------- Hero crossfade slideshow ----------
     Cycles through EVERY gallery photo (not just 3). Slides are built from
     the gallery list and loaded lazily (current + next only) so the hero
     stays fast. CSS keeps `background-position: center top` so faces aren't
     cropped from the top. */
  function initHero() {
    var media = document.querySelector('.hero__media');
    if (!media || !window.LMV || !window.LMV.gallery || !window.LMV.gallery.length) return;
    var grad = ", linear-gradient(135deg, #2a2118, #14100b)";
    var srcs = window.LMV.gallery.map(function (g) { return g.src; });
    media.innerHTML = '';
    var slides = srcs.map(function (src, idx) {
      var d = document.createElement('div');
      d.className = 'hero__slide' + (idx === 0 ? ' is-active' : '');
      d.setAttribute('aria-hidden', 'true');
      if (idx === 0) d.style.backgroundImage = "url('" + src + "')" + grad;
      media.appendChild(d);
      return { el: d, src: src, loaded: idx === 0 };
    });
    function load(idx) {
      var s = slides[idx];
      if (s && !s.loaded) { s.el.style.backgroundImage = "url('" + s.src + "')" + grad; s.loaded = true; }
    }
    if (slides.length < 2 || prefersReduced) return;
    load(1);
    var i = 0;
    setInterval(function () {
      slides[i].el.classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].el.classList.add('is-active');
      load((i + 1) % slides.length);
    }, 5000);
  }

  /* ---------- Custom cursor (fine pointers) ---------- */
  function initCursor() {
    if (prefersReduced || !window.matchMedia('(pointer: fine)').matches) return;
    var ring = document.getElementById('cursor');
    var dot = document.getElementById('cursor-dot');
    if (!ring || !dot) return;
    document.body.classList.add('cursor-ready');
    // Always visible from the start — the cursor must never disappear.
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    ring.style.opacity = '1';
    dot.style.opacity = '1';
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    }, { passive: true });
    function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    // No hover/click state changes (no "clicking cursor animation"), and no
    // mouseleave hide — the cursor stays on screen at all times.
  }

  /* ---------- Boot ---------- */
  function boot() {
    // flip the non-blocking font stylesheet on (it ships with media="print")
    var gf = document.getElementById('gfont');
    if (gf) gf.media = 'all';

    initSmoothScroll();
    initNav();
    initHero();
    initCursor();

    // Build dynamic sections (order matters: render before animating).
    try { if (window.LMVPricing) window.LMVPricing.render(); } catch (e) { console.error('[LMV] pricing', e); }
    try { if (window.LMVGallery) window.LMVGallery.init(); } catch (e) { console.error('[LMV] gallery', e); }
    try { if (window.LMVBooking) window.LMVBooking.init(); } catch (e) { console.error('[LMV] booking', e); }
    try { if (window.LMVReel) window.LMVReel.init(); } catch (e) { console.error('[LMV] reel', e); }
    try { if (window.LMVAnimations) window.LMVAnimations.init(); } catch (e) { console.error('[LMV] anim', e); }

    // Hide the About portrait if its file isn't there yet (no broken icon, no retry).
    var aboutImg = document.querySelector('.about__media img');
    if (aboutImg) {
      if (aboutImg.complete && aboutImg.naturalWidth === 0) aboutImg.style.display = 'none';
      else aboutImg.addEventListener('error', function () { aboutImg.style.display = 'none'; }, { once: true });
    }

    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
