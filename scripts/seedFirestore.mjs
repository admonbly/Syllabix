/**
 * Script de migration : pousse quizData.js vers Firestore.
 *
 * Usage (une seule fois) :
 *   node scripts/seedFirestore.mjs
 *
 * Prérequis :
 *   npm install firebase (déjà installé dans le projet)
 *   Créer un fichier .env.seed avec vos clés Firebase client (voir ci-dessous)
 *
 * Le script utilise les clés client (pas l'Admin SDK).
 * Structure Firestore créée :
 *   modules/{0..6}           → infos du module
 *   modules/{id}/questions/{1..N} → questions avec imageUrl optionnel
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, writeBatch } from 'firebase/firestore';

// ─── Configuration Firebase (copiez depuis votre lib/firebase.js) ─────────────
const firebaseConfig = {
  apiKey:            'AIzaSyDfbKDfuOHhD1sXDm-nCllDshLu1Sf0HRw',
  authDomain:        'syllabix-e6f20.firebaseapp.com',
  projectId:         'syllabix-e6f20',
  storageBucket:     'syllabix-e6f20.firebasestorage.app',
  messagingSenderId: '779665654341',
  appId:             '1:779665654341:web:6295875ac11404ff69d92c',
};
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── Données (copie de lib/quizData.js adaptée pour Node) ────────────────────
// imageUrl est optionnel : laissez null pour les questions texte uniquement.
// Pour les questions avec image, mettez l'URL Firebase Storage après upload.
const quizData = [
  {
    id: 0,
    module: 'IT (Ordinateur)',
    description: 'Module informatique de base (30 questions)',
    questions: [
      { id: 1, text: 'Lequel de ces éléments est un périphérique de sortie (qui affiche ou communique des données) ?', options: ['Clavier', 'Souris', 'Écran d\'affichage', 'Microphone'], correct: 2, explanation: 'Un périphérique de sortie envoie des informations de l\'ordinateur vers l\'utilisateur. L\'écran affiche les données. Le clavier, la souris et le microphone sont des périphériques d\'entrée.', imageUrl: null },
      { id: 2, text: 'À quoi sert la mémoire vive (RAM) dans un ordinateur ?', options: ['Stocker définitivement vos fichiers', 'Permettre au processeur d\'accéder rapidement aux données en cours d\'utilisation', 'Recharger la batterie', 'Afficher les images sur l\'écran'], correct: 1, explanation: 'La RAM est une mémoire temporaire et rapide. Elle stocke les données que le processeur utilise en ce moment. Quand vous éteignez l\'ordinateur, la RAM est vidée.', imageUrl: null },
      { id: 3, text: 'Votre ordinateur est très lent et fait beaucoup de bruits. Quel est probablement le problème ?', options: ['Le clavier est cassé', 'Vous avez trop de programmes ouverts ou le disque est presque plein', 'C\'est normal, tous les ordinateurs sont lents', 'L\'écran consomme trop d\'énergie'], correct: 1, explanation: 'Un ordinateur lent avec du bruit indique souvent que le processeur ou le disque dur est surchargé. Trop de programmes ouverts consomment la RAM et un disque presque plein ralentit tout le système.', imageUrl: null },
      { id: 4, text: 'Quel système d\'exploitation n\'existe PAS ?', options: ['Windows (Microsoft)', 'Système macOS (Apple)', 'Linux (gratuit, accès source)', 'Chromesoft'], correct: 3, explanation: 'Les vrais systèmes d\'exploitation sont Windows, macOS et Linux. "Chromesoft" n\'existe pas. Il existe ChromeOS (de Google), mais "Chromesoft" est un nom inventé.', imageUrl: null },
      { id: 5, text: 'Quel est le principal avantage d\'un disque SSD par rapport à un disque dur mécanique ?', options: ['Plus d\'espace de stockage disponible', 'Plus rapide, plus silencieux, pas de pièces mobiles', 'Moins cher à l\'achat', 'Meilleur pour les jeux vidéo'], correct: 1, explanation: 'Le SSD utilise de la mémoire flash sans pièces mécaniques. Il démarre plus vite, lit et écrit les données plus rapidement, résiste mieux aux chocs et est silencieux.', imageUrl: null },
      { id: 6, text: 'Le processeur est connu pour être le "cerveau" de l\'ordinateur. Pourquoi ?', options: ['Il stocke tous vos fichiers', 'Il exécute toutes les instructions et contrôle les autres composants', 'Il affiche les images sur l\'écran', 'Il crée Internet'], correct: 1, explanation: 'Le processeur (CPU) exécute les instructions des programmes, effectue les calculs et coordonne tous les composants.', imageUrl: null },
      { id: 7, text: 'Dans Windows, à quoi sert l\'explorateur de fichiers ?', options: ['À supprimer automatiquement les virus', 'À naviguer dans la structure des dossiers et fichiers de votre ordinateur', 'À télécharger Internet', 'À changer la couleur de votre bureau'], correct: 1, explanation: 'L\'explorateur de fichiers permet de naviguer dans les dossiers, copier, déplacer, renommer ou supprimer des fichiers.', imageUrl: null },
      { id: 8, text: 'Vous cliquez droit sur un fichier et sélectionnez "Propriétés". Quelle information pouvez-vous voir ?', options: ['Seulement le nom du fichier', 'La taille, la date de création, le chemin d\'accès, le type de fichier', 'Un accès direct à Internet', 'Le mot de passe de votre ordinateur'], correct: 1, explanation: 'La fenêtre Propriétés affiche la taille, le type, l\'emplacement et la date de création du fichier.', imageUrl: null },
      { id: 9, text: 'Comment libérer de l\'espace sur le disque dur de votre ordinateur ?', options: ['Éteindre l\'ordinateur plusieurs fois par jour', 'Supprimer les fichiers inutiles, les anciens téléchargements, les fichiers temporaires', 'Augmenter le volume des haut-parleurs', 'Mettre à jour le système d\'exploitation'], correct: 1, explanation: 'Pour libérer de l\'espace disque : supprimez les fichiers inutiles, videz la corbeille, nettoyez Téléchargements et utilisez le Nettoyage de disque Windows.', imageUrl: null },
      { id: 10, text: 'Lequel est un format de fichier image couramment utilisé ?', options: ['JPEG', 'DOCX', 'XLSX', 'MPEG'], correct: 0, explanation: 'JPEG est un format image très répandu, idéal pour les photos. DOCX est un document Word, XLSX est un tableur, MPEG est un format vidéo.', imageUrl: null },
      { id: 11, text: 'Pourquoi est-il important d\'avoir un antivirus sur votre ordinateur ?', options: ['Pour accélérer Internet', 'Pour protéger votre ordinateur contre les virus, logiciels malveillants et menaces', 'Pour augmenter la taille du disque', 'Pour changer le fond d\'écran'], correct: 1, explanation: 'Un antivirus surveille les fichiers pour détecter virus, malwares et ransomwares. Sans antivirus, votre ordinateur peut être infecté via emails, clés USB ou sites malveillants.', imageUrl: null },
      { id: 12, text: 'Que fait une mise à jour système sur votre ordinateur ?', options: ['Rend votre ordinateur plus lent', 'Corrige les failles de sécurité, ajoute des fonctionnalités, améliore la stabilité', 'Supprime tous vos fichiers', 'Change votre mot de passe automatiquement'], correct: 1, explanation: 'Les mises à jour corrigent des vulnérabilités, améliorent les performances et ajoutent parfois de nouvelles fonctionnalités.', imageUrl: null },
      { id: 13, text: 'À quoi sert un port USB sur un ordinateur ?', options: ['À chauffer l\'ordinateur', 'À connecter des périphériques comme une souris, clé USB, imprimante', 'À émettre Internet', 'À afficher les images'], correct: 1, explanation: 'USB est un port universel pour connecter clé USB, souris, clavier, imprimante, téléphone, disque externe. Il peut aussi charger des appareils.', imageUrl: null },
      { id: 14, text: 'Qu\'est-ce que le Wi-Fi sur un ordinateur ?', options: ['Un type de virus informatique', 'Une technologie pour se connecter à Internet sans fil', 'Un nom de processeur', 'Un type de fichier à télécharger'], correct: 1, explanation: 'Le Wi-Fi est une technologie sans fil qui permet de connecter un ordinateur à Internet via des ondes radio captées par une carte Wi-Fi.', imageUrl: null },
      { id: 15, text: 'Quelle est la différence entre un simple clic et un double clic de souris ?', options: ['Aucune différence', 'Le simple clic sélectionne, le double clic ouvre généralement le fichier ou programme', 'Le double clic est plus lent', 'Le simple clic rend l\'ordinateur plus rapide'], correct: 1, explanation: 'Un simple clic sélectionne un élément. Un double clic l\'ouvre. Sur Internet, un simple clic suffit souvent pour les liens.', imageUrl: null },
      { id: 16, text: 'À quoi sert la barre des tâches au bas de votre écran Windows ?', options: ['À jouer de la musique', 'À afficher les programmes ouverts, l\'heure, et permettre de lancer des programmes', 'À afficher les images uniquement', 'À charger les jeux vidéo'], correct: 1, explanation: 'La barre des tâches contient le bouton Démarrer, les programmes épinglés, les fenêtres ouvertes et la zone de notification.', imageUrl: null },
      { id: 17, text: 'Quel est l\'avantage d\'avoir deux écrans connectés au même ordinateur ?', options: ['C\'est deux fois plus lent', 'Augmente l\'espace de travail, améliore la productivité', 'C\'est seulement pour les jeux vidéo', 'Cela rend l\'ordinateur cassé'], correct: 1, explanation: 'Un double écran permet d\'étendre le bureau : avoir un document sur un écran et la messagerie sur l\'autre, ou comparer deux fichiers côte à côte.', imageUrl: null },
      { id: 18, text: 'Pourquoi la batterie d\'un ordinateur portable se décharge avec le temps ?', options: ['Le disque dur consomme toute l\'électricité', 'Les composants de l\'ordinateur consomment l\'énergie stockée dans la batterie', 'Parce que vous oubliez d\'éteindre l\'ordinateur', 'La batterie devient automatiquement cassée'], correct: 1, explanation: 'L\'ordinateur utilise l\'énergie de sa batterie pour alimenter le processeur, l\'écran, la RAM et le Wi-Fi. Plus l\'utilisation est intensive, plus la décharge est rapide.', imageUrl: null },
      { id: 19, text: 'Que signifie "permissions de lecture et d\'écriture" pour un fichier ?', options: ['Les deux signifient la même chose', 'Lecture = voir le contenu, Écriture = modifier le contenu', 'Les deux permettent de supprimer le fichier', 'Les deux permettent de partager le fichier en ligne'], correct: 1, explanation: 'Lecture = voir ou ouvrir le fichier. Écriture = modifier, renommer ou supprimer. Ces permissions protègent les fichiers système.', imageUrl: null },
      { id: 20, text: 'À quoi sert la défragmentation d\'un disque dur ?', options: ['À supprimer tous vos fichiers', 'À réorganiser les données pour que le disque accède plus rapidement aux fichiers', 'À augmenter la vitesse d\'Internet', 'À charger les jeux vidéo instantanément'], correct: 1, explanation: 'La défragmentation rassemble les fragments éparpillés d\'un disque mécanique. Note : les SSD n\'ont pas besoin d\'être défragmentés.', imageUrl: null },
      { id: 21, text: 'Quelle est la principale différence entre Bloc-notes et un logiciel de traitement de texte ?', options: ['Aucune différence, ce sont les mêmes', 'Bloc-notes = texte brut simple, Traitement de texte = formatage avancé', 'Bloc-notes est plus lent', 'Traitement de texte n\'existe pas sur ordinateur'], correct: 1, explanation: 'Le Bloc-notes crée des fichiers texte brut sans mise en forme. Word ou LibreOffice Writer permettent titres, tableaux, images, styles.', imageUrl: null },
      { id: 22, text: 'Pourquoi compresser un fichier ou un dossier en ZIP ?', options: ['Pour l\'ouvrir plus rapidement', 'Pour prendre moins d\'espace disque et faciliter le partage', 'Pour protéger le fichier des virus', 'Pour le partager uniquement par e-mail'], correct: 1, explanation: 'La compression ZIP réduit la taille des fichiers. Un dossier de 100 Mo peut devenir 60 Mo zippé. C\'est utile pour partager plusieurs fichiers ou économiser de l\'espace.', imageUrl: null },
      { id: 23, text: 'Quelle est la différence entre mettre son ordinateur en veille et l\'arrêter complètement ?', options: ['Il n\'y a pas de différence', 'Veille = consomme peu d\'énergie et peut redémarrer vite. Arrêt = éteint complètement', 'La veille est plus rapide mais coûte plus cher', 'L\'arrêt est seulement pour les ordinateurs portables'], correct: 1, explanation: 'En veille, l\'ordinateur garde les programmes ouverts et se réveille en secondes. L\'arrêt complet ferme tout et éteint tous les composants.', imageUrl: null },
      { id: 24, text: 'Qu\'est-ce qu\'un logiciel d\'espionnage (spyware) ?', options: ['Un logiciel qui améliore votre ordinateur', 'Un logiciel malveillant qui collecte vos données personnelles sans permission', 'Un jeu vidéo espion', 'Un système d\'exploitation nouveau'], correct: 1, explanation: 'Un spyware collecte vos informations sans consentement : mots de passe, historique de navigation, données bancaires. Il arrive via des téléchargements douteux ou publicités trompeuses.', imageUrl: null },
      { id: 25, text: 'À quoi sert le raccourci clavier Alt+Tab ?', options: ['À créer une nouvelle fenêtre', 'À basculer rapidement entre les programmes ouverts', 'À fermer tous les programmes', 'À sauvegarder votre travail'], correct: 1, explanation: 'Alt+Tab affiche toutes les applications ouvertes et permet de naviguer entre elles. Bien plus rapide que de cliquer dans la barre des tâches.', imageUrl: null },
      { id: 26, text: 'Dans une fenêtre de programme, qu\'indique le bouton en haut à droite avec deux carrés ?', options: ['Fermer le programme', 'Agrandir ou restaurer la fenêtre (plein écran / fenêtre)', 'Minimiser dans la barre des tâches', 'Enregistrer le document'], correct: 1, explanation: 'Le bouton avec deux carrés est le bouton "Maximiser/Restaurer". Un clic met la fenêtre en plein écran, un autre la remet en taille normale. La croix (×) ferme, le tiret (−) minimise.', imageUrl: null },
      { id: 27, text: 'Qu\'est-ce qu\'un pilote (driver) dans Windows ?', options: ['Un chauffeur virtuel', 'Un logiciel qui permet à Windows de communiquer avec un périphérique matériel', 'Un jeu de conduite', 'Un type de virus'], correct: 1, explanation: 'Un driver est un logiciel qui traduit les ordres de Windows pour un périphérique (imprimante, carte graphique, etc.). Sans driver, Windows ne sait pas comment parler à l\'appareil.', imageUrl: null },
      { id: 28, text: 'Que signifie "copier-coller" (Ctrl+C / Ctrl+V) ?', options: ['Supprimer un fichier', 'Dupliquer un élément et le placer ailleurs', 'Imprimer un document', 'Fermer un programme'], correct: 1, explanation: 'Ctrl+C copie l\'élément sélectionné dans le presse-papier (mémoire temporaire). Ctrl+V le colle à l\'emplacement souhaité. L\'original reste en place. Ctrl+X coupe (supprime l\'original).', imageUrl: null },
      { id: 29, text: 'Pourquoi faut-il éjecter une clé USB avant de la retirer ?', options: ['Pour formater automatiquement la clé', 'Pour s\'assurer que toutes les écritures sont terminées et éviter la corruption', 'Pour charger la clé USB', 'C\'est inutile sur les ordinateurs modernes'], correct: 1, explanation: 'Windows met parfois les écritures en cache. Éjecter la clé force Windows à terminer toutes les opérations d\'écriture avant que vous la retiriez, évitant ainsi la corruption des données.', imageUrl: null },
      { id: 30, text: 'Comment savoir si votre connexion Internet est active sous Windows ?', options: ['Regarder si l\'écran est allumé', 'Vérifier l\'icône réseau dans la barre des tâches ou tester avec un navigateur', 'Redémarrer le processeur', 'Vérifier la batterie'], correct: 1, explanation: 'L\'icône réseau en bas à droite de la barre des tâches indique l\'état de la connexion (Wi-Fi ou câble). Une croix rouge indique aucune connexion. Vous pouvez aussi ouvrir un navigateur et tester une page.', imageUrl: null },
    ],
  },
  {
    id: 1,
    module: 'Internet & Google',
    description: 'Internet et moteurs de recherche (5 questions)',
    questions: [
      { id: 1, text: 'Qu\'est-ce qu\'une URL (adresse web) ?', options: ['Un type de virus informatique', 'L\'adresse d\'une page sur Internet (exemple: www.google.com)', 'Un fichier téléchargé sur votre ordinateur', 'Une ligne dans un email'], correct: 1, explanation: 'Une URL est l\'adresse unique d\'une ressource sur Internet. Elle contient le protocole (https://), le nom de domaine et parfois un chemin.', imageUrl: null },
      { id: 2, text: 'Comment s\'appelle le logiciel qui vous permet de consulter des pages internet ?', options: ['Moteur de recherche', 'Navigateur web', 'Système d\'exploitation', 'Antivirus'], correct: 1, explanation: 'Le navigateur web (Chrome, Firefox, Edge, Safari) lit et affiche les pages web. Le moteur de recherche (Google, Bing) est un service qu\'on utilise dans le navigateur.', imageUrl: null },
      { id: 3, text: 'Vous cherchez des informations en français sur Google. Quelle est la bonne pratique ?', options: ['Google ne supporte pas le français', 'Utiliser Google.com avec la langue définie en français dans les paramètres', 'Seul Yahoo supporte le français', 'Il n\'est pas possible de filtrer par langue'], correct: 1, explanation: 'Google permet de définir la langue des résultats dans ses paramètres. Vous pouvez aussi utiliser google.fr ou tout autre domaine Google local.', imageUrl: null },
      { id: 4, text: 'Que veut dire "HTTPS" dans une URL ?', options: ['C\'est plus rapide que HTTP', 'C\'est une version ancienne d\'Internet', 'La connexion est chiffrée et sécurisée', 'C\'est un fournisseur d\'accès Internet'], correct: 2, explanation: 'HTTPS signifie que les données échangées sont chiffrées via SSL/TLS. Le cadenas dans la barre d\'adresse indique une connexion HTTPS. Évitez de saisir des données sensibles sur des sites HTTP.', imageUrl: null },
      { id: 5, text: 'Vous trouvez une information sur Internet qui semble incroyable. Comment vérifier sa crédibilité ?', options: ['Vous la partagez immédiatement sur le réseau social', 'Vous vérifiez la source, cherchez d\'autres sources fiables, analysez les dates', 'Vous acceptez tout ce que vous lisez', 'Vous demandez simplement à vos amis sur WhatsApp'], correct: 1, explanation: 'Appliquez la méthode SIFT : Stop, Investigate the source, Find better coverage, Trace claims. Vérifiez aussi la date de publication.', imageUrl: null },
    ],
  },
  {
    id: 2,
    module: 'Email',
    description: 'Communication par email (5 questions)',
    questions: [
      { id: 1, text: 'Quelle est la structure correcte d\'une adresse email ?', options: ['nom.domaine@com', 'nom@domaine.extension', '@nomdiffrandomdom', 'domaine.nom@'], correct: 1, explanation: 'Une adresse email a la forme : identifiant@domaine.extension. Exemple : jean.dupont@gmail.com. L\'@ est obligatoire et unique.', imageUrl: null },
      { id: 2, text: 'Que signifie "CC" dans un email ?', options: ['Confidentiel Crypté', 'Copie Conforme (copie visible de l\'email)', 'Confirmation de Compte', 'Code de Connexion'], correct: 1, explanation: 'CC (Copie Conforme) envoie une copie à des personnes en info, sans qu\'elles soient les destinataires principaux. BCC masque les adresses aux autres.', imageUrl: null },
      { id: 3, text: 'Vous recevez un email vous demandant de "vérifier votre compte PayPal en cliquant ici". Quelle est la bonne action ?', options: ['Cliquer sur le lien fourni', 'Répondre avec votre mot de passe', 'Aller directement sur PayPal.com sans cliquer le lien', 'Partager l\'email avec vos amis'], correct: 2, explanation: 'C\'est du phishing. La règle d\'or : ne jamais cliquer sur les liens dans les emails suspects. Tapez vous-même l\'adresse du site dans le navigateur.', imageUrl: null },
      { id: 4, text: 'Vous devez envoyer de l\'argent à distance à quelqu\'un qui n\'a pas de compte bancaire. Quelle solution utilisez-vous ?', options: ['Un email avec votre numéro de carte bancaire', 'Un service de transfert mobile (Mobile Money, Western Union, PayPal)', 'Un fax contenant l\'argent en photo', 'Un email classique suffit pour envoyer de l\'argent'], correct: 1, explanation: 'L\'email ne permet pas d\'envoyer de l\'argent. Pour les transferts, utilisez des services dédiés : Mobile Money (Orange Money, MTN, Wave) ou PayPal, Western Union, Wise.', imageUrl: null },
      { id: 5, text: 'Vous devez envoyer un document confidentiel par email à votre patron. Que faites-vous ?', options: ['Vous l\'envoyez en clair (lisible directement)', 'Vous chiffrez le PDF avec un mot de passe et l\'envoyez séparément du mot de passe', 'Vous ne l\'envoyez pas du tout', 'Vous le postez sur votre compte Facebook'], correct: 1, explanation: 'Chiffrez le document avec un mot de passe (Adobe Acrobat, LibreOffice, ZIP protégé). Envoyez le fichier par email et le mot de passe via un autre canal (SMS, appel).', imageUrl: null },
    ],
  },
  {
    id: 3,
    module: 'Bureautique',
    description: 'Outils bureautiques (5 questions)',
    questions: [
      { id: 1, text: 'Quel logiciel utilise-t-on pour créer un document texte ?', options: ['Microsoft Excel', 'Microsoft Word ou LibreOffice Writer', 'Microsoft PowerPoint', 'Adobe Photoshop'], correct: 1, explanation: 'Word et LibreOffice Writer sont des logiciels de traitement de texte. Excel sert aux calculs, PowerPoint aux présentations, Photoshop à la retouche d\'images.', imageUrl: null },
      { id: 2, text: 'Pour faire des calculs et des graphiques, quel logiciel utilisez-vous ?', options: ['Word', 'PowerPoint', 'Excel ou LibreOffice Calc', 'Notepad'], correct: 2, explanation: 'Excel et Calc sont des tableurs : tableaux avec formules automatiques, graphiques et bases de données simples. Indispensables pour les budgets et analyses.', imageUrl: null },
      { id: 3, text: 'Vous devez créer un budget pour un petit commerce. Quel outil est le mieux adapté ?', options: ['Vous notez en papier', 'Un tableur (Excel ou Calc) avec des catégories, des calculs automatiques', 'Google Docs (document texte)', 'Un email'], correct: 1, explanation: 'Un tableur est idéal pour un budget : revenus et dépenses en colonnes, formules qui calculent totaux et marges, graphiques pour visualiser. Google Sheets est gratuit et accessible sur téléphone.', imageUrl: null },
      { id: 4, text: 'Comment insérer une image dans un document Word ?', options: ['Vous ne pouvez pas', 'Insertion > Image > Sélectionner le fichier', 'Vous devez payer pour ça', 'Ce n\'est possible qu\'en version en ligne'], correct: 1, explanation: 'Dans Word : onglet "Insertion" → "Image". Vous pouvez insérer depuis votre ordinateur ou via copier-coller.', imageUrl: null },
      { id: 5, text: 'Vous devez formater un CV professionnel. Que ne faites-vous PAS ?', options: ['Ajouter des couleurs sobres', 'Utiliser des polices lisibles', 'Avec un design complètement fou et de la Comic Sans', 'Garder une structure claire'], correct: 2, explanation: 'Un CV professionnel doit être sobre et lisible. Évitez Comic Sans, les couleurs criardes et trop d\'ornements. Préférez Calibri ou Arial, une structure claire.', imageUrl: null },
    ],
  },
  {
    id: 4,
    module: 'Cybersécurité',
    description: 'Protection et sécurité informatique (5 questions)',
    questions: [
      { id: 1, text: 'Un mot de passe sûr doit contenir :', options: ['Uniquement votre nom', 'Uniquement des chiffres', 'Lettres (majuscules + minuscules) + chiffres + caractères spéciaux', 'Votre date de naissance'], correct: 2, explanation: 'Un bon mot de passe combine majuscules, minuscules, chiffres et symboles sur au moins 12 caractères. Utilisez un gestionnaire (Bitwarden, 1Password).', imageUrl: null },
      { id: 2, text: 'Que signifie "malware" ?', options: ['Un logiciel utile', 'Un virus ou logiciel malveillant', 'Un système d\'exploitation', 'Un type de processeur'], correct: 1, explanation: 'Malware désigne tout logiciel conçu pour nuire : virus, ransomware, trojan, spyware. La protection passe par un antivirus à jour et la vigilance face aux téléchargements.', imageUrl: null },
      { id: 3, text: 'Vous utilisez le WiFi public d\'un café. Comment protégez-vous vos données ?', options: ['Vous faites vos transactions bancaires directement', 'Vous utilisez un VPN pour chiffrer votre connexion', 'Vous ignorez la sécurité', 'Vous utilisez Facebook uniquement'], correct: 1, explanation: 'Le WiFi public est non sécurisé. Un VPN chiffre tout votre trafic. Évitez aussi les transactions bancaires sur WiFi public, même avec VPN.', imageUrl: null },
      { id: 4, text: 'Un virus peut se propager par :', options: ['L\'air', 'Les emails avec pièces jointes malveillantes', 'Juste en regardant votre écran', 'Les livres'], correct: 1, explanation: 'Les virus se propagent via pièces jointes d\'emails, clés USB infectées, téléchargements douteux, logiciels piratés. Ils ne se transmettent pas par l\'air.', imageUrl: null },
      { id: 5, text: 'Après un achat en ligne, vous recevez un SMS "Cliquez pour confirmer votre livraison". C\'est quoi ?', options: ['Un vrai message de livraison', 'Une tentative de vol d\'identité (smishing) - ne cliquez pas', 'Un service premium à acheter', 'Un message de votre banque'], correct: 1, explanation: 'C\'est du smishing (SMS phishing). Le lien mène sur un faux site qui vole vos coordonnées. Vérifiez toujours directement sur le site officiel du transporteur.', imageUrl: null },
    ],
  },
  {
    id: 5,
    module: 'Intelligence Artificielle',
    description: 'IA et technologies intelligentes (5 questions)',
    questions: [
      { id: 1, text: 'Qu\'est-ce que l\'Intelligence Artificielle (IA) ?', options: ['Un film de science-fiction', 'Un ensemble de technologies imitant l\'intelligence humaine', 'Un virus informatique', 'Un navigateur Internet'], correct: 1, explanation: 'L\'IA simule des capacités humaines : apprendre, comprendre le langage, reconnaître des images, prendre des décisions. Elle est déjà présente partout : recommandations Netflix, traduction Google, assistants vocaux.', imageUrl: null },
      { id: 2, text: 'ChatGPT est :', options: ['Un email gratuit', 'Un modèle de langage IA pour converser', 'Un jeu vidéo', 'Un fournisseur d\'accès Internet'], correct: 1, explanation: 'ChatGPT est un LLM développé par OpenAI. Il peut répondre, rédiger, expliquer, coder. Des alternatives : Claude (Anthropic), Gemini (Google), Mistral (France).', imageUrl: null },
      { id: 3, text: 'Une petite entreprise peut utiliser l\'IA pour :', options: ['Remplacer tous les employés (mauvaise idée !)', 'Améliorer le service client (chatbot), analyser des données, automatiser des tâches', 'Rien, c\'est trop compliqué pour les petites structures', 'Juste pour faire du marketing'], correct: 1, explanation: 'L\'IA offre des opportunités pour les PME : chatbots pour le service client 24h/24, analyse des ventes, traduction automatique, génération de contenu. Des outils comme Canva AI, ChatGPT sont accessibles gratuitement.', imageUrl: null },
      { id: 4, text: 'L\'IA générative peut créer :', options: ['Que du texte', 'Texte, images, vidéos, code, musique', 'Rien', 'Que des images'], correct: 1, explanation: 'L\'IA générative crée du nouveau contenu : texte (ChatGPT, Claude), images (DALL-E, Midjourney), vidéos (Sora), code (GitHub Copilot), musique (Suno). Elle pose des questions sur les droits d\'auteur et les deepfakes.', imageUrl: null },
      { id: 5, text: 'Quels sont les risques éthiques de l\'IA ?', options: ['Pas de risques', 'Biais dans les algorithmes, atteinte à la vie privée, deepfakes, dépendance', 'Aucun risque techniquement', 'Juste un hype sans importance'], correct: 1, explanation: 'L\'IA présente des risques réels : biais algorithmiques (discrimination), atteinte à la vie privée (reconnaissance faciale de masse), deepfakes, et perte d\'emplois dans certains secteurs.', imageUrl: null },
    ],
  },
  {
    id: 6,
    module: 'Employabilité',
    description: 'Emploi et développement de carrière (5 questions)',
    questions: [
      { id: 1, text: 'Pour chercher un emploi en ligne, le premier outil est :', options: ['Facebook uniquement', 'LinkedIn, Indeed, ou les jobboards spécialisés de votre secteur', 'Appel téléphonique uniquement', 'Votre CV papier déposé en main propre'], correct: 1, explanation: 'LinkedIn est le réseau professionnel mondial numéro 1. Indeed, Glassdoor et des jobboards sectoriels complètent l\'offre. 70-80% des emplois se trouvent via le réseau professionnel.', imageUrl: null },
      { id: 2, text: 'Qu\'est-ce qu\'un portfolio numérique ?', options: ['Un dossier papier', 'Une collection de vos projets, compétences, résultats en ligne', 'Une formation payante', 'Un CV Word classique'], correct: 1, explanation: 'Un portfolio numérique présente vos réalisations concrètes : projets réalisés, designs créés, code développé. Contrairement au CV qui liste ce que vous savez, le portfolio prouve ce que vous avez fait.', imageUrl: null },
      { id: 3, text: 'Quel est l\'avantage d\'avoir des certifications numériques ?', options: ['Aucun intérêt dans le monde du travail', 'Se différencier, prouver ses compétences de façon vérifiable, ouvrir des portes', 'Uniquement utiles pour les grandes entreprises', 'Juste pour décorer votre CV'], correct: 1, explanation: 'Les certifications attestent de compétences réelles vérifiables. Elles renforcent votre crédibilité, vous différencient des candidats sans preuve concrète, et permettent de postuler à des offres locales ou internationales.', imageUrl: null },
      { id: 4, text: 'Le networking numérique signifie :', options: ['Acheter des ordinateurs', 'Créer des contacts professionnels en ligne (LinkedIn, events virtuels)', 'Installer un réseau WiFi', 'Aucun rapport avec l\'emploi'], correct: 1, explanation: 'Le networking en ligne : suivre des professionnels sur LinkedIn, commenter leurs publications, participer à des groupes, assister à des webinaires. 70-80% des emplois sont pourvus via le réseau.', imageUrl: null },
      { id: 5, text: 'Quelle est la meilleure stratégie pour une carrière tech durable ?', options: ['Acquérir une compétence et rester statique', 'Apprendre continuellement, réseauter, avoir un portfolio visible, être flexible', 'Attendre qu\'une opportunité vienne à vous', 'Copier exactement ce que les autres font'], correct: 1, explanation: 'Le secteur tech évolue vite. La stratégie gagnante : apprentissage continu, réseau actif (LinkedIn, événements), portfolio visible de réalisations, et flexibilité pour s\'adapter aux évolutions du marché.', imageUrl: null },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🚀 Début de la migration vers Firestore...\n');
  let totalQuestions = 0;

  for (const module of quizData) {
    const moduleRef = doc(db, 'modules', String(module.id));
    await setDoc(moduleRef, {
      id:          module.id,
      module:      module.module,
      description: module.description,
    });
    console.log(`✅ Module ${module.id}: "${module.module}" créé`);

    // Écriture des questions par batch (max 500 ops par batch)
    const batch = writeBatch(db);
    for (const question of module.questions) {
      const qRef = doc(collection(db, 'modules', String(module.id), 'questions'), String(question.id));
      batch.set(qRef, {
        id:          question.id,
        moduleId:    module.id,
        order:       question.id,
        text:        question.text,
        options:     question.options,
        correct:     question.correct,
        explanation: question.explanation,
        imageUrl:    question.imageUrl ?? null,
      });
      totalQuestions++;
    }
    await batch.commit();
    console.log(`   → ${module.questions.length} questions migrées`);
  }

  console.log(`\n✨ Migration terminée ! ${quizData.length} modules, ${totalQuestions} questions dans Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erreur de migration :', err);
  process.exit(1);
});
