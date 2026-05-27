<script setup lang="ts">

import CardCmp from './index/card.vue';
import ArticlesCmp from './index/articles.vue';
import stereoReaderPreview from './assets/stereo-reader-preview.jpg';
import youtubeChatPreview from './assets/youtube-send-to-ai-chat.png';

import coverImg from './assets/logo.jpg';

useSeoMeta({
    ogTitle: 'Alek Labs - Home for productivity tools',
    ogDescription: 'Personal website of senior frontend developer Alexander Nenashev',
    ogImage: new URL('./assets/logo.jpg', import.meta.url).pathname
});

</script>

<template>
    <al-cover :image-src="coverImg" style="margin-bottom:32px" />
    <div class="links">
        <canvas id="heartbeat"></canvas>
        <a href="https://www.linkedin.com/in/alexander-nenashev-930731288/" target="_blank">
            <img class="icon-scale-80" src="./assets/icons/linkedin.svg">
            <span>My LinkedIn profile</span>
        </a>
        <a href="https://stackoverflow.com/users/14098260/alexander-nenashev" target="_blank">
            <img class="icon-scale-80" src="./assets/icons/stackoverflow.svg">
            <span>My Stackoverflow profile</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bvue.js%5d%20or%20%5bvuejs3%5d&searchOn=3"
            target="_blank">
            <img src="./assets/icons/vue.svg">
            <span>My Vue SO answers</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bvite%5d%20&searchOn=3"
            target="_blank">
            <img class="icon-scale-90" src="./assets/icons/vite.svg">
            <span>My Vite SO answers</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5btypescript%5d&searchOn=3"
            target="_blank">
            <img src="./assets/icons/typescript.svg">
            <span>My Typescript SO answers</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bjavascript%5d&searchOn=3"
            target="_blank">
            <img src="./assets/icons/javascript.svg">
            <span>My Javascript SO answers</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bcss%5d&searchOn=3"
            target="_blank">
            <img class="icon-scale-85 icon-nudge-down" src="./assets/icons/css.svg">
            <span>My CSS SO answers</span>
        </a>
    </div>
    <section class="tools" aria-label="Productivity tools">
        <card-cmp
            href="/stereo-reader"
            title="Stereo Reader"
            :image-src="stereoReaderPreview">
            A reader aimed to improve vision by training or relaxing your eyes while
            reading books. Supports text, PDF, EPUB, and FB2 files in stereo or mono mode.
        </card-cmp>
        <card-cmp
            href="https://chromewebstore.google.com/detail/youtube-send-to-ai-chat/jfclfogdljgmnbbkdpkbnmfkfaahelhp"
            title="Youtube: Send to AI chat"
            :image-src="youtubeChatPreview">
            A browser extension that sends YouTube transcripts to AI chats for
            timestamped summaries, Q&amp;A, inline video playback, clickable timestamp navigation, and
            customizable prompts.
        </card-cmp>
    </section>
    <section class="tools" aria-label="Articles">
        <h2><img src="./assets/icons/information.svg">Articles</h2>
        <articles-cmp />
    </section>
</template>

<style scoped lang="scss">
.tools {
    display: flex;
    flex-direction: column;
    gap: 16px;

    > h2 {
        margin-top: 16px;
        margin-bottom: 0;
        margin-left: 16px;
        opacity: .5;
        display: flex;
        align-items: center;
        gap: 10px;

        img {
            position: relative;
            top: 2px;
            width: 24px;
        }
    }
}

.links {
    --heartbeat-bpm: 60;
    --heartbeat-duration: calc(60s / var(--heartbeat-bpm));
    position: relative;
    justify-content: center;
    display: flex;
    gap: 32px;
    margin-bottom: 32px;
}

.links a {
    filter: saturate(0);
    opacity: .7;
    --border-radius: calc(var(--border-radius) / 2);
    --overflow: hidden;
    width: 64px;
    height: 64px;
    transition: transform .3s;
}

.links a span {
    display: none;
}

.links a:hover {
    filter: saturate(var(--saturate-base));
    opacity: 1;
    transform: scale(1.1);
    background-color: transparent;
    animation: glow var(--heartbeat-duration) infinite linear;
    filter: drop-shadow(0 0 12px #4fc3ff);
    animation-delay: calc(var(--heartbeat-duration) * 0.07);
}

.links a:hover span {
    font-size: 12px;
    color: #bbb;
    display: block;
    position: absolute;
    top: 64px;
    width: 300px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
}


@keyframes glow {
    0% {
        filter:
            saturate(var(--saturate-base)) drop-shadow(0 0 12px #4fc3ff);
    }

    8% {
        filter:
            saturate(calc(var(--saturate-base) + (1 - var(--saturate-base)) * 0.5)) drop-shadow(0 0 18px #a88cb3);
    }

    16% {
        filter:
            saturate(calc(var(--saturate-base) + (1 - var(--saturate-base)) * 0.2)) drop-shadow(0 0 13px #6bb7eb);
    }

    24% {
        filter:
            saturate(1) drop-shadow(0 0 24px #ff0000);
    }

    36% {
        filter:
            saturate(calc(var(--saturate-base) + (1 - var(--saturate-base)) * 0.3)) drop-shadow(0 0 14px #4fc3ff);
    }

    100% {
        filter:
            saturate(var(--saturate-base)) drop-shadow(0 0 12px #4fc3ff);
    }
}

.links a img {
    width: 100%;
    object-fit: contain;
}

.links canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
}

.icon-scale-80 {
    transform: scale(.8);
}

.icon-scale-85 {
    transform: scale(.85);
}

.icon-scale-90 {
    transform: scale(.9);
}

.icon-nudge-down {
    position: relative;
    top: 2px;
}
</style>
