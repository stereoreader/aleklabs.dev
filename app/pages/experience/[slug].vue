<script setup lang="ts">

import ExperienceCmp from '../index/experience.vue';
import * as marked from 'marked';
import { useHomeData } from '../index/data';

const route = useRoute();

const slug = route.path.split('/').at(-1);

const { experience } = await useHomeData();

let { data: { value: article } } = await useAsyncData(`experience:${slug}`, async () => {
    const { articles } = await import('@pages/experience/articles');
    return articles.find(article => article.slug === slug);
});

if (!article) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Article not found',
        fatal: true
    });
}

useHead({ title: article.title, titleTemplate: '%s', });

const html = marked.parse(article.data);

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


</script>

<template>
    <div class="article" v-transition-target="[$route.fullPath, 'article']">
        <img :src="article.coverUrl" class="article-cover" v-transition-target="[$route.fullPath, 'cover']">
        <div class="article-experience">
            <experience-cmp exclude-current :articles="experience" />
        </div>

        <span v-html="html"></span>
    </div>
    <!-- <div class="links">
            <template v-if="article.devtoUrl">
                <a target="_blank" :href="`${article.devtoUrl}#comments`">Leave a comment on DEV.TO</a>
            </template>
</div> -->
</template>

<style scoped lang="scss">
.article {
    background-color: #111;
    padding: 32px;
    border-radius: 8px;
    color: #ccc;
    overflow: hidden;
}

.article-experience {
    margin-bottom: 40px;
}

.topbar {
    display: flex;
    gap: 32px;
    align-items: center;
    margin-bottom: 16px;

    a {
        display: flex;
        gap: 8px;
        align-items: center;
        ;

        img {
            width: 32px;
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

}
</style>
