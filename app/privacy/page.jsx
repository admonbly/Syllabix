import Link from 'next/link';

export const metadata = {
  title: 'Politique de Confidentialité - Syllabix',
  description: 'Politique de confidentialité et traitement des données personnelles sur la plateforme Syllabix.',
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

export default function PrivacyPage() {
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-4xl font-heading font-bold text-primary mb-2">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-neutral-500 mb-2">Dernière mise à jour : 25 juin 2026</p>
        <p className="text-sm text-neutral-500 mb-12">
          Syllabix s'engage à protéger vos données personnelles et à respecter votre vie privée.
          Cette politique vous explique quelles données nous collectons, pourquoi, et comment vous
          pouvez exercer vos droits.
        </p>

        <div className="space-y-8">

          <Section number="1" title="Responsable du traitement">
            <p>
              Le responsable du traitement des données personnelles collectées sur Syllabix est :
            </p>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mt-3">
              <p><strong>Syllabix</strong></p>
              <p>Plateforme EdTech de certification des compétences numériques</p>
              <p>Abidjan, Côte d'Ivoire</p>
              <p>Email : <strong>contact@syllabix.com</strong></p>
              <p>Site : <strong>syllabix.com</strong></p>
            </div>
          </Section>

          <Section number="2" title="Données collectées">
            <p>
              Nous collectons uniquement les données strictement nécessaires au fonctionnement
              de la plateforme et à la délivrance des certifications.
            </p>

            <p className="font-semibold text-neutral-800 mt-4">Données d'inscription</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Prénom et nom ;</li>
              <li>Adresse email ;</li>
              <li>Mot de passe (stocké sous forme de hash chiffré, jamais en clair) ;</li>
              <li>Date de naissance (pour vérification de l'âge minimal) ;</li>
              <li>Profil optionnel : statut (étudiant, professionnel, demandeur d'emploi, autre).</li>
            </ul>

            <p className="font-semibold text-neutral-800 mt-4">Données de progression pédagogique</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Scores obtenus aux examens et évaluations ;</li>
              <li>Modules complétés et niveaux atteints ;</li>
              <li>Réponses aux questions d'entraînement (utilisées uniquement pour l'adaptation pédagogique) ;</li>
              <li>Dates et heures des sessions d'examen.</li>
            </ul>

            <p className="font-semibold text-neutral-800 mt-4">Données de certification</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Identifiant unique du certificat (UUID) ;</li>
              <li>Date et score de certification ;</li>
              <li>Type de certification (module ou globale) ;</li>
              <li>Nom affiché sur le certificat.</li>
            </ul>

            <p className="font-semibold text-neutral-800 mt-4">Données techniques</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Adresse IP lors de la connexion (pour la sécurité du compte) ;</li>
              <li>Type de navigateur et système d'exploitation ;</li>
              <li>Pages consultées et durée des sessions (données agrégées et anonymisées).</li>
            </ul>

            <p className="font-semibold text-neutral-800 mt-4">Données que nous ne collectons PAS</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Numéro de téléphone (sauf si fourni volontairement via le formulaire de contact) ;</li>
              <li>Données bancaires ou de paiement ;</li>
              <li>Données de géolocalisation précise ;</li>
              <li>Contenus de communications privées.</li>
            </ul>
          </Section>

          <Section number="3" title="Finalités du traitement">
            <p>Vos données sont utilisées exclusivement pour les finalités suivantes :</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Gestion du compte :</strong> création, authentification, sécurisation et
                gestion de votre espace personnel ;
              </li>
              <li>
                <strong>Délivrance de la formation :</strong> accès aux modules d'entraînement,
                adaptation du niveau de difficulté, suivi de progression ;
              </li>
              <li>
                <strong>Certification :</strong> organisation des examens, calcul des scores,
                génération et délivrance des certificats numériques vérifiables ;
              </li>
              <li>
                <strong>Vérification publique des certificats :</strong> permettre à tout employeur
                ou institution de vérifier l'authenticité d'un certificat via son identifiant unique ;
              </li>
              <li>
                <strong>Amélioration de la plateforme :</strong> analyse des données d'usage agrégées
                et anonymisées pour améliorer la qualité pédagogique ;
              </li>
              <li>
                <strong>Communication :</strong> envoi d'emails transactionnels (confirmation d'inscription,
                résultat d'examen, certificat obtenu) et, avec votre consentement, d'informations
                sur les nouveaux modules ou ressources ;
              </li>
              <li>
                <strong>Statistiques partenariales :</strong> partage de données <em>agrégées et
                anonymisées</em> avec nos partenaires institutionnels (ministères, agences) à des
                fins de politique publique numérique — aucune donnée individuelle n'est transmise.
              </li>
            </ul>
          </Section>

          <Section number="4" title="Base légale du traitement">
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Exécution du contrat (CGU) :</strong> traitement nécessaire pour vous
                fournir les services auxquels vous vous êtes inscrit (compte, examens, certificats) ;
              </li>
              <li>
                <strong>Intérêt légitime :</strong> sécurité de la plateforme, prévention de la
                fraude, amélioration des contenus pédagogiques ;
              </li>
              <li>
                <strong>Consentement :</strong> envoi de communications marketing ou newsletters
                (vous pouvez vous désabonner à tout moment) ;
              </li>
              <li>
                <strong>Obligation légale :</strong> conservation de certains enregistrements
                conformément aux obligations légales applicables en Côte d'Ivoire.
              </li>
            </ul>
          </Section>

          <Section number="5" title="Mineurs">
            <p>
              Syllabix est accessible dès <strong>13 ans</strong>. La plateforme dispose d'un
              mode adapté aux apprenants mineurs (durée d'examen allongée, interface simplifiée).
            </p>
            <p>
              Pour les utilisateurs âgés de moins de <strong>18 ans</strong>, le consentement
              d'un parent ou tuteur légal est requis lors de l'inscription. Ce consentement est
              enregistré avec horodatage dans notre système.
            </p>
            <p>
              Nous ne collectons aucune donnée auprès d'enfants de moins de 13 ans. Toute
              inscription détectée comme étant en dessous de cet âge sera immédiatement
              supprimée.
            </p>
            <p>
              Les parents ou tuteurs légaux peuvent demander la suppression du compte d'un
              mineur en nous contactant à <strong>contact@syllabix.com</strong> avec une
              preuve de leur lien de parenté.
            </p>
          </Section>

          <Section number="6" title="Sous-traitants et hébergement">
            <p>
              Vos données sont hébergées et traitées par les prestataires suivants, sélectionnés
              pour leur conformité aux standards internationaux de sécurité :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Google Firebase (Firestore, Authentication)</strong> — base de données
                et authentification. Données stockées sur les serveurs Google (région Europe).
                Google LLC est soumis aux clauses contractuelles types approuvées par la
                Commission Européenne.
              </li>
              <li>
                <strong>Vercel Inc.</strong> — hébergement de l'application web. Serveurs
                situés aux États-Unis et en Europe, avec des garanties de sécurité conformes
                aux standards internationaux.
              </li>
            </ul>
            <p>
              <strong>Aucune donnée personnelle n'est vendue, louée ou cédée à des tiers
              commerciaux.</strong> Nos partenaires institutionnels (ministères, agences)
              ne reçoivent que des statistiques agrégées et anonymisées.
            </p>
          </Section>

          <Section number="7" title="Durée de conservation">
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Données de compte actif :</strong> conservées pendant toute la durée
                d'activité du compte ;
              </li>
              <li>
                <strong>Après suppression du compte :</strong> données personnelles supprimées
                sous 30 jours, à l'exception des données de certification qui sont conservées
                3 ans pour permettre la vérification des certificats déjà délivrés ;
              </li>
              <li>
                <strong>Données d'examen et de progression :</strong> conservées pendant la
                durée de vie du compte actif ;
              </li>
              <li>
                <strong>Logs techniques (IP, connexions) :</strong> 12 mois glissants ;
              </li>
              <li>
                <strong>Données de facturation éventuelle :</strong> 5 ans conformément aux
                obligations comptables légales.
              </li>
            </ul>
          </Section>

          <Section number="8" title="Sécurité des données">
            <p>
              Syllabix met en œuvre des mesures techniques et organisationnelles appropriées
              pour protéger vos données personnelles contre tout accès non autorisé, perte,
              destruction ou altération :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Chiffrement des communications via HTTPS/TLS ;</li>
              <li>Mots de passe stockés sous forme de hash (jamais en clair) ;</li>
              <li>Authentification sécurisée via Google Firebase Authentication ;</li>
              <li>Règles d'accès Firestore strictes limitant l'accès aux seules données de l'utilisateur connecté ;</li>
              <li>Aucun accès des partenaires institutionnels aux données individuelles.</li>
            </ul>
            <p>
              En cas de violation de données susceptible d'engendrer un risque pour vos droits
              et libertés, nous nous engageons à vous en informer dans les meilleurs délais.
            </p>
          </Section>

          <Section number="9" title="Vos droits">
            <p>
              Vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Droit d'accès :</strong> obtenir une copie de toutes les données
                personnelles que nous détenons sur vous ;
              </li>
              <li>
                <strong>Droit de rectification :</strong> corriger des données inexactes ou
                incomplètes (accessible directement depuis votre profil) ;
              </li>
              <li>
                <strong>Droit à l'effacement :</strong> demander la suppression de votre
                compte et de vos données personnelles ;
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> recevoir vos données dans un format
                structuré et lisible par machine ;
              </li>
              <li>
                <strong>Droit d'opposition :</strong> vous opposer au traitement de vos données
                à des fins de communication marketing ;
              </li>
              <li>
                <strong>Droit de limitation :</strong> demander la suspension temporaire du
                traitement de vos données dans certains cas prévus par la loi ;
              </li>
              <li>
                <strong>Droit de retirer votre consentement</strong> à tout moment pour les
                traitements basés sur le consentement (ex : newsletter).
              </li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous via la page{' '}
              <Link href="/contact" className="text-accent hover:underline">Contact</Link> ou
              par email à <strong>contact@syllabix.com</strong>. Nous répondons dans un délai
              maximum de <strong>30 jours</strong>.
            </p>
          </Section>

          <Section number="10" title="Cookies et traceurs">
            <p>
              Syllabix utilise un nombre minimal de cookies, strictement nécessaires au
              fonctionnement de la plateforme :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Cookie de session d'authentification</strong> (Firebase Auth) :
                maintient votre connexion active. Durée : session ou 30 jours si vous cochez
                "Rester connecté". Ne contient pas de données personnelles identifiables.
              </li>
              <li>
                <strong>Cookie de préférences de langue :</strong> mémorise votre choix
                français/anglais. Durée : 1 an.
              </li>
            </ul>
            <p>
              <strong>Nous n'utilisons aucun cookie publicitaire, aucun tracker tiers
              (Google Analytics, Facebook Pixel, etc.) ni aucun outil de profilage
              comportemental.</strong>
            </p>
            <p>
              Ces cookies étant strictement nécessaires au fonctionnement du service, ils
              ne nécessitent pas votre consentement préalable. Vous pouvez les bloquer dans
              les paramètres de votre navigateur, mais cela empêchera toute connexion à
              votre compte.
            </p>
          </Section>

          <Section number="11" title="Transferts internationaux de données">
            <p>
              Vos données peuvent être traitées sur des serveurs situés hors de Côte d'Ivoire,
              notamment par nos sous-traitants Google (Firebase) et Vercel. Ces transferts
              sont encadrés par des garanties contractuelles appropriées (clauses contractuelles
              types, Privacy Shield ou équivalent) assurant un niveau de protection adéquat.
            </p>
          </Section>

          <Section number="12" title="Modifications de la politique de confidentialité">
            <p>
              Cette politique de confidentialité peut être mise à jour pour refléter les
              évolutions de nos services, de nos partenariats ou du cadre légal applicable.
            </p>
            <p>
              Toute modification substantielle sera notifiée par email à l'adresse associée
              à votre compte au moins 15 jours avant son entrée en vigueur. La date de
              dernière mise à jour est indiquée en haut de cette page.
            </p>
          </Section>

          <Section number="13" title="Contact et réclamations">
            <p>Pour toute question relative à la protection de vos données :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Via la page{' '}
                <Link href="/contact" className="text-accent hover:underline">Contact</Link> ;
              </li>
              <li>Par email : <strong>contact@syllabix.com</strong> ;</li>
              <li>Par courrier : Syllabix, Abidjan, Côte d'Ivoire.</li>
            </ul>
            <p className="mt-3">
              Si vous estimez que le traitement de vos données n'est pas conforme à la
              réglementation applicable, vous pouvez introduire une réclamation auprès de
              l'<strong>Autorité de Protection des Données à caractère Personnel de Côte d'Ivoire (ARTCI)</strong>{' '}
              ou de toute autorité de contrôle compétente dans votre pays de résidence.
            </p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 flex gap-4 flex-wrap">
          <Link href="/cgu" className="text-accent hover:underline text-sm font-medium">
            Conditions Générales d'Utilisation →
          </Link>
          <Link href="/" className="text-neutral-500 hover:underline text-sm">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
