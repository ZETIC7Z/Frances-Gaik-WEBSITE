import type { MetadataRoute } from 'next';
import { absoluteUrl, siteUrl } from '@/config/seo';
import { site } from '@/config/siteData';

/**
 * Sitemap for every public route. `lastModified` is the date the content was
 * last reviewed against the author's sources (`site.syncedAt`) rather than the
 * build date — a rebuild does not mean the copy changed, and claiming otherwise
 * teaches crawlers to ignore the signal.
 */
const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/books', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.9, changeFrequency: 'yearly' },
  { path: '/reviews', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/depression-and-qigong-treatment', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/hypnosis', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${site.syncedAt}T00:00:00.000Z`);

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    // Declares the card image for each page, so a shared deep link previews too.
    images: [`${siteUrl}/og/og-image.jpg`],
  }));
}
