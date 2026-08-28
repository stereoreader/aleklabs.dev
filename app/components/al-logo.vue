<script setup lang="ts">
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

import glyphData from '@/assets/generated/glyphs.json';

gsap.registerPlugin(MotionPathPlugin, MorphSVGPlugin);

const glyphDelay = 0.15;
const drawingSpeed = 50;
const globalDelay = 0;
const dotRadius = 2.5;
const letterSpacing = 8;

type GeneratedGlyphPathCommand = {
    type: string;
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
};

type GeneratedGlyphStroke = {
    commands: GeneratedGlyphPathCommand[];
};

type GeneratedGlyph = {
    advanceWidth: number;
    commands: GeneratedGlyphPathCommand[];
    strokes: GeneratedGlyphStroke[];
    kerning: Record<string, number>;
};

type GeneratedGlyphData = {
    unitsPerEm: number;
    glyphs: Record<string, GeneratedGlyph>;
};

type GlyphStroke = {
    path: string;
    length: number;
};

type GlyphPaths = {
    fillPath: string;
    strokes: GlyphStroke[];
};

const { size = 128, ...props } = defineProps<{
    text: string,
    size?: number
}>();

const $svg = ref<SVGSVGElement | null>(null);
const generatedGlyphData = glyphData as GeneratedGlyphData;

const textPaths = ref<GlyphPaths[]>([]);
const textWidth = ref(0);

let animationContext: ReturnType<typeof gsap.context> | undefined;
let animationTimeline: ReturnType<typeof gsap.timeline> | undefined;
let replayInterval: ReturnType<typeof setInterval> | undefined;

watch(() => [props.text, size], syncLogoPath, { immediate: true });

const isMounted = ref(false);

onMounted(() => {

    watch(() => [props.text, size], async () => {
        if (replayInterval !== undefined) {
            clearInterval(replayInterval);
            replayInterval = undefined;
        }

        animationContext?.revert();
        animationTimeline = undefined;

        await nextTick();

        const svg = $svg.value;

        if (!svg) {
            return;
        }

        const strokeElements = svg.querySelectorAll<SVGPathElement>('.stroke path');
        let elementIndex = 0;

        for (const glyph of textPaths.value) {
            for (const stroke of glyph.strokes) {
                const path = strokeElements[elementIndex];

                elementIndex++;
                stroke.length = path?.getTotalLength() ?? 0;
            }
        }

        isMounted.value = true;
        await nextTick();
        createAnimation();

        replayInterval = setInterval(() => {
            animationTimeline?.restart();
        }, 10000);
    }, { immediate: true, flush: 'post' });
});

onBeforeUnmount(() => {
    if (replayInterval !== undefined) {
        clearInterval(replayInterval);
    }

    animationContext?.revert();
});

function syncLogoPath() {
    const nextTextPaths: GlyphPaths[] = [];
    const scale = size / generatedGlyphData.unitsPerEm;
    const fallbackGlyph = generatedGlyphData.glyphs[' '];
    let x = 0;

    for (let glyphIndex = 0; glyphIndex < props.text.length; glyphIndex++) {
        const character = props.text[glyphIndex]!;
        const glyph = generatedGlyphData.glyphs[character] ?? fallbackGlyph;

        if (!glyph) {
            continue;
        }

        nextTextPaths.push({
            fillPath: toPathData(glyph.commands, x, scale),
            strokes: glyph.strokes.map(stroke => ({
                path: toPathData(stroke.commands, x, scale),
                length: 0
            }))
        });

        x += glyph.advanceWidth * scale;

        const nextCharacter = props.text[glyphIndex + 1];

        if (nextCharacter !== undefined) {
            x += (glyph.kerning[nextCharacter] ?? 0) * scale + letterSpacing;
        }
    }

    textPaths.value = nextTextPaths;
    textWidth.value = x;

    function toPathData(
        commands: GeneratedGlyphPathCommand[],
        offsetX: number,
        pathScale: number
    ): string {
        let pathData = '';

        for (const command of commands) {
            switch (command.type) {
                case 'M':
                case 'L':
                    pathData += `${command.type}${formatX(command.x)} ${formatY(command.y)}`;
                    break;

                case 'C':
                    pathData +=
                        `C${formatX(command.x1)} ${formatY(command.y1)} ` +
                        `${formatX(command.x2)} ${formatY(command.y2)} ` +
                        `${formatX(command.x)} ${formatY(command.y)}`;
                    break;

                case 'Q':
                    pathData +=
                        `Q${formatX(command.x1)} ${formatY(command.y1)} ` +
                        `${formatX(command.x)} ${formatY(command.y)}`;
                    break;

                case 'Z':
                    pathData += 'Z';
                    break;
            }
        }

        return pathData;

        function formatX(value: number | undefined): string {
            return formatNumber((value ?? 0) * pathScale + offsetX);
        }

        function formatY(value: number | undefined): string {
            return formatNumber((value ?? 0) * pathScale);
        }

        function formatNumber(value: number): string {
            return (Math.round(value * 1000) / 1000).toString();
        }
    }
}

