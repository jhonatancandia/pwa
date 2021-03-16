// imports
importScripts('/js/sw-utils.js');

const CACHE_STATIC = 'static-v1';
const CACHE_DYNAMIC = 'dynamic-v1';
const CACHE_INMUTABLE = 'inmutable-v1';

const APP_SHELL = [
    // '/',
    '/index.html',
    '/css/style.css',
    '/img/favicon.ico',
    '/img/avatars/hulk.jpg',
    '/img/avatars/ironman.jpg',
    '/img/avatars/spiderman.jpg',
    '/img/avatars/thor.jpg',
    '/img/avatars/wolverine.jpg',
    '/js/app.js',
    '/js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    '/js/libs/jquery.js',
    '/css/animate.css'
];

self.addEventListener('install', event => {
    const cacheStatic = caches.open(CACHE_STATIC).then(cache => {
        cache.addAll(APP_SHELL);
    });
    const cacheInmutable = caches.open(CACHE_INMUTABLE).then(cache => {
        cache.addAll(APP_SHELL_INMUTABLE);
    });

    event.waitUntil(Promise.all([
        cacheStatic,
        cacheInmutable
    ]));
});

self.addEventListener('activate', event => {
    const deleteCaches = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== CACHE_STATIC && key.includes('static')) {
                return caches.delete(key);
            }
            
            if (  key !== CACHE_DYNAMIC && key.includes('dynamic') ) {
                return caches.delete(key);
            }
        });
    });

    event.waitUntil(deleteCaches);
});

self.addEventListener('fetch', event => {
    const promiseResponse = caches.match(event.request).then(response => {
        if (response) return response;
        
        return fetch(event.request).then(fetchResponse => {
            return updateDynamicCache(CACHE_DYNAMIC, event.request, fetchResponse)
        });
    });

    event.respondWith(promiseResponse);
});