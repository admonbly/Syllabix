import Link from 'next/link';
import CTAButton from '@/components/CTAButton';

export const metadata = {
  title: 'À propos — Syllabix',
  description: 'Découvrez Syllabix : notre mission, notre équipe et la reconnaissance de nos certifications numériques en Afrique.',
};

const STATS = [
  { value: '5 000+', label: 'Apprenants actifs',    icon: '👥' },
  { value: '7',      label: 'Modules certifiants',  icon: '📚' },
  { value: '98%',    label: 'Taux de satisfaction', icon: '⭐' },
  { value: '12+',    label: 'Pays représentés',     icon: '🌍' },
];

const TEAM = [
  {
    name: 'Équipe Pédagogique',
    role: 'Conception des modules',
    desc: 'Experts en compétences numériques et en formation professionnelle, nos concepteurs pédagogiques élaborent des contenus alignés sur les réalités du marché africain.',
    icon: '🎓',
  },
  {
    name: 'Équipe Technique',
    role: 'Développement de la plateforme',
    desc: 'Ingénieurs et développeurs passionnés, nous construisons une plateforme sécurisée, rapide et accessible depuis n\'importe quel appareil connecté.',
    icon: '💻',
  },
  {
    name: 'Équipe Partenariats',
    role: 'Relations entreprises & institutions',
    desc: 'Nous travaillons à faire reconnaître les certifications Syllabix auprès des employeurs, des universités et des institutions publiques africaines.',
    icon: '🤝',
  },
];

const RECOGNITION = [
  {
    title: 'Reconnues par les employeurs',
    desc: 'Nos certificats sont conçus pour être directement valorisables sur un CV et sur LinkedIn. Chaque certificat est vérifiable en ligne via un lien unique.',
    icon: '💼',
  },
  {
    title: 'Alignées sur les standards internationaux',
    desc: 'Les contenus sont alignés sur le cadre DIGCOMP (European Digital Competence Framework) adapté au contexte africain.',
    icon: '🌐',
  },
  {
    title: 'Certification vérifiable',
    desc: 'Chaque certificat généré possède un identifiant unique. Les recruteurs peuvent vérifier son authenticité directement sur notre plateforme.',
    icon: '🔍',
  },
  {
    title: 'Partenariats institutionnels (en cours)',
    desc: 'Nous travaillons activement avec des universités, des agences d\'emploi et des ministères en Afrique de l\'Ouest pour faire reconnaître officiellement nos certifications.',
    icon: '🏛️',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-[#283593] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6">
            <span>🌍</span> Notre mission
          </div>
          <h1 className="text-5xl font-heading font-bold mb-6 leading-tight">
            Démocratiser la certification<br />des compétences numériques
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Syllabix est né d'un constat simple : des millions de professionnels africains maîtrisent les outils numériques, mais n'ont aucun moyen de le prouver. Nous changeons ça.
          </p>
        </div>
      </section>

      {/* Chiffres */}
      <section className="py-16 bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-4xl font-heading font-extrabold text-primary mb-1">{s.value}</p>
                <p className="text-sm text-neutral-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Mission */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-heading font-bold text-primary mb-4">Pourquoi Syllabix ?</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              En Afrique, le marché du travail évolue rapidement vers le numérique. Pourtant, la grande majorité des travailleurs n'ont pas accès à des formations certifiantes abordables et reconnues.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Syllabix propose une solution 100% en ligne, accessible depuis un téléphone, conçue pour le contexte africain : cours courts, examen en moins de 35 minutes, certificat instantané.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Notre objectif : permettre à <strong>1 million d'Africains</strong> de certifier leurs compétences numériques d'ici 2027.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10">
            <div className="space-y-4">
              {[
                '✅ Gratuit pour s\'entraîner',
                '✅ Examen en 35 minutes',
                '✅ Certificat vérifiable en ligne',
                '✅ Partageable sur LinkedIn',
                '✅ Accessible sur mobile',
                '✅ Contenu adapté à l\'Afrique',
              ].map((item) => (
                <p key={item} className="text-neutral-700 font-medium">{item}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Équipe */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-primary mb-3">Notre équipe</h2>
          <p className="text-neutral-500 mb-10">
            Une équipe pluridisciplinaire répartie en Afrique et en Europe, unie par la même mission.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                <div className="text-4xl mb-4">{member.icon}</div>
                <h3 className="font-heading font-bold text-primary mb-1">{member.name}</h3>
                <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-3">{member.role}</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reconnaissance des certificats */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-primary mb-3">Nos certifications sont-elles reconnues ?</h2>
          <p className="text-neutral-500 mb-10">
            La reconnaissance de nos certifications est au cœur de notre stratégie. Voici où nous en sommes.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {RECOGNITION.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex gap-4">
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-heading font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-amber-800 font-medium">
              ⚠️ <strong>Transparence :</strong> Syllabix est une plateforme en croissance. Nos certifications ne sont pas encore officiellement reconnues par des organismes gouvernementaux. Nous travaillons activement à établir ces partenariats institutionnels. En attendant, nos certificats restent un excellent moyen de valoriser vos compétences et de les prouver à des recruteurs.
            </p>
          </div>
        </section>

        {/* Valeurs */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-primary mb-10">Nos valeurs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Accessibilité', desc: 'Des formations conçues pour être accessibles à tous, quel que soit le niveau ou la connexion.' },
              { icon: '🌱', title: 'Impact réel',   desc: 'Chaque certification délivrée est un pas concret vers l\'employabilité numérique en Afrique.' },
              { icon: '🔒', title: 'Intégrité',     desc: 'Des examens équitables, des scores calculés côté serveur, des certificats infalsifiables.' },
            ].map((v) => (
              <div key={v.title} className="text-center p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-heading font-bold text-primary mb-2">{v.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-10 text-center shadow-sm">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-2xl font-heading font-bold text-primary mb-3">Travaillons ensemble</h3>
          <p className="text-neutral-600 mb-6 max-w-lg mx-auto">
            Vous êtes une entreprise, une université, ou une institution publique ? Contactez-nous pour explorer un partenariat.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <CTAButton href="/contact" variant="primary" size="lg">Nous contacter</CTAButton>
            <CTAButton href="/certification" variant="outline" size="lg">Découvrir les certifications</CTAButton>
          </div>
        </section>

      </div>
    </div>
  );
}
