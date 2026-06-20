# Nouvelles questions pratiques avec images
> 5 questions par module (1 à 6) — 30 questions au total
> imageDescription = description de l'image à trouver/créer pour chaque question
> imageUrl = null (à remplir après upload sur Firebase Storage)

---

## MODULE 1 — Internet & Google (questions 6 à 10)

```js
{
  id: 6,
  text: 'Regardez la barre d\'adresse de ce navigateur. Ce site est-il sécurisé ?',
  imageDescription: 'Capture d\'écran d\'une barre d\'adresse Chrome montrant "http://banque-credit.net/login" sans cadenas, en HTTP (pas HTTPS)',
  options: [
    'Oui, c\'est sécurisé car c\'est une banque',
    'Non — HTTP sans cadenas = connexion non chiffrée, vos données peuvent être interceptées',
    'Oui, tous les sites de banque sont sécurisés automatiquement',
    'Impossible de savoir juste avec la barre d\'adresse',
  ],
  correct: 1,
  explanation: 'Le préfixe "http://" sans cadenas indique que la connexion n\'est pas chiffrée. Pour un site bancaire, c\'est un signal d\'alarme majeur — ne saisissez jamais vos identifiants sur un site HTTP. Les vrais sites bancaires utilisent toujours HTTPS avec un cadenas visible.',
  imageUrl: null,
},
{
  id: 7,
  text: 'Vous voyez ces résultats de recherche Google. Lequel est une publicité (pas un résultat naturel) ?',
  imageDescription: 'Capture d\'écran de résultats Google avec 2 résultats marqués "Sponsorisé" en haut et 3 résultats organiques en dessous',
  options: [
    'Les résultats tout en bas de la page',
    'Les résultats avec le badge "Sponsorisé" en haut de page',
    'Les résultats avec une étoile jaune',
    'Il n\'y a pas de publicités sur Google',
  ],
  correct: 1,
  explanation: 'Google affiche des résultats payants (annonces) marqués "Sponsorisé" en haut et parfois en bas des résultats. Ces résultats sont des publicités achetées par des entreprises. Les résultats organiques (non payants) apparaissent en dessous et sont classés par pertinence algorithmique.',
  imageUrl: null,
},
{
  id: 8,
  text: 'Ce message s\'affiche dans votre navigateur. Quelle est la bonne action ?',
  imageDescription: 'Capture d\'écran d\'un avertissement Chrome "Votre connexion n\'est pas privée" avec le code d\'erreur NET::ERR_CERT_EXPIRED et un bouton "Avancé"',
  options: [
    'Cliquer sur "Avancé" et continuer quand même',
    'Quitter le site immédiatement — le certificat de sécurité est invalide ou expiré',
    'Rafraîchir la page plusieurs fois',
    'Changer de navigateur pour que ça fonctionne',
  ],
  correct: 1,
  explanation: 'Cet avertissement signifie que le certificat SSL du site est invalide, expiré ou suspect. Le navigateur vous protège. Quitter est la bonne décision, surtout si le site demande des données personnelles. Seule exception : un réseau d\'entreprise avec un certificat interne connu.',
  imageUrl: null,
},
{
  id: 9,
  text: 'Vous cherchez sur Google et obtenez ce résultat. L\'information est-elle fiable ?',
  imageDescription: 'Capture d\'écran d\'un résultat Google d\'un site "infos-rapides24.blogspot.com" avec un titre sensationnaliste et une date de publication de 2015',
  options: [
    'Oui, Google ne montre que des informations vérifiées',
    'Probablement pas — source inconnue sur Blogspot, date ancienne, titre sensationnaliste',
    'Oui, si c\'est sur Internet c\'est forcément vrai',
    'Oui, la date n\'a aucune importance',
  ],
  correct: 1,
  explanation: 'Plusieurs signaux d\'alerte ici : domaine blogspot.com (blog personnel non vérifié), titre accrocheur conçu pour provoquer une réaction émotionnelle, et contenu publié en 2015 qui peut être obsolète. Préférez des sources reconnues : sites institutionnels (.gouv, .org), médias de référence, Wikipedia avec citations.',
  imageUrl: null,
},
{
  id: 10,
  text: 'Dans ce navigateur, où tapez-vous une adresse web (URL) ?',
  imageDescription: 'Capture d\'écran d\'un navigateur Chrome vide avec flèches numérotées pointant vers : 1) la barre d\'adresse en haut, 2) la barre de recherche Google au centre de la page, 3) les favoris, 4) l\'onglet',
  options: [
    'Dans la barre de recherche Google au centre de la page (flèche 2)',
    'Dans la barre d\'adresse tout en haut du navigateur (flèche 1)',
    'Dans les favoris (flèche 3)',
    'Dans un nouvel onglet (flèche 4)',
  ],
  correct: 1,
  explanation: 'La barre d\'adresse (en haut, aussi appelée "omnibox" dans Chrome) sert à taper directement une URL (ex: syllabix.vercel.app). Si vous tapez dans la barre de recherche Google au centre, vous lancez une recherche — utile si vous ne connaissez pas l\'adresse exacte.',
  imageUrl: null,
},
```

