<script setup>
import Markdown from './Markdown.vue';
//import './assets/main.css';
import docs from './docs.md?raw';
</script>

<template>
    <h1><img src="./assets/gauge.svg"> JS benchmark</h1>
    <div class="subtitle">
        <a href="/benchmark" target="_blank">Open the playground</a>
    </div>
    <al-markdown :src="docs" />
</template>

<style scoped>

h1 {
    img {
        vertical-align: middle;
    }

    @media (max-width: 1024px) {
        font-size: 18px;
    }

    margin-bottom: 16px;
}
.subtitle{
    margin-bottom: 16px;
}
</style>
