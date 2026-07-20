<script setup lang="ts">
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

import { downloadGoogleFont, type GlyphPaths, textToGlyphPaths, createPushTargetPath } from '@/utils/al-logo';

gsap.registerPlugin(MotionPathPlugin, MorphSVGPlugin);

const glyphDelay = 0.15;
const drawingSpeed = 50;
const globalDelay = 0;
const dotRadius = 2.5;

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
        const fillElements = svg.querySelectorAll<SVGGElement>('.fill path');

        let elementIndex = 0;

        for (let glyphIndex = 0; glyphIndex < textPaths.value.length; glyphIndex++) {

            const glyph = textPaths.value[glyphIndex]!;
            if (!glyph.fillPath) continue;

            const startTime = globalDelay + glyphIndex * glyphDelay;

            const fill = fillElements[glyphIndex]!;

            gsap.set(fill, {
                opacity: 0
            });

            timeline.to(fill, {
                opacity: 1,
                duration: 1,
                ease: 'power1.inOut'
            }, startTime + 1.5);

            for (let strokeIndex = 0; strokeIndex < glyph.strokes.length; strokeIndex++) {

                const stroke = glyph.strokes[strokeIndex]!;
                const path = strokeElements[elementIndex];
                const dot = dotElements[elementIndex];

                elementIndex++;

                if (!path || !dot) {
                    continue;
                }


                const duration = stroke.length / drawingSpeed;

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

                type PathPositionWithAngle = {
                    x: number;
                    y: number;
                    angle: number;
                };

                const rawPath = MotionPathPlugin.getRawPath(path);
                MotionPathPlugin.cacheRawPathMeasurements(rawPath);
                const detectCornerAngle = 30;

                const pathLength = MotionPathPlugin.getLength(rawPath);
                const sampleDistance = 2;
                const sampleProgress = sampleDistance / pathLength;

                const flashDuration = 0.35;

                let insideCorner = false;

                function getPathPosition(progress: number): PathPositionWithAngle {
                    return MotionPathPlugin.getPositionOnPath(rawPath, progress, true) as PathPositionWithAngle;
                }

                function normalizeAngle(angle: number): number {
                    return ((angle + 180) % 360 + 360) % 360 - 180;
                }

                const dotMotion = gsap.to(dot, {
                    motionPath: {
                        path,
                        align: path,
                        alignOrigin: [0.5, 0.5],
                        start: 0,
                        end: 1
                    },
                    duration,
                    ease: 'none',
                    onUpdate() {
                        if (sampleProgress === 0) {
                            return;
                        }

                        const progress = dotMotion.progress();
                        const beforeProgress = Math.max(0, progress - sampleProgress);
                        const afterProgress = Math.min(1, progress + sampleProgress);

                        const before = getPathPosition(beforeProgress);
                        const after = getPathPosition(afterProgress);
                        const directionChange = Math.abs(normalizeAngle(after.angle - before.angle));

                        if (!insideCorner && directionChange >= detectCornerAngle) {
                            insideCorner = true;

                            //console.log('Corner:', current.x, current.y, directionChange);
                            flashDot();

                            // const current = getPathPosition(progress);

                            // const targetPathData = createPushTargetPath(
                            //     stroke.sourcePath,
                            //     current.x,
                            //     current.y,
                            //     current.x - before.x,
                            //     current.y - before.y,
                            //     128,
                            //     4
                            // );


                            // const fillTargetPathData = createPushTargetPath(
                            //     glyph.fillSourcePath,
                            //     current.x,
                            //     current.y,
                            //     current.x - before.x,
                            //     current.y - before.y,
                            //     128,
                            //     4
                            // );
                            // //debugger;

                            // //path.setAttribute('d', targetPathData);

                            // gsap.timeline()
                            //     .to(path, {
                            //         morphSVG: targetPathData,
                            //         duration: 0.08,
                            //         ease: 'power2.out',
                            //         overwrite: 'auto'
                            //     })
                            //     .to(path, {
                            //         morphSVG: stroke.path,
                            //         duration: 0.5,
                            //         ease: 'power2.out'
                            //     });

                            // gsap.timeline()
                            //     .to(fill, {
                            //         morphSVG: fillTargetPathData,
                            //         duration: 0.08,
                            //         ease: 'power2.out',
                            //         overwrite: 'auto'
                            //     })
                            //     .to(fill, {
                            //         morphSVG: glyph.fillPath,
                            //         duration: 0.5,
                            //         ease: 'power2.out'
                            //     });

                        } else if (insideCorner && directionChange < detectCornerAngle * 0.5) {
                            insideCorner = false;
                        }
                    }, onComplete() {
                        flashDot();
                    }
                });

                function flashDot() {
                    gsap.fromTo(dot!, {
                        attr: {
                            r: 7
                        },
                    }, {
                        attr: {
                            r: dotRadius
                        },
                        duration: flashDuration,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });

                }

                timeline.add(dotMotion, startTime);

                timeline.set(dot, {
                    visibility: 'hidden'
                }, startTime + duration + flashDuration);
            }
        }

        timeline.add(gsap.set($svg.value?.querySelector('g.stroke')!, { mask: 'url(#stripe-mask)' }));
        timeline.add(gsap.set($svg.value?.querySelector('g.fill')!, { mask: 'url(#stripe-mask)' }));
        timeline.add(gsap.to($svg.value?.querySelector('#stripe-gradient')!, {
            attr: {
                //x2: 100,
                y2: 100
            },
            duration: 2,
            repeat: Infinity
        }), timeline.duration())


    }, svg);

    animationTimeline?.play(0);
}
</script>

<template>
    <svg
        v-if="showText"
        ref="$svg"
        id="animated-text"
        :viewBox="`0 0 ${textWidth} ${size + 10}`"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient
                id="stripe-gradient"
                gradientUnits="userSpaceOnUse"
                spreadMethod="repeat"
                x1="0"
                y1="0"
                x2="0"
                y2="2"
                gradientTransform="translate(0 0)">
                <stop
                    offset="0"
                    stop-color="white" />

                <stop
                    offset=".5"
                    stop-color="white" />

                <stop
                    offset=".5"
                    stop-color="black" />

                <stop
                    offset="1"
                    stop-color="black" />
            </linearGradient>

            <mask
                id="stripe-mask"
                maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse"
                x="-100"
                y="-100"
                width="1200"
                height="400"
                style="mask-type: luminance">
                <rect
                    x="-100"
                    y="-100"
                    width="1200"
                    height="400"
                    fill="url(#stripe-gradient)" />
            </mask>
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
                    stdDeviation="10"
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
            fill-rule="evenodd">
            <path opacity="0"
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
                    :r="dotRadius"
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
        drop-shadow(0 0 4px rgb(255 255 255 / 80%)) drop-shadow(0 0 14px rgb(0 180 255 / 70%));
}
</style>