<script setup lang="ts">

import feature1Img from '../../assets/feature-read.png?w=250';
import feature2Img from '../../assets/feature-relax.png?w=250';
import feature3Img from '../../assets/feature-train.png?w=250';

import CoverCmp from './cover.vue';
import FeatureCmp from '../../feature.vue';

import story from './story.md?raw';
import results from './results.md?raw';
import warning from './warning.md?raw';
import app from './app.md?raw';
import goals from './goals.md?raw';
import bates from './bates.md?raw';
import join from './join.md?raw';

useSeoMeta({
    ogTitle: 'Alek Labs - Stereo Reader',
    ogDescription: 'Русская версия страницы Stereo Reader',
    ogImage: new URL('../../assets/logo.jpg', import.meta.url).pathname
});

</script>

<template>
    <cover-cmp style="margin-bottom:32px" />
    <div class="features">
        <feature-cmp title="Читайте любимые книги" :image-url="feature1Img">
            Вы можете читать текстовые, PDF, EPUB и FB2 файлы в стерео- или моно-режиме
        </feature-cmp>
        <feature-cmp title="Расслабляйте глаза" :image-url="feature2Img">
            Вы можете читать книги или смотреть изображения с комфортными настройками для расслабления глаз в
            параллельном режиме
        </feature-cmp>
        <feature-cmp title="Тренируйте глаза" :image-url="feature3Img">
            Вы можете тренировать зрение для улучшения фокуса и четкости с более сложными настройками (меньший
            размер шрифта, больший зазор между колонками, большая дистанция)
        </feature-cmp>
    </div>
    <div class="story">
        <al-markdown class="chapter" :src="story" />
        <al-markdown class="chapter" :src="results" />
        <al-markdown class="chapter" :src="app" />
        <al-markdown class="chapter" :src="goals" />
        <al-markdown class="chapter" :src="bates" />
        <al-markdown class="chapter" :src="warning" />
        <al-markdown class="chapter" :src="join" />
    </div>
</template>

<style scoped lang="scss">

.chapter {

    position: relative;
    --margin-top: 74px;
    margin-top: var(--margin-top);
    margin-bottom: 32px;
    background: #222;
    border-radius: 8px;
    padding: 16px;
    font-weight: 200;

    :deep(h2) {
        color: #888;
        position: absolute;
        left: 0;
        top: calc(-1 * var(--margin-top) + 8px);
        font-weight: normal;
        text-align: center;
        width: 100%;
    }

    :deep(h3) {
        font-weight: normal;
        color: white;
        font-size: 18px;
    }

    :deep(.big) {
        font-weight: bold;
        margin-block: 0;
        color: #ff7411;
        font-size: 64px;
    }

    :deep(.bigger) {
        margin-block: 0;
        font-size: 24px;
        text-align: center;
    }
}

.features {
    container-name: features;
    display: flex;
    gap: 16px;
    justify-content: center;

    @container main (max-width: 600px) {
        flex-direction: column;
    }
}

.story {
    padding: 32px;
}
</style>
