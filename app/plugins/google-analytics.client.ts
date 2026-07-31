declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

export default defineNuxtPlugin(() => {
    const measurementId = 'G-CWXQF8PH4S';
    let started = false;

    if (document.readyState === 'complete') {
        scheduleStart();
    } else {
        window.addEventListener('load', scheduleStart, { once: true });
    }

    function scheduleStart() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if ('requestIdleCallback' in window) {
                    window.requestIdleCallback(startAnalytics, { timeout: 3000 });
                    return;
                }

                window.setTimeout(startAnalytics, 1000);
            });
        });
    }

    function startAnalytics() {
        if (started) return;

        started = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
            product_surface: 'website'
        });

        const script = document.createElement('script');

        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        document.head.append(script);
    }
});
