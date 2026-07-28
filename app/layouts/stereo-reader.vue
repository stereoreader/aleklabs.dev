<script setup lang="ts">

import favico from '@pages/stereo-reader/assets/logo.svg';

useHead({
    titleTemplate: title => title
        ? `${title} - Alek Labs`
        : 'Sharper Vision with Stereo Reader by Alek Labs',
    link: [
        {
            rel: 'icon',
            type: 'image/svg+xml',
            href: favico,
        },
    ]
});

</script>

<template>
    <al-header />
    <main v-transition-target="[$route.fullPath, 'article']">
        <slot />
    </main>
</template>

<style scoped lang="scss">
main {

    container-name: main;
    container-type: inline-size;
    width: min(920px, calc(100% - 32px));
    margin: 0 auto;
    margin-top: 32px;
    padding: 48px 0;
    background: #161616;
    border-radius: var(--border-radius);
    position: relative;
}
</style>