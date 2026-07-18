'use client';

import { useState } from 'react';

/**
 * Boutons de partage social réutilisables.
 * @param {{ url: string, text?: string, linkedInUrl?: string }} props
 * - url : lien à partager (page publique badge/certif)
 * - text : message d'accompagnement (WhatsApp)
 * - linkedInUrl : URL LinkedIn spécifique (« Ajouter à mon profil ») ; à défaut,
 *   un simple partage de lien LinkedIn est utilisé.
 */
export default function ShareButtons({ url, text = '', linkedInUrl = null }) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const shareText = text || 'Découvrez mes compétences numériques certifiées sur Syllabix';

  const whatsapp = `https://wa.me/?text=${enc(`${shareText} ${url}`)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const linkedin = linkedInUrl || `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard indisponible */ }
  };

  const btn = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold text-sm text-white transition-colors min-h-[44px]';

  return (
    <div className="flex flex-wrap gap-2.5">
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#25D366] hover:brightness-95`} aria-label="Partager sur WhatsApp">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.533 5.845L0 24l6.335-1.507A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.804 9.804 0 01-5.044-1.393l-.361-.214-3.762.895.953-3.67-.235-.376A9.808 9.808 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
        </svg>
        WhatsApp
      </a>

      <a href={linkedin} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#0A66C2] hover:brightness-95`} aria-label="Partager sur LinkedIn">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </a>

      <a href={facebook} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#1877F2] hover:brightness-95`} aria-label="Partager sur Facebook">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </a>

      <button onClick={copy} className={`${btn} bg-neutral-700 hover:bg-neutral-800`} aria-label="Copier le lien">
        {copied ? '✓ Copié' : '🔗 Copier'}
      </button>
    </div>
  );
}
