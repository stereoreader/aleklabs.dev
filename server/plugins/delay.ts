export default defineNitroPlugin(nitroApp => {
    if (import.meta.dev) return;

    nitroApp.hooks.hook('render:html', html => {
        const sections = [html.head, html.bodyPrepend, html.bodyAppend];
        const moduleScripts: string[] = [];

        for (const section of sections) {
            const transformed = section.map(block => {
                return block
                    .replace(getNuxtModuleScriptPattern(), match => {
                        moduleScripts.push(match);
                        return '';
                    })
                    .replace(getNuxtModulePreloadPattern(), '');
            });

            section.splice(0, section.length, ...transformed);
        }

        if (!moduleScripts.length) {
            console.error('[delay] Nuxt module script was not found');
            return;
        }

        const serializedModuleScripts = JSON.stringify(moduleScripts).replaceAll('<', '\\u003c');

        html.bodyAppend.push(`<script>
(() => {
    const moduleScriptTags = ${serializedModuleScripts};
    const supportsLcp = 'PerformanceObserver' in window
        && Array.isArray(PerformanceObserver.supportedEntryTypes)
        && PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint');

    let started = false;
    let pageLoaded = document.readyState === 'complete';
    let largestLcp = null;
    let settleTimer = 0;
    let lcpObserver = null;

    const fallbackTimer = window.setTimeout(startNuxt, 3000);

    window.addEventListener('pointerdown', startNuxt, {once: true, capture: true});
    window.addEventListener('keydown', startNuxt, {once: true, capture: true});

    if (!supportsLcp) {
        startNuxt();
        return;
    }

    try {
        lcpObserver = new PerformanceObserver(entryList => {
            for (const entry of entryList.getEntries()) {
                if (!largestLcp || entry.size >= largestLcp.size) largestLcp = entry;
            }

            scheduleAfterLargestLcp();
        });

        lcpObserver.observe({type: 'largest-contentful-paint', buffered: true});
    } catch {
        startNuxt();
        return;
    }

    if (pageLoaded) {
        scheduleAfterLargestLcp();
    } else {
        window.addEventListener('load', handleLoad, {once: true});
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
})();
</script>`);

        function getNuxtModuleScriptPattern() {
            return /<script\b(?=[^>]*\btype=(["'])module\1)(?=[^>]*\bsrc=(["'])[^"']*\/_nuxt\/[^"']+\.js(?:\?[^"']*)?\2)[^>]*>\s*<\/script>/gi;
        }

        function getNuxtModulePreloadPattern() {
            return /<link\b(?=[^>]*\brel=(["'])modulepreload\1)(?=[^>]*\bhref=(["'])[^"']*\/_nuxt\/[^"']+\2)[^>]*>/gi;
        }
    });
});