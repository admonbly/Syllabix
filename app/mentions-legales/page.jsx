import Link from 'next/link';

export const metadata = {
  title: 'Mentions légales — Syllabix',
  description: 'Mentions légales de la plateforme Syllabix.',
};

export default function MentionsLegalesPage() {
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-heading font-bold text-primary mb-8">Mentions légales</h1>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Éditeur du site</h2>
            <p className="text-neutral-600">
              Syllabix est une plateforme de certification des compétences numériques en Afrique.
            </p>
            <p className="text-neutral-600 mt-2">
              Email de contact :{' '}
              <a href="mailto:contact@syllabix.com" className="text-accent hover:underline">
                contact@syllabix.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Hébergement</h2>
            <p className="text-neutral-600">
              Ce site est hébergé par Vercel Inc., 340 Pine Street Suite 701, San Francisco, CA 94104, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Propriété intellectuelle</h2>
            <p className="text-neutral-600">
              L'ensemble du contenu de ce site (textes, images, logos, vidéos) est protégé par le droit d'auteur.
              Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Données personnelles</h2>
            <p className="text-neutral-600">
              Le traitement des données personnelles est régi par notre{' '}
              <Link href="/privacy" className="text-accent hover:underline">
                Politique de confidentialité
              </Link>{' '}
              et nos{' '}
              <Link href="/cgu" className="text-accent hover:underline">
                Conditions Générales d'Utilisation
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">Cookies</h2>
            <p className="text-neutral-600">
              Syllabix utilise des cookies techniques nécessaires au fonctionnement de la plateforme
              (session, authentification). Aucun cookie publicitaire n'est utilisé.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-accent font-semibold hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
