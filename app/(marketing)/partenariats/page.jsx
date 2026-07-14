'use client';

import Image from 'next/image';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { PARTNERS } from '@/lib/partners';

const benefits = [
  {
    icon: '🎯',
    title: 'Certification Reconnue',
    description: 'Certificats co-signés par les partenaires institutionnels, reconnus pour l\'emploi et la formation.',
  },
  {
    icon: '💼',
    title: 'Opportunités Professionnelles',
    description: 'Accès à un réseau d\'employeurs et d\'opportunités d\'insertion professionnelle.',
  },
  {
    icon: '📊',
    title: 'Données & Insights',
    description: 'Rapports détaillés sur les compétences de vos apprenants ou collaborateurs.',
  },
  {
    icon: '🌱',
    title: 'Formation Continue',
    description: 'Ressources et supports pour la montée en compétences numériques tout au long de la vie.',
  },
];

export default function PartnershipsPage() {
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-heading font-bold text-primary mb-4">Nos Partenaires</h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Syllabix est soutenu par des institutions gouvernementales ivoiriennes pour garantir
            la reconnaissance officielle de vos certifications numériques.
          </p>
        </div>

        {/* Partenaires institutionnels */}
        <div className="mb-20">
          <h2 className="text-2xl font-heading font-bold text-primary mb-2 text-center">
            Partenaires Institutionnels
          </h2>
          <p className="text-center text-neutral-500 text-sm mb-10">
            Leurs logos figurent sur chaque certificat délivré par Syllabix
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PARTNERS.map((partner) => (
              <Card key={partner.id} className="p-8 text-center flex flex-col items-center hover:shadow-xl transition-shadow border-2 border-primary/10">
                {/* Badge type */}
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-5 uppercase tracking-wide">
                  {partner.type}
                </span>

                {/* Logo */}
                <div className="relative w-40 h-24 mb-5 flex items-center justify-center">
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.shortName}`}
                    fill
                    className="object-contain"
                    sizes="160px"
                  />
                </div>

                {/* Nom */}
                <h3 className="text-base font-heading font-bold text-primary mb-2 leading-snug">
                  {partner.name}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {partner.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Avantages */}
        <div className="mb-20">
          <h2 className="text-2xl font-heading font-bold text-primary mb-8 text-center">
            Avantages du Partenariat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 flex gap-5 items-start">
                <span className="text-3xl flex-shrink-0">{benefit.icon}</span>
                <div>
                  <h3 className="text-lg font-heading font-bold text-primary mb-1">{benefit.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Types de partenariats */}
        <div className="mb-20">
          <h2 className="text-2xl font-heading font-bold text-primary mb-8 text-center">
            Types de Partenariats
          </h2>
          <div className="space-y-6">
            <Card className="p-8 border-l-4 border-accent">
              <h3 className="text-xl font-heading font-bold text-primary mb-2">Partenariat Institutionnel</h3>
              <p className="text-neutral-600 mb-4 text-sm leading-relaxed">
                Intégrez Syllabix dans votre programme de formation. Offrez à vos étudiants une
                certification numérique reconnue par les ministères partenaires.
              </p>
              <CTAButton href="/contact" variant="primary" size="md">En savoir plus</CTAButton>
            </Card>
            <Card className="p-8 border-l-4 border-secondary">
              <h3 className="text-xl font-heading font-bold text-primary mb-2">Partenariat Entreprise</h3>
              <p className="text-neutral-600 mb-4 text-sm leading-relaxed">
                Évaluez et certifiez les compétences numériques de vos collaborateurs.
                Accédez à des rapports détaillés sur les niveaux de compétences de votre équipe.
              </p>
              <CTAButton href="/contact" variant="primary" size="md">En savoir plus</CTAButton>
            </Card>
            <Card className="p-8 border-l-4 border-primary">
              <h3 className="text-xl font-heading font-bold text-primary mb-2">Partenariat de Distribution</h3>
              <p className="text-neutral-600 mb-4 text-sm leading-relaxed">
                Devenez centre agréé Syllabix et proposez nos certifications à vos bénéficiaires.
                Programme de commissionnement attractif.
              </p>
              <CTAButton href="/contact" variant="primary" size="md">En savoir plus</CTAButton>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="p-12 text-center" style={{ background: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)' }}>
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Devenir Partenaire</h2>
          <p className="text-white/80 mb-8 text-lg max-w-xl mx-auto">
            Rejoignez notre réseau et contribuez à la transformation numérique de la Côte d'Ivoire et de l'Afrique.
          </p>
          <CTAButton
            href="/contact"
            variant="outline"
            size="lg"
            className="text-white border-white hover:bg-white hover:text-primary"
          >
            💬 Nous contacter
          </CTAButton>
        </Card>

      </div>
    </section>
  );
}
