/**
 * seedModuleQuestions.mjs — v4
 * 70 questions (10/module × 7 modules) — 3 compétences par module, types variés.
 *
 * Usage :
 *   node scripts/seedModuleQuestions.mjs              → dry-run
 *   node scripts/seedModuleQuestions.mjs --apply      → écrit dans Firestore
 *   node scripts/seedModuleQuestions.mjs --apply --clean          → supprime puis réécrit
 *   node scripts/seedModuleQuestions.mjs --apply --clean --module 2
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const sa = JSON.parse(readFileSync(resolve(__dirname, '../service-account.json'), 'utf8'));
  initializeApp({ credential: cert(sa) });
} catch { initializeApp(); }

const db = getFirestore();

// ─── Questions ────────────────────────────────────────────────────────────────
// Compétences par module :
//  0 → maîtrise_ordinateur | résolution_problèmes | sécurité_basique
//  1 → recherche_information | évaluation_sources | services_en_ligne
//  2 → email_professionnel | gestion_messagerie | partage_collaboration
//  3 → tableur | documents_professionnels | automatisation
//  4 → phishing | mots_de_passe | vie_privée
//  5 → utilisation_ia | enjeux_ethiques | prompt_engineering
//  6 → profil_professionnel | réseau_professionnel | travail_à_distance

const NEW_QUESTIONS = {

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 0 — IT & Ordinateur
  // ══════════════════════════════════════════════════════════════════════════
  0: [
    // maîtrise_ordinateur (4)
    {
      type: 'single', difficulty: 1, competence: 'maîtrise_ordinateur',
      text: "Quelle est la différence entre la RAM et le stockage (disque dur / SSD) ?",
      options: [
        "La RAM stocke les données définitivement ; le stockage les garde en cours d'utilisation",
        "La RAM est une mémoire de travail volatile ; le stockage conserve les données après extinction",
        "La RAM est plus lente que le disque dur et sert uniquement à la lecture",
        "Le stockage gère le processeur ; la RAM gère la connexion réseau",
      ],
      correct: 1,
      explanation: "La RAM (mémoire vive) stocke temporairement les données des programmes en cours. Elle s'efface à l'extinction. Le disque dur / SSD conserve les fichiers de façon permanente, même hors tension.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'maîtrise_ordinateur',
      text: "Quels éléments font partie du matériel (hardware) d'un ordinateur ?",
      options: ["Le processeur (CPU)", "Microsoft Word", "La carte graphique (GPU)", "Le système d'exploitation Windows"],
      correct: [0, 2],
      explanation: "Le hardware regroupe les composants physiques : CPU, RAM, GPU, disque, carte réseau… Word et Windows sont des logiciels (software).",
    },
    {
      type: 'input', difficulty: 1, competence: 'maîtrise_ordinateur',
      text: "Sur Windows, quel raccourci clavier copie un élément sélectionné dans le presse-papier ?",
      acceptableAnswers: ['ctrl+c', 'ctrl c', 'contrôle c', 'control c'],
      explanation: "Ctrl+C copie la sélection. Ctrl+X la coupe. Ctrl+V colle. Ces raccourcis fonctionnent dans presque toutes les applications Windows.",
    },
    {
      type: 'calculation', difficulty: 1, competence: 'maîtrise_ordinateur',
      text: "Un disque dur de 500 Go est utilisé à 60 %. Combien de Go sont encore libres ?",
      correct: 200, tolerance: 0, unit: 'Go',
      hint: "Espace libre = capacité totale × (100 % − taux d'utilisation)",
      explanation: "500 Go × 40 % = 200 Go libres. Il est recommandé de conserver au moins 10-15 % d'espace libre pour ne pas dégrader les performances.",
    },
    // résolution_problèmes (3)
    {
      type: 'single', difficulty: 2, competence: 'résolution_problèmes',
      text: "Konan allume son ordinateur. L'écran reste noir mais le voyant de l'unité centrale clignote. Quelle cause est la plus probable ?",
      options: [
        "Le disque dur est saturé et bloque le démarrage",
        "Le câble entre l'écran et l'unité centrale est débranché ou défectueux",
        "Le système d'exploitation a détecté un virus au démarrage",
        "La carte Wi-Fi empêche l'affichage de s'initialiser",
      ],
      correct: 1,
      explanation: "Écran noir + UC allumée = problème de connexion vidéo. Le câble HDMI/VGA est la première chose à vérifier avant tout diagnostic logiciel.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'résolution_problèmes',
      text: "Moussa constate que son PC est très lent depuis une semaine. Quelles sont les causes fréquentes à vérifier ?",
      options: [
        "Le disque dur est presque plein (moins de 10 % libre)",
        "Trop de programmes se lancent automatiquement au démarrage",
        "La résolution de l'écran est trop haute",
        "Un logiciel malveillant consomme les ressources en arrière-plan",
      ],
      correct: [0, 1, 3],
      explanation: "Stockage saturé, démarrage surchargé et malware sont les trois causes les plus fréquentes de ralentissement. La résolution d'écran n'affecte pas les performances du processeur.",
    },
    {
      type: 'single', difficulty: 3, competence: 'résolution_problèmes',
      text: "Fatou a supprimé des fichiers et vidé la Corbeille avant de revendre son PC. Ses données sont-elles définitivement inaccessibles ?",
      options: [
        "Oui, vider la Corbeille efface définitivement les données du disque",
        "Non, des logiciels de récupération peuvent retrouver ces données",
        "Oui, uniquement si l'ordinateur a été redémarré après la suppression",
        "Non, mais seulement si les fichiers étaient chiffrés avant suppression",
      ],
      correct: 1,
      explanation: "Supprimer un fichier efface uniquement le 'pointeur'. Les données restent sur le disque jusqu'à être écrasées. Pour une revente, il faut une réinitialisation complète avec écrasement sécurisé.",
    },
    // sécurité_basique (3)
    {
      type: 'single', difficulty: 1, competence: 'sécurité_basique',
      text: "Pourquoi est-il important de mettre à jour régulièrement le système d'exploitation ?",
      options: [
        "Pour changer le design de l'interface et avoir un look plus récent",
        "Pour corriger des failles de sécurité et améliorer la stabilité",
        "Pour augmenter la vitesse du processeur via des mises à jour matérielles",
        "Pour réinitialiser automatiquement les mots de passe enregistrés",
      ],
      correct: 1,
      explanation: "Les mises à jour incluent des correctifs de sécurité (patches) qui comblent les failles exploitées par les malwares. Les retarder expose l'ordinateur à des attaques connues.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'sécurité_basique',
      text: "Brou doit sauvegarder les données importantes de son entreprise. Quelles pratiques sont recommandées ?",
      options: [
        "Suivre la règle 3-2-1 : 3 copies, sur 2 supports différents, 1 hors site",
        "Stocker la sauvegarde uniquement sur le même disque dur que les données originales",
        "Tester régulièrement la restauration des sauvegardes pour vérifier qu'elles fonctionnent",
        "Effectuer des sauvegardes automatiques planifiées plutôt que manuelles",
      ],
      correct: [0, 2, 3],
      explanation: "La règle 3-2-1 protège contre la perte simultanée. Tester la restauration évite la surprise d'une sauvegarde corrompue. Les sauvegardes manuelles sont souvent oubliées. Sauvegarder sur le même disque n'a aucune valeur en cas de panne.",
    },
    {
      type: 'input', difficulty: 1, competence: 'sécurité_basique',
      text: "Sur Windows, quel raccourci clavier permet de verrouiller rapidement la session sans éteindre l'ordinateur ?",
      acceptableAnswers: ['windows+l', 'win+l', 'touche windows + l', 'windows l'],
      explanation: "Windows + L verrouille la session immédiatement. Indispensable quand on quitte son bureau, même brièvement : personne ne peut accéder aux données sans le mot de passe.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 1 — Internet & Google
  // ══════════════════════════════════════════════════════════════════════════
  1: [
    // recherche_information (3)
    {
      type: 'input', difficulty: 2, competence: 'recherche_information',
      text: "Pour limiter une recherche Google au site 'gouv.ci', quel opérateur de recherche utiliser avant le nom de domaine ?",
      acceptableAnswers: ['site:', 'site'],
      explanation: "L'opérateur 'site:gouv.ci' restreint les résultats au domaine spécifié. Très utile pour chercher sur des sites gouvernementaux, universitaires ou officiels.",
    },
    {
      type: 'single', difficulty: 2, competence: 'recherche_information',
      text: "Les premiers résultats Google portent la mention 'Sponsorisé'. Que signifie-t-elle ?",
      options: [
        "Ces résultats ont été vérifiés et certifiés par Google comme étant fiables",
        "Ce sont des publicités payées par des annonceurs, pas les plus pertinents objectivement",
        "Ces sites livrent gratuitement parce qu'ils sont partenaires officiels de Google",
        "Ces résultats sont personnalisés grâce à votre historique d'achat",
      ],
      correct: 1,
      explanation: "'Sponsorisé' = annonce publicitaire achetée par une entreprise. Les vrais résultats organiques viennent ensuite. La position payante ne garantit ni la qualité ni la fiabilité.",
    },
    {
      type: 'input', difficulty: 2, competence: 'recherche_information',
      text: "Pour forcer Google à trouver l'expression exacte 'loi de finances 2025', quel caractère encadre l'expression dans la barre de recherche ?",
      acceptableAnswers: ['"', 'guillemets', 'guillemet', '""'],
      explanation: "Encadrer une expression entre \"guillemets\" oblige Google à chercher ces mots dans cet ordre exact. Très utile pour les citations, références légales ou termes techniques précis.",
    },
    // évaluation_sources (4)
    {
      type: 'single', difficulty: 1, competence: 'évaluation_sources',
      text: "Ama recherche la procédure officielle pour créer une entreprise en Côte d'Ivoire. Quelle source prioriser ?",
      options: [
        "Un article de blog d'un entrepreneur ivoirien publié il y a 8 mois",
        "Le site officiel du CEPICI (Centre de Promotion des Investissements en Côte d'Ivoire)",
        "Un groupe Facebook de 80 000 entrepreneurs avec des témoignages récents",
        "Une vidéo YouTube d'un consultant avec 200 000 abonnés",
      ],
      correct: 1,
      explanation: "Pour des démarches administratives, seule la source officielle fait référence légale. Le CEPICI est l'organisme d'État compétent. Les autres sources peuvent contenir des informations obsolètes ou incorrectes.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'évaluation_sources',
      text: "Konan voit une information virale : 'Le gouvernement supprime les frais scolaires dès janvier'. Quels critères valident une information avant de la partager ?",
      options: [
        "Vérifier que plusieurs personnes de confiance l'ont partagée sur WhatsApp",
        "Consulter les sites officiels du ministère ou des agences de presse reconnues",
        "Chercher si l'info est reprise par au moins 3 médias indépendants",
        "Vérifier la date de publication et si la source est clairement identifiée",
      ],
      correct: [1, 2, 3],
      explanation: "La popularité d'un partage ne garantit pas la véracité. Le fact-checking repose sur : sources officielles, plusieurs médias indépendants et date de publication. Le cercle WhatsApp n'est pas une source fiable.",
    },
    {
      type: 'single', difficulty: 2, competence: 'évaluation_sources',
      text: "Brou trouve deux articles sur la même réforme fiscale : l'un de 2020, l'autre de 2024. Lequel reflète mieux la situation actuelle ?",
      options: [
        "L'article de 2020, car il a été davantage relu et corrigé depuis sa parution",
        "L'article de 2024, car les lois fiscales évoluent et les données récentes priment",
        "Les deux se valent si leurs sources primaires (textes de loi) sont identiques",
        "Aucun des deux : seule la version papier du Journal Officiel est valide",
      ],
      correct: 1,
      explanation: "Pour des domaines évolutifs comme la fiscalité ou la législation, la date de publication est un critère prioritaire. Un article récent reste plus pertinent pour refléter l'état actuel.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'évaluation_sources',
      text: "Quels signes indiquent qu'un site est fiable pour saisir des données personnelles ?",
      options: [
        "L'URL commence par 'https://' avec un cadenas visible dans le navigateur",
        "Le site a un design professionnel et des images de haute qualité",
        "Le domaine correspond exactement à l'organisation officielle attendue",
        "Le site apparaît en première position dans les résultats Google",
      ],
      correct: [0, 2],
      explanation: "HTTPS + cadenas = chiffrement de la connexion. Un domaine officiel exact = authenticité. Un beau design et une bonne position Google s'achètent — ils ne garantissent pas la fiabilité.",
    },
    // services_en_ligne (3)
    {
      type: 'calculation', difficulty: 1, competence: 'services_en_ligne',
      text: "Un forfait internet mobile coûte 3 500 FCFA par mois. Combien Fatou dépense-t-elle en 1 an ?",
      correct: 42000, tolerance: 0, unit: 'FCFA',
      hint: "Coût annuel = tarif mensuel × 12",
      explanation: "3 500 × 12 = 42 000 FCFA/an. Comparer les offres annuelles est souvent plus avantageux : certains opérateurs proposent des packs avec réduction.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'services_en_ligne',
      text: "Quelles informations NE doivent PAS être saisies sur un site dont la fiabilité n'a pas été vérifiée ?",
      options: [
        "Numéro de carte bancaire",
        "Prénom et nom de famille",
        "Mot de passe de messagerie",
        "Code PIN Mobile Money (MTN MoMo, Wave, Orange Money)",
      ],
      correct: [0, 2, 3],
      explanation: "Numéro de carte, mots de passe et codes PIN permettent le vol financier direct ou l'usurpation d'identité. Le nom/prénom seul est moins critique mais doit rester protégé selon le contexte.",
    },
    {
      type: 'single', difficulty: 3, competence: 'services_en_ligne',
      text: "Moussa veut payer une facture en ligne via un lien reçu par SMS d'un numéro inconnu. Quelle est la bonne démarche ?",
      options: [
        "Cliquer sur le lien si le montant correspond à sa facture habituelle",
        "Aller directement sur le site officiel de l'opérateur sans cliquer sur le lien reçu",
        "Transférer le SMS à un ami pour qu'il vérifie le lien à sa place",
        "Appeler le numéro expéditeur pour confirmer l'authenticité",
      ],
      correct: 1,
      explanation: "Les liens de paiement reçus par SMS d'un numéro inconnu sont un vecteur de phishing classique. La règle : toujours accéder au service via son application officielle ou son site directement, jamais via un lien externe reçu.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 2 — Email
  // ══════════════════════════════════════════════════════════════════════════
  2: [
    // email_professionnel (4)
    {
      type: 'single', difficulty: 3, competence: 'email_professionnel',
      text: "Fatou reçoit un email urgent de son 'directeur' (direction@syllabix-ci.net, le vrai domaine est syllabix.ci) demandant le mot de passe du serveur. Que faire ?",
      options: [
        "Envoyer le mot de passe et signaler l'incident au service IT ensuite",
        "Refuser, appeler directement le directeur par téléphone pour confirmer",
        "Répondre par email en demandant une confirmation écrite avant tout envoi",
        "Transférer au service IT et envoyer le mot de passe en parallèle pour ne pas bloquer",
      ],
      correct: 1,
      explanation: "'syllabix-ci.net' ≠ 'syllabix.ci' : c'est du phishing (typosquatting). Les mots de passe ne se partagent JAMAIS par email. Seul un appel direct au directeur confirme l'authenticité de la demande.",
    },
    {
      type: 'input', difficulty: 1, competence: 'email_professionnel',
      text: "Quel champ d'un email permet d'envoyer une copie à quelqu'un sans que les autres destinataires voient son adresse ?",
      acceptableAnswers: ['cci', 'copie cachée', 'bcc', 'blind carbon copy', 'copie invisible', 'copie carbone invisible'],
      explanation: "Le champ CCI (Copie Carbone Invisible) ou BCC cache l'adresse aux autres destinataires. Indispensable pour protéger la vie privée lors d'envois en masse.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'email_professionnel',
      text: "Konan prépare un email professionnel important. Quelles vérifications faire avant de cliquer 'Envoyer' ?",
      options: [
        "Vérifier que la pièce jointe mentionnée est bien attachée",
        "Relire l'objet et le corps pour détecter les fautes",
        "Confirmer que les destinataires dans 'À' et 'Cc' sont corrects",
        "Attendre 24h pour s'assurer que l'email n'est pas détecté comme spam",
      ],
      correct: [0, 1, 2],
      explanation: "Les trois vérifications critiques : pièce jointe présente, contenu relu, destinataires corrects. Attendre 24h n'a aucun impact sur le filtre anti-spam du destinataire.",
    },
    {
      type: 'single', difficulty: 2, competence: 'email_professionnel',
      text: "Moussa reçoit 3 emails de relance d'un fournisseur légitime qui arrivent dans Spam. Comment corriger cela durablement ?",
      options: [
        "Désactiver le filtre anti-spam pour tout son compte",
        "Signaler ces emails comme 'Non spam' et ajouter l'expéditeur aux contacts",
        "Créer une règle pour que tous les emails arrivent dans la boîte principale sans filtre",
        "Demander au fournisseur de changer son adresse d'envoi",
      ],
      correct: 1,
      explanation: "Signaler un email légitime comme 'Non spam' entraîne le filtre sur votre préférence. Ajouter l'expéditeur aux contacts renforce cette correction. Désactiver entièrement le filtre vous exposerait à de vrais spams.",
    },
    // gestion_messagerie (3)
    {
      type: 'single', difficulty: 1, competence: 'gestion_messagerie',
      text: "Pour accéder à Gmail depuis n'importe quel appareil sans installer de logiciel, quel type d'accès utiliser ?",
      options: [
        "Un client mail installé comme Outlook ou Thunderbird",
        "Un accès webmail via le navigateur internet",
        "Une application mobile Gmail téléchargée depuis le Play Store",
        "Un accès VPN pour accéder au serveur mail directement",
      ],
      correct: 1,
      explanation: "Le webmail (navigateur) permet d'accéder à Gmail, Outlook, etc. depuis n'importe quel appareil connecté. Aucune installation requise, idéal en déplacement.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'gestion_messagerie',
      text: "Quels éléments constituent un objet d'email professionnel de qualité ?",
      options: [
        "Concis et informatif (idéalement moins de 8 mots)",
        "Commence par 'URGENT !!!' pour attirer l'attention immédiatement",
        "Précise le sujet et l'action attendue si possible",
        "Est identique pour tous les emails envoyés à la même personne",
      ],
      correct: [0, 2],
      explanation: "Un bon objet est court, précis et donne envie d'ouvrir. 'URGENT' utilisé systématiquement perd son impact et peut déclencher des filtres spam. Un objet différent par email facilite la recherche ultérieure.",
    },
    {
      type: 'calculation', difficulty: 1, competence: 'gestion_messagerie',
      text: "Ama reçoit 20 emails par jour et répond à 35 %. Combien de réponses envoie-t-elle en une semaine de 5 jours ouvrés ?",
      correct: 35, tolerance: 0, unit: 'réponses',
      hint: "Réponses/jour = 20 × 35 %, puis × 5 jours",
      explanation: "20 × 0,35 = 7 réponses/jour × 5 jours = 35 réponses/semaine. Planifier 2-3 plages horaires dédiées aux emails est plus efficace que de répondre en continu.",
    },
    // partage_collaboration (3)
    {
      type: 'single', difficulty: 2, competence: 'partage_collaboration',
      text: "Brou doit envoyer un fichier de 80 Mo à un client. L'email retourne une erreur de taille. Quelle est la meilleure solution ?",
      options: [
        "Découper le fichier en plusieurs emails de 20 Mo chacun",
        "Téléverser le fichier sur Google Drive et partager le lien par email",
        "Compresser en .zip pour espérer réduire la taille de moitié",
        "Demander au client de créer un compte sur une plateforme de réception",
      ],
      correct: 1,
      explanation: "La limite standard d'un email est ~25 Mo. Pour les gros fichiers, le cloud (Google Drive, OneDrive, WeTransfer) est la solution professionnelle : lien unique, pas de fragmentation, accessible quand le client le souhaite.",
    },
    {
      type: 'multi', difficulty: 3, competence: 'partage_collaboration',
      text: "Pour partager un document confidentiel par email avec un partenaire externe, quelles précautions prendre ?",
      options: [
        "Protéger le fichier par un mot de passe avant l'envoi",
        "Transmettre ce mot de passe par téléphone ou SMS, pas dans le même email",
        "Envoyer depuis une adresse personnelle pour éviter le traçage interne",
        "Préciser 'CONFIDENTIEL' dans l'objet de l'email",
      ],
      correct: [0, 1],
      explanation: "Chiffrement du fichier + transmission du mot de passe sur un canal séparé = méthode recommandée. 'CONFIDENTIEL' dans l'objet n'a aucun effet technique. L'adresse personnelle réduit la traçabilité mais pas la sécurité du fichier.",
    },
    {
      type: 'single', difficulty: 2, competence: 'partage_collaboration',
      text: "Koffi et son équipe travaillent sur des copies locales du même rapport Word. Quel problème cela génère-t-il ?",
      options: [
        "Le fichier deviendra trop lourd pour être envoyé par email",
        "Des versions conflictuelles apparaissent, rendant la fusion manuelle longue et risquée",
        "Windows bloquera l'accès simultané au fichier pour des raisons de sécurité",
        "Le dernier à enregistrer écrase automatiquement toutes les autres versions",
      ],
      correct: 1,
      explanation: "Travailler sur des copies locales génère des versions parallèles difficiles à réconcilier. La co-édition cloud (Google Docs, Word Online) élimine ce problème : une seule version, modifiable simultanément.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 3 — Bureautique
  // ══════════════════════════════════════════════════════════════════════════
  3: [
    // tableur (4)
    {
      type: 'single', difficulty: 1, competence: 'tableur',
      text: "Ama a les ventes de janvier à décembre dans les cellules B2 à B13. Quelle formule calcule la moyenne mensuelle ?",
      options: ["=SOMME(B2:B13)/12", "=MOYENNE(B2:B13)", "=TOTAL(B2:B13)/12", "=(B2+B13)/2"],
      correct: 1,
      explanation: "=MOYENNE(plage) est la formule dédiée. =SOMME/12 donne le même résultat mais est fragile si on ajoute des mois. =(B2+B13)/2 calcule la moyenne des deux extrêmes, pas de toutes les valeurs.",
    },
    {
      type: 'input', difficulty: 1, competence: 'tableur',
      text: "Dans Excel, quelle fonction affiche la valeur maximale d'une plage de cellules ?",
      acceptableAnswers: ['max', '=max', 'max()', '=max()'],
      explanation: "=MAX(plage) renvoie la valeur la plus élevée. =MIN(plage) donne le minimum. Ces fonctions ignorent les cellules vides et les textes.",
    },
    {
      type: 'calculation', difficulty: 1, competence: 'tableur',
      text: "Konan a 120 lignes de données. Il filtre pour afficher uniquement les commandes supérieures à 50 000 FCFA. Si 30 % passent le filtre, combien de lignes s'affichent ?",
      correct: 36, tolerance: 0, unit: 'lignes',
      hint: "Lignes affichées = 120 × 30 %",
      explanation: "120 × 0,30 = 36 lignes. Le filtre masque les 84 autres sans les supprimer. Toutes les données restent accessibles en désactivant le filtre.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'tableur',
      text: "La mise en forme conditionnelle dans Excel permet d'afficher des couleurs selon des règles. Quels usages sont pertinents ?",
      options: [
        "Colorier en rouge les chiffres de vente inférieurs à l'objectif mensuel",
        "Mettre en gras automatiquement toutes les cellules de la colonne A",
        "Afficher une icône flèche verte/rouge selon l'évolution par rapport au mois précédent",
        "Trier les données du plus grand au plus petit",
      ],
      correct: [0, 2],
      explanation: "La mise en forme conditionnelle applique couleurs ou icônes selon des règles numériques. Elle ne trie pas (c'est la fonction Tri) ni ne met en gras toute une colonne sans condition.",
    },
    // documents_professionnels (3)
    {
      type: 'multi', difficulty: 2, competence: 'documents_professionnels',
      text: "Moussa rédige un rapport de 40 pages dans Word. Quelles fonctionnalités facilitent la navigation et la structure ?",
      options: [
        "Les styles Titre 1 / Titre 2 pour hiérarchiser le contenu",
        "Le volet de navigation (Vue → Volet de navigation) pour sauter entre sections",
        "La numérotation automatique des pages dans l'en-tête ou le pied de page",
        "Le correcteur orthographique pour signaler les fautes en rouge",
      ],
      correct: [0, 1, 2],
      explanation: "Styles de titres, volet de navigation et numérotation automatique structurent et facilitent la lecture d'un long document. Le correcteur orthographique ne structure pas le document.",
    },
    {
      type: 'single', difficulty: 2, competence: 'documents_professionnels',
      text: "Brou présente des résultats trimestriels. Sa slide PowerPoint affiche 12 lignes de texte dense. Quel est le principal problème ?",
      options: [
        "PowerPoint affiche un avertissement au-delà de 10 lignes par slide",
        "Le public lira les slides au lieu d'écouter le présentateur",
        "La police sera automatiquement réduite à une taille illisible à distance",
        "Le fichier sera trop lourd si les slides sont surchargées de texte",
      ],
      correct: 1,
      explanation: "Une slide surchargée de texte pousse le public à lire en silence, coupant l'écoute du présentateur. Règle : une slide = une idée, en mots-clés. Les détails vont dans les notes.",
    },
    {
      type: 'input', difficulty: 2, competence: 'documents_professionnels',
      text: "Dans Word, quel onglet du ruban contient la fonctionnalité 'Table des matières' automatique ?",
      acceptableAnswers: ['références', 'references', 'ruban références', 'onglet références'],
      explanation: "La table des matières automatique se génère via Références → Table des matières. Elle se met à jour dynamiquement avec les styles Titre et les numéros de page corrects.",
    },
    // automatisation (3)
    {
      type: 'single', difficulty: 2, competence: 'automatisation',
      text: "Fatou doit envoyer 200 convocations personnalisées (nom, poste, date) à chaque employé. Quelle fonctionnalité Word utiliser ?",
      options: [
        "Copier-coller le modèle 200 fois en modifiant manuellement chaque exemplaire",
        "Le publipostage (Correspondance → Démarrer le publipostage) fusionné avec une liste Excel",
        "La fonction Remplacer (Ctrl+H) pour changer les noms un par un",
        "Les commentaires Word pour noter les informations de chaque destinataire",
      ],
      correct: 1,
      explanation: "Le publipostage fusionne automatiquement un modèle Word avec une source Excel. Il génère 200 documents personnalisés en quelques secondes au lieu de plusieurs heures.",
    },
    {
      type: 'multi', difficulty: 3, competence: 'automatisation',
      text: "Quelles bonnes pratiques s'appliquent pour créer un modèle de facture réutilisable dans Excel ?",
      options: [
        "Enregistrer le fichier au format .xltx (modèle Excel)",
        "Protéger les cellules de formule pour éviter les modifications accidentelles",
        "Laisser toutes les cellules déverrouillées pour plus de flexibilité",
        "Utiliser des formules automatiques pour le calcul du total TTC",
      ],
      correct: [0, 1, 3],
      explanation: "Format .xltx (crée des copies sans écraser l'original), cellules de formule protégées, et calculs automatiques. Laisser tout déverrouillé expose les formules aux suppressions accidentelles.",
    },
    {
      type: 'calculation', difficulty: 1, competence: 'automatisation',
      text: "Koffi a un budget annuel de 2 400 000 FCFA pour 12 mois. Quel est le budget mensuel moyen ?",
      correct: 200000, tolerance: 0, unit: 'FCFA',
      hint: "Budget mensuel = budget annuel ÷ 12",
      explanation: "2 400 000 ÷ 12 = 200 000 FCFA/mois. Dans Excel, diviser une cellule 'Budget annuel' par 12 (plutôt que saisir 200 000 en dur) permet une mise à jour automatique si le budget change.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 4 — Cybersécurité
  // ══════════════════════════════════════════════════════════════════════════
  4: [
    // phishing (4)
    {
      type: 'single', difficulty: 2, competence: 'phishing',
      text: "Aïcha reçoit ce SMS : 'ORANGE CI : Compte suspendu dans 2h — sécurisez-le : bit.ly/orange-ci-secure'. Que faire ?",
      options: [
        "Cliquer immédiatement pour éviter la suspension",
        "Contacter Orange CI via le numéro officiel au dos de sa carte SIM",
        "Transférer le SMS à un ami tech pour qu'il vérifie le lien",
        "Répondre au SMS en demandant confirmation à l'opérateur",
      ],
      correct: 1,
      explanation: "SMS d'urgence + lien raccourci non officiel = phishing classique. Orange CI ne contacte jamais via des liens bit.ly. Contacter l'opérateur directement est la seule action sûre.",
    },
    {
      type: 'single', difficulty: 2, competence: 'phishing',
      text: "Moussa reçoit un email de 'PayPal' avec l'expéditeur 'support@paypa1-secure.com'. Quel est l'indicateur de phishing le plus évident ?",
      options: [
        "PayPal ne contacte jamais ses clients par email",
        "'paypa1' contient le chiffre '1' à la place de la lettre 'l' dans 'paypal'",
        "L'email est en français alors que PayPal communique uniquement en anglais",
        "Le domaine est .com au lieu de .ci pour la Côte d'Ivoire",
      ],
      correct: 1,
      explanation: "'paypa1' (chiffre 1) au lieu de 'paypal' (lettre l) est un typosquatting. Le domaine ressemble visuellement à l'original. PayPal utilise uniquement @paypal.com. Toujours vérifier le domaine exact de l'expéditeur.",
    },
    {
      type: 'single', difficulty: 1, competence: 'phishing',
      text: "Brou voit un pop-up dans son navigateur : 'ALERTE ! 47 virus détectés ! Appelez le +225 07 XX XX XX immédiatement'. Quelle est la nature de cette alerte ?",
      options: [
        "Une vraie alerte de Windows Defender qui a détecté des menaces",
        "Une arnaque au faux support technique (scareware) conçue pour pousser à appeler",
        "Une notification légitime de l'antivirus installé sur le PC",
        "Un avertissement du fournisseur d'accès internet sur une infection réseau",
      ],
      correct: 1,
      explanation: "C'est un scareware : fausse alerte exploitant la peur pour inciter à appeler un numéro surtaxé ou télécharger un malware. Les vrais antivirus n'affichent jamais de numéro de téléphone à appeler.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'phishing',
      text: "Quels signaux d'alerte indiquent qu'un email est probablement du phishing ?",
      options: [
        "L'expéditeur utilise un domaine légèrement différent du vrai (ex: orange-ci.net au lieu de orange.ci)",
        "Le message crée une urgence ('votre compte sera fermé dans 24h')",
        "L'email contient une image du logo officiel de l'entreprise",
        "Le lien dans l'email pointe vers un domaine différent de l'expéditeur affiché",
      ],
      correct: [0, 1, 3],
      explanation: "Domaine falsifié, urgence artificielle et lien suspect sont les trois marqueurs classiques du phishing. La présence d'un logo officiel est facile à copier et ne valide en rien l'authenticité.",
    },
    // mots_de_passe (3)
    {
      type: 'multi', difficulty: 1, competence: 'mots_de_passe',
      text: "Quelles caractéristiques font d'un mot de passe un mot de passe fort ?",
      options: [
        "Au moins 12 caractères de longueur",
        "Contient le prénom et l'année de naissance pour s'en souvenir facilement",
        "Mélange majuscules, minuscules, chiffres et caractères spéciaux",
        "Est différent pour chaque compte ou service en ligne",
      ],
      correct: [0, 2, 3],
      explanation: "Un mot de passe fort = long (12+), complexe (4 types de caractères), unique par service. Prénom + année de naissance est prévisible via les réseaux sociaux.",
    },
    {
      type: 'input', difficulty: 1, competence: 'mots_de_passe',
      text: "L'ajout d'un code envoyé par SMS après votre mot de passe s'appelle l'authentification à deux facteurs. Quel est son sigle courant en anglais ?",
      acceptableAnswers: ['2fa', '2-fa', 'mfa', 'two-factor authentication', 'two factor authentication'],
      explanation: "2FA (Two-Factor Authentication) ajoute un second facteur après le mot de passe. Même volé, un pirate ne peut pas se connecter sans accéder à votre téléphone.",
    },
    {
      type: 'single', difficulty: 2, competence: 'mots_de_passe',
      text: "Konan utilise '2024Abidjan!' pour son email, sa banque ET son compte MTN MoMo. Quel risque principal crée cette pratique ?",
      options: [
        "Son compte sera bloqué si le mot de passe est saisi trois fois sans succès",
        "Si un service est piraté, les cybercriminels tenteront ce mot de passe sur tous les autres",
        "Ce mot de passe ne respecte pas les exigences minimales des banques ivoiriennes",
        "MTN bloque automatiquement les comptes avec des mots de passe trop complexes",
      ],
      correct: 1,
      explanation: "La réutilisation de mot de passe permet le 'credential stuffing' : quand une base de données est volée, les pirates testent automatiquement les mêmes identifiants sur d'autres services.",
    },
    // vie_privée (3)
    {
      type: 'multi', difficulty: 3, competence: 'vie_privée',
      text: "Fatou se connecte à sa banque via le Wi-Fi public d'un café à Abidjan. Quels risques existent ?",
      options: [
        "Un pirate sur le même réseau peut intercepter des données non chiffrées",
        "Sa connexion sera automatiquement coupée après 5 minutes d'inactivité",
        "Un faux point d'accès Wi-Fi peut imiter le réseau du café pour capturer ses identifiants",
        "La banque bloquera son compte automatiquement si l'IP vient d'un café",
      ],
      correct: [0, 2],
      explanation: "Les Wi-Fi publics exposent à l'écoute du trafic non chiffré et aux faux points d'accès (evil twin). Utiliser sa connexion 4G/5G ou un VPN sur Wi-Fi public protège de ces attaques.",
    },
    {
      type: 'single', difficulty: 1, competence: 'vie_privée',
      text: "Pour naviguer sans que le navigateur sauvegarde votre historique localement, quel mode activer ?",
      options: [
        "Mode hors ligne (pas de connexion internet)",
        "Navigation privée (Incognito sur Chrome, navigation privée sur Firefox)",
        "Mode lecture pour désactiver le suivi publicitaire",
        "Mode sécurisé de Windows qui isole le navigateur",
      ],
      correct: 1,
      explanation: "La navigation privée ne sauvegarde ni historique, ni cookies, ni formulaires sur l'appareil. Attention : cela ne vous rend pas anonyme sur internet — votre FAI et les sites visités peuvent toujours vous identifier.",
    },
    {
      type: 'multi', difficulty: 3, competence: 'vie_privée',
      text: "Koffi perd son téléphone professionnel contenant des emails confidentiels et l'application bancaire de l'entreprise. Quelles actions prioriser ?",
      options: [
        "Effacer le téléphone à distance via 'Localiser mon appareil' si activé",
        "Changer les mots de passe des comptes critiques depuis un autre appareil",
        "Acheter un nouveau téléphone avant toute autre action",
        "Contacter l'opérateur pour bloquer la carte SIM",
      ],
      correct: [0, 1, 3],
      explanation: "En priorité : effacement à distance (protège les données), changement des mots de passe (invalide les sessions ouvertes), blocage SIM (empêche la réception des SMS d'authentification). Acheter un téléphone vient après la sécurisation.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 5 — Intelligence Artificielle
  // ══════════════════════════════════════════════════════════════════════════
  5: [
    // utilisation_ia (4)
    {
      type: 'single', difficulty: 1, competence: 'utilisation_ia',
      text: "Dans le vocabulaire de l'IA, le texte qu'on envoie à un modèle de langage pour obtenir une réponse s'appelle comment ?",
      options: ["Requête SQL", "Prompt", "Token de connexion", "Commande shell"],
      correct: 1,
      explanation: "Un 'prompt' est l'instruction envoyée au modèle d'IA. L'art d'écrire des prompts efficaces s'appelle le 'prompt engineering'. La qualité du prompt détermine largement la qualité de la réponse.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'utilisation_ia',
      text: "Moussa veut obtenir une lettre de motivation de qualité via ChatGPT. Quels éléments inclure dans son prompt ?",
      options: [
        "Le poste visé et le nom de l'entreprise",
        "Ses expériences clés et compétences pertinentes",
        "Le contexte local (Côte d'Ivoire, secteur formel, culture professionnelle)",
        "Une demande de texte 'le plus long possible' pour être exhaustif",
      ],
      correct: [0, 1, 2],
      explanation: "Un prompt efficace donne le contexte spécifique : poste, entreprise, expériences, contexte culturel. Demander un texte 'le plus long possible' produit un contenu dilué — mieux vaut spécifier un format (ex: 'maximum 300 mots').",
    },
    {
      type: 'input', difficulty: 2, competence: 'utilisation_ia',
      text: "En prompt engineering, donner à l'IA un rôle précis ('tu es un expert-comptable') avant de poser sa question s'appelle quel type de technique ?",
      acceptableAnswers: ['role prompting', 'role-prompting', 'persona prompting', 'assignation de rôle', 'jeu de rôle'],
      explanation: "Le 'role prompting' assigne un rôle à l'IA pour cadrer son registre de réponse. Ex: 'Tu es un juriste spécialisé en droit OHADA' améliore la pertinence des réponses juridiques africaines.",
    },
    {
      type: 'single', difficulty: 2, competence: 'utilisation_ia',
      text: "Ama demande à ChatGPT les résultats d'élections récentes. L'IA répond avec assurance mais ses données s'arrêtent début 2024. Quel phénomène illustre cette réponse potentiellement fausse ?",
      options: [
        "Un biais d'entraînement dû à une surreprésentation des sources occidentales",
        "Une hallucination : l'IA génère du contenu plausible mais factuellement inexact",
        "Un problème de traduction entre langues africaines et français",
        "Une censure automatique des données politiques sensibles",
      ],
      correct: 1,
      explanation: "L'hallucination IA = génération de contenu faux présenté avec autant de confiance que du vrai. Les IA ont une date de coupure et ne connaissent pas les événements récents, mais peuvent 'inventer' une réponse cohérente.",
    },
    // enjeux_ethiques (3)
    {
      type: 'single', difficulty: 3, competence: 'enjeux_ethiques',
      text: "Brou analyse des contrats clients confidentiels en les soumettant à ChatGPT version gratuite. Quel risque principal prend-il ?",
      options: [
        "ChatGPT peut transmettre ces données directement aux concurrents",
        "Ces données peuvent être utilisées pour entraîner de futures versions du modèle",
        "ChatGPT refusera d'analyser des documents juridiques pour raisons légales",
        "L'analyse sera incorrecte car ChatGPT ne comprend pas le droit africain",
      ],
      correct: 1,
      explanation: "Dans les versions gratuites/standard, OpenAI peut utiliser les conversations pour améliorer ses modèles. Les données confidentielles d'entreprise ne doivent pas y transiter. Les versions Enterprise offrent des garanties contractuelles de confidentialité.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'enjeux_ethiques',
      text: "Quelles affirmations sur les IA génératives sont correctes ?",
      options: [
        "Elles peuvent produire du contenu faux avec le même niveau de confiance qu'un contenu vrai",
        "Elles sont infaillibles sur les données chiffrées et statistiques",
        "Leur connaissance s'arrête à une date de coupure (pas d'accès temps réel sans plugin)",
        "Elles reproduisent parfois les biais présents dans leurs données d'entraînement",
      ],
      correct: [0, 2, 3],
      explanation: "Les IA hallucinent (A), ont une date de coupure (C) et reproduisent les biais (D). Elles ne sont PAS infaillibles sur les chiffres — erreurs de calcul et statistiques inventées sont fréquentes.",
    },
    {
      type: 'single', difficulty: 2, competence: 'enjeux_ethiques',
      text: "Fatou utilise Midjourney pour créer l'identité visuelle de sa marque. Une image générée ressemble fortement au logo d'une marque internationale. Quel est le risque ?",
      options: [
        "Midjourney signalera automatiquement le problème avant de finaliser l'image",
        "Une violation potentielle des droits d'auteur pouvant exposer à des poursuites",
        "La qualité d'impression sera dégradée car l'image n'est pas 100 % originale",
        "Ce risque n'existe qu'en Europe, pas sur les marchés africains",
      ],
      correct: 1,
      explanation: "Les IA génèrent des images à partir d'œuvres existantes dont des logos protégés. Une ressemblance trop forte avec une marque enregistrée constitue un risque de propriété intellectuelle applicable dans tout pays signataire des accords TRIPS.",
    },
    // prompt_engineering (3)
    {
      type: 'multi', difficulty: 2, competence: 'prompt_engineering',
      text: "Konan utilise ChatGPT pour analyser le marché de la construction au Sénégal. Quelles précautions avant de soumettre ce rapport ?",
      options: [
        "Vérifier les chiffres et statistiques avec des sources locales actualisées",
        "S'assurer que les entreprises citées existent réellement",
        "Remplacer systématiquement les mots complexes par des mots simples",
        "Adapter le ton au contexte sénégalais si l'IA a généré un texte trop générique",
      ],
      correct: [0, 1, 3],
      explanation: "L'IA peut inventer des chiffres ou des entreprises inexistantes (hallucination). Les données locales africaines sont souvent sous-représentées. Simplifier le vocabulaire n'est pas une précaution de fiabilité.",
    },
    {
      type: 'single', difficulty: 3, competence: 'prompt_engineering',
      text: "Koffi veut que ChatGPT lui explique la comptabilité OHADA comme s'il parlait à un lycéen. Quelle technique de prompt utilise-t-il ?",
      options: [
        "Le chain-of-thought : demander à l'IA de raisonner étape par étape",
        "L'ajustement du niveau d'audience dans le prompt ('explique comme à un lycéen')",
        "Le few-shot prompting : donner plusieurs exemples avant la question",
        "Le zero-shot prompting : poser la question sans aucun contexte",
      ],
      correct: 1,
      explanation: "Spécifier le niveau d'audience ('explique à un lycéen', 'à un expert', 'à quelqu'un sans background technique') est une technique de prompt de base qui ajuste le registre et la profondeur de la réponse.",
    },
    {
      type: 'multi', difficulty: 3, competence: 'prompt_engineering',
      text: "Aïcha veut utiliser une IA pour répondre automatiquement aux clients de son e-commerce. Quelles règles respecter absolument ?",
      options: [
        "Ne jamais donner à l'IA accès aux données bancaires ou contrats des clients",
        "Informer clairement les clients qu'ils interagissent avec une IA",
        "Désactiver l'IA le week-end pour économiser de l'énergie",
        "Prévoir une option de transfert vers un humain pour les demandes complexes",
      ],
      correct: [0, 1, 3],
      explanation: "Trois règles éthiques clés : protection des données sensibles, transparence envers les utilisateurs (droit de savoir), et escalade humaine disponible. Le week-end ne change pas ces obligations.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // MODULE 6 — Employabilité
  // ══════════════════════════════════════════════════════════════════════════
  6: [
    // profil_professionnel (4)
    {
      type: 'single', difficulty: 2, competence: 'profil_professionnel',
      text: "Konan cherche un emploi de comptable à Abidjan. Son LinkedIn est vide sauf son nom et son poste. Quelle amélioration a le plus d'impact ?",
      options: [
        "Changer sa photo de profil pour une photo professionnelle en costume",
        "Ajouter un résumé 'À propos' percutant et des expériences avec résultats chiffrés",
        "Envoyer des invitations à toutes les personnes de la région Abidjan",
        "Rejoindre un maximum de groupes LinkedIn liés à la finance",
      ],
      correct: 1,
      explanation: "LinkedIn favorise les profils complets dans son algorithme. Un résumé clair et des expériences avec résultats mesurables ('Réduction de 3 jours des délais de clôture') sont plus impactants que la photo ou le volume de connexions.",
    },
    {
      type: 'multi', difficulty: 1, competence: 'profil_professionnel',
      text: "Fatou prépare son profil LinkedIn pour une recherche d'emploi active. Quels éléments sont indispensables ?",
      options: [
        "Une photo professionnelle (visage visible, fond neutre)",
        "Un résumé 'À propos' de 3 à 5 lignes décrivant son expertise et ses objectifs",
        "La liste de ses films et livres préférés dans la section Intérêts",
        "Ses expériences avec missions et résultats concrets",
      ],
      correct: [0, 1, 3],
      explanation: "Photo pro (×21 de vues), résumé clair, expériences détaillées. Les films et livres préférés n'apportent pas de valeur aux recruteurs.",
    },
    {
      type: 'single', difficulty: 3, competence: 'profil_professionnel',
      text: "Moussa a 3 ans d'expérience dans une ONG. Quelle description LinkedIn est la plus convaincante pour le secteur privé ?",
      options: [
        "Responsable de projets de développement — Gestion administrative et coordination",
        "Travaillé pour améliorer les conditions de vie des communautés rurales en Côte d'Ivoire",
        "Géré 8 projets touchant 4 200 bénéficiaires, budget 150M FCFA, taux de livraison à temps : 91 %",
        "Expérience significative dans le secteur humanitaire en Afrique de l'Ouest",
      ],
      correct: 2,
      explanation: "Les recruteurs privés pensent en KPIs. Des chiffres concrets (projets, budget, bénéficiaires, taux de réussite) transforment une expérience ONG en compétences transférables mesurables. Les options A, B, D sont vagues et interchangeables.",
    },
    {
      type: 'input', difficulty: 1, competence: 'profil_professionnel',
      text: "Une présentation courte de 30 à 60 secondes de qui vous êtes, ce que vous faites et ce que vous recherchez, utilisée en networking, s'appelle comment ?",
      acceptableAnswers: ['elevator pitch', 'pitch', 'elevator speech', "pitch d'ascenseur", 'présentation éclair'],
      explanation: "L'elevator pitch doit fonctionner le temps d'un trajet d'ascenseur. Format : nom + expertise + valeur ajoutée + ce qu'on cherche. S'entraîner à le dire naturellement est essentiel pour les événements networking.",
    },
    // réseau_professionnel (3)
    {
      type: 'single', difficulty: 2, competence: 'réseau_professionnel',
      text: "Brou veut postuler dans une entreprise sans offre publiée. Quelle approche de candidature spontanée est la plus efficace ?",
      options: [
        "Envoyer son CV standard avec une lettre de motivation générique",
        "Identifier la problématique de l'entreprise et expliquer précisément comment il peut y contribuer",
        "Appeler directement le standard de l'entreprise pour demander un rendez-vous",
        "Publier un post LinkedIn en mentionnant l'entreprise pour attirer leur attention",
      ],
      correct: 1,
      explanation: "Une candidature spontanée efficace montre que vous avez fait des recherches. 'Je vois que vous développez votre activité au Ghana — mon expérience en comptabilité OHADA multi-pays peut vous y aider' est bien plus convaincant qu'une lettre générique.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'réseau_professionnel',
      text: "Ama est invitée à un forum d'affaires à Abidjan. Comment maximiser son réseau lors de cet événement ?",
      options: [
        "Préparer un elevator pitch de 30 secondes clair sur son profil et ses objectifs",
        "Rester principalement avec ses collègues qu'elle connaît pour se sentir à l'aise",
        "Écouter activement les autres intervenants et poser des questions pertinentes",
        "Ajouter les personnes rencontrées sur LinkedIn le soir même avec un message personnalisé",
      ],
      correct: [0, 2, 3],
      explanation: "Networking efficace = pitch préparé, conversations authentiques (écoute + questions), suivi rapide sur LinkedIn. Rester avec ses collègues annule l'objectif du networking.",
    },
    {
      type: 'calculation', difficulty: 1, competence: 'réseau_professionnel',
      text: "Koffi envoie 4 candidatures par semaine depuis 3 semaines. Il obtient un entretien pour 25 % d'entre elles. Combien d'entretiens a-t-il obtenus ?",
      correct: 3, tolerance: 0, unit: 'entretiens',
      hint: "Total candidatures = 4 × 3, puis × 25 %",
      explanation: "4 × 3 = 12 candidatures × 25 % = 3 entretiens. Suivre ces métriques permet d'ajuster sa stratégie : si le taux de réponse est trop bas, il faut retravailler le CV ou les lettres.",
    },
    // travail_à_distance (3)
    {
      type: 'single', difficulty: 1, competence: 'travail_à_distance',
      text: "Ama participe à une visioconférence Zoom. Son arrière-plan montre sa cuisine en désordre. Quelle est la solution la plus professionnelle ?",
      options: [
        "Éteindre la caméra pour toute la réunion",
        "Activer un fond virtuel neutre ou s'installer devant un mur propre",
        "Demander en début de réunion que tout le monde ignore l'arrière-plan",
        "N'activer la vidéo qu'en télétravail depuis un bureau officiel",
      ],
      correct: 1,
      explanation: "Zoom, Teams et Meet proposent des fonds virtuels qui masquent l'arrière-plan. Désactiver la caméra réduit la qualité de l'échange relationnel en réunion.",
    },
    {
      type: 'multi', difficulty: 2, competence: 'travail_à_distance',
      text: "Moussa gère une équipe en télétravail entre Abidjan et Accra avec des deadlines non respectées. Quels outils ou pratiques résoudraient ce problème ?",
      options: [
        "Un outil de gestion de projet (Trello, Asana, Notion) avec tâches assignées et délais visibles",
        "Des réunions quotidiennes obligatoires de 2 heures pour le suivi",
        "Des réunions hebdomadaires courtes avec compte-rendu partagé",
        "Un tableau de bord partagé montrant l'avancement de chaque tâche en temps réel",
      ],
      correct: [0, 2, 3],
      explanation: "Outils de gestion de projet et tableau de bord créent la transparence. Des réunions courtes mais régulières sont plus efficaces que des réunions longues quotidiennes qui épuisent et réduisent la productivité.",
    },
    {
      type: 'input', difficulty: 2, competence: 'travail_à_distance',
      text: "Fatou en télétravail perd la distinction entre vie pro et vie perso. Quelle habitude simple marque psychologiquement la fin de la journée de travail ?",
      acceptableAnswers: ['rituel de fin', 'routine de fin', 'fermer ordinateur', 'se changer', 'sortir marcher', 'déconnexion', 'routine', 'rituel'],
      explanation: "Les rituels de transition (fermer l'ordinateur à heure fixe, se changer, sortir marcher 10 minutes) recréent la séparation bureau/maison. Sans ces signaux, le cerveau reste en 'mode travail' le soir, augmentant le stress.",
    },
  ],
};

// ─── Runtime ──────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const DRY_RUN   = !args.includes('--apply');
const CLEAN     = args.includes('--clean');
const modFilter = args.includes('--module') ? String(args[args.indexOf('--module') + 1]) : null;

const TYPE_LABELS = {
  single: '⚪ Choix unique', multi: '🟣 Multi-choix',
  input: '🟡 Saisie libre', calculation: '🔵 Calcul',
};

async function deleteModuleQuestions(moduleId) {
  const collRef = db.collection('modules').doc(String(moduleId)).collection('questions');
  let deleted = 0;
  while (true) {
    const snap = await collRef.limit(500).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.size;
  }
  return deleted;
}

async function run() {
  console.log(`\n🌱 seedModuleQuestions v4 — ${DRY_RUN ? 'DRY-RUN' : CLEAN ? '🧹 CLEAN + APPLY' : '⚡ APPLY'}\n`);

  const entries = modFilter
    ? [[modFilter, NEW_QUESTIONS[parseInt(modFilter)]]]
    : Object.entries(NEW_QUESTIONS);

  let totalDeleted = 0, totalAdded = 0;

  for (const [moduleId, questions] of entries) {
    if (!questions) { console.log(`⚠️  Module ${moduleId} non trouvé.`); continue; }
    console.log(`\n📦 Module ${moduleId} — ${questions.length} questions`);

    if (!DRY_RUN && CLEAN) {
      const n = await deleteModuleQuestions(moduleId);
      totalDeleted += n;
      console.log(`  🗑️  ${n} questions supprimées`);
    }

    const batch = db.batch();
    questions.forEach((q, i) => {
      const diffLabel  = { 1: '🟢Facile', 2: '🟡Moyen', 3: '🔴Avancé' }[q.difficulty] ?? '❓';
      const typeLabel  = TYPE_LABELS[q.type || 'single'] ?? q.type;
      const doc = {
        type: q.type || 'single',
        text: q.text,
        explanation: q.explanation,
        difficulty: q.difficulty,
        competence: q.competence,
        order: i + 1,
        createdAt: Timestamp.now(),
        source: 'seed_v4',
        ...(q.options              && { options: q.options }),
        ...(q.correct !== undefined && { correct: q.correct }),
        ...(q.acceptableAnswers    && { acceptableAnswers: q.acceptableAnswers }),
        ...(q.tolerance !== undefined && { tolerance: q.tolerance }),
        ...(q.unit                 && { unit: q.unit }),
        ...(q.hint                 && { hint: q.hint }),
      };
      if (DRY_RUN) {
        console.log(`  ${diffLabel} ${typeLabel} [${q.competence}] — ${q.text.slice(0, 70)}…`);
      } else {
        const ref = db.collection('modules').doc(String(moduleId)).collection('questions').doc();
        batch.set(ref, doc);
      }
      totalAdded++;
    });

    if (!DRY_RUN) {
      await batch.commit();
      console.log(`  ✅ ${questions.length} questions écrites`);
    }
  }

  if (DRY_RUN) {
    console.log(`\n💡 Dry-run — ${totalAdded} questions prévisualisées, rien écrit.`);
    console.log(`   --apply            → ajouter sans supprimer`);
    console.log(`   --apply --clean    → supprimer puis réécrire`);
    console.log(`   --apply --clean --module 4  → module seul\n`);
  } else if (CLEAN) {
    console.log(`\n✅ Terminé — ${totalDeleted} supprimées, ${totalAdded} nouvelles écrites.\n`);
  } else {
    console.log(`\n✅ Terminé — ${totalAdded} questions ajoutées.\n`);
  }
}

run().catch((e) => { console.error('❌ Erreur :', e.message); process.exit(1); });
