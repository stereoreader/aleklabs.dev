<script setup lang="ts">

import feature1Img from './assets/feature-read.png?w=250';
import feature2Img from './assets/feature-relax.png?w=250';
import feature3Img from './assets/feature-train.png?w=250';
import SectionTitle from './section-title.vue';

import stereoReaderCardBg from '../assets/stereo-reader-card-bg.png';
const stereoReaderCardBackground = `url("${stereoReaderCardBg}")`;


const foundMarkdown = import.meta.glob('./content/**/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;

const route = useRoute();
const routeSlug = Array.isArray(route.params.slug) ? route.params.slug : route.params.slug ? [route.params.slug] : [];
const slugParts = routeSlug.flatMap(part => part.split('/')).filter(Boolean);
const markdownKeys = Object.keys(foundMarkdown);

let lang = 'en';
let folderPath = '';

if (slugParts.length === 1) {
    if (slugParts[0]!.length === 2) {
        lang = slugParts[0]!;
    } else {
        folderPath = slugParts[0]!;
    }
} else if (slugParts.length > 1) {
    if (slugParts[0]!.length === 2) {
        lang = slugParts[0]!;
        folderPath = slugParts.slice(1).join('/');
    } else {
        folderPath = slugParts.join('/');
    }
}

useHead({
    title: lang === 'ru' ? 'СТЕРЕО ЧТЕНИЕ: Улучшайте зрение читая любимые книги в стерео режиме' : 'STEREO READER: Improve your vision while reading your favorite books in stereo mode',
    htmlAttrs: {
        lang
    }
});

function normalizeMarkdownPath(path: string) {

    return path.replaceAll('\\', '/').replace(/^\.?\//, '');
}

function findMarkdownPath(...paths: string[]) {

    const normalizedPaths = paths.map(normalizeMarkdownPath);
    return markdownKeys.find(key => {
        const normalizedKey = normalizeMarkdownPath(key);
        return normalizedPaths.some(path => normalizedKey === path || normalizedKey.endsWith(`/${path}`));
    });
}

function hasMarkdown(...paths: string[]) {

    return !!findMarkdownPath(...paths);
}

function getMarkdown(...paths: string[]) {

    const foundPath = findMarkdownPath(...paths);
    const markdown = foundPath ? foundMarkdown[foundPath] : '';
    if (!markdown) {
        throw createError({
            statusCode: 404,
            statusMessage: `Page not found: ${paths.join(' | ')}`
        });
    }
    return markdown;
}

function getDefaultPagePaths(page: string, targetLang = lang) {

    return targetLang === 'en' ? [`./content/${page}.md`] : [`./content/lang/${targetLang}/${page}.md`];
}

function getFolderIndexPaths(targetFolderSlug: string, targetLang = lang) {

    return targetLang === 'en'
        ? [`./content/${targetFolderSlug}/index.md`]
        : [`./content/${targetFolderSlug}/lang/${targetLang}/index.md`, `./content/lang/${targetLang}/${targetFolderSlug}/index.md`];
}

function findContent<T extends string[]>(...pages: T) {

    const out = {} as Record<T[number], string>;

    for (const page of pages) {
        out[page as any as T[number]] = getMarkdown(...getDefaultPagePaths(page)) as string;
    }
    return out;
}

const content = findContent('title', 'section1', 'modulations', 'section2', 'feature1', 'feature2', 'feature3', 'story', 'results', 'warning', 'app', 'goals', 'bates', 'join');
const titleContent = content.title;
const storyContent = folderPath ? getMarkdown(...getFolderIndexPaths(folderPath)) : '';
const storyChapters = folderPath
    ? storyContent
        .split(/(?=^## )/m)
        .map(chapter => chapter.trim())
        .filter(Boolean)
    : [];
const alternateLang = lang === 'en' ? 'ru' : 'en';
const alternateLangPaths = folderPath ? getFolderIndexPaths(folderPath, alternateLang) : getDefaultPagePaths('title', alternateLang);
const hasAlternateLang = hasMarkdown(...alternateLangPaths);
const alternateLangHref = alternateLang === 'en'
    ? folderPath ? `/stereo-reader/${folderPath}` : '/stereo-reader'
    : folderPath ? `/stereo-reader/${alternateLang}/${folderPath}` : `/stereo-reader/${alternateLang}`;

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

const titleHtml = computed(() => {
    let html = parseMarkdown(titleContent);
    if (folderPath) {
        html = html.replaceAll('h1', 'div');
    }
    return html;
});

</script>

<template>
    <!-- <div class="lang-switch">
        <nuxt-link :to="alternateLangHref" v-if="hasAlternateLang && lang === 'en'">Русский</nuxt-link>
        <nuxt-link :to="alternateLangHref" v-else-if="hasAlternateLang">English</nuxt-link>
    </div> -->
    <div class="cover">
        <al-cover :image-src="coverImg" v-transition-target="[$route.fullPath, 'cover']" />
        <div class="text" v-html="titleHtml">
        </div>
    </div>
    <!-- <div class="features" v-if="!folderPath">
        <feature-cmp :image-url="feature1Img" :src="content.feature1" />
        <feature-cmp :image-url="feature2Img" :src="content.feature2" />
        <feature-cmp :image-url="feature3Img" :src="content.feature3" />
    </div> -->
    <div class="story">
        <template v-if="folderPath">
            <div class="home">
                <nuxt-link to="/stereo-reader" v-if="lang !== 'ru'">Back to Stereo Reader home</nuxt-link>
                <nuxt-link to="/stereo-reader/ru" v-else>Назад на страницу Стерео Чтение</nuxt-link>
            </div>
            <h1>{{ storyChapters[0]?.replace('#', '').trim() }}</h1>
            <al-markdown class="chapter" :key="idx" :src="chapter"
                v-for="(chapter, idx) of storyChapters.slice(1)" />
        </template>
        <template v-else>
            <div class="hook">What is Stereo Reader?</div>
            <section-title title="Parallel-view reader" />
            <al-markdown class="chapter" :src="content.section1" />
            <iframe class="preview"
                src="https://aleklabs.dev/stereo-reader/app/#try"></iframe>

            <div class="preview-link" v-if="lang !== 'ru'">
                Read a book in stereo mode using parallel view<br />
                <a href="https://aleklabs.dev/stereo-reader/app/#try"
                    target="_blank">
                    Open in STEREO READER
                </a>
            </div>

            <section-title title="Eye trainer" style="margin-top:64px;" />
            <al-markdown class="chapter" :src="content.section2" />
            <iframe class="preview"
                src="https://aleklabs.dev/stereo-reader/app/#modulation:H4sIAAAAAAAAA81XS0skVxT%2BL7Vuwnk%2FeheyHjIky8FFjdY4TVpbuktDEP97OFeDVt8yMCQTslK%2BOve8H18%2FDuPN4f52Hra4Ge724x%2Bfx8vffr2bpquGPEzH0%2B5w2%2F7fzdPNadh%2Behzm3byfhu0wbIbxct49TMN2Pt5Pm%2BHmMO8Otz%2FdHwt6HK7uj%2BPcnjMAbIbT1%2FFuGrafYAM%2FAIAhemIkhSUbUUNJRM1BUDDNIhqoko7irposRs9guoariaCFM3OBqEQA5gYQbhZWIGGYO5pElh1pWFqosGIGeAA3QQ5TgSRR1zTTBkq4oguIIYVFaIGaqWwW6iSgAQ10IiYx9lSXFk2oaoB7GAYENL8zIz0BXDMTpbxBVEILARVwVPDCuAIWSExkDChfUMI4A4VdFSTbWzMzArVADIPKAoYqADCDMlJ4YQSK4CYsKC5A5TCRCluCeES53eTEhAMswBSRpVwmC9B0zvBI1SaWQJIAwa4RWtoYKRXVydINuHxjNkQM1zBJRGtimuZMAs6Syi1%2BDlYPgLBM8ywDAu7mVsUxbK0hTBgMBlH58AapuYkAkIqRY0GBoqgiomzpXKlUMAwBz2C0wPJCGRJQAp0BWq1UVYXJSEkEmkUNgPI7TTwySpWBsCaUIjTzUmUUgmxGlS%2FmLEgJlTMJEdii%2FDJXJUxXTgFubW0ZYiBkrQ24dDlBIhOSmVu2HLpQkHKYJde0FGSCwkzGECBYFj0q8DDKMtt6NKquKZDhytr8ChKoRjRQCKBqqRASrfxbq0eDDKBSyOwSAJWJaLVAEUOF9MpEJKmRM4JlUstEgnONTf1RpAo7CYnZgGpavKUwWYDTqSQcoPxKUQ82Tzczb7lPNWFzchAzkqbeNJ08HS0dWwOkC1uosrvwcxtmYHWfIrAztQWQ4fU0OJU0sLKaSUrlvWkYY5PKGlJOdnDV1iWZYcSBieH8PEeZGeJAYWQqL1Ir0MrDFfULJ%2FwdV5cBaR%2B29cnhPoXWJ5q7cqzULNcre1Z%2F7rsk%2B17idzpu2Zfeda%2Fgeo%2BfTUL08%2BL9VHE%2Fe9FN6MoYUzfsza3lSoj1vbG2XRYrqE3x2aLyfp9pv%2FXWdqP2G1S8X7TU72Pu13YL4Gy7W38DjPtTIe9dlMXlEaSVC9UfMqP%2B3rVrtLyL2q7x2f1syTy7s8j9PfaVu83dccd2es9YQCvOGV14llvyinanzglIvkdUlozG01e4z9%2BxpAWfcmk3ZZV7XWyG083hMH%2Fd3V4PW9gMV8fx9w%2BHqyJ6X%2B73%2B%2BFp88IVV%2FidCiwY3jcq%2B%2Fl22H4Z96dpM8zj8XqaTx%2FfUtH%2Bc6OhS%2B65uxq2w%2FV4N2yGq2k%2Fj8MWVyntaR6P88ev42lqju1uH6bj%2FOPbwF5MPX%2F58JbSti9Pm1fTf4mW7ctSMR1%2FOczjPL16Ed%2FdiTfxf97fH19NE%2F3btsvU00UZ%2F%2FbfAP5POmSpyuD%2F0W7%2Fbckvni6e%2FgTuywAdsA0AAA%3D%3D"></iframe>
            <div class="preview-link" v-if="lang !== 'ru'">
                Train your eye muscles with dynamic stereo modulation<br />
                <a href="https://aleklabs.dev/stereo-reader/app/#modulation:H4sIAAAAAAAAA81XS0skVxT%2BL7Vuwnk%2FeheyHjIky8FFjdY4TVpbuktDEP97OFeDVt8yMCQTslK%2BOve8H18%2FDuPN4f52Hra4Ge724x%2Bfx8vffr2bpquGPEzH0%2B5w2%2F7fzdPNadh%2Behzm3byfhu0wbIbxct49TMN2Pt5Pm%2BHmMO8Otz%2FdHwt6HK7uj%2BPcnjMAbIbT1%2FFuGrafYAM%2FAIAhemIkhSUbUUNJRM1BUDDNIhqoko7irposRs9guoariaCFM3OBqEQA5gYQbhZWIGGYO5pElh1pWFqosGIGeAA3QQ5TgSRR1zTTBkq4oguIIYVFaIGaqWwW6iSgAQ10IiYx9lSXFk2oaoB7GAYENL8zIz0BXDMTpbxBVEILARVwVPDCuAIWSExkDChfUMI4A4VdFSTbWzMzArVADIPKAoYqADCDMlJ4YQSK4CYsKC5A5TCRCluCeES53eTEhAMswBSRpVwmC9B0zvBI1SaWQJIAwa4RWtoYKRXVydINuHxjNkQM1zBJRGtimuZMAs6Syi1%2BDlYPgLBM8ywDAu7mVsUxbK0hTBgMBlH58AapuYkAkIqRY0GBoqgiomzpXKlUMAwBz2C0wPJCGRJQAp0BWq1UVYXJSEkEmkUNgPI7TTwySpWBsCaUIjTzUmUUgmxGlS%2FmLEgJlTMJEdii%2FDJXJUxXTgFubW0ZYiBkrQ24dDlBIhOSmVu2HLpQkHKYJde0FGSCwkzGECBYFj0q8DDKMtt6NKquKZDhytr8ChKoRjRQCKBqqRASrfxbq0eDDKBSyOwSAJWJaLVAEUOF9MpEJKmRM4JlUstEgnONTf1RpAo7CYnZgGpavKUwWYDTqSQcoPxKUQ82Tzczb7lPNWFzchAzkqbeNJ08HS0dWwOkC1uosrvwcxtmYHWfIrAztQWQ4fU0OJU0sLKaSUrlvWkYY5PKGlJOdnDV1iWZYcSBieH8PEeZGeJAYWQqL1Ir0MrDFfULJ%2FwdV5cBaR%2B29cnhPoXWJ5q7cqzULNcre1Z%2F7rsk%2B17idzpu2Zfeda%2Fgeo%2BfTUL08%2BL9VHE%2Fe9FN6MoYUzfsza3lSoj1vbG2XRYrqE3x2aLyfp9pv%2FXWdqP2G1S8X7TU72Pu13YL4Gy7W38DjPtTIe9dlMXlEaSVC9UfMqP%2B3rVrtLyL2q7x2f1syTy7s8j9PfaVu83dccd2es9YQCvOGV14llvyinanzglIvkdUlozG01e4z9%2BxpAWfcmk3ZZV7XWyG083hMH%2Fd3V4PW9gMV8fx9w%2BHqyJ6X%2B73%2B%2BFp88IVV%2FidCiwY3jcq%2B%2Fl22H4Z96dpM8zj8XqaTx%2FfUtH%2Bc6OhS%2B65uxq2w%2FV4N2yGq2k%2Fj8MWVyntaR6P88ev42lqju1uH6bj%2FOPbwF5MPX%2F58JbSti9Pm1fTf4mW7ctSMR1%2FOczjPL16Ed%2FdiTfxf97fH19NE%2F3btsvU00UZ%2F%2FbfAP5POmSpyuD%2F0W7%2Fbckvni6e%2FgTuywAdsA0AAA%3D%3D"
                    target="_blank">
                    Open in STEREO READER
                </a>
            </div>
            <al-markdown class="chapter" :src="content.story" />
            <al-markdown class="chapter" :src="content.results" />
            <al-markdown class="chapter" :src="content.app" />
            <al-markdown class="chapter" :src="content.modulations" />
            <al-markdown class="chapter" :src="content.goals" />
            <al-markdown class="chapter" :src="content.bates" />
            <al-markdown class="chapter" :src="content.warning" />
            <al-markdown class="chapter" :src="content.join" />
        </template>
    </div>

    <div class="footer">
        <div class="roadmap">
            <nuxt-link v-if="lang !== 'ru'" to='/stereo-reader/roadmap'>From Eye-Muscle Stretching to Stereo
                Reading:<br />My Roadmap of Functional Vision Sharpness</nuxt-link>
            <nuxt-link v-else to='/stereo-reader/ru/roadmap'>От растяжки глазных мышц к стерео-чтению:<br />моя
                дорожная карта Функциональной Резкости Зрения</nuxt-link>
        </div>
    </div>
</template>

<style scoped lang="scss">
.cover {

    border-radius: var(--border-radius) var(--border-radius) 0 0;
    overflow: hidden;
    margin-top: -48px;
    padding-block: 48px;

    position: relative;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: v-bind(stereoReaderCardBackground) center / cover no-repeat;
        opacity: 0.35;
        pointer-events: none;
    }

    > * {
        position: relative;
        z-index: 1;
    }
}

.hook {

    margin-bottom: 64px;
    text-align: center;
    line-height: 1em;

    color: #555;
    font-size: 48px;
    font-weight: 500;
    letter-spacing: 0.08em;
}

.preview {
    margin-top: 32px;
    width: 100%;
    aspect-ratio: 16/9;
    border: 1px #333 solid;
    border-radius: 5px;
    ;

    @media (width < 580px) {
        aspect-ratio: 9/16;
    }
}

.preview-link {
    text-align: center;
}

.home {
    margin-top: -32px;

    a {
        text-decoration: none;
    }

}

h1 {
    text-align: center;
}

.roadmap {
    display: flex;
    justify-content: center;

    a {
        text-decoration: none;
        text-align: center;
        width: min(500px, 100%);
        font-size: 20px;

        &:hover {
            text-decoration: underline;
        }
    }
}

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

        h1,
        div {
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
    margin-bottom: 0;
    background: #222;
    border-radius: 8px;
    padding: 16px;
    font-weight: 200;

    :deep(h2) {
        color: #888;
        //position: absolute;
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

    @media (max-width: 767px) {
        padding-inline: 0;
    }

}
</style>
