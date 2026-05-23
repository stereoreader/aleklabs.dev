<script setup lang="ts">
defineProps<{
    href: string,
    title: string,
    imageSrc: string,
}>();
</script>

<template>
    <a class="card" :href>
        <img class="thumb" :src="imageSrc" :alt="title">
        <div>
            <h2 class="title">{{ title }}</h2>
            <p class="description">
                <slot />
            </p>
        </div>
    </a>
</template>

<style scoped lang="scss">
.card {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 22px;
    align-items: center;
    min-height: 150px;
    padding: 16px;
    border-radius: var(--border-radius);
    background: var(--panel);
    color: inherit;
    text-decoration: none;
}

.card:hover,
.card:focus-visible {
    background: var(--panel-hover);
    outline: none;
    box-shadow: 0 0 48px rgba(255, 255, 255, .05);
}

.thumb {
    width: 100%;
    height: 126px;
    object-fit: cover;
    border-radius: 10px;
    background: #050506;
}

.title {
    margin: 0 0 8px;
    font-size: 19px;
    line-height: 1.2;
    font-weight: 700;
}

.description {
    max-width: 560px;
    margin: 0;
    color: var(--muted);
    font-size: 14px;
}

@media (max-width: 680px) {
    main {
        width: min(100% - 24px, 920px);
        padding: 28px 0;
    }

    .card {
        grid-template-columns: 1fr;
        gap: 14px;
    }

    .thumb {
        height: auto;
        aspect-ratio: 16 / 9;
    }
}
</style>