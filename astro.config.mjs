// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://marcopetri.it',
	integrations: [mdx(), sitemap()],
	// Published URLs that moved: each one keeps working by forwarding to the
	// new address, so links people already shared never break.
	redirects: {
		'/blog/software_engineering/2025-06-18-hq-code-pytest': '/articles/high-quality-code-with-pytest-2025/',
	},
});
