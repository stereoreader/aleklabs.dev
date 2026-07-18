<script setup lang="ts">

import * as opentype from 'opentype.js';
import type { Path } from 'opentype.js';
import { downloadGoogleFont } from '@/utils/al-logo';

const { size = 128, ...props } = defineProps<{
    text: string,
    size?: number
}>();

const textPaths = ref<GlyphPaths[]>([]);
const textWidth = ref(0);

const showText = ref(false);
const loaded = ref(false);

onMounted(async () => {
    watch(loaded, () => {
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
        },
    );

    textPaths.value = paths;
    textWidth.value = width;
    loaded.value = true;


    // const font = opentype.parse(buffer);

    // return [...props.text].map(char => {
    //     return font.getPath(char, 0, 100, 100, {
    //         kerning: true,
    //     }).toPathData(2);
    // });

}

type GlyphPaths = {
    fillPath: string;
    contours: string[];
};


function textToGlyphPaths(
    fontBuffer: ArrayBuffer,
    text: string,
    options: {
        fontSize: number;
        baseline?: number;
        letterSpacing?: number;
        kerning?: boolean;
        precision?: number;
    },
): {
    paths: {
        fillPath: string;
        contours: string[];
    }[];
    width: number;
} {
    const font = opentype.parse(fontBuffer);
    const glyphs = font.stringToGlyphs(text);

    const fontSize = options.fontSize;
    const baseline = options.baseline ?? fontSize;
    const letterSpacing = options.letterSpacing ?? 0;
    const useKerning = options.kerning ?? true;
    const precision = options.precision ?? 2;
    const scale = fontSize / font.unitsPerEm;

    const paths: {
        fillPath: string;
        contours: string[];
    }[] = [];

    let x = 0;

    for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i]!;
        let fillPath = '';
        let contours: string[] = [];

        if (glyph.path.commands.length > 0) {
            const glyphPath = glyph.getPath(
                x,
                baseline,
                fontSize,
            );

            fillPath = toClosedSvgPathData(
                glyphPath,
                precision,
            );

            contours = splitPathIntoContours(glyphPath).map(
                function (contour) {
                    return toClosedSvgPathData(
                        contour,
                        precision,
                    );
                },
            );
        }

        paths.push({
            fillPath,
            contours,
        });

        const advance = (glyph.advanceWidth ?? 0) * scale;
        const nextGlyph = glyphs[i + 1];

        let kerning = 0;

        if (useKerning && nextGlyph) {
            kerning =
                font.getKerningValue(glyph, nextGlyph) *
                scale;
        }

        x += advance + kerning;

        if (i < glyphs.length - 1) {
            x += letterSpacing;
        }
    }

    function splitPathIntoContours(path: Path): Path[] {
        const contours: Path[] = [];
        let commands: Path['commands'] = [];

        for (const command of path.commands) {
            if (
                command.type === 'M' &&
                commands.length > 0
            ) {
                finishContour();
            }

            commands.push({
                ...command,
            } as Path['commands'][number]);

            if (command.type === 'Z') {
                finishContour();
            }
        }

        finishContour();

        return contours;

        function finishContour(): void {
            if (commands.length === 0) {
                return;
            }

            if (commands.at(-1)?.type !== 'Z') {
                commands.push({
                    type: 'Z',
                } as Path['commands'][number]);
            }

            const contour = new opentype.Path();

            contour.commands = commands;
            contours.push(contour);

            commands = [];
        }
    }

    function toClosedSvgPathData(
        path: Path,
        pathPrecision: number,
    ): string {
        const closedPath = new opentype.Path();

        closedPath.commands = path.commands.map(
            function (command) {
                return {
                    ...command,
                } as Path['commands'][number];
            },
        );

        const closedCommands: Path['commands'] = [];
        let contourOpen = false;

        for (const command of closedPath.commands) {
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

        closedPath.commands = closedCommands;

        return closedPath.toPathData(pathPrecision);
    }

    return {
        paths,
        width: x,
    };
}

</script>

<template>
    <svg
        v-if="showText"
        id="animated-text"
        :style="`width:${textWidth}px`"
        :viewBox="`0 0 ${textWidth} ${size + 10}`"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#44AA44" stop-opacity=".7" />
                <stop offset="100%" stop-color="#003355" />
            </linearGradient>
        </defs>
        <g
            id="remplissage"
            fill="url(#gradient)"
            stroke="none"
            fill-rule="evenodd">
            <template v-for="glyph in textPaths">
                <path :d="glyph.fillPath" />
            </template>
        </g>
        <g id="trace" fill="none" stroke="white" stroke-width="1.5">
            <template v-for="glyph in textPaths">
                <path v-for="d in glyph.contours" :d />
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