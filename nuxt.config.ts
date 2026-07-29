import { fileURLToPath, URL } from 'node:url';
import { imagetools } from 'vite-imagetools';
import { statSync } from 'node:fs';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    ssr: true,
    components: [
        {
            path: '~/components',
            pathPrefix: false,
        },
    ],

    css: ['~/assets/main.scss'],

    pages: {
        pattern: [
            '**/index.vue',
            '**/\\[slug\\].vue',
            '**/\\[...slug\\].vue',
            '**/\\[\\[...slug\\]\\].vue',
        ],
    },

    experimental: {
        payloadExtraction: false,
        viewTransition: true,
        defaults: {
            nuxtLink: {
                prefetchOn: {
                    interaction: true,
                    visibility: false
                }
            }
        }
    },


    nitro: {
        prerender: {
            crawlLinks: true,
            autoSubfolderIndex: false
        }
    },

    routeRules: {
        '/stereo-reader/app/**': {
            prerender: false
        },
        '/js-benchmark/playground': {
            ssr: false,
            prerender: false,
        },
        '/js-benchmark/playground/**': {
            ssr: false,
            prerender: false,
        },
        '/stereo-reader': {
            appLayout: 'stereo-reader',
        },
        '/stereo-reader/**': {
            appLayout: 'stereo-reader',
        },
    },

    alias: {
        '@content': fileURLToPath(new URL('./content', import.meta.url)),
        '@pages': fileURLToPath(new URL('./app/pages', import.meta.url))
    },

    sourcemap: {
        server: false,
        client: false
    },

    hooks: {
        'build:manifest'(manifest) {
            for (const item of Object.values(manifest)) {
                item.dynamicImports = [];
                item.prefetch = false;
            }
        }
    },

    features: {
        inlineStyles: false
    },

    vite: {
        build: {
            sourcemap: false,
            cssCodeSplit: false
        },

        plugins: [
            imagetools({
                removeMetadata: true,
                defaultDirectives: async function defaultDirectives(url, metadata) {

                    const directives = new URLSearchParams();

                    if (!/\.(png|jpe?g)$/i.test(url.pathname)) {
                        return directives;
                    }

                    if (!url.searchParams.has('w') && !url.searchParams.has('h')) {
                        const imageMetadata = await metadata();
                        const sourceWidth = imageMetadata.autoOrient?.width ?? imageMetadata.width;

                        if (sourceWidth > 920) {
                            directives.set('w', '920');
                        }
                    }

                    const filePath = url.protocol === 'file:'
                        ? fileURLToPath(url)
                        : decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:\/)/, '$1');

                    const size = statSync(filePath).size;

                    if (size <= 255 * 1024) {
                        return directives;
                    }

                    directives.set('format', 'webp');
                    directives.set('quality', '78');
                    directives.set('effort', 'max');

                    return directives;
                },
            }),
        ],
    },

    vue: {
        transformAssetUrls: {
            'al-markdown': ['src'],
            AlMarkdown: ['src'],
        },
    },

    modules: [
        '@nuxtjs/sitemap',
        'nuxt-site-config',
        fileURLToPath(new URL('./modules/glyph-data/module.ts', import.meta.url)),
    ],

    site: {
        url: 'https://aleklabs.dev',
        name: 'Alek Labs'
    },

    app: {
        viewTransition: 'always',
        head: {
            script: [
                {
                    async: true,
                    src: 'https://www.googletagmanager.com/gtag/js?id=G-CWXQF8PH4S',
                },
                {
                    innerHTML: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-CWXQF8PH4S', {
                            product_surface: 'website'
                        });
                    `,
                },
            ],
        },
    },

});
