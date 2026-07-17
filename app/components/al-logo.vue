<script setup lang="ts">

import * as opentype from 'opentype.js';
import type { Path } from 'opentype.js';
import { downloadGoogleFont } from '@/utils/al-logo';

const props = defineProps<{
    text: string
}>();

const textPaths = ref<string[]>([]);
const textWidth = ref(0);

onMounted(async () => {
    createLogoPath();
});

const ascii =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789' +
    ' .,;:!?\'"()[]{}+-=*/\\_@#$%^&|<>';


const size = 128;

async function createLogoPath() {

    const buffer = await downloadGoogleFont(
        'Share Tech',
        400,
        ascii
    );


    const { paths, width } = textToGlyphPaths(
        buffer,
        'ALEK LABS',
        {
            fontSize: size,
            baseline: size,
            letterSpacing: 8,
            kerning: true,
        },
    );

    textPaths.value = paths;
    textWidth.value = width;


    // const font = opentype.parse(buffer);

    // return [...props.text].map(char => {
    //     return font.getPath(char, 0, 100, 100, {
    //         kerning: true,
    //     }).toPathData(2);
    // });

}

function textToGlyphPaths(
    fontBuffer: ArrayBuffer,
    text: string,
    options: {
        fontSize: number;
        baseline?: number;
        letterSpacing?: number;
        kerning?: boolean;
    },
): {
    paths: string[];
    width: number;
} {
    const font = opentype.parse(fontBuffer);
    const glyphs = font.stringToGlyphs(text);

    const fontSize = options.fontSize;
    const baseline = options.baseline ?? fontSize;
    const letterSpacing = options.letterSpacing ?? 0;
    const useKerning = options.kerning ?? true;
    const scale = fontSize / font.unitsPerEm;

    const paths: string[] = [];
    let x = 0;

    for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i]!;

        if (glyph.path.commands.length > 0) {
            const path = glyph.getPath(x, baseline, fontSize);

            paths.push(toClosedSvgPathData(path, 2));
        }

        const advance = (glyph.advanceWidth ?? 0) * scale;
        const nextGlyph = glyphs[i + 1];

        let kerning = 0;

        if (useKerning && nextGlyph) {
            kerning = font.getKerningValue(glyph, nextGlyph) * scale;
        }

        x += advance + kerning;

        if (i < glyphs.length - 1) {
            x += letterSpacing;
        }
    }

    return {
        paths,
        width: x,
    };
}

function toClosedSvgPathData(
    path: Path,
    precision = 2,
): string {
    const originalCommands = path.commands;
    const closedCommands: Path['commands'] = [];

    let contourOpen = false;

    for (const command of originalCommands) {
        if (command.type === 'M') {
            if (contourOpen) {
                closedCommands.push({
                    type: 'Z',
                } as Path['commands'][number]);
            }

            contourOpen = true;
        } else if (command.type === 'Z') {
            contourOpen = false;
        }

        closedCommands.push(command);
    }

    if (contourOpen) {
        closedCommands.push({
            type: 'Z',
        } as Path['commands'][number]);
    }

    path.commands = closedCommands;

    try {
        return path.toPathData(precision);
    } finally {
        path.commands = originalCommands;
    }
}

</script>

<template>
    <svg
        id="animated-text"
        :style="`width:${textWidth}px`"
        :viewBox="`0 0 ${textWidth} ${size + 10}`"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#44AA44" stop-opacity=".7"/>
                <stop offset="100%" stop-color="#003355" />
            </linearGradient>
        </defs>
        <g
            id="remplissage"
            fill="url(#gradient)"
            stroke="none"
            fill-rule="evenodd">
            <path v-for="d in textPaths" :d />
        </g>
        <g id="trace" fill="transparent" stroke="white" stroke-width="1.5">
            <path v-for="d in textPaths" :d />
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
#trace path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: draw 2s ease-in-out forwards;
}


#remplissage {
    opacity: 0;
    animation: fill-in 1s ease-in-out forwards;
    animation-delay: 1.5s;
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


#trace path:nth-child(1) {
    animation-delay: 0s;
}

#trace path:nth-child(2) {
    animation-delay: .15s;
}

#trace path:nth-child(3) {
    animation-delay: .3s;
}

#trace path:nth-child(4) {
    animation-delay: .45s;
}

#trace path:nth-child(5) {
    animation-delay: .6s;
}

#trace path:nth-child(6) {
    animation-delay: .75s;
}

#trace path:nth-child(7) {
    animation-delay: .9s;
}

#trace path:nth-child(8) {
    animation-delay: 1.05s;
}

#trace path:nth-child(9) {
    animation-delay: 1.2s;
}

#trace path:nth-child(10) {
    animation-delay: 1.35s;
}

#trace path:nth-child(11) {
    animation-delay: 1.5s;
}
</style>