function createAnimation(): void {
    const svg = $svg.value;

    if (!svg) {
        return;
    }

    animationContext?.revert();

    animationContext = gsap.context(() => {
        const timeline = gsap.timeline({
            paused: true,
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
                        path: stroke.path,
                        start: 0,
                        end: 1
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
                const sampleProgress = pathLength > 0 ? sampleDistance / pathLength : 0;

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
                        path: stroke.path,
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
                            r: 5
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

        timeline.add(gsap.set($svg.value?.querySelector('g.stroke')!, { mask: 'url(#stripe-mask)', filter: 'url(#dot-distort-glow)' }));
        timeline.add(gsap.set($svg.value?.querySelector('g.fill')!, { mask: 'url(#stripe-mask)', filter: 'url(#dot-distort-glow)' }));
        timeline.add(gsap.set($svg.value?.querySelector('#stripe-mask')!, { filter: 'url(#dot-distort-glow)' }));
        $svg.value?.querySelector('#blur-source')?.setAttribute('in', 'distorted');



        const endTime = timeline.duration();
        timeline.add(gsap.to($svg.value?.querySelector('#stripe-gradient')!, {
            attr: {
                //x2: 100,
                y2: 100
            },
            duration: 2,
        }), endTime);


        timeline.add(gsap.to($svg.value?.querySelector('#displacement')!, {
            attr: {
                scale: 150
            },
            duration: 2,
        }), endTime);


    }, svg);

    animationTimeline?.play(0);
}
</script>

<template>
    <svg
        v-if="textPaths.length > 0"
        v-show="isMounted"
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
                id="dot-distort-glow"
                x="-500%"
                y="-500%"
                width="1000%"
                height="1000%"
                color-interpolation-filters="sRGB">
                <feTurbulence
                    id="dot-turbulence"
                    type="turbulence"
                    baseFrequency="0.05"
                    numOctaves="2"
                    seed="1"
                    result="turbulence" />

                <feDisplacementMap
                    id="displacement"
                    in="SourceGraphic"
                    in2="turbulence"
                    scale="7.5"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="distorted" />

                <feGaussianBlur
                    in="distorted"
                    stdDeviation="10"
                    result="blur" />

                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode id="blur-source" in="SourceGraphic" />
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
                    :d="stroke.path" />
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
                    visibility="hidden" />
            </template>
        </g>
    </svg>
</template>

<style scoped lang="scss">
#animated-text {
    overflow: visible;

    filter:
        drop-shadow(0 0 4px rgb(255 255 255 / 80%)) drop-shadow(0 0 14px rgb(0 180 255 / 70%));

    .glowing-dots {
        $color: #0088ff;
        filter:
            drop-shadow(0 0 2px rgb(255 255 255)) drop-shadow(0 0 5px rgba($color, 100%)) drop-shadow(0 0 12px rgba($color, 80%));
    }
}
</style>