import type { Metadata, Viewport } from "next";
import { DM_Mono, Newsreader } from "next/font/google";
import { SearchPalette } from "@/components/search/search-palette";
import { SearchProvider } from "@/components/search/search-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Toaster } from "@/components/site/toast";
import { getDictionary } from "@/lib/dictionary";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-dm-mono",
});

const dict = getDictionary();

export const metadata: Metadata = {
  metadataBase: new URL(dict.meta.url),
  title: {
    default: `${dict.meta.title} · ${dict.meta.subtitle}`,
    template: `%s · ${dict.meta.title}`,
  },
  description: dict.meta.description,
  openGraph: {
    type: "website",
    siteName: dict.meta.title,
    title: dict.meta.title,
    description: dict.meta.description,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  alternates: { canonical: "/" },
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
            <SiteHeader dict={dict} />
            <main id="main" className="gutter pt-8" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter dict={dict} />
            <SearchPalette
              domainNames={Object.fromEntries(
                Object.entries(dict.taxonomy.domains).map(([k, v]) => [k, v.name]),
              )}
              tryWords={dict.meta.tryWords}
              total={dict.entries.length}
            />
            <Toaster />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
