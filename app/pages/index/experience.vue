<script setup lang="ts">

import CardCmp from './card.vue';
import { articles } from '@pages/experience/articles';

const props = withDefaults(defineProps<{
    excludeCurrent?: boolean,
}>(), {
    excludeCurrent: false,
});

const route = useRoute();

const visibleArticles = computed(() => {
    if (!props.excludeCurrent) {
        return articles;
    }

    const currentSlug = Array.isArray(route.params.slug)
        ? route.params.slug[0]
        : route.params.slug;

    if (!currentSlug) {
        return articles;
    }

    return articles.filter(page => page.slug !== currentSlug);
});

</script>

<template>
    <card-cmp v-for="page in visibleArticles" :title="page.title" :href="`/experience/${page.slug}`"
        :image-src="page.coverUrl">
        {{ page.description }}
    </card-cmp>
</template>