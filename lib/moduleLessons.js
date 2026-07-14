/**
 * Leçons structurées par module — combine pédagogie progressive (learn-anything)
 * et format tutorial-engineer : concept → exemple africain → points clés → erreurs classiques.
 *
 * Chaque leçon peut être affichée avant le quiz pour préparer l'utilisateur.
 */

export const MODULE_LESSONS = [
  {
    moduleId: 0,
    duration: '5 min',
    intro: {
      fr: "Avant de tester tes connaissances, voici l'essentiel à maîtriser sur l'informatique et les ordinateurs.",
      en: "Before testing your knowledge, here's what you need to master about computers and IT.",
    },
    concept: {
      title: { fr: "Comment fonctionne un ordinateur ?", en: "How does a computer work?" },
      body: {
        fr: "Un ordinateur est une machine qui reçoit des données (entrée), les traite selon des instructions (programme), et produit un résultat (sortie). Il est composé de matériel (hardware) — écran, clavier, processeur, mémoire — et de logiciels (software) — système d'exploitation, applications.",
        en: "A computer receives data (input), processes it according to instructions (program), and produces a result (output). It consists of hardware — screen, keyboard, processor, memory — and software — operating system, applications.",
      },
      analogy: {
        emoji: '🏗️',
        fr: "Pense à un ordinateur comme une maison : le matériel c'est la structure (murs, portes), le système d'exploitation c'est l'électricité et la plomberie, et les applications ce sont les meubles et appareils que tu utilises.",
        en: "Think of a computer like a house: the hardware is the structure (walls, doors), the OS is the electricity and plumbing, and apps are the furniture and appliances you use.",
      },
    },
    example: {
      emoji: '🇨🇮',
      title: { fr: "Exemple concret", en: "Concrete example" },
      body: {
        fr: "Quand tu ouvres WhatsApp sur ton téléphone pour envoyer un message : tu tapes le texte (entrée) → le processeur encode le message (traitement) → le message s'affiche et part (sortie). Même logique sur un PC pour envoyer un email professionnel.",
        en: "When you open WhatsApp on your phone to send a message: you type the text (input) → the processor encodes the message (processing) → the message appears and is sent (output). Same logic on a PC to send a professional email.",
      },
    },
    keyPoints: [
      { emoji: '💾', fr: "La RAM est la mémoire de travail (temporaire) — elle s'efface à l'extinction.", en: "RAM is working memory (temporary) — it clears when powered off." },
      { emoji: '🗂️', fr: "Le disque dur (HDD/SSD) stocke tes fichiers de façon permanente.", en: "The hard drive (HDD/SSD) stores your files permanently." },
      { emoji: '⚡', fr: "Le processeur (CPU) est le cerveau — plus il est rapide, plus l'ordi est performant.", en: "The processor (CPU) is the brain — the faster it is, the better the performance." },
      { emoji: '🔄', fr: "Redémarrer règle souvent les problèmes car ça vide la RAM et recharge le système.", en: "Restarting often fixes issues because it clears RAM and reloads the system." },
    ],
    mistakes: [
      { fr: "Confondre RAM et stockage : 4 Go de RAM ≠ 4 Go pour stocker des fichiers.", en: "Confusing RAM and storage: 4 GB of RAM ≠ 4 GB for file storage." },
      { fr: "Croire que supprimer un fichier libère de la RAM (non — ça libère du disque).", en: "Believing that deleting a file frees RAM (no — it frees disk space)." },
      { fr: "Forcer l'arrêt sans sauvegarder = perte des données non enregistrées.", en: "Force shutting down without saving = losing unsaved data." },
    ],
  },

  {
    moduleId: 1,
    duration: '5 min',
    intro: {
      fr: "Internet est l'outil le plus puissant de notre époque — encore faut-il savoir l'utiliser efficacement.",
      en: "The internet is the most powerful tool of our time — but you need to know how to use it effectively.",
    },
    concept: {
      title: { fr: "Comment fonctionne une recherche sur Internet ?", en: "How does an internet search work?" },
      body: {
        fr: "Google est un moteur de recherche : il analyse des milliards de pages web et les classe selon leur pertinence et leur fiabilité. Quand tu tapes une requête, Google retourne les pages qu'il juge les plus utiles — pas forcément les plus récentes ni les plus vraies.",
        en: "Google is a search engine: it analyses billions of web pages and ranks them by relevance and reliability. When you type a query, Google returns the pages it deems most useful — not necessarily the most recent or most accurate.",
      },
      analogy: {
        emoji: '📚',
        fr: "Google c'est comme une bibliothèque avec un bibliothécaire très efficace : il ne lit pas les livres pour toi, il te dit juste lesquels pourraient t'aider. À toi de vérifier si l'information est fiable.",
        en: "Google is like a library with a very efficient librarian: it doesn't read the books for you, it just tells you which ones might help. It's up to you to verify if the information is reliable.",
      },
    },
    example: {
      emoji: '🔍',
      title: { fr: "Recherche efficace : la méthode", en: "Effective search: the method" },
      body: {
        fr: 'Au lieu de taper "comment soigner une blessure", essaie "premiers secours coupure profonde site:sante.gouv". Les guillemets cherchent une phrase exacte, "site:" limite à un domaine fiable. En Afrique, ajoute "Côte d\'Ivoire" ou "Afrique" pour des résultats locaux pertinents.',
        en: 'Instead of typing "how to treat an injury", try "first aid deep cut site:health.gov". Quotes search for an exact phrase, "site:" limits to a trusted domain. In Africa, add "Ivory Coast" or "Africa" for relevant local results.',
      },
    },
    keyPoints: [
      { emoji: '🎯', fr: "Utilise des mots-clés précis, pas des phrases entières.", en: "Use specific keywords, not full sentences." },
      { emoji: '⚠️', fr: "Un site en .gouv, .edu ou .org est généralement plus fiable qu'un blog anonyme.", en: "A .gov, .edu, or .org site is generally more reliable than an anonymous blog." },
      { emoji: '📅', fr: "Vérifie la date de publication — une info de 2015 peut être obsolète.", en: "Check the publication date — a 2015 article may be outdated." },
      { emoji: '🌐', fr: "HTTPS (cadenas dans l'URL) = connexion sécurisée. HTTP seul = données exposées.", en: "HTTPS (padlock in URL) = secure connection. HTTP only = data exposed." },
    ],
    mistakes: [
      { fr: "Croire que le premier résultat Google est toujours le plus fiable (les premiers sont souvent des publicités).", en: "Believing the first Google result is always the most reliable (the first results are often ads)." },
      { fr: "Partager une information sans vérifier la source — contribue à la désinformation.", en: "Sharing information without checking the source — contributes to misinformation." },
      { fr: "Ignorer les avertissements de sécurité du navigateur sur les sites dangereux.", en: "Ignoring browser security warnings about dangerous sites." },
    ],
  },

  {
    moduleId: 2,
    duration: '5 min',
    intro: {
      fr: "L'email reste l'outil de communication professionnel numéro 1. Bien l'utiliser fait toute la différence.",
      en: "Email remains the #1 professional communication tool. Knowing how to use it well makes all the difference.",
    },
    concept: {
      title: { fr: "Anatomie d'un email professionnel", en: "Anatomy of a professional email" },
      body: {
        fr: "Un email professionnel se compose de : l'objet (sujet clair et précis), le destinataire principal (À:), les destinataires en copie (Cc:), le corps du message (structuré en paragraphes), et la signature (nom, poste, contacts). Chaque élément a son rôle.",
        en: "A professional email consists of: the subject (clear and specific), the main recipient (To:), copy recipients (Cc:), the message body (structured in paragraphs), and the signature (name, position, contacts). Each element has its role.",
      },
      analogy: {
        emoji: '✉️',
        fr: "Un email c'est comme une lettre officielle envoyée instantanément. L'objet = l'enveloppe qu'on lit en premier. Le Cc: = les témoins de la conversation. La signature = ta carte de visite automatique.",
        en: "An email is like an official letter sent instantly. The subject = the envelope you read first. Cc: = witnesses to the conversation. The signature = your automatic business card.",
      },
    },
    example: {
      emoji: '💼',
      title: { fr: "Email professionnel type", en: "Sample professional email" },
      body: {
        fr: "Objet : Demande de rendez-vous — Projet formation numérique\n\nBonjour M. Kouassi,\n\nSuite à notre échange du 15 juin, je souhaite planifier une réunion pour présenter notre proposition de formation.\n\nSeriez-vous disponible le mardi 25 juin entre 10h et 12h ?\n\nCordialement,\nAma Brou | Chargée de formation | +225 07 00 00 00",
        en: "Subject: Meeting request — Digital training project\n\nDear Mr. Kouassi,\n\nFollowing our discussion on June 15, I would like to schedule a meeting to present our training proposal.\n\nWould you be available on Tuesday, June 25 between 10am and 12pm?\n\nBest regards,\nAma Brou | Training Officer | +225 07 00 00 00",
      },
    },
    keyPoints: [
      { emoji: '📌', fr: "L'objet doit résumer le contenu en 6-8 mots maximum.", en: "The subject should summarise the content in 6-8 words maximum." },
      { emoji: '👁️', fr: "Cc: pour informer des tiers, Cci: (Bcc) pour protéger les adresses des destinataires.", en: "Cc: to inform third parties, Bcc: to protect recipient addresses." },
      { emoji: '📎', fr: "Mentionne toujours la pièce jointe dans le corps du message avant d'envoyer.", en: "Always mention the attachment in the message body before sending." },
      { emoji: '⏱️', fr: "Réponds dans les 24h en milieu professionnel, même pour dire que tu reviendras plus tard.", en: "Respond within 24h in a professional context, even to say you'll follow up later." },
    ],
    mistakes: [
      { fr: "Objet vide ou générique ('Bonjour', 'Question') — le destinataire ne sait pas quoi attendre.", en: "Empty or generic subject ('Hello', 'Question') — the recipient doesn't know what to expect." },
      { fr: "Répondre à tous (Reply All) quand seul l'expéditeur a besoin de ta réponse.", en: "Replying to all (Reply All) when only the sender needs your response." },
      { fr: "Oublier la pièce jointe après l'avoir mentionnée dans le message.", en: "Forgetting the attachment after mentioning it in the message." },
    ],
  },

  {
    moduleId: 3,
    duration: '5 min',
    intro: {
      fr: "Word, Excel, PowerPoint — ces trois outils sont exigés dans la quasi-totalité des emplois formels en Afrique.",
      en: "Word, Excel, PowerPoint — these three tools are required in almost all formal jobs in Africa.",
    },
    concept: {
      title: { fr: "Le bon outil pour chaque tâche", en: "The right tool for each task" },
      body: {
        fr: "Word traite le texte long et structuré (rapports, lettres, CV). Excel analyse et calcule des données tabulaires (budgets, tableaux de bord, listes). PowerPoint présente des idées visuellement (exposés, pitchs, formations). Choisir le mauvais outil crée du travail inutile.",
        en: "Word handles long, structured text (reports, letters, CVs). Excel analyses and calculates tabular data (budgets, dashboards, lists). PowerPoint presents ideas visually (presentations, pitches, training). Choosing the wrong tool creates unnecessary work.",
      },
      analogy: {
        emoji: '🔨',
        fr: "C'est comme les outils d'un charpentier : la scie, le marteau et le mètre ont chacun leur usage. Utiliser Excel pour rédiger un rapport, c'est comme planter un clou avec une scie.",
        en: "It's like a carpenter's tools: the saw, hammer and tape measure each have their use. Using Excel to write a report is like hammering a nail with a saw.",
      },
    },
    example: {
      emoji: '📊',
      title: { fr: "Cas pratique : budget mensuel sous Excel", en: "Practical case: monthly budget in Excel" },
      body: {
        fr: "Colonnes : Catégorie | Montant prévu | Montant réel | Écart\nFormule écart : =C2-B2\nFormule total : =SOMME(B2:B10)\nMise en forme conditionnelle : rouge si écart > 0 (dépassement), vert si ≤ 0.\nRésultat : un tableau de bord clair en 15 minutes.",
        en: "Columns: Category | Planned Amount | Actual Amount | Variance\nVariance formula: =C2-B2\nTotal formula: =SUM(B2:B10)\nConditional formatting: red if variance > 0 (overspend), green if ≤ 0.\nResult: a clear dashboard in 15 minutes.",
      },
    },
    keyPoints: [
      { emoji: '⌨️', fr: "Ctrl+C / Ctrl+V / Ctrl+Z — copier, coller, annuler. Ces raccourcis te font gagner des heures.", en: "Ctrl+C / Ctrl+V / Ctrl+Z — copy, paste, undo. These shortcuts save hours." },
      { emoji: '💡', fr: "Dans Excel, commence toujours une formule par = et utilise des noms de cellules (A1, B2).", en: "In Excel, always start a formula with = and use cell names (A1, B2)." },
      { emoji: '🎨', fr: "Dans PowerPoint, une slide = une idée. Trop de texte sur une slide tue l'attention.", en: "In PowerPoint, one slide = one idea. Too much text on a slide kills attention." },
      { emoji: '💾', fr: "Sauvegarde avec Ctrl+S toutes les 10 minutes — les pannes de courant arrivent sans prévenir.", en: "Save with Ctrl+S every 10 minutes — power cuts happen without warning." },
    ],
    mistakes: [
      { fr: "Taper des calculs manuellement dans Excel au lieu d'utiliser des formules — aucune mise à jour automatique.", en: "Manually typing calculations in Excel instead of using formulas — no automatic updates." },
      { fr: "Mettre du texte trop petit sur les slides PowerPoint — illisible en projection.", en: "Putting text too small on PowerPoint slides — unreadable when projected." },
      { fr: "Ne pas sauvegarder régulièrement et perdre son travail lors d'une coupure de courant.", en: "Not saving regularly and losing work during a power cut." },
    ],
  },

  {
    moduleId: 4,
    duration: '5 min',
    intro: {
      fr: "En Afrique, les arnaques numériques coûtent des milliards chaque année. Se protéger commence par comprendre comment les pirates pensent.",
      en: "In Africa, digital scams cost billions every year. Protecting yourself starts with understanding how hackers think.",
    },
    concept: {
      title: { fr: "Comment les pirates volent vos données", en: "How hackers steal your data" },
      body: {
        fr: "Les cybercriminels utilisent principalement trois méthodes : le phishing (faux messages qui imitent une banque ou un opérateur pour voler tes identifiants), les malwares (logiciels malveillants installés à ton insu), et l'ingénierie sociale (manipulation psychologique pour te faire révéler des infos sensibles).",
        en: "Cybercriminals mainly use three methods: phishing (fake messages imitating a bank or operator to steal your credentials), malware (malicious software installed without your knowledge), and social engineering (psychological manipulation to get you to reveal sensitive information).",
      },
      analogy: {
        emoji: '🎣',
        fr: "Le phishing c'est exactement comme la pêche : le pirate lance un hameçon (faux SMS de ta banque), attend que tu mordes (tu cliques sur le lien), et te tire hors de l'eau (il vole ton argent). La meilleure défense : reconnaître l'hameçon avant de mordre.",
        en: "Phishing is exactly like fishing: the hacker casts a hook (fake SMS from your bank), waits for you to bite (you click the link), and reels you in (they steal your money). The best defence: recognise the hook before biting.",
      },
    },
    example: {
      emoji: '📱',
      title: { fr: "Arnaque Mobile Money — cas réel", en: "Mobile Money scam — real case" },
      body: {
        fr: "SMS reçu : 'MTN CI : Vous avez reçu 50 000 FCFA. Veuillez confirmer en envoyant votre code PIN au 07XX.' → ARNAQUE. MTN (Orange, Wave, etc.) ne demande JAMAIS votre PIN par SMS. Règle absolue : ton PIN ne se partage avec personne, même pas un agent.",
        en: "SMS received: 'MTN CI: You received 50,000 FCFA. Please confirm by sending your PIN to 07XX.' → SCAM. MTN (Orange, Wave, etc.) NEVER asks for your PIN by SMS. Absolute rule: your PIN is never shared with anyone, not even an agent.",
      },
    },
    keyPoints: [
      { emoji: '🔑', fr: "Un bon mot de passe = 12+ caractères, mélange lettres/chiffres/symboles, unique par site.", en: "A good password = 12+ characters, mix of letters/numbers/symbols, unique per site." },
      { emoji: '🔒', fr: "Active la double authentification (2FA) sur ta banque, email et réseaux sociaux.", en: "Enable two-factor authentication (2FA) on your bank, email and social media." },
      { emoji: '⚠️', fr: "Un lien suspect : survole-le avant de cliquer pour voir la vraie URL de destination.", en: "A suspicious link: hover over it before clicking to see the real destination URL." },
      { emoji: '💾', fr: "Fais une sauvegarde de tes fichiers importants sur un disque externe ou le cloud.", en: "Back up your important files to an external drive or the cloud." },
    ],
    mistakes: [
      { fr: "Utiliser le même mot de passe partout — si un site est piraté, tous tes comptes tombent.", en: "Using the same password everywhere — if one site is hacked, all your accounts fall." },
      { fr: "Cliquer sur un lien dans un email urgent sans vérifier l'adresse de l'expéditeur.", en: "Clicking a link in an urgent email without checking the sender's address." },
      { fr: "Partager son code OTP (SMS de vérification) avec quelqu'un au téléphone.", en: "Sharing your OTP code (verification SMS) with someone over the phone." },
    ],
  },

  {
    moduleId: 5,
    duration: '5 min',
    intro: {
      fr: "L'IA n'est pas de la magie ni une menace — c'est un outil. Ceux qui savent l'utiliser auront un avantage énorme.",
      en: "AI isn't magic or a threat — it's a tool. Those who know how to use it will have a huge advantage.",
    },
    concept: {
      title: { fr: "Comment fonctionne une IA comme ChatGPT ?", en: "How does an AI like ChatGPT work?" },
      body: {
        fr: "ChatGPT est un grand modèle de langage (LLM) : il a été entraîné sur des milliards de textes et prédit le mot suivant le plus probable dans une conversation. Il ne 'pense' pas, ne 'comprend' pas vraiment — il génère du texte statistiquement cohérent. C'est pourquoi il peut se tromper avec assurance.",
        en: "ChatGPT is a large language model (LLM): it was trained on billions of texts and predicts the most likely next word in a conversation. It doesn't 'think' or truly 'understand' — it generates statistically coherent text. That's why it can be confidently wrong.",
      },
      analogy: {
        emoji: '🦜',
        fr: "Imagine un perroquet ultra-intelligent qui a lu toute la bibliothèque du monde. Il peut reformuler, résumer, traduire, créer — mais il répète des patterns, il n'a pas de bon sens propre. Si tu lui demandes une info récente ou très précise, il peut inventer.",
        en: "Imagine an ultra-intelligent parrot that has read the entire world's library. It can rephrase, summarise, translate, create — but it repeats patterns, it has no common sense of its own. If you ask it for recent or very precise information, it may make things up.",
      },
    },
    example: {
      emoji: '🤖',
      title: { fr: "Prompt efficace vs prompt faible", en: "Effective prompt vs weak prompt" },
      body: {
        fr: "❌ Faible : 'Écris-moi un email'\n✅ Efficace : 'Tu es un assistant RH. Écris un email professionnel en français pour convoquer M. Koné à un entretien d'embauche le 25 juin à 10h, pour le poste de comptable. Ton maximum : 150 mots.'\n\nPlus le contexte est précis, meilleur est le résultat.",
        en: "❌ Weak: 'Write me an email'\n✅ Effective: 'You are an HR assistant. Write a professional email in French to summon Mr. Koné to a job interview on June 25 at 10am, for the accountant position. Your maximum: 150 words.'\n\nThe more precise the context, the better the result.",
      },
    },
    keyPoints: [
      { emoji: '🎯', fr: "Un bon prompt = Rôle + Tâche + Contexte + Format souhaité.", en: "A good prompt = Role + Task + Context + Desired format." },
      { emoji: '✅', fr: "Vérifie toujours les infos factuelles générées par l'IA (dates, chiffres, noms).", en: "Always verify factual information generated by AI (dates, figures, names)." },
      { emoji: '🔄', fr: "Si le résultat n'est pas bon, reformule ta demande — ne recommence pas de zéro.", en: "If the result isn't good, rephrase your request — don't start from scratch." },
      { emoji: '⚖️', fr: "N'envoie pas d'informations confidentielles (données clients, mots de passe) à une IA en ligne.", en: "Don't send confidential information (client data, passwords) to an online AI." },
    ],
    mistakes: [
      { fr: "Copier-coller une réponse d'IA sans relire — les erreurs factuelles passent inaperçues.", en: "Copy-pasting an AI response without proofreading — factual errors go unnoticed." },
      { fr: "Faire confiance à l'IA pour des sujets légaux, médicaux ou financiers sans expert humain.", en: "Trusting AI for legal, medical or financial topics without a human expert." },
      { fr: "Croire que l'IA connaît les événements récents — sa connaissance a une date limite.", en: "Believing AI knows recent events — its knowledge has a cutoff date." },
    ],
  },

  {
    moduleId: 6,
    duration: '5 min',
    intro: {
      fr: "Le marché du travail africain se digitalise rapidement. Ton profil en ligne est désormais aussi important que ton CV papier.",
      en: "The African job market is rapidly digitalising. Your online profile is now as important as your paper CV.",
    },
    concept: {
      title: { fr: "Ta présence numérique professionnelle", en: "Your professional digital presence" },
      body: {
        fr: "Les recruteurs cherchent les candidats en ligne avant même de les inviter à un entretien. LinkedIn, un portfolio, un email professionnel — ces éléments constituent ta vitrine numérique. Une présence soignée peut t'ouvrir des portes que le CV papier ne peut pas atteindre.",
        en: "Recruiters search for candidates online before even inviting them to an interview. LinkedIn, a portfolio, a professional email — these elements constitute your digital showcase. A polished presence can open doors that a paper CV cannot reach.",
      },
      analogy: {
        emoji: '🏪',
        fr: "Ton profil LinkedIn c'est comme la devanture de ta boutique dans un grand marché : si elle est propre, attrayante et claire, les gens entrent. Si elle est vide ou mal rangée, ils passent leur chemin — même si tes produits sont excellents.",
        en: "Your LinkedIn profile is like your shop front in a big market: if it's clean, attractive and clear, people come in. If it's empty or messy, they walk past — even if your products are excellent.",
      },
    },
    example: {
      emoji: '💼',
      title: { fr: "Profil LinkedIn optimisé — les essentiels", en: "Optimised LinkedIn profile — the essentials" },
      body: {
        fr: "✅ Photo professionnelle (fond neutre, visage visible)\n✅ Titre : pas juste ton poste, mais ta valeur — ex: 'Comptable certifié | Expert finances PME Côte d'Ivoire'\n✅ Résumé : 3 phrases max sur ce que tu fais, pour qui, et tes résultats clés\n✅ Expériences avec des résultats chiffrés : 'Réduction des coûts de 20%' pas 'Gestion des coûts'\n✅ 5+ recommandations de collègues ou supérieurs",
        en: "✅ Professional photo (neutral background, face visible)\n✅ Title: not just your position, but your value — e.g. 'Certified Accountant | SME Finance Expert Ivory Coast'\n✅ Summary: 3 sentences max on what you do, for whom, and your key results\n✅ Experience with quantified results: 'Reduced costs by 20%' not 'Cost management'\n✅ 5+ recommendations from colleagues or managers",
      },
    },
    keyPoints: [
      { emoji: '📧', fr: "Ton email professionnel = prenom.nom@gmail.com — jamais 'supercool237@' ou 'laminata_sexy@'.", en: "Your professional email = firstname.lastname@gmail.com — never 'supercool237@' or funny nicknames." },
      { emoji: '🤝', fr: "Le networking : commente les posts de ton secteur sur LinkedIn avant d'envoyer des demandes de connexion.", en: "Networking: comment on posts in your sector on LinkedIn before sending connection requests." },
      { emoji: '📹', fr: "Maîtrise Zoom/Teams/Meet — caméra allumée, micro de qualité, fond neutre = professionnalisme.", en: "Master Zoom/Teams/Meet — camera on, quality microphone, neutral background = professionalism." },
      { emoji: '🔍', fr: "Google ton propre nom pour voir ce que les recruteurs voient de toi.", en: "Google your own name to see what recruiters see about you." },
    ],
    mistakes: [
      { fr: "Envoyer un CV sans lettre de motivation pour des postes qui en demandent une.", en: "Sending a CV without a cover letter for positions that require one." },
      { fr: "Avoir un profil LinkedIn incomplet ou sans photo — réduit la visibilité de 14x selon LinkedIn.", en: "Having an incomplete LinkedIn profile or no photo — reduces visibility 14x according to LinkedIn." },
      { fr: "Utiliser des photos de vacances ou de fête comme photo de profil professionnel.", en: "Using holiday or party photos as your professional profile picture." },
    ],
  },
];
