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

    modules: [
      '@nuxt/content',
      './modules/content-assets',
    ],

    routeRules: {
        '/stereo-reader/**': {
            prerender: false
        }
    },

    content: {
        renderer: {
            anchorLinks: false,
        },
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