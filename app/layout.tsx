import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Syllabix - Plateforme d\'Évaluation des Compétences Numériques',
  description: 'Évaluez et certifiez vos compétences numériques avec Syllabix. 7 modules couvrant les compétences essentielles en Afrique.',
  keywords: ['certification', 'compétences numériques', 'Afrique', 'formation'],
  openGraph: {
    title: 'Syllabix - Évaluation des Compétences Numériques',
    description: 'Plateforme de certification des compétences numériques en Afrique',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0D1B47" />
        <meta name="description" content="Plateforme d'évaluation des compétences numériques en Afrique" />
        <link rel="apple-touch-icon" href="/syllabix-logo-simple.png" />
        <link rel="icon" href="/syllabix-logo-simple.png" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
