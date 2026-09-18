import type { Metadata, Viewport } from 'next';
import { DM_Mono, Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SplashGate } from '@/components/SignatureSplash';
import AmbientBackground from '@/components/AmbientBackground';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import MobileNav from '@/components/MobileNav';
import BackToTop from '@/components/BackToTop';
import CursorLeaves from '@/components/CursorLeaves';
import RouteWarmup from '@/components/RouteWarmup';
import {
  absoluteUrl,
  isIndexable,
  keywords,
  shareImage,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
  structuredData,
} from '@/config/seo';
import { site } from '@/config/siteData';

/**
 * Fonts are self-hosted through `next/font`, so the three families are served
 * from this origin (no render-blocking request to a font CDN, no extra DNS
 * lookups) and reserved space means no text reflow while they load.
 */
const fontBody = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});
const fontMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

/**
 * Site-wide metadata. `metadataBase` makes every relative URL below absolute,
 * which is what lets a share card resolve when the link is pasted somewhere
 * outside the browser (Messenger, Slack, a feed). Per-page titles, canonicals
 * and cards come from `pageMetadata` in `config/seo.ts`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: site.fullName, url: site.sourceSite }],
  creator: site.fullName,
  publisher: site.fullName,
  keywords,
  category: 'Health & Wellness',
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/'),
    title: siteTitle,
    description: siteDescription,
    siteName,
    locale: 'en_US',
    images: [shareImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [shareImage.url],
  },
  robots: isIndexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      }
    : { index: false, follow: false },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: 'black-translucent',
  },
  // `formatDetection` is deliberately absent: Next.js renders any key listed
  // there as `=no`, and the phone number on /contact is exactly what iOS should
  // be allowed to detect and dial.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // One mode, always dark: this tints the browser chrome on the site's own
  // background and tells the OS to render form controls and scrollbars to
  // match, rather than following the visitor's system preference.
  colorScheme: 'dark',
  themeColor: '#081B1B',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // Lets Next.js skip the smooth-scroll animation on route changes (in-page
      // anchors stay smooth) so a click lands on the new page immediately.
      data-scroll-behavior="smooth"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      {/* The scroll lock for the signature intro is applied from JavaScript (in
          `SplashGate`), never server-rendered — a visitor without JavaScript is
          never left locked on a splash the CSS timeline has already faded. */}
      <body suppressHydrationWarning>
        {/* Structured data travels with every page, so the author, the practice
            and both books are describable to a search engine or an assistant
            without one. `<` is escaped because this string is injected into
            HTML. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c'),
          }}
        />
        <ThemeProvider>
          <SplashGate>
            <AmbientBackground />
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
            <BackToTop />
            <MobileNav />
            <CursorLeaves />
            <RouteWarmup />
          </SplashGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
