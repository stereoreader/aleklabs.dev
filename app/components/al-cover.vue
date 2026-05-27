<script setup lang="ts">

defineProps<{
    imageSrc: string
}>();

import screenImg from './screen.gif';

const $overlay = useTemplateRef('$overlay');



let interval: ReturnType<typeof setInterval>;

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

    $overlay.value!.style.backgroundImage = `url(${screenImg})`;

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
    clearInterval(interval);
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