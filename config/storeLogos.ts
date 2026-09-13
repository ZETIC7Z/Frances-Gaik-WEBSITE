/**
 * STORE LOGOS
 * ---------------------------------------------------------------------------
 * Every place a book can be bought is offered as that shop's OWN logo and
 * nothing else — no written name, no edition note. The logo is what a reader
 * recognises in a glance; the label is only there for a screen reader.
 *
 * Each button is a plain WHITE plate: these marks are drawn as dark ink for a
 * light ground, so white is what makes them legible on a dark page, and the
 * plates then read as one shelf of shops.
 *
 * The artwork is normalised — trimmed of its own margins and re-scaled to one
 * common content height — and committed by `scripts/build-brand-marks.mjs`, so
 * a 32px favicon and a 1875px lockup still sit at the same optical size.
 * Nothing is hot-linked at runtime: the row keeps working if a shop reorganises
 * its CDN.
 *
 * A store is matched to its logo by the HOSTNAME of the link it points at,
 * because that is what the visitor actually clicks; the written label is only a
 * fallback for a shop whose link is a marketplace redirect.
 */

export type StoreLogo = {
  /** Shop name, used for the image's alt text and the button's tooltip. */
  name: string;
  src: string;
  width: number;
  height: number;
};

/** Every logo is written at one common content height (44px). */
const logo = (name: string, file: string, width: number): StoreLogo => ({
  name,
  src: `/stores/${file}`,
  width,
  height: 44,
});

const logos: Record<string, StoreLogo> = {
  amazon: logo('Amazon', 'amazon.png', 146),
  ebay: logo('eBay', 'ebay.png', 110),
  walmart: logo('Walmart', 'walmart.png', 134),
  kobo: logo('Rakuten Kobo', 'kobo.png', 236),
  bookshop: logo('Bookshop.org', 'bookshop.png', 315),
  hachette: logo('Hachette UK', 'hachette.png', 254),
  'singing-dragon': logo('Singing Dragon', 'singing-dragon.png', 176),
  abebooks: logo('AbeBooks', 'abebooks.png', 157),
  goodreads: logo('Goodreads', 'goodreads.png', 204),
  dorrance: logo('Dorrance Bookstore', 'dorrance.png', 168),
  booktopia: logo('Booktopia', 'booktopia.png', 200),
};

/** Host fragments, checked against the link a visitor actually clicks. */
const HOSTS: { key: keyof typeof logos; test: RegExp }[] = [
  { key: 'amazon', test: /(^|\.)amazon\./ },
  { key: 'ebay', test: /(^|\.)ebay\./ },
  { key: 'walmart', test: /(^|\.)walmart\./ },
  { key: 'kobo', test: /(^|\.)kobo\./ },
  { key: 'bookshop', test: /(^|\.)bookshop\.org$/ },
  { key: 'hachette', test: /(^|\.)hachette\./ },
  { key: 'singing-dragon', test: /singingdragon\./ },
  { key: 'abebooks', test: /(^|\.)abebooks\./ },
  { key: 'goodreads', test: /(^|\.)goodreads\./ },
  { key: 'dorrance', test: /dorrancepublishing\./ },
  { key: 'booktopia', test: /(^|\.)booktopia\./ },
];

/** Label fragments, used when a link's host says nothing (marketplace redirects). */
const LABELS: { key: keyof typeof logos; test: RegExp }[] = [
  { key: 'amazon', test: /amazon/ },
  { key: 'singing-dragon', test: /singing\s*dragon/ },
  { key: 'dorrance', test: /dorrance/ },
  { key: 'hachette', test: /hachette/ },
  { key: 'bookshop', test: /bookshop\.org/ },
  { key: 'walmart', test: /walmart/ },
  { key: 'abebooks', test: /abe\s*books/ },
  { key: 'ebay', test: /ebay/ },
  { key: 'kobo', test: /kobo/ },
  { key: 'goodreads', test: /goodreads/ },
  { key: 'booktopia', test: /booktopia/ },
];

function hostOf(href: string): string {
  try {
    return new URL(href).host.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * The logo for a store entry, decided by the link's hostname and falling back
 * to the written label. Returns nothing when no artwork is held for that shop,
 * so its button shows the shop's name instead of an unrelated mark.
 */
export function storeLogoFor(label: string, href?: string): StoreLogo | undefined {
  const host = href ? hostOf(href) : '';
  if (host) {
    for (const { key, test } of HOSTS) {
      if (test.test(host)) return logos[key];
    }
  }
  const name = label.toLowerCase();
  for (const { key, test } of LABELS) {
    if (test.test(name)) return logos[key];
  }
  return undefined;
}
