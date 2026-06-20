'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { auth, authFunctions } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function VerifyPhonePage() {
  const [step, setStep]               = useState('send');   // 'send' | 'confirm'
  const [phone, setPhone]             = useState('');
  const [code, setCode]               = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  // Pré-remplir le numéro depuis Firestore si disponible
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists() && snap.data().phoneNumber) {
        setPhone(snap.data().phoneNumber);
      }
    });
  }, []);

  const handleSendSMS = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Entrez votre numéro de téléphone.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const vId = await authFunctions.sendPhoneSMS(phone.trim(), 'recaptcha-container');
      setVerificationId(vId);
      setStep('confirm');
    } catch (err) {
      setError(err.message || 'Impossible d\'envoyer le SMS. Vérifiez le numéro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async (e) => {
    e.preventDefault();
    if (code.length < 4) {
      setError('Entrez le code reçu par SMS.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await authFunctions.confirmPhoneSMS(verificationId, code);
      setSuccess(true);
      setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
    } catch (err) {
      setError(err.message || 'Code incorrect ou expiré. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
        <div className="w-full max-w-md mx-auto px-4">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-heading font-bold text-primary mb-2">Téléphone vérifié !</h1>
            <p className="text-neutral-600">Redirection vers votre tableau de bord…</p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
      <div className="w-full max-w-md mx-auto px-4">
        {/* reCAPTCHA invisible — requis par Firebase */}
        <div id="recaptcha-container" />

        <Card className="p-8">
          {/* Étapes */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-secondary text-white text-xs font-bold flex items-center justify-center">✓</div>
              <span className="text-sm text-neutral-500">Email vérifié</span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200" />
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step === 'send' ? 'bg-accent text-white' : 'bg-secondary text-white'}`}>
                {step === 'confirm' ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium text-primary">Téléphone</span>
            </div>
          </div>

          <div className="text-5xl text-center mb-4">📱</div>
          <h1 className="text-2xl font-heading font-bold text-primary text-center mb-2">
            {step === 'send' ? 'Vérifiez votre téléphone' : 'Entrez le code SMS'}
          </h1>
          <p className="text-neutral-500 text-sm text-center mb-8">
            {step === 'send'
              ? 'Nous allons envoyer un code SMS pour confirmer votre identité.'
              : `Code envoyé au ${phone}. Vérifiez vos SMS.`}
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm mb-6">
              ❌ {error}
            </div>
          )}

          {step === 'send' ? (
            <form onSubmit={handleSendSMS} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors text-lg tracking-wider"
                  placeholder="+221 77 000 00 00"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-neutral-400 mt-1">Format international obligatoire (+221, +225, +33…)</p>
              </div>
              <CTAButton type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? '⏳ Envoi...' : '📨 Envoyer le code SMS'}
              </CTAButton>
            </form>
          ) : (
            <form onSubmit={handleConfirmCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Code SMS reçu
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors text-2xl tracking-[0.5em] text-center font-mono"
                  placeholder="• • • • • •"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
              <CTAButton type="submit" disabled={isLoading || code.length < 4} className="w-full" size="lg">
                {isLoading ? '⏳ Vérification...' : '✓ Confirmer le code'}
              </CTAButton>
              <button
                type="button"
                onClick={() => { setStep('send'); setCode(''); setError(''); }}
                className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2"
              >
                ← Changer de numéro
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
            <button
              onClick={async () => { window.location.href = '/dashboard'; }}
              className="text-sm text-neutral-400 hover:text-neutral-600"
            >
              Passer pour l'instant →
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
}
