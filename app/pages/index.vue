<script setup lang="ts">

import CardCmp from './index/card.vue';

import ExperienceCmp from './index/experience.vue';
import ArticlesCmp from './index/articles.vue';
import LinksCmp from './index/links.vue';

import stereoReaderPreview from './stereo-reader/assets/logo.svg';
import youtubeChatPreview from './assets/youtube-send-to-ai-chat.png';
import jsbenchPreview from './js-benchmark/assets/cover.png';
import keyboardLayerPreview from './keyboard-layer/cover.png';

import coverImg from './assets/logo.jpg';

useHead({
    link: [{
        rel: 'preload',
        as: 'image',
        href: coverImg,
        fetchpriority: 'high'
    }]
});

useSeoMeta({
    ogTitle: 'Alek Labs - Home for productivity tools',
    ogDescription: 'Personal website of senior frontend developer Alexander Nenashev',
    ogImage: new URL('./assets/logo.jpg', import.meta.url).pathname
});

</script>

<template>
    <al-page-cover :image-src="coverImg" text="ALEK LABS" />
    <links-cmp />

    <section class="tools" aria-label="Alek Labs Projects">
        <h2><al-icon icon="labs" />Alek Labs Projects</h2>
        <card-cmp
            href="/stereo-reader"
            title="Stereo Reader"
            :image-src="stereoReaderPreview">
            A reader aimed to improve vision by training or relaxing your eyes while
            reading books. Supports text, PDF, EPUB, and FB2 files in stereo or mono mode.
        </card-cmp>
        <card-cmp
            href="/keyboard-layer"
            title="Keyboard Layer"
            :image-src="keyboardLayerPreview">
            A Windows keyboard command layer for faster programming and text editing. Adds ergonomic shortcuts for
            navigation, selection, deletion, copy, paste, undo, redo, and Enter while keeping standard QWERTY typing
            unchanged.
        </card-cmp>
        <card-cmp
            href="/js-benchmark"
            title="JS Benchmark"
            :image-src="jsbenchPreview">
            A script for creating embeddable JavaScript benchmarks, adding them to Stack Overflow answers or personal
            websites, comparing algorithms and data transformations, and learning how to write high-performance
            JavaScript.
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
        <h2><al-icon icon="information" />Articles</h2>
        <articles-cmp />
    </section>

    <section class="tools" aria-label="Production experience">
        <h2><al-icon icon="experience" />Production experience</h2>
        <experience-cmp />
    </section>
</template>

<style scoped lang="scss">
.tools {
    margin-bottom: 32px;

    position: relative;
    --icon-color: #aaa;
    display: flex;
    flex-direction: column;
    gap: 32px;

    :deep(.al-icon) {
        opacity: .4;
        z-index: -1;
        left: -64px;
        top: 32px;

        --icon-size: 128px;
        position: absolute;
    }

    > * {
        position: relative;
    }

    > h2 {
        margin-top: 16px;
        margin-bottom: 0;
        margin-left: 16px;
        font-size: 32px;
        font-weight: 200;
        opacity: .5;
        display: flex;
        align-items: center;
        gap: 10px;

        img {
            position: relative;
            top: 2px;
            width: 24px;
        }

        .section-icon {
            position: relative;
            top: 2px;
        }
    }
}
</style>
