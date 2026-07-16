'use client';

import Reveal from '@/components/Reveal';
import { Download, MousePointerClick, CheckCircle2, FileSpreadsheet, FileText, Mail, Terminal } from 'lucide-react';

/**
 * Les épreuves pratiques — le différenciateur du produit.
 *
 * La plateforme ne pose pas seulement des QCM : elle fait télécharger un vrai
 * fichier piégé (Excel, Word, e-mail), demande une manipulation réelle, et
 * vérifie la réponse. C'était invisible sur le site alors que c'est ce qui
 * distingue Syllabix d'un quiz en ligne.
 */

const FILE_TYPES = [
  { icon: FileSpreadsheet, label: 'Excel',      color: 'text-green-600',  bg: 'bg-green-50' },
  { icon: FileText,        label: 'Word',       color: 'text-blue-600',   bg: 'bg-blue-50' },
  { icon: Mail,            label: 'E-mail',     color: 'text-accent',     bg: 'bg-accent-pale' },
  { icon: Terminal,        label: 'Ligne de commande', color: 'text-neutral-700', bg: 'bg-neutral-100' },
];

export default function PracticalSection({ locale = 'fr', tag, title, subtitle }) {
  const isFr = locale === 'fr';

  const steps = isFr
    ? [
        { icon: Download,           title: 'Vous téléchargez le fichier', desc: 'Un vrai document, avec de vraies erreurs à repérer : formule cassée, chiffres incohérents, expéditeur suspect.' },
        { icon: MousePointerClick,  title: 'Vous faites la manipulation', desc: 'Dans votre propre logiciel — Excel, Word, votre messagerie. Comme au travail, pas dans un simulateur.' },
        { icon: CheckCircle2,       title: 'Votre réponse est vérifiée',  desc: 'Vous saisissez le résultat obtenu. Impossible de deviner : il faut avoir réellement fait la tâche.' },
      ]
    : [
        { icon: Download,           title: 'You download the file',       desc: 'A real document with real mistakes to spot: broken formula, inconsistent figures, suspicious sender.' },
        { icon: MousePointerClick,  title: 'You do the task',             desc: 'In your own software — Excel, Word, your mailbox. Like at work, not in a simulator.' },
        { icon: CheckCircle2,       title: 'Your answer is checked',      desc: 'You enter the result you obtained. No guessing: you must have actually done the task.' },
      ];

  return (
    <section className="py-24 bg-surface-warm">
      <div className="container-max">
        <Reveal direction="up" className="mb-14 text-center">
          <span className="section-tag bg-accent/10 text-accent mb-4 block w-fit mx-auto">
            {tag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary mt-3 mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {steps.map((s, i) => (
            <Reveal key={s.title} direction="up" delay={i * 110}>
              <div className="lift h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5 text-accent" aria-hidden="true" />
                  </div>
                  <span className="text-3xl font-display font-extrabold text-neutral-100 leading-none">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal direction="up" delay={330}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-neutral-500">
              {isFr ? 'Fichiers utilisés :' : 'File types used:'}
            </span>
            {FILE_TYPES.map((f) => (
              <span
                key={f.label}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${f.bg} border border-neutral-100`}
              >
                <f.icon className={`w-4 h-4 ${f.color}`} aria-hidden="true" />
                <span className="text-sm font-medium text-neutral-700">{f.label}</span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
