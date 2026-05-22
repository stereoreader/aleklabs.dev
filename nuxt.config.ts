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
