import type { CollectionEntry, CollectionKey } from 'astro:content';

type BlogEntry = CollectionEntry<CollectionKey>;

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
