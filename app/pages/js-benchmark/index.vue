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
    <div class="wrapper" show-benchmark-code  v-transition-name="[$route.fullPath, 'article']">
        <h1><img src="./assets/gauge.svg"> AlekLabs JS benchmark</h1>
        <div class="subtitle">A benchmark to write in pure JS and host anywhere</div>
        <img src="./assets/cover.png" class="cover" v-transition-name="[$route.fullPath, 'cover']">
        <div class="subtitle subtitle-2">
            <nuxt-link to="/js-benchmark/playground">Open playground</nuxt-link>
            <nuxt-link
                to="/js-benchmark/playground#H4sIAAAAAAAACm3PQQrCMBQE0KsMWUiiIVbBTUXRA3gC6yK20Rab3%2FKbClJ6dylZqOBumMVjZhB5UziRiryhLsAyY4cjs32ZGzdeDrWjeyhTrJJk1JAKuz3kQL1PcbKhNGypaLxUo1LbjDJaLnG4OspLb%2FmBW1UHx1jA2zYjy2xiI2lyyFDvsYfZKONt%2B13Osf7nsSv63EUpZilZg%2BKsj4fZDGzavivlx9NgpXG%2BqK3QIlShnn5HBc%2FuZ6sY35i0sGoZAQAA">Try
                in playground: reduce vs filter + map</nuxt-link>
            <a href="https://stackoverflow.com/search?tab=newest&q=user%3a14098260%20benchmark&searchOn=3"
                target="_blank">My Stack Overflow answers with benchmarks</a>
        </div>

        <div class="content jsbench-content" v-html="html"></div>
    </div>
</template>

<style scoped lang="scss">
:deep(code) {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

h1,
.subtitle {
    font-weight: normal;
    font-family: 'Courier New', Courier, monospace;
}

.subtitle-2 {
    margin-top: 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.cover {
    max-width: 100%;
    display: block;
    margin: auto;
}

.wrapper {
    border-radius: var(--border-radius);
    margin-top: -32px;
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
