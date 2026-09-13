/**
 * REVIEW SOURCE LOGOS
 * ---------------------------------------------------------------------------
 * Where each review was published we show the SOURCE SITE'S OWN logo — the same
 * white plate, the same logo-only treatment the store buttons use — so a card
 * states its outlet at a glance and the whole site reads as one set of badges.
 *
 * The artwork is trimmed and re-scaled to one common content height and
 * committed by `scripts/build-brand-marks.mjs`. Nothing here is redrawn,
 * invented or hot-linked at runtime.
 *
 * An outlet we hold no artwork for returns nothing. Its card names the outlet on
 * the same white plate rather than borrowing another brand's logo or showing a
 * pair of initials — a badge that says "ICNM Journal" is honest; a tile that
 * says "IJ" is a puzzle.
 */

export type SourceLogo = {
  /** Outlet name as the source prints it. */
  name: string;
  /** The outlet's own site, used for the badge tooltip. */
  home: string;
  src: string;
  width: number;
  height: number;
};

/** Every logo is written at one common content height (44px). */
const logo = (name: string, home: string, file: string, width: number): SourceLogo => ({
  name,
  home,
  src: `/sources/${file}`,
  width,
  height: 44,
});

const logos: Record<string, SourceLogo> = {
  amazon: logo('Amazon', 'https://www.amazon.com', 'amazon.png', 145),
  kirkus: logo('Kirkus Reviews', 'https://www.kirkusreviews.com', 'kirkus.png', 201),
  foreword: logo('Foreword Reviews', 'https://www.forewordreviews.com', 'foreword.png', 145),
  'singing-dragon': logo('Singing Dragon', 'https://us.singingdragon.com', 'singing-dragon.png', 176),
  dorrance: logo('Dorrance Publishing Co.', 'https://bookstore.dorrancepublishing.com', 'dorrance.png', 168),
  'barnes-and-noble': logo('Barnes & Noble', 'https://www.barnesandnoble.com', 'barnes-and-noble.png', 284),
};

/** Platform names as they appear in `config/siteData.ts`. */
const MATCHERS: { key: keyof typeof logos; test: RegExp }[] = [
  { key: 'amazon', test: /amazon/ },
  { key: 'barnes-and-noble', test: /barnes|b&n\b/ },
  { key: 'dorrance', test: /dorrance/ },
  { key: 'foreword', test: /foreword/ },
  { key: 'kirkus', test: /kirkus/ },
  // A quote carried on the publisher's own product page states its outlet in
  // the card's own copy, so the publisher's logo is the right badge for it.
  { key: 'singing-dragon', test: /singing\s*dragon|jessica\s*kingsley|hachette/ },
];

/**
 * The logo for a review's source, matched on the OUTLET the review is
 * attributed to — never on the URL host. Reviews are routinely quoted on a
 * publisher's page (a "Booknews.com" notice hosted on the Singing Dragon
 * product page), so matching the host would credit the wrong site. When we hold
 * no artwork for the outlet we return nothing and the card names it instead.
 */
export function sourceLogoFor(platform: string): SourceLogo | undefined {
  const label = platform.toLowerCase();
  for (const { key, test } of MATCHERS) {
    if (test.test(label)) return logos[key];
  }
  return undefined;
}
