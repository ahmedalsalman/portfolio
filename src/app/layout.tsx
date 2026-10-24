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

export const metadata: Metadata = {
  title: { default: 'Ahmed Al-Salman — Frontend developer in Amman', template: '%s — Ahmed Al-Salman' },
  description:
    'Frontend developer in Amman building fast, Arabic-first web and mobile apps. Every project runs as a live demo.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2eff0' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1d21' },
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
