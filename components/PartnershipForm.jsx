'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { ORG_REQUEST_TYPES } from '@/lib/partnership';

/**
 * Formulaire « Devenir partenaire ».
 *
 * Public : une organisation qui découvre Syllabix n'a pas de compte.
 * L'écriture passe par /api/partnership/request (Admin SDK) — la collection
 * est fermée au client par les règles Firestore.
 */
export default function PartnershipForm({ locale = 'fr' }) {
  const isFr = locale === 'fr';

  const [form, setForm] = useState({
    type: 'SCHOOL', orgName: '', contactName: '', email: '', phone: '', message: '',
  });
  const [busy, setBusy]   = useState(false);
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/partnership/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isFr ? 'Une erreur est survenue.' : 'Something went wrong.'));
        return;
      }
      setSent(true);
    } catch {
      setError(isFr ? 'Une erreur est survenue. Réessayez.' : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-secondary/20 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary-pale flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-secondary" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-display font-bold text-primary mb-2">
          {isFr ? 'Demande envoyée' : 'Request sent'}
        </h3>
        <p className="text-sm text-neutral-600 max-w-md mx-auto">
          {isFr
            ? 'Merci. Nous revenons vers vous rapidement pour échanger sur votre projet et vous présenter la plateforme.'
            : 'Thank you. We will get back to you shortly to discuss your project and walk you through the platform.'}
        </p>
      </div>
    );
  }

  const input = 'w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors';
  const label = 'block text-sm font-semibold text-primary mb-2';

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-5">
      <div>
        <label htmlFor="p-type" className={label}>
          {isFr ? 'Vous représentez' : 'You represent'}
        </label>
        <select id="p-type" value={form.type} onChange={set('type')} className={`${input} bg-white`}>
          {ORG_REQUEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{isFr ? t.fr : t.en}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="p-org" className={label}>
          {isFr ? 'Nom de votre organisation' : 'Organisation name'}
        </label>
        <input
          id="p-org" required value={form.orgName} onChange={set('orgName')} className={input}
          placeholder={isFr ? 'Lycée Moderne de Cocody' : 'Your organisation'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="p-name" className={label}>{isFr ? 'Votre nom' : 'Your name'}</label>
          <input id="p-name" required value={form.contactName} onChange={set('contactName')} className={input} />
        </div>
        <div>
          <label htmlFor="p-email" className={label}>{isFr ? 'Votre e-mail' : 'Your email'}</label>
          <input id="p-email" type="email" required value={form.email} onChange={set('email')}
            className={input} placeholder="vous@exemple.com" />
        </div>
      </div>

      <div>
        <label htmlFor="p-phone" className={label}>
          {isFr ? 'Téléphone' : 'Phone'} <span className="font-normal text-neutral-400">({isFr ? 'optionnel' : 'optional'})</span>
        </label>
        <input id="p-phone" type="tel" value={form.phone} onChange={set('phone')} className={input} placeholder="+225 ..." />
      </div>

      <div>
        <label htmlFor="p-msg" className={label}>
          {isFr ? 'Votre besoin' : 'What do you need?'}{' '}
          <span className="font-normal text-neutral-400">({isFr ? 'optionnel' : 'optional'})</span>
        </label>
        <textarea
          id="p-msg" rows={4} value={form.message} onChange={set('message')} className={input}
          placeholder={isFr
            ? 'Combien de personnes souhaitez-vous certifier ? Dans quel cadre ?'
            : 'How many people would you like to certify? In what context?'}
        />
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent text-white font-display font-semibold hover:bg-accent-dark transition-colors disabled:opacity-60 min-h-[44px]"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
        {busy ? (isFr ? 'Envoi…' : 'Sending…') : (isFr ? 'Envoyer ma demande' : 'Send my request')}
      </button>

      <p className="text-xs text-neutral-400 text-center">
        {isFr
          ? 'Nous utilisons ces informations uniquement pour vous recontacter.'
          : 'We use this information solely to get back to you.'}
      </p>
    </form>
  );
}
