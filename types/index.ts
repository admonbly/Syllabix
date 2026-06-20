/**
 * Types Typescript pour l'application Syllabix
 */

// ========== AUTHENTICATION ==========
export interface User {
  userId: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
  token?: string;
  user?: User;
}

export interface TokenVerification {
  valid: boolean;
  userId?: string;
  email?: string;
  expiresAt?: number;
}

// ========== EXAMS & QUIZ ==========
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number; // Index
  moduleId: string;
  category?: string;
  difficulty?: number;
  explanation?: string;
}

export interface Answer {
  questionId: string;
  userAnswerIndex: number;
  timeSpentSeconds?: number;
}

export interface ExamSubmission {
  examId?: string;
  userId?: string;
  moduleId?: string | null;
  examType: 'CERTIFICATION' | 'TRAINING';
  answers: Answer[];
  score: number; // 0-100
  durationSeconds: number;
  passed?: boolean;
}

export interface ExamResult {
  examId: string;
  userId: string;
  moduleId?: string | null;
  examType: 'CERTIFICATION' | 'TRAINING';
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  submittedAt: string;
  durationSeconds: number;
  certificateId?: string;
}

export interface ExamStats {
  userId: string;
  totalExams: number;
  passedExams: number;
  averageScore: number;
  lastExamDate?: string;
}

// ========== ARTICLES ==========
export interface Article {
  articleId: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  featuredImage?: string;
  readingTimeMinutes?: number;
}

// ========== API RESPONSES ==========
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

// ========== MODULE CONFIG ==========
export interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  icon?: string;
  questionsCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const MODULES: ModuleConfig[] = [
  {
    id: '0',
    title: 'Informatique Générale',
    description: 'Les bases de l\'informatique et des ordinateurs',
    difficulty: 'easy',
    questionsCount: 30,
  },
  {
    id: '1',
    title: 'Internet & Google',
    description: 'Navigation web et recherche Google',
    difficulty: 'easy',
    questionsCount: 30,
  },
  {
    id: '2',
    title: 'Email',
    description: 'Communication par email',
    difficulty: 'easy',
    questionsCount: 30,
  },
  {
    id: '3',
    title: 'Bureautique',
    description: 'Word, Excel, Powerpoint',
    difficulty: 'medium',
    questionsCount: 30,
  },
  {
    id: '4',
    title: 'Cybersécurité',
    description: 'Sécurité en ligne et protection des données',
    difficulty: 'hard',
    questionsCount: 30,
  },
  {
    id: '5',
    title: 'Intelligence Artificielle',
    description: 'Introduction à l\'IA et ses applications',
    difficulty: 'hard',
    questionsCount: 30,
  },
  {
    id: '6',
    title: 'Employabilité',
    description: 'Compétences numériques pour l\'emploi',
    difficulty: 'medium',
    questionsCount: 30,
  },
];

export const EXAM_CONFIG = {
  TRAINING: {
    QUESTIONS_COUNT: 5,
    DURATION: 600, // 10 minutes
    SHOW_FEEDBACK: true,
    SAVE_RESULTS: false,
    ISSUE_CERTIFICATE: false,
  },
  CERTIFICATION: {
    QUESTIONS_COUNT: 35,
    DURATION: 2100, // 35 minutes
    SHOW_FEEDBACK: false,
    SAVE_RESULTS: true,
    ISSUE_CERTIFICATE: true,
    MIN_PASS_SCORE: 60,
  },
};

// ========== DASHBOARD ==========
export interface DashboardData {
  user: User;
  stats: ExamStats;
  recentExams: ExamResult[];
  certificates: ExamResult[];
}
