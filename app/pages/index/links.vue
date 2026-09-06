<script setup lang="ts">

const $parent = useTemplateRef('$links');
const $label = useTemplateRef('$label');

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

let interval: any;
const linkAnimations = new Map<Element, {
    $text: HTMLSpanElement;
    revealFrame: number;
    clearTimer?: ReturnType<typeof setTimeout>;
}>();
const flash = async (repeat = false) => {
    if (!$parent.value) return;

    const $links = $parent.value.querySelectorAll('a');

    for (const $link of $links) {
        $link.classList.add('flash');
        delay(150).then(() => $link.classList.remove('flash'));
        await delay(50);
    }

    if (repeat) {
        interval = setTimeout(() => flash(true), 5000 + 3000 * Math.random());
    }

};

onMounted(() => {

    setTimeout(() => flash(true), 200);

});

onBeforeUnmount(() => {
    clearTimeout(interval);
    for (const animation of linkAnimations.values()) {
        cancelAnimationFrame(animation.revealFrame);
        clearTimeout(animation.clearTimer);
    }
});

function onPointerOver(event: PointerEvent): void {

    const $link = (event.target as Element).closest('a');
    if (!$link || event.relatedTarget instanceof Node && $link.contains(event.relatedTarget)) return;

    const text = $link.querySelector(':scope > span')?.textContent;
    if (!$label.value || !text) return;

    let animation = linkAnimations.get($link);
    if (!animation) {
        const $text = document.createElement('span');
        $text.className = 'text measuring';

        for (const character of Array.from(text)) {
            const $character = document.createElement('span');
            $character.textContent = character;
            $text.append($character);
        }

        $label.value.append($text);
        const textRect = $text.getBoundingClientRect();
        for (const $character of Array.from($text.children) as HTMLElement[]) {
            const rect = $character.getBoundingClientRect();
            const angle = Math.random() * Math.PI * 2;
            $character.style.left = `${rect.left - textRect.left}px`;
            $character.style.top = `${rect.top - textRect.top}px`;
            $character.style.setProperty('--scatter-x', `${Math.cos(angle) * 200}px`);
            $character.style.setProperty('--scatter-y', `${Math.sin(angle) * 200}px`);
        }
        $text.style.width = `${textRect.width}px`;
        $text.style.height = `${textRect.height}px`;
        $text.style.left = `${-textRect.width / 2}px`;
        $text.style.top = `${-textRect.height}px`;
        $text.classList.remove('measuring');
        $text.classList.add('scattered');
        animation = { $text, revealFrame: 0 };
        linkAnimations.set($link, animation);
    }

    cancelAnimationFrame(animation.revealFrame);
    clearTimeout(animation.clearTimer);
    void animation.$text.offsetWidth;
    animation.revealFrame = requestAnimationFrame(() => {
        animation.$text.classList.add('animated');
        animation.revealFrame = requestAnimationFrame(() => animation.$text.classList.add('visible'));
    });
}

function onPointerOut(event: PointerEvent): void {

    const $link = (event.target as Element).closest('a');
    if (!$link || event.relatedTarget instanceof Node && $link.contains(event.relatedTarget)) return;

    const animation = linkAnimations.get($link);
    if (!animation) return;

    cancelAnimationFrame(animation.revealFrame);
    clearTimeout(animation.clearTimer);
    animation.$text.classList.remove('visible');
    animation.clearTimer = setTimeout(() => {
        animation.$text.remove();
        linkAnimations.delete($link);
    }, 600);
}

</script>

