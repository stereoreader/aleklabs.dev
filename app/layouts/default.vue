<script setup lang="ts">
useHead({
    titleTemplate: title => title
        ? `${title} - Alek Labs`
        : 'Alek Labs - Home for productivity tools',
    link: [
        {
            rel: 'icon',
            type: 'image/svg+xml',
            href: 'logo.svg',
        },
    ]
});
</script>

<template>
    <al-header/>
    <main>
        <slot />
    </main>
</template>

<style scoped lang="scss">

main {
    width: min(920px, calc(100% - 32px));
    margin: 0 auto;
    padding: 48px 0;
}
</style>
