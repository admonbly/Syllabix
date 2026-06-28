'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { authFunctions, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';

const FIREBASE_ERRORS = {
  'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
  'auth/wrong-password': 'Mot de passe incorrect.',
  'auth/invalid-credential': 'Email ou mot de passe incorrect.',
  'auth/invalid-email': 'Adresse email invalide.',
  'auth/user-disabled': 'Ce compte a été désactivé.',
  'auth/too-many-requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
};

const DIAL_CODES = [
  { code: '+225', flag: '🇨🇮' },
  { code: '+221', flag: '🇸🇳' },
  { code: '+234', flag: '🇳🇬' },
  { code: '+237', flag: '🇨🇲' },
  { code: '+243', flag: '🇨🇩' },
  { code: '+254', flag: '🇰🇪' },
  { code: '+233', flag: '🇬🇭' },
  { code: '+212', flag: '🇲🇦' },
  { code: '+216', flag: '🇹🇳' },
  { code: '+213', flag: '🇩🇿' },
  { code: '+20',  flag: '🇪🇬' },
  { code: '+27',  flag: '🇿🇦' },
  { code: '+33',  flag: '🇫🇷' },
  { code: '+32',  flag: '🇧🇪' },
  { code: '+41',  flag: '🇨🇭' },
];

function redirect(url) {
  window.location.href = url;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const sessionExpired = searchParams.get('reason') === 'session_expired';
  const { t } = useLanguage();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace(redirectTo);
    });
    return unsub;
  }, [router, redirectTo]);
  const a = (k) => t(`auth.login.${k}`);

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
      const code = err?.code;
      setError(FIREBASE_ERRORS[code] || err.message || 'Erreur de connexion');
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
        {sessionExpired && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center">
            ⏱ Votre session a expiré après 6h d'inactivité. Veuillez vous reconnecter.
          </div>
        )}

        <Card className="p-8">
          <h1 className="text-3xl font-heading font-bold text-primary text-center mb-6">
            {a('title')}
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
              {a('tabEmail')}
            </button>
            <button
              type="button"
              onClick={() => { setMode('phone'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'phone' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {a('tabPhone')}
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
                <label className="block text-sm font-semibold text-primary mb-2">{a('emailLabel')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder={a('emailHolder')}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">{a('passwordLabel')}</label>
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
                {isLoading ? a('submitting') : a('submit')}
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
                        className="w-28 flex-shrink-0 px-2 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none bg-white text-sm font-medium"
                      >
                        {DIAL_CODES.map((d) => (
                          <option key={d.code} value={d.code}>{d.flag} {d.code}</option>
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
                    <p className="text-xs text-neutral-400 mt-1">{a('phoneSend')}</p>
                  </div>
                  <CTAButton type="submit" disabled={phoneLoading || !phoneLocal.trim()} className="w-full" size="lg">
                    {phoneLoading ? a('phoneSending') : a('phoneSend')}
                  </CTAButton>
                </form>
              ) : (
                <form onSubmit={handleConfirmSMS} className="space-y-5">
                  <p className="text-sm text-neutral-600">
                    {a('smsSent')} <strong>{dialCode} {phoneLocal}</strong>
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
                    {phoneLoading ? a('codeConfirming') : a('codeConfirm')}
                  </CTAButton>
                  <button
                    type="button"
                    onClick={() => { setSmsStep('idle'); setSmsCode(''); setError(''); }}
                    className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2"
                  >
                    {a('changeNum')}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="my-6 border-t border-neutral-200"></div>

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            {/* WhatsApp — prochainement */}
            <div className="relative">
              <button
                disabled
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg font-semibold flex items-center justify-center gap-2 opacity-60 cursor-not-allowed bg-green-50 text-green-800"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.533 5.845L0 24l6.335-1.507A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.804 9.804 0 01-5.044-1.393l-.361-.214-3.762.895.953-3.67-.235-.376A9.808 9.808 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                Connexion via WhatsApp
                <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-semibold">Bientôt</span>
              </button>
            </div>

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
              <span>🔷</span> {oauthLoading ? a('submitting') : a('google')}
            </button>

          </div>

          <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-500 mb-3">{a('noAccount')}</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center w-full px-4 py-3 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent hover:text-white transition-all"
            >
              {a('signUp')}
            </Link>
          </div>
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
