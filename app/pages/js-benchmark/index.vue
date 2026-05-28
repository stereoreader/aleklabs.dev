<script setup>
//import './assets/main.css';
import MarkdownIt from 'markdown-it';
import docs from './docs.md?raw';

import favico from './assets/favicon.ico';

useHead({
    title: "JS benchmark",
    link: [
        {
            rel: 'icon',
            type: 'image/svg+xml',
            href: favico,
        },
    ]
});


const html = new MarkdownIt({ html: true }).render(docs);

</script>

<template>
    <div class="wrapper">
        <h1><img src="./assets/gauge.svg"> JS benchmark</h1>
        <div class="subtitle">
            <a href="/js-benchmark/playground" target="_blank">Open the playground</a>
        </div>
        <div class="content jsbench-content" v-html="html"></div>
    </div>
</template>

<style scoped lang="scss">
.wrapper {
    padding-inline: 32px;
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
<style lang="scss">
.jsbench-content {

    h1,
    h2,
    h3 {
        color: #ddd;
    }

    p:has(.article-cover) {
        margin: 0;
    }

    .article-cover {
        margin: -32px;
        margin-bottom: 32px;
        width: calc(100% + 64px);
    }

    pre:has(>code) {
        background: #222;
        padding: 8px;
        border-radius: 4px;
        background: #222233;
        color: orange;
    }

    blockquote {
        border-left: 3px solid #555;
        background: #222;
        margin-left: 0;
        padding-inline: 32px;
        display: block;
        padding-block: 1px;
    }

    hr {
        margin-top: 48px;
        margin-bottom: 48px;
        margin-inline: auto;
        width: 25%;
        border: 1px solid #333;
    }

    li {
        margin-bottom: 16px;
    }

}
</style>
