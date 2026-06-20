/**
 * Client API Centralisé pour Syllabix
 * 
 * Toutes les requêtes HTTP passent par ce fichier
 * Gère les headers, tokens Firebase, erreurs
 */

import { auth } from '@/lib/firebase';
import type {
  ApiResponse,
  AuthResponse,
  User,
  ExamSubmission,
  ExamResult,
  ExamStats,
  Article,
  Question,
  ModuleConfig,
} from '@/types';

// Récupérer l'URL de base de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Classe pour gérer toutes les requêtes API
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Récupère le token Firebase du user actuel
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      if (!auth.currentUser) {
        return null;
      }
      return await auth.currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Effectue une requête HTTP avec gestion d'erreurs et retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // ms

    try {
      const token = await this.getAuthToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // Parser la réponse
      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new ApiError(
          'Failed to parse response',
          response.status,
          'Invalid JSON response from server'
        );
      }

      // Si erreur HTTP
      if (!response.ok) {
        const error = new ApiError(
          data.message || 'Request failed',
          response.status,
          data.error
        );

        // Si 401 (Unauthorized), essayer de renouveler le token
        if (response.status === 401) {
          console.warn('Unauthorized: Token may have expired');
          // Ici on pourrait implémenter un refresh token automatique
          // Pour l'instant, on laisse l'app rediriger vers login
        }

        throw error;
      }

      return data;
    } catch (error) {
      // Retry logic pour les erreurs réseau
      if (error instanceof TypeError && retryCount < MAX_RETRIES) {
        console.log(`Network error, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  // ========== AUTHENTICATION ==========

  /**
   * Vérifie que le token Firebase est valide
   */
  async verifyToken(): Promise<ApiResponse<AuthResponse>> {
    return this.request('/v1/auth/verify', {
      method: 'POST',
    });
  }

  /**
   * Récupère le profil de l'utilisateur actuel
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/v1/auth/me', {
      method: 'GET',
    });
  }

  /**
   * Récupère le profil d'un utilisateur
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request(`/v1/auth/user/${userId}`, {
      method: 'GET',
    });
  }

  // ========== EXAMS ==========

  /**
   * Soumet un résultat d'examen
   */
  async submitExam(
    submission: ExamSubmission
  ): Promise<ApiResponse<ExamResult>> {
    return this.request('/v1/exams/submit', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  /**
   * Récupère l'historique des examens
   */
  async getExamHistory(): Promise<ApiResponse<ExamResult[]>> {
    return this.request('/v1/exams/history', {
      method: 'GET',
    });
  }

  /**
   * Récupère l'historique des examens pour un module
   */
  async getModuleExamHistory(
    moduleId: string
  ): Promise<ApiResponse<ExamResult[]>> {
    return this.request(`/v1/exams/history/${moduleId}`, {
      method: 'GET',
    });
  }

  /**
   * Récupère le meilleur score pour un module
   */
  async getBestModuleScore(
    moduleId: string
  ): Promise<ApiResponse<ExamResult>> {
    return this.request(`/v1/exams/best/${moduleId}`, {
      method: 'GET',
    });
  }

  /**
   * Récupère les statistiques d'examen
   */
  async getExamStats(): Promise<ApiResponse<ExamStats>> {
    return this.request('/v1/exams/stats', {
      method: 'GET',
    });
  }

  // ========== ARTICLES ==========

  /**
   * Récupère tous les articles publiés
   */
  async getAllArticles(limit: number = 10): Promise<ApiResponse<Article[]>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    return this.request(`/v1/articles?${params}`, {
      method: 'GET',
    });
  }

  /**
   * Récupère un article par son slug
   */
  async getArticleBySlug(slug: string): Promise<ApiResponse<Article>> {
    return this.request(`/v1/articles/${slug}`, {
      method: 'GET',
    });
  }

  /**
   * Récupère les articles par catégorie
   */
  async getArticlesByCategory(
    category: string,
    limit: number = 10
  ): Promise<ApiResponse<Article[]>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    return this.request(`/v1/articles/category/${category}?${params}`, {
      method: 'GET',
    });
  }

  // ========== HEALTH ==========

  /**
   * Vérifie la santé du backend
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/v1/health', {
      method: 'GET',
    });
  }
}

/**
 * Classe personnalisée pour les erreurs API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

// Instance globale du client API
export const apiClient = new ApiClient(API_BASE_URL);

// ========== HELPER FUNCTIONS ==========

/**
 * Vérifie si on peut se connecter au backend
 */
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const response = await apiClient.healthCheck();
    return response.success;
  } catch (error) {
    console.error('Backend not available:', error);
    return false;
  }
}

/**
 * Format la réponse API pour affichage
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
