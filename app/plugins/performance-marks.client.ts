export default defineNuxtPlugin({
    hooks: {
        'app:created'() {
            performance.mark('nuxt-loading-completed');
        },
        'app:suspense:resolve'() {
            performance.mark('vue-hydration-completed');
        },
    },
});
