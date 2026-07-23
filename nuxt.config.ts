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

    pages: {
        pattern: [
            '**/index.vue',
            '**/\\[slug\\].vue',
            '**/\\[...slug\\].vue',
            '**/\\[\\[...slug\\]\\].vue',
        ],
    },

    experimental: {
        payloadExtraction: false
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

    vite: {
        build: {
            sourcemap: false
        },

        plugins: [
            imagetools({
                removeMetadata: true,
                defaultDirectives: function defaultDirectives(url) {
                    const directives = new URLSearchParams();

                    if (!/\.(png|jpe?g)$/i.test(url.pathname)) {
                        return directives;
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

    modules: ['@nuxtjs/sitemap', 'nuxt-site-config'],

    site: {
        url: 'https://aleklabs.dev',
        name: 'Alek Labs'
    },

    app: {
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