(function () {
  'use strict';

  var cfg = { api: null, icons: {}, onClose: null, onChange: null, avatar: 'icons/icon-192.png' };
  var state = { id: null, recovery: null, messages: [], seen: {}, rendered: {}, last: null, busy: false, timer: null, view: null };

  var LABELS = {
    Detected: 'Finding a new flight', Analysing: 'Finding a new flight', Rebooked: 'Rebooked', Kept: 'Booking kept',
    Confirmed: 'Confirmed', Changed: 'Updated', Cancelled: 'Cancelled', Refunded: 'Refunded', 'Credit Issued': 'Credit issued',
    'With Rep': 'With a specialist', 'Needs Attention': 'Specialist assigned', Resolved: 'Resolved'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function icon(name) {
    return '<span class="rv-i">' + (cfg.icons[name] || '') + '</span>';
  }

  function money(v, unit) {
    var n = Number(v || 0);
    if (unit === 'points') return n.toLocaleString('en-US') + ' points';
    return 'USD ' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function clock(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  function qr(text) {
    var n = 25;
    var seed = hash(String(text || 'aspire'));
    var cells = '';
    function finder(x, y) {
      return '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#14171d"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" fill="#14171d"/>';
    }
    function inFinder(x, y) {
      return (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    }
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        if (inFinder(x, y)) continue;
        seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + x * 374761393 + y * 668265263) >>> 0;
        if (seed % 100 < 47) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
      }
    }
    return '<svg class="rv-qr" viewBox="-1 -1 ' + (n + 2) + ' ' + (n + 2) + '" role="img" aria-label="Code ' + esc(text) + '"><rect x="-1" y="-1" width="' + (n + 2) + '" height="' + (n + 2) + '" fill="#fff"/><g fill="#14171d">' + cells + '</g>' + finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7) + '</svg>';
  }

  function chip(text, cls) {
    return '<span class="rv-chip ' + (cls || '') + '">' + esc(text) + '</span>';
  }

  function stopsText(s) {
    var n = Number(s || 0);
    return n === 0 ? 'Nonstop' : n + (n === 1 ? ' stop' : ' stops');
  }

  function route(c) {
    return '<div class="rv-route">' +
      '<div><b>' + esc(c.from) + '</b><span>' + esc(c.departureTime || '') + '</span></div>' +
      '<div class="rv-line"><i></i>' + icon('plane') + '<i></i><small>' + esc(c.duration || '') + '</small></div>' +
      '<div class="end"><b>' + esc(c.to) + '</b><span>' + esc(c.arrivalTime || '') + '</span></div></div>';
  }

  function card(c) {
    if (!c || !c.type) return '';
    var t = c.type;
    if (t === 'disruption') {
      var cancelled = c.status === 'Cancelled';
      return '<div class="rv-card rv-alert ' + (cancelled ? 'bad' : 'warn') + '">' +
        '<div class="rv-card-top">' + chip(cancelled ? 'Cancelled by airline' : 'Time changed by airline', cancelled ? 'bad' : 'warn') + '<span>' + esc(c.airline) + ' ' + esc(c.code) + '</span></div>' +
        route(c) +
        '<p class="rv-sub">' + esc(c.departureDay || '') + (c.reason ? ' · ' + esc(c.reason) : '') + '</p>' +
        (c.newDeparture ? '<p class="rv-sub strong">New departure: ' + esc(c.newDeparture) + '</p>' : '') + '</div>';
    }
    if (t === 'booking') {
      var why = (c.why || []).map(function (w) { return '<li>' + icon('check') + '<span>' + esc(w) + '</span></li>'; }).join('');
      return '<div class="rv-card rv-booking">' +
        '<div class="rv-card-top"><span class="rv-eyebrow">' + esc(c.title || 'Your new flight') + '</span>' + chip(c.status || 'Confirmed', 'good') + '</div>' +
        '<div class="rv-airline">' + esc(c.airline) + ' <b>' + esc(c.code) + '</b></div>' +
        (c.headline ? '<p class="rv-headline">' + esc(c.headline) + '</p>' : '') +
        route(c) +
        '<p class="rv-sub">' + esc(c.departureDay || '') + ' · ' + esc(stopsText(c.stops)) + ' · ' + esc(c.cabin || 'Economy') + '</p>' +
        '<div class="rv-facts">' +
        '<span>' + icon('seat') + esc(c.seats || '') + '</span>' +
        '<span>' + icon('users') + esc(c.party) + (Number(c.party) === 1 ? ' traveller' : ' travellers') + '</span>' +
        (c.gate ? '<span>' + icon('pin') + 'Gate ' + esc(c.gate) + '</span>' : '') +
        (c.boarding ? '<span>' + icon('clock') + 'Boards ' + esc(c.boarding) + '</span>' : '') + '</div>' +
        '<div class="rv-free">' + icon('gift') + esc(c.price || 'No extra cost') + '</div>' +
        (why ? '<div class="rv-why"><h4>Why this flight</h4><ul>' + why + '</ul></div>' : '') +
        (c.hotel ? '<p class="rv-note">' + icon('bed') + esc(c.hotel) + '</p>' : '') +
        (c.transfer ? '<p class="rv-note">' + icon('pin') + esc(c.transfer) + '</p>' : '') +
        (c.source === 'Prompt Builder' ? '<div class="rv-ai">' + icon('sparkle') + 'Chosen by Aspire AI from your travel history</div>' : '') + '</div>';
    }
    if (t === 'options') {
      var opts = (c.options || []).map(function (o) {
        var facts = (o.facts || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
        return '<div class="rv-option">' +
          '<div class="rv-option-head"><b>' + esc(o.airline) + ' ' + esc(o.code) + '</b><span>' + esc(o.departureDay || '') + '</span></div>' +
          '<div class="rv-option-times"><b>' + esc(o.departureTime) + '</b><span>' + esc(stopsText(o.stops)) + '</span><b>' + esc(o.arrivalTime) + '</b></div>' +
          '<p class="rv-sub">' + esc(o.vsPlan || '') + ' vs your original plan · ' + esc(o.seatsLeft) + ' seats left</p>' +
          (facts ? '<ul>' + facts + '</ul>' : '') +
          '<button type="button" class="rv-btn" data-rv-action="choose" data-rv-value="' + esc(o.id) + '" data-rv-label="' + esc('I will take ' + o.airline + ' ' + o.code) + '">Choose this flight</button></div>';
      }).join('');
      return '<div class="rv-options">' + opts + '</div>';
    }
    if (t === 'refund') {
      var choices = (c.choices || []).map(function (ch) {
        return '<button type="button" class="rv-choice" data-rv-action="' + esc(ch.action) + '" data-rv-label="' + esc(ch.label) + '">' +
          '<span><b>' + esc(ch.label) + '</b><small>' + esc(ch.detail) + '</small></span>' +
          '<strong>' + esc(money(ch.amount, ch.action === 'points' ? 'points' : 'USD')) + '</strong></button>';
      }).join('');
      return '<div class="rv-card rv-refund">' + choices + '</div>';
    }
    if (t === 'receipt') {
      return '<div class="rv-card rv-receipt">' +
        '<div class="rv-tick">' + icon('check') + '</div>' +
        '<h4>' + esc(c.title) + '</h4>' +
        (c.amount != null ? '<div class="rv-amount">' + esc(money(c.amount, c.unit)) + '</div>' : '') +
        '<dl><dt>Reference</dt><dd>' + esc(c.reference) + '</dd><dt>Paid as</dt><dd>' + esc(c.method) + '</dd><dt>When</dt><dd>' + esc(c.eta) + '</dd></dl></div>';
    }
    if (t === 'voucher') {
      return '<div class="rv-card rv-voucher">' +
        '<div class="rv-voucher-main"><span class="rv-eyebrow">Aspire care voucher</span><h4>' + esc(c.code) + '</h4>' +
        (c.hotel ? '<p>' + icon('bed') + esc(c.hotel) + '</p>' : '') +
        (c.meal ? '<p>' + icon('gift') + esc(c.meal) + '</p>' : '') +
        '<p class="rv-sub">Valid until ' + esc(c.validUntil || '') + (c.airport ? ' · ' + esc(c.airport) : '') + '</p></div>' +
        '<div class="rv-voucher-code">' + qr(c.qr || c.code) + '</div></div>';
    }
    if (t === 'boarding') {
      return '<div class="rv-card rv-pass">' +
        '<div class="rv-pass-top"><span>' + esc(c.airline) + '</span><b>' + esc(c.code) + '</b></div>' +
        '<div class="rv-pass-route"><div><b>' + esc(c.from) + '</b><span>' + esc(c.fromCity || '') + '</span></div>' + icon('plane') + '<div class="end"><b>' + esc(c.to) + '</b><span>' + esc(c.toCity || '') + '</span></div></div>' +
        '<div class="rv-pass-grid">' +
        '<div><small>Passenger</small><b>' + esc(c.passenger) + (Number(c.party) > 1 ? ' +' + (Number(c.party) - 1) : '') + '</b></div>' +
        '<div><small>Date</small><b>' + esc(c.departureDay) + '</b></div>' +
        '<div><small>Departs</small><b>' + esc(c.departureTime) + '</b></div>' +
        '<div><small>Boarding</small><b>' + esc(c.boarding) + '</b></div>' +
        '<div><small>Gate</small><b>' + esc(c.gate) + '</b></div>' +
        '<div><small>Seats</small><b>' + esc(c.seats) + '</b></div></div>' +
        '<div class="rv-pass-cut"></div>' +
        '<div class="rv-pass-code">' + qr(c.qr) + '<span>Show this at the gate</span></div></div>';
    }
    if (t === 'compensation') {
      var ok = c.status === 'Eligible' || c.status === 'Claimed';
      return '<div class="rv-card rv-comp">' +
        '<div class="rv-card-top">' + chip(c.status === 'Claimed' ? 'Claim filed' : (ok ? 'Eligible' : 'Not eligible'), ok ? 'good' : 'muted') + (ok && c.amount ? '<b>EUR ' + esc(c.amount) + ' per passenger</b>' : '') + '</div>' +
        '<p>' + esc(c.reason) + '</p><p class="rv-sub strong">' + esc(c.refundRight) + '</p></div>';
    }
    if (t === 'hotel') {
      return '<div class="rv-card rv-hotel"><p>' + icon('bed') + esc(c.hotel) + '</p>' + (c.transfer ? '<p>' + icon('pin') + esc(c.transfer) + '</p>' : '') + '</div>';
    }
    if (t === 'seats') {
      var seats = String(c.seats || '');
      var m = seats.match(/^(\d+)([A-F])(?:\s*to\s*\d+([A-F]))?$/);
      var row = m ? m[1] : '';
      var a = m ? 'ABCDEF'.indexOf(m[2]) : -1;
      var b = m ? (m[3] ? 'ABCDEF'.indexOf(m[3]) : a) : -1;
      var cells = 'ABCDEF'.split('').map(function (l, i) {
        return (i === 3 ? '<i class="aisle"></i>' : '') + '<span class="' + (i >= a && i <= b ? 'mine' : (i % 2 ? 'taken' : '')) + '">' + l + '</span>';
      }).join('');
      return '<div class="rv-card rv-seats"><div class="rv-card-top"><span class="rv-eyebrow">' + esc(c.flight) + '</span>' + chip('Seated together', 'good') + '</div>' +
        '<div class="rv-seatrow"><b>' + esc(row) + '</b>' + cells + '</div><p class="rv-sub">Seats ' + esc(seats) + '</p></div>';
    }
    if (t === 'handoff') {
      return '<div class="rv-card rv-handoff"><div class="rv-dots"><i></i><i></i><i></i></div><div><b>' + esc(c.status || 'Connecting you') + '</b><span>Case ' + esc(c.caseNumber) + '</span></div></div>';
    }
    return '';
  }

  function messageHtml(m) {
    var fresh = state.rendered[m.id] ? '' : ' fresh';
    var body = m.body ? '<p>' + esc(m.body) + '</p>' : '';
    var cardHtml = card(m.card);
    var time = clock(m.sentAt);
    if (m.role === 'System') {
      return '<div class="rv-msg system' + fresh + '" data-id="' + esc(m.id) + '">' + (cardHtml || '') + (body ? '<div class="rv-sys">' + body + '</div>' : '') + '</div>';
    }
    if (m.role === 'Customer') {
      return '<div class="rv-msg me' + fresh + '" data-id="' + esc(m.id) + '"><div class="rv-bubble">' + body + '</div><time>' + time + '</time></div>';
    }
    var rep = m.role === 'Rep';
    var who = rep ? (m.author ? esc(m.author) + ' · Aspire team' : 'Aspire team') : 'Aspire assistant';
    var avatar = rep ? '<span class="rv-av rep">' + esc((m.author || 'A').split(' ').map(function (p) { return p.charAt(0); }).join('').slice(0, 2).toUpperCase()) + '</span>' : '<img class="rv-av" src="' + cfg.avatar + '" alt="">';
    return '<div class="rv-msg them' + (rep ? ' rep' : '') + fresh + '" data-id="' + esc(m.id) + '">' + avatar +
      '<div class="rv-stack"><span class="rv-who">' + who + '</span>' + (body ? '<div class="rv-bubble">' + body + '</div>' : '') + cardHtml + '<time>' + time + '</time></div></div>';
  }

  function render() {
    var v = state.view;
    if (!v) return;
    var r = state.recovery || {};
    var head = v.querySelector('.rv-title span');
    if (head) head.textContent = (r.airline ? r.airline + ' ' : '') + (r.flight || '') + (r.route ? ' · ' + r.route : '');
    var status = v.querySelector('.rv-status');
    if (status) {
      status.textContent = LABELS[r.status] || r.status || '';
      status.className = 'rv-status ' + (r.live ? 'live' : (/Rebooked|Kept|Confirmed|Changed/.test(r.status || '') ? 'good' : ''));
    }
    var live = v.querySelector('.rv-livebar');
    live.hidden = !r.live;
    if (r.live) live.innerHTML = '<i></i>Aspire disruption team · Live' + (r.caseNumber ? ' · Case ' + esc(r.caseNumber) : '');
    var input = v.querySelector('.rv-composer input');
    input.placeholder = r.live ? 'Message the Aspire team' : 'Ask about your flight';
    var list = v.querySelector('.rv-list');
    var working = !state.messages.length && /Detected|Analysing/.test(r.status || '');
    var html = state.messages.map(messageHtml).join('');
    if (working) {
      html = '<div class="rv-working"><div class="rv-orbit">' + icon('plane') + '</div><h3>Finding your best new flight</h3><p>We are checking every flight on your route against your travel history, seats for your whole party and your trip plans.</p></div>';
    } else if (!state.messages.length) {
      html = '<div class="rv-working"><div class="rv-orbit">' + icon('clock') + '</div><h3>Loading your flight update</h3></div>';
    }
    if (state.busy) html += '<div class="rv-msg them typing"><img class="rv-av" src="' + cfg.avatar + '" alt=""><div class="rv-stack"><div class="rv-bubble"><span class="rv-type"><i></i><i></i><i></i></span></div></div></div>';
    list.innerHTML = html;
    state.messages.forEach(function (m) { state.rendered[m.id] = true; });
    var replies = [];
    if (!r.live) {
      for (var i = state.messages.length - 1; i >= 0; i--) {
        var m = state.messages[i];
        if (m.replies && m.replies.length) { replies = m.replies; break; }
        if (m.role === 'Customer') break;
      }
    }
    var bar = v.querySelector('.rv-replies');
    bar.innerHTML = replies.map(function (q) {
      return '<button type="button" data-rv-action="' + esc(q.action) + '"' + (q.value ? ' data-rv-value="' + esc(q.value) + '"' : '') + ' data-rv-label="' + esc(q.label) + '">' + esc(q.label) + '</button>';
    }).join('');
    bar.hidden = !replies.length || state.busy;
    var scroller = v.querySelector('.rv-scroll');
    requestAnimationFrame(function () { scroller.scrollTop = scroller.scrollHeight; });
  }

  function absorb(data) {
    if (!data) return;
    if (data.recovery) state.recovery = data.recovery;
    (data.messages || []).forEach(function (m) {
      if (state.seen[m.id]) return;
      state.seen[m.id] = true;
      state.messages.push(m);
      if (m.sentAt && (!state.last || m.sentAt > state.last)) state.last = m.sentAt;
    });
    if (cfg.onChange) cfg.onChange(state.recovery);
  }

  function schedule() {
    clearTimeout(state.timer);
    if (!state.id || !state.view || state.view.hidden) return;
    var r = state.recovery || {};
    var wait = r.live ? 4000 : (/Detected|Analysing/.test(r.status || '') || !state.messages.length ? 3000 : 0);
    if (!wait) return;
    state.timer = setTimeout(poll, wait);
  }

  function poll() {
    if (!state.id || document.visibilityState !== 'visible') { schedule(); return; }
    var id = state.id;
    cfg.api('/flightRecovery/' + encodeURIComponent(id) + (state.last ? '?after=' + encodeURIComponent(state.last) : ''))
      .then(function (data) {
        if (state.id !== id) return;
        var before = state.messages.length;
        var wasLive = state.recovery && state.recovery.live;
        absorb(data);
        if (state.messages.length !== before || wasLive !== (state.recovery && state.recovery.live)) render();
      })
      .catch(function () { return null; })
      .then(schedule);
  }

  function send(payload) {
    if (state.busy || !state.id) return;
    state.busy = true;
    if (payload.label || payload.text) {
      var temp = { id: 'tmp-' + Date.now(), role: 'Customer', body: payload.text || payload.label, sentAt: new Date().toISOString() };
      state.messages.push(temp);
      state.seen[temp.id] = true;
      payload.tempId = temp.id;
    }
    render();
    var tempId = payload.tempId;
    delete payload.tempId;
    cfg.api('/flightRecovery/' + encodeURIComponent(state.id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (data) {
      state.messages = state.messages.filter(function (m) { return m.id !== tempId; });
      absorb(data);
    }).catch(function () {
      state.messages.push({ id: 'err-' + Date.now(), role: 'System', body: 'That did not go through. Please check your connection and try again.' });
    }).then(function () {
      state.busy = false;
      render();
      schedule();
    });
  }

  function build(view) {
    view.innerHTML = '<div class="rv">' +
      '<header class="rv-head">' +
      '<button type="button" class="rv-back" aria-label="Back">' + (cfg.icons.chev || '') + '</button>' +
      '<div class="rv-title"><b>Flight update</b><span></span></div>' +
      '<span class="rv-status"></span></header>' +
      '<div class="rv-livebar" hidden></div>' +
      '<div class="rv-scroll"><div class="rv-list"></div></div>' +
      '<div class="rv-replies" hidden></div>' +
      '<form class="rv-composer" autocomplete="off"><input type="text" enterkeyhint="send" maxlength="1000" aria-label="Message"><button type="submit" aria-label="Send">' + (cfg.icons.arrow || '') + '</button></form>' +
      '</div>';
    view.querySelector('.rv-back').addEventListener('click', function () { close(); if (cfg.onClose) cfg.onClose(); });
    view.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rv-action]');
      if (!b || state.busy) return;
      send({ action: b.getAttribute('data-rv-action'), value: b.getAttribute('data-rv-value') || null, label: b.getAttribute('data-rv-label') || b.textContent.trim() });
    });
    view.querySelector('.rv-composer').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = view.querySelector('.rv-composer input');
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      send({ text: text });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && state.id && !view.hidden) poll();
    });
  }

  function open(id) {
    if (!state.view) return;
    if (state.id !== id) {
      state.id = id;
      state.recovery = null;
      state.messages = [];
      state.seen = {};
      state.rendered = {};
      state.last = null;
    }
    render();
    clearTimeout(state.timer);
    cfg.api('/flightRecovery/' + encodeURIComponent(id))
      .then(function (data) {
        if (state.id !== id) return;
        absorb(data);
        render();
      })
      .catch(function () {
        state.recovery = state.recovery || { status: '' };
        state.messages.push({ id: 'err-load', role: 'System', body: 'We could not load this update. Please sign in again or try in a moment.' });
        render();
      })
      .then(schedule);
  }

  function close() {
    clearTimeout(state.timer);
  }

  function active() {
    return cfg.api('/flightRecovery/active').then(function (d) { return (d && d.recoveries) || []; });
  }

  window.AspireRecovery = {
    configure: function (opts) {
      Object.keys(opts || {}).forEach(function (k) { cfg[k] = opts[k]; });
      state.view = document.getElementById('view-recovery');
      if (state.view && !state.view.firstChild) build(state.view);
    },
    open: open,
    close: close,
    active: active,
    current: function () { return state.id; }
  };
})();