---

## MODULE 2 — Email (questions 6 à 10)

```js
{
  id: 6,
  text: 'Regardez cet email. S\'agit-il d\'une tentative de phishing ?',
  imageDescription: 'Capture d\'écran d\'un faux email "Orange" avec : logo mal pixelisé, expéditeur "service@orange-factures.net", texte "Votre facture est impayée, cliquez ICI sous 24h ou votre ligne sera coupée", lien surligné en rouge',
  options: [
    'Non, c\'est un vrai email d\'Orange',
    'Oui — expéditeur suspect, urgence artificielle, lien vers un domaine non officiel',
    'Difficile à dire, il vaut mieux cliquer pour vérifier',
    'Non, le logo Orange est présent donc c\'est authentique',
  ],
  correct: 1,
  explanation: 'Plusieurs indices de phishing : l\'adresse expéditeur "orange-factures.net" n\'est pas le domaine officiel orange.fr, le message crée une urgence artificielle ("24h"), et les logos peuvent être copiés facilement. Vérifiez toujours en allant directement sur le site officiel de votre opérateur, jamais via les liens de l\'email.',
  imageUrl: null,
},
{
  id: 7,
  text: 'Vous rédigez un email professionnel. Regardez cette capture — quelle erreur voyez-vous ?',
  imageDescription: 'Capture d\'écran d\'un email en rédaction avec : objet vide, destinataire en champ "À", et un texte commençant par "bjr, j\'voulais savoir si vous pouviez me donner un rdv???"',
  options: [
    'L\'email est parfait pour un contexte professionnel',
    'Objet manquant, langage familier (bjr, j\'voulais), ponctuation excessive (???)',
    'Seul l\'objet manquant est un problème',
    'Le problème est que le destinataire est en "À" au lieu de "CC"',
  ],
  correct: 1,
  explanation: 'Un email professionnel requiert : un objet clair et précis, un langage formel (Bonjour, je souhaitais savoir si...), une ponctuation normale, et une signature. Les abréviations SMS et la ponctuation excessive donnent une mauvaise image de votre professionnalisme.',
  imageUrl: null,
},
{
  id: 8,
  text: 'Vous recevez cet email avec une pièce jointe. Que faites-vous ?',
  imageDescription: 'Capture d\'écran d\'un email d\'un inconnu avec sujet "URGENT - Document important" et une pièce jointe nommée "facture.pdf.exe"',
  options: [
    'Ouvrir la pièce jointe pour voir ce que c\'est',
    'Ne pas ouvrir — une extension ".exe" cachée derrière ".pdf" est un malware classique',
    'Répondre à l\'expéditeur pour demander ce que c\'est',
    'Transférer à vos collègues pour avoir leur avis',
  ],
  correct: 1,
  explanation: 'Le fichier "facture.pdf.exe" utilise une astuce classique : il semble être un PDF mais est en réalité un programme exécutable (.exe). Si vous l\'ouvrez, il peut installer un virus, un ransomware ou un spyware. Ne jamais ouvrir une pièce jointe d\'un expéditeur inconnu, surtout avec une double extension.',
  imageUrl: null,
},
{
  id: 9,
  text: 'Regardez cette interface email. Quelle est la différence entre "Répondre" et "Répondre à tous" ?',
  imageDescription: 'Capture d\'écran d\'un email reçu avec plusieurs destinataires visible, et les deux boutons "Répondre" et "Répondre à tous" mis en évidence',
  options: [
    'Il n\'y a aucune différence',
    '"Répondre" envoie à l\'expéditeur seulement, "Répondre à tous" envoie à tous les destinataires visibles',
    '"Répondre à tous" envoie à tous vos contacts',
    '"Répondre" est plus rapide que "Répondre à tous"',
  ],
  correct: 1,
  explanation: '"Répondre" envoie votre message uniquement à la personne qui a envoyé l\'email original. "Répondre à tous" l\'envoie à l\'expéditeur ET à toutes les personnes en À et CC. Utilisez "Répondre à tous" avec prudence — évitez de spammer tout un groupe avec une réponse qui ne concerne qu\'une seule personne.',
  imageUrl: null,
},
{
  id: 10,
  text: 'Vous voulez envoyer ce document confidentiel par email. Quelle option choisissez-vous ?',
  imageDescription: 'Capture d\'écran d\'une fenêtre de rédaction email avec en bas les options : "Joindre un fichier", "Envoyer via Google Drive (lien partagé)", "Chiffrer le message", "Demander un accusé de lecture"',
  options: [
    'Joindre directement le fichier sans protection',
    'Chiffrer le message ET protéger le fichier par mot de passe avant de l\'envoyer',
    'L\'envoyer via Google Drive en accès public',
    'Demander un accusé de lecture suffit à sécuriser le document',
  ],
  correct: 1,
  explanation: 'Pour un document confidentiel : protégez d\'abord le fichier avec un mot de passe (via Word, Adobe Acrobat ou un ZIP chiffré), puis envoyez le mot de passe via un autre canal (SMS, appel). Même si l\'email est intercepté, le document reste illisible sans le mot de passe.',
  imageUrl: null,
},
```

