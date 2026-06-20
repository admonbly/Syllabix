/**
 * Interceptor Hook pour les erreurs API globales
 * Gère les redéfaults automatiques en cas d'erreur 401 (Unauthorized)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from './index';
import { useAuthStore } from './stores';
import { ApiError } from '@/services/api';
import { getAuth, signOut } from 'firebase/auth';

/**
 * Hook pour intercepter et gérer les erreurs API globales
 * Doit être utilisé au niveau du layout root
 */
export function useApiErrorInterceptor() {
  const router = useRouter();
  const { error: showError } = useNotification();
  const { logout } = useAuthStore();

  // Fonction pour gérer l'erreur
  const handleApiError = async (error: unknown) => {
    if (error instanceof ApiError) {
      console.error(`API Error [${error.statusCode}]: ${error.message}`);

      // 401 Unauthorized - Token expiré ou invalide
      if (error.isUnauthorized()) {
        showError('Votre session a expiré. Veuillez vous reconnecter.');
        
        // Logout de Firebase et du store
        const auth = getAuth();
        try {
          await signOut(auth);
        } catch (err) {
          console.error('Error signing out:', err);
        }
        
        // Logout du store Zustand
        logout();
        
        // Redirection vers login
        router.push('/auth/login');
      }

      // 404 Not Found
      if (error.isNotFound()) {
        showError('Ressource non trouvée');
      }

      // 500+ Server Error
      if (error.isServerError()) {
        showError('Erreur serveur. Veuillez réessayer plus tard.');
      }

      // Autres erreurs
      if (!error.isUnauthorized() && !error.isNotFound() && !error.isServerError()) {
        showError(error.message);
      }
    }
  };

  return { handleApiError };
}

/**
 * Hook pour monitorer la validité du token et rediriger si nécessaire
 */
export function useAuthMonitor() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { error: showError } = useNotification();

  useEffect(() => {
    // Si on perd l'authentification soudainement, rediriger vers login
    if (!isAuthenticated && user === null) {
      // Vérifier si on est déjà sur une page publique
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const publicPages = ['/auth/login', '/auth/signup', '/'];

      if (!publicPages.some(page => pathname.startsWith(page))) {
        showError('Vous avez été déconnecté');
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, user, router, showError]);
}
