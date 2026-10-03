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

    @media (max-width: 767px) {
        width: 100%;

        :deep(> :is(section, .article, .article-list, .articles, .wrapper)) {
            padding-inline: 16px;
            border-radius: 0;
        }

        :deep(> .article .article-cover) {
            margin-inline: -16px;
            width: calc(100% + 32px);
        }
    }
}
</style>
