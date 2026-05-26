<script setup lang="ts">

import feature1Img from './assets/feature-read.png';
import feature2Img from './assets/feature-relax.png';
import feature3Img from './assets/feature-train.png';

import CoverCmp from './cover.vue';
import FeatureCmp from './feature.vue';
import story from './story.md?raw';

useSeoMeta({
    ogTitle: 'Alek Labs - Home for productivity tools',
    ogDescription: 'Personal website of senior frontend developer Alexander Nenashev',
    ogImage: new URL('./assets/logo.jpg', import.meta.url).pathname
});

</script>

<template>
    <cover-cmp />
    <div class="features">
        <feature-cmp title="Read your favorite books" :image-url="feature1Img">
            You can read text, PDF, EPUB, FB2 files in stereo or mono mode
        </feature-cmp>
        <feature-cmp title="Relax your eyes" :image-url="feature2Img">
            You can read books or view images with comfortable settings to relax your eyes with parallel view
        </feature-cmp>
        <feature-cmp title="Train your eyes" :image-url="feature3Img">
            You can train your vision to improve focus and clarity by reading with more challenging settings (smaller
            font size, wider gap between columns, longer distance)
        </feature-cmp>
    </div>
    <div class="story">
        <al-markdown :markdown="story" />
    </div>
</template>

<style scoped lang="scss">
.features {
    display: flex;
    gap: 16px;
    justify-content: center;
}

.story {
    padding: 32px;
}
</style>
