var CACHE = 'aspire-app-v4';
var SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/app.css',
  'assets/app.js',
  'assets/chat.css',
  'assets/chat.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/badge-96.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith(
    fetch(req)
      .then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      })
      .catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (hit) {
          return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined);
        });
      })
  );
});

function parsePush(event) {
  var raw = {};
  try { raw = event.data ? event.data.json() : {}; } catch (e) { raw = { body: event.data ? event.data.text() : '' }; }
  var n = raw.notification || {};
  var d = raw.data || {};
  return {
    title: n.title || d.title || raw.title || 'Aspire',
    body: n.body || d.body || raw.body || 'You have a new trip update.',
    kind: d.kind || raw.kind || '',
    summary: d.summary || raw.summary || n.body || d.body || raw.body || '',
    status: d.status || raw.status || '',
    tab: d.tab || raw.tab || 'chat',
    say: d.say || raw.say || '',
    tag: d.tag || raw.tag || 'aspire-update'
  };
}

self.addEventListener('push', function (event) {
  var p = parsePush(event);
  event.waitUntil(
    self.registration.showNotification(p.title, {
      body: p.body,
      icon: 'icons/icon-192.png',
      badge: 'icons/badge-96.png',
      tag: p.tag,
      renotify: true,
      data: p
    }).then(function () {
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function (list) {
      if (!p.kind || p.kind === 'Test') return;
      list.forEach(function (c) { c.postMessage({ type: 'push', notice: { kind: p.kind, summary: p.summary, status: p.status, ts: Date.now() } }); });
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  var p = event.notification.data || {};
  event.notification.close();
  var target = new URL('./?open=' + encodeURIComponent(p.tab || 'chat') + (p.say ? '&say=' + encodeURIComponent(p.say) : ''), self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(self.registration.scope) === 0 && 'focus' in list[i]) {
          list[i].postMessage({ type: 'open', tab: p.tab || 'chat', say: p.say || '' });
          return list[i].focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
