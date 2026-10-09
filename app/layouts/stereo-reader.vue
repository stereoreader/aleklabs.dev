<script setup lang="ts">

import favico from '@pages/eye-trainer/assets/logo.svg';

useHead({
    titleTemplate: title => title
        ? title
        : 'AlekLabs Eye Trainer: Binocular Vision Training Platform',
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

    @media (max-width: 767px) {
        width: 100%;
        border-radius: 0;

        :deep(> .cover) {
            border-radius: 0;
        }

        :deep(.chapter) {
            border-radius: 0;
        }

        :deep(> .footer) {
            padding-inline: 16px;
        }
    }
}
</style>