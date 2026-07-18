<script setup lang="ts">
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { downloadGoogleFont, type GlyphPaths, textToGlyphPaths } from '@/utils/al-logo';

gsap.registerPlugin(MotionPathPlugin);

const glyphDelay = 0.15;
const drawingSpeed = 50;
const globalDelay = 0;

const { size = 128, ...props } = defineProps<{
    text: string,
    size?: number
}>();

const $svg = ref<SVGSVGElement | null>(null);

const textPaths = ref<GlyphPaths[]>([]);
const textWidth = ref(0);

const showText = ref(false);
const loaded = ref(false);

let animationContext: ReturnType<typeof gsap.context> | undefined;
let animationTimeline: ReturnType<typeof gsap.timeline> | undefined;
let replayInterval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
    watch(loaded, async () => {
        showText.value = true;

        await nextTick();

        createAnimation();

        replayInterval = setInterval(() => {
            animationTimeline?.restart();
        }, 10000);
    });

    createLogoPath();
});

onBeforeUnmount(() => {
    if (replayInterval !== undefined) {
        clearInterval(replayInterval);
    }

    animationContext?.revert();
});

const ascii =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789' +
    ' .,;:!?\'"()[]{}+-=*/\\_@#$%^&|<>';

async function createLogoPath() {
    const buffer = await downloadGoogleFont('Share Tech', 400, ascii);

    const { paths, width } = textToGlyphPaths(buffer, props.text, {
        fontSize: size,
        baseline: size,
        letterSpacing: 8,
        kerning: true,
        detectCornerAngle: 30
    });

    textPaths.value = paths;
    textWidth.value = width;
    loaded.value = true;
}

function createAnimation(): void {
    const svg = $svg.value;

    if (!svg) {
        return;
    }

    animationContext?.revert();

    animationContext = gsap.context(() => {
        const timeline = gsap.timeline({
            paused: true
        });

        animationTimeline = timeline;

        const strokeElements = svg.querySelectorAll<SVGPathElement>('.stroke path');
        const dotElements = svg.querySelectorAll<SVGCircleElement>('.glowing-dots circle');
        const fillElement = svg.querySelector<SVGGElement>('.fill');

        let elementIndex = 0;

        for (let glyphIndex = 0; glyphIndex < textPaths.value.length; glyphIndex++) {
            const glyph = textPaths.value[glyphIndex]!;

            for (let strokeIndex = 0; strokeIndex < glyph.strokes.length; strokeIndex++) {
                const stroke = glyph.strokes[strokeIndex]!;
                const path = strokeElements[elementIndex];
                const dot = dotElements[elementIndex];

                elementIndex++;

                if (!path || !dot) {
                    continue;
                }

                const duration = stroke.length / drawingSpeed;
                const startTime = globalDelay + glyphIndex * glyphDelay;

                /*
                 * Establish every initial state while the timeline
                 * is paused. The dot is positioned on its path
                 * before it becomes visible.
                 */
                gsap.set(path, {
                    strokeDasharray: stroke.length,
                    strokeDashoffset: stroke.length
                });

                gsap.set(dot, {
                    visibility: 'hidden',
                    motionPath: {
                        path,
                        align: path,
                        alignOrigin: [0.5, 0.5],
                        start: 0,
                        end: 0
                    }
                });

                timeline.to(path, {
                    strokeDashoffset: 0,
                    duration,
                    ease: 'none'
                }, startTime);

                timeline.set(dot, {
                    visibility: 'visible'
                }, startTime);

                timeline.to(dot, {
                    motionPath: {
                        path,
                        align: path,
                        alignOrigin: [0.5, 0.5],
                        start: 0,
                        end: 1
                    },
                    duration,
                    ease: 'none'
                }, startTime);

                timeline.set(dot, {
                    visibility: 'hidden'
                }, startTime + duration);
            }
        }

        if (fillElement) {
            gsap.set(fillElement, {
                opacity: 0
            });

            timeline.to(fillElement, {
                opacity: 1,
                duration: 1,
                ease: 'power1.inOut'
            }, globalDelay + 1.5);
        }
    }, svg);

    animationTimeline?.play(0);
}
</script>

<template>
    <svg
        v-if="showText"
        ref="$svg"
        id="animated-text"
        :style="`width:${textWidth}px`"
        :viewBox="`0 0 ${textWidth} ${size + 10}`"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient
                id="gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%">
                <stop
                    offset="0%"
                    stop-color="#44aa44"
                    stop-opacity=".7" />

                <stop
                    offset="100%"
                    stop-color="#003355" />
            </linearGradient>

            <filter
                id="dot-glow"
                x="-500%"
                y="-500%"
                width="1000%"
                height="1000%"
                color-interpolation-filters="sRGB">
                <feGaussianBlur
                    stdDeviation="3"
                    result="blur" />

                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        <g
            class="fill"
            fill="url(#gradient)"
            stroke="none"
            fill-rule="evenodd"
            opacity="0">
            <path
                v-for="(glyph, glyphIndex) in textPaths"
                v-show="glyph.fillPath"
                :key="`fill-${glyphIndex}`"
                :d="glyph.fillPath" />
        </g>

        <g
            class="stroke"
            fill="none"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round">
            <template
                v-for="(glyph, glyphIndex) in textPaths"
                :key="`trace-glyph-${glyphIndex}`">
                <path
                    v-for="(stroke, strokeIndex) in glyph.strokes"
                    :id="`stroke-${glyphIndex}-${strokeIndex}`"
                    :key="`trace-${glyphIndex}-${strokeIndex}`"
                    :d="stroke.path"
                    :stroke-dasharray="stroke.length"
                    :stroke-dashoffset="stroke.length" />
            </template>
        </g>

        <g class="glowing-dots">
            <template
                v-for="(glyph, glyphIndex) in textPaths"
                :key="`dots-glyph-${glyphIndex}`">
                <circle
                    v-for="(_, strokeIndex) in glyph.strokes"
                    :key="`dot-${glyphIndex}-${strokeIndex}`"
                    r="2.5"
                    fill="white"
                    visibility="hidden"
                    filter="url(#dot-glow)" />
            </template>
        </g>
    </svg>
</template>

<style scoped lang="scss">
#animated-text {
    overflow: visible;

    filter:
        drop-shadow(0 0 4px rgb(255 255 255 / 80%))
        drop-shadow(0 0 14px rgb(0 180 255 / 70%));
}
</style>