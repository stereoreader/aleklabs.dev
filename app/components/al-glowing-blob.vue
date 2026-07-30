<script setup lang="ts">
const $root = useTemplateRef('$root');
const $blob = useTemplateRef('$blob');
let parentElement: HTMLElement | null = null;

onMounted(() => {

    parentElement = $root.value?.closest('[data-glowing-blob-parent]') as HTMLElement | null;

    if (!parentElement) {
        return;
    }

    parentElement.addEventListener('pointerenter', handlePointerEnter);
    parentElement.addEventListener('pointermove', handlePointerMove);
    parentElement.addEventListener('pointerleave', handlePointerLeave);
    resetBlobPosition();
});

onBeforeUnmount(() => {

    parentElement?.removeEventListener('pointerenter', handlePointerEnter);
    parentElement?.removeEventListener('pointermove', handlePointerMove);
    parentElement?.removeEventListener('pointerleave', handlePointerLeave);
    parentElement = null;
});

function handlePointerEnter(event: PointerEvent): void {

    moveBlob(event.clientX, event.clientY);
}

function handlePointerMove(event: PointerEvent): void {

    moveBlob(event.clientX, event.clientY);
}

function handlePointerLeave(): void {

    resetBlobPosition();
}

function resetBlobPosition(): void {

    if (!$blob.value || !parentElement) {
        return;
    }

    $blob.value.animate(
        {
            left: `${parentElement.clientWidth / 2}px`,
            top: `${parentElement.clientHeight / 2}px`,
        },
        {
            duration: 3000,
            fill: 'forwards',
        }
    );
}

function moveBlob(clientX: number, clientY: number): void {

    if (!$blob.value || !parentElement) {
        return;
    }

    const { left, top } = parentElement.getBoundingClientRect();

    $blob.value.animate(
        {
            left: `${clientX - left}px`,
            top: `${clientY - top}px`,
        },
        {
            duration: 3000,
            fill: 'forwards',
        }
    );
}
</script>

<template>
    <div ref="$root" class="blob-background" aria-hidden="true">
        <div class="surface">
            <div ref="$blob" class="blob"></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.blob-background {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .surface {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;

        .blob {
            position: absolute;
            left: 50%;
            top: 50%;
            width: clamp(220px, 55%, 420px);
            aspect-ratio: 1;
            translate: -50% -50%;
            border-radius: 50%;
            background: linear-gradient(to right, aquamarine, mediumpurple);
            animation: rotate 20s linear infinite;
            opacity: .2;
            filter: blur(70px);
            will-change: left, top, transform;
        }
    }
}

@keyframes rotate {
    from {
        rotate: 0deg;
    }

    50% {
        scale: 1 1.5;
    }

    to {
        rotate: 360deg;
    }
}
</style>
