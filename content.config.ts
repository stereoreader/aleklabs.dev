import { defineCollection, defineContentConfig } from '@nuxt/content';
import { z } from 'zod';

export default defineContentConfig({
    collections: {
        articles: defineCollection({
            type: 'page',
            source: 'articles/**/*.md',
            schema: z.object({
                date: z.string(),
                image: z.string().optional(),
                tags: z.array(z.string()).optional()
            })
        })
    }
});