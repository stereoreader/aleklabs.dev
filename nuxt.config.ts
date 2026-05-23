import { fileURLToPath, URL } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    ssr: true,

    nitro: {
        prerender: {
            crawlLinks: true,
        }
    },

    routeRules: {
        '/stereo-reader/**': {
            prerender: false
        }
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
        }
    }
});
