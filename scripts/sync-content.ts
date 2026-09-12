/**
 * CONTENT SYNC — lifecoachdoc.net
 * ---------------------------------------------------------------------------
 * Playwright crawler that maps the legacy site and prints a structured
 * extraction of each page's visible text and outgoing links. Use it to review
 * source changes before hand-editing config/siteData.ts (the site ships a
 * reviewed static snapshot, not a runtime scrape).
 *
 *   npm run sync:content
 *
 * First run may need: npx playwright install chromium
 */

import { chromium } from 'playwright';

const BASE = 'https://www.lifecoachdoc.net';

const PAGES = [
  '/welcome.html',
  '/books.html',
  '/services.html',
  '/depressionandqigongtreatment.html',
  '/hypnosis.html',
  '/contactus.html',
  '/consentformprivacypolicy.html',
];

type Extract = {
  url: string;
  title: string;
  headings: string[];
  paragraphs: string[];
  listItems: string[];
  links: { text: string; href: string }[];
};

async function extractPage(page: import('playwright').Page, path: string): Promise<Extract> {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  return page.evaluate(() => {
    const text = (el: Element) => (el.textContent || '').replace(/\s+/g, ' ').trim();
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map(text).filter(Boolean);
    const paragraphs = Array.from(document.querySelectorAll('p,font')).map(text).filter((t) => t.length > 40);
    const listItems = Array.from(document.querySelectorAll('li')).map(text).filter(Boolean);
    const links = Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      text: text(a),
      href: (a as HTMLAnchorElement).href,
    }));
    return {
      url: location.href,
      title: document.title,
      headings,
      paragraphs: Array.from(new Set(paragraphs)),
      listItems: Array.from(new Set(listItems)),
      links,
    };
  });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const path of PAGES) {
    try {
      const data = await extractPage(page, path);
      console.log('\n==================================================');
      console.log('URL:', data.url);
      console.log('TITLE:', data.title);
      console.log('-- headings --');
      data.headings.forEach((h) => console.log('  #', h));
      console.log('-- paragraphs --');
      data.paragraphs.forEach((p) => console.log('  ¶', p.slice(0, 300) + (p.length > 300 ? '…' : '')));
      console.log('-- list items --');
      data.listItems.forEach((li) => console.log('  -', li));
      console.log('-- external links --');
      data.links
        .filter((l) => /^https?:/.test(l.href) && !l.href.includes('lifecoachdoc.net'))
        .forEach((l) => console.log('  →', l.text || '(no text)', '→', l.href));
    } catch (err) {
      console.error('FAILED', path, err instanceof Error ? err.message : err);
    }
  }
  await browser.close();
}

main();
