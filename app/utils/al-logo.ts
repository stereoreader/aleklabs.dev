import * as opentype from 'opentype.js';
import type {Path} from 'opentype.js';

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

    /**
     * Absolute geometric length of the complete subpath.
     */
    length: number;

    /**
     * Corner prefixes followed by the complete subpath.
     */
    segments: GlyphStrokeSegment[];
};

export type GlyphPaths = {
    fillPath: string;
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
        debugger;
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

                const segments: GlyphStrokeSegment[] = [];

                const corners = detectCorners(
                    subpath,
                    detectCornerAngle,
                );

                for (const corner of corners) {
                    const segmentPath =
                        toPrefixSvgPathData(
                            subpath,
                            corner.commandIndex,
                            precision,
                        );

                    const segmentLength =
                        measurePathData(segmentPath);

                    /*
                     * If the explicit path already returns to its
                     * starting point before Z, this prefix may equal
                     * the complete path. The final full segment below
                     * already represents that position.
                     */
                    if (
                        Math.abs(
                            segmentLength -
                            strokeLength,
                        ) <= 1e-6
                    ) {
                        continue;
                    }

                    segments.push({
                        path: segmentPath,
                        length: segmentLength,

                        progress:
                            strokeLength > 0
                                ? segmentLength /
                                  strokeLength
                                : 0,

                        endX: roundCoordinate(
                            corner.x,
                            precision,
                        ),

                        endY: roundCoordinate(
                            corner.y,
                            precision,
                        ),
                    });
                }

                /*
                 * The complete stroke is always the final segment.
                 * Since it ends through Z, its endpoint is the
                 * original M coordinate.
                 */
                segments.push({
                    path: strokePath,
                    length: strokeLength,
                    progress: 1,

                    endX: roundCoordinate(
                        startCommand.x,
                        precision,
                    ),

                    endY: roundCoordinate(
                        startCommand.y,
                        precision,
                    ),
                });

                strokes.push({
                    path: strokePath,
                    length: strokeLength,
                    segments,
                });
            }
        }

        paths.push({
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

    function detectCorners(
        subpath: Path,
        minimumAngle: number,
    ): {
        commandIndex: number;
        x: number;
        y: number;
    }[] {
        const segments = createPathSegments(
            subpath,
        );

        const corners: {
            commandIndex: number;
            x: number;
            y: number;
        }[] = [];

        /*
         * The final segment is normally Z. We compare every
         * segment with the following segment, but do not compare
         * the final closing segment back to the first one.
         *
         * The closing point is represented by the final full
         * GlyphStrokeSegment instead.
         */
        for (
            let i = 0;
            i < segments.length - 1;
            i++
        ) {
            const current = segments[i]!;
            const next = segments[i + 1]!;

            const angle = getDirectionChange(
                current.endDirection,
                next.startDirection,
            );

            if (angle < minimumAngle) {
                continue;
            }

            corners.push({
                commandIndex:
                    current.commandIndex,

                x: current.end.x,
                y: current.end.y,
            });
        }

        return corners;
    }

    function createPathSegments(
        subpath: Path,
    ): {
        commandIndex: number;
        start: Point;
        end: Point;
        startDirection: Point;
        endDirection: Point;
    }[] {
        const segments: {
            commandIndex: number;
            start: Point;
            end: Point;
            startDirection: Point;
            endDirection: Point;
        }[] = [];

        let currentPoint: Point | undefined;
        let subpathStart: Point | undefined;

        for (
            let commandIndex = 0;
            commandIndex <
            subpath.commands.length;
            commandIndex++
        ) {
            const command =
                subpath.commands[commandIndex]!;

            if (command.type === 'M') {
                currentPoint = getPoint(
                    command.x,
                    command.y,
                    'M endpoint',
                );

                subpathStart = currentPoint;
                continue;
            }

            if (!currentPoint) {
                throw new Error(
                    'Path command encountered before M',
                );
            }

            if (command.type === 'L') {
                const end = getPoint(
                    command.x,
                    command.y,
                    'L endpoint',
                );

                const direction = subtractPoints(
                    end,
                    currentPoint,
                );

                segments.push({
                    commandIndex,
                    start: currentPoint,
                    end,
                    startDirection: direction,
                    endDirection: direction,
                });

                currentPoint = end;
                continue;
            }

            if (command.type === 'Q') {
                const control = getPoint(
                    command.x1,
                    command.y1,
                    'Q control point',
                );

                const end = getPoint(
                    command.x,
                    command.y,
                    'Q endpoint',
                );

                segments.push({
                    commandIndex,
                    start: currentPoint,
                    end,

                    startDirection: pickDirection(
                        subtractPoints(
                            control,
                            currentPoint,
                        ),
                        subtractPoints(
                            end,
                            currentPoint,
                        ),
                    ),

                    endDirection: pickDirection(
                        subtractPoints(
                            end,
                            control,
                        ),
                        subtractPoints(
                            end,
                            currentPoint,
                        ),
                    ),
                });

                currentPoint = end;
                continue;
            }

            if (command.type === 'C') {
                const control1 = getPoint(
                    command.x1,
                    command.y1,
                    'C first control point',
                );

                const control2 = getPoint(
                    command.x2,
                    command.y2,
                    'C second control point',
                );

                const end = getPoint(
                    command.x,
                    command.y,
                    'C endpoint',
                );

                segments.push({
                    commandIndex,
                    start: currentPoint,
                    end,

                    startDirection: pickDirection(
                        subtractPoints(
                            control1,
                            currentPoint,
                        ),
                        subtractPoints(
                            control2,
                            currentPoint,
                        ),
                        subtractPoints(
                            end,
                            currentPoint,
                        ),
                    ),

                    endDirection: pickDirection(
                        subtractPoints(
                            end,
                            control2,
                        ),
                        subtractPoints(
                            end,
                            control1,
                        ),
                        subtractPoints(
                            end,
                            currentPoint,
                        ),
                    ),
                });

                currentPoint = end;
                continue;
            }

            if (
                command.type === 'Z' &&
                subpathStart
            ) {
                const direction = subtractPoints(
                    subpathStart,
                    currentPoint,
                );

                if (
                    getVectorLength(direction) >
                    Number.EPSILON
                ) {
                    segments.push({
                        commandIndex,
                        start: currentPoint,
                        end: subpathStart,
                        startDirection: direction,
                        endDirection: direction,
                    });
                }

                currentPoint = subpathStart;
            }
        }

        return segments;
    }

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

    function toPrefixSvgPathData(
        subpath: Path,
        commandIndex: number,
        pathPrecision: number,
    ): string {
        const prefix = new opentype.Path();

        prefix.commands = subpath.commands
            .slice(0, commandIndex + 1)
            .filter(function (command) {
                return command.type !== 'Z';
            })
            .map(cloneCommand);

        return prefix.toPathData(
            pathPrecision,
        );
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

    function getDirectionChange(
        incoming: Point,
        outgoing: Point,
    ): number {
        const incomingLength =
            getVectorLength(incoming);

        const outgoingLength =
            getVectorLength(outgoing);

        if (
            incomingLength === 0 ||
            outgoingLength === 0
        ) {
            return 0;
        }

        const cosine =
            (
                incoming.x * outgoing.x +
                incoming.y * outgoing.y
            ) /
            (
                incomingLength *
                outgoingLength
            );

        const clampedCosine = Math.max(
            -1,
            Math.min(1, cosine),
        );

        return (
            Math.acos(clampedCosine) *
            180 /
            Math.PI
        );
    }

    function pickDirection(
        ...directions: Point[]
    ): Point {
        for (const direction of directions) {
            if (
                getVectorLength(direction) >
                Number.EPSILON
            ) {
                return direction;
            }
        }

        return {
            x: 0,
            y: 0,
        };
    }

    function subtractPoints(
        end: Point,
        start: Point,
    ): Point {
        return {
            x: end.x - start.x,
            y: end.y - start.y,
        };
    }

    function getVectorLength(
        vector: Point,
    ): number {
        return Math.hypot(
            vector.x,
            vector.y,
        );
    }

    function getPoint(
        x: unknown,
        y: unknown,
        description: string,
    ): Point {
        if (
            typeof x !== 'number' ||
            typeof y !== 'number'
        ) {
            throw new Error(
                `${description} has invalid coordinates`,
            );
        }

        return {
            x,
            y,
        };
    }

    function roundCoordinate(
        value: number,
        pathPrecision: number,
    ): number {
        const multiplier =
            10 ** pathPrecision;

        return (
            Math.round(value * multiplier) /
            multiplier
        );
    }

    function cloneCommand(
        command: Path['commands'][number],
    ): Path['commands'][number] {
        return {
            ...command,
        } as Path['commands'][number];
    }
}