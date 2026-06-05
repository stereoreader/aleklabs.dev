<script setup lang="ts">

import feature1Img from './assets/feature-read.png?w=250';
import feature2Img from './assets/feature-relax.png?w=250';
import feature3Img from './assets/feature-train.png?w=250';

const foundMarkdown = import.meta.glob('./content/**/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;

const route = useRoute();
const slug = route.params.slug;
let lang = slug?.[0] || 'en';
if (lang.length !== 2) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page not found'
    });
}

useHead({
    title: lang === 'ru' ? 'СТЕРЕО ЧТЕНИЕ: Улучшайте зрение читая любимые книги в стерео режиме' : 'STEREO READER: Improve your vision while reading your favorite books in stereo mode',
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

if (lang === 'en') {
    useSeoMeta({
        ogDescription: 'Train or relax your eyes with Stereo Reader while reading books and documents in stereo or mono mode. Supports text, PDF, EPUB, FB2, images, stereo pairs, voice commands, mouse control, and timers.',
        ogImage: new URL('./assets/logo.jpg', import.meta.url).pathname
    });
} else {
    useSeoMeta({
        ogDescription: 'Тренируйте или расслабляйте глаза со Стерео Чтение, читая книги и документы в стерео- или моно-режиме. Поддерживает текст, PDF, EPUB, FB2, изображения, стереопары, голосовые команды, мышь и таймеры.',
        ogImage: new URL('./assets/logo.jpg', import.meta.url).pathname
    });
}

</script>

<template>
    <div class="lang-switch">
        <a href="/stereo-reader/ru" v-if="lang === 'en'">Русский</a>
        <a href="/stereo-reader" v-else>English</a>
    </div>
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
.lang-switch {
    position: absolute;
    font-size: smaller;
    --offset: 16px;
    top: var(--offset);
    right: var(--offset);

    a {
        text-decoration: none;
        color: #555;

        &:hover {
            color: #fff;
        }
    }
}

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

        a {}

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

        a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75em 1.4em;
            border-radius: 9999px;
            color: #063b35;
            font-weight: 600;
            text-decoration: none;
            transition: transform 160ms ease;
            animation: sea-button-bg 3s ease-in-out infinite alternate;
        }

        a:hover {
            animation-duration: 200ms;
            transform: translateY(-1px);
        }

        a:active {
            transform: translateY(0);
        }

        @keyframes sea-button-bg {
            from {
                background-color: rgb(105, 212, 255);
            }

            to {
                background-color: white;
            }
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
