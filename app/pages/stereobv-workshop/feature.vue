<script setup lang="ts">
defineProps<{
    src: string
    imageUrl: string
}>();
</script>

<template>
    <div class="feature">
        <img :src="imageUrl">
        <span v-html="parseMarkdown(src)">
        </span>
    </div>
</template>

<style scoped lang="scss">
.feature {
    background: #222;
    border-radius: 8px;
    padding: 16px;
    max-width: 250px;
    font-size: 12px;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 16px;

    @container main (max-width:600px) {
        max-width: 100%;
        flex-direction: row;

        align-items: flex-start;

        img {
            width: 33%;
        }
    }

    :deep(*) {

        p {
            margin: 0;
            padding: 0;
        }

        h2 {
            margin: 0;
            margin-bottom: 8px;
        }
    }

}

img {
    width: 100%;
    aspect-ratio: 250/167;
}
</style>