<script setup lang="ts">

const $parent = useTemplateRef('$links');
const $label = useTemplateRef('$label');

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

let interval: any;
let hoveredLink: Element | null = null;
let activeLink: Element | null = null;
const linkPool: Element[] = [];
const linkAnimations = new Map<Element, {
    $text: HTMLAnchorElement;
    revealFrame: number;
    clearTimer?: ReturnType<typeof setTimeout>;
}>();
const flash = async (repeat = false) => {
    if (!$parent.value) return;

    const $links = $parent.value.querySelectorAll(':scope > a');
    if (!$links.length) return;

    if (!hoveredLink) {
        setActive(null);
    }

    if (!linkPool.length) {
        linkPool.push(...$links);
    }
    const $selected = linkPool.splice(Math.floor(Math.random() * linkPool.length), 1)[0];

    for (const $link of $links) {
        $link.classList.add('flash');
        delay(150).then(() => $link.classList.remove('flash'));
        if ($link === $selected) {
            if (hoveredLink) {
                linkPool.push($selected);
            }
            else {
                setActive($selected);
            }
        }
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
    if ($link.closest('.label')) {
        hoveredLink = activeLink;
        return;
    }

    hoveredLink = $link;
    setActive($link);
}

function onPointerOut(event: PointerEvent): void {

    const $link = (event.target as Element).closest('a');
    if (!$link || event.relatedTarget instanceof Node && $link.contains(event.relatedTarget)) return;

    const $next = event.relatedTarget instanceof Element ? event.relatedTarget.closest('a') : null;
    if ($next && $parent.value?.contains($next)) return;

    hoveredLink = null;
}

function setActive($link: Element | null): void {

    if (activeLink === $link) return;

    if (activeLink) {
        activeLink.classList.remove('active');
        hideLinkText(activeLink);
    }
    activeLink = $link;
    if (!$link) return;

    $link.classList.add('active');
    showLinkText($link);

    function hideLinkText($target: Element): void {

        const animation = linkAnimations.get($target);
        if (!animation) return;

        cancelAnimationFrame(animation.revealFrame);
        clearTimeout(animation.clearTimer);
        animation.$text.classList.remove('visible');
        animation.clearTimer = setTimeout(() => {
            animation.$text.remove();
            linkAnimations.delete($target);
        }, 600);
    }

    function showLinkText($target: Element): void {

        const text = $target.querySelector(':scope > span')?.textContent;
        if (!$label.value || !text) return;

        let animation = linkAnimations.get($target);
        if (!animation) {
            const $text = document.createElement('a');
            $text.className = 'text measuring';
            if ($target instanceof HTMLAnchorElement) {
                $text.href = $target.href;
                $text.target = $target.target;
            }
            $text.setAttribute('aria-label', text);

            for (const character of Array.from(text)) {
                const $character = document.createElement('span');
                $character.textContent = character;
                $text.append($character);
            }

            $label.value.append($text);
            const $characters = Array.from($text.children) as HTMLElement[];
            const textRect = $text.getBoundingClientRect();
            const fontSize = parseFloat(getComputedStyle($text).fontSize) || 1;
            const boxCenter = textRect.left + textRect.width / 2;
            const fromCenter: number[] = [];
            let maxDist = 0;
            for (const $character of $characters) {
                const rect = $character.getBoundingClientRect();
                const dist = Math.abs(rect.left + rect.width / 2 - boxCenter);
                fromCenter.push(dist);
                if (dist > maxDist) maxDist = dist;
                const angle = Math.random() * Math.PI * 2;
                $character.style.left = `${(rect.left - textRect.left) / textRect.width * 100}%`;
                $character.style.top = `${(rect.top - textRect.top) / textRect.height * 100}%`;
                $character.style.setProperty('--scatter-x', `${Math.cos(angle) * 200}px`);
                $character.style.setProperty('--scatter-y', `${Math.sin(angle) * 200}px`);
            }
            for (let i = 0; i < $characters.length; i++) {
                $characters[i].style.setProperty('--from-center', maxDist ? String(fromCenter[i] / maxDist) : '0');
            }
            const waveMs = 300;
            $text.style.setProperty('--wave', `${waveMs}ms`);
            $text.style.setProperty('--underline', `${maxDist ? waveMs * (textRect.width / 2) / maxDist : waveMs}ms`);
            $text.style.width = `${textRect.width / fontSize}em`;
            $text.style.height = `${textRect.height / fontSize}em`;
            $text.style.left = `${-textRect.width / fontSize / 2}em`;
            $text.style.top = `${-textRect.height / fontSize}em`;
            $text.classList.remove('measuring');
            $text.classList.add('scattered');
            animation = { $text, revealFrame: 0 };
            linkAnimations.set($target, animation);
        }

        cancelAnimationFrame(animation.revealFrame);
        clearTimeout(animation.clearTimer);
        void animation.$text.offsetWidth;
        animation.revealFrame = requestAnimationFrame(() => {
            animation.$text.classList.add('animated');
            animation.revealFrame = requestAnimationFrame(() => animation.$text.classList.add('visible'));
        });
    }
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
        <div class="label" ref="$label"></div>
    </div>

</template>

<style scoped lang="scss">
.links {
    --heartbeat-bpm: 60;
    --heartbeat-duration: calc(60s / var(--heartbeat-bpm));
    position: relative;
    justify-content: center;
    display: flex;
    align-items: start;
    margin-bottom: 64px;
    container-type: inline-size;

    @media (max-width: 680px) {
        margin-bottom: 56px;
    }

    .label {
        position: absolute;
        bottom: calc(-2.5em - 16px);

        @media (max-width: 680px) {
            bottom: calc(-3.5em - 16px);
        }
        left: 50%;
        font-size: clamp(16px, calc((min(96px, 100cqi / 7) - 32px) * 24 / 64), 24px);
        color: #888;
        pointer-events: none;

        :deep(.text) {
            position: absolute;
            box-sizing: border-box;
            padding: 16px 32px;
            color: inherit;
            text-decoration: none;
            pointer-events: auto;
            white-space: pre;

            &.measuring {
                width: max-content;
            }

            &::after {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                bottom: 16px;
                height: 1px;
                background: #fff;
                transform: scaleX(0);
                transform-origin: center;
                transition: transform var(--underline, .4s) linear;
                pointer-events: none;
            }

            &:hover::after {
                transform: scaleX(1);
            }

            > span {
                display: inline-block;
                opacity: 0;
                color: inherit;
            }

            &.scattered > span {
                position: absolute;
                transform: translate(var(--scatter-x), var(--scatter-y));
            }

            &.animated > span {
                transition: opacity 500ms ease, transform 600ms cubic-bezier(.22, 1, .36, 1), color 80ms linear;
                transition-delay: 0s, 0s, calc((1 - var(--from-center, 1)) * var(--wave, .3s));
            }

            &.animated:hover > span {
                transition-delay: 0s, 0s, calc(var(--from-center, 0) * var(--wave, .3s));
            }

            &:hover > span {
                color: #fff;
            }

            &.visible > span {
                opacity: 1;
                transform: translate(0, 0);
            }
        }
    }

    > a {
        opacity: .7;
        --border-radius: calc(var(--border-radius) / 2);
        --overflow: hidden;
        width: 96px;
        min-height: 0;
        padding-inline: 16px;
        position: relative;
        display: grid;
        place-items: start center;
        transition: opacity 300ms, scale 300ms, transform 300ms;

        .backlight {
            grid-area: 1 / 1;
            width: 100%;
            aspect-ratio: 1;
            z-index: 0;
            object-fit: contain;
            filter: blur(12px) saturate(2) brightness(1.5);
            opacity: .3;
            pointer-events: none;
        }

        .icon {
            grid-area: 1 / 1;
            width: 100%;
            aspect-ratio: 1;
            object-fit: contain;
            position: relative;
            z-index: 1;
            filter: saturate(.1);
        }


        span {
            display: none;
        }

        &:is(:hover, .flash, .active) {
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

        &:is(:hover, .active) {
            scale: 1.1;
        }

        &.flash:not(:hover):not(.active) {
            transform: scale(1.1);
        }

        &.flash span {
            display: none;
        }
    }

    &:has(> a:is(:hover, .active)) {
        > a {
            --hover-distance: 6;
            opacity: calc(.75 - var(--hover-distance) * .08);
            scale: calc(1 - var(--hover-distance) * .05);

            &:is(:hover, .active) {
                opacity: 1;
                scale: 1.2;
            }

            &:has(+ a:is(:hover, .active)),
            &:is(:hover, .active) + a {
                --hover-distance: 1;
            }

            &:has(+ a + a:is(:hover, .active)),
            &:is(:hover, .active) + a + a {
                --hover-distance: 2;
            }

            &:has(+ a + a + a:is(:hover, .active)),
            &:is(:hover, .active) + a + a + a {
                --hover-distance: 3;
            }

            &:has(+ a + a + a + a:is(:hover, .active)),
            &:is(:hover, .active) + a + a + a + a {
                --hover-distance: 4;
            }

            &:has(+ a + a + a + a + a:is(:hover, .active)),
            &:is(:hover, .active) + a + a + a + a + a {
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