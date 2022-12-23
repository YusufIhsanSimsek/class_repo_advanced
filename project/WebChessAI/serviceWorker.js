const staticWebChess = "web-chess-site";
const assets = ["/", "/index.html", "/index.css", "/index.js", "/res/72x72.png", "/res/96x96.png", "/res/128x128.png", "/res/144x144.png", "/res/152x152.png", "/res/192x192.png", "/res/384x384.png", "/res/512x512.png"];

self.addEventListener("install", (installEvent) => {
	installEvent.waitUntil(
		caches.open(staticWebChess).then((cache) => {
			cache.addAll(assets);
		})
	);
});

self.addEventListener("fetch", (fetchEvent) => {
	fetchEvent.respondWith(
		caches.match(fetchEvent.request).then((res) => {
			return res || fetch(fetchEvent.request);
		})
	);
});
