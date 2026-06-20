/**
 * Hooks personnalisés pour Syllabix
 */

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useAuthStore, useExamStatsStore } from './stores';
import { apiClient, getErrorMessage } from '@/services/api';
import type { User, ExamStats, ExamResult, Article } from '@/types';

// ========== AUTHENTICATION HOOKS ==========

/**
 * Hook pour l'authentification
 * Charge le user depuis Zustand ou Firebase
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, refreshUser } = useAuthStore();
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);

  useEffect(() => {
    // Écouter les changements Firebase
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Rafraîchir les données utilisateur depuis le backend
        await refreshUser();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, refreshUser]);

  return {
    user: firebaseUser ? user : null,
    isAuthenticated: !!firebaseUser && isAuthenticated,
    isLoading,
    firebaseUser,
  };
}

/**
 * Hook pour récupérer les stats d'examen
 */
export function useExamStats() {
  const { stats, isLoading, error, fetchStats } = useExamStatsStore();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setIsFetching(true);
      try {
        await fetchStats();
      } finally {
        setIsFetching(false);
      }
    };

    loadStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading: isLoading || isFetching,
    error,
    refetch: fetchStats,
  };
}

// ========== EXAM HOOKS ==========

/**
 * Hook pour récupérer l'historique des examens
 */
export function useExamHistory() {
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getExamHistory();
      if (response.success && response.data) {
        setHistory(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}

/**
 * Hook pour récupérer l'historique d'un module
 */
export function useModuleExamHistory(moduleId: string) {
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getModuleExamHistory(moduleId);
      if (response.success && response.data) {
        setHistory(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchHistory();
    }
  }, [moduleId]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}

/**
 * Hook pour récupérer le meilleur score d'un module
 */
export function useBestModuleScore(moduleId: string) {
  const [score, setScore] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getBestModuleScore(moduleId);
      if (response.success && response.data) {
        setScore(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchScore();
    }
  }, [moduleId]);

  return {
    score,
    isLoading,
    error,
    refetch: fetchScore,
  };
}

// ========== ARTICLES HOOKS ==========

/**
 * Hook pour récupérer tous les articles
 */
export function useArticles(limit: number = 10) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAllArticles(limit);
      if (response.success && response.data) {
        setArticles(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [limit]);

  return {
    articles,
    isLoading,
    error,
    refetch: fetchArticles,
  };
}

/**
 * Hook pour récupérer un article par slug
 */
export function useArticle(slug: string) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getArticleBySlug(slug);
      if (response.success && response.data) {
        setArticle(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  return {
    article,
    isLoading,
    error,
    refetch: fetchArticle,
  };
}

/**
 * Hook pour récupérer les articles par catégorie
 */
export function useArticlesByCategory(category: string, limit: number = 10) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getArticlesByCategory(category, limit);
      if (response.success && response.data) {
        setArticles(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchArticles();
    }
  }, [category, limit]);

  return {
    articles,
    isLoading,
    error,
    refetch: fetchArticles,
  };
}

// ========== UTILITY HOOKS ==========

/**
 * Hook pour afficher une notification
 */
export function useNotification() {
  const { addNotification, removeNotification } = require('./stores').useUiStore();

  return {
    success: (message: string) => addNotification('success', message),
    error: (message: string) => addNotification('error', message),
    warning: (message: string) => addNotification('warning', message),
    info: (message: string) => addNotification('info', message),
    remove: removeNotification,
  };
}

// ========== GLOBAL ERROR HANDLING ==========

// Export les hooks d'intercepteur
export { useApiErrorInterceptor, useAuthMonitor } from './useApiInterceptor';
