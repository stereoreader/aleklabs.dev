<script setup lang="ts">

import { articles } from './articles';
import * as marked from 'marked';

const route = useRoute();

const slug = route.path.split('/').at(-1);

const article = articles.find(article => article.slug === slug);

if (!article) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Article not found',
        fatal: true
    });
}

useHead({ title: article.title, titleTemplate: '%s', });

const html = marked.parse(article.data);
const stats = getMarkdownReadingStats(article.data);

const icons = import.meta.glob('@pages/assets/icons/*.*',
    { query: '?url', eager: true, import: 'default' }) as Record<string, string>;

const links = article.readOn.map(link => {
    const title = new URL(link).hostname;
    const key = Object.keys(icons).find(key => key.includes(title));
    if (!key) {
        throw new Error(`Icon for ${title} not found`);
    }
    return {
        title,
        iconUrl: icons[key],
        link
    };
});

useSeoMeta({
    title: article.title,
    description: article.seoDescription,

    ogTitle: article.title,
    ogDescription: article.description,
    ogImage: article.coverUrl
});

type MarkdownReadingStats = {
    words: number;
    minutes: number;
};

function getMarkdownReadingStats(markdown: string, wordsPerMinute = 200): MarkdownReadingStats {
    const text = markdown
        .replace(/\r\n?/g, '\n')
        .replace(/^---[\s\S]*?\n---\s*/u, '')
        .replace(/```[\s\S]*?```/gu, ' ')
        .replace(/~~~[\s\S]*?~~~/gu, ' ')
        .replace(/`[^`\n]*`/gu, ' ')
        .replace(/<!--[\s\S]*?-->/gu, ' ')
        .replace(/<[^>]+>/gu, ' ')
        .replace(/!\[[^\]\n]*\]\([^)\n]*\)/gu, ' ')
        .replace(/\[([^\]\n]+)\]\([^)\n]*\)/gu, '$1')
        .replace(/^#{1,6}\s+/gmu, '')
        .replace(/^>\s?/gmu, '')
        .replace(/^[-*+]\s+/gmu, '')
        .replace(/^\d+[.)]\s+/gmu, '')
        .replace(/[*_~>#|[\](){}\\]/gu, ' ')
        .replace(/\s+/gu, ' ')
        .trim();

    const words = text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
    const minutes = words === 0 ? 0 : Math.ceil(words / wordsPerMinute);

    return {
        words,
        minutes,
    };
}

</script>

<template>
    <div class="topbar">
        <span class="label">Read on:</span>
        <a
            v-for="link of links"
            target="_blank"
            :href="link.link"><img :src="link.iconUrl"><span>{{ link.title }}</span></a>
    </div>
    <div class="article" v-transition-target="[$route.fullPath, 'article']">
        <img :src="article.coverUrl" class="article-cover" v-transition-target="[$route.fullPath, 'cover']">

        <div class="status"><span class="date">{{ Intl.DateTimeFormat('en-us', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(article.date) }}</span>
            <span class="words">{{ stats.words }} words ~ {{ stats.minutes }} minutes</span>
        </div>
        <span v-html="html"></span>
    </div>
</template>

<style scoped lang="scss">
.article {
    background-color: #111;
    padding: 32px;
    border-radius: 8px;
    color: #ccc;
    overflow: hidden;
}

.topbar {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;

    .label {
        font-size: smaller;
        color: #888;
    }

    a {
        display: flex;
        gap: 8px;
        align-items: center;
        ;

        img {
            width: 32px;
            filter: drop-shadow(0 0 4px rgba(255 255 255 / .3));
        }

        span {
            @media (max-width: 600px) {
                display: none;
            }
        }
    }
}

.status {
    display: flex;
    color: #999;
    gap: 16px
}
</style>

<style lang="scss">
.article {

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

    table {
        width: 100%;

        tr {

            --row-bg: #222;

            &:nth-child(odd) {
                background-color: var(--row-bg);
            }

            &:nth-child(even) {
                background-color: color-mix(in srgb, var(--row-bg) 95%, white 5%);
            }

            td,
            th {
                padding: 8px;
            }
        }
    }
}
</style>
