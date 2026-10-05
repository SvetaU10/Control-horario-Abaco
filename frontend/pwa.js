if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
    });
}

if ("caches" in window) {
    caches.keys().then((keys) => {
        keys.forEach((key) => {
            if (key.startsWith("ureche")) {
                caches.delete(key);
            }
        });
    });
}