<template>

    <div class="links" ref="$links" @pointerover="onPointerOver" @pointerout="onPointerOut">
        <a href="https://www.linkedin.com/in/alexander-nenashev-930731288/" target="_blank">
            <img class="backlight" src="../assets/icons/linkedin.svg" aria-hidden="true">
            <img class="icon icon-scale-80" src="../assets/icons/linkedin.svg">
            <span>LinkedIn profile</span>
        </a>
        <a href="https://stackoverflow.com/users/14098260/alexander-nenashev" target="_blank">
            <img class="backlight" src="../assets/icons/stackoverflow.svg" aria-hidden="true">
            <img class="icon icon-scale-80" src="../assets/icons/stackoverflow.svg">
            <span>Stackoverflow profile</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bvue.js%5d%20or%20%5bvuejs3%5d&searchOn=3"
            target="_blank">
            <img class="backlight" src="../assets/icons/vue.svg" aria-hidden="true">
            <img class="icon" src="../assets/icons/vue.svg">
            <span>Vue SO answers</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bvite%5d%20&searchOn=3"
            target="_blank">
            <img class="backlight" src="../assets/icons/vite.svg" aria-hidden="true">
            <img class="icon icon-scale-90" src="../assets/icons/vite.svg">
            <span>Vite SO answers</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5btypescript%5d&searchOn=3"
            target="_blank">
            <img class="backlight" src="../assets/icons/typescript.svg" aria-hidden="true">
            <img class="icon" src="../assets/icons/typescript.svg">
            <span>Typescript SO answers</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bjavascript%5d&searchOn=3"
            target="_blank">
            <img class="backlight" src="../assets/icons/javascript.svg" aria-hidden="true">
            <img class="icon" src="../assets/icons/javascript.svg">
            <span>Javascript SO answers</span>
        </a>
        <a href="https://stackoverflow.com/search?tab=votes&q=user%3a14098260%20%5bcss%5d&searchOn=3"
            target="_blank">
            <img class="backlight" src="../assets/icons/css.svg" aria-hidden="true">
            <img class="icon icon-scale-85 icon-nudge-down" src="../assets/icons/css.svg">
            <span>CSS SO answers</span>
        </a>
        <div class="label" ref="$label" aria-hidden="true"></div>
    </div>

</template>

<style scoped lang="scss">
.links {
    --heartbeat-bpm: 60;
    --heartbeat-duration: calc(60s / var(--heartbeat-bpm));
    position: relative;
    justify-content: center;
    display: flex;
    gap: 32px;
    margin-bottom: 32px;

    .label {
        position: absolute;
        bottom: -42px;
        left: 50%;
        font-size: 24px;
        color: #888;
        pointer-events: none;

        :deep(.text) {
            position: absolute;
            white-space: pre;

            &.measuring {
                width: max-content;
            }

            > span {
                display: inline-block;
                opacity: 0;
            }

            &.scattered > span {
                position: absolute;
                transform: translate(var(--scatter-x), var(--scatter-y));
            }

            &.animated > span {
                transition: opacity 500ms ease, transform 600ms cubic-bezier(.22, 1, .36, 1);
            }

            &.visible > span {
                opacity: 1;
                transform: translate(0, 0);
            }
        }
    }

    a {
        opacity: .7;
        --border-radius: calc(var(--border-radius) / 2);
        --overflow: hidden;
        width: 64px;
        height: 64px;
        position: relative;
        transition: opacity 300ms, scale 300ms, transform 300ms;

        .backlight {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            object-fit: contain;
            filter: blur(12px) saturate(2) brightness(1.5);
            opacity: .3;
            pointer-events: none;
        }

        .icon {
            width: 100%;
            object-fit: contain;
            position: relative;
            z-index: 1;
            filter: saturate(.1);
        }


        span {
            display: none;
        }

        &:hover,
        &.flash {
            opacity: 1;
            background-color: transparent;

            .icon {
                animation: glow var(--heartbeat-duration) infinite linear;
                filter: drop-shadow(0 0 12px #4fc3ff);
                animation-delay: calc(var(--heartbeat-duration) * 0.07);
            }

            span {
                font-size: 12px;
                color: #bbb;
                //display: block;
                position: absolute;
                top: 64px;
                width: 300px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
            }
        }

        &:hover {
            scale: 1.1;
        }

        &.flash:not(:hover) {
            transform: scale(1.1);
        }

        &.flash span {
            display: none;
        }
    }

    &:has(a:hover) {
        a {
            --hover-distance: 6;
            opacity: calc(.75 - var(--hover-distance) * .08);
            scale: calc(1 - var(--hover-distance) * .05);

            &:hover {
                opacity: 1;
                scale: 1.2;
            }

            &:has(+ a:hover),
            &:hover + a {
                --hover-distance: 1;
            }

            &:has(+ a + a:hover),
            &:hover + a + a {
                --hover-distance: 2;
            }

            &:has(+ a + a + a:hover),
            &:hover + a + a + a {
                --hover-distance: 3;
            }

            &:has(+ a + a + a + a:hover),
            &:hover + a + a + a + a {
                --hover-distance: 4;
            }

            &:has(+ a + a + a + a + a:hover),
            &:hover + a + a + a + a + a {
                --hover-distance: 5;
            }
        }
    }
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