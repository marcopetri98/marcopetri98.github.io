import type { CollectionEntry, CollectionKey } from 'astro:content';
import { ARTICLES_PATH } from '../consts';

type BlogEntry = CollectionEntry<CollectionKey>;

// Single source of truth for article URLs: /articles/<slug>/, where the slug
// is the `slug` frontmatter field (or the file path when it is missing). It
// must match the route in src/pages/articles/[...slug].astro. Published URLs
// must never change, so keep this and each article's slug stable.
export function articleUrl(post: BlogEntry): string {
	return `${ARTICLES_PATH}${post.id}/`;
}

interface ArticleLandingData {
	featuredPosts: BlogEntry[];
	latestPosts: BlogEntry[];
}

export function getArticleLandingData(
	posts: BlogEntry[],
	featuredCount = 4,
	latestCount = 10,
): ArticleLandingData {
	const filteredPosts = posts
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
	const explicitlyFeatured = filteredPosts.filter((post) => post.data.featured);
	const featuredPosts = [...explicitlyFeatured];

	for (const post of filteredPosts) {
		if (featuredPosts.length >= featuredCount) {
			break;
		}

		if (!featuredPosts.some((featuredPost) => featuredPost.id === post.id)) {
			featuredPosts.push(post);
		}
	}

	return {
		featuredPosts: featuredPosts.slice(0, featuredCount),
		latestPosts: filteredPosts.slice(0, latestCount),
	};
}
