// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Marco Petri, MSc | PhD Student in Information Technology';
export const SITE_DESCRIPTION = "This is Marco Petri's personal website, where he shares tech posts and general opinions.";
export const SITE_OWNER = 'Marco Petri';

// Paths of the redesigned pages: the site header links to the portfolio
// sections and to the articles page.
export const PORTFOLIO_PATH = '/';
export const ARTICLES_PATH = '/articles/';

// Fixed vocabulary of article tags (slug -> label). Articles may only use these
// slugs, so a typo fails the build; the articles page only offers the tags that
// at least one article uses.
export const ARTICLE_TAGS = {
    'research': 'Research',
    'machine-learning': 'Machine Learning',
    'software-engineering': 'Software Engineering',
    'tools': 'Tools',
    'opinion': 'Opinion',
    'productivity': 'Productivity',
    'economy': 'Economy',
    'life': 'Life',
    'politics-society': 'Politics & Society',
} as const;

export type ArticleTag = keyof typeof ARTICLE_TAGS;

export const ARTICLE_TAG_SLUGS = Object.keys(ARTICLE_TAGS) as [ArticleTag, ...ArticleTag[]];
