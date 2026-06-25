/* =====================================================================
   LM Visuals — Gallery (filterable grid) + Lightbox + Showreel
   Missing images fall back gracefully to a labelled gradient tile.
   ===================================================================== */
(function () {
  'use strict';

  var grid, items = [], currentFilter = 'all';
  var lb, lbImg, lbCap, lastFocus = null, lbList = [], lbIndex = 0;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function handleMissing(img, btn) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
      if (btn) btn.classList.add('g-item--ph');
    }, { once: true });
  }

  function buildItem(data, index) {
    var btn = el('button', 'g-item');
    btn.type = 'button';
    btn.setAttribute('data-cat', data.category);
    btn.setAttribute('data-label', window.LMV.prettyCategory(data.category));
    btn.setAttribute('data-index', index);
    btn.setAttribute('data-reveal', 'up');
    btn.setAttribute('aria-label', 'View ' + data.alt);
    if (data.w && data.h) btn.style.setProperty('--ar', data.w + ' / ' + data.h);

    var img = el('img');
    img.src = data.src;
    img.alt = data.alt;
    if (data.w) img.width = data.w;   // intrinsic size → no layout shift, no crop
    if (data.h) img.height = data.h;
    img.loading = 'lazy';
    img.decoding = 'async';
    handleMissing(img, btn);
    btn.appendChild(img);

    btn.appendChild(el('span', 'g-item__cap',
      '<b>' + window.LMV.prettyCategory(data.category) + '</b><span aria-hidden="true">·</span> View'));

    btn.addEventListener('click', function () { openLightbox(btn); });
    return btn;
  }

  function visibleItems() {
    return items.filter(function (b) { return !b.classList.contains('is-hidden'); });
  }

  function applyFilter(filter) {
    currentFilter = filter;
    items.forEach(function (b) {
      var show = filter === 'all' || b.getAttribute('data-cat') === filter;
      b.classList.toggle('is-hidden', !show);
    });
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function initFilters() {
    var bar = document.getElementById('gallery-filters');
    if (!bar) return;
    window.LMV.categories.forEach(function (c, i) {
      var b = el('button', 'gallery-filter' + (i === 0 ? ' is-active' : ''), c.label);
      b.type = 'button';
      b.setAttribute('data-filter', c.id);
      b.addEventListener('click', function () {
        bar.querySelectorAll('.gallery-filter').forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        applyFilter(c.id);
      });
      bar.appendChild(b);
    });
  }

  /* ---------- Lightbox ---------- */
  function openLightbox(btn) {
    lbList = visibleItems();
    lbIndex = lbList.indexOf(btn);
    lastFocus = btn;
    showCurrent();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var l = window.LMVScroll && window.LMVScroll.lenis();
    if (l) l.stop();
    var closeBtn = lb.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.focus();
  }

  function showCurrent() {
    var btn = lbList[lbIndex];
    if (!btn) return;
    var img = btn.querySelector('img');
    var cat = btn.getAttribute('data-label');
    lbImg.style.display = '';
    lbImg.src = img ? img.src : '';
    lbImg.alt = img ? img.alt : '';
    lbImg.onerror = function () { lbImg.style.display = 'none'; };
    lbCap.textContent = '';
    var capName = document.createElement('b');
    capName.textContent = cat;
    lbCap.appendChild(capName);
    lbCap.appendChild(document.createTextNode('  ·  ' + (lbIndex + 1) + ' / ' + lbList.length));
  }

  function move(dir) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    showCurrent();
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    var l = window.LMVScroll && window.LMVScroll.lenis();
    if (l) l.start();
    if (lastFocus) lastFocus.focus();
  }

  function initLightbox() {
    lb = document.getElementById('lightbox');
    if (!lb) return;
    lbImg = document.getElementById('lightbox-img');
    lbCap = document.getElementById('lightbox-cap');
    lb.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { move(-1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { move(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowRight') move(1);
      else if (e.key === 'Tab') {
        // simple focus trap among controls
        var focusables = lb.querySelectorAll('button');
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function init() {
    grid = document.getElementById('gallery-grid');
    if (!grid || !window.LMV) return;
    var frag = document.createDocumentFragment();
    window.LMV.gallery.forEach(function (d, i) {
      var item = buildItem(d, i);
      items.push(item);
      frag.appendChild(item);
    });
    grid.appendChild(frag);
    initFilters();
    initLightbox();
  }

  window.LMVGallery = { init: init };

  /* ---------- Showreel ---------- */
  window.LMVReel = {
    init: function () {
      var band = document.getElementById('reel');
      if (!band || !window.LMV) return;
      var reel = window.LMV.reel;
      var label = band.querySelector('.reel__label');

      // try to use a poster image if present
      if (reel.poster) {
        var test = new Image();
        test.onload = function () {
          band.style.backgroundImage =
            'linear-gradient(120deg, oklch(10% 0.01 55 / .35), oklch(10% 0.01 55 / .35)), url("' + reel.poster + '")';
        };
        test.src = reel.poster;
      }

      var hasMedia = !!(reel.embed || reel.file);
      if (!hasMedia && label) label.textContent = 'Showreel coming soon';

      var play = band.querySelector('.reel__play');
      if (play) play.addEventListener('click', function () {
        if (!hasMedia) { if (window.LMVScroll) window.LMVScroll.to('#book'); return; }
        var media;
        if (reel.embed) {
          media = document.createElement('iframe');
          media.src = reel.embed + (reel.embed.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
          media.allow = 'autoplay; fullscreen; picture-in-picture';
          media.setAttribute('allowfullscreen', '');
          media.title = 'LM Visuals showreel';
        } else {
          media = document.createElement('video');
          media.src = reel.file;
          media.controls = true; media.autoplay = true; media.playsInline = true;
        }
        band.innerHTML = '';
        band.appendChild(media);
      });
    }
  };
})();
