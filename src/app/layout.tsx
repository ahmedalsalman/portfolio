import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Reem_Kufi } from 'next/font/google';
import { Spotlight } from '@/components/Spotlight';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

const display = Bodoni_Moda({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--f-display', display: 'swap' });
const kufi = Reem_Kufi({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--f-kufi', display: 'swap' });
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-sans', display: 'swap' });
const sansAr = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--f-sans-ar', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono', display: 'swap' });

const TITLE = 'Ahmed Al-Salman — Frontend developer';
const DESCRIPTION =
  'Frontend developer building fast web and mobile apps, from consumer products to internal tools. Based in Amman, open to remote roles. Try the live products and demos.';

// Share previews: the images are rendered by scripts/render-share.mjs into public/og/.
export const metadata: Metadata = {
  metadataBase: new URL('https://ahmedalsalman.dev'),
  title: { default: TITLE, template: '%s — Ahmed Al-Salman' },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Ahmed Al-Salman',
    locale: 'en',
    url: '/',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og/home.jpg', width: 1200, height: 630, alt: 'Ahmed Al-Salman, frontend developer, with screens from three of his apps' }],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf6f0' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1119' },
  ],
};

// Applies a saved theme before paint so there's no flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${kufi.variable} ${sans.variable} ${sansAr.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Spotlight />
        <SiteHeader />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
