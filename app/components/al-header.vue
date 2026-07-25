<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.fullPath === '/');
</script>
<template>
    <header v-if="!isHome"><nuxt-link to="/"><al-logo text="ALEK LABS" style="height:100%" /></nuxt-link></header>
</template>
<style setup lang="scss">
header {
    aspect-ratio: 920/95;
    position: sticky;
    top: 0;
    z-index: 1000;
    background: color-mix(in srgb, var(--bg) 97%, transparent);
    //backdrop-filter: blur(10px);
    width: min(920px, calc(100% - 32px));
    margin: 0 auto;
    text-transform: uppercase;
    text-align: center;
    padding-top: 16px;
    padding-bottom: 16px;
    letter-spacing: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    box-shadow: 0 0 32px var(--bg);

    a {
        display: block;
        position: relative;
        height: 100%;
        margin: 0;
    }
}
</style>