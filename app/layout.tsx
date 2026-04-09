import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { PLATFORM } from '@/config/platform';
import Nav from '@/components/Nav';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: PLATFORM.name,
    template: `%s — ${PLATFORM.name}`,
  },
  description: PLATFORM.tagline,
  metadataBase: new URL(PLATFORM.url),
  openGraph: {
    title: PLATFORM.name,
    description: PLATFORM.tagline,
    url: PLATFORM.url,
    siteName: PLATFORM.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PLATFORM.name,
    description: PLATFORM.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: '#2C2C2C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-body antialiased">
        <Nav />
        <main>{children}</main>
        <footer className="border-t border-border px-5 py-6">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-mid">
              &copy; 2026 Creative Mind Ventures LLC
            </p>
            <div className="flex gap-4">
              <a href="/privacy" className="text-xs text-mid transition-colors hover:text-charcoal">Privacy Policy</a>
              <a href="/terms" className="text-xs text-mid transition-colors hover:text-charcoal">Terms of Service</a>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
