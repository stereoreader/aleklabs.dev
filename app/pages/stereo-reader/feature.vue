<script setup lang="ts">
defineProps<{
    title: string;
    imageUrl: string
}>();
</script>

<template>
    <div class="feature">
        <img :src="imageUrl">
        <h2>{{ title }}</h2>
        <slot />
    </div>
</template>

<style scoped lang="scss">
.feature {
    background: #222;
    border-radius: 8px;
    padding: 16px;
    max-width: 250px;
    font-size: 12px;
}

img {
    max-width: 100%;
}
</style>