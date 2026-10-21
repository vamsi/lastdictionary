import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SearchProvider } from "@/components/search/search-provider";
import { SearchRoot } from "@/components/search/search-root";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Toaster } from "@/components/site/toast";
import { tryWordsForDate } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { metaDescription } from "@/lib/seo";
import { TAGLINE } from "@/lib/site";
import "./globals.css";

// Static weights of the two faces, self-hosted from the @fontsource packages: 140 KB in all,
// against 440 KB for the variable fonts, which is what the largest-contentful-paint budget allows.

const newsreader = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/newsreader/files/newsreader-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/newsreader/files/newsreader-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../node_modules/@fontsource/newsreader/files/newsreader-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/newsreader/files/newsreader-latin-600-italic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-newsreader",
  adjustFontFallback: "Times New Roman",
});

const dmMono = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../node_modules/@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-dm-mono",
  preload: false,
  adjustFontFallback: false,
});

const dict = getDictionary();

export const metadata: Metadata = {
  metadataBase: new URL(dict.meta.url),
  title: {
    default: `${dict.meta.title} · ${TAGLINE}`,
    template: `%s · ${dict.meta.title}`,
  },
  description: metaDescription(dict.meta.description),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: dict.meta.title,
    title: dict.meta.title,
    description: metaDescription(dict.meta.description),
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  alternates: { canonical: "/", types: { "application/json": "/data/dictionary.json" } },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcf7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1718" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <ThemeProvider>
          <SearchProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="main" className="gutter pt-8" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter dict={dict} />
            <SearchRoot
              domainNames={Object.fromEntries(
                Object.entries(dict.taxonomy.domains).map(([k, v]) => [k, v.name]),
              )}
              tryWords={tryWordsForDate(dict.essentialsByReference, new Date())}
              total={dict.entries.length}
            />
            <Toaster />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
