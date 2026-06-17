<script setup lang="ts">
import * as marked from 'marked';

import coverUrl from './cover.png';
import markdown from './index.md?raw';

const title = 'Alek Labs Keyboard Layer';
const description = 'Alek Labs Keyboard Layer is an AutoHotkey command layer for Windows keyboards that improves programming and text editing productivity with ergonomic shortcuts for cursor navigation, selection, deletion, clipboard operations, undo, redo, and Enter while preserving the standard QWERTY layout.';

useHead({
    title,
    titleTemplate: '%s',
});

useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: coverUrl,
});

const html = marked.parse(markdown);
const stats = (() => {
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
    const minutes = words === 0 ? 0 : Math.ceil(words / 200);

    return {
        words,
        minutes,
    };
})();
</script>

<template>
    <div class="article">
        <img :src="coverUrl" :alt="title" class="article-cover">

        <div class="status">
            <span class="words">{{ stats.words }} words ~ {{ stats.minutes }} minutes</span>
        </div>

        <div class="video">
            <iframe src="https://www.youtube.com/embed/0xOTwnxID_I?si=Lxs2KaYW3ikEoPJq"
                title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <a target="_blank" href="https://www.youtube.com/watch?v=0xOTwnxID_I">Alek Labs Keyboard Layer demo / VS Code (Vue + TS) coding</a>
        </div>

        <span v-html="html"></span>
    </div>
</template>

<style scoped lang="scss">
.video {
    flex: 0 0 100%;
    width: 100%;
    margin-top: 32px;
    display: flex;
    flex-flow: column;
    gap: 16px;
    align-items: center;

    iframe {
        aspect-ratio: 16 / 9;
        width: 100%;
        max-width: 600px;
    }
}

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
    gap: 16px;
}
</style>

<style lang="scss">
.article {

    h1,
    h2,
    h3 {
        color: #ddd;
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
}
</style>
