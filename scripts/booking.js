/* =====================================================================
   LM Visuals — Booking form + live estimate, and Contact form.
   Submissions are emailed to lukamoro.visuals@gmail.com via FormSubmit
   (free, no backend). First submission requires a one-time email confirm.
   ===================================================================== */
(function () {
  'use strict';

  var EMAIL = (window.LMV && window.LMV.email) || 'lukamoro.visuals@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;

  function $(id) { return document.getElementById(id); }
  function money(n) {
    var r = Math.round(n * 100) / 100;
    return '$' + (r % 1 === 0 ? r.toLocaleString('en-CA') : r.toFixed(2));
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  /* ---------------- Booking ---------------- */
  function initBooking() {
    var form = $('booking-form');
    if (!form || !window.LMV) return;

    var serviceSel = $('bk-service');
    var tierSel = $('bk-tier');
    var hoursField = $('bk-hours-field');
    var hoursInput = $('bk-hours');
    var kmField = $('bk-km-field');
    var kmInput = $('bk-km');
    var addonsBox = $('bk-addons');

    // populate services
    window.LMV.services.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      serviceSel.appendChild(o);
    });

    // shared add-on checkboxes
    window.LMV.addons.forEach(function (a) {
      var label = document.createElement('label');
      label.className = 'check';
      var priceTxt = a.unit === 'perKm' ? '$0.60/km' : '+$' + a.price;
      label.innerHTML =
        '<input type="checkbox" name="addon" value="' + a.name + '" data-id="' + a.id + '">' +
        '<span class="check__box" aria-hidden="true"></span>' +
        '<span class="check__title">' + a.name + '<small>' + a.desc + '</small></span>' +
        '<span class="check__price">' + priceTxt + '</span>';
      addonsBox.appendChild(label);
    });

    function populateTiers() {
      var svc = window.LMV.services.filter(function (s) { return s.id === serviceSel.value; })[0];
      tierSel.innerHTML = '';
      if (!svc) return;
      svc.tiers.forEach(function (t) {
        var o = document.createElement('option');
        o.value = t.id;
        o.textContent = t.badge + ' · ' + t.name + ' (' + t.priceLabel + (t.priceSuffix ? ' ' + t.priceSuffix : '') + ')';
        tierSel.appendChild(o);
      });
      onChange();
    }

    function selectedAddons() {
      return Array.prototype.slice.call(addonsBox.querySelectorAll('input:checked')).map(function (c) {
        var id = c.getAttribute('data-id');
        return window.LMV.addons.filter(function (a) { return a.id === id; })[0];
      });
    }

    function onChange() {
      var info = window.LMVPricing.getTier(serviceSel.value, tierSel.value);
      var lines = [], base = 0;
      var hourly = info && info.tier.unit === 'hour';
      hoursField.hidden = !hourly;

      if (info) {
        var t = info.tier;
        if (hourly) {
          var hrs = Math.max(1, Math.min(12, parseInt(hoursInput.value, 10) || t.defaultHours || 1));
          base = t.price * hrs;
          lines.push({ k: t.name + ' · $' + t.price + '/hr × ' + hrs + 'h', v: base });
        } else {
          base = t.price;
          lines.push({ k: t.name, v: base });
        }
      }

      var addons = selectedAddons(), addTotal = 0, hasTravel = false;
      addons.forEach(function (a) {
        if (a.unit === 'perKm') {
          hasTravel = true;
          var km = Math.max(0, parseInt(kmInput.value, 10) || 0);
          var amt = +(a.price * km).toFixed(2);
          lines.push({ k: 'Travel · ' + km + ' km × $0.60', v: amt, muted: km === 0 });
          addTotal += amt;
        } else {
          lines.push({ k: a.name, v: a.price });
          addTotal += a.price;
        }
      });
      kmField.hidden = !hasTravel;

      var total = base + addTotal;
      renderEstimate(lines, total);
    }

    function renderEstimate(lines, total) {
      var box = $('est-lines');
      box.innerHTML = '';
      if (!lines.length) {
        box.appendChild(makeLine('Select a service & tier', '', true));
      } else {
        lines.forEach(function (l) { box.appendChild(makeLine(l.k, l.v === '' ? '' : money(l.v), l.muted)); });
      }
      $('est-total').textContent = money(total);
      $('est-deposit').textContent = money(total / 2);
    }

    function makeLine(k, v, muted) {
      var d = document.createElement('div');
      d.className = 'estimate__line' + (muted ? ' estimate__line--muted' : '');
      d.innerHTML = '<span>' + k + '</span><b>' + v + '</b>';
      return d;
    }

    serviceSel.addEventListener('change', populateTiers);
    tierSel.addEventListener('change', onChange);
    hoursInput.addEventListener('input', onChange);
    kmInput.addEventListener('input', onChange);
    addonsBox.addEventListener('change', function (e) {
      var lab = e.target.closest('.check');
      if (lab) lab.classList.toggle('is-checked', e.target.checked);
      onChange();
    });

    // prefill from pricing "Book this package"
    function prefill(serviceId, tierId) {
      serviceSel.value = serviceId;
      populateTiers();
      if (tierId) tierSel.value = tierId;
      onChange();
      if (window.LMVScroll) window.LMVScroll.to('#book');
      setTimeout(function () { $('bk-name').focus({ preventScroll: true }); }, 700);
    }
    document.addEventListener('lmv:book', function (e) { prefill(e.detail.serviceId, e.detail.tierId); });
    window.LMVBooking = window.LMVBooking || {};
    window.LMVBooking.prefill = prefill;

    // validation + submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      var ok = true;
      ok = requireField('bk-name') && ok;
      ok = requireEmail('bk-email') && ok;
      ok = requireField('bk-date') && ok;
      if (!$('bk-agree').checked) { markGroup('bk-agree-field'); ok = false; }
      if (!ok) { setStatus('booking-status', 'Please complete the highlighted fields.', true); return; }

      var info = window.LMVPricing.getTier(serviceSel.value, tierSel.value);
      var estTotal = $('est-total').textContent;
      var payload = {
        _subject: 'New booking request: ' + ($('bk-name').value || '') + ' (' + (info ? info.service.name : '') + ')',
        _template: 'table',
        _captcha: 'false',
        Name: $('bk-name').value,
        Email: $('bk-email').value,
        Phone: $('bk-phone').value,
        Service: info ? info.service.name : serviceSel.value,
        Package: info ? (info.tier.badge + ' · ' + info.tier.name) : tierSel.value,
        'Preferred date': $('bk-date').value,
        Location: $('bk-location').value,
        'Add-ons': selectedAddons().map(function (a) { return a.name; }).join(', ') || 'None',
        'Estimated total': estTotal,
        'Estimated deposit (50%)': $('est-deposit').textContent,
        Message: $('bk-message').value,
        'Agreed to terms': 'Yes, agreed to the 50% deposit & cancellation policy'
      };
      if (!hoursField.hidden) payload.Hours = $('bk-hours').value;
      if (!kmField.hidden) payload['Travel distance (km)'] = $('bk-km').value;
      submit(form, payload, 'booking-status', 'booking-success');
    });

    serviceSel.selectedIndex = 0;
    populateTiers();
  }

  /* ---------------- Contact ---------------- */
  function initContact() {
    var form = $('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      var ok = requireField('ct-name');
      ok = requireEmail('ct-email') && ok;
      ok = requireField('ct-message') && ok;
      if (!ok) { setStatus('contact-status', 'Please complete the highlighted fields.', true); return; }
      submit(form, {
        _subject: 'New message from ' + $('ct-name').value + ' (LM Visuals site)',
        _template: 'table',
        _captcha: 'false',
        Name: $('ct-name').value,
        Email: $('ct-email').value,
        Message: $('ct-message').value
      }, 'contact-status', 'contact-success');
    });
  }

  /* ---------------- Shared submit ---------------- */
  function submit(form, payload, statusId, successId) {
    // honeypot — if a bot filled the hidden field, pretend success & bail
    var hp = form.querySelector('input[name="_honey"]');
    if (hp && hp.value) { showSuccess(form, successId); return; }

    var btn = form.querySelector('[type="submit"]');
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }
    setStatus(statusId, '');

    // Optional: also append the lead to a Google Sheet (if configured in data.js).
    // Fire-and-forget; text/plain avoids a CORS preflight Apps Script can't answer.
    if (window.LMV && window.LMV.sheetEndpoint) {
      try {
        fetch(window.LMV.sheetEndpoint, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } catch (e) { /* non-blocking — email delivery below is the source of truth */ }
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json().catch(function () { return {}; });
      })
      .then(function (data) {
        // FormSubmit returns HTTP 200 even when it declines (e.g. form not yet
        // activated). Treat success:"false" as a real failure, not a fake success.
        if (data && (data.success === 'false' || data.success === false)) {
          throw new Error(data.message || 'declined');
        }
        showSuccess(form, successId);
      })
      .catch(function () {
        setStatus(statusId, 'Something went wrong. Please email ' + EMAIL + ' directly.', true);
      })
      .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = orig; } });
  }

  function showSuccess(form, successId) {
    var s = $(successId);
    form.hidden = true;
    if (s) { s.classList.add('is-shown'); s.setAttribute('tabindex', '-1'); s.focus(); }
  }

  /* ---------------- Validation helpers ---------------- */
  function fieldWrap(id) { var f = $(id); return f ? f.closest('.field') : null; }
  function requireField(id) {
    var f = $(id); var w = fieldWrap(id);
    var ok = f && f.value.trim().length > 0;
    if (w) w.classList.toggle('field--invalid', !ok);
    return ok;
  }
  function requireEmail(id) {
    var f = $(id); var w = fieldWrap(id);
    var ok = f && isEmail(f.value.trim());
    if (w) w.classList.toggle('field--invalid', !ok);
    return ok;
  }
  function markGroup(wrapId) { var w = $(wrapId); if (w) w.classList.add('field--invalid'); }
  function clearErrors(form) {
    form.querySelectorAll('.field--invalid').forEach(function (n) { n.classList.remove('field--invalid'); });
  }
  function setStatus(id, msg, isError) {
    var s = $(id); if (!s) return;
    s.textContent = msg || '';
    s.classList.toggle('is-error', !!isError);
  }

  function init() { initBooking(); initContact(); }
  window.LMVBooking = window.LMVBooking || {};
  window.LMVBooking.init = init;
})();
