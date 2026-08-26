<script setup lang="ts">

import CardCmp from './index/card.vue';

import ExperienceCmp from './index/experience.vue';
import ArticlesCmp from './index/articles.vue';
import LinksCmp from './index/links.vue';

import stereoReaderPreview from './stereo-reader/assets/logo.svg';
import youtubeChatPreview from './assets/youtube-send-to-ai-chat.png';
import jsbenchPreview from './js-benchmark/assets/cover.png';
import keyboardLayerPreview from './keyboard-layer/cover.png';
import stereoReaderCardBg from './assets/stereo-reader-card-bg.png';

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

const stereoReaderCardBackground = `url("${stereoReaderCardBg}")`;

</script>

<template>
    <al-page-cover :image-src="coverImg" text="ALEK LABS" />
    <links-cmp />

    <section class="tools" aria-label="Alek Labs Projects">
        <h2><al-icon icon="labs" />Alek Labs Projects</h2>
        <card-cmp
            class="stereo-reader-card"
            href="/stereo-reader"
            title="Stereo Reader"
            :image-src="stereoReaderPreview">
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px;">
                <div style="font-size: 20px; font-weight: 300; line-height: 1.3;">
                    Parallel-view reader and eye trainer
                </div>

                <div class="stereo-reader-button">
                    <span>Explore Stereo Reader</span><svg width="32px" height="32px"
                        viewBox="0 0 15.00 15.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"
                        stroke-width="0.00015000000000000001">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M0 7.5C0 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5C15 11.6421 11.6421 15 7.5 15C3.35786 15 0 11.6421 0 7.5ZM8.50008 4.79285L11.2072 7.49995L8.50008 10.2071L7.79297 9.49995L9.29292 8H4V7H9.29302L7.79297 5.49995L8.50008 4.79285Z"
                                fill="#ffffff"></path>
                        </g>
                    </svg>
                </div>
            </div>
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
        <!-- <card-cmp
            href="https://chromewebstore.google.com/detail/youtube-send-to-ai-chat/jfclfogdljgmnbbkdpkbnmfkfaahelhp"
            title="Youtube: Send to AI chat"
            :image-src="youtubeChatPreview">
            A browser extension that sends YouTube transcripts to AI chats for
            timestamped summaries, Q&amp;A, inline video playback, clickable timestamp navigation, and
            customizable prompts.
        </card-cmp> -->
    </section>

    <section class="tools" aria-label="Production experience">
        <h2><al-icon icon="experience" />Production experience</h2>
        <experience-cmp />
    </section>

    <section class="tools" aria-label="Articles">
        <h2><al-icon icon="information" />Articles</h2>
        <articles-cmp />
    </section>


</template>

<style scoped lang="scss">
:deep(.stereo-reader-card::before) {
    content: '';
    position: absolute;
    display: block;
    inset: 0;
    z-index: 1;
    opacity: .3;
    background-position: right center;
    background-size: cover;
    background-repeat: no-repeat;
    background-image: v-bind(stereoReaderCardBackground);
}

.stereo-reader-button {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 8px 32px;
    border: 1px solid rgb(130 205 255 / 55%);
    border-radius: 999px;
    background: linear-gradient(110deg, rgb(90 190 255 / 14%), rgb(150 110 255 / 14%));
    box-shadow: 0 0 12px rgb(110 180 255 / 20%);
    font-size: 20px;
    font-weight: 300;
    line-height: 1.8;

    > *:first-child {
        position: relative;
        top: -3px;
    }

    > *:last-child {
        position: relative;
        left: 20px;
    }
}

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
