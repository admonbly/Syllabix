import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { quizData as localQuizData } from '@/lib/quizData';

// Cache global : tous les modules + leurs questions
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function isCacheValid() {
  return _cache !== null && Date.now() - _cacheTime < CACHE_TTL;
}

/**
 * Charge TOUS les modules avec leurs questions en parallèle (un seul appel par sous-collection).
 * Résultat mis en cache 10 minutes.
 */
export async function getAllModules() {
  if (isCacheValid()) return _cache;

  try {
    const modulesSnap = await getDocs(collection(db, 'modules'));
    if (modulesSnap.empty) return localQuizData;

    // Charge toutes les sous-collections questions en parallèle
    const modules = await Promise.all(
      modulesSnap.docs.map(async (moduleDoc) => {
        const questionsSnap = await getDocs(
          query(collection(db, 'modules', moduleDoc.id, 'questions'), orderBy('order', 'asc'))
        );
        return {
          ...moduleDoc.data(),
          questions: questionsSnap.docs.map((q) => ({ ...q.data(), id: q.id })),
        };
      })
    );

    modules.sort((a, b) => a.id - b.id);
    _cache = modules;
    _cacheTime = Date.now();
    return _cache;
  } catch (err) {
    console.warn('quizService: Firestore indisponible, fallback local.', err.message);
    return localQuizData;
  }
}

/**
 * Retourne un module par son id — utilise le cache global, pas de requête supplémentaire.
 */
export async function getModuleById(moduleId) {
  const modules = await getAllModules();
  return modules.find((m) => m.id === moduleId) ?? null;
}

/**
 * Toutes les questions à plat (tous modules confondus).
 */
export async function getAllQuestions() {
  const modules = await getAllModules();
  return modules.flatMap((m) =>
    m.questions.map((q) => ({ ...q, moduleId: m.id, moduleName: m.module }))
  );
}

/**
 * Questions d'un module donné.
 */
export async function getQuestionsByModule(moduleId) {
  const mod = await getModuleById(moduleId);
  return mod?.questions ?? [];
}

/**
 * Invalide le cache (après une mise à jour admin ou un nouveau seed).
 */
export function invalidateCache() {
  _cache = null;
  _cacheTime = 0;
}
