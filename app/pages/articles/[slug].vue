<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData(() => queryCollection('content').path(route.path).first())

if (!page.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Article not found',
        fatal: true
    });
}

</script>

<template>
    <NuxtLayout>
        <div class="article">
            <ContentRenderer :value="page" />
        </div>
    </NuxtLayout>
</template>
<style scoped lang="scss">
.article {
    background-color: #111;
    padding: 32px;
    border-radius: 4px;
    color: #ccc;
}


:deep(*) {

    h1,
    h2,
    h3 {
        color: #ddd;
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