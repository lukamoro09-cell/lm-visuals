/* =====================================================================
   LM Visuals — Scroll animations (GSAP + ScrollTrigger)
   Degrades gracefully: if GSAP is missing, content is already visible.
   ===================================================================== */
(function () {
  'use strict';

  function init() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = window.gsap;
    if (!gsap || reduced) return; // CSS keeps everything visible

    var ST = window.ScrollTrigger;
    if (ST) {
      gsap.registerPlugin(ST);
      // Pre-hide reveal targets only when we can actually reveal them on scroll,
      // so a missing ScrollTrigger never leaves content stuck hidden.
      document.documentElement.classList.add('gsap-ready');
    }

    var easeOut = 'power3.out';

    /* Hero headline — masked line reveal */
    var heroLines = document.querySelectorAll('.hero__title .line__inner');
    if (heroLines.length) {
      gsap.set(heroLines, { yPercent: 115 });
      gsap.to(heroLines, { yPercent: 0, duration: 1.1, ease: easeOut, stagger: 0.12, delay: 0.15 });
    }
    var heroFade = document.querySelectorAll('.hero__content .eyebrow, .hero__subhead, .hero__cta');
    if (heroFade.length) {
      gsap.from(heroFade, { opacity: 0, y: 22, duration: 0.9, ease: easeOut, stagger: 0.12, delay: 0.5 });
    }

    if (!ST) return;

    /* Generic reveals via batched ScrollTrigger */
    ST.batch('[data-reveal]', {
      start: 'top 86%',
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, x: 0, y: 0, scale: 1,
          duration: 0.9, ease: easeOut, stagger: 0.09, overwrite: true
        });
      }
    });

    /* Parallax */
    gsap.utils.toArray('[data-parallax]').forEach(function (elm) {
      var depth = parseFloat(elm.getAttribute('data-parallax')) || 0.12;
      gsap.fromTo(elm,
        { yPercent: -depth * 12 },
        {
          yPercent: depth * 12, ease: 'none',
          scrollTrigger: { trigger: elm.parentElement || elm, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* Animated counters */
    gsap.utils.toArray('.stat__value').forEach(function (elm) {
      var raw = elm.textContent;
      var m = raw.match(/([\d,]+)/);
      if (!m) return;
      var target = parseInt(m[1].replace(/,/g, ''), 10);
      var pre = raw.slice(0, m.index);
      var post = raw.slice(m.index + m[1].length);
      var o = { n: 0 };
      ST.create({
        trigger: elm, start: 'top 90%', once: true,
        onEnter: function () {
          gsap.to(o, {
            n: target, duration: 1.5, ease: easeOut,
            onUpdate: function () { elm.textContent = pre + Math.round(o.n).toLocaleString('en-CA') + post; }
          });
        }
      });
    });

    ST.refresh();
  }

  window.LMVAnimations = { init: init };
})();
