<script setup lang="ts">

import CardCmp from './card.vue';
import { articles } from '@pages/experience/articles';

</script>

<template>
    <card-cmp v-for="page in articles" :title="page.title" :href="`/experience/${page.slug}`"
        :image-src="page.coverUrl">
        {{ page.description }}
    </card-cmp>
</template>