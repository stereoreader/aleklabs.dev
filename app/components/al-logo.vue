<script setup lang="ts">

import { downloadGoogleFont, type GlyphPaths, textToGlyphPaths } from '@/utils/al-logo';

const glyphDelay = 0.15;
const drawingSpeed = 50;
const globalDelay = 0;

const { size = 128, ...props } = defineProps<{
    text: string,
    size?: number
}>();

const textPaths = ref<GlyphPaths[]>([]);
const textWidth = ref(0);

const showText = ref(false);
const loaded = ref(false);

onMounted(async () => {
    watch(loaded, async () => {
        showText.value = true;
        setInterval(async () => {
            showText.value = false;
            await nextTick();
            showText.value = true;
        }, 10000);
    });
    createLogoPath();
});

const ascii =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789' +
    ' .,;:!?\'"()[]{}+-=*/\\_@#$%^&|<>';


async function createLogoPath() {

    const buffer = await downloadGoogleFont(
        'Share Tech',
        400,
        ascii
    );

    const { paths, width } = textToGlyphPaths(
        buffer,
        props.text,
        {
            fontSize: size,
            baseline: size,
            letterSpacing: 8,
            kerning: true,
            detectCornerAngle: 30
        },
    );

    textPaths.value = paths;
    textWidth.value = width;
    loaded.value = true;

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
            fill-rule="evenodd">
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
            <template v-for="(glyph, glyphIndex) in textPaths" :key="`trace-glyph-${glyphIndex}`">
                <path
                    v-for="(stroke, strokeIndex) in glyph.strokes"
                    :id="`stroke-${glyphIndex}-${strokeIndex}`"
                    :key="`trace-${glyphIndex}-${strokeIndex}`"
                    :d="stroke.path"
                    :style="{
                        '--path-length': stroke.length,
                        '--animation-duration': `${stroke.length / drawingSpeed}s`,
                        '--animation-delay': `${glyphIndex * glyphDelay + globalDelay}s`,
                    }">
                </path>
            </template>
        </g>

        <g
            class="glowing-dots">
            <template
                v-for="(glyph, glyphIndex) in textPaths"
                :key="`dots-glyph-${glyphIndex}`">
                <template v-for="(stroke, strokeIndex) in glyph.strokes" :key="`dot-${glyphIndex}-${strokeIndex}`">
                    <circle
                        r="2.5"
                        fill="white"
                        filter="url(#dot-glow)"
                        visibility="hidden"
                        >
                        <animateMotion
                            :id="`motion-${glyphIndex}-${strokeIndex}`" 
                            :dur="`${stroke.length / drawingSpeed}s`"
                            :begin="`${glyphIndex * glyphDelay + globalDelay}s`"
                            calcMode="linear"
                            rotate="0"
                            fill="freeze">
                            <mpath :href="`#stroke-${glyphIndex}-${strokeIndex}`" />
                        </animateMotion>
                        <set
                            attributeName="visibility"
                            to="visible"
                            :dur="`${stroke.length / drawingSpeed}s`"
                            :begin="`${glyphIndex * glyphDelay + globalDelay}s`"
                            fill="remove" />
                    </circle>
                </template>
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

.stroke path {
    stroke-dasharray: var(--path-length);
    stroke-dashoffset: var(--path-length);

    animation:
        draw var(--animation-duration) linear var(--animation-delay) forwards;
}


.fill {
    opacity: 0;
    animation: fill-in 1s ease-in-out forwards;
    animation-delay: calc(v-bind(globalDelay) * 1s + 1.5s);
}


@keyframes draw {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes fill-in {
    to {
        opacity: 1;
    }
}
</style>