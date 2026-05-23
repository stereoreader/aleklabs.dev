<script setup lang="ts">

import CardCmp from './card.vue';
import { articles } from '@pages/articles';

</script>

<template>

    <card-cmp v-for="page in articles" :title="page.title" :href="`/articles/${page.slug}`"
        :image-src="page.coverUrl">
        <div>{{ page }}</div>
        {{ page.description }}
    </card-cmp>
</template>