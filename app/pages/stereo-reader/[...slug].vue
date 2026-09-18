<script setup lang="ts">

import feature1Img from './assets/feature-read.png?w=250';
import feature2Img from './assets/feature-relax.png?w=250';
import feature3Img from './assets/feature-train.png?w=250';
import faceDownImg from './assets/face-down.png?w=400';
import SectionTitle from './section-title.vue';
import { parse as parseYaml } from 'yaml';
import { $t, loadLang, supportedLocales } from './lang';
import flagDe from './assets/flags/de.svg';
import flagEn from './assets/flags/en.svg';
import flagEs from './assets/flags/es.svg';
import flagFr from './assets/flags/fr.svg';
import flagHe from './assets/flags/he.svg';
import flagIt from './assets/flags/it.svg';
import flagRu from './assets/flags/ru.svg';

import stereoReaderCardBg from '../assets/stereo-reader-card-bg.png';
const stereoReaderCardBackground = `url("${stereoReaderCardBg}")`;

const langs = [
    { id: 'en', title: 'English', flag: flagEn },
    { id: 'de', title: 'Deutsch', flag: flagDe },
    { id: 'es', title: 'Español', flag: flagEs },
    { id: 'fr', title: 'Français', flag: flagFr },
    { id: 'he', title: 'עברית', flag: flagHe },
    { id: 'it', title: 'Italiano', flag: flagIt },
    { id: 'ru', title: 'Русский', flag: flagRu }
];


