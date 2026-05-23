<script setup lang="ts">

import CardCmp from './card.vue';

const { data: pages } = await useAsyncData('articles-list', () => {
    return queryCollection('articles')
        .select('path', 'title', 'description', 'date', 'imageUrl', 'tags')
        .order('date', 'DESC')
        .all();
});
</script>

<template>

    <card-cmp v-for="page in pages" :title="page.title" :href="page.path" :image-src="page.imageUrl">
        <div>{{ page }}</div>
        {{ page.description }}
    </card-cmp>
</template>