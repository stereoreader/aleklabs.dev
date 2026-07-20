import * as opentype from 'opentype.js';
import type { Path } from 'opentype.js';

export async function downloadGoogleFont(
    family: string,
    weight: number,
    text: string,
    signal?: AbortSignal,
): Promise<ArrayBuffer> {
    if (!family.trim()) {
        throw new Error('Google Font family must not be empty');
    }

    if (!Number.isInteger(weight) || weight < 1 || weight > 1000) {
        throw new Error(`Invalid font weight: ${weight}`);
    }

    if (!text) {
        throw new Error('Text must not be empty');
    }

    const search = new URLSearchParams({
        family: `${family.trim()}:wght@${weight}`,
        text,
        display: 'swap',
    });

    const cssUrl = `https://fonts.googleapis.com/css2?${search}`;
    const cssResponse = await fetch(cssUrl, { signal });

    if (!cssResponse.ok) {
        const details = await cssResponse.text();

        throw new Error(
            `Google Fonts CSS request failed: ${cssResponse.status} ` +
            `${cssResponse.statusText}\n${details}`,
        );
    }

    const css = await cssResponse.text();
    const urlMatch = css.match(
        /src:\s*url\((?:"|')?(https:\/\/fonts\.gstatic\.com\/[^)"']+)(?:"|')?\)/i,
    );

    if (!urlMatch) {
        throw new Error(
            `Google Fonts returned no downloadable source for ` +
            `"${family}" at weight ${weight}.\n\n${css}`,
        );
    }

    const fontResponse = await fetch(urlMatch[1], { signal });

    if (!fontResponse.ok) {
        throw new Error(
            `Google Font download failed: ${fontResponse.status} ` +
            fontResponse.statusText,
        );
    }

    const downloaded = await fontResponse.arrayBuffer();

    if (downloaded.byteLength < 4) {
        throw new Error('The downloaded font file is invalid or empty');
    }

    const signature = new DataView(downloaded).getUint32(0, false);

    // "wOF2"
    if (signature === 0x774f4632) {
        const { default: decompress } = await import(
            'woff2-encoder/decompress'
        );

        const decompressed = await decompress(downloaded);

        return decompressed.buffer.slice(
            decompressed.byteOffset,
            decompressed.byteOffset + decompressed.byteLength,
        ) as ArrayBuffer;
    }

    const isOpenType =
        signature === 0x00010000 || // TrueType
        signature === 0x4f54544f || // OTTO
        signature === 0x74727565 || // true
        signature === 0x74797031 || // typ1
        signature === 0x774f4646;   // WOFF

    if (!isOpenType) {
        throw new Error(
            `Unsupported font signature: 0x${signature
                .toString(16)
                .padStart(8, '0')}`,
        );
    }

    return downloaded;
}

type GlyphStrokeSegment = {
    /**
     * Path from the beginning of the stroke to this corner.
     * For the final segment, this is the complete closed stroke.
     */
    path: string;

    /**
     * Absolute geometric length from the beginning of the stroke
     * to this segment's endpoint, in SVG user units.
     */
    length: number;

    /**
     * length / parent GlyphStroke.length.
     * The final segment always has progress 1.
     */
    progress: number;

    /**
     * Endpoint in the same SVG user coordinate system as path.
     */
    endX: number;
    endY: number;
};

type GlyphStroke = {
    /**
     * Complete closed glyph subpath.
     */
    path: string;
    sourcePath: Path

    /**
     * Absolute geometric length of the complete subpath.
     */
    length: number;

    /**
     * Corner prefixes followed by the complete subpath.
     */
    //segments: GlyphStrokeSegment[];
};

export type GlyphPaths = {
    fillPath: string;
    fillSourcePath: Path;
    strokes: GlyphStroke[];
};

