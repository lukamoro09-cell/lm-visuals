/* =====================================================================
   LM Visuals — Pricing renderer
   Builds 3 service cards, each with 4 tabs (Tier 1 / 2 / 3 / Add-ons).
   ===================================================================== */
(function () {
  'use strict';

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function priceMarkup(tier) {
    var suffix = tier.priceSuffix ? ' <span>' + tier.priceSuffix + '</span>' : '';
    return tier.priceLabel + suffix;
  }

  function buildTierPanel(service, tier) {
    var panel = el('div', 'panel');
    panel.setAttribute('role', 'tabpanel');

    var tier_ = el('div', 'tier');
    var aside = el('div', 'tier__aside');
    aside.appendChild(el('div', 'tier__badge', tier.badge + ' · ' + service.name));
    aside.appendChild(el('h4', 'tier__name', tier.name));
    aside.appendChild(el('div', 'tier__price', priceMarkup(tier)));
    aside.appendChild(el('p', 'tier__summary', tier.summary));
    if (tier.popular) aside.appendChild(el('span', 'tier__popular', '★ Most popular'));

    var feats = el('ul', 'tier__features');
    tier.features.forEach(function (f) { feats.appendChild(el('li', null, '<span>' + f + '</span>')); });

    var foot = el('div', 'tier__foot');
    var book = el('button', 'btn btn--accent', 'Book this package <span class="btn__arrow" aria-hidden="true">→</span>');
    book.type = 'button';
    book.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('lmv:book', {
        detail: { serviceId: service.id, tierId: tier.id }
      }));
    });
    foot.appendChild(book);
    foot.appendChild(el('span', 'tier__turn', '◷ ' + tier.turnaround));

    tier_.appendChild(aside);
    tier_.appendChild(feats);
    tier_.appendChild(foot);
    panel.appendChild(tier_);
    return panel;
  }

  function buildAddonsPanel(service) {
    var panel = el('div', 'panel');
    panel.setAttribute('role', 'tabpanel');
    var wrap = el('div', 'addons');
    wrap.appendChild(el('p', 'addons__intro',
      'Tailor any ' + service.name.toLowerCase() + ' package with optional extras. Add them on the booking form and your estimate updates instantly.'));
    service.addons.forEach(function (a) {
      var row = el('div', 'addon');
      var left = el('div');
      left.appendChild(el('div', 'addon__name', a.name));
      left.appendChild(el('div', 'addon__desc', a.desc));
      var price = a.unit === 'perKm'
        ? '$0.60 <small>/ km</small>'
        : '$' + a.price + ' <small>flat</small>';
      row.appendChild(left);
      row.appendChild(el('div', 'addon__price', price));
      wrap.appendChild(row);
    });
    panel.appendChild(wrap);
    return panel;
  }

  function buildService(service, index) {
    var section = el('article', 'service');
    section.id = 'service-' + service.id;
    section.setAttribute('data-service', service.id);
    section.setAttribute('data-reveal', 'up');

    // header
    var head = el('header', 'service__head');
    head.appendChild(el('div', 'service__index', '0' + (index + 1)));
    var titleWrap = el('div');
    titleWrap.appendChild(el('h3', 'service__name', service.name));
    titleWrap.appendChild(el('p', 'service__tagline', service.tagline));
    head.appendChild(titleWrap);
    head.appendChild(el('p', 'service__desc', service.description));
    section.appendChild(head);

    // tabs
    var tablist = el('div', 'service__tabs');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', service.name + ' packages');
    var panelsWrap = el('div', 'service__panels');

    var tabsData = service.tiers.map(function (t) {
      return { label: t.badge, sub: t.name, panel: buildTierPanel(service, t) };
    });
    tabsData.push({ label: 'Add-ons', sub: 'Extras', panel: buildAddonsPanel(service) });

    tabsData.forEach(function (t, i) {
      var tabId = 'tab-' + service.id + '-' + i;
      var panelId = 'panel-' + service.id + '-' + i;

      var tab = el('button', 'tab', t.label + ' <small>' + t.sub + '</small>');
      tab.type = 'button';
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.tabIndex = i === 0 ? 0 : -1;

      t.panel.id = panelId;
      t.panel.setAttribute('aria-labelledby', tabId);
      if (i === 0) t.panel.classList.add('is-active');
      else t.panel.setAttribute('hidden', '');

      tab.addEventListener('click', function () { selectTab(tablist, panelsWrap, i); });
      tab.addEventListener('keydown', function (e) { onTabKey(e, tablist, panelsWrap, i, tabsData.length); });

      tablist.appendChild(tab);
      panelsWrap.appendChild(t.panel);
    });

    section.appendChild(tablist);
    section.appendChild(panelsWrap);
    return section;
  }

  function selectTab(tablist, panelsWrap, index) {
    var tabs = tablist.querySelectorAll('.tab');
    var panels = panelsWrap.querySelectorAll('.panel');
    tabs.forEach(function (t, i) {
      var on = i === index;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p, i) {
      var on = i === index;
      p.classList.toggle('is-active', on);
      if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });
  }

  function onTabKey(e, tablist, panelsWrap, index, count) {
    var next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % count;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + count) % count;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    if (next === null) return;
    e.preventDefault();
    selectTab(tablist, panelsWrap, next);
    tablist.querySelectorAll('.tab')[next].focus();
  }

  function render() {
    var mount = document.getElementById('pricing-mount');
    if (!mount || !window.LMV) return;
    var frag = document.createDocumentFragment();
    window.LMV.services.forEach(function (svc, i) { frag.appendChild(buildService(svc, i)); });
    mount.innerHTML = '';
    mount.appendChild(frag);
  }

  function getTier(serviceId, tierId) {
    var svc = window.LMV.services.filter(function (s) { return s.id === serviceId; })[0];
    if (!svc) return null;
    var tier = svc.tiers.filter(function (t) { return t.id === tierId; })[0];
    return tier ? { service: svc, tier: tier } : null;
  }

  window.LMVPricing = { render: render, getTier: getTier };
})();
