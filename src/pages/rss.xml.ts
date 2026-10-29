import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { ARTICLE_TAGS, SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { articleUrl, getArticleLandingData } from '../utils/articleLanding';

export async function GET(context: APIContext): Promise<Response> {
	if (!context.site) {
		throw new Error('The RSS feed needs `site` to be set in astro.config.mjs.');
	}

	const posts = await getCollection('articles');
	// Newest first, so readers that keep the feed order show the latest article on top.
	const { latestPosts } = getArticleLandingData(posts, 0, posts.length);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: latestPosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: articleUrl(post),
			categories: post.data.tags.map((tag) => ARTICLE_TAGS[tag]),
		})),
	});
}
