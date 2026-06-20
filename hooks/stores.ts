/**
 * Zustand Stores pour Syllabix
 * Gestion globale de l'état de l'application
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, ExamStats } from '@/types';
import { apiClient } from './api';

// ========== AUTHENTICATION STORE ==========

interface AuthState {
  // État
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,

        setUser: (user) => {
          set({
            user,
            isAuthenticated: !!user,
            error: null,
          });
        },

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        },

        refreshUser: async () => {
          set({ isLoading: true });
          try {
            const response = await apiClient.getCurrentUser();
            if (response.success && response.data) {
              set({
                user: response.data,
                isAuthenticated: true,
                error: null,
              });
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to refresh user',
              isAuthenticated: false,
            });
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ user: state.user }),
      }
    )
  )
);

// ========== EXAM STATS STORE ==========

interface ExamStatsState {
  // État
  stats: ExamStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setStats: (stats: ExamStats | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchStats: () => Promise<void>;
  reset: () => void;
}

export const useExamStatsStore = create<ExamStatsState>()(
  devtools(
    persist(
      (set) => ({
        stats: null,
        isLoading: false,
        error: null,

        setStats: (stats) => set({ stats, error: null }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        fetchStats: async () => {
          set({ isLoading: true });
          try {
            const response = await apiClient.getExamStats();
            if (response.success && response.data) {
              set({
                stats: response.data,
                error: null,
              });
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch stats',
            });
          } finally {
            set({ isLoading: false });
          }
        },

        reset: () => {
          set({
            stats: null,
            error: null,
          });
        },
      }),
      {
        name: 'exam-stats-store',
      }
    )
  )
);

// ========== EXAM SESSION STORE ==========

interface ExamSessionState {
  // État
  isActive: boolean;
  examType: 'CERTIFICATION' | 'TRAINING';
  moduleId: string | null;
  timeRemaining: number;
  currentQuestionIndex: number;
  answers: Record<string, number>; // questionId -> answerIndex

  // Actions
  startExam: (examType: 'CERTIFICATION' | 'TRAINING', moduleId?: string) => void;
  endExam: () => void;
  setTimeRemaining: (time: number) => void;
  goToQuestion: (index: number) => void;
  answerQuestion: (questionId: string, answerIndex: number) => void;
  reset: () => void;
}

export const useExamSessionStore = create<ExamSessionState>()(
  devtools((set) => ({
    isActive: false,
    examType: 'TRAINING',
    moduleId: null,
    timeRemaining: 0,
    currentQuestionIndex: 0,
    answers: {},

    startExam: (examType, moduleId) =>
      set({
        isActive: true,
        examType,
        moduleId: moduleId || null,
        currentQuestionIndex: 0,
        answers: {},
      }),

    endExam: () =>
      set({
        isActive: false,
      }),

    setTimeRemaining: (time) => set({ timeRemaining: time }),

    goToQuestion: (index) => set({ currentQuestionIndex: index }),

    answerQuestion: (questionId, answerIndex) =>
      set((state) => ({
        answers: {
          ...state.answers,
          [questionId]: answerIndex,
        },
      })),

    reset: () =>
      set({
        isActive: false,
        examType: 'TRAINING',
        moduleId: null,
        timeRemaining: 0,
        currentQuestionIndex: 0,
        answers: {},
      }),
  }))
);

// ========== UI STATE STORE ==========

interface UiState {
  // État
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>;

  // Actions
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  addNotification: (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  ) => void;
  removeNotification: (id: string) => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: false,
        darkMode: false,
        notifications: [],

        toggleSidebar: () =>
          set((state) => ({
            sidebarOpen: !state.sidebarOpen,
          })),

        toggleDarkMode: () =>
          set((state) => ({
            darkMode: !state.darkMode,
          })),

        addNotification: (type, message) => {
          const id = Date.now().toString();
          set((state) => ({
            notifications: [
              ...state.notifications,
              { id, type, message },
            ],
          }));
          // Auto-remove après 5 secondes
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }));
          }, 5000);
        },

        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
      }),
      {
        name: 'ui-store',
      }
    )
  )
);
