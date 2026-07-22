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
    <al-header />
    <main>
        <slot />
    </main>
</template>

<style lang="scss">
:root {
    color-scheme: dark;
    --bg: #0b0b0d;
    --panel: #121318;
    --panel-hover: #161821;
    --text: #f1f1f3;
    --muted: #b8bac4;
    --border: #2d303a;
    --accent: #7d8cff;
    --border-radius: 16px;
    --saturate-base: .7;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: Segoe UI, Arial, Helvetica, sans-serif;
    font-size: 15px;
    line-height: 1.5;
    overflow-x: hidden;
}

main {
    width: min(920px, calc(100% - 32px));
    margin: 0 auto;
    padding: 48px 0;
}
</style>