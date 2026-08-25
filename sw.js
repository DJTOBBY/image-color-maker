/* Service Worker
   PWAとしてインストール可能にするために必要。
   方針: ネットワーク優先(常に最新のパレットロジックを使う)+
   オフライン時はキャッシュにフォールバック。 */

const CACHE = "csp-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./manifest.json",
  "./js/pccs.js",
  "./js/techniques.js",
  "./js/palette.js",
  "./js/wacolor-data.js",
  "./js/wacolor.js",
  "./js/trend.js",
  "./js/associations.js",
  "./js/dictionary.js",
  "./js/category-data.js",
  "./js/categories.js",
  "./js/match.js",
  "./js/export.js",
  "./js/app.js",
  "./data/beads.json",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      // 1つ失敗しても install 自体は成功させる(?v= 付きURLなどのズレ対策)
      .then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;
  // 同一オリジンのみ扱う(ビーズの実物写真は外部ドメインなのでそのまま通す)
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(request).then(hit => hit || caches.match("./index.html")))
  );
});
