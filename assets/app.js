(function () {
  'use strict';

  var VERSION = '2.1.8';
  var KEYS = {
    updates: 'aspireApp.updates.v1',
    seen: 'aspireApp.updatesSeen.v1',
    home: 'aspireApp.home.v1'
  };
  var AUTH = {
    site: 'https://orgfarm-e88355df2d-dev-ed.develop.my.site.com/aspireapp',
    api: 'https://orgfarm-e88355df2d-dev-ed.develop.my.site.com/aspireappvforcesite/services/apexrest',
    logout: 'https://orgfarm-e88355df2d-dev-ed.develop.my.site.com/aspireappvforcesite/secur/logout.jsp',
    clientId: '3MVG9XgkMlifdwVCcjmh1PMTUBG3831HP23RbBiE65U5ZxXaLiHAHLoLmN3Mh2I51ggnZWCQUCiW3Up66VcCZ',
    key: 'aspireApp.auth.v1',
    stateKey: 'aspireApp.authState.v1'
  };
  var PUSH = {
    config: {
      apiKey: 'AIzaSyCZaxyBCREtC3gcgbY-ge3fJN0Ytf04LzY',
      authDomain: 'aspire-app-demo.firebaseapp.com',
      projectId: 'aspire-app-demo',
      storageBucket: 'aspire-app-demo.firebasestorage.app',
      messagingSenderId: '462519727698',
      appId: '1:462519727698:web:bb26d388543388c78ad18b'
    },
    vapidKey: 'BD4OagjYTOReDDeRGSoRfiJW5Z_rTFSS8KO6KhZcaTkUSftUcotasKxDA_umPd7Iq4nif5V5gWI2A13aoqlD5Gw',
    key: 'aspireApp.push.v1'
  };

  var PHOTOS = {
    hero: 'photo-1566073771259-6a8506099945',
    concierge: 'photo-1542314831-068cd1dbfeeb',
    travel: 'photo-1436491865332-7a61a109cc05',
    experiences: 'photo-1414235077428-338989a2e8c0',
    benefits: 'photo-1551882547-ff40c63fe5fa',
    rewards: 'photo-1513151233558-d860c5398176',
    airport: 'photo-1530521954074-e64f6810b32d',
    medical: 'photo-1576091160550-2173dba999ef',
    wellness: 'photo-1544161515-4ab6ce6db874',
    reach: 'photo-1477959858617-67f85cf4f1df',
    resort: 'photo-1520250497591-112f2f40a3f4',
    dining: 'photo-1517248135467-4c7edcad34c4',
    journey: 'photo-1488646953014-85cb44e25828'
  };

  var DESTINATIONS = [
    { keys: ['dubai', 'dxb'], photo: 'photo-1512453979798-5ea266f8880c' },
    { keys: ['paris', 'cdg', 'ory'], photo: 'photo-1502602898657-3e91760cbb34' },
    { keys: ['maldives', 'mle', 'malé'], photo: 'photo-1514282401047-d79a71a590e8' },
    { keys: ['london', 'lhr', 'lgw'], photo: 'photo-1513635269975-59663e0ac1ad' },
    { keys: ['new york', 'nyc', 'jfk', 'ewr'], photo: 'photo-1496442226666-8d4d0e62e6e9' },
    { keys: ['tokyo', 'hnd', 'nrt'], photo: 'photo-1540959733332-eab4deabeeaf' },
    { keys: ['cancun', 'cancún', 'cun', 'riviera maya'], photo: 'photo-1510097467424-192d713fd8b2' },
    { keys: ['honolulu', 'hnl', 'hawaii', 'maui', 'oahu'], photo: 'photo-1507876466758-bc54f384809c' },
    { keys: ['bali', 'dps'], photo: 'photo-1537996194471-e657df975ab4' },
    { keys: ['singapore', 'sin'], photo: 'photo-1525625293386-3f8f99389edd' },
    { keys: ['rome', 'fco'], photo: 'photo-1552832230-c0197dd311b5' },
    { keys: ['santorini', 'jtr', 'greece', 'mykonos'], photo: 'photo-1570077188670-e3a8d69ac5ff' }
  ];
  var FALLBACK_PHOTOS = [PHOTOS.resort, PHOTOS.hero, PHOTOS.reach, PHOTOS.journey, PHOTOS.travel];

  var CODES = {
    CUN: 'Cancun', HNL: 'Honolulu', DXB: 'Dubai', LHR: 'London', LGW: 'London', CDG: 'Paris', ORY: 'Paris',
    JFK: 'New York', EWR: 'New York', HND: 'Tokyo', NRT: 'Tokyo', MLE: 'Maldives', SIN: 'Singapore', DPS: 'Bali',
    FCO: 'Rome', JTR: 'Santorini', MIA: 'Miami', LAX: 'Los Angeles', SFO: 'San Francisco', BCN: 'Barcelona',
    AMS: 'Amsterdam', DEL: 'Delhi', BOM: 'Mumbai', SYD: 'Sydney', HKG: 'Hong Kong', BKK: 'Bangkok', IST: 'Istanbul'
  };

  var SERVICES = [
    { id: 'concierge', title: 'Concierge', photo: PHOTOS.concierge, text: 'Restaurant tables, event tickets, gifts and the hard to find. Ask once, and your concierge takes care of the rest.', ask: 'Could you help me with a concierge request? ' },
    { id: 'travel', title: 'Travel Services', photo: PHOTOS.travel, text: 'Flights, stays and complete trip packages, planned around the way you like to travel and protected if plans change.', ask: 'I would like to plan a trip to ' },
    { id: 'experiences', title: 'Experiences', photo: PHOTOS.experiences, text: 'Chef’s tables, private tours and moments worth travelling for, added to any trip.', ask: 'What experiences could you add to my next trip?' },
    { id: 'airport', title: 'Airport Services', photo: PHOTOS.airport, text: 'Fast track, lounges and meet and greet, so the journey feels easy from the moment you leave home.', ask: 'Could you arrange airport services for my next trip?' },
    { id: 'wellness', title: 'Health & Wellness', photo: PHOTOS.wellness, text: 'Spa days, fitness and wellbeing retreats, booked around your plans.', ask: 'Could you book a spa or wellness experience for me?' },
    { id: 'rewards', title: 'Rewards', photo: PHOTOS.rewards, text: 'Earn Aspire points on every booking, and use them on flights, stays and services whenever you like.', ask: 'How can I use my Aspire points?' },
    { id: 'medical', title: 'Travel & Medical Assistance', photo: PHOTOS.medical, text: 'Help when plans go wrong, wherever you are in the world, around the clock.', ask: 'I need travel assistance with ' }
  ];

  var JOURNAL = [
    { tag: 'Insights', title: 'How AI agents are reshaping premium concierge', text: 'Personal service at scale: where automation helps, and where people make the difference.', photo: PHOTOS.resort },
    { tag: 'Loyalty', title: 'Five trends defining loyalty programmes this year', text: 'From experiential rewards to tailored benefits, what members value most right now.', photo: PHOTOS.dining },
    { tag: 'Travel', title: 'Seamless journeys, from booking to the airport lounge', text: 'How connected travel services take the friction out of every trip.', photo: PHOTOS.journey }
  ];

  var DEFAULT_IDEAS = [
    { title: 'Dubai for Thanksgiving', destination: 'Dubai', dates: '24–29 Nov 2026 · 5 nights', tag: 'Popular this season', reason: '' },
    { title: 'Maldives for Christmas', destination: 'Maldives', dates: '23–30 Dec 2026 · 7 nights', tag: 'Popular this season', reason: '' },
    { title: 'Paris for Easter', destination: 'Paris', dates: '26 Mar – 2 Apr 2027 · 7 nights', tag: 'Popular this season', reason: '' }
  ];

  var S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    home: '<svg viewBox="0 0 24 24" ' + S + '><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></svg>',
    trips: '<svg viewBox="0 0 24 24" ' + S + '><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"/><path d="M3 12.5h18"/></svg>',
    chat: '<svg viewBox="0 0 24 24" ' + S + '><path d="M12 3.5c4.97 0 9 3.36 9 7.5s-4.03 7.5-9 7.5c-1.05 0-2.06-.15-3-.43L4.5 20l1.08-3.6C4.03 15.06 3 13.12 3 11c0-4.14 4.03-7.5 9-7.5z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" ' + S + '><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    user: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4.2 4.3-6.5 8-6.5s6.8 2.3 8 6.5"/></svg>',
    plane: '<svg viewBox="0 0 24 24" ' + S + '><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    bed: '<svg viewBox="0 0 24 24" ' + S + '><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 17h20"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" ' + S + '><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
    users: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.9-3.4 3.4-5.3 6.5-5.3s5.6 1.9 6.5 5.3"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14.9c1.6.7 2.6 2.4 3 5.1"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" ' + S + '><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" ' + S + '><path d="M9 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" ' + S + '><path d="M6 6l12 12M18 6 6 18"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="19" r="1.9"/></svg>',
    star: '<svg viewBox="0 0 24 24" ' + S + '><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" ' + S + '><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13"/><path d="M12 8c-1.5-3.5-5-4-5.5-2S9 8 12 8zm0 0c1.5-3.5 5-4 5.5-2S15 8 12 8z"/></svg>',
    headset: '<svg viewBox="0 0 24 24" ' + S + '><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M19.5 19c0 1.5-2 2.5-5 2.5"/></svg>',
    logout: '<svg viewBox="0 0 24 24" ' + S + '><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l-4-4 4-4M6 12h10"/></svg>',
    download: '<svg viewBox="0 0 24 24" ' + S + '><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>',
    info: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    pin: '<svg viewBox="0 0 24 24" ' + S + '><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" ' + S + '><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
    seat: '<svg viewBox="0 0 24 24" ' + S + '><path d="M7 3v9a3 3 0 0 0 3 3h7"/><path d="M5 21h14"/><path d="M16 15l2 6M8 15l-2 6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    down: '<svg viewBox="0 0 24 24" ' + S + '><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" ' + S + '><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    alert: '<svg viewBox="0 0 24 24" ' + S + '><path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" ' + S + '><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" ' + S + '><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>'
  };

  var NOTICE = {
    'Rebooked': ['plane', 'Flight rebooked for you', 'k-rebooked'],
    'Rebooking proposal': ['alert', 'Your decision needed', ''],
    'Hotel price drop': ['down', 'Price drop found', 'k-price'],
    'Delay notice': ['clock', 'Flight delayed', 'k-delay'],
    'Check-in reminder': ['check', 'You are checked in', 'k-checkin'],
    'Escalated': ['headset', 'Concierge team on it', '']
  };

  var els = {};
  var current = 'home';
  var deferredInstall = null;
  var chatMounted = false;
  var tripFilter = 'upcoming';
  var lastHomeFetch = 0;
  var recoveries = [];

  function $(id) { return document.getElementById(id); }

  function read(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { return; }
  }

  function forget(key) {
    try { localStorage.removeItem(key); } catch (e) { return; }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function icon(name) { return '<span class="icon">' + (ICONS[name] || '') + '</span>'; }

  function photo(id, w) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 900) + '&q=70'; }

  function bg(id, w) { return ' style="background-image:url(\'' + photo(id, w) + '\')"'; }

  function num(v) { return new Intl.NumberFormat('en-US').format(Math.round(v || 0)); }

  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function fitHeight() {
    var h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-h', Math.round(h) + 'px');
  }

  function placeName(s) {
    s = String(s || '').trim();
    if (/^[A-Z]{3}$/.test(s) && CODES[s]) return CODES[s];
    return s || 'Your trip';
  }

  function destPhoto(text) {
    var t = String(text || '').toLowerCase();
    for (var i = 0; i < DESTINATIONS.length; i++) {
      for (var k = 0; k < DESTINATIONS[i].keys.length; k++) {
        if (t.indexOf(DESTINATIONS[i].keys[k]) !== -1) return DESTINATIONS[i].photo;
      }
    }
    var h = 0;
    for (var j = 0; j < t.length; j++) h = (h * 31 + t.charCodeAt(j)) % 997;
    return FALLBACK_PHOTOS[h % FALLBACK_PHOTOS.length];
  }

  function parseDay(s) {
    if (!s) return null;
    var p = String(s).split('-');
    return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
  }

  var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function fmtDay(d, year) {
    return WEEKDAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + (year ? ' ' + d.getFullYear() : '');
  }

  function tripRange(t) {
    var a = parseDay(t.startDate), b = parseDay(t.endDate);
    if (!a) return 'Dates to be confirmed';
    return b ? fmtDay(a, false) + ' – ' + fmtDay(b, true) : fmtDay(a, true);
  }

  function nights(t) {
    var a = parseDay(t.startDate), b = parseDay(t.endDate);
    return a && b ? Math.max(0, Math.round((b - a) / 864e5)) : 0;
  }

  function countdown(t) {
    var a = parseDay(t.startDate);
    if (!a) return '';
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var d = Math.round((a - today) / 864e5);
    if (d <= 0) return 'Happening now';
    if (d === 1) return 'Tomorrow';
    return 'In ' + d + ' days';
  }

  function fmtTime(ms) { return new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }); }

  function fmtFlightDay(ms) {
    var d = new Date(ms);
    return WEEKDAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];
  }

  function when(ts) {
    var d = new Date(ts);
    var today = new Date();
    var same = d.toDateString() === today.toDateString();
    return (same ? 'Today' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })) + ' · ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function statusClass(s) {
    if (s === 'Upcoming') return 'upcoming';
    if (s === 'Completed') return 'completed';
    if (s === 'Cancelled') return 'cancelled';
    return 'planning';
  }

  function flightClass(s) {
    if (/cancel/i.test(s)) return 'cancelled';
    if (/complete/i.test(s)) return 'completed';
    if (/resched|delay/i.test(s)) return 'planning';
    return 'upcoming';
  }

  function session() { return read(AUTH.key, null); }

  function guestSession() {
    try { return sessionStorage.getItem('aspireApp.guest.v1') === '1'; } catch (e) { return false; }
  }

  function setGuestSession(on) {
    try {
      if (on) sessionStorage.setItem('aspireApp.guest.v1', '1');
      else sessionStorage.removeItem('aspireApp.guest.v1');
    } catch (e) { return; }
  }

  function token() {
    var s = session();
    return s && s.token ? s.token : null;
  }

  function home() {
    var h = read(KEYS.home, null);
    if (!h) return null;
    if (!!h.signedIn !== !!token()) return null;
    return h;
  }

  function nonce() {
    var a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  function appUrl() { return location.origin + location.pathname; }

  function signIn() {
    var n = nonce();
    write(AUTH.stateKey, { nonce: n, ts: Date.now() });
    location.assign(AUTH.site + '/services/oauth2/authorize?response_type=token' +
      '&client_id=' + encodeURIComponent(AUTH.clientId) +
      '&redirect_uri=' + encodeURIComponent(appUrl()) +
      '&scope=' + encodeURIComponent('api id') +
      '&state=' + n);
  }

  function consumeAuthReturn() {
    var h = location.hash || '';
    if (h.indexOf('access_token=') === -1 && h.indexOf('error=') === -1) return false;
    var p = new URLSearchParams(h.slice(1));
    history.replaceState(null, '', location.pathname + location.search);
    var saved = read(AUTH.stateKey, null);
    forget(AUTH.stateKey);
    if (p.get('error')) {
      toast('Sign-in did not complete: ' + String(p.get('error_description') || p.get('error')).replace(/\+/g, ' '));
      return false;
    }
    if (!saved || saved.nonce !== p.get('state') || Date.now() - saved.ts > 30 * 60 * 1000) {
      toast('Sign-in could not be verified. Please try again.');
      return false;
    }
    write(AUTH.key, { token: p.get('access_token'), issuedAt: Number(p.get('issued_at')) || Date.now(), communityUrl: p.get('sfdc_community_url') || '' });
    forget(KEYS.home);
    write(KEYS.updates, []);
    if (window.AspireChat) window.AspireChat.clear();
    return true;
  }

  function signOut() {
    var pushed = read(PUSH.key, null);
    if (pushed && pushed.token) registerDevice(pushed.token, false).catch(function () { return null; });
    forget(PUSH.key);
    forget(AUTH.key);
    forget(KEYS.home);
    write(KEYS.updates, []);
    setGuestSession(false);
    if (window.AspireChat) window.AspireChat.clear();
    location.assign(AUTH.logout);
  }

  function sessionEnded() {
    forget(AUTH.key);
    forget(KEYS.home);
    renderAll();
    toast('Your session has ended. Please sign in again.', 'Sign in', signIn);
  }

  function api(path, opts) {
    var t = token();
    var headers = (opts && opts.headers) || {};
    if (t) headers.Authorization = 'Bearer ' + t;
    return fetch(AUTH.api + path, {
      method: (opts && opts.method) || 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      keepalive: !!(opts && opts.keepalive),
      headers: headers,
      body: opts && opts.body
    }).then(function (r) {
      if (r.status === 401 && t) { sessionEnded(); throw new Error('please sign in again'); }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function fetchHome(force) {
    if (!force && Date.now() - lastHomeFetch < 20000) return;
    lastHomeFetch = Date.now();
    api('/aspireApp/home')
      .then(function (h) {
        if (!h) return;
        h.savedAt = Date.now();
        write(KEYS.home, h);
        renderAll();
      })
      .catch(function (e) { console.warn('Home not loaded', e); });
  }

  function ensureChat() {
    if (chatMounted || !window.AspireChat) return;
    window.AspireChat.mount(els.chatHost);
    chatMounted = true;
  }

  function openChat(opts) {
    closeSheet();
    setTab('chat');
    if (opts && opts.say) window.AspireChat.sendWhenReady(opts.say);
    else if (opts && opts.prefill) setTimeout(function () { window.AspireChat.prefill(opts.prefill); }, 350);
  }

  function showMain(tab) {
    els.welcome.hidden = true;
    els.main.hidden = false;
    if (!token()) setGuestSession(true);
    setTab(tab || 'home');
    renderAll();
    fetchHome(true);
    if (token()) loadServerUpdates();
    loadRecoveries();
    refreshPush();
  }

  function setTab(name) {
    var views = { home: els.home, trips: els.trips, chat: els.chatView, updates: els.updatesView, account: els.account, recovery: els.recoveryView };
    if (name !== 'recovery' && current === 'recovery' && window.AspireRecovery) window.AspireRecovery.close();
    if (current === name && views[name]) views[name].scrollTop = 0;
    current = name;
    Object.keys(views).forEach(function (k) {
      var v = views[k];
      var on = k === name;
      if (on && v.hidden) {
        v.classList.remove('enter');
        void v.offsetWidth;
        v.classList.add('enter');
      }
      v.hidden = !on;
    });
    [].forEach.call(document.querySelectorAll('.tab'), function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    els.menu.hidden = true;
    if (name === 'chat') {
      ensureChat();
      window.AspireChat.refresh();
    }
    if (name === 'updates') {
      markRead();
      renderNotify();
      loadServerUpdates();
    }
    if (name === 'trips') renderTrips();
    if (name === 'account') renderAccount();
    if (name === 'home') renderHome();
  }

  function renderAll() {
    renderHome();
    renderTrips();
    renderAccount();
    renderUpdates();
    renderNotify();
  }

  function firstName() {
    var h = home();
    var who = window.AspireChat ? window.AspireChat.identity() : null;
    return (h && h.firstName) || (who && who.firstName) || '';
  }

  function memberCard(h, big) {
    var extra = big ? ' big' : '';
    if (token() && !h) return '<div class="skeleton" style="height:124px;margin:' + (big ? '0 0 16px' : '-64px 16px 0') + ';position:relative;z-index:2"></div>';
    if (!h || !h.signedIn) {
      return '<button class="member guest' + extra + '" type="button" data-action="signin">' +
        '<div class="member-row"><span class="member-tier">Aspire Lifestyles</span><span class="member-logo">ASPIRE</span></div>' +
        '<div class="member-points"><div><b>Sign in for your trips,<br>points and updates</b></div><span class="pill-btn light">Sign in</span></div></button>';
    }
    var tier = h.tier || 'Member';
    var cls = /gold|platinum|silver/i.test(tier) ? tier.toLowerCase() : '';
    return '<button class="member ' + cls + extra + '" type="button" data-action="account">' +
      '<div class="member-row"><span class="member-tier">' + esc(tier) + ' member</span><span class="member-logo">ASPIRE</span></div>' +
      '<div class="member-points"><div><b>' + num(h.points) + '</b><small>ASPIRE POINTS</small></div>' +
      '<div class="member-name">' + esc((h.firstName + ' ' + h.lastName).trim()) + '<small>' + esc(h.homeAirport ? 'Home airport ' + h.homeAirport : 'Aspire Lifestyles') + '</small></div></div></button>';
  }

  function tripCard(t) {
    var name = placeName(t.destination);
    var f = t.flights && t.flights[0];
    var stay = t.hotels && t.hotels[0];
    var facts = '';
    if (f) facts += '<span class="fact">' + icon('plane') + esc(f.code) + ' · ' + esc(f.origin) + ' → ' + esc(f.destination) + (f.departs ? ' · ' + fmtTime(f.departs) : '') + '</span>';
    if (stay) facts += '<span class="fact">' + icon('bed') + esc(stay.name) + '</span>';
    if (t.travellers) facts += '<span class="fact">' + icon('users') + t.travellers + (t.travellers === 1 ? ' traveller' : ' travellers') + '</span>';
    return '<button class="trip-card" type="button" data-action="trip" data-id="' + esc(t.id) + '">' +
      '<div class="photo"' + bg(destPhoto(name + ' ' + t.destination), 900) + '></div><div class="shade"></div>' +
      '<div class="chip-row"><span class="chip ' + statusClass(t.status) + '">' + esc(t.status) + '</span>' +
      (t.status === 'Upcoming' ? '<span class="chip dark">' + esc(countdown(t)) + '</span>' : '') + '</div>' +
      '<div class="content"><h3>' + esc(name) + '</h3><div class="meta">' + esc(tripRange(t)) + (nights(t) ? ' · ' + nights(t) + ' nights' : '') + '</div>' +
      (facts ? '<div class="facts">' + facts + '</div>' : '') + '</div></button>';
  }

  function planCard() {
    return '<div class="plan-card"' + bg(PHOTOS.journey, 900) + '><p class="eyebrow">Travel services</p><h3>Plan your next escape</h3>' +
      '<p>Tell your concierge where you would like to go. Flights, stays and experiences, put together in one package.</p>' +
      '<button class="btn btn-primary btn-sm" type="button" data-action="plan">' + icon('sparkle') + 'Start planning</button></div>';
  }

  function unreadCount() {
    return updates().filter(function (u) { return !u.read; }).length;
  }

  function loadRecoveries() {
    if (!token() || !window.AspireRecovery) {
      recoveries = [];
      return;
    }
    window.AspireRecovery.active().then(function (list) {
      recoveries = list || [];
      if (current === 'home') renderHome();
    }).catch(function () { return null; });
  }

  function recoveryBanner() {
    if (!token() || !recoveries.length) return '';
    var r = recoveries[0];
    var rebooked = !!r.newFlight && /Rebooked|Kept|Confirmed|Changed/.test(r.status || '');
    var title = r.live ? 'You are chatting with our team' : (rebooked ? 'Rebooked on ' + (r.newAirline || '') + ' ' + r.newFlight : (r.type === 'Cancelled' ? (r.airline || '') + ' ' + r.flight + ' was cancelled' : (r.airline || '') + ' ' + r.flight + ' time changed'));
    var sub = r.live ? 'Case ' + (r.caseNumber || '') + ' · tap to continue' : (rebooked ? (r.newDeparture || '') + (r.seats ? ' · seats ' + r.seats : '') + ' · tap to review' : 'We are finding your best new flight now');
    return '<button class="trip-alert' + (rebooked ? ' good' : '') + '" type="button" data-action="recovery" data-id="' + esc(r.id) + '">' +
      '<span class="ta-ico">' + (rebooked ? ICONS.check : ICONS.alert) + '</span>' +
      '<span class="ta-text"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></span>' +
      '<span class="ta-go">' + ICONS.arrow + '</span></button>';
  }

  function openRecovery(id) {
    if (!id || !window.AspireRecovery) return;
    if (!token()) {
      try { sessionStorage.setItem('aspireApp.recovery.v1', id); } catch (e) { return signIn(); }
      if (els.main.hidden) showMain('home');
      toast('Please sign in to see your flight update.', 'Sign in', signIn);
      return;
    }
    closeSheet();
    if (els.main.hidden) showMain('home');
    setTab('recovery');
    window.AspireRecovery.open(id);
  }

  function renderHome() {
    if (!els.home) return;
    var h = home();
    var first = firstName();
    var hour = new Date().getHours();
    var greet = hour < 5 ? 'Good evening' : (hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening'));
    var unread = unreadCount();
    var html = '<header class="hero"' + bg(PHOTOS.hero, 1200) + '>' +
      '<div class="hero-top"><div class="brand"><img class="brand-mark" src="icons/icon-192.png" alt=""><span class="brand-name">Aspire</span></div>' +
      '<div class="hero-actions"><button class="glass-btn" type="button" data-action="updates" aria-label="Updates">' + icon('bell') + (unread ? '<i class="dot"></i>' : '') + '</button>' +
      '<button class="glass-btn" type="button" data-action="account" aria-label="Account">' + (first ? esc(first.charAt(0).toUpperCase()) : icon('user')) + '</button></div></div>' +
      '<div class="hero-text"><p class="greet">' + greet + (first ? ',' : '') + '</p><h1>' + (first ? esc(first) : 'Welcome to Aspire') + '</h1>' +
      '<p>' + (token() ? 'Where would you like to go next?' : 'Your personal concierge, at any hour.') + '</p></div>' +
      '<button class="ask-pill" type="button" data-action="chat">' + icon('sparkle') + '<span>Ask your concierge anything</span><span class="go">' + icon('arrow') + '</span></button>' +
      '</header>';
    html += recoveryBanner();
    html += memberCard(h, false);
    html += '<div class="quick">' +
      '<button type="button" data-action="plan"><span class="q-ico">' + ICONS.sparkle + '</span>Plan a trip</button>' +
      '<button type="button" data-action="trips"><span class="q-ico">' + ICONS.trips + '</span>My trips</button>' +
      '<button type="button" data-action="chat"><span class="q-ico">' + ICONS.chat + '</span>Chat with us</button>' +
      '<button type="button" data-action="updates"><span class="q-ico">' + ICONS.bell + '</span>Updates' + (unread ? '<span class="count">' + unread + '</span>' : '') + '</button>' +
      '</div>';
    var next = h && h.nextTrip;
    var planning = !next && h && h.trips ? h.trips.filter(function (x) { return x.status === 'Planning'; })[0] : null;
    if (token() && !h) {
      html += '<section class="block"><div class="block-head"><h2>Your next trip</h2></div><div class="skeleton" style="height:200px"></div></section>';
    } else if (next || planning) {
      html += '<section class="block"><div class="block-head"><h2>' + (next ? 'Your next trip' : 'Trip in planning') + '</h2><button type="button" data-action="trips">All trips</button></div>' + tripCard(next || planning) + '</section>';
    } else {
      html += '<section class="block">' + planCard() + '</section>';
    }
    var ideas = h && h.ideas && h.ideas.length ? h.ideas : DEFAULT_IDEAS;
    var personal = ideas.some(function (i) { return i.tag && i.tag !== 'Popular this season'; });
    html += '<section class="block"><div class="block-head"><h2>' + (personal ? 'Picked for you' : 'Popular this season') + '</h2></div>' +
      '<p class="block-sub">' + (personal ? 'Trip ideas from your travels with us.' : 'Loved by Aspire members right now.') + '</p><div class="rail">' +
      ideas.map(function (i) {
        return '<button class="idea" type="button" data-action="idea" data-title="' + esc(i.title) + '">' +
          '<div class="photo"' + bg(destPhoto((i.destination || '') + ' ' + i.title), 600) + '><span class="chip">' + esc(i.tag || 'Idea') + '</span></div>' +
          '<div class="body"><b>' + esc(i.title) + '</b><div class="when">' + esc(i.dates) + '</div>' + (i.reason ? '<p>' + esc(i.reason) + '</p>' : '') +
          '<span class="cta">Plan this trip ' + icon('arrow') + '</span></div></button>';
      }).join('') + '</div></section>';
    html += '<section class="block"><div class="block-head"><h2>Aspire services</h2></div><p class="block-sub">One concierge for everything around your trips.</p><div class="rail">' +
      SERVICES.map(function (s) {
        return '<button class="service" type="button" data-action="service" data-id="' + s.id + '"' + bg(s.photo, 500) + '><span>' + esc(s.title) + '</span></button>';
      }).join('') + '</div></section>';
    html += '<section class="block"><div class="block-head"><h2>From the Aspire journal</h2></div>' +
      JOURNAL.map(function (a, i) {
        return '<button class="article" type="button" data-action="article" data-i="' + i + '"><div class="thumb"' + bg(a.photo, 300) + '></div>' +
          '<div><span class="tag">' + esc(a.tag) + '</span><b>' + esc(a.title) + '</b><p>' + esc(a.text) + '</p></div></button>';
      }).join('') + '</section>';
    html += '<section class="block"><div class="support"' + bg(PHOTOS.reach, 900) + '><div class="icon-lg">' + ICONS.globe + '</div>' +
      '<h3>Global reach, local touch</h3><p>Our teams around the world are ready to help in many languages, around the clock, every day of the year.</p>' +
      '<button class="btn btn-primary btn-sm" type="button" data-action="chat">' + icon('chat') + 'Chat with us</button></div></section>';
    html += '<p class="fine">Aspire Concierge app ' + VERSION + '<br>Demo prototype. Not an official Aspire Lifestyles app.</p>';
    els.home.innerHTML = html;
  }

  function tripRow(t) {
    var name = placeName(t.destination);
    var f = t.flights && t.flights[0];
    var stay = t.hotels && t.hotels[0];
    return '<button class="trip-row" type="button" data-action="trip" data-id="' + esc(t.id) + '">' +
      '<div class="thumb"' + bg(destPhoto(name + ' ' + t.destination), 400) + '></div><div class="info"><b>' + esc(name) + '</b>' +
      '<div class="when">' + esc(tripRange(t)) + '</div>' +
      (f ? '<div class="line">' + icon('plane') + esc(f.airline + ' ' + f.code) + '</div>' : '') +
      (stay ? '<div class="line">' + icon('bed') + esc(stay.name) + '</div>' : '') +
      '<span class="chip ' + statusClass(t.status) + '">' + esc(t.status === 'Upcoming' ? countdown(t) : t.status) + '</span></div></button>';
  }

  function emptyState(ico, title, text, label, action) {
    return '<div class="empty"><div class="icon-lg">' + ICONS[ico] + '</div><b>' + esc(title) + '</b>' + esc(text) +
      (label ? '<button class="btn btn-primary" type="button" data-action="' + action + '">' + esc(label) + '</button>' : '') + '</div>';
  }

  function renderTrips() {
    if (!els.trips) return;
    var html = '<div class="page"><header class="page-head"><h1>My trips</h1><p>Flights, stays and experiences, all in one place.</p></header>';
    if (!token()) {
      els.trips.innerHTML = html + emptyState('trips', 'Sign in to see your trips', 'Your upcoming journeys, bookings and past trips appear here once you sign in.', 'Sign in', 'signin') + '</div>';
      return;
    }
    var h = home();
    if (!h) {
      els.trips.innerHTML = html + '<div class="skeleton" style="height:44px;margin-bottom:16px"></div><div class="skeleton" style="height:128px;margin-bottom:14px"></div><div class="skeleton" style="height:128px"></div></div>';
      return;
    }
    var groups = { upcoming: [], planning: [], past: [] };
    (h.trips || []).forEach(function (t) {
      if (t.status === 'Upcoming') groups.upcoming.push(t);
      else if (t.status === 'Completed' || t.status === 'Cancelled') groups.past.push(t);
      else groups.planning.push(t);
    });
    var asc = function (a, b) { return String(a.startDate).localeCompare(String(b.startDate)); };
    groups.upcoming.sort(asc);
    groups.planning.sort(asc);
    groups.past.sort(function (a, b) { return asc(b, a); });
    var labels = { upcoming: 'Upcoming', planning: 'Planning', past: 'Past' };
    html += '<div class="segmented">' + Object.keys(labels).map(function (k) {
      return '<button type="button" class="' + (tripFilter === k ? 'on' : '') + '" data-action="filter" data-filter="' + k + '">' + labels[k] + ' <small>' + groups[k].length + '</small></button>';
    }).join('') + '</div>';
    var list = groups[tripFilter];
    if (!list.length) {
      html += tripFilter === 'past'
        ? emptyState('globe', 'No past trips yet', 'Trips you have taken with Aspire will be kept here.', '', '')
        : emptyState('sparkle', tripFilter === 'upcoming' ? 'No upcoming trips' : 'Nothing in planning', 'Tell your concierge where you would like to go, and we will put together flights, a stay and experiences.', 'Plan a trip', 'plan');
    } else {
      html += '<div class="trip-list">' + list.map(tripRow).join('') + '</div>';
    }
    els.trips.innerHTML = html + '</div>';
  }

  function detailRow(ico, label, value) {
    if (!value) return '';
    return '<div class="row static">' + icon(ico) + '<span class="label">' + esc(label) + '</span><span class="value">' + esc(value) + '</span></div>';
  }

  function renderAccount() {
    if (!els.account) return;
    var h = home();
    var signed = !!token();
    var who = window.AspireChat ? window.AspireChat.identity() : null;
    var html = '<div class="page"><header class="page-head"><h1>Account</h1><p>' + (signed ? 'Your membership, preferences and app settings.' : 'Sign in to see your membership and trips.') + '</p></header>';
    html += memberCard(h, true);
    if (signed && h && h.signedIn) {
      html += '<div class="list"><h3>Your details</h3>' +
        detailRow('user', 'Name', (h.firstName + ' ' + h.lastName).trim()) +
        detailRow('mail', 'Email', h.email) +
        detailRow('pin', 'Home airport', h.homeAirport) +
        detailRow('plane', 'Preferred airline', h.preferredAirline) +
        detailRow('seat', 'Seat', h.seatPreference) +
        detailRow('bed', 'Hotels', h.hotelPreference) + '</div>';
    }
    var ps = pushState();
    var psText = { on: 'On for this phone', off: 'Off', denied: 'Blocked in phone settings', install: 'Add Aspire to your Home Screen first', unsupported: 'Not available in this browser', signin: 'Sign in first' }[ps];
    html += '<div class="list"><h3>App</h3>' +
      '<button class="row" type="button" data-action="notify">' + icon('bell') + '<span class="label">Notifications<small>' + esc(psText) + '</small></span>' + icon('chev').replace('icon', 'icon chev') + '</button>' +
      (isStandalone() ? '' : '<button class="row" type="button" data-action="install">' + icon('download') + '<span class="label">Install Aspire<small>Add the app to your home screen</small></span>' + icon('chev').replace('icon', 'icon chev') + '</button>') +
      '<button class="row" type="button" data-action="chat">' + icon('headset') + '<span class="label">Chat with your concierge<small>Available around the clock</small></span>' + icon('chev').replace('icon', 'icon chev') + '</button></div>';
    html += '<div class="list"><h3>About</h3><div class="row static">' + icon('info') + '<span class="label">Aspire Concierge app<small>Demo prototype. Not an official Aspire Lifestyles app.</small></span><span class="value">' + VERSION + '</span></div></div>';
    if (signed) html += '<button class="btn btn-line" type="button" data-action="signout">' + icon('logout') + 'Sign out</button>';
    else {
      html += '<button class="btn btn-primary" type="button" data-action="signin">Sign in</button>';
      if (who && who.firstName) html += '<button class="btn btn-line" type="button" data-action="end-guest" style="margin-top:10px">End guest chat</button>';
    }
    els.account.innerHTML = html + '</div>';
  }

  function flightCard(f) {
    return '<div class="flight"><div class="flight-top"><span>' + esc(f.airline) + ' · ' + esc(f.code) + '</span><span class="chip ' + flightClass(f.status) + '">' + esc(f.status) + '</span></div>' +
      '<div class="flight-route"><div class="flight-end"><b>' + esc(f.origin) + '</b><span>' + (f.departs ? fmtTime(f.departs) : '') + '</span></div>' +
      '<div class="flight-line">' + icon('plane') + '</div>' +
      '<div class="flight-end right"><b>' + esc(f.destination) + '</b><span>' + (f.arrives ? fmtTime(f.arrives) : '') + '</span></div></div>' +
      '<div class="flight-foot">' + (f.departs ? '<span class="chip">' + esc(fmtFlightDay(f.departs)) + '</span>' : '') +
      (f.cabin ? '<span class="chip">' + esc(f.cabin) + '</span>' : '') + (f.seats ? '<span class="chip">Seats ' + esc(f.seats) + '</span>' : '') + '</div></div>';
  }

  function stayCard(s) {
    var a = parseDay(s.checkIn), b = parseDay(s.checkOut);
    var stars = s.stars ? '<span class="stars">' + new Array(s.stars + 1).join('★') + '</span> ' : '';
    return '<div class="stay"><div class="thumb"' + bg(PHOTOS.benefits, 300) + '></div><div><b>' + esc(s.name) + '</b>' +
      '<small>' + stars + esc(s.city) + '</small>' +
      '<small>' + (a ? esc(fmtDay(a, false)) : '') + (b ? ' – ' + esc(fmtDay(b, false)) : '') + (s.status ? ' · ' + esc(s.status) : '') + '</small></div></div>';
  }

  function extraCard(x) {
    var d = parseDay(x.serviceDate);
    return '<div class="stay"><div class="thumb"' + bg(PHOTOS.experiences, 300) + '></div><div><b>' + esc(x.name) + '</b>' +
      '<small>' + esc(x.category) + (d ? ' · ' + esc(fmtDay(d, false)) : '') + (x.status ? ' · ' + esc(x.status) : '') + '</small></div></div>';
  }

  function showTrip(id) {
    var h = home();
    var t = h && (h.trips || []).filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    var name = placeName(t.destination);
    var n = nights(t);
    var html = '<div class="sheet-hero"' + bg(destPhoto(name + ' ' + t.destination), 1000) + '><div class="content">' +
      '<span class="chip ' + statusClass(t.status) + '">' + esc(t.status === 'Upcoming' ? countdown(t) : t.status) + '</span>' +
      '<h2>' + esc(name) + '</h2><p>' + esc(tripRange(t)) + (n ? ' · ' + n + ' nights' : '') + (t.travellers ? ' · ' + t.travellers + ' travellers' : '') + '</p></div></div>';
    html += '<div class="sheet-content">';
    if (t.flights.length) html += '<div class="section-title">Flights</div>' + t.flights.map(flightCard).join('');
    if (t.hotels.length) html += '<div class="section-title">Stay</div>' + t.hotels.map(stayCard).join('');
    if (t.extras.length) html += '<div class="section-title">Experiences</div>' + t.extras.map(extraCard).join('');
    if (!t.flights.length && !t.hotels.length) html += '<p>Your concierge is still putting this trip together. Ask in the chat to see the options.</p>';
    html += '<div class="section-title">Reference</div><div class="list"><div class="row static">' + icon('calendar') + '<span class="label">Trip reference</span><span class="value">' + esc(t.reference) + '</span></div></div>';
    html += '</div><div class="sheet-actions">' +
      '<button class="btn btn-primary" type="button" data-action="prefill" data-text="' + esc('About my ' + name + ' trip (' + tripRange(t) + '): ') + '">' + icon('chat') + 'Ask about this trip</button>' +
      (t.status === 'Upcoming' ? '<button class="btn btn-line" type="button" data-action="say" data-text="Any updates on my trip?">Any updates on this trip?</button>' : '') + '</div>';
    openSheet(html);
  }

  function showService(id) {
    var s = SERVICES.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    openSheet('<div class="sheet-hero"' + bg(s.photo, 1000) + '><div class="content"><span class="chip dark">Aspire services</span><h2>' + esc(s.title) + '</h2></div></div>' +
      '<div class="sheet-content"><p>' + esc(s.text) + '</p></div>' +
      '<div class="sheet-actions"><button class="btn btn-primary" type="button" data-action="prefill" data-text="' + esc(s.ask) + '">' + icon('chat') + 'Ask your concierge</button></div>');
  }

  function showArticle(i) {
    var a = JOURNAL[i];
    if (!a) return;
    openSheet('<div class="sheet-hero"' + bg(a.photo, 1000) + '><div class="content"><span class="chip dark">' + esc(a.tag) + '</span><h2>' + esc(a.title) + '</h2></div></div>' +
      '<div class="sheet-content"><p>' + esc(a.text) + '</p><p>Human care, powered by smart technology, so every member feels exceptional every single time. Your Aspire concierge is part of that promise, ready whenever you need it.</p></div>' +
      '<div class="sheet-actions"><button class="btn btn-primary" type="button" data-action="chat">' + icon('chat') + 'Talk to your concierge</button></div>');
  }

  function showInstall() {
    var steps = isIos()
      ? '<li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button.</li><li>Choose <b>Add to Home Screen</b>, then open Aspire from your Home Screen.</li>'
      : '<li>Open this page in <b>Chrome</b>.</li><li>Open the menu and choose <b>Install app</b>.</li><li>Open Aspire from your home screen.</li>';
    openSheet('<div class="sheet-hero"' + bg(PHOTOS.hero, 1000) + '><div class="content"><span class="chip dark">Install</span><h2>Aspire on your home screen</h2></div></div>' +
      '<div class="sheet-content"><div class="list" style="padding:14px 16px 6px"><ol style="margin:0;padding-left:20px;line-height:1.9;font-size:15px">' + steps + '</ol></div></div>');
  }

  function openSheet(html) {
    els.sheetBody.innerHTML = html;
    els.sheet.hidden = false;
    els.sheetBody.parentNode.scrollTop = 0;
  }

  function closeSheet() {
    if (els.sheet) els.sheet.hidden = true;
  }

  function updates() { return read(KEYS.updates, []); }

  function addUpdate(n) {
    if (!n || !n.kind || n.kind === 'Test') return;
    var list = updates();
    var key = (n.kind || '') + '|' + (n.summary || '');
    if (list.some(function (u) { return u.key === key; })) return;
    list.unshift({ key: key, kind: n.kind, summary: n.summary, status: n.status, ts: n.ts || Date.now(), read: current === 'updates' });
    write(KEYS.updates, list.slice(0, 50));
    renderUpdates();
    renderHome();
    if (current !== 'updates') toast('New trip update: ' + (NOTICE[n.kind] ? NOTICE[n.kind][1] : 'Trip update'), 'View', function () { setTab('updates'); });
  }

  function markRead() {
    write(KEYS.seen, Date.now());
    write(KEYS.updates, updates().map(function (u) { u.read = true; return u; }));
    renderUpdates();
  }

  function setBadge(n) {
    if (!('setAppBadge' in navigator)) return;
    var p = n ? navigator.setAppBadge(n) : navigator.clearAppBadge();
    if (p && p.catch) p.catch(function () { return null; });
  }

  function renderUpdates() {
    if (!els.updatesList) return;
    var list = updates();
    var unread = list.filter(function (u) { return !u.read; }).length;
    els.updatesBadge.textContent = unread ? String(unread) : '';
    els.updatesBadge.hidden = !unread;
    setBadge(unread);
    if (!list.length) {
      els.updatesList.innerHTML = emptyState('bell', 'No trip updates yet', 'When your concierge rebooks a flight, finds a better price or checks you in, it shows up here.', '', '');
      return;
    }
    els.updatesList.innerHTML = list.map(function (u) {
      var n = NOTICE[u.kind] || ['star', 'Trip update', ''];
      return '<div class="update' + (u.read ? '' : ' unread') + '"><div class="update-ico ' + n[2] + '">' + ICONS[n[0]] + '</div>' +
        '<div class="update-body"><b>' + esc(n[1]) + '</b><p>' + esc(u.summary) + '</p><small>' + esc(when(u.ts)) + '</small>' +
        (u.status === 'Proposed' ? '<div><button type="button" class="pill-btn" data-action="say" data-text="Any updates on my trip?">Reply in chat</button></div>' : '') +
        '</div></div>';
    }).join('');
  }

  function loadServerUpdates() {
    if (!token()) return;
    api('/aspireApp/updates')
      .then(function (items) {
        if (!items || !items.length) return;
        var seen = read(KEYS.seen, Date.now() - 6 * 60 * 60 * 1000);
        var list = updates();
        var known = {};
        list.forEach(function (u) { known[u.key] = true; });
        var added = false;
        items.forEach(function (i) {
          var key = (i.kind || '') + '|' + (i.summary || '');
          if (known[key]) return;
          known[key] = true;
          added = true;
          list.push({ key: key, kind: i.kind, summary: i.summary, status: i.status, ts: i.ts || Date.now(), read: current === 'updates' || (i.ts || 0) <= seen });
        });
        if (!added) return;
        list.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
        write(KEYS.updates, list.slice(0, 50));
        renderUpdates();
        renderHome();
      })
      .catch(function (e) { console.warn('Updates not loaded', e); });
  }

  function pushSupported() {
    try {
      return !!(window.firebase && window.firebase.messaging && window.firebase.messaging.isSupported() && 'Notification' in window && 'serviceWorker' in navigator);
    } catch (e) {
      return false;
    }
  }

  function messaging() {
    if (!window.firebase.apps.length) window.firebase.initializeApp(PUSH.config);
    return window.firebase.messaging();
  }

  function platform() {
    if (isIos()) return 'iPhone';
    if (/android/i.test(navigator.userAgent)) return 'Android';
    return 'Browser';
  }

  function canIdentify() {
    return !!token() || !!(window.AspireChat && window.AspireChat.sessionId());
  }

  function pushState() {
    var saved = read(PUSH.key, null);
    if (isIos() && !isStandalone()) return 'install';
    if (!pushSupported()) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    if (saved && saved.token && Notification.permission === 'granted') return 'on';
    if (!canIdentify()) return 'signin';
    return 'off';
  }

  function renderNotify() {
    if (!els.notifyCard) return;
    var s = pushState();
    var t = {
      install: ['Turn on notifications', 'On iPhone, add Aspire to your Home Screen first, then open it from there.', 'How', 'install'],
      unsupported: ['Notifications', 'This browser cannot show notifications. Use Chrome on Android, or Aspire from your iPhone Home Screen.', '', ''],
      denied: ['Notifications are blocked', 'Allow notifications for Aspire in your phone settings, then come back here.', '', ''],
      on: ['Notifications are on', 'This phone hears from your concierge when a booking changes.', 'Turn off', 'notify'],
      signin: ['Get trip updates on this phone', 'Sign in first, then turn on notifications.', 'Sign in', 'signin'],
      off: ['Get trip updates on this phone', 'Hear about rebookings, delays, better prices and check-in as they happen.', 'Turn on', 'notify']
    }[s];
    els.notifyTitle.textContent = t[0];
    els.notifyText.textContent = t[1];
    els.notifyBtn.hidden = !t[2];
    els.notifyBtn.textContent = t[2];
    els.notifyBtn.setAttribute('data-action', t[3]);
    els.notifyBtn.className = 'pill-btn' + (s === 'on' ? ' light' : '');
    els.notifyIco.innerHTML = ICONS[s === 'on' ? 'check' : 'bell'];
    els.notifyCard.classList.toggle('is-on', s === 'on');
  }

  function notifyAction() {
    var s = pushState();
    if (s === 'signin') { signIn(); return; }
    if (s === 'install') { showInstall(); return; }
    if (s === 'on') { disablePush(); return; }
    if (s === 'off') { enablePush(); return; }
    toast(s === 'denied' ? 'Notifications are blocked. Allow them for Aspire in your phone settings.' : 'This browser cannot show notifications.');
  }

  function enablePush() {
    if (pushState() !== 'off') { renderNotify(); return; }
    els.notifyBtn.disabled = true;
    Notification.requestPermission()
      .then(function (p) {
        if (p !== 'granted') throw new Error(p === 'denied' ? 'notifications were blocked' : 'notifications were not allowed');
        return navigator.serviceWorker.ready;
      })
      .then(function (reg) { return messaging().getToken({ vapidKey: PUSH.vapidKey, serviceWorkerRegistration: reg }); })
      .then(function (tok) {
        if (!tok) throw new Error('no push token was issued');
        return registerDevice(tok, true).then(function () { write(PUSH.key, { token: tok, ts: Date.now() }); });
      })
      .then(function () { toast('Notifications are on for this phone.'); })
      .catch(function (e) { toast('Could not turn on notifications: ' + (e && e.message ? e.message : e)); })
      .then(function () { els.notifyBtn.disabled = false; renderNotify(); renderAccount(); });
  }

  function disablePush() {
    var saved = read(PUSH.key, null);
    forget(PUSH.key);
    if (saved && saved.token) registerDevice(saved.token, false).catch(function () { return null; });
    if (pushSupported()) messaging().deleteToken().catch(function () { return null; });
    toast('Notifications are off for this phone.');
    renderNotify();
    renderAccount();
  }

  function registerDevice(tok, active) {
    return api('/aspireApp/device', {
      method: 'POST',
      keepalive: !active,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({
        token: tok,
        active: active,
        platform: platform(),
        userAgent: navigator.userAgent.slice(0, 250),
        sessionId: window.AspireChat ? window.AspireChat.sessionId() : ''
      })
    }).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.message) || 'the phone was not registered');
      return res;
    });
  }

  function refreshPush() {
    var saved = read(PUSH.key, null);
    if (!saved || !saved.token || !pushSupported() || Notification.permission !== 'granted' || !canIdentify()) return;
    navigator.serviceWorker.ready
      .then(function (reg) { return messaging().getToken({ vapidKey: PUSH.vapidKey, serviceWorkerRegistration: reg }); })
      .then(function (tok) {
        if (!tok || (tok === saved.token && Date.now() - saved.ts < 24 * 60 * 60 * 1000)) return null;
        return registerDevice(tok, true).then(function () { write(PUSH.key, { token: tok, ts: Date.now() }); });
      })
      .catch(function (e) { console.warn('Push refresh failed', e); });
  }

  function offerPush() {
    var s = pushState();
    if (s === 'off') toast('Turn on notifications to hear about changes to your trips.', 'Turn on', enablePush);
    else if (s === 'install') toast('To get notifications on iPhone, add Aspire to your Home Screen.', 'How', showInstall);
  }

  function toast(text, action, fn) {
    var t = document.createElement('div');
    t.className = 'toast' + (els.main && !els.main.hidden ? ' above-tabs' : '');
    t.innerHTML = '<span>' + esc(text) + '</span>' + (action ? '<button type="button">' + esc(action) + '</button>' : '');
    els.app.appendChild(t);
    var timer = setTimeout(function () { t.remove(); }, 6500);
    if (action) t.querySelector('button').addEventListener('click', function () { clearTimeout(timer); t.remove(); fn(); });
  }

  function install() {
    if (!deferredInstall) { showInstall(); return; }
    deferredInstall.prompt();
    deferredInstall.userChoice.then(function () { deferredInstall = null; els.welcomeInstall.hidden = true; renderAccount(); });
  }

  function setupInstall() {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredInstall = e;
      els.welcomeInstall.hidden = false;
      els.welcomeHint.hidden = true;
    });
    window.addEventListener('appinstalled', function () {
      deferredInstall = null;
      els.welcomeInstall.hidden = true;
      renderAccount();
    });
    if (!isStandalone() && isIos()) {
      els.welcomeHint.innerHTML = '<b>Install on iPhone:</b> tap the Share button in Safari, then <b>Add to Home Screen</b>.';
      els.welcomeHint.hidden = false;
    }
    els.welcomeInstall.addEventListener('click', install);
  }

  function handleLink() {
    var p = new URLSearchParams(location.search);
    var open = p.get('open');
    var say = p.get('say');
    var ctx = p.get('ctx');
    if (open === 'recovery' && ctx) {
      history.replaceState(null, '', location.pathname);
      showMain('home');
      openRecovery(ctx);
      return true;
    }
    if (!open && !say) return false;
    history.replaceState(null, '', location.pathname);
    showMain(open === 'updates' ? 'updates' : 'home');
    if (open === 'chat' || say) openChat(say ? { say: say } : null);
    return true;
  }

  function registerWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('Service worker not registered', e); });
    navigator.serviceWorker.addEventListener('message', function (e) {
      var m = e.data || {};
      if (m.type === 'push' && m.notice) {
        addUpdate(m.notice);
        loadServerUpdates();
        fetchHome(true);
        loadRecoveries();
      }
      if (m.type === 'open' && m.tab === 'recovery' && m.ctx) {
        openRecovery(m.ctx);
        return;
      }
      if (m.type === 'open') {
        if (els.main.hidden) showMain('home');
        if (m.tab === 'updates') setTab('updates');
        else openChat(m.say ? { say: m.say } : null);
      }
    });
  }

  function onAction(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var a = el.getAttribute('data-action');
    if (a === 'chat') openChat();
    else if (a === 'plan') openChat({ prefill: 'I would like to plan a trip to ' });
    else if (a === 'trips') { closeSheet(); setTab('trips'); }
    else if (a === 'updates') setTab('updates');
    else if (a === 'account') setTab('account');
    else if (a === 'signin') signIn();
    else if (a === 'signout') signOut();
    else if (a === 'trip') showTrip(el.getAttribute('data-id'));
    else if (a === 'recovery') openRecovery(el.getAttribute('data-id'));
    else if (a === 'service') showService(el.getAttribute('data-id'));
    else if (a === 'article') showArticle(Number(el.getAttribute('data-i')));
    else if (a === 'idea') openChat({ say: 'Let\'s plan ' + el.getAttribute('data-title') });
    else if (a === 'prefill') openChat({ prefill: el.getAttribute('data-text') });
    else if (a === 'say') openChat({ say: el.getAttribute('data-text') });
    else if (a === 'filter') { tripFilter = el.getAttribute('data-filter'); renderTrips(); }
    else if (a === 'notify') notifyAction();
    else if (a === 'install') install();
    else if (a === 'end-guest') {
      window.AspireChat.reset();
      write(KEYS.updates, []);
      renderAll();
    }
  }

  function init() {
    els.app = $('app');
    els.welcome = $('welcome');
    els.main = $('main');
    els.home = $('view-home');
    els.trips = $('view-trips');
    els.chatView = $('view-chat');
    els.chatHost = $('chat-host');
    els.updatesView = $('view-updates');
    els.account = $('view-account');
    els.recoveryView = $('view-recovery');
    els.status = $('status');
    els.updatesList = $('updates-list');
    els.updatesBadge = $('updates-badge');
    els.notifyCard = $('notify-card');
    els.notifyIco = $('notify-ico');
    els.notifyTitle = $('notify-title');
    els.notifyText = $('notify-text');
    els.notifyBtn = $('notify-btn');
    els.menuBtn = $('menu-btn');
    els.menu = $('menu');
    els.sheet = $('sheet');
    els.sheetBody = $('sheet-body');
    els.welcomeInstall = $('welcome-install');
    els.welcomeHint = $('welcome-hint');

    [].forEach.call(document.querySelectorAll('[data-icon]'), function (n) { n.innerHTML = ICONS[n.getAttribute('data-icon')] || ''; });
    els.menuBtn.innerHTML = ICONS.more;
    document.querySelector('.sheet-close').innerHTML = ICONS.close;
    document.querySelector('.welcome-bg').style.backgroundImage = 'url(\'' + photo(PHOTOS.hero, 1400) + '\')';
    $('welcome-points').innerHTML = '<span>' + icon('plane') + 'Trips and stays</span><span>' + icon('star') + 'Aspire rewards</span><span>' + icon('headset') + '24/7 concierge</span>';

    if (window.AspireChat) {
      window.AspireChat.configure({ token: token, onUnauthorized: sessionEnded });
      window.AspireChat.on('notice', addUpdate);
      window.AspireChat.on('identity', function () { renderHome(); renderAccount(); renderNotify(); });
      window.AspireChat.on('busy', function (b) { els.status.textContent = b ? 'Typing…' : 'Online'; });
    }

    if (window.AspireRecovery) {
      window.AspireRecovery.configure({
        api: api,
        icons: ICONS,
        onClose: function () { setTab('home'); loadRecoveries(); },
        onChange: function (r) {
          if (!r) return;
          recoveries = recoveries.map(function (x) { return x.id === r.id ? Object.assign({}, x, r) : x; });
        }
      });
    }

    fitHeight();
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fitHeight);
    window.addEventListener('resize', fitHeight);

    $('start').addEventListener('click', signIn);
    $('guest').addEventListener('click', function () { showMain('home'); });
    [].forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
    });
    els.main.addEventListener('click', onAction);
    els.sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeSheet();
    });
    els.menuBtn.addEventListener('click', function (e) { e.stopPropagation(); els.menu.hidden = !els.menu.hidden; });
    document.addEventListener('click', function () { els.menu.hidden = true; });
    $('new-chat').addEventListener('click', function () { els.menu.hidden = true; window.AspireChat.reset(); });
    $('ask-updates').addEventListener('click', function () {
      els.menu.hidden = true;
      window.AspireChat.sendWhenReady('Any updates on my trip?');
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible' || els.main.hidden) return;
      fetchHome(false);
      loadServerUpdates();
      loadRecoveries();
      refreshPush();
      renderNotify();
    });

    forget('aspireApp.signInCheck.v1');
    setupInstall();
    renderUpdates();
    registerWorker();
    var returned = consumeAuthReturn();
    if (returned) {
      showMain('home');
      var pending = null;
      try {
        pending = sessionStorage.getItem('aspireApp.recovery.v1');
        sessionStorage.removeItem('aspireApp.recovery.v1');
      } catch (e) {
        pending = null;
      }
      if (pending) openRecovery(pending);
      setTimeout(offerPush, 2500);
      return;
    }
    if (handleLink()) return;
    if (token() || guestSession()) showMain('home');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
