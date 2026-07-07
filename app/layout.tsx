import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import CookieConsent from '@/components/CookieConsent';
import { LanguageProvider } from '@/lib/LanguageContext';
import { A11yProvider } from '@/lib/AccessibilityContext';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const dm = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Syllabix — Certification des Compétences Numériques en Afrique',
  description: 'Évaluez et certifiez vos compétences numériques avec Syllabix. 7 modules, résultats en moins de 30 minutes.',
  keywords: ['certification', 'compétences numériques', 'Afrique', 'formation digitale', 'e-learning', 'pan-africain'],
  openGraph: {
    title: 'Syllabix — Certification des Compétences Numériques',
    description: 'La plateforme de certification des compétences numériques en Afrique',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/syllabix-logo-with-name.png',
        width: 1200,
        height: 630,
        alt: 'Syllabix — Certification des Compétences Numériques en Afrique',
      },
    ],
  },
  robots: { index: true, follow: true },
  authors: [{ name: 'Syllabix' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${dm.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1A237E" />
        <link rel="apple-touch-icon" href="/syllabix-logo-simple.png" />
        <link rel="icon" href="/syllabix-logo-simple.png" />
      </head>
      <body className="antialiased">
        {/* Lien d'évitement pour accessibilité clavier */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:font-semibold"
        >
          Aller au contenu principal
        </a>
        <LanguageProvider>
          <A11yProvider>
            <ErrorBoundary>
              <Header />
              <main id="main-content" className="min-h-screen" tabIndex={-1}>{children}</main>
              <Footer />
              <CookieConsent />
            </ErrorBoundary>
          </A11yProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
