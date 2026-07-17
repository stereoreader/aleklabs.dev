<script setup lang="ts">
const route = useRoute();
const isHome = route.fullPath === '/';
</script>
<template>
    <header v-if="!isHome"><a href="/"><al-logo text="ALEK LABS" :size="64"/></a></header>
</template>
<style setup lang="scss">
header {
    width: min(920px, calc(100% - 32px));
    margin: 0 auto;
    text-transform: uppercase;
    text-align: center;
    padding-top: 16px;
    margin-bottom: 16px;
    letter-spacing: 4px;
}
</style>