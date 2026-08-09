import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        docsLocale: z.enum(['en', 'zh', 'ja', 'ko']),
        route: z.string().regex(/^\/(?:(?:zh|ja|ko)\/)?(?:[a-z0-9-]+\/)*$/),
      }),
    }),
  }),
};