---

## MODULE 3 — Bureautique (questions 6 à 10)

```js
{
  id: 6,
  text: 'Dans ce tableau Excel, quelle formule permet de calculer la somme des cellules B2 à B6 ?',
  imageDescription: 'Capture d\'écran d\'un tableau Excel simple avec des chiffres en colonne B (B2:B6) et une cellule B7 sélectionnée avec la barre de formule vide',
  options: [
    '=TOTAL(B2:B6)',
    '=SOMME(B2:B6)',
    '=ADDITIONNER(B2 à B6)',
    '=B2+B3+B4+B5+B6 uniquement',
  ],
  correct: 1,
  explanation: '=SOMME(B2:B6) est la formule Excel correcte pour additionner une plage de cellules. =TOTAL() n\'existe pas dans Excel. La formule longue =B2+B3+... fonctionne aussi mais est moins pratique pour de grandes plages. En anglais, la fonction s\'appelle =SUM().',
  imageUrl: null,
},
{
  id: 7,
  text: 'Regardez ce document Word. Quel problème de mise en forme voyez-vous ?',
  imageDescription: 'Capture d\'écran d\'un document Word avec : 3 polices différentes dans le même paragraphe (Arial, Comic Sans, Times New Roman), texte en rouge/vert/bleu mélangés, et titres non alignés',
  options: [
    'Le document est bien formaté, il y a de la diversité',
    'Trop de polices et couleurs mélangées — manque de cohérence visuelle',
    'Le seul problème est la police Comic Sans',
    'Les couleurs sont le seul problème',
  ],
  correct: 1,
  explanation: 'Un document professionnel doit avoir une cohérence visuelle : maximum 2 polices (une pour les titres, une pour le corps), 1 ou 2 couleurs maximum, des titres hiérarchisés avec les styles Word (Titre 1, Titre 2). Trop de variété crée un document difficile à lire et peu professionnel.',
  imageUrl: null,
},
{
  id: 8,
  text: 'Vous préparez cette présentation PowerPoint. Quelle diapositive est la mieux conçue ?',
  imageDescription: 'Capture d\'écran de 4 miniatures de diapositives : A) slide blanc avec 200 mots de texte dense, B) slide avec titre clair + 3 puces courtes + image, C) slide entièrement remplie de graphiques superposés, D) slide avec 5 polices différentes et fond animé criard',
  options: [
    'Diapositive A — plus d\'information c\'est mieux',
    'Diapositive B — titre clair, points essentiels, une image',
    'Diapositive C — les graphiques montrent la maîtrise des données',
    'Diapositive D — le design créatif retient l\'attention',
  ],
  correct: 1,
  explanation: 'La règle d\'or en présentation : une idée par diapositive. La diapositive B suit le principe "moins c\'est plus" — titre clair, 3 points maximum, une image pertinente. Les slides surchargées (A et C) fatiguent l\'audience. Les designs criards (D) distraient du message principal.',
  imageUrl: null,
},
{
  id: 9,
  text: 'Regardez ce tableau Excel. La formule en C2 affiche "#DIV/0!". Que signifie cette erreur ?',
  imageDescription: 'Capture d\'écran d\'un tableau Excel avec colonne A (ventes), colonne B (objectifs, avec B2 = 0), et colonne C (ratio) où C2 affiche en rouge "#DIV/0!"',
  options: [
    'La cellule contient trop de caractères',
    'La formule tente de diviser par zéro — valeur impossible en mathématiques',
    'Excel a un bug et doit être redémarré',
    'La colonne B est trop étroite pour afficher le résultat',
  ],
  correct: 1,
  explanation: '#DIV/0! est une erreur Excel qui apparaît quand une formule divise par zéro (ou une cellule vide). Pour la corriger : utilisez =SI(B2=0, "N/A", A2/B2) pour afficher "N/A" quand le diviseur est zéro. Cette erreur est courante dans les calculs de ratio, taux et pourcentages.',
  imageUrl: null,
},
{
  id: 10,
  text: 'Vous regardez ce CV. Quelle est la principale amélioration à apporter ?',
  imageDescription: 'Capture d\'écran d\'un CV avec : photo en portrait correct, titre de poste visible, mais section "Expériences" listant des tâches génériques comme "j\'ai travaillé dans une entreprise", "j\'ai fait des choses importantes", sans dates ni noms d\'entreprises',
  options: [
    'Changer la photo de profil',
    'Remplacer les descriptions vagues par des réalisations concrètes avec dates, entreprises et résultats mesurables',
    'Ajouter plus de couleurs pour attirer l\'attention',
    'Réduire le CV à une seule ligne par expérience',
  ],
  correct: 1,
  explanation: 'Un CV efficace décrit des réalisations concrètes et mesurables : "Augmentation des ventes de 20% en 6 mois chez [Entreprise] (2023-2024)" vaut mieux que "j\'ai amélioré les ventes". Indiquez toujours les dates, le nom de l\'entreprise et une métrique quand possible.',
  imageUrl: null,
},
```

