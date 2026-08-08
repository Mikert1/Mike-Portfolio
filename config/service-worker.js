// Bump CACHE_NAME whenever the shell (HTML/CSS/JS) changes — the fetch
// handler answers from the cache first, so without a new name a returning
// visitor would keep being served the previous version of the site.
const CACHE_NAME = 'static-cache-v3';

const PRECACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/components/navbar.html',
    '/components/footer.html',
    '/assets/componium.js',
    '/assets/projectCard.js',
    '/assets/textures/background.png',
    '/assets/img/icon.png'
];

self.addEventListener('install', event => {
    console.log('Service Worker installed');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names.filter(name => name !== CACHE_NAME)
                     .map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