const foundMarkdown = import.meta.glob('./content/**/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;

const route = useRoute();
const routeSlug = Array.isArray(route.params.slug) ? route.params.slug : route.params.slug ? [route.params.slug] : [];
const slugParts = routeSlug.flatMap(part => part.split('/')).filter(Boolean);
const markdownKeys = Object.keys(foundMarkdown);

let lang = 'en';
let folderPath = '';

if (slugParts[0] && slugParts[0].length === 2 && supportedLocales.has(slugParts[0])) {
    lang = slugParts[0];
    folderPath = slugParts.slice(1).join('/');
} else {
    folderPath = slugParts.join('/');
}

await loadLang(lang);
const localePath = lang === 'en' ? '' : `/${lang}`;

function hrefForLocale(targetLang: string) {

    const path = targetLang === 'en' ? '' : `/${targetLang}`;
    return `/stereo-reader${path}${folderPath ? `/${folderPath}` : ''}`;
}

useHead({
    title: $t('STEREO READER: Improve your vision while reading your favorite books in stereo mode'),
    htmlAttrs: {
        lang,
        dir: lang === 'he' ? 'rtl' : 'ltr'
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

const content = findContent('title', 'parallelview', 'section1', 'section2', 'feature1', 'feature2', 'feature3', 'story', 'results', 'warning', 'app', 'goals', 'bates', 'join', 'file-privacy');
const trainingPositionHeading = $t('Recommended training position');
const section2Content = content.section2.replace(
    `### ${trainingPositionHeading}`,
    `### ${trainingPositionHeading}\n\n![${$t('Face-down Stereo Reader training position')}](${faceDownImg}){.image-left}`
);
const titleContent = content.title;
const storyContent = folderPath ? getMarkdown(...getFolderIndexPaths(folderPath)) : '';
const storyChapters = folderPath
    ? storyContent
        .split(/(?=^## )/m)
        .map(chapter => chapter.trim())
        .filter(Boolean)
    : [];
const seoSource = getMarkdown(...getDefaultPagePaths('_seo-meta')).replace(/^\uFEFF/u, '').replace(/\r\n?/g, '\n');
const seoMatch = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/u.exec(seoSource);
const seoMeta = parseYaml(seoMatch?.[1] ?? seoSource) as { description?: string };

import coverImg from './assets/logo.svg';
import FeatureCmp from './feature.vue';

useSeoMeta({
    description: seoMeta.description,
    ogDescription: seoMeta.description,
    ogImage: new URL('./assets/logo.jpg', import.meta.url).pathname
});

const titleHtml = computed(() => {
    let html = parseMarkdown(titleContent);
    if (folderPath) {
        html = html.replaceAll('h1', 'div');
    }
    return html;
});

const trainingUrl = `https://stereo.aleklabs.dev/#training:H4sIAAAAAAAACu1cS28jxxH%2BL5MrLVR1vXmzN0GQwyIL28ghhg5ccbQiQj1ADtcIDP33oJuiNC9Jjixqsd4BDxJ7qrvrq6quqq5uzm%2FValnNYVY1q2ZdV%2FOqmlUfP727Xl9vqnn1F3JCiWpWNZvF1XbVrK6v%2FrrbLPLfao4AMKvqq%2BXPq8u6mmMCKC2Ly%2BvdVVPN4URn1c168d%2BPi7P%2F%2FHRT18tqjrPqZlOf15tNvXwYSe967rb1h%2BHT88V6W8%2Bqy%2Bvlbl2attX8l98K4%2FvhtnVTze8bDkje39N3Mck5CWk1qxZnZ%2FV2m7m62q3Xs2qxXOYvVYKk30F8h%2FYz%2BlxoznZi6v%2BuCg%2Br89UYFc%2FJTkg5U23rdX3WZKo71m%2Fqq%2BXq6tNPi891Nf%2FtdlYt63XdrK4%2BjYDLSA4SxIH8ikw%2F15vtXgOzatXUl3%2FfXO9uslBO99878mkpdnHWrDIHzWZXpszTvdttClPVsqfX7cXipq7mv8AMTgBAES3QI7kGaUqlNTGLGjAyhqp7aRQOQzYTCWJN%2B8YwcRNlRnUjotyIkhKAmgK4qbrmxoSuZqjskefh0hbqwiQYDuZAhZBchSESi0moSmlkN0FjYMXk6i65USKEVF0sMYhDabSUKLGShRgXNC4iDmau6OBQ%2BI7wsAAwiQjkzA2iJFRnEAZDActtlAEzBAYSOmRekF0pHJlMBDhKX1XVBKKO6ApZCugiAEAEQpjcclsCQTBlYmRjSJnhlIRJA9jcM9uFjpXJQR1UEIkzy0kdJIzCzUOkkAUkDgAnE3fJoxGmEBRLGqZAmTciRUQ3ceVA1EImoUaJwYhDqOAnJzEHcI1QizwBg5maZuUoFtNgSugECp7lYaVJ1JQZIAlrMsxNjiwozCykYZRFKaDoDBZOqI6ZCyEIQHY0Aii6EhFhSpokMUOZURwg8x3K5uF5KAUmCcgDoarloTQ5I6mmLC%2BiyE2SUCgiIQKpZ77URBKGCQUDFbPWcFbgpMUMKI9lCQIpYVI1jSJD4%2BRJyFWD8mrJTcrIREkJHBjzjOYZuGuKPG2xUc96DYZwE5LClyeGbIgKAg4pm5RzYsny16KP0qQAWYRExg6QJeFFF8isKBCWJeGRRJMRgkakIokAo7xs8h%2FBlGFHwkSkkPJqsSLCIAYKS5nCADJfwWJOamGqakX2IcqklgxYNXEZXiUsWRhqGBYDCGNSFyEzpr0ZhmO2PkEgo1QcQLjlrk4hSRyzVCOSpMy9iithoYq8SCnIwESKlUS4JnIMdKP9OooIZ4PkmlT4jmqkaaTjyPAdJuwRVruAZAhbh8KhoQh1KGgaqGNEZzGu2Z7%2BaWglMbQlesTiunZpA%2BtlHLfx3krw4Xqx4aqi4drzwQodWcZpsNgLW12X4ON%2BY8y7dFxQWcU9R2VDfyZDrzfmG2XoQdmGjjYN%2FTEN3XYB0PPuOowBSsNQwY9FlE7kYUwjEWoYyDQN412JRt24KCUa9%2BJnEWYvziIN47GNxG0aBHcsobeXBRTl9NKFPV03ryhxqp%2BAxGOJSjejsbCR3OepLKmTTxmXmDKae53Oqu3l9XVzUXJImFXLzeLX99fLnOid79brquTS33%2FcXq93Tf2vxXpXb%2B9yzdtDgj6S%2BQlDJ%2Fd72TQ5vezO8s%2BHLP4%2BX%2F2xvqkXzbv7RLdZbD7VzfZDO99t9bt7XDLbbh6b89zq0%2BKmKml1s6jmPLbt2DaLTfPhYrGtC5LV1ed603zflsSBw%2FLkfTs73gvu9Ha2z6rTaFZ9n8k%2FklZTR7Q423%2ByZUpCtkSRlByKfwPM%2F6lDOEr24jTDWauLhQkrYMpOkbJ7nUGXglMwm0syBSPJtt0iKET5c4KkAgRq7DnyiN0NgCCePCVwcQ8xbU0BvekObdhvOwFAyeEkUfYJTlQ8W2c%2B1UAdb%2ByPlr00YUD2uxyQU5s%2B7N4oZU0%2FirLbM29BLCe%2BZaVazvGexNefG6EI6qBOpr2XaGl27xF%2BN6CsxQcdq%2ByTQGjLk0m8yOlIDgH%2FFP5guI1%2BFX8wG5358%2FZidd48TA5Hn%2FxAmmffXDeLpj767PeukF5SYOBXMKrnTVeOZrp32j6O5fY1iOlLWq%2B%2FbPK7EZ81H36J%2BbyGYp81n0NJ8itxfW0fcNHTIR7bCciL8iGbyoxTmXEqM05lxqnMOJUZpzLjVGacyozfSJnxK8utW9ujs%2Bv17vLqh%2FVu88Nivbg6a%2B3T9GhZ9untbavy2L3vkJ6%2F70CYzvHja993aFMd8b4DHv22A03bkGkbMm1Dpm3ItA2ZtiHTNmTahkzbkG9kG%2FInue2Axz%2FebJ8unOUh6s2PvWOqFx4UveyU6uN6t3mYOr36CVnR6TPXPZ7ZVth0SPX0Rvotraizh6b%2BHpqe30OnBYnB17qHPuHj%2F2aA%2B9voL%2Frp30R64093HVL6RiPWUxdTRn8adLSg1b%2FWcKQbguPR6hFfpyfyFdxTnCLXk7nXsa%2Bavuh%2BlU4afEqDb%2BQM%2Ftglpyl%2F%2FP9uyR3Nmz66DXr0JEiO7ddfdt9qOuiYDjqmg47poGM66JgOOqaDjumgYzro%2BFYOOr7eNP%2Bp%2B1ZH27a1asXcrxXz87VidlkSfRW1YjhxGnnFTHr7S1dPVm97z0%2FCkoomeY7wjpgVguwu2mef%2BlSPnDcAa5eqR5s9ghYHD0hqZcj2%2F88xNRi4%2FE7Uec9kDvoBd%2BMno0MzYGQXLHsO4IGmzcP9OM%2BJ5smKdXq1ivVrFBO%2FSL26W%2BZ72x9xPlYwfsui9aDAIl%2BoXP2HPMk3fe70reYPv2MpHb9W%2BMRSiuOtpJy6nLaj%2Fd8%2B11d34mnKW%2Frab%2BzTvVofqP%2BROckomvbz3hv%2B%2Bh3SQ4cDwUMPH%2BtBrR7e65F4rAc%2F9DgQ3PcgeAbGgeChxyjwFg7qI%2BdR5C0c3EfOo8hbOLiPXEaRt3BIH7mOIk89BXZ6jCJv4dA%2BchtF3sJhfeQ2iryFw%2FrIfRR5C4f3kcco8haO6COPUeQtHDGwdhiF3gJyT9HqMwq%2BvUSgjx5xFH57kWAf%2F%2F27NvtwTg8usb3wS0N%2BXv26WjYX%2BXWeHSEd7lHF7ent%2FwBMJxXJEVQAAA%3D%3D`;

</script>

<template>
    <!-- <div class="lang-switch">
        <nuxt-link :to="alternateLangHref" v-if="hasAlternateLang && lang === 'en'">Русский</nuxt-link>
        <nuxt-link :to="alternateLangHref" v-else-if="hasAlternateLang">English</nuxt-link>
    </div> -->
    <div class="cover">
        <div class="lang-switch" dir="ltr">
            <nuxt-link v-for="item of langs.filter(item => item.id !== lang)" :key="item.id" :to="hrefForLocale(item.id)" :title="item.title" :aria-label="item.title">
                <img :src="item.flag" :alt="item.title" width="32" height="21">
            </nuxt-link>
        </div>
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
                <nuxt-link :to="`/stereo-reader${localePath}`">{{ $t('Back to Stereo Reader home') }}</nuxt-link>
            </div>
            <h1>{{ storyChapters[0]?.replace('#', '').trim() }}</h1>
            <al-markdown class="chapter" :key="idx" :src="chapter"
                v-for="(chapter, idx) of storyChapters.slice(1)" />
        </template>
        <template v-else>

            <div class="hook" style="margin-bottom: 0">{{ $t('What is Parallel view?') }}</div>
            <al-markdown class="chapter" :src="content.parallelview" style="margin-top:32px" />
            <iframe class="video" src="https://www.youtube.com/embed/_HdoPnvChe0?si=Wq7je_dMPEFAiXU-"
                title="YouTube video player" frameborder="0" loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            <div class="preview-link">
                <a href="https://youtu.be/ikvzroKPpgI" target="_blank">{{ $t('Having trouble? Try another parallel-view tutorial.') }}</a>
            </div>

            <div class="hook" style="margin-top:48px">{{ $t('What is Stereo Reader?') }}</div>

            <section-title :title="$t('Eye trainer')" />
            <al-markdown class="chapter" :src="section2Content" />

            <iframe class="preview" loading="lazy" :src="trainingUrl"></iframe>
            <div class="preview-link">
                {{ $t('Train your eye muscles with dynamic stereo modulation') }}<br />
                <a :href="trainingUrl" target="_blank">{{ $t('Open in STEREO READER') }}</a>
            </div>

            <section-title :title="$t('Parallel-view reader')" style="margin-top:64px;" />
            <al-markdown class="file-privacy" :src="content['file-privacy']" />
            <al-markdown class="chapter" :src="content.section1" />
            <iframe class="preview" loading="lazy"
                src="https://stereo.aleklabs.dev/#try"></iframe>

            <div class="preview-link">
                {{ $t('Read a book in stereo mode using parallel view') }}<br />
                <a href="https://stereo.aleklabs.dev/#try"
                    target="_blank">
                    {{ $t('Open in STEREO READER') }}
                </a>
            </div>


            <al-markdown class="chapter" :src="content.story" />
            <al-markdown class="chapter" :src="content.results" />
            <al-markdown class="chapter" :src="content.app" />
            <al-markdown class="chapter" :src="content.goals" />
            <al-markdown class="chapter" :src="content.bates" />
            <al-markdown class="chapter" :src="content.warning" />
            <al-markdown class="chapter" :src="content.join" />
        </template>
    </div>

    <div class="footer">
        <div class="roadmap">
            <nuxt-link :to="`/stereo-reader${localePath}/roadmap`" v-html="$t('From Eye-Muscle Stretching to Stereo Reading:<br />My Roadmap of Functional Vision Sharpness')" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.video {
    aspect-ratio: 16/9;
    width: min(100%, 680px);
    margin-inline: auto;
    margin-top: 32px;
    display: block;
}

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

    &:dir(rtl)::before {
        transform: scaleX(-1);
    }

    > * {
        position: relative;
        z-index: 1;
    }
}

.hook {

    margin-top: 16px;
    margin-bottom: 48px;
    text-align: center;
    line-height: 1em;

    color: #aaa;
    text-shadow: 0 0 12px rgb(255 255 255 / .6);
    font-size: 32px;
    font-weight: 400;
    letter-spacing: 0.08em;

    &:dir(rtl) {
        letter-spacing: normal;
    }
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

.cover .lang-switch {
    position: absolute;
    font-size: smaller;
    --offset: 16px;
    top: var(--offset);
    inset-inline-end: var(--offset);
    z-index: 2;
    display: flex;
    direction: ltr;
    gap: 8px;
    flex-grow: 0;

    a {
        display: block;
        flex-grow: 0;
        width: 32px;
        height: 21px;
        padding: 0;
        opacity: 0.55;
        overflow: hidden;
        border-radius: 3px;
        color: inherit;
        font-weight: inherit;
        animation: none;
        box-shadow: 0 0 0 1px rgb(255 255 255 / .15);

        &:hover {
            opacity: 1;
        }

        img {
            display: block;
            flex-grow: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
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

    container-type: inline-size;
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
        inset-inline-start: 0;
        top: calc(-1 * var(--margin-top) + 8px);
        font-weight: normal;
        text-align: center;
        width: 100%;
    }

    :deep(h3) {
        font-weight: normal;
        color: white;
        font-size: 18px;
        text-align: center;
        padding-bottom: 8px;
        border-bottom: 1px solid #444;
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

    :deep(.statement) {
        max-width: 720px;
        margin: 40px auto;
        font-size: clamp(32px, 5cqw, 64px);
        line-height: 1.35;
        font-weight: 300;
        text-align: center;
        letter-spacing: 0.01em;
        text-shadow: 0 0 12px black;

        &:dir(rtl) {
            letter-spacing: normal;
        }
    }

    :deep(.image-left) {
        float: inline-start;
        width: min(45%, 400px);
        height: auto;
        margin-block: 0 16px;
        margin-inline: 0 24px;
        border-radius: 6px;

        @media (width < 450px) {
            float: none;
            width: 100%;
            margin-inline-end: 0;
        }
    }
}

.file-privacy {
    margin-top: 16px;
    margin-inline: auto;
    max-width: 42rem;
    padding: 14px 22px 16px;
    border-radius: 14px;
    text-align: center;
    font-size: 15px;
    line-height: 1.5;
    color: #b7ddd0;
    background:
        linear-gradient(#142a24, #101c19) padding-box,
        linear-gradient(110deg, #5ee0b8, #5aa0ff) border-box;
    border: 1px solid transparent;
    box-shadow: 0 0 16px rgb(80 220 180 / 14%);

    :deep(p) {
        margin: 0;

        + p {
            margin-top: 6px;
        }
    }

    :deep(strong) {
        color: #9ff3cc;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.03em;
    }

    &:dir(rtl) :deep(strong) {
        letter-spacing: normal;
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
