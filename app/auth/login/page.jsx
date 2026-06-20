'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { authFunctions } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authFunctions.signIn(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
      <div className="w-full max-w-md mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-3xl font-heading font-bold text-primary text-center mb-8">
            Connexion
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                ❌ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Email
              </label>
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
              <label className="block text-sm font-semibold text-primary mb-2">
                Mot de passe
              </label>
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

            <CTAButton
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? '⏳ Connexion...' : '✓ Se connecter'}
            </CTAButton>
          </form>

          <div className="my-6 border-t border-neutral-200"></div>

          <div className="space-y-3 mb-6">
            <button
              onClick={async () => {
                setError('');
                setOauthLoading(true);
                try {
                  await authFunctions.signInWithGoogle();
                  router.push(redirectTo);
                } catch (err) {
                  setError(err.message || 'Erreur de connexion Google');
                } finally {
                  setOauthLoading(false);
                }
              }}
              disabled={oauthLoading || isLoading}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🔷</span> {oauthLoading ? 'Connexion...' : 'Continuer avec Google'}
            </button>
            <button
              onClick={() => setError('La connexion Facebook n\'est pas encore disponible. Utilisez email ou Google.')}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-semibold flex items-center justify-center gap-2 opacity-60"
            >
              <span>🔵</span> Continuer avec Facebook
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
