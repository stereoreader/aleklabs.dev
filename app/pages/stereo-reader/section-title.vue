<script setup lang="ts">
defineProps<{
    title: string
}>();
</script>

<template>
    <div class="title">
        <span>{{ title }}</span>
    </div>
</template>

<style scoped lang="scss">
.title {

    width: fit-content;
    max-width: 100%;
    margin-inline: auto;

    font-weight: 200;
    font-size: 32px;

    text-transform: uppercase;
    counter-increment: section;

    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;

    min-height: 72px;
    padding: 10px 24px;

    border: 3px solid transparent;
    border-radius: 36px;

    background:
        linear-gradient(110deg, #222, #111) padding-box,
        linear-gradient(110deg, #8aefff, #8d9cff 50%, #c991ff) border-box;

    box-shadow:
        0 0 8px rgb(120 220 255 / 25%),
        0 0 24px rgb(130 150 255 / 15%),
        inset 0 0 18px rgb(130 200 255 / 5%);


    &::before {
        content: counter(section);

        display: grid;
        place-items: center;
        flex: none;

        width: 42px;
        height: 42px;

        border-radius: 50%;
        background: linear-gradient(135deg, #92efff, #918cff);
        box-shadow:
            0 0 8px rgb(130 220 255 / 50%),
            0 0 18px rgb(140 130 255 / 30%);

        color: #111;
        font-size: 20px;
        font-weight: normal;
    }
}
</style>