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