import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'Adrian Reategui Cybersecurity Professional | OSCP | OSCP+ | CompTIA Security+',
    description: 'Welcome to my blog, where I share my passion for Cybersecurity',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    customData: `<language>es</language>`,
  });
}