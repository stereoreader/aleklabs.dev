<script setup lang="ts">

import feature1Img from './assets/feature-read.png?w=250';
import feature2Img from './assets/feature-relax.png?w=250';
import feature3Img from './assets/feature-train.png?w=250';

const foundMarkdown = import.meta.glob('./content/**/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;

const route = useRoute();
const slug = route.params.slug;
let lang = slug?.[0] || 'en';
if (lang.length !== 2) {
    lang = 'en';
}

useHead({
    htmlAttrs: {
        lang
    }
});

function findContent<T extends string[]>(...pages: T) {

    const out = {} as Record<T[number], string>;
    const keys = Object.keys(foundMarkdown);

    for (const page of pages) {
        const foundKey = keys.find(key => key.includes(lang === 'en' ? `content/${page}.md` : `content/lang/${lang}/${page}.md`));
        if (!foundKey) throw new Error('Cant find page ' + page);
        out[page as any as T[number]] = foundMarkdown[foundKey] as string;
    }
    return out;
}

const content = findContent('title', 'feature1', 'feature2', 'feature3', 'story', 'results', 'warning', 'app', 'goals', 'bates', 'join');

import coverImg from './assets/logo.svg';
import FeatureCmp from './feature.vue';

useSeoMeta({
    ogTitle: 'Alek Labs - Home for productivity tools',
    ogDescription: 'Personal website of senior frontend developer Alexander Nenashev',
    ogImage: new URL('./assets/logo.jpg', import.meta.url).pathname
});

</script>

<template>
    <div class="cover">
        <al-cover :image-src="coverImg" />
        <div class="text" v-html="parseMarkdown(content.title)">
        </div>
    </div>
    <div class="features">
        <feature-cmp :image-url="feature1Img" :src="content.feature1" />
        <feature-cmp :image-url="feature2Img" :src="content.feature2" />
        <feature-cmp :image-url="feature3Img" :src="content.feature3" />
    </div>
    <div class="story">
        <al-markdown class="chapter" :src="content.story" />
        <al-markdown class="chapter" :src="content.results" />
        <al-markdown class="chapter" :src="content.app" />
        <al-markdown class="chapter" :src="content.goals" />
        <al-markdown class="chapter" :src="content.bates" />
        <al-markdown class="chapter" :src="content.warning" />
        <al-markdown class="chapter" :src="content.join" />
    </div>
</template>

<style scoped lang="scss">
.cover {

    margin-bottom: 32px;
    display: flex;
    gap: 32px;

    @container main (max-width:640px) {
        flex-direction: column;
        align-items: center;

        .text {
            text-align: center;
        }
    }

    :deep(*) {
        h1 {
            font-weight: 400;
            font-size: 48px;
            margin: 0 !important;
            margin-bottom: 32px;
        }

        .promo {
            font-size: 20px
        }
    }

    * {
        flex-grow: 1;
    }
}

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
