(function () {
  'use strict';

  var VERSION = '1.0.0';
  var KEYS = { started: 'aspireApp.started.v1', updates: 'aspireApp.updates.v1' };
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

  function fitHeight() {
    var h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-h', Math.round(h) + 'px');
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
    if (name === 'updates') markRead();
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
    var who = window.AspireChat ? window.AspireChat.identity() : null;
    if (who && who.firstName) {
      els.profile.innerHTML = '<div class="avatar">' + esc(who.firstName.charAt(0).toUpperCase()) + '</div>' +
        '<div><b>' + esc(who.firstName) + '</b><span>' + (who.isNewCustomer ? 'New Aspire member' : 'Aspire member') + ' · signed in through chat</span></div>';
      els.signOut.hidden = false;
    } else {
      els.profile.innerHTML = '<div class="avatar anon">&#9786;</div><div><b>Not signed in</b><span>Share your email with the concierge to sign in</span></div>';
      els.signOut.hidden = true;
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
    showMain(open === 'updates' ? 'updates' : 'chat');
    if (say && window.AspireChat && window.AspireChat.identity()) setTimeout(function () { window.AspireChat.send(say); }, 300);
    return true;
  }

  function registerWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('Service worker not registered', e); });
    navigator.serviceWorker.addEventListener('message', function (e) {
      var m = e.data || {};
      if (m.type === 'push' && m.notice) addUpdate(m.notice);
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
    els.signOut = $('sign-out');
    els.installCard = $('install-card');
    els.installSteps = $('install-steps');
    els.installBtn = $('install-btn');
    els.welcomeInstall = $('welcome-install');
    els.welcomeHint = $('welcome-hint');
    els.menuBtn = $('menu-btn');
    els.menu = $('menu');
    $('version').textContent = VERSION;

    fitHeight();
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fitHeight);
    window.addEventListener('resize', fitHeight);

    $('start').addEventListener('click', function () { showMain('chat'); setTimeout(function () { window.AspireChat && window.AspireChat.focus(); }, 250); });
    [].forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
    });
    els.menuBtn.addEventListener('click', function (e) { e.stopPropagation(); els.menu.hidden = !els.menu.hidden; });
    document.addEventListener('click', function () { els.menu.hidden = true; });
    $('new-chat').addEventListener('click', function () { els.menu.hidden = true; window.AspireChat.reset(); });
    $('ask-updates').addEventListener('click', function () {
      els.menu.hidden = true;
      if (window.AspireChat.identity()) window.AspireChat.send('Any updates on my trip?');
      else toast('Share your email with the concierge first.');
    });
    els.signOut.addEventListener('click', function () { window.AspireChat.reset(); write(KEYS.updates, []); renderUpdates(); renderAccount(); setTab('chat'); });
    els.updatesList.addEventListener('click', function (e) {
      if (e.target.closest('[data-open-chat]')) setTab('chat');
    });

    setupInstall();
    renderUpdates();
    registerWorker();
    if (!handleLink() && (read(KEYS.started, false) || isStandalone())) showMain('chat');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
