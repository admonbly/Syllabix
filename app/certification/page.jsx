import Link from 'next/link';
import CTAButton from '@/components/CTAButton';
import CertificationUserPanel from '@/components/CertificationUserPanel';

export const metadata = {
  title: 'Certifications — Syllabix',
  description: 'Obtenez vos certifications numériques avec Syllabix. 7 modules, 35 questions, résultats en moins de 35 minutes.',
};

const MODULES = [
  {
    id: 0,
    name: 'IT & Ordinateur',
    icon: '🖥️',
    description: 'Matériel, systèmes d\'exploitation, gestion de fichiers et maintenance.',
    color: '#1A237E',
    bg: '#f0f3ff',
  },
  {
    id: 1,
    name: 'Internet',
    icon: '🌐',
    description: 'Navigation web, recherche en ligne, sécurité des sites et évaluation des sources.',
    color: '#0277BD',
    bg: '#e1f5fe',
  },
  {
    id: 2,
    name: 'Email',
    icon: '📧',
    description: 'Rédaction professionnelle, gestion des pièces jointes et sécurité email.',
    color: '#00695C',
    bg: '#e0f2f1',
  },
  {
    id: 3,
    name: 'Bureautique',
    icon: '📊',
    description: 'Word, Excel, PowerPoint — traitement de texte, tableurs et présentations.',
    color: '#E65100',
    bg: '#fff3e0',
  },
  {
    id: 4,
    name: 'Cybersécurité',
    icon: '🔒',
    description: 'Mots de passe, phishing, malware, sauvegarde et confidentialité en ligne.',
    color: '#B71C1C',
    bg: '#fde8e8',
  },
  {
    id: 5,
    name: 'Intelligence Artificielle',
    icon: '🤖',
    description: 'ChatGPT, génération d\'images, IA au quotidien et éthique de l\'IA.',
    color: '#4A148C',
    bg: '#f3e5f5',
  },
  {
    id: 6,
    name: 'Employabilité',
    icon: '💼',
    description: 'LinkedIn, CV numérique, visioconférence et outils collaboratifs.',
    color: '#1B5E20',
    bg: '#e8f5e9',
  },
];

export default function CertificationPage() {
  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Hero — rendu côté serveur */}
      <section className="py-20 bg-gradient-to-br from-primary to-[#283593] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6 backdrop-blur-sm">
            <span>🏆</span> Certifications officielles Syllabix
          </div>
          <h1 className="text-5xl font-heading font-bold mb-4 leading-tight">
            Faites reconnaître vos<br />compétences numériques
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Passez l'examen global ou obtenez chaque certificat de module. Chaque réussite est partageable sur LinkedIn et téléchargeable en PDF.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { label: 'Questions',    value: '35' },
              { label: 'Durée',        value: '35 min' },
              { label: 'Score requis', value: '60%' },
              { label: 'Modules',      value: '7' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-accent">{s.value}</p>
                <p className="text-sm text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Panneau utilisateur (client) — hydraté après le rendu initial */}
      <div className="py-8">
        <CertificationUserPanel />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-20">

        {/* Certification Globale */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">1</span>
            <h2 className="text-2xl font-heading font-bold text-primary">Certification Globale</h2>
            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wide">Recommandé</span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
            <div className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <div className="text-5xl mb-4">🎓</div>
                  <h3 className="text-2xl font-heading font-bold text-primary mb-2">
                    Certificat de Compétences Numériques
                  </h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    L'examen complet qui couvre les 7 modules. 35 questions mélangées de tous les domaines — le certificat le plus valorisant pour votre profil.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { icon: '📋', label: '35 questions mixtes' },
                      { icon: '⏱', label: '35 minutes' },
                      { icon: '✅', label: '60% pour réussir' },
                      { icon: '🔀', label: 'Questions aléatoires' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm text-neutral-700">
                        <span>{item.icon}</span><span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <CTAButton href="/exam/global" variant="primary" size="lg">
                    Passer la certification globale →
                  </CTAButton>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                    <p className="font-semibold text-blue-800 mb-3">Ce certificat atteste de :</p>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex gap-2"><span>✓</span> Maîtrise des outils informatiques et Internet</li>
                      <li className="flex gap-2"><span>✓</span> Compétences en bureautique (Word, Excel, PowerPoint)</li>
                      <li className="flex gap-2"><span>✓</span> Bonnes pratiques de cybersécurité</li>
                      <li className="flex gap-2"><span>✓</span> Usage professionnel de l'IA</li>
                      <li className="flex gap-2"><span>✓</span> Compétences numériques pour l'emploi</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    💡 <strong>Conseil :</strong> Entraînez-vous sur chaque module avant de passer cet examen pour maximiser vos chances.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications par Module */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">2</span>
            <h2 className="text-2xl font-heading font-bold text-primary">Certifications par Module</h2>
          </div>
          <p className="text-neutral-500 mb-8 ml-11">
            7 certificats spécialisés — idéaux pour valoriser une compétence précise sur votre CV ou LinkedIn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((module) => (
              <div
                key={module.id}
                className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="h-1" style={{ background: module.color }} />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: module.bg }}
                    >
                      {module.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-neutral-800 leading-tight">{module.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">Module {module.id + 1}</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mb-5 leading-relaxed">{module.description}</p>
                  <div className="flex gap-4 text-xs text-neutral-400 mb-5">
                    <span>📋 35 questions</span>
                    <span>⏱ 35 min</span>
                    <span>✅ 60% requis</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/exam/module/${module.id}`}
                      className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: module.color }}
                    >
                      Passer la certification
                    </Link>
                    <Link
                      href={`/training/module/${module.id}`}
                      className="px-4 py-2.5 border border-neutral-200 text-neutral-500 rounded-xl text-sm font-medium hover:border-neutral-300 transition-colors"
                      title="S'entraîner d'abord"
                    >
                      📚
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Niveaux */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">Niveaux de certification</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { range: '80 – 100%', level: 'Avancé',       color: '#27AE60', bg: '#f0faf4', desc: 'Maîtrise complète. Certificat Premium.',              icon: '🏆' },
              { range: '60 – 79%', level: 'Intermédiaire', color: '#E67E22', bg: '#fff8f0', desc: 'Bonnes bases, quelques lacunes. Certificat Standard.', icon: '✅' },
              { range: '< 60%',    level: 'Non certifié',  color: '#9E9E9E', bg: '#fafafa', desc: 'Score insuffisant. Révisez et retentez.',              icon: '📚' },
            ].map((item) => (
              <div key={item.level} className="rounded-2xl p-6" style={{ background: item.bg, border: `1px solid ${item.color}30` }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-xl font-bold mb-1" style={{ color: item.color }}>{item.range}</p>
                <p className="font-semibold text-neutral-700 mb-2">{item.level}</p>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA bas */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-primary mb-2">Pas encore prêt ?</h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            Entraînez-vous gratuitement sur chaque module avant de passer les examens officiels.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <CTAButton href="/training" variant="outline" size="lg">🏋️ S'entraîner gratuitement</CTAButton>
            <CTAButton href="/evaluation" variant="outline" size="lg">📊 Tester mon niveau</CTAButton>
          </div>
        </section>

      </div>
    </div>
  );
}
