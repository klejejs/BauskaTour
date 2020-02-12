const staticCacheName = 'site-static-v10';
const dynamicCacheName = 'site-dynamic-v5';
const assets = [
    "./",
    "./?lang=lv",
    "./?lang=en",
    "./index.html",
    "./index.html?lang=lv",
    "./index.html?lang=en",
    "./offline.html",
    "./manifest.json",
    "./js/accuratePosition.js",
    "./js/cookieconsent.min.js",
    "./js/cookies.js",
    "./js/jquery-3.4.1.min.js",
    "./js/L.Control.Locate.min.js",
    "./js/language_data.js",
    "./js/leaflet-languageselector.js",
    "./js/leaflet.js",
    "./js/script.js",
    "./js/touch-sideswipe.js",
    "./css/cookieconsent.min.css",
    "./css/L.Control.Locate.min.css",
    "./css/leaflet-languageselector.css",
    "./css/leaflet.css",
    "./css/style.css",
    "./css/touch-sideswipe.css",
    "./data/icons/close.svg",
    "./data/icons/layers_even_simpler.svg",
    "./data/object_icons/castle.svg",
    "./data/object_icons/church.svg",
    "./data/object_icons/hotel.svg",
    "./data/object_icons/monument.svg",
    "./data/object_icons/museum.svg",
    "./data/object_icons/object.svg",
    "./data/object_icons/restaurant.svg",
    "./data/object_icons/template.svg",
    "./data/object_icons/tour.svg",
    "./data/object_icons/town_hall.svg",
    "./data/object_icons/wc.svg",
    "./data/object_data/data.js",
    "./data/flag_icons/gb.png",
    "./data/flag_icons/lv.png"
];

// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

// install event
self.addEventListener('install', event => {
    console.log('service worker installed');
    // event.waitUntil(
    //     caches.open(staticCacheName).then((cache) => {
    //         console.log('caching shell assets');
    //         cache.addAll(assets);
    //     })
    // );
});

// activate event
self.addEventListener('activate', event => {
    console.log('service worker activated');
    // event.waitUntil(
    //     caches.keys().then(keys => {
    //         //console.log(keys);
    //         return Promise.all(keys
    //             .filter(key => key !== staticCacheName && key !== dynamicCacheName)
    //             .map(key => caches.delete(key))
    //         );
    //     })
    // );
});

// fetch event
self.addEventListener('fetch', evt => {
    //console.log('fetch event', evt);
    // evt.respondWith(
    //     caches.match(evt.request).then(cacheRes => {
    //         return cacheRes || fetch(evt.request).then(fetchRes => {
    //             return caches.open(dynamicCacheName).then(cache => {
    //                 cache.put(evt.request.url, fetchRes.clone());
    //                 // check cached items size
    //                 limitCacheSize(dynamicCacheName, 50);
    //                 return fetchRes;
    //             })
    //         });
    //     }).catch(() => {
    //         if ((evt.request.url.indexOf('.html') > -1) || (evt.request.url.indexOf('.') > -1)) {
    //             return caches.match('/offline.html');
    //         }
    //     })
    // );
});