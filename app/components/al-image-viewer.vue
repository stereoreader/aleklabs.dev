<script setup lang="ts">
const { src } = defineProps<{
    src: string
}>();

const fullSize = ref(false);
const scrollable = ref(false);
const $viewer = useTemplateRef('$viewer');
const $scroller = useTemplateRef('$scroller');

const shadowMaxSize = 12;
const shadowFadeDistance = 32;

let leftShadowSize = -1;
let rightShadowSize = -1;
let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
    if (!$scroller.value) return;

    resizeObserver = new ResizeObserver(syncShadows);
    resizeObserver.observe($scroller.value);
    syncShadows();
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
});

function toggleSize(): void {
    if (fullSize.value && $scroller.value) {
        $scroller.value.scrollLeft = 0;
    }

    fullSize.value = !fullSize.value;
    void nextTick(syncShadows);
}

function syncShadows(): void {
    const viewer = $viewer.value;
    const scroller = $scroller.value;

    if (!viewer || !scroller) return;

    const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    scrollable.value = maxScrollLeft > 0;
    const scrollLeft = Math.min(maxScrollLeft, Math.max(0, scroller.scrollLeft));
    const nextLeftShadowSize = Math.min(shadowMaxSize, scrollLeft * shadowMaxSize / shadowFadeDistance);
    const nextRightShadowSize = Math.min(shadowMaxSize, (maxScrollLeft - scrollLeft) * shadowMaxSize / shadowFadeDistance);

    if (leftShadowSize !== nextLeftShadowSize) {
        leftShadowSize = nextLeftShadowSize;
        viewer.style.setProperty('--left-shadow-size', `${leftShadowSize}px`);
    }

    if (rightShadowSize !== nextRightShadowSize) {
        rightShadowSize = nextRightShadowSize;
        viewer.style.setProperty('--right-shadow-size', `${rightShadowSize}px`);
    }
}
</script>

<template>
    <div ref="$viewer" class="image-viewer" :class="{ 'full-size': fullSize }">
        <div ref="$scroller" class="scroller" :class="{ 'full-size': fullSize, scrollable }" @scroll="syncShadows">
            <button type="button" aria-label="Toggle image size" @click="toggleSize">
                <img :src alt="" draggable="false" @load="syncShadows">
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.image-viewer {
    --left-shadow-size: 0px;
    --right-shadow-size: 0px;

    position: relative;
    width: 100%;

    @media (max-width: 719px) {
        &.full-size {
            left: calc(50% - 50vw);
            width: 100vw;
        }
    }

    &::before,
    &::after {
        content: '';
        position: absolute;
        z-index: 1;
        inset: 0;
        pointer-events: none;
    }

    &::before {
        box-shadow: inset var(--left-shadow-size) 0 var(--left-shadow-size) calc(-1 * var(--left-shadow-size)) #000;
    }

    &::after {
        box-shadow: inset calc(-1 * var(--right-shadow-size)) 0 var(--right-shadow-size) calc(-1 * var(--right-shadow-size)) #000;
    }

    .scroller {
        width: 100%;
        overflow-x: hidden;

        &.full-size {
            overflow-x: auto;

            button {
                width: max-content;
                cursor: zoom-out;

                img {
                    width: auto;
                    max-width: none;
                }
            }

            &.scrollable button {
                cursor: grab;
            }
        }

        button {
            display: block;
            width: 100%;
            padding: 0;
            border: 0;
            background: none;
            cursor: zoom-in;

            img {
                display: block;
                width: 100%;
                height: auto;
            }
        }
    }
}

@media (max-width: 719px) {
    :global(.article:has(.image-viewer.full-size)) {
        overflow: visible;
    }
}
</style>