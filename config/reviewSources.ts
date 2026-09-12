/**
 * REVIEW SOURCE LOGOS
 * ---------------------------------------------------------------------------
 * Where each review was published we show the SOURCE SITE'S OWN LOGO (badge),
 * not initials, so a reader can see at a glance which outlet a quote came from.
 *
 * Every asset in `public/sources/` was downloaded from the source site itself
 * (its favicon / apple-touch-icon / header wordmark) — e.g. the Dorrance
 * wordmark is the one on dorrancepublishing.com's own header. Nothing here is
 * redrawn or invented, and nothing is hot-linked at runtime.
 *
 * `mark` is the square icon used on the compact cards; `src` is the wordmark
 * used in the full reading view (falls back to the mark when a source has no
 * wordmark asset).
 */

export type SourceLogoAsset = { src: string; width: number; height: number };

export type SourceLogo = {
  /** Outlet name as printed by the source. */
  name: string;
  /** The outlet's own site, used for the badge tooltip. */
  home: string;
  /** Wordmark artwork (wide). */
  src: string;
  width: number;
  height: number;
  /** Square icon, when the outlet publishes one. */
  mark?: SourceLogoAsset;
};

const logos: Record<string, SourceLogo> = {
  amazon: {
    name: 'Amazon',
    home: 'https://www.amazon.com',
    src: '/sources/amazon.png',
    width: 400,
    height: 121,
  },
  'barnes-and-noble': {
    name: 'Barnes & Noble',
    home: 'https://www.barnesandnoble.com',
    src: '/sources/barnes-and-noble.png',
    width: 1875,
    height: 291,
  },
  biblio: {
    name: 'Biblio.com',
    home: 'https://www.biblio.com',
    src: '/sources/biblio.png',
    width: 128,
    height: 128,
  },
  booknews: {
    name: 'Booknews.com',
    home: 'https://www.booknews.com',
    src: '/sources/booknews.png',
    width: 128,
    height: 128,
  },
  dorrance: {
    name: 'Dorrance Publishing Co.',
    home: 'https://bookstore.dorrancepublishing.com',
    src: '/sources/dorrance.png',
    width: 600,
    height: 157,
    mark: { src: '/sources/dorrance-mark.png', width: 128, height: 128 },
  },
  epinions: {
    name: 'epinions.com',
    home: 'https://www.epinions.com',
    src: '/sources/epinions.png',
    width: 128,
    height: 128,
  },
  foreword: {
    name: 'Foreword Reviews',
    home: 'https://www.forewordreviews.com',
    src: '/sources/foreword.png',
    width: 128,
    height: 128,
  },
  kirkus: {
    name: 'Kirkus Reviews',
    home: 'https://www.kirkusreviews.com',
    src: '/sources/kirkus.png',
    width: 32,
    height: 32,
  },
  'singing-dragon': {
    name: 'Singing Dragon',
    home: 'https://us.singingdragon.com',
    src: '/sources/singing-dragon.png',
    width: 600,
    height: 150,
  },
};

/** Platform names as they appear in `config/siteData.ts`. */
const MATCHERS: { key: keyof typeof logos; test: RegExp }[] = [
  { key: 'amazon', test: /amazon/ },
  { key: 'epinions', test: /epinions/ },
  { key: 'barnes-and-noble', test: /barnes|b&n\b/ },
  { key: 'biblio', test: /biblio/ },
  { key: 'dorrance', test: /dorrance/ },
  { key: 'foreword', test: /foreword/ },
  { key: 'kirkus', test: /kirkus/ },
  { key: 'singing-dragon', test: /singing\s*dragon|jessica\s*kingsley|hachette/ },
  { key: 'booknews', test: /booknews/ },
];

/**
 * The logo for a review's source, matched on the OUTLET the review is
 * attributed to — never on the URL host. Reviews are routinely quoted on a
 * publisher's or the author's own page (a "Booknews.com" notice hosted on the
 * Singing Dragon product page, an Amazon reader review archived on
 * lifecoachdoc.net), so matching the host would credit the wrong site. When we
 * hold no artwork for the outlet we return nothing and the card falls back to
 * a neutral initials tile.
 */
export function sourceLogoFor(platform: string): SourceLogo | undefined {
  const label = platform.toLowerCase();
  for (const { key, test } of MATCHERS) {
    if (test.test(label)) return logos[key];
  }
  return undefined;
}
