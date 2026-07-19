<script setup lang="ts">
const route = useRoute();
const isHome = route.fullPath === '/';
</script>
<template>
    <header v-if="!isHome"><a href="/"><al-logo text="ALEK LABS" style="height:100%"/></a></header>
</template>
<style setup lang="scss">
header {
    aspect-ratio: 920/95;
    position: relative;
    width: min(920px, calc(100% - 32px));
    margin: 0 auto;
    text-transform: uppercase;
    text-align: center;
    padding-top: 16px;
    margin-bottom: 16px;
    letter-spacing: 4px;
    display:flex;
    justify-content: center;
    align-items: center;
    a{
        display:block;
        position: relative;
        height: 100%;
        margin: 0;
    }
}
</style>