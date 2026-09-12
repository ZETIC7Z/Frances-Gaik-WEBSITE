import type { MetadataRoute } from 'next';
import { isIndexable, siteUrl } from '@/config/seo';

/**
 * Preview deployments are disallowed outright: they serve the same content as
 * production from a URL that is not meant to be found, so indexing them would
 * publish duplicate pages. Production allows everything and points crawlers at
 * the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return isIndexable
    ? {
        rules: [{ userAgent: '*', allow: '/' }],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
      }
    : {
        rules: [{ userAgent: '*', disallow: '/' }],
      };
}