---

## MODULE 4 — Cybersécurité (questions 6 à 10)

```js
{
  id: 6,
  text: 'Regardez cette fenêtre pop-up qui s\'est ouverte dans votre navigateur. Que faites-vous ?',
  imageDescription: 'Capture d\'écran d\'une pop-up alarmiste avec fond rouge : "⚠️ VOTRE ORDINATEUR EST INFECTÉ PAR 5 VIRUS ! Appelez immédiatement le 0800-XXXXX ou cliquez ICI pour supprimer maintenant !" avec un bouton vert "NETTOYER MAINTENANT"',
  options: [
    'Appeler le numéro affiché immédiatement',
    'Cliquer sur "Nettoyer maintenant" pour supprimer les virus',
    'Fermer la pop-up (Alt+F4 ou fermer l\'onglet) — c\'est une arnaque classique',
    'Éteindre l\'ordinateur d\'urgence',
  ],
  correct: 2,
  explanation: 'C\'est une arnaque connue : "scareware" ou "faux support technique". Votre ordinateur n\'est pas infecté — c\'est une pub alarmiste conçue pour vous faire appeler un faux support (arnaque téléphonique) ou installer un vrai malware. Fermez simplement l\'onglet ou la fenêtre. Un antivirus légitime n\'affiche jamais d\'alertes dans le navigateur.',
  imageUrl: null,
},
{
  id: 7,
  text: 'Vous utilisez ce réseau WiFi dans un aéroport. Lequel choisissez-vous ?',
  imageDescription: 'Capture d\'écran d\'une liste de réseaux WiFi sur un téléphone : "Airport_Free_WiFi" (ouvert, aucun cadenas), "AirportOfficialWiFi_Secure" (cadenas, WPA2), "FREE_FAST_INTERNET" (ouvert), et "iPhone de Jean" (point d\'accès personnel)',
  options: [
    'Airport_Free_WiFi — c\'est gratuit et rapide',
    'FREE_FAST_INTERNET — connexion la plus rapide',
    'AirportOfficialWiFi_Secure — réseau chiffré WPA2 officiel',
    'Les 4 sont identiques en termes de sécurité',
  ],
  correct: 2,
  explanation: 'Le réseau avec cadenas (WPA2/WPA3) chiffre les données échangées. Les réseaux ouverts sans cadenas (Airport_Free_WiFi, FREE_FAST_INTERNET) peuvent être des hotspots frauduleux créés par des hackers pour intercepter votre trafic. Quand possible, utilisez votre données mobiles personnelles plutôt qu\'un WiFi public inconnu.',
  imageUrl: null,
},
{
  id: 8,
  text: 'Regardez ces deux mots de passe. Lequel est le plus sécurisé ?',
  imageDescription: 'Capture d\'écran d\'un gestionnaire de mots de passe montrant deux entrées avec leur score de sécurité : Mot de passe A : "Sophie2001!" (score : 35/100, Faible) et Mot de passe B : "xK#9mP$vQ2@nL" (score : 98/100, Très fort)',
  options: [
    'Mot de passe A — plus facile à retenir donc meilleur',
    'Mot de passe B — combinaison aléatoire de caractères variés, score 98/100',
    'Les deux sont équivalents en sécurité',
    'Mot de passe A — il contient une majuscule et un symbole',
  ],
  correct: 1,
  explanation: 'Le mot de passe A contient un prénom et une date de naissance — facile à deviner par force brute ou ingénierie sociale. Le mot de passe B est une chaîne aléatoire de 13 caractères mêlant majuscules, minuscules, chiffres et symboles : pratiquement impossible à deviner. Utilisez un gestionnaire (Bitwarden, gratuit) pour mémoriser des mots de passe forts.',
  imageUrl: null,
},
{
  id: 9,
  text: 'Vous recevez ce SMS. Quelle est la bonne réaction ?',
  imageDescription: 'Capture d\'écran d\'un SMS : "Votre colis La Poste n\'a pas pu être livré. Frais de réexpédition : 1,99€. Payez ici : http://laposte-relivraison.xyz/paiement"',
  options: [
    'Payer les 1,99€ — c\'est une petite somme et le colis est important',
    'Cliquer sur le lien pour voir si c\'est vrai avant de payer',
    'Ne pas cliquer — domaine non officiel (.xyz), vérifier directement sur laposte.fr',
    'Répondre STOP pour se désabonner',
  ],
  correct: 2,
  explanation: 'C\'est du smishing. Le vrai site de La Poste est laposte.fr — jamais laposte-relivraison.xyz. Les arnaqueurs utilisent des domaines similaires pour tromper. Les 1,99€ servent à récupérer vos coordonnées bancaires pour de futurs prélèvements. Vérifiez toujours en tapant vous-même l\'adresse officielle.',
  imageUrl: null,
},
{
  id: 10,
  text: 'Regardez les permissions demandées par cette application. Doit-on les accepter ?',
  imageDescription: 'Capture d\'écran d\'une demande de permissions Android pour une application "Lampe de poche" qui demande : Contacts, Microphone, Localisation GPS, Caméra, SMS',
  options: [
    'Oui, toutes les applications ont besoin de beaucoup de permissions pour fonctionner',
    'Non — une lampe de poche n\'a besoin d\'aucune de ces permissions pour fonctionner',
    'Oui, mais seulement si l\'application est gratuite',
    'Accepter seulement la permission Caméra pour la lampe',
  ],
  correct: 1,
  explanation: 'Une application lampe de poche n\'a besoin que d\'accéder à la LED de l\'appareil photo — elle n\'a aucune raison légitime d\'accéder à vos contacts, micro, localisation ou SMS. Des permissions excessives signalent souvent un logiciel espion déguisé. Installez uniquement depuis des sources officielles et questionnez chaque permission demandée.',
  imageUrl: null,
},
```

