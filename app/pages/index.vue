<script setup lang="ts">
let cleanupLinks: (() => void) | undefined;

onMounted(async () => {

    const element = document.querySelector('.logo') as HTMLDivElement;

    setInterval(() => {
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
    //const { mountHeartbeatLinks } = await import('./index/links.client');
    //cleanupLinks = mountHeartbeatLinks();
});

onBeforeUnmount(() => {
    //cleanupLinks?.();
    //cleanupLinks = undefined;
});

</script>

<template>
    <main>
        <div class="logo">
            <img src="./assets/logo.jpg">
            <div id="overlay"></div>
        </div>
        <div class="links">
            <canvas id="heartbeat"></canvas>
            <a href="https://www.linkedin.com/in/alexander-nenashev-930731288/" target="_blank">
                <img class="icon-scale-80" src="./assets/icons/linkedin.svg">
                <span>My LinkedIn profile</span>
            </a>
            <a href="https://stackoverflow.com/users/14098260/alexander-nenashev" target="_blank">
                <img class="icon-scale-80" src="./assets/icons/stackoverflow.svg">
                <span>My Stackoverflow profile</span>
            </a>
            <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bvue.js%5d%20or%20%5bvuejs3%5d&searchOn=3"
                target="_blank">
                <img src="./assets/icons/vue.svg">
                <span>My Vue SO answers</span>
            </a>
            <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bvite%5d%20&searchOn=3"
                target="_blank">
                <img class="icon-scale-90" src="./assets/icons/vite.svg">
                <span>My Vite SO answers</span>
            </a>
            <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5btypescript%5d&searchOn=3"
                target="_blank">
                <img src="./assets/icons/typescript.svg">
                <span>My Typescript SO answers</span>
            </a>
            <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bjavascript%5d&searchOn=3"
                target="_blank">
                <img src="./assets/icons/javascript.svg">
                <span>My Javascript SO answers</span>
            </a>
            <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bcss%5d&searchOn=3"
                target="_blank">
                <img class="icon-scale-85 icon-nudge-down" src="./assets/icons/css.svg">
                <span>My CSS SO answers</span>
            </a>
        </div>
        <section class="tools" aria-label="Productivity tools">
            <a class="card" href="/stereo-reader">
                <img class="thumb" src="./assets/stereo-reader-preview.jpg" alt="Stereo Reader preview">
                <div>
                    <h2 class="title">Stereo Reader</h2>
                    <p class="description">A reader aimed to improve vision by training or relaxing your eyes while
                        reading books. Supports text, PDF, EPUB, and FB2 files in stereo or mono mode.</p>
                </div>
            </a>

            <a class="card"
                href="https://chromewebstore.google.com/detail/youtube-send-to-ai-chat/jfclfogdljgmnbbkdpkbnmfkfaahelhp">
                <img class="thumb" src="./assets/youtube-send-to-ai-chat.png" alt="Youtube: Send to AI chat preview">
                <div>
                    <h2 class="title">Youtube: Send to AI chat</h2>
                    <p class="description">A browser extension that sends YouTube transcripts to AI chats for
                        timestamped summaries, Q&amp;A, inline video playback, clickable timestamp navigation, and
                        customizable prompts.</p>
                </div>
            </a>
        </section>
    </main>
</template>

<style scoped lang="scss">
main {
    width: min(920px, calc(100% - 32px));
    margin: 0 auto;
    padding: 48px 0;
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
        background-image: url('./assets/screen.gif');
        inset: 0;
    }


}

.tools {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

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


.links {
    --heartbeat-bpm: 60;
    --heartbeat-duration: calc(60s / var(--heartbeat-bpm));
    position: relative;
    justify-content: center;
    display: flex;
    gap: 32px;
    margin-bottom: 32px;
}

.links a {
    filter: saturate(0);
    opacity: .7;
    --border-radius: calc(var(--border-radius) / 2);
    --overflow: hidden;
    width: 64px;
    height: 64px;
    transition: transform .3s;
}

.links a span {
    display: none;
}

.links a:hover {
    filter: saturate(var(--saturate-base));
    opacity: 1;
    transform: scale(1.1);
    background-color: transparent;
    animation: glow var(--heartbeat-duration) infinite linear;
    filter: drop-shadow(0 0 12px #4fc3ff);
    animation-delay: calc(var(--heartbeat-duration) * 0.07);
}

.links a:hover span {
    font-size: 12px;
    color: #bbb;
    display: block;
    position: absolute;
    top: 64px;
    width: 300px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
}


@keyframes glow {
    0% {
        filter:
            saturate(var(--saturate-base)) drop-shadow(0 0 12px #4fc3ff);
    }

    8% {
        filter:
            saturate(calc(var(--saturate-base) + (1 - var(--saturate-base)) * 0.5)) drop-shadow(0 0 18px #a88cb3);
    }

    16% {
        filter:
            saturate(calc(var(--saturate-base) + (1 - var(--saturate-base)) * 0.2)) drop-shadow(0 0 13px #6bb7eb);
    }

    24% {
        filter:
            saturate(1) drop-shadow(0 0 24px #ff0000);
    }

    36% {
        filter:
            saturate(calc(var(--saturate-base) + (1 - var(--saturate-base)) * 0.3)) drop-shadow(0 0 14px #4fc3ff);
    }

    100% {
        filter:
            saturate(var(--saturate-base)) drop-shadow(0 0 12px #4fc3ff);
    }
}

.links a img {
    width: 100%;
    object-fit: contain;
}

.links canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: none;
}

.icon-scale-80 {
    transform: scale(.8);
}

.icon-scale-85 {
    transform: scale(.85);
}

.icon-scale-90 {
    transform: scale(.9);
}

.icon-nudge-down {
    position: relative;
    top: 2px;
}
</style>
