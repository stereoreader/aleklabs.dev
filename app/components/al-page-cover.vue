<script setup lang="ts">

const props = defineProps<{
    imageSrc: string,
    text?: string,
    contentElement?: HTMLElement
}>();

const coverMaxWidth = 920;
const coverViewportGap = 32;

const maskHeight = ref(180);
const viewportWidth = ref(coverMaxWidth + coverViewportGap);
const adjustedMaskHeight = computed(() => {
    const coverWidth = Math.min(coverMaxWidth, Math.max(0, viewportWidth.value - coverViewportGap));

    return Math.round(maskHeight.value * coverWidth / coverMaxWidth);
});

const $cover = useTemplateRef('$cover');

onMounted(() => {
    window.addEventListener('resize', syncViewportWidth);
    window.addEventListener('scroll', syncMask, { passive: true });
    syncViewportWidth();
    syncMask();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', syncViewportWidth);
    window.removeEventListener('scroll', syncMask);
});

function syncViewportWidth() {

    viewportWidth.value = window.innerWidth;
}

function syncMask() {

    if (!$cover.value || !props.contentElement) return;

    const rectCover = $cover.value.getBoundingClientRect();
    const rectLinks = props.contentElement.getBoundingClientRect();
    const currentMaskHeight = Math.max(1, adjustedMaskHeight.value);

    const overlap = rectLinks.top - rectCover.bottom;

    const amount = overlap >= 0 ? 0 : Math.min(currentMaskHeight, Math.abs(overlap)) / currentMaskHeight;
    const opacity = overlap >= 32 ? 0 : Math.min(32, Math.abs(overlap)) / 32;

    $cover.value.style.setProperty('--mask-amount', amount + '');
    $cover.value.style.setProperty('--mask-bottom-opacity', (overlap < 16 ? 1 : 0) + '');
}

</script>

<template>

    <div class="cover-wrapper" ref="$cover">
        <al-cover class="cover" :image-src :text />
        <div class="logo-border"></div>
    </div>
</template>

<style scoped lang="scss">
.cover-wrapper {

    pointer-events: none;

    margin-bottom: 32px;

    background-color: var(--bg);

    --cover-width: min(920px, calc(100vw - 32px));
    --sticky-offset: clamp(72px, calc(var(--cover-width) * 0.228), 210px);

    width: 100vw;
    margin-left: calc(50% - 50vw);

    --mask-amount: 0;

    --mask-height: calc(1px * v-bind(adjustedMaskHeight));
    --mask-top-opacity: calc(.9 * var(--mask-amount));
    --mask-bottom-opacity: 0;

    z-index: 1000;
    position: sticky;
    top: calc(-1 * var(--sticky-offset));

    mask-image:
        linear-gradient(to bottom,
            rgb(0 0 0 / var(--mask-top-opacity)),
            rgb(0 0 0 / var(--mask-bottom-opacity))),
        linear-gradient(#000 0 0);
    mask-position:
        left bottom,
        0 0;
    mask-size:
        100% var(--mask-height),
        100% 100%;
    mask-repeat: no-repeat;
    mask-composite: exclude;

    display: flex;
    justify-content: center;

    .cover {
        margin-bottom: 0;
        width: var(--cover-width);
    }

    .logo-border {
        position: absolute;
        width: 100%;
        --height: 2px;
        height: var(--height);
        background: #4fc3ff;
        bottom: calc(var(--mask-height));
        width: var(--cover-width);
        opacity: calc(var(--mask-amount) * .4);
    }

}
</style>