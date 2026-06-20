import Link from 'next/link';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation - Syllabix',
  description: 'Conditions générales d\'utilisation de la plateforme Syllabix.',
};

export default function CGUPage() {
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-primary mb-4">
          Conditions Générales d'Utilisation
        </h1>
        <p className="text-sm text-neutral-500 mb-12">Dernière mise à jour : 20 juin 2026</p>

        <div className="prose max-w-none space-y-8 text-neutral-700">

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et
              l'utilisation de la plateforme Syllabix, éditée par Afridigi, accessible à
              l'adresse syllabix.com. En créant un compte, vous acceptez l'intégralité des
              présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">2. Accès à la plateforme</h2>
            <p>
              L'accès à Syllabix est ouvert à toute personne âgée d'au moins 13 ans.
              Conformément à l'article 8 du RGPD, les personnes âgées de moins de 15 ans
              doivent obtenir le consentement de leur parent ou tuteur légal avant de créer
              un compte.
            </p>
            <p className="mt-3">
              L'inscription est gratuite. Syllabix se réserve le droit de modifier ou
              d'interrompre l'accès à tout ou partie des services à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">3. Compte utilisateur</h2>
            <p>
              Vous êtes responsable de la confidentialité de vos identifiants de connexion.
              Toute utilisation de votre compte sous votre responsabilité. Vous devez
              nous informer immédiatement de toute utilisation non autorisée de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">4. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de la plateforme (questions, modules, certificats, textes,
              images, logos) est la propriété exclusive d'Afridigi. Toute reproduction,
              modification ou distribution sans autorisation écrite est interdite.
            </p>
            <p className="mt-3">
              Les certificats émis par Syllabix sont personnels et non cessibles. Ils attestent
              de la réussite de l'utilisateur au moment de l'examen et ne constituent pas un
              diplôme officiel reconnu par l'État.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">5. Certification</h2>
            <p>
              Les examens de certification comportent 35 questions. Le score minimal de
              réussite est de 60%. Les certificats sont générés automatiquement en cas de
              réussite et disponibles depuis le tableau de bord de l'utilisateur.
            </p>
            <p className="mt-3">
              Syllabix se réserve le droit d'annuler un certificat en cas de fraude avérée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">6. Comportement des utilisateurs</h2>
            <p>Il est interdit d'utiliser Syllabix pour :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Tenter de contourner les mécanismes d'examen ou de certification ;</li>
              <li>Partager ses identifiants ou faire passer un examen à la place d'un tiers ;</li>
              <li>Publier ou transmettre des contenus illicites, offensants ou malveillants ;</li>
              <li>Collecter des données personnelles d'autres utilisateurs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">7. Limitation de responsabilité</h2>
            <p>
              Syllabix est fourni "tel quel". Afridigi ne saurait être tenu responsable de
              l'interruption du service, de la perte de données ou de tout dommage résultant
              de l'utilisation de la plateforme. La disponibilité du service n'est pas garantie
              à 100%.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">8. Modifications des CGU</h2>
            <p>
              Afridigi se réserve le droit de modifier les présentes CGU à tout moment.
              Les utilisateurs seront informés des modifications substantielles par email
              ou via une notification sur la plateforme. L'utilisation continue de la
              plateforme après modification vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">9. Droit applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit français. Tout litige sera soumis
              aux tribunaux compétents du ressort du siège social d'Afridigi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">10. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU, contactez-nous via la page{' '}
              <Link href="/contact" className="text-accent hover:underline">
                Contact
              </Link>
              .
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 flex gap-4">
          <Link href="/privacy" className="text-accent hover:underline text-sm">
            Politique de confidentialité
          </Link>
          <Link href="/" className="text-neutral-500 hover:underline text-sm">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
