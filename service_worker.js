// This program visualizes mathematical series in a browser or as a PWA.
// Copyright (C) 2025  Tobias Straube

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Change this version number if there are any changes to the progressive web app (PWA).
 */
const VERSION = "v1";
const CACHE_NAME = `folgenplotter-${VERSION}`;
const INITIAL_CACHED_RESOURCES = [
    "./",
    "./index.html",
    "./styles/style.css",
    "./scripts/file_io.js",
    "./scripts/parser.js",
    "./scripts/renderer2d.js",
    "./scripts/uiupdater.js",
    "./scripts/classes/CoordinateSystem.js",
    "./scripts/classes/Label.js",
    "./scripts/classes/Line2D.js",
    "./scripts/classes/Point2D.js",
    "./images/Icon.png",
    "./images/dark_mode_toggle_dark_mode.png",
    "./images/dark_mode_toggle_light_mode.png",
    "./images/delete_dark_mode.png",
    "./images/delete_light_mode.png",
    "./images/help_dark_mode.png",
    "./images/help_light_mode.png",
    "./images/hide_dark_mode.png",
    "./images/hide_light_mode.png",
    "./images/pause_dark_mode.png",
    "./images/pause_light_mode.png",
    "./images/play_dark_mode.png",
    "./images/play_light_mode.png",
    "./images/show_dark_mode.png",
    "./images/show_light_mode.png"
];

/**
 * Cache busting; we don't really want any old versions to persist.
 */
const INITIAL_CACHED_RESOURCES_WITH_VERSIONS = INITIAL_CACHED_RESOURCES.map(path => {
    return `${path}?v=${VERSION}`;
});

/**
 * When the web app is first installed/opened, we want to cache all resources the app needs to work.
 */
self.addEventListener("install", event => {
    self.skipWaiting();
  
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(INITIAL_CACHED_RESOURCES_WITH_VERSIONS);
    })());
});

/**
 * If a new version of the service worker is available, we will update the cache appropriately;
 * e.g. delete all old caches.
 */
self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.map(name => {
            if(name !== CACHE_NAME) {
                return caches.delete(name);
            }
        }));
        await clients.claim();
    })());
});

/**
 * We employ a "cache first" strategy, so that the network is only used when absolutely necessary.
 */
self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
  
    // Don't care about other-origin URLs.
    if(url.origin !== location.origin) {
        return;
    }
  
    // Don't care about anything else than GET.
    if(event.request.method !== 'GET') {
        return;
    }
  
    // On fetch, go to the cache first, and then network.
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const versionedUrl = `${event.request.url}?v=${VERSION}`;
        const cachedResponse = await cache.match(versionedUrl);
    
        if(cachedResponse) {
            return cachedResponse;
        } else {
            const fetchResponse = await fetch(versionedUrl);
            cache.put(versionedUrl, fetchResponse.clone()); // also cache the newly requested resource
            return fetchResponse;
        }
    })());
});
