<script setup lang="ts">

const route = useRoute();

if (!page.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Article not found',
        fatal: true
    });
}

useSeoMeta({
    title: page.value.title,
    description: page.value.description
})


</script>

<template>
    <template v-if="page">
        <NuxtLayout>
            <div class="article">
            </div>
            <div class="links">
                <template v-if="page.devtoUrl">
                    <a target="_blank" :href="`${page.devtoUrl}#comments`">Leave a comment on DEV.TO</a>
                </template>
            </div>
        </NuxtLayout>
    </template>
</template>
<style scoped lang="scss">
.article {
    background-color: #111;
    padding: 32px;
    border-radius: 8px;
    color: #ccc;
    overflow: hidden;
}

:deep(*) {

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
