/// <reference lib="dom" />

performance.mark('nuxt loader started');

declare const __NUXT_DELAYED_MODULE_SCRIPTS__: string[];

const moduleScriptTags = __NUXT_DELAYED_MODULE_SCRIPTS__;
const supportsLcp = 'PerformanceObserver' in window
    && Array.isArray(PerformanceObserver.supportedEntryTypes)
    && PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint');

let started = false;
let pageLoaded = document.readyState === 'complete';
let largestLcp: LargestContentfulPaint | null = null;
let settleTimer = 0;
let lcpObserver: PerformanceObserver | null = null;

const fallbackTimer = window.setTimeout(startNuxt, 3000);

window.addEventListener('pointerdown', startNuxt, { once: true, capture: true });
window.addEventListener('keydown', startNuxt, { once: true, capture: true });

if (!supportsLcp) {
    startNuxt();
} else {
    try {
        lcpObserver = new PerformanceObserver(entryList => {
            for (const entry of entryList.getEntries()) {
                const lcpEntry = entry as LargestContentfulPaint;

                if (!largestLcp || lcpEntry.size >= largestLcp.size) largestLcp = lcpEntry;
            }

            scheduleAfterLargestLcp();
        });

        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
        startNuxt();
    }

    if (!started) {
        if (pageLoaded) {
            scheduleAfterLargestLcp();
        } else {
            window.addEventListener('load', handleLoad, { once: true });
        }
    }
}

function handleLoad() {
    pageLoaded = true;
    scheduleAfterLargestLcp();
}

function scheduleAfterLargestLcp() {
    if (started || !pageLoaded || !largestLcp) return;

    window.clearTimeout(settleTimer);

    settleTimer = window.setTimeout(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(startNuxt);
        });
    }, 100);
}

function startNuxt() {
    if (started) return;

    performance.mark('nuxt loading started');

    started = true;

    window.clearTimeout(fallbackTimer);
    window.clearTimeout(settleTimer);
    window.removeEventListener('pointerdown', startNuxt, true);
    window.removeEventListener('keydown', startNuxt, true);
    window.removeEventListener('load', handleLoad);

    if (lcpObserver) lcpObserver.disconnect();

    for (const tagHtml of moduleScriptTags) {
        const template = document.createElement('template');

        template.innerHTML = tagHtml;

        const source = template.content.querySelector('script');

        if (!source) continue;

        const script = document.createElement('script');

        for (const attribute of source.attributes) {
            script.setAttribute(attribute.name, attribute.value);
        }

        script.textContent = source.textContent;
        document.head.append(script);
    }
}