---

## MODULE 5 — Intelligence Artificielle (questions 6 à 10)

```js
{
  id: 6,
  text: 'Regardez cette image générée par IA. Comment identifier qu\'elle est artificielle ?',
  imageDescription: 'Image générée par Midjourney/DALL-E d\'une personne avec des détails suspects : 6 doigts sur une main, texte illisible sur un panneau en arrière-plan, oreilles asymétriques',
  options: [
    'C\'est impossible à détecter, les IA sont parfaites',
    'La qualité trop lisse, les doigts malformés, le texte incohérent sont des indices classiques',
    'Seule la résolution trop haute indique une image IA',
    'Aucun de ces éléments n\'indique une image artificielle',
  ],
  correct: 1,
  explanation: 'Les IA génératives actuelles ont des failles reconnaissables : mains avec trop ou pas assez de doigts, texte illisible ou inventé, bijoux/accessoires asymétriques, arrière-plans incohérents. Des outils de détection existent (AI or Not, Hive Moderation) mais l\'œil critique reste essentiel face aux deepfakes.',
  imageUrl: null,
},
{
  id: 7,
  text: 'Vous utilisez ChatGPT pour vous aider. Il vous donne cette réponse avec une source. Quelle est l\'erreur ?',
  imageDescription: 'Capture d\'écran de ChatGPT donnant une réponse avec une citation : "Selon l\'étude de Dr. Martin, Université de Paris (2023), disponible sur [URL inventée qui ne mène nulle part]"',
  options: [
    'La réponse est forcément correcte car ChatGPT ne ment jamais',
    'ChatGPT "hallucine" — il peut inventer des sources, citations et études qui n\'existent pas',
    'Le problème est uniquement que l\'URL ne fonctionne pas',
    'C\'est normal, ChatGPT cite toujours des sources fiables',
  ],
  correct: 1,
  explanation: 'Les LLM comme ChatGPT peuvent "halluciner" : inventer des faits, des noms d\'auteurs, des titres d\'études ou des URLs qui semblent réels mais n\'existent pas. Vérifiez toujours les sources importantes indépendamment. L\'IA est un assistant, pas une source de vérité absolue.',
  imageUrl: null,
},
{
  id: 8,
  text: 'Regardez ce prompt (instruction) donné à une IA. Lequel obtiendra le meilleur résultat ?',
  imageDescription: 'Capture d\'écran comparant 4 prompts dans une interface ChatGPT : A) "écris un email", B) "écris un email professionnel à mon client pour reporter une réunion au vendredi, ton sobre", C) "email client réunion", D) "s\'il te plaît aide moi je veux que tu m\'écris quelque chose pour mon client"',
  options: [
    'Prompt A — plus court c\'est mieux',
    'Prompt B — contexte précis, destinataire, objectif, ton souhaité',
    'Prompt C — les mots-clés suffisent',
    'Prompt D — la politesse améliore les résultats de l\'IA',
  ],
  correct: 1,
  explanation: 'La qualité d\'un résultat IA dépend directement de la qualité du prompt. Un bon prompt précise : le contexte (email professionnel), la tâche (reporter une réunion), les détails clés (vendredi), et le ton souhaité (sobre). La politesse n\'influence pas techniquement le résultat, mais la précision est déterminante.',
  imageUrl: null,
},
{
  id: 9,
  text: 'Vous utilisez cet outil IA pour analyser des données de ventes. Que peut-il faire ?',
  imageDescription: 'Capture d\'écran de l\'interface "Analyze Data" de Microsoft Excel avec Copilot (IA) affichant des suggestions automatiques : "Créer un graphique des ventes par mois", "Identifier les tendances", "Résumer les données"',
  options: [
    'Rien, l\'IA ne peut pas analyser des données réelles',
    'Générer automatiquement des graphiques, identifier des tendances et résumer les données',
    'Seulement créer des graphiques basiques',
    'L\'IA remplace le comptable mais peut se tromper sur les calculs',
  ],
  correct: 1,
  explanation: 'Les outils IA intégrés aux tableurs (Copilot dans Excel, Gemini dans Google Sheets) peuvent analyser vos données, suggérer des visualisations, identifier des tendances et résumer des tableaux complexes en langage naturel. Ils accélèrent l\'analyse sans remplacer le jugement humain — vérifiez toujours les conclusions.',
  imageUrl: null,
},
{
  id: 10,
  text: 'Vous voulez utiliser l\'IA pour créer du contenu pour votre entreprise. Quelle précaution prenez-vous ?',
  imageDescription: 'Capture d\'écran d\'une publication LinkedIn générée par IA avec un avertissement en rouge : "Ce contenu contient des informations potentiellement incorrectes sur votre secteur"',
  options: [
    'Publier directement sans relire — l\'IA ne fait pas d\'erreurs',
    'Relire, vérifier les faits, personnaliser et adapter à votre voix avant de publier',
    'Ne jamais utiliser l\'IA pour du contenu professionnel',
    'Publier en indiquant toujours "généré par IA" dans chaque post',
  ],
  correct: 1,
  explanation: 'L\'IA est un excellent point de départ mais pas une solution finale. Relisez toujours : vérifiez les faits (l\'IA peut halluciner des statistiques), adaptez le ton à votre voix unique, et personnalisez avec votre expérience réelle. Le contenu purement IA non retravaillé se reconnaît souvent et manque d\'authenticité.',
  imageUrl: null,
},
```

