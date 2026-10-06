(function () {
  'use strict';

  var VERSION = '1.2.0';
  var KEYS = { started: 'aspireApp.started.v1', updates: 'aspireApp.updates.v1', me: 'aspireApp.me.v1', seen: 'aspireApp.updatesSeen.v1' };
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
  var TAB_TITLES = { chat: 'Aspire Concierge', updates: 'Trip updates', account: 'Account' };
  var NOTICE_ICONS = {
    'Rebooked': '&#9992;', 'Rebooking proposal': '&#9888;', 'Hotel price drop': '&#9660;',
    'Delay notice': '&#9201;', 'Check-in reminder': '&#10003;', 'Escalated': '&#9742;'
  };

  var els = {};
  var current = 'chat';
  var deferredInstall = null;
  var chatMounted = false;

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

  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function when(ts) {
    var d = new Date(ts);
    var today = new Date();
    var sameDay = d.toDateString() === today.toDateString();
    return (sameDay ? 'Today' : d.toLocaleDateString([], { day: 'numeric', month: 'short' })) + ' · ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function num(v) { return new Intl.NumberFormat('en-US').format(v || 0); }

  function fitHeight() {
    var h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-h', Math.round(h) + 'px');
  }

  function session() { return read(AUTH.key, null); }

  function token() {
    var s = session();
    return s && s.token ? s.token : null;
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
    forget(KEYS.me);
    write(KEYS.updates, []);
    if (window.AspireChat) window.AspireChat.clear();
    return true;
  }

  function signOut() {
    var pushed = read(PUSH.key, null);
    if (pushed && pushed.token) registerDevice(pushed.token, false).catch(function () { return null; });
    forget(PUSH.key);
    forget(AUTH.key);
    forget(KEYS.me);
    write(KEYS.updates, []);
    write(KEYS.started, false);
    if (window.AspireChat) window.AspireChat.clear();
    location.assign(AUTH.logout);
  }

  function sessionEnded() {
    forget(AUTH.key);
    forget(KEYS.me);
    renderAccount();
    toast('Your session has ended. Please sign in again.', 'Sign in', signIn);
  }

  function loadMe() {
    var t = token();
    if (!t) return;
    fetch(AUTH.api + '/aspireApp/me', {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: { Authorization: 'Bearer ' + t }
    })
      .then(function (r) {
        if (r.status === 401) { sessionEnded(); return null; }
        return r.ok ? r.json() : null;
      })
      .then(function (me) {
        if (!me || !me.signedIn) return;
        write(KEYS.me, me);
        renderAccount();
      })
      .catch(function (e) { console.warn('Profile not loaded', e); });
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
      install: ['Turn on notifications', 'On iPhone, add Aspire to your Home Screen first (Safari, Share, Add to Home Screen), then open it from there.', ''],
      unsupported: ['Notifications', 'This browser cannot show notifications. Use Chrome on Android, or Aspire from your iPhone Home Screen.', ''],
      denied: ['Notifications are blocked', 'Allow notifications for Aspire in your phone settings, then come back here.', ''],
      on: ['Notifications are on', 'This phone gets a notification when your concierge changes or protects a booking.', 'Turn off'],
      signin: ['Get trip updates on this phone', 'Sign in first, then turn on notifications.', 'Sign in'],
      off: ['Get trip updates on this phone', 'Get a notification when your concierge rebooks a flight, finds a better price or checks you in.', 'Turn on notifications']
    }[s];
    els.notifyTitle.textContent = t[0];
    els.notifyText.textContent = t[1];
    els.notifyBtn.hidden = !t[2];
    els.notifyBtn.textContent = t[2];
    els.notifyBtn.className = 'btn ' + (s === 'on' ? 'btn-line' : 'btn-primary');
    els.notifyCard.classList.toggle('is-on', s === 'on');
  }

  function notifyAction() {
    var s = pushState();
    if (s === 'signin') { signIn(); return; }
    if (s === 'on') { disablePush(); return; }
    if (s === 'off') enablePush();
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
      .then(function () { els.notifyBtn.disabled = false; renderNotify(); });
  }

  function disablePush() {
    var saved = read(PUSH.key, null);
    forget(PUSH.key);
    if (saved && saved.token) registerDevice(saved.token, false).catch(function () { return null; });
    if (pushSupported()) messaging().deleteToken().catch(function () { return null; });
    toast('Notifications are off for this phone.');
    renderNotify();
  }

  function registerDevice(tok, active) {
    var t = token();
    var headers = { 'Content-Type': 'text/plain;charset=UTF-8' };
    if (t) headers.Authorization = 'Bearer ' + t;
    return fetch(AUTH.api + '/aspireApp/device', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      keepalive: !active,
      headers: headers,
      body: JSON.stringify({
        token: tok,
        active: active,
        platform: platform(),
        userAgent: navigator.userAgent.slice(0, 250),
        sessionId: window.AspireChat ? window.AspireChat.sessionId() : ''
      })
    })
      .then(function (r) {
        if (r.status === 401) { sessionEnded(); throw new Error('please sign in again'); }
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (res) {
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
    if (pushState() === 'off') toast('Turn on notifications to hear about changes to your trips.', 'Turn on', enablePush);
    else if (pushState() === 'install') toast('To get notifications on iPhone, add Aspire to your Home Screen.');
  }

  function loadServerUpdates() {
    var t = token();
    if (!t) return;
    fetch(AUTH.api + '/aspireApp/updates', {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: { Authorization: 'Bearer ' + t }
    })
      .then(function (r) {
        if (r.status === 401) { sessionEnded(); return null; }
        return r.ok ? r.json() : null;
      })
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
      })
      .catch(function (e) { console.warn('Updates not loaded', e); });
  }

  function showMain(tab) {
    els.welcome.hidden = true;
    els.main.hidden = false;
    write(KEYS.started, true);
    if (!chatMounted && window.AspireChat) {
      window.AspireChat.mount(els.chatView);
      chatMounted = true;
      window.AspireChat.on('notice', addUpdate);
      window.AspireChat.on('identity', renderAccount);
      window.AspireChat.on('busy', function (b) { els.status.textContent = b ? 'Typing…' : 'Online'; });
    }
    setTab(tab || 'chat');
    if (token()) {
      loadMe();
      loadServerUpdates();
    }
    refreshPush();
    renderNotify();
  }

  function setTab(name) {
    current = name;
    els.chatView.hidden = name !== 'chat';
    els.updatesView.hidden = name !== 'updates';
    els.accountView.hidden = name !== 'account';
    els.title.textContent = TAB_TITLES[name];
    [].forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === name);
      t.setAttribute('aria-selected', t.getAttribute('data-tab') === name ? 'true' : 'false');
    });
    els.menuBtn.hidden = name !== 'chat';
    if (name === 'updates') {
      markRead();
      renderNotify();
      loadServerUpdates();
    }
    if (name === 'account') renderAccount();
    if (name === 'chat' && window.AspireChat) window.AspireChat.refresh();
  }

  function updates() { return read(KEYS.updates, []); }

  function addUpdate(n) {
    var list = updates();
    var key = (n.kind || '') + '|' + (n.summary || '');
    if (list.some(function (u) { return u.key === key; })) return;
    list.unshift({ key: key, kind: n.kind, summary: n.summary, status: n.status, ts: n.ts || Date.now(), read: current === 'updates' });
    write(KEYS.updates, list.slice(0, 50));
    renderUpdates();
    if (current !== 'updates') toast('New trip update: ' + (window.AspireChat ? window.AspireChat.noticeTitle(n.kind) : 'Trip update'), 'View', function () { setTab('updates'); });
  }

  function markRead() {
    write(KEYS.seen, Date.now());
    var list = updates().map(function (u) { u.read = true; return u; });
    write(KEYS.updates, list);
    renderUpdates();
  }

  function setBadge(n) {
    if (!('setAppBadge' in navigator)) return;
    var p = n ? navigator.setAppBadge(n) : navigator.clearAppBadge();
    if (p && p.catch) p.catch(function () { return null; });
  }

  function renderUpdates() {
    var list = updates();
    var unread = list.filter(function (u) { return !u.read; }).length;
    els.updatesBadge.textContent = unread ? String(unread) : '';
    els.updatesBadge.hidden = !unread;
    setBadge(unread);
    if (!list.length) {
      els.updatesList.innerHTML = '<div class="empty"><span class="big">&#128276;</span>No trip updates yet.<br>When your concierge rebooks a flight, finds a better price or checks you in, it shows up here.</div>';
      return;
    }
    els.updatesList.innerHTML = list.map(function (u) {
      return '<div class="update' + (u.read ? '' : ' unread') + '">' +
        '<div class="update-ico">' + (NOTICE_ICONS[u.kind] || '&#9733;') + '</div>' +
        '<div class="update-body"><b>' + esc(window.AspireChat ? window.AspireChat.noticeTitle(u.kind) : u.kind) + '</b>' +
        '<p>' + esc(u.summary) + '</p><small>' + esc(when(u.ts)) + '</small>' +
        (u.status === 'Proposed' ? '<div><button type="button" class="update-open" data-open-chat="1">Reply in chat</button></div>' : '') +
        '</div></div>';
    }).join('');
  }

  function renderAccount() {
    var me = token() ? read(KEYS.me, null) : null;
    var who = window.AspireChat ? window.AspireChat.identity() : null;
    if (token()) {
      var first = (me && me.firstName) || (who && who.firstName) || '';
      var full = me ? (me.firstName + ' ' + me.lastName).trim() : first;
      els.profile.innerHTML = '<div class="avatar">' + esc((first || '?').charAt(0).toUpperCase()) + '</div>' +
        '<div><b>' + esc(full || 'Signed in') + '</b><span>' + esc(me && me.email ? me.email : 'Signed in to Aspire') + '</span></div>';
      els.stats.innerHTML = me ? (
        '<div class="stat"><small>Tier</small><b>' + esc(me.tier || 'Member') + '</b></div>' +
        '<div class="stat"><small>Aspire points</small><b>' + num(me.points) + '</b></div>' +
        '<div class="stat"><small>Home airport</small><b>' + esc(me.homeAirport || '—') + '</b></div>') : '';
      els.stats.hidden = !me;
      els.signOut.hidden = false;
      els.signOut.textContent = 'Sign out';
      els.signInBtn.hidden = true;
    } else {
      els.stats.hidden = true;
      if (who && who.firstName) {
        els.profile.innerHTML = '<div class="avatar">' + esc(who.firstName.charAt(0).toUpperCase()) + '</div>' +
          '<div><b>' + esc(who.firstName) + '</b><span>Chatting as a guest</span></div>';
        els.signOut.hidden = false;
        els.signOut.textContent = 'End guest chat';
      } else {
        els.profile.innerHTML = '<div class="avatar anon">&#9786;</div><div><b>Not signed in</b><span>Sign in to see your trips, points and updates</span></div>';
        els.signOut.hidden = true;
      }
      els.signInBtn.hidden = false;
    }
    els.installCard.hidden = isStandalone();
    els.installSteps.innerHTML = isIos()
      ? '<li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button.</li><li>Choose <b>Add to Home Screen</b>, then open Aspire from your Home Screen.</li>'
      : '<li>Open this page in <b>Chrome</b>.</li><li>Tap <b>Install app</b> below, or use the menu and choose <b>Install app</b>.</li><li>Open Aspire from your home screen.</li>';
    els.installBtn.hidden = !deferredInstall;
  }

  function toast(text, action, fn) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span>' + esc(text) + '</span>' + (action ? '<button type="button">' + esc(action) + '</button>' : '');
    els.app.appendChild(t);
    var timer = setTimeout(function () { t.remove(); }, 6000);
    if (action) t.querySelector('button').addEventListener('click', function () { clearTimeout(timer); t.remove(); fn(); });
  }

  function setupInstall() {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredInstall = e;
      els.welcomeInstall.hidden = false;
      els.welcomeHint.hidden = true;
      renderAccount();
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
    function install() {
      if (!deferredInstall) return;
      deferredInstall.prompt();
      deferredInstall.userChoice.then(function () { deferredInstall = null; renderAccount(); els.welcomeInstall.hidden = true; });
    }
    els.welcomeInstall.addEventListener('click', install);
    els.installBtn.addEventListener('click', install);
  }

  function handleLink() {
    var p = new URLSearchParams(location.search);
    var open = p.get('open');
    var say = p.get('say');
    if (!open && !say) return false;
    history.replaceState(null, '', location.pathname);
    if (!token() && !read(KEYS.started, false)) return false;
    showMain(open === 'updates' ? 'updates' : 'chat');
    if (say && window.AspireChat && window.AspireChat.identity()) setTimeout(function () { window.AspireChat.send(say); }, 300);
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
      }
      if (m.type === 'open') {
        showMain(m.tab === 'updates' ? 'updates' : 'chat');
        if (m.say && window.AspireChat && window.AspireChat.identity()) window.AspireChat.send(m.say);
      }
    });
  }

  function init() {
    els.app = $('app');
    els.welcome = $('welcome');
    els.main = $('main');
    els.title = $('title');
    els.status = $('status');
    els.chatView = $('view-chat');
    els.updatesView = $('view-updates');
    els.accountView = $('view-account');
    els.updatesList = $('updates-list');
    els.updatesBadge = $('updates-badge');
    els.profile = $('profile');
    els.stats = $('stats');
    els.signOut = $('sign-out');
    els.signInBtn = $('sign-in');
    els.installCard = $('install-card');
    els.installSteps = $('install-steps');
    els.installBtn = $('install-btn');
    els.welcomeInstall = $('welcome-install');
    els.welcomeHint = $('welcome-hint');
    els.menuBtn = $('menu-btn');
    els.menu = $('menu');
    els.notifyCard = $('notify-card');
    els.notifyTitle = $('notify-title');
    els.notifyText = $('notify-text');
    els.notifyBtn = $('notify-btn');
    $('version').textContent = VERSION;

    if (window.AspireChat) window.AspireChat.configure({ token: token, onUnauthorized: sessionEnded });

    fitHeight();
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fitHeight);
    window.addEventListener('resize', fitHeight);

    $('start').addEventListener('click', signIn);
    $('guest').addEventListener('click', function () { showMain('chat'); setTimeout(function () { window.AspireChat && window.AspireChat.focus(); }, 250); });
    els.signInBtn.addEventListener('click', signIn);
    [].forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
    });
    els.menuBtn.addEventListener('click', function (e) { e.stopPropagation(); els.menu.hidden = !els.menu.hidden; });
    document.addEventListener('click', function () { els.menu.hidden = true; });
    $('new-chat').addEventListener('click', function () { els.menu.hidden = true; window.AspireChat.reset(); });
    $('ask-updates').addEventListener('click', function () {
      els.menu.hidden = true;
      if (window.AspireChat.identity()) window.AspireChat.send('Any updates on my trip?');
      else toast(token() ? 'One moment, the concierge is still getting ready.' : 'Sign in first, or share your email with the concierge.');
    });
    els.signOut.addEventListener('click', function () {
      if (token()) { signOut(); return; }
      window.AspireChat.reset();
      write(KEYS.updates, []);
      renderUpdates();
      renderAccount();
      setTab('chat');
    });
    els.notifyBtn.addEventListener('click', notifyAction);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      loadServerUpdates();
      refreshPush();
      renderNotify();
    });
    els.updatesList.addEventListener('click', function (e) {
      if (e.target.closest('[data-open-chat]')) setTab('chat');
    });

    setupInstall();
    renderUpdates();
    renderNotify();
    registerWorker();
    var returned = consumeAuthReturn();
    if (returned) {
      showMain('chat');
      setTimeout(offerPush, 2500);
      return;
    }
    if (handleLink()) return;
    if (token() || read(KEYS.started, false)) showMain('chat');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
