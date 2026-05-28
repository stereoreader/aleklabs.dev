<script setup>
//import './assets/main.css';
import MarkdownIt from 'markdown-it';
import docs from './docs.md?raw';

const html = new MarkdownIt({ html: true }).render(docs);

</script>

<template>
    <div class="wrapper">
        <h1><img src="./assets/gauge.svg"> JS benchmark</h1>
        <div class="subtitle">
            <a href="/js-benchmark/playground" target="_blank">Open the playground</a>
        </div>
        <div class="content" v-html="html"></div>
    </div>
</template>

<style scoped lang="scss">
.wrapper {
    padding: 32px;
    background: #171717;

}

.content {

    position: relative;
}

a,
.green {
    text-decoration: none;
    color: hsla(160, 100%, 37%, 1);
    transition: 0.4s;
}

h1 {
    img {
        vertical-align: middle;
    }

    @media (max-width: 1024px) {
        font-size: 18px;
    }

    margin-bottom: 16px;
}

.subtitle {
    margin-bottom: 16px;
}
</style>
