import Link from 'next/link';

export const metadata = {
  title: 'Politique de Confidentialité - Syllabix',
  description: 'Politique de confidentialité et traitement des données personnelles de Syllabix.',
};

export default function PrivacyPage() {
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-primary mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-neutral-500 mb-12">Dernière mise à jour : 20 juin 2026</p>

        <div className="prose max-w-none space-y-8 text-neutral-700">

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées sur Syllabix
              est la société Afridigi. Pour exercer vos droits, contactez-nous via la page{' '}
              <Link href="/contact" className="text-accent hover:underline">Contact</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>
                <strong>Données d'inscription :</strong> prénom, nom, adresse email, mot de passe
                (chiffré), date de naissance, statut (étudiant, professionnel, etc.)
              </li>
              <li>
                <strong>Données de progression :</strong> scores aux examens, modules complétés,
                réponses aux questions (pour statistiques anonymisées)
              </li>
              <li>
                <strong>Données de certification :</strong> identifiant du certificat, date
                d'obtention, score, type de certification
              </li>
              <li>
                <strong>Données techniques :</strong> adresse IP, type de navigateur, pages
                consultées (via logs de serveur)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Créer et gérer votre compte utilisateur ;</li>
              <li>Vous permettre de passer des examens et de suivre votre progression ;</li>
              <li>Générer et émettre des certificats ;</li>
              <li>Améliorer la qualité de la plateforme (données anonymisées) ;</li>
              <li>Respecter nos obligations légales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">4. Base légale</h2>
            <p>
              Le traitement de vos données repose sur l'exécution du contrat (CGU) que
              vous avez accepté lors de l'inscription. Pour les mineurs de moins de 15 ans,
              le traitement repose également sur le consentement parental recueilli
              conformément à l'article 8 du RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">5. Mineurs</h2>
            <p>
              Syllabix n'est pas destiné aux enfants de moins de 13 ans. L'inscription
              est bloquée pour les utilisateurs ayant indiqué être âgés de moins de 13 ans.
            </p>
            <p className="mt-3">
              Pour les utilisateurs âgés de 13 à 14 ans (révolus), le consentement d'un
              parent ou tuteur légal est obligatoire conformément à l'article 8 du RGPD
              tel qu'implémenté en droit français (seuil de 15 ans). Ce consentement est
              enregistré lors de l'inscription avec horodatage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">6. Sous-traitants</h2>
            <p>Vos données sont hébergées par :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Google Firebase (Firestore, Authentication)</strong> — données stockées
                en Europe (region eur3 ou europe-west). Google LLC, soumis aux clauses
                contractuelles types UE.
              </li>
            </ul>
            <p className="mt-3">
              Aucune donnée personnelle n'est vendue à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">7. Durée de conservation</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Données de compte : jusqu'à la suppression du compte, puis 3 ans ;</li>
              <li>Données de progression et certificats : durée de vie du compte ;</li>
              <li>Logs techniques : 12 mois glissants.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">8. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Droit d'accès à vos données personnelles ;</li>
              <li>Droit de rectification des données inexactes ;</li>
              <li>Droit à l'effacement ("droit à l'oubli") ;</li>
              <li>Droit à la portabilité de vos données ;</li>
              <li>Droit d'opposition au traitement ;</li>
              <li>Droit de retirer votre consentement à tout moment.</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous via la page{' '}
              <Link href="/contact" className="text-accent hover:underline">Contact</Link>.
              Vous pouvez également introduire une réclamation auprès de la{' '}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                CNIL
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">9. Cookies</h2>
            <p>
              Syllabix utilise un cookie de session (<code>syllabix_session</code>) strictement
              nécessaire au fonctionnement de l'authentification. Ce cookie ne contient pas
              de données personnelles. Aucun cookie publicitaire ou de tracking tiers n'est
              utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">10. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. Toute modification substantielle sera
              notifiée par email. La date de dernière mise à jour est indiquée en haut de
              cette page.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 flex gap-4">
          <Link href="/cgu" className="text-accent hover:underline text-sm">
            Conditions Générales d'Utilisation
          </Link>
          <Link href="/" className="text-neutral-500 hover:underline text-sm">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
