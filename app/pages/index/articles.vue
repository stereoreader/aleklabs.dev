<script setup lang="ts">

import CardCmp from './card.vue';
import { type Article } from '@pages/experience/articles';

const { articles } = defineProps<{
    articles: Pick<Article, 'slug' | 'coverUrl' | 'description' | 'title'>[]
}>();

</script>

<template>
    <card-cmp v-for="page in articles" :title="page.title" :href="`/articles/${page.slug}`"
        :image-src="page.coverUrl">
        {{ page.description }}
    </card-cmp>
</template>