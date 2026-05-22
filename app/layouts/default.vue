<script setup lang="ts">
useHead({
    title: 'Alek Labs - Home for productivity tools'
});
</script>

<template>
    <slot />
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
    font-family: Arial, Helvetica, sans-serif;
    font-size: 15px;
    line-height: 1.5;
}
</style>