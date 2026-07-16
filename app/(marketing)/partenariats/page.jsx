'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Reveal from '@/components/Reveal';
import PartnershipForm from '@/components/PartnershipForm';
import { useLanguage } from '@/lib/LanguageContext';
import { KeyRound, LayoutDashboard, Target, GraduationCap, Building2, Landmark } from 'lucide-react';

/**
 * « Devenir partenaire ».
 *
 * Cette page exhibait auparavant le MENA, le MESRS, le Ministère du Numérique
 * et l'Agence Emploi Jeunes comme « partenaires institutionnels », affirmait
 * des « certificats co-signés », un « réseau d'employeurs » et un « programme
 * de commissionnement » — rien de tout cela n'existe. Elle explique désormais
 * ce qu'une organisation gagne réellement à rejoindre, et recueille sa demande.
 */
export default function PartenariatsPage() {
  const { locale } = useLanguage();
  const isFr = locale === 'fr';

  const benefits = isFr
    ? [
        { icon: KeyRound,        title: 'Un code d\'accès pour vos membres', desc: 'Vous recevez un code à diffuser. Chaque membre le saisit depuis son compte et se rattache à votre organisation — vous n\'avez aucun compte à créer.' },
        { icon: LayoutDashboard, title: 'Un tableau de bord de suivi',       desc: 'Suivez la progression de chaque membre, comparez vos classes, filières ou directions, et repérez celles qui décrochent. Export des données inclus.' },
        { icon: Target,          title: 'Un reporting par compétence',       desc: 'Les résultats sont restitués sur les 5 domaines et 16 compétences du référentiel : vous savez précisément où porter l\'effort de formation.' },
      ]
    : [
        { icon: KeyRound,        title: 'An access code for your members', desc: 'You receive a code to share. Each member enters it from their account and joins your organisation — you have no accounts to create.' },
        { icon: LayoutDashboard, title: 'A progress dashboard',            desc: 'Follow each member\'s progress, compare your classes, programmes or departments, and spot those falling behind. Data export included.' },
        { icon: Target,          title: 'Competency-level reporting',      desc: 'Results are reported across the 5 domains and 16 competencies of the framework: you know exactly where to focus training.' },
      ];

  const audiences = [
    { icon: GraduationCap, label: isFr ? 'Écoles' : 'Schools' },
    { icon: Landmark,      label: isFr ? 'Universités et grandes écoles' : 'Universities and higher education' },
    { icon: Building2,     label: isFr ? 'Entreprises' : 'Companies' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title={isFr ? 'Devenir partenaire' : 'Become a partner'}
        subtitle={isFr
          ? 'Faites certifier les compétences numériques de vos élèves, étudiants ou collaborateurs — et suivez leur progression.'
          : 'Certify the digital skills of your students or staff — and follow their progress.'}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

        {/* Programme pilote — le stade est assumé, pas dissimulé */}
        <Reveal direction="up">
          <div className="mb-14 rounded-2xl border border-accent/20 bg-accent-pale/60 p-6 sm:p-8">
            <span className="inline-block px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-display font-semibold uppercase tracking-widest mb-3">
              {isFr ? 'Programme pilote' : 'Pilot programme'}
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary mb-3">
              {isFr
                ? 'Syllabix est en lancement — et cherche ses premiers partenaires'
                : 'Syllabix is launching — and looking for its first partners'}
            </h2>
            <p className="text-neutral-600 leading-relaxed max-w-3xl">
              {isFr
                ? 'Nous ne revendiquons aucune reconnaissance officielle : aucun partenariat institutionnel n\'est signé à ce jour, et nous l\'annoncerons ici dès que ce sera le cas. Ce que nous proposons aujourd\'hui : un référentiel sérieux de 5 domaines et 16 compétences, des épreuves pratiques sur de vrais fichiers, et un outil de suivi pour votre organisation. Les premiers partenaires façonnent le produit avec nous.'
                : 'We claim no official recognition: no institutional partnership is signed to date, and we will announce it here as soon as one is. What we offer today: a serious framework of 5 domains and 16 competencies, hands-on tasks on real files, and a tracking tool for your organisation. Our first partners shape the product with us.'}
            </p>
          </div>
        </Reveal>

        {/* Ce que vous obtenez */}
        <div className="mb-14">
          <h2 className="text-2xl font-display font-bold text-primary mb-8">
            {isFr ? 'Ce que vous obtenez' : 'What you get'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <Reveal key={b.title} direction="up" delay={i * 90}>
                <div className="lift h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-card">
                  <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                    <b.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-primary mb-2 leading-tight">{b.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Public visé */}
        <Reveal direction="up">
          <div className="mb-14 flex flex-wrap items-center justify-center gap-4">
            {audiences.map((a) => (
              <span key={a.label}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm font-medium text-neutral-700">
                <a.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                {a.label}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Formulaire */}
        <div id="demande" className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-primary mb-2 text-center">
            {isFr ? 'Parlons de votre projet' : 'Let\'s talk about your project'}
          </h2>
          <p className="text-sm text-neutral-500 mb-8 text-center">
            {isFr
              ? 'Laissez-nous vos coordonnées : nous vous recontactons pour une démonstration.'
              : 'Leave us your details: we will get back to you for a demo.'}
          </p>
          <PartnershipForm locale={locale} />
        </div>

        {/* Apprenant individuel — l'accueil parle d'abord à lui */}
        <Reveal direction="up">
          <p className="mt-14 text-center text-sm text-neutral-500">
            {isFr ? 'Vous êtes un particulier ?' : 'Are you an individual?'}{' '}
            <Link href="/auth/signup" className="text-accent font-semibold hover:underline">
              {isFr ? 'Créez votre compte gratuitement' : 'Create your free account'}
            </Link>
          </p>
        </Reveal>
      </div>
    </div>
  );
}
