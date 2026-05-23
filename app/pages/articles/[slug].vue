<script setup lang="ts">

import { articles } from './index';
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

const html = marked.parse(article.data);
const stats = getMarkdownReadingStats(article.data);

useSeoMeta({
    title: article.title,
    description: article.seoDescription
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
    <NuxtLayout>
        <div class="article">
            <img :src="article.coverUrl" class="article-cover">
            <div class="status"><span class="date">{{ Intl.DateTimeFormat('en-us', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(article.date) }}</span>
                <span class="words">{{ stats.words }} words ~ {{ stats.minutes }} minutes</span>
            </div>
            <span v-html="html"></span>
        </div>
        <div class="links">
            <template v-if="article.devtoUrl">
                <a target="_blank" :href="`${article.devtoUrl}#comments`">Leave a comment on DEV.TO</a>
            </template>
        </div>
    </NuxtLayout>
</template>

<style scoped lang="scss">
.article {
    background-color: #111;
    padding: 32px;
    border-radius: 8px;
    color: #ccc;
    overflow: hidden;
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
}
</style>
