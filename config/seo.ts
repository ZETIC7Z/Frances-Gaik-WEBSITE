import type { Metadata } from 'next';
import { books, site } from '@/config/siteData';

/**
 * SEARCH, SOCIAL & STRUCTURED DATA
 * ---------------------------------------------------------------------------
 * One place that answers "how does this site describe itself to a machine?" —
 * canonical URLs, the OpenGraph/Twitter card, the sitemap origin, robots
 * policy, and the JSON-LD graph. Every page pulls its metadata from
 * `pageMetadata`, so no route can drift into having a title but no card, or a
 * card pointing at the wrong URL.
 */

/** Canonical origin. Preview deployments canonicalise back to production. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lifecoachdoc.vercel.app').replace(
  /\/+$/,
  '',
);

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/') {
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * The share card, built by `scripts/build-social-assets.mjs`. 1200×630 is the
 * canonical large-preview size for Facebook, Messenger, WhatsApp, LinkedIn,
 * Slack, Discord and X, so every platform crops it identically.
 */
export const shareImage = {
  url: '/og/og-image.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Dr. Frances Gaik — “Managing depression with mind, body & movement.” Author, researcher and Qigong practitioner.',
} as const;

export const siteName = site.name;

export const siteTitle = `${site.name} — Managing Depression with Qigong & Dialogues from Beyond`;

export const siteDescription =
  'Official author site of Dr. Frances Gaik, PsyD, LCPC — both published works, verified source-attributed reviews, biography, and purchase links for Managing Depression with Qigong and Dialogues from Beyond.';

export const keywords = [
  'Dr. Frances Gaik',
  'Fran Gaik',
  'Frances Gaik PsyD',
  'Managing Depression with Qigong',
  'Dialogues from Beyond',
  'qigong for depression',
  'clinical hypnosis',
  'life coaching',
  'collaborative divorce coaching',
  'LCPC therapist Willowbrook Illinois',
  'author website',
];

/**
 * Only the production deployment is indexable. Vercel preview builds inherit
 * the production canonical URL, so letting them into the index would publish
 * duplicate content under a URL nobody is meant to find.
 */
export const isIndexable = (process.env.VERCEL_ENV ?? 'production') === 'production';

type PageMetaInput = {
  /** Page title without the site suffix — the suffix is added for you. */
  title: string;
  description: string;
  /** Route the page lives at, used for its canonical and card URL. */
  path: string;
  /** Set for the home page, whose title is already absolute. */
  absoluteTitle?: boolean;
};

/**
 * Complete metadata for one route: title, description, canonical, keywords and
 * a matching OpenGraph + Twitter card. Rendered page titles and card titles
 * stay identical, so a link looks the same everywhere it is pasted.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${siteName}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: fullTitle,
      description,
      siteName,
      locale: 'en_US',
      images: [shareImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [shareImage.url],
    },
  };
}

/** Strips a leading figure count out of a listing such as "192 pp paperback". */
function pageCount(pages: string): number | undefined {
  const match = pages.match(/(\d+)\s*pp/);
  return match ? Number(match[1]) : undefined;
}

/** Parses "$21.95 publisher list price" into a schema.org price. */
function listPrice(price: string): string | undefined {
  const match = price.match(/\$([\d.]+)/);
  return match ? match[1] : undefined;
}

const isbn13 = (isbn?: string) => isbn?.replace(/[^0-9Xx]/g, '');

const bookFormat = (format: string) =>
  /kindle|ebook/i.test(format) && /paperback/i.test(format)
    ? 'https://schema.org/Paperback'
    : /kindle|ebook/i.test(format)
      ? 'https://schema.org/EBook'
      : 'https://schema.org/Paperback';

/**
 * A schema.org graph for the site: the author, the site, the practice, and each
 * published work. Everything here is copied from `config/siteData.ts` — the
 * same verified content the pages render — and deliberately excludes
 * `aggregateRating`, because inventing a rating count to win a rich snippet
 * would misrepresent the sources the reviews come from.
 */
export function structuredData() {
  const personId = `${siteUrl}/#person`;
  const practiceId = `${siteUrl}/#practice`;

  const works = books.map((book) => {
    const price = listPrice(book.price);
    const primaryStore = book.stores[0];
    const cover = book.cover.startsWith('http') ? book.cover : absoluteUrl(book.cover);

    return {
      '@type': 'Book',
      '@id': `${siteUrl}/books#${book.id}`,
      name: book.title,
      description: book.blurb,
      author: { '@id': personId },
      publisher: { '@type': 'Organization', name: book.publisher },
      isbn: isbn13(book.isbn),
      numberOfPages: pageCount(book.pages),
      bookFormat: bookFormat(book.format),
      inLanguage: 'en',
      image: cover,
      url: primaryStore?.href,
      ...(price
        ? {
            offers: {
              '@type': 'Offer',
              price,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: primaryStore?.href,
              seller: { '@type': 'Organization', name: primaryStore?.label },
            },
          }
        : {}),
      ...(book.year ? { datePublished: book.year } : {}),
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: siteName,
        alternateName: `${site.fullName} — Author`,
        description: siteDescription,
        inLanguage: 'en-US',
        publisher: { '@id': personId },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: site.fullName.replace(/,.*$/, ''),
        alternateName: 'Dr. Fran Gaik',
        honorificSuffix: 'PsyD, LCPC',
        jobTitle: 'Author, Researcher & Qigong Practitioner',
        description: siteDescription,
        url: `${siteUrl}/`,
        image: absoluteUrl('/images/author-enhanced.jpg'),
        telephone: site.phone,
        email: site.email,
        knowsAbout: [
          'Clinical psychology',
          'Qigong',
          'Depression',
          'Clinical hypnosis',
          'Life coaching',
          'Collaborative divorce coaching',
        ],
        sameAs: [site.sourceSite, 'https://www.linkedin.com/in/fran-gaik-75700413'],
        worksFor: { '@id': practiceId },
      },
      {
        '@type': 'ProfessionalService',
        '@id': practiceId,
        name: `${siteName} — Counseling & Coaching`,
        description:
          'Life coaching, counseling, assessment, clinical hypnosis and Qigong-informed depression care.',
        url: `${siteUrl}/services`,
        telephone: site.phone,
        email: site.email,
        founder: { '@id': personId },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Willowbrook',
          addressRegion: 'IL',
          addressCountry: 'US',
        },
        areaServed: { '@type': 'Country', name: 'United States' },
        knowsAbout: ['Life coaching', 'Counseling', 'Clinical hypnosis', 'Qigong'],
      },
      ...works,
    ],
  };
}
