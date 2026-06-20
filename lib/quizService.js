import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { quizData as localQuizData } from '@/lib/quizData';

// Cache en mémoire pour éviter les lectures répétées
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Retourne tous les modules avec leurs questions.
 * Lit depuis Firestore si disponible, sinon utilise les données locales.
 */
export async function getAllModules() {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL) {
    return _cache;
  }

  try {
    const modulesSnap = await getDocs(collection(db, 'modules'));
    if (modulesSnap.empty) {
      return localQuizData;
    }

    const modules = [];
    for (const moduleDoc of modulesSnap.docs) {
      const moduleData = moduleDoc.data();
      const questionsSnap = await getDocs(
        query(collection(db, 'modules', moduleDoc.id, 'questions'), orderBy('order', 'asc'))
      );
      const questions = questionsSnap.docs.map((q) => q.data());
      modules.push({ ...moduleData, questions });
    }

    // Trier par id de module
    modules.sort((a, b) => a.id - b.id);

    _cache = modules;
    _cacheTime = now;
    return modules;
  } catch (err) {
    console.warn('quizService: Firestore indisponible, utilisation des données locales.', err.message);
    return localQuizData;
  }
}

/**
 * Retourne un module par son id (0-6).
 */
export async function getModuleById(moduleId) {
  try {
    const moduleRef = doc(db, 'modules', String(moduleId));
    const moduleSnap = await getDoc(moduleRef);
    if (!moduleSnap.exists()) {
      return localQuizData.find((m) => m.id === moduleId) ?? null;
    }
    const moduleData = moduleSnap.data();
    const questionsSnap = await getDocs(
      query(collection(db, 'modules', String(moduleId), 'questions'), orderBy('order', 'asc'))
    );
    const questions = questionsSnap.docs.map((q) => q.data());
    return { ...moduleData, questions };
  } catch (err) {
    console.warn('quizService: erreur Firestore, fallback local.', err.message);
    return localQuizData.find((m) => m.id === moduleId) ?? null;
  }
}

/**
 * Retourne toutes les questions de tous les modules, à plat.
 */
export async function getAllQuestions() {
  const modules = await getAllModules();
  return modules.flatMap((m) =>
    m.questions.map((q) => ({ ...q, moduleId: m.id, moduleName: m.module }))
  );
}

/**
 * Retourne les questions d'un module donné.
 */
export async function getQuestionsByModule(moduleId) {
  const mod = await getModuleById(moduleId);
  return mod?.questions ?? [];
}

/**
 * Invalide le cache (utile après une mise à jour admin).
 */
export function invalidateCache() {
  _cache = null;
  _cacheTime = 0;
}
