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
    <div class="experience-cards" :class="{ 'experience-cards--compact': excludeCurrent }">
        <card-cmp v-for="page in visibleArticles" :title="page.title" :href="`/experience/${page.slug}`"
            :image-src="page.coverUrl">
            {{ page.description }}
        </card-cmp>
    </div>
</template>

<style scoped lang="scss">
.experience-cards {
    display: grid;
    gap: 32px;
}

.experience-cards--compact {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;

    :deep(.wrapper) {
        display: flex;
        flex: 0 0 calc((100% - 16px) / 2);
        min-width: 0;
    }

    :deep(.card) {
        display: block;
        flex: 1;
        min-height: 0;
        padding: 0;
    }

    :deep(.thumb) {
        display: block;
        margin: 0;
        width: 100%;
        aspect-ratio: 3 / 1;
    }

    :deep(.body) {
        padding: 12px;
    }

    :deep(.title) {
        margin: 0;
    }

    :deep(.description) {
        display: none;
    }

    @media (max-width: 760px) {
        :deep(.title) {
            font-weight: 400;
        }
    }

    @media (max-width: 560px) {
        flex-wrap: nowrap;

        :deep(.body) {
            padding: 6px 8px;
        }

        :deep(.title) {
            overflow: hidden;
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>
