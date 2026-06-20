'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { authFunctions } from '@/lib/firebase';

const DIAL_CODES = [
  { code: '+225', flag: '🇨🇮', label: '+225' },
  { code: '+33',  flag: '🇫🇷', label: '+33' },
];

function redirect(url) {
  document.cookie = 'syllabix_session=1; path=/; SameSite=Strict; Max-Age=604800';
  window.location.href = url;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Mode : 'email' | 'phone'
  const [mode, setMode] = useState('email');

  // Email/password
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  // Phone login
  const [dialCode,   setDialCode]   = useState('+225');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [smsStep,    setSmsStep]    = useState('idle'); // idle | sending | code
  const [smsCode,    setSmsCode]    = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authFunctions.signIn(email, password);
      redirect(redirectTo);
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
      setIsLoading(false);
    }
  };

  const handleSendSMS = async (e) => {
    e.preventDefault();
    setError('');
    setSmsStep('sending');
    setPhoneLoading(true);
    const fullPhone = `${dialCode}${phoneLocal.replace(/^0/, '').trim()}`;
    try {
      await authFunctions.sendPhoneLoginSMS(fullPhone, 'recaptcha-login');
      setSmsStep('code');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi du SMS');
      setSmsStep('idle');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleConfirmSMS = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneLoading(true);
    try {
      await authFunctions.confirmPhoneLogin(smsCode);
      redirect(redirectTo);
    } catch (err) {
      setError('Code incorrect ou expiré. Réessayez.');
      setPhoneLoading(false);
    }
  };

  return (
    <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
      <div className="w-full max-w-md mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-3xl font-heading font-bold text-primary text-center mb-6">
            Connexion
          </h1>

          {/* Tabs email / téléphone */}
          <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('email'); setError(''); setSmsStep('idle'); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'email' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => { setMode('phone'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'phone' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              📱 Téléphone
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm mb-4">
              ❌ {error}
            </div>
          )}

          {/* ——— Email / Mot de passe ——— */}
          {mode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="vous@exemple.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
              <CTAButton type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? '⏳ Connexion...' : '✓ Se connecter'}
              </CTAButton>
            </form>
          )}

          {/* ——— Téléphone ——— */}
          {mode === 'phone' && (
            <>
              {/* reCAPTCHA container invisible */}
              <div id="recaptcha-login"></div>

              {smsStep !== 'code' ? (
                <form onSubmit={handleSendSMS} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Numéro de téléphone</label>
                    <div className="flex gap-2">
                      <select
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        disabled={phoneLoading}
                        className="flex-shrink-0 px-3 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none bg-white text-sm font-medium"
                      >
                        {DIAL_CODES.map((d) => (
                          <option key={d.code} value={d.code}>{d.flag} {d.label}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={phoneLocal}
                        onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                        placeholder="07 00 00 00 00"
                        required
                        disabled={phoneLoading}
                      />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">Le 0 de début est retiré automatiquement.</p>
                  </div>
                  <CTAButton type="submit" disabled={phoneLoading || !phoneLocal.trim()} className="w-full" size="lg">
                    {phoneLoading ? '⏳ Envoi...' : '📲 Recevoir un code SMS'}
                  </CTAButton>
                </form>
              ) : (
                <form onSubmit={handleConfirmSMS} className="space-y-5">
                  <p className="text-sm text-neutral-600">
                    Code envoyé au <strong>{dialCode} {phoneLocal}</strong>. Saisissez-le ci-dessous :
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none text-center text-2xl font-bold tracking-widest"
                    placeholder="000000"
                    autoFocus
                  />
                  <CTAButton type="submit" disabled={phoneLoading || smsCode.length !== 6} className="w-full" size="lg">
                    {phoneLoading ? '⏳ Vérification...' : '✅ Confirmer le code'}
                  </CTAButton>
                  <button
                    type="button"
                    onClick={() => { setSmsStep('idle'); setSmsCode(''); setError(''); }}
                    className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2"
                  >
                    ← Modifier le numéro
                  </button>
                </form>
              )}
            </>
          )}

          <div className="my-6 border-t border-neutral-200"></div>

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            <button
              onClick={async () => {
                setError('');
                setOauthLoading(true);
                try {
                  const { profileComplete } = await authFunctions.signInWithGoogle();
                  if (!profileComplete) {
                    window.location.href = `/auth/complete-profile?redirect=${encodeURIComponent(redirectTo)}`;
                  } else {
                    redirect(redirectTo);
                  }
                } catch (err) {
                  if (!err.message?.includes('popup-closed-by-user')) {
                    setError(err.message || 'Erreur de connexion Google');
                  }
                  setOauthLoading(false);
                }
              }}
              disabled={oauthLoading || isLoading || phoneLoading}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🔷</span> {oauthLoading ? 'Connexion en cours...' : 'Continuer avec Google'}
            </button>

          </div>

          <p className="text-sm text-neutral-600 text-center">
            Pas encore de compte?{' '}
            <Link href="/auth/signup" className="text-accent font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>
        </Card>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Chargement...</p>
      </section>
    }>
      <LoginForm />
    </Suspense>
  );
}
