import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { defineNuxtModule } from '@nuxt/kit';
import { generateGlyphData } from './generate-glyph-data';

export default defineNuxtModule({
    meta: {
        name: 'glyph-data'
    },

    async setup(_options, nuxt) {
        const outputPath = resolve(nuxt.options.rootDir, 'app/assets/generated/glyphs.json');

        try {
            await access(outputPath);
            return;
        } catch {
            // Generate the missing file.
        }

        const glyphs = await generateGlyphData();

        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, JSON.stringify(glyphs), 'utf8');
    }
});
