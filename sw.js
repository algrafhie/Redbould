const V = "redbound-v3-1";
const SB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
const PRE = ["./", "index.html", "config.js", "redbound-cloud.js", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.all(PRE.map((u) => c.add(u).catch(() => {})));
    await c.add(new Request(SB, { mode: "cors" })).catch(() => {});
    self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.hostname.endsWith("supabase.co")) return; // API & realtime: jangan di-cache
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then((x) => { caches.open(V).then((c) => c.put("index.html", x.clone())); return x; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => {
    const net = fetch(r).then((x) => { if (x.ok) caches.open(V).then((c) => c.put(r, x.clone())); return x; }).catch(() => hit);
    return hit || net;
  }));
});
