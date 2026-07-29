import * as opentype from 'opentype.js';
import type { Glyph, Path } from 'opentype.js';

const ascii =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789' +
    ' .,;:!?\'"()[]{}+-=*/\\_@#$%^&|<>';

type GlyphPathCommand = {
    type: Path['commands'][number]['type'];
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
};

type GeneratedGlyphStroke = {
    commands: GlyphPathCommand[];
};

type GeneratedGlyph = {
    advanceWidth: number;
    commands: GlyphPathCommand[];
    strokes: GeneratedGlyphStroke[];
    kerning: Record<string, number>;
};

export type GeneratedGlyphData = {
    unitsPerEm: number;
    glyphs: Record<string, GeneratedGlyph>;
};

export async function generateGlyphData(): Promise<GeneratedGlyphData> {
    const fontBuffer = await downloadGoogleFont('Share Tech', 400, ascii);
    const font = opentype.parse(fontBuffer);
    const glyphs: GeneratedGlyphData['glyphs'] = {};
    const fontGlyphs = new Map<string, Glyph>();

    for (const character of ascii) {
        fontGlyphs.set(character, font.charToGlyph(character));
    }

    for (const character of ascii) {
        const glyph = fontGlyphs.get(character);

        if (!glyph) {
            continue;
        }

        const glyphPath = glyph.getPath(0, font.unitsPerEm, font.unitsPerEm);
        const commands = closeCommands(glyphPath.commands);
        const strokes: GeneratedGlyphStroke[] = [];
        let strokeCommands: GlyphPathCommand[] = [];

        for (const command of commands) {
            if (command.type === 'M' && strokeCommands.length > 0) {
                strokes.push({
                    commands: strokeCommands
                });
                strokeCommands = [];
            }

            strokeCommands.push(command);

            if (command.type === 'Z') {
                strokes.push({
                    commands: strokeCommands
                });
                strokeCommands = [];
            }
        }

        if (strokeCommands.length > 0) {
            strokes.push({
                commands: [...strokeCommands, { type: 'Z' }]
            });
        }

        const kerning: Record<string, number> = {};

        for (const nextCharacter of ascii) {
            const nextGlyph = fontGlyphs.get(nextCharacter);

            if (!nextGlyph) {
                continue;
            }

            const kerningValue = font.getKerningValue(glyph, nextGlyph);

            if (kerningValue !== 0) {
                kerning[nextCharacter] = kerningValue;
            }
        }

        glyphs[character] = {
            advanceWidth: glyph.advanceWidth ?? 0,
            commands,
            strokes,
            kerning
        };
    }

    return {
        unitsPerEm: font.unitsPerEm,
        glyphs
    };

    function closeCommands(sourceCommands: Path['commands']): GlyphPathCommand[] {
        const closedCommands: GlyphPathCommand[] = [];
        let subpathOpen = false;

        for (const sourceCommand of sourceCommands) {
            const command = cloneCommand(sourceCommand);

            if (command.type === 'M') {
                if (subpathOpen) {
                    closedCommands.push({ type: 'Z' });
                }

                subpathOpen = true;
            } else if (command.type === 'Z') {
                subpathOpen = false;
            }

            closedCommands.push(command);
        }

        if (subpathOpen) {
            closedCommands.push({ type: 'Z' });
        }

        return closedCommands;
    }

    function cloneCommand(command: Path['commands'][number]): GlyphPathCommand {
        return {
            type: command.type,
            x: command.x,
            y: command.y,
            x1: command.x1,
            y1: command.y1,
            x2: command.x2,
            y2: command.y2
        };
    }
}

async function downloadGoogleFont(
    family: string,
    weight: number,
    text: string,
    signal?: AbortSignal
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
        display: 'swap'
    });
    const cssResponse = await fetch(`https://fonts.googleapis.com/css2?${search}`, { signal });

    if (!cssResponse.ok) {
        const details = await cssResponse.text();

        throw new Error(
            `Google Fonts CSS request failed: ${cssResponse.status} ` +
            `${cssResponse.statusText}\n${details}`
        );
    }

    const css = await cssResponse.text();
    const urlMatch = css.match(
        /src:\s*url\((?:"|')?(https:\/\/fonts\.gstatic\.com\/[^)"']+)(?:"|')?\)/i
    );

    if (!urlMatch) {
        throw new Error(
            `Google Fonts returned no downloadable source for ` +
            `"${family}" at weight ${weight}.\n\n${css}`
        );
    }

    const fontResponse = await fetch(urlMatch[1], { signal });

    if (!fontResponse.ok) {
        throw new Error(
            `Google Font download failed: ${fontResponse.status} ` +
            fontResponse.statusText
        );
    }

    const downloaded = await fontResponse.arrayBuffer();

    if (downloaded.byteLength < 4) {
        throw new Error('The downloaded font file is invalid or empty');
    }

    const signature = new DataView(downloaded).getUint32(0, false);

    if (signature === 0x774f4632) {
        const { default: decompress } = await import('woff2-encoder/decompress');
        const decompressed = await decompress(downloaded);

        return decompressed.buffer.slice(
            decompressed.byteOffset,
            decompressed.byteOffset + decompressed.byteLength
        ) as ArrayBuffer;
    }

    const isOpenType =
        signature === 0x00010000 ||
        signature === 0x4f54544f ||
        signature === 0x74727565 ||
        signature === 0x74797031 ||
        signature === 0x774f4646;

    if (!isOpenType) {
        throw new Error(
            `Unsupported font signature: 0x${signature
                .toString(16)
                .padStart(8, '0')}`
        );
    }

    return downloaded;
}
