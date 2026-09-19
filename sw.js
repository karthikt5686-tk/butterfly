/* Butterfly Kindergarten — service worker
   Precaches the whole site so the installed app opens instantly and keeps
   working with no connection. Bump CACHE_VERSION on every content change. */

var CACHE_VERSION = "butterfly-v1";

/* Relative URLs resolve against this script's location, so the app still
   works when it is served from a sub-path rather than a domain root. */
var PRECACHE = [
  "./",
  "./index.html",
  "./about.html",
  "./academics.html",
  "./contact.html",
  "./offline.html",
  "./css/styles.css",
  "./js/main.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      // Add individually: one 404 in addAll would reject the whole install.
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(new Request(url, { cache: "reload" }))["catch"](function (err) {
            console.warn("[sw] could not precache", url, err);
          });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_VERSION) return caches["delete"](key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  if (request.method !== "GET") return;

  var url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  // Leave cross-origin requests (fonts, map embed) to the network.
  if (url.origin !== self.location.origin) return;

  // Pages: try the network first so content stays fresh, fall back to the
  // cache, then to a friendly offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          // Only store real pages — caching a 404 or a 500 would serve that
          // error back long after the server recovered.
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_VERSION).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        ["catch"](function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match("./offline.html");
          });
        })
    );
    return;
  }

  // Everything else (CSS, JS, icons): serve from cache at once, refresh after.
  event.respondWith(
    caches.match(request).then(function (cached) {
      var network = fetch(request)
        .then(function (response) {
          if (response && response.status === 200 && response.type === "basic") {
            var copy = response.clone();
            caches.open(CACHE_VERSION).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        ["catch"](function () {
          return cached;
        });

      return cached || network;
    })
  );
});

/* Lets the page tell a waiting worker to take over immediately. */
self.addEventListener("message", function (event) {
  if (event.data === "skip-waiting") self.skipWaiting();
});
