<script setup lang="ts">
import { articles } from './articles';
</script>

<template>
    <NuxtLayout>
        <main class="articles">
            <h1>Articles</h1>

            <article v-for="article in articles" :key="article.slug" class="article">
                <NuxtLink :to="`/articles/${article.slug}`">
                    {{ article.title }}
                </NuxtLink>

                <p v-if="article.description">
                    {{ article.description }}
                </p>
            </article>
        </main>
    </NuxtLayout>
</template>

<style scoped lang="scss">
.articles {
    display: grid;
    gap: 24px;
}

.article {
    display: grid;
    gap: 8px;
}
</style>