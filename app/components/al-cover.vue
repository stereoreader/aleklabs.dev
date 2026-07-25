<script setup lang="ts">

import { vResizeHeight } from '@/utils/v-resize-height';

const props = defineProps<{
    imageSrc: string,
    text?: string
}>();

const $overlay = useTemplateRef('$overlay');

let interval: ReturnType<typeof setInterval>;
let screenImageWorker: Worker | undefined;
let screenImageObjectUrl: string | undefined;

const screenImageAbortController = new AbortController();
const screenImageAbortError = new Error('Cover background image load cancelled');

onMounted(async () => {

    const element = document.querySelector('.logo') as HTMLDivElement;

    interval = setInterval(() => {
        const active = Math.random() < 0.05;

        if (!active) {
            resetEffect();
            return;
        }

        const blur = random(0, 3);
        const brightness = random(1, 2);
        const contrast = random(0.8, 2.5);
        const hue = random(-40, 40);

        const s = random(.2, .5);
        const translateX = random(-8 * s, 8 * s);
        const scaleY = random(1 - .1 * s, 1 + .1 * s);
        const opacity = random(0.75, 1);

        element.style.filter = [
            `blur(${blur.toFixed(2)}px)`,
            `brightness(${brightness.toFixed(2)})`,
            `contrast(${contrast.toFixed(2)})`,
            `hue-rotate(${hue.toFixed(2)}deg)`
        ].join(' ');

        element.style.transform = [
            `translateX(${translateX.toFixed(2)}px)`,
            `scaleY(${scaleY.toFixed(3)})`
        ].join(' ');

        element.style.opacity = opacity.toFixed(2);

        const duration = random(40, 180);

        setTimeout(resetEffect, duration);

    }, 120);

    await waitForImages();

    if (screenImageAbortController.signal.aborted) {
        return;
    }

    try {
        const screenImagePayload = await new Promise<{ buffer: ArrayBuffer; type: string }>((resolve, reject) => {
            if (screenImageAbortController.signal.aborted) {
                reject(screenImageAbortError);
                return;
            }

            const worker = new Worker(new URL('./screen-image.worker.ts', import.meta.url), {
                type: 'module'
            });

            screenImageWorker = worker;

            function cleanup(): void {
                screenImageAbortController.signal.removeEventListener('abort', onAbort);

                if (screenImageWorker === worker) {
                    screenImageWorker = undefined;
                }

                worker.terminate();
            }

            function onAbort(): void {
                cleanup();
                reject(screenImageAbortError);
            }

            screenImageAbortController.signal.addEventListener('abort', onAbort, { once: true });

            worker.addEventListener('message', event => {
                cleanup();

                const data = event.data as { buffer?: unknown; type?: unknown; error?: unknown };

                if (data.buffer instanceof ArrayBuffer && typeof data.type === 'string') {
                    resolve({
                        buffer: data.buffer,
                        type: data.type
                    });
                    return;
                }

                reject(new Error(typeof data.error === 'string' ? data.error : 'Failed to load cover background image'));
            }, { once: true });

            worker.addEventListener('error', event => {
                cleanup();
                reject(event.error ?? new Error('Failed to load cover background image'));
            }, { once: true });
        });

        if (screenImageAbortController.signal.aborted) {
            return;
        }

        if (screenImageObjectUrl) {
            URL.revokeObjectURL(screenImageObjectUrl);
        }

        screenImageObjectUrl = URL.createObjectURL(new Blob([screenImagePayload.buffer], {
            type: screenImagePayload.type
        }));
        $overlay.value!.style.backgroundImage = `url(${screenImageObjectUrl})`;
    } catch (error) {
        if (screenImageAbortController.signal.aborted) {
            return;
        }

        console.error('[al-cover] Failed to load screen background image', error);
    }

    function resetEffect() {
        element.style.filter = '';
        element.style.transform = '';
        element.style.opacity = '';
    }

    function random(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }
});

onBeforeUnmount(() => {
    screenImageAbortController.abort();
    clearInterval(interval);
    screenImageWorker?.terminate();
    screenImageWorker = undefined;

    if (screenImageObjectUrl) {
        URL.revokeObjectURL(screenImageObjectUrl);
        screenImageObjectUrl = undefined;
    }
});

async function waitForImages(timeout = 10000): Promise<void> {
    const images = Array.from(document.images);

    if (images.length === 0) {
        return;
    }

    await new Promise<void>(resolve => {
        const cleanups: (() => void)[] = [];
        let remaining = images.length;
        let isResolved = false;

        const timeoutId = window.setTimeout(finish, timeout);

        for (const image of images) {
            waitForImage(image, markDone);
        }

        function markDone(): void {
            remaining -= 1;

            if (remaining === 0) {
                finish();
            }
        }

        function finish(): void {
            if (isResolved) {
                return;
            }

            isResolved = true;
            window.clearTimeout(timeoutId);

            for (const cleanup of cleanups) {
                cleanup();
            }

            resolve();
        }

        function waitForImage(image: HTMLImageElement, done: () => void): void {
            const loadingState = image.loading;

            if (isImageSettled(image, loadingState)) {
                done();
                return;
            }

            const onDone = function (): void {
                done();
            };

            image.addEventListener('load', onDone, { once: true });
            image.addEventListener('error', onDone, { once: true });

            cleanups.push(function (): void {
                image.removeEventListener('load', onDone);
                image.removeEventListener('error', onDone);
            });
        }

        function isImageSettled(image: HTMLImageElement, loadingState: string): boolean {
            void loadingState;

            if (!image.currentSrc && !image.src && !image.srcset) {
                return true;
            }

            return image.complete;
        }
    });
}


</script>

<template>
    <div class="logo">
        <img :src="imageSrc">
        <div class="overlay" ref="$overlay"></div>
        <div class="text" v-if="text">
            <al-logo :text />
        </div>
    </div>
</template>

<style scoped lang="scss">
.logo {

    border-radius: var(--border-radius);

    overflow: hidden;
    position: relative;

    transition:
        filter 40ms linear,
        transform 40ms linear,
        opacity 40ms linear;


    .text {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;


    }

    img {
        aspect-ratio: 16 / 9;
        width: 100%;
        animation: logo-animate 3s infinite alternate;

    }

    @keyframes logo-animate {
        from {
            filter: brightness(1);
        }

        to {
            filter: brightness(2);
        }
    }

    .overlay {
        position: absolute;
        z-index: 1;
        opacity: .05;
        inset: 0;
    }

}
</style>
