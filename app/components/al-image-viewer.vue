<script setup lang="ts">
const { src } = defineProps<{
    src: string
}>();

const fullSize = ref(false);
const scrollable = ref(false);
const $viewer = useTemplateRef('$viewer');
const $scroller = useTemplateRef('$scroller');
const $image = useTemplateRef('$image');

const shadowMaxSize = 12;
const shadowFadeDistance = 32;

let leftShadowSize = -1;
let rightShadowSize = -1;
let dragPointerId: number | undefined;
let dragStartX = 0;
let dragStartY = 0;
let dragStartScrollLeft = 0;
let dragStartScrollY = 0;
let dragged = false;
let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
    const scroller = $scroller.value;
    const image = $image.value;

    if (!scroller || !image) return;

    resizeObserver = new ResizeObserver(syncShadows);
    resizeObserver.observe(scroller);
    syncShadows();
    if (image.complete) initializeSize();
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    document.documentElement.classList.remove('image-viewer-dragging');
});

function toggleSize(event: MouseEvent): void {
    if (dragged && event.detail !== 0) return;

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

function startScrolling(event: PointerEvent): void {
    const scroller = $scroller.value;
    dragged = false;

    if (!fullSize.value || !scrollable.value || event.pointerType === 'touch' || event.button !== 0 || !scroller) return;

    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartScrollLeft = scroller.scrollLeft;
    dragStartScrollY = window.scrollY;
    scroller.setPointerCapture(event.pointerId);
}

function scrollWithDrag(event: PointerEvent): void {
    const scroller = $scroller.value;

    if (dragPointerId !== event.pointerId || !scroller) return;

    const distanceX = event.clientX - dragStartX;
    const distanceY = event.clientY - dragStartY;
    if (!dragged && Math.abs(distanceX) < 4 && Math.abs(distanceY) < 4) return;

    if (!dragged) {
        dragged = true;
        document.documentElement.classList.add('image-viewer-dragging');
    }
    scroller.scrollLeft = dragStartScrollLeft - distanceX;
    window.scrollTo({ top: dragStartScrollY - distanceY });
    event.preventDefault();
}

function stopScrolling(event: PointerEvent): void {
    const scroller = $scroller.value;

    if (dragPointerId !== event.pointerId || !scroller) return;

    dragPointerId = undefined;
    document.documentElement.classList.remove('image-viewer-dragging');
    if (scroller.hasPointerCapture(event.pointerId)) {
        scroller.releasePointerCapture(event.pointerId);
    }
}

function initializeSize(): void {
    const image = $image.value;

    if (!image) return;

    fullSize.value = image.getBoundingClientRect().width > image.naturalWidth * .8;
    void nextTick(syncShadows);
}
</script>

<template>
    <div ref="$viewer" class="image-viewer" :class="{ 'full-size': fullSize }">
        <div ref="$scroller" class="scroller" :class="{ 'full-size': fullSize, scrollable }" @scroll="syncShadows" @click="toggleSize"
            @pointerdown="startScrolling" @pointermove="scrollWithDrag" @pointerup="stopScrolling" @pointercancel="stopScrolling">
            <button type="button" aria-label="Toggle image size">
                <img ref="$image" :src alt="" draggable="false" @load="initializeSize" @transitionend="syncShadows">
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.image-viewer {
    --left-shadow-size: 0px;
    --right-shadow-size: 0px;

    interpolate-size: allow-keywords;
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
            cursor: zoom-in;

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

                &:active {
                    cursor: grabbing;
                }
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
                transition: width 200ms ease-out;

                @media (prefers-reduced-motion: reduce) {
                    transition: none;
                }
            }
        }
    }
}

@media (max-width: 719px) {
    :global(.article:has(.image-viewer.full-size)) {
        overflow: visible;
    }
}

:global(html.image-viewer-dragging),
:global(html.image-viewer-dragging *) {
    cursor: grabbing !important;
}
</style>
