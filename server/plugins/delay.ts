import delayClientScript from '#delay-client';

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
        const script = delayClientScript.replace('__NUXT_DELAYED_MODULE_SCRIPTS__', serializedModuleScripts);

        html.bodyAppend.push(`<script>${script}</script>`);

        function getNuxtModuleScriptPattern() {
            return /<script\b(?=[^>]*\btype=(["'])module\1)(?=[^>]*\bsrc=(["'])[^"']*\/_nuxt\/[^"']+\.js(?:\?[^"']*)?\2)[^>]*>\s*<\/script>/gi;
        }

        function getNuxtModulePreloadPattern() {
            return /<link\b(?=[^>]*\brel=(["'])modulepreload\1)(?=[^>]*\bhref=(["'])[^"']*\/_nuxt\/[^"']+\2)[^>]*>/gi;
        }
    });
});
