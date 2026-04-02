import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 1. Create a "parametric" generator function
function createStandardCollection(folderName: string) {
    return defineCollection({
        loader: glob({ base: `./src/content/${folderName}`, pattern: '**/*.{md,mdx}' }),
        schema: ({ image }) =>
            z.object({
                title: z.string(),
                description: z.string(),
                pubDate: z.coerce.date(),
                updatedDate: z.coerce.date().optional(),
                featured: z.boolean().optional(),
                heroImage: z.optional(image()),
            }),
    });
}

// 2. Explicitly bind them to names (Astro requires this)
export const collections = { 
    blog: createStandardCollection('blog'),
};
