// Service Worker für die WM-2026-PWA
// Aufgabe: App-Dateien zwischenspeichern (offline-fähig) und Live-Daten aktuell halten.

const CACHE = "wm2026-v1";
const DATEIEN = ["wm2026.html", "manifest.json", "icon.svg"];

// Beim Installieren die App-Dateien in den Cache laden
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)));
  self.skipWaiting();
});

// Alte Caches aufräumen
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Anfragen beantworten
self.addEventListener("fetch", (e) => {
  const url = e.request.url;

  if (url.includes("githubusercontent.com")) {
    // Live-Spieldaten: zuerst Netzwerk (aktuell), bei Offline aus dem Cache
    e.respondWith(
      fetch(e.request)
        .then((antwort) => {
          const kopie = antwort.clone();
          caches.open(CACHE).then((c) => c.put(e.request, kopie));
          return antwort;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // App-Dateien: zuerst Cache (schnell/offline), sonst Netzwerk
    e.respondWith(caches.match(e.request).then((treffer) => treffer || fetch(e.request)));
  }
});