export function textToGlyphPaths(
    fontBuffer: ArrayBuffer,
    text: string,
    options: {
        fontSize: number;
        baseline?: number;
        letterSpacing?: number;
        kerning?: boolean;
        precision?: number;

        /**
         * Minimum direction change in degrees required
         * for a path junction to be treated as a corner.
         */
        detectCornerAngle: number;
    },
): {
    paths: GlyphPaths[];
    width: number;
} {
    const font = opentype.parse(fontBuffer);
    const glyphs = font.stringToGlyphs(text);

    const fontSize = options.fontSize;
    const baseline = options.baseline ?? fontSize;
    const letterSpacing = options.letterSpacing ?? 0;
    const useKerning = options.kerning ?? true;
    const precision = options.precision ?? 2;
    const detectCornerAngle = options.detectCornerAngle;
    const scale = fontSize / font.unitsPerEm;

    if (
        !Number.isFinite(detectCornerAngle) ||
        detectCornerAngle < 0 ||
        detectCornerAngle > 180
    ) {
        throw new RangeError(
            'detectCornerAngle must be between 0 and 180 degrees',
        );
    }

    const measuringPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
    );

    const paths: GlyphPaths[] = [];

    let x = 0;

    for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i]!;
        const strokes: GlyphStroke[] = [];

        let fillPath = '';

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

            const subpaths = splitPathIntoSubpaths(
                glyphPath,
            );

            for (const subpath of subpaths) {
                const startCommand =
                    subpath.commands[0];

                if (
                    startCommand?.type !== 'M' ||
                    typeof startCommand.x !== 'number' ||
                    typeof startCommand.y !== 'number'
                ) {
                    continue;
                }

                const strokePath = toClosedSvgPathData(
                    subpath,
                    precision,
                );

                const strokeLength = measurePathData(
                    strokePath,
                );

                strokes.push({
                    path: strokePath,
                    sourcePath: subpath,
                    length: strokeLength,
                });
            }
        }

        paths.push({
            fillSourcePath: glyph.path,
            fillPath,
            strokes,
        });

        const advance =
            (glyph.advanceWidth ?? 0) * scale;

        const nextGlyph = glyphs[i + 1];

        let kerning = 0;

        if (useKerning && nextGlyph) {
            kerning =
                font.getKerningValue(
                    glyph,
                    nextGlyph,
                ) * scale;
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


    function splitPathIntoSubpaths(
        path: Path,
    ): Path[] {
        const subpaths: Path[] = [];
        let commands: Path['commands'] = [];

        for (const command of path.commands) {
            if (
                command.type === 'M' &&
                commands.length > 0
            ) {
                finishSubpath();
            }

            commands.push(
                cloneCommand(command),
            );

            if (command.type === 'Z') {
                finishSubpath();
            }
        }

        finishSubpath();

        return subpaths;

        function finishSubpath(): void {
            if (commands.length === 0) {
                return;
            }

            if (commands.at(-1)?.type !== 'Z') {
                commands.push({
                    type: 'Z',
                } as Path['commands'][number]);
            }

            const subpath = new opentype.Path();

            subpath.commands = commands;
            subpaths.push(subpath);

            commands = [];
        }
    }


    function toClosedSvgPathData(
        path: Path,
        pathPrecision: number,
    ): string {
        const closedPath = new opentype.Path();
        const closedCommands: Path['commands'] = [];

        let subpathOpen = false;

        for (const sourceCommand of path.commands) {
            const command =
                cloneCommand(sourceCommand);

            if (command.type === 'M') {
                if (subpathOpen) {
                    closedCommands.push({
                        type: 'Z',
                    } as Path['commands'][number]);
                }

                subpathOpen = true;
            } else if (command.type === 'Z') {
                subpathOpen = false;
            }

            closedCommands.push(command);
        }

        if (subpathOpen) {
            closedCommands.push({
                type: 'Z',
            } as Path['commands'][number]);
        }

        closedPath.commands = closedCommands;

        return closedPath.toPathData(
            pathPrecision,
        );
    }

    function measurePathData(
        pathData: string,
    ): number {
        measuringPath.setAttribute(
            'd',
            pathData,
        );

        return measuringPath.getTotalLength();
    }



    function cloneCommand(
        command: Path['commands'][number],
    ): Path['commands'][number] {
        return {
            ...command,
        } as Path['commands'][number];
    }
}

type MutablePathCommand = opentype.PathCommand & {
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
};

export function createPushTargetPath(
    sourcePath: opentype.Path,
    hitX: number,
    hitY: number,
    approachX: number,
    approachY: number,
    influenceRadius = 14,
    pushDistance = 8,
    affectedSubpathIndex?: number
): string {
    const approachLength = Math.hypot(approachX, approachY);

    if (approachLength === 0) {
        return sourcePath.toPathData(3);
    }

    const directionX = approachX / approachLength;
    const directionY = approachY / approachLength;
    const targetPath = new opentype.Path();

    let currentSubpathIndex = -1;

    targetPath.commands = sourcePath.commands.map(function (sourceCommand) {
        const command = { ...sourceCommand } as MutablePathCommand;

        if (command.type === 'M') {
            currentSubpathIndex++;
        }

        if (affectedSubpathIndex === undefined || currentSubpathIndex === affectedSubpathIndex) {
            deformPoint(command, 'x', 'y');
            deformPoint(command, 'x1', 'y1');
            deformPoint(command, 'x2', 'y2');
        }

        return command;
    });

    return targetPath.toPathData(3);

    function deformPoint(
        command: MutablePathCommand,
        xKey: 'x' | 'x1' | 'x2',
        yKey: 'y' | 'y1' | 'y2'
    ): void {
        const x = command[xKey];
        const y = command[yKey];

        if (x === undefined || y === undefined) {
            return;
        }

        const distance = Math.hypot(x - hitX, y - hitY);

        if (distance >= influenceRadius) {
            return;
        }

        const normalizedDistance = distance / influenceRadius;
        const weight = Math.exp(-4 * normalizedDistance * normalizedDistance);
        const displacement = pushDistance * weight;

        command[xKey] = x + directionX * displacement;
        command[yKey] = y + directionY * displacement;
    }
}