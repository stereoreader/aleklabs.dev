<script setup lang="ts">

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

</script>

<template>
    <div class="cover">
        <div class="logo">
            <img src="./assets/logo.svg">
            <div id="overlay"></div>
        </div>
        <div>
            <h1>STEREO READER</h1>
            <div class="promo"> Train or relax your eyes while reading your favorite books</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.cover {
    
    display: flex;
    gap: 32px;

    h1 {
        font-weight: 400;
        font-size: 48px;
        margin: 0 !important;
        margin-bottom: 32px;
    }

    .promo {
        font-size: 20px
    }

    * {
        flex-grow: 1;
    }
}

.logo {
    border-radius: var(--border-radius);
    overflow: hidden;
    margin-bottom: 32px;
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

    #overlay {
        position: absolute;
        z-index: 1;
        opacity: .05;
        background-image: url('../assets/screen.gif');
        inset: 0;
    }

}
</style>