---

## MODULE 6 — Employabilité (questions 6 à 10)

```js
{
  id: 6,
  text: 'Regardez ce profil LinkedIn. Quelle amélioration principale doit être apportée ?',
  imageDescription: 'Capture d\'écran d\'un profil LinkedIn incomplet : photo de profil = avatar gris générique, titre = "En recherche d\'emploi", résumé vide, 0 compétences listées, 0 recommandations',
  options: [
    'Le profil est bon, LinkedIn n\'est pas si important',
    'Ajouter une vraie photo, un titre précis avec compétences, un résumé, des compétences validées',
    'Seule la photo manque, le reste est secondaire',
    'Acheter LinkedIn Premium pour être visible',
  ],
  correct: 1,
  explanation: 'Un profil LinkedIn complet a 21x plus de vues. Les priorités : une vraie photo professionnelle (×14 plus de clics), un titre avec votre métier et compétences clés ("Développeur Web React | JavaScript | 3 ans d\'expérience"), un résumé de 3-5 lignes, et au moins 5 compétences. LinkedIn Premium n\'est pas nécessaire pour être trouvé.',
  imageUrl: null,
},
{
  id: 7,
  text: 'Vous recevez ce message d\'un recruteur sur LinkedIn. Comment répondez-vous ?',
  imageDescription: 'Capture d\'écran d\'un message LinkedIn d\'un recruteur : "Bonjour, votre profil m\'a intéressé pour un poste de chargé de communication. Seriez-vous disponible pour un échange de 15 min cette semaine ?"',
  options: [
    'Ignorer le message — c\'est probablement une arnaque',
    'Répondre poliment avec votre disponibilité, même si le poste ne vous intéresse pas forcément',
    'Envoyer immédiatement votre CV sans répondre au message',
    'Demander immédiatement le salaire avant tout échange',
  ],
  correct: 1,
  explanation: 'Toujours répondre aux recruteurs, même si vous n\'êtes pas intéressé — c\'est une règle de networking. Un refus poli garde la porte ouverte. Si intéressé : confirmez votre disponibilité, remerciez l\'intérêt, et posez 1-2 questions sur le poste. La relation avec un recruteur peut être utile plus tard même si ce poste ne convient pas.',
  imageUrl: null,
},
{
  id: 8,
  text: 'Regardez cet email de candidature. Quel problème majeur y voyez-vous ?',
  imageDescription: 'Capture d\'écran d\'un email de candidature avec objet "Candidature" (sans précision), corps du message : "Bonjour, je vous envoie mon CV pour travailler dans votre entreprise. Merci." et CV joint nommé "CV_final_vrai_v3_FINAL2.pdf"',
  options: [
    'L\'email est parfait et professionnel',
    'Objet vague, message trop court sans motivation ni poste visé, nom de CV non professionnel',
    'Seul le nom du fichier pose problème',
    'Il aurait dû envoyer le CV par courrier postal',
  ],
  correct: 1,
  explanation: 'Plusieurs erreurs : objet insuffisant (devrait être "Candidature — [Poste] — [Votre Nom]"), message sans motivation ni mention du poste ciblé, et un CV mal nommé (utilisez "Prenom_Nom_CV.pdf"). Un email de candidature doit montrer que vous avez lu l\'offre et expliquer pourquoi vous êtes le bon candidat en 3-4 lignes.',
  imageUrl: null,
},
{
  id: 9,
  text: 'Regardez ce portfolio en ligne. Quel élément le rend efficace ?',
  imageDescription: 'Capture d\'écran d\'un portfolio Notion/GitHub Pages avec : photo professionnelle, biographie courte, 3 projets avec captures d\'écran + description + liens live, et bouton de contact visible',
  options: [
    'La belle mise en page uniquement',
    'Les projets concrets avec preuves visuelles, descriptions et liens — il montre, ne dit pas',
    'Le nombre de pages — plus c\'est long, mieux c\'est',
    'La liste longue de toutes les technologies connues',
  ],
  correct: 1,
  explanation: 'Un portfolio efficace montre plutôt qu\'il ne dit : des projets réels avec captures d\'écran ou liens live, des descriptions de ce qui a été fait et de l\'impact, et un moyen de vous contacter facilement. La règle : si un recruteur en 30 secondes ne comprend pas ce que vous faites et ne voit pas de preuves, le portfolio est à retravailler.',
  imageUrl: null,
},
{
  id: 10,
  text: 'Vous préparez cet entretien vidéo à distance. Regardez la configuration — quel problème voyez-vous ?',
  imageDescription: 'Capture d\'écran d\'un appel vidéo Zoom où le candidat apparaît avec : fenêtre mal éclairée (contre-jour, visage sombre), chambre en désordre visible derrière, personne en t-shirt de sport',
  options: [
    'Aucun problème, l\'essentiel c\'est ce qu\'on dit',
    'Contre-jour (visage non visible), fond non professionnel, tenue inadaptée — trois erreurs visuelles',
    'Seule la tenue pose problème dans un entretien vidéo',
    'Utiliser Zoom au lieu de Teams est le problème',
  ],
  correct: 1,
  explanation: 'En entretien vidéo, le visuel compte : éclairez-vous par l\'avant (lampe ou fenêtre devant vous, pas derrière), choisissez un fond neutre ou utilisez un fond virtuel, et habillez-vous comme pour un entretien en présentiel. Ces détails montrent votre sérieux et votre préparation. Testez votre configuration 10 minutes avant l\'heure.',
  imageUrl: null,
},
```

---

## Comment ajouter ces questions

### Option A — Directement dans Firestore Console
1. Ouvrir Firebase Console → Firestore Database
2. Naviguer vers `modules/1/questions`
3. Ajouter un document `6` avec les champs : id, text, options (array), correct, explanation, imageUrl (null), moduleId, order

### Option B — Via le script seedFirestore.mjs
Ajouter les questions dans le tableau correspondant du script et relancer :
```bash
node scripts/seedFirestore.mjs
```

### Pour ajouter les images plus tard
1. Uploader l'image dans Firebase Storage : `quiz-images/module-1/q6.jpg`
2. Copier l'URL publique
3. Dans Firestore : modifier le champ `imageUrl` du document question correspondant

### Sources d'images recommandées
- **Captures d'écran** : faire soi-même (Windows, Chrome, email) = images les plus réalistes
- **Canva** : créer des captures d'écran mockup avec fausses données
- **Screenshots de vraies interfaces** : Gmail, LinkedIn, Excel en ligne (Google Sheets)
- **PIX open source** : s'inspirer du style de leurs challenges sur github.com/1024pix/pix
