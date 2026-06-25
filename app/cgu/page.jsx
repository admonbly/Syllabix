import Link from 'next/link';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation - Syllabix',
  description: 'Conditions générales d\'utilisation de la plateforme Syllabix de certification des compétences numériques.',
};

function Section({ number, title, children }) {
  return (
    <section className="pb-8 border-b border-neutral-100 last:border-0">
      <h2 className="text-xl font-heading font-bold text-primary mb-4">
        {number}. {title}
      </h2>
      <div className="space-y-3 text-neutral-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function CGUPage() {
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-4xl font-heading font-bold text-primary mb-2">
          Conditions Générales d'Utilisation
        </h1>
        <p className="text-sm text-neutral-500 mb-12">Dernière mise à jour : 25 juin 2026</p>

        <div className="space-y-8">

          <Section number="1" title="Objet et champ d'application">
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et
              l'utilisation de la plateforme Syllabix, éditée par <strong>Afridigi</strong>, société
              spécialisée dans la formation et la certification des compétences numériques en Afrique,
              accessible à l'adresse <strong>syllabix.com</strong> et ses sous-domaines.
            </p>
            <p>
              En créant un compte ou en utilisant les services de Syllabix, vous reconnaissez avoir lu,
              compris et accepté l'intégralité des présentes CGU. Si vous n'acceptez pas ces conditions,
              vous ne pouvez pas utiliser la plateforme.
            </p>
            <p>
              Syllabix est une plateforme EdTech proposant : des modules d'entraînement aux compétences
              numériques, des examens d'évaluation, des certifications officielles, et un blog de
              ressources pédagogiques.
            </p>
          </Section>

          <Section number="2" title="Accès à la plateforme">
            <p>
              L'accès à Syllabix est ouvert à toute personne physique âgée d'au moins <strong>13 ans</strong>.
              Les personnes âgées de moins de 18 ans doivent obtenir le consentement préalable de leur
              parent ou tuteur légal avant de créer un compte.
            </p>
            <p>
              L'inscription est <strong>gratuite</strong> pour les modules d'entraînement et les
              évaluations. L'accès aux examens de certification peut être soumis à des conditions
              particulières selon les partenariats institutionnels en vigueur.
            </p>
            <p>
              Syllabix se réserve le droit de modifier, suspendre ou interrompre l'accès à tout ou
              partie des services à tout moment, notamment pour des opérations de maintenance. En cas
              d'interruption planifiée, les utilisateurs seront prévenus dans la mesure du possible.
            </p>
          </Section>

          <Section number="3" title="Création et gestion du compte utilisateur">
            <p>
              Pour accéder aux services de Syllabix, vous devez créer un compte en fournissant des
              informations exactes, complètes et à jour : prénom, nom, adresse email valide, et un
              mot de passe sécurisé. Vous pouvez également vous inscrire via votre compte Google.
            </p>
            <p>
              Vous êtes seul responsable de la confidentialité de vos identifiants de connexion.
              Toute utilisation de votre compte est réputée effectuée par vous. Vous devez nous
              informer immédiatement à l'adresse indiquée à l'article 13 de toute utilisation
              non autorisée de votre compte.
            </p>
            <p>
              Un même utilisateur ne peut détenir qu'un seul compte. La création de comptes multiples
              dans le but de contourner des restrictions ou d'obtenir des certifications frauduleuses
              est strictement interdite et entraîne la suspension immédiate de tous les comptes concernés.
            </p>
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis votre tableau de bord ou en
              nous contactant. La suppression du compte entraîne la perte définitive de votre
              historique de progression et de vos certificats, qui restent néanmoins vérifiables
              publiquement via leur identifiant unique pendant 3 ans.
            </p>
          </Section>

          <Section number="4" title="Services proposés">
            <p>Syllabix propose les services suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Modules d'entraînement :</strong> sessions de 5 questions adaptatives par
                module thématique (IT, Internet, Email, Bureautique, Cybersécurité, IA, Employabilité),
                accessibles de manière illimitée et gratuite.
              </li>
              <li>
                <strong>Évaluation diagnostique :</strong> test de 12 questions permettant d'identifier
                le niveau de l'utilisateur avant certification.
              </li>
              <li>
                <strong>Certification par module :</strong> examen de 35 questions par domaine de
                compétences, avec délivrance d'un certificat numérique en cas de réussite (score ≥ 60%).
              </li>
              <li>
                <strong>Certification globale :</strong> examen couvrant l'ensemble des 7 modules,
                attestant d'une maîtrise complète des compétences numériques fondamentales.
              </li>
              <li>
                <strong>Tableau de bord personnel :</strong> suivi de progression, accès aux
                certificats obtenus, historique des examens.
              </li>
              <li>
                <strong>Blog éducatif :</strong> articles et ressources sur les compétences numériques
                en Afrique, accessibles sans inscription.
              </li>
            </ul>
          </Section>

          <Section number="5" title="Certification — règles et validité">
            <p>
              Les certifications Syllabix attestent de la maîtrise des compétences numériques évaluées
              à la date de l'examen. Elles sont co-reconnues par les partenaires institutionnels de
              Syllabix, dont le Ministère de l'Éducation Nationale et de l'Alphabétisation (MENA),
              le Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESRS),
              le Ministère de la Transition Numérique et de la Digitalisation, et l'Agence Emploi
              Jeunes de Côte d'Ivoire.
            </p>
            <p>
              <strong>Les certificats Syllabix ne constituent pas un diplôme d'État</strong> au sens
              du Code de l'Éducation. Ils constituent une attestation de compétences numériques
              professionnelles, vérifiable en ligne par tout employeur ou institution.
            </p>
            <p>Les règles applicables aux examens de certification sont les suivantes :</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Durée de l'examen : 35 minutes pour 35 questions ;</li>
              <li>Score minimal de réussite : 60% (21 bonnes réponses sur 35) ;</li>
              <li>Aucune aide extérieure, IA ou document n'est autorisé pendant l'examen ;</li>
              <li>En cas d'échec, l'utilisateur peut repasser l'examen après un délai raisonnable ;</li>
              <li>Chaque certificat est doté d'un identifiant unique vérifiable publiquement.</li>
            </ul>
            <p>
              Syllabix se réserve le droit d'annuler et d'invalider tout certificat en cas de fraude
              avérée (usurpation d'identité, partage de compte, utilisation d'outils automatisés).
              L'utilisateur concerné peut faire l'objet d'une suspension définitive.
            </p>
          </Section>

          <Section number="6" title="Propriété intellectuelle">
            <p>
              L'ensemble du contenu de la plateforme Syllabix — questions d'examen, modules pédagogiques,
              leçons, articles de blog, certificats, charte graphique, logos, textes et interfaces —
              est la propriété exclusive d'<strong>Afridigi</strong> ou fait l'objet de licences
              accordées à Afridigi.
            </p>
            <p>
              Toute reproduction, extraction, représentation, modification, traduction, adaptation ou
              distribution de tout ou partie de ces contenus, par quelque moyen que ce soit, sans
              autorisation écrite préalable d'Afridigi, est strictement interdite et constitue une
              contrefaçon sanctionnée par les lois applicables.
            </p>
            <p>
              Les certificats émis par Syllabix sont personnels, nominatifs et non cessibles. Il est
              interdit de modifier, falsifier ou présenter comme sien un certificat obtenu par un tiers.
            </p>
          </Section>

          <Section number="7" title="Comportement des utilisateurs et usages interdits">
            <p>En utilisant Syllabix, vous vous engagez à :</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Fournir des informations exactes lors de l'inscription et de la certification ;</li>
              <li>Passer les examens de manière personnelle, sans aide extérieure ;</li>
              <li>Respecter les autres utilisateurs et les équipes Afridigi ;</li>
              <li>Ne pas tenter d'accéder aux systèmes ou bases de données de manière non autorisée.</li>
            </ul>
            <p>Il est strictement interdit :</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>De partager ses identifiants ou de faire passer un examen à la place d'une autre personne ;</li>
              <li>D'utiliser des robots, scripts ou outils automatisés pour interagir avec la plateforme ;</li>
              <li>De tenter d'extraire, copier ou reproduire les questions d'examen ;</li>
              <li>De publier, transmettre ou partager des contenus illicites, diffamatoires, obscènes ou malveillants ;</li>
              <li>De collecter ou traiter les données personnelles d'autres utilisateurs ;</li>
              <li>De créer plusieurs comptes pour le même individu ;</li>
              <li>De vendre, louer ou transférer son compte ou ses certificats à des tiers.</li>
            </ul>
            <p>
              Le non-respect de ces règles peut entraîner la suspension ou la suppression définitive
              du compte, l'annulation des certificats concernés, et le cas échéant des poursuites judiciaires.
            </p>
          </Section>

          <Section number="8" title="Partenariats institutionnels">
            <p>
              Syllabix opère en partenariat avec des institutions gouvernementales ivoiriennes. Ces
              partenariats impliquent que certaines données agrégées et anonymisées sur les niveaux
              de compétences numériques peuvent être partagées avec ces institutions à des fins
              statistiques et de politique publique, sans jamais identifier personnellement un utilisateur.
            </p>
            <p>
              Les partenaires institutionnels n'ont pas accès aux données personnelles des utilisateurs
              individuels. Leurs logos figurent sur les certificats Syllabix en signe de reconnaissance
              institutionnelle.
            </p>
          </Section>

          <Section number="9" title="Limitation de responsabilité">
            <p>
              Syllabix est fourni « en l'état ». Afridigi s'engage à faire ses meilleurs efforts pour
              assurer la disponibilité de la plateforme et la qualité des contenus, mais ne peut
              garantir un service ininterrompu ou exempt d'erreurs.
            </p>
            <p>Afridigi ne saurait être tenu responsable :</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>D'une interruption temporaire du service pour maintenance ou incident technique ;</li>
              <li>De la perte de données résultant d'une défaillance technique imprévue ;</li>
              <li>De l'usage que des employeurs ou institutions font des certificats Syllabix ;</li>
              <li>Des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.</li>
            </ul>
            <p>
              La responsabilité d'Afridigi ne pourra en aucun cas excéder les sommes effectivement
              payées par l'utilisateur au cours des 12 derniers mois précédant le fait générateur.
            </p>
          </Section>

          <Section number="10" title="Suspension et résiliation">
            <p>
              Afridigi se réserve le droit de suspendre ou de résilier l'accès d'un utilisateur à
              la plateforme, sans préavis ni indemnité, en cas de :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Violation des présentes CGU ;</li>
              <li>Fraude à l'examen ou usurpation d'identité ;</li>
              <li>Comportement abusif à l'égard des équipes ou d'autres utilisateurs ;</li>
              <li>Utilisation de la plateforme à des fins illicites.</li>
            </ul>
            <p>
              L'utilisateur peut résilier son compte à tout moment via les paramètres de son
              tableau de bord ou en contactant le support.
            </p>
          </Section>

          <Section number="11" title="Modifications des CGU">
            <p>
              Afridigi se réserve le droit de modifier les présentes CGU à tout moment pour s'adapter
              à l'évolution de la plateforme, des partenariats ou du cadre légal applicable.
            </p>
            <p>
              Les utilisateurs seront informés de toute modification substantielle par email et/ou
              via une notification visible lors de la connexion. La date de mise à jour est indiquée
              en haut de cette page. L'utilisation continue de la plateforme après modification vaut
              acceptation des nouvelles CGU.
            </p>
          </Section>

          <Section number="12" title="Droit applicable et juridiction compétente">
            <p>
              Les présentes CGU sont soumises au droit de la <strong>République de Côte d'Ivoire</strong>.
              En cas de litige relatif à l'interprétation ou à l'exécution des présentes CGU, les
              parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.
            </p>
            <p>
              À défaut de règlement amiable, tout litige sera soumis à la compétence exclusive
              des tribunaux d'Abidjan (Côte d'Ivoire).
            </p>
          </Section>

          <Section number="13" title="Contact">
            <p>
              Pour toute question relative aux présentes CGU, pour signaler un abus ou pour exercer
              vos droits, contactez-nous :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Via la page <Link href="/contact" className="text-accent hover:underline">Contact</Link> de la plateforme ;</li>
              <li>Par email : <strong>contact@afridigi.com</strong> ;</li>
              <li>Par courrier : Afridigi, Abidjan, Côte d'Ivoire.</li>
            </ul>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 flex gap-4 flex-wrap">
          <Link href="/privacy" className="text-accent hover:underline text-sm font-medium">
            Politique de confidentialité →
          </Link>
          <Link href="/" className="text-neutral-500 hover:underline text-sm">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
