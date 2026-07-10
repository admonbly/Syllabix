'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Great_Vibes } from 'next/font/google';
import { auth, userDB } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';
import { PARTNERS } from '@/lib/partners';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';

// Police calligraphique — nom du lauréat et signature manuscrite
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', display: 'swap' });

const MODULE_NAMES = {
  0: 'IT & Ordinateur',
  1: 'Internet',
  2: 'Email',
  3: 'Bureautique',
  4: 'Cybersécurité',
  5: 'Intelligence Artificielle',
  6: 'Employabilité',
};

function formatDate(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getLevel(score) {
  if (score >= 80) return { label: 'Avancé', color: '#27AE60', bg: '#e8f7ee' };
  if (score >= 60) return { label: 'Intermédiaire', color: '#E67E22', bg: '#fdf0e3' };
  return { label: 'Validé', color: '#1A237E', bg: '#eceffc' };
}

/**
 * Texte explicatif du niveau — différencié selon le type de certification.
 * Global : porte sur l'ensemble du référentiel (7 domaines).
 * Module : porte sur les 3 compétences du module concerné.
 */
function getMeaning(cert, level) {
  const isGlobal = cert.moduleId === null || cert.moduleId === undefined;

  if (isGlobal) {
    if (level.label === 'Avancé') {
      return 'Vous maîtrisez l\'ensemble des compétences numériques du référentiel Syllabix : ordinateur, Internet, email, bureautique, cybersécurité, intelligence artificielle et employabilité. Vous êtes autonome, y compris dans les situations complexes, et vous pouvez accompagner d\'autres personnes dans leur usage du numérique.';
    }
    if (level.label === 'Intermédiaire') {
      return 'Vous disposez de pratiques numériques solides sur l\'ensemble du référentiel Syllabix : vous utilisez efficacement un ordinateur, Internet et les outils bureautiques, vous communiquez en ligne de façon professionnelle et vous connaissez les règles essentielles de sécurité. Vous gagnerez en aisance sur les situations les plus avancées avec la pratique.';
    }
    return 'Vous disposez de pratiques numériques de base sur l\'ensemble du référentiel Syllabix et savez réaliser les tâches courantes, avec de l\'aide lorsque la situation se complique. Poursuivez l\'entraînement pour progresser vers le niveau supérieur.';
  }

  // Certification de module — s'appuie sur les compétences affichées du référentiel
  const mod = MODULE_COMPETENCIES.find((m) => m.moduleId === Number(cert.moduleId));
  const comps = mod ? mod.competences.map((co) => co.fr.toLowerCase()).join(', ') : 'les compétences de ce domaine';
  if (level.label === 'Avancé') {
    return `Vous maîtrisez les trois compétences de ce domaine du référentiel Syllabix — ${comps} — et savez les mobiliser de façon autonome, y compris dans des situations complexes ou inhabituelles.`;
  }
  if (level.label === 'Intermédiaire') {
    return `Vous mobilisez avec assurance les compétences de ce domaine du référentiel Syllabix — ${comps} — dans les situations courantes, et continuez de progresser sur les cas les plus avancés.`;
  }
  return `Vous disposez des bases de ce domaine du référentiel Syllabix — ${comps} — et savez les appliquer dans les situations simples du quotidien.`;
}

export default function CertificatePage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const c = (k) => t(`certificate.${k}`);
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      // Try public certificates collection first (accessible without auth)
      const publicCert = await userDB.getPublicCertificate(id);
      if (publicCert) {
        setCert(publicCert);
        setLoading(false);
        return;
      }
      // Fallback: check logged-in user's subcollection
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const certs = await userDB.getUserCertificates(user.uid);
          const found = certs.find((c) => c.id === id);
          if (found) { setCert(found); }
          else { setNotFound(true); }
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
    };
    load();
  }, [id]);

  const handlePrint = () => window.print();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(c('linkCopied'));
  };

  const handleLinkedIn = () => {
    if (!cert) return;
    const issueDate = cert.issuedAt ? new Date(cert.issuedAt) : new Date();
    const certName = encodeURIComponent(
      cert.moduleId !== null && cert.moduleId !== undefined
        ? `Syllabix — Certificat de Compétences Numériques : ${MODULE_NAMES[cert.moduleId] || `Module ${cert.moduleId}`}`
        : 'Syllabix — Certificat de Compétences Numériques'
    );
    const certUrl = encodeURIComponent(`${window.location.origin}/certificate/${id}`);
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&issueYear=${issueDate.getFullYear()}&issueMonth=${issueDate.getMonth() + 1}&certUrl=${certUrl}&certId=${id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">{c('loading')}</p>
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-primary mb-3">{c('notFound')}</h1>
          <p className="text-neutral-600 mb-6">{c('notFoundDesc')}</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            {c('back')}
          </Link>
        </div>
      </div>
    );
  }

  const level = getLevel(cert.score);
  const isGlobal = cert.moduleId === null || cert.moduleId === undefined;
  const moduleName = isGlobal ? null : (MODULE_NAMES[cert.moduleId] || `Module ${cert.moduleId}`);
  const meaning = getMeaning(cert, level);

  return (
    <>
      {/* Styles print uniquement — A4 paysage */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body * { visibility: hidden !important; }
          #certificate-printable, #certificate-printable * { visibility: visible !important; }
          #certificate-printable { position: fixed; inset: 0; margin: 0; width: 100vw; height: 100vh; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-blue-50 py-12 px-4">

        {/* Actions */}
        <div className="max-w-3xl mx-auto mb-6 flex flex-wrap gap-3 justify-between items-center no-print">
          <Link href="/dashboard" className="text-primary hover:underline font-medium text-sm">
            {c('back')}
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handleLinkedIn}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0077B5] text-white rounded-xl font-semibold text-sm hover:bg-[#006097] transition-colors shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              {c('linkedin')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary hover:text-white transition-colors shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              {c('print')}
            </button>
          </div>
        </div>

        {/* Certificat visuel — carte paysage à deux panneaux */}
        <div
          id="certificate-printable"
          ref={printRef}
          className="max-w-5xl mx-auto shadow-2xl rounded-2xl overflow-hidden lg:aspect-[1.414/1] flex flex-col lg:flex-row bg-white relative"
        >
          {/* ══════════ PANNEAU GAUCHE — blanc ══════════ */}
          <div className="relative flex-1 flex flex-col px-10 py-8 lg:pr-8" style={{ background: '#ffffff' }}>

            {/* Vague décorative haut-gauche */}
            <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: 220, height: 110 }} viewBox="0 0 220 110" fill="none" aria-hidden="true">
              <path d="M0 0 H220 C 150 8, 90 30, 60 70 C 40 96, 15 106, 0 108 Z" fill="#1A237E" opacity="0.06" />
              <path d="M0 0 H150 C 100 6, 60 24, 40 55 C 26 76, 10 84, 0 86 Z" fill="#E67E22" opacity="0.10" />
            </svg>

            {/* Logo */}
            <div className="relative mb-6" style={{ width: 170, height: 50 }}>
              <Image
                src="/syllabix-logo-with-name.png"
                alt="Syllabix"
                fill
                className="object-contain object-left"
                sizes="170px"
                priority
              />
            </div>

            {/* Titre */}
            <h1 className="font-heading font-extrabold leading-tight" style={{ color: '#1A237E', fontSize: 40 }}>
              Certificat de Compétences Numériques
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              {isGlobal
                ? 'Certification globale — examen couvrant les 7 domaines du référentiel Syllabix'
                : <>Certification de module : <strong style={{ color: '#1A237E' }}>{moduleName}</strong></>}
            </p>

            {/* Lauréat */}
            <div className="mt-7">
              <p className="text-sm text-neutral-500 mb-1">délivré à</p>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" style={{ color: '#E67E22', fontSize: 30, fontWeight: 800, lineHeight: 1 }}>&raquo;</span>
                <p className="font-heading font-extrabold" style={{ color: '#1A237E', fontSize: 32 }}>
                  {cert.displayName || 'Apprenant'}
                </p>
              </div>
            </div>

            {/* Date + signature */}
            <div className="mt-auto pt-6">
              <p className="text-sm text-neutral-600">le {formatDate(cert.issuedAt)}</p>
              <p className={greatVibes.className} style={{ fontSize: 40, color: '#1a2a6c', transform: 'rotate(-4deg)', width: 'fit-content', margin: '2px 0 -6px 8px' }}>
                Syllabix
              </p>
              <p className="text-sm text-neutral-500">La Direction de la Certification — Syllabix</p>

              {/* Encadré de vérification */}
              <div className="mt-4 inline-flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: '1.5px solid #c7cbe8' }}>
                <div
                  className="rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ width: 46, height: 46, background: '#1A237E' }}
                >
                  <span className="text-white" style={{ fontSize: 22 }}>✓</span>
                </div>
                <div>
                  <p className="font-mono font-bold text-sm" style={{ color: '#1A237E' }}>{cert.id || id}</p>
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    Pour vérifier l'authenticité de ce certificat, utilisez ce code sur<br />
                    syllabix.com/certificate
                  </p>
                </div>
              </div>

              {/* Partenaires institutionnels */}
              <div className="mt-5 flex items-center gap-5 flex-wrap">
                <p className="text-[9px] font-semibold uppercase text-neutral-400" style={{ letterSpacing: '0.2em' }}>
                  Partenaires<br />institutionnels
                </p>
                {PARTNERS.map((partner) => (
                  <div key={partner.id} className="relative" style={{ width: 56, height: 32 }}>
                    <Image
                      src={partner.logo}
                      alt={partner.shortName}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════ PANNEAU DROIT — teinté ══════════ */}
          <div
            className="relative lg:w-[38%] flex flex-col items-center px-8 py-8"
            style={{ background: 'linear-gradient(160deg, #eef1fc 0%, #f7f4ee 100%)' }}
          >
            {/* Vague décorative bas-droite */}
            <svg className="absolute bottom-0 right-0 pointer-events-none" style={{ width: 200, height: 100 }} viewBox="0 0 200 100" fill="none" aria-hidden="true">
              <path d="M200 100 H0 C 70 92, 120 72, 150 40 C 168 20, 188 8, 200 4 Z" fill="#1A237E" opacity="0.07" />
            </svg>

            {/* Badge hexagonal du score */}
            <div className="relative" style={{ width: 168, height: 188 }}>
              <div
                className="absolute inset-0"
                style={{
                  background: '#E67E22',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
              <div
                className="absolute flex flex-col items-center justify-center text-center"
                style={{
                  inset: 5,
                  background: '#ffffff',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              >
                <p className="text-xs font-bold tracking-widest" style={{ color: '#1A237E' }}>SYLLABIX</p>
                <p className="font-heading font-extrabold" style={{ color: '#1A237E', fontSize: 52, lineHeight: 1.05 }}>
                  {cert.score}<span style={{ fontSize: 26 }}>%</span>
                </p>
                <div style={{ height: 1.5, width: 64, background: '#d9dcef', margin: '4px 0' }} />
                <p className="text-sm text-neutral-500">de réussite</p>
              </div>
            </div>

            {/* Niveau */}
            <p className="text-sm font-semibold text-neutral-600 mt-4">
              {isGlobal ? 'Niveau global' : 'Niveau du module'}
            </p>
            <span
              className="mt-2 px-6 py-1.5 rounded-full font-bold text-white text-lg"
              style={{ background: level.color }}
            >
              {level.label}
            </span>

            {/* Signification du niveau */}
            <div className="mt-6 relative">
              <p className="font-bold text-[15px] mb-2" style={{ color: '#1A237E' }}>
                Votre niveau signifie que :
              </p>
              <p className="text-[13px] leading-relaxed text-neutral-700 text-justify">
                {meaning}
              </p>
              {!isGlobal && (
                <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed">
                  Ce certificat porte sur un module du référentiel. La certification globale, qui évalue les 7 domaines
                  en un seul examen, donne lieu au Certificat de Compétences Numériques complet.
                </p>
              )}
              {isGlobal && (
                <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed">
                  Ce certificat atteste la réussite de l'examen global : 32 questions, dont des épreuves pratiques,
                  couvrant les 7 domaines du référentiel Syllabix en conditions contrôlées.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Partage social supplémentaire */}
        <div className="max-w-3xl mx-auto mt-6 text-center no-print">
          <p className="text-sm text-neutral-500">
            {c('share')}{' '}
            <button onClick={handleCopyLink} className="text-primary font-medium hover:underline">
              {c('copyLink')}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
