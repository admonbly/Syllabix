import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { quizData as localQuizData } from '@/lib/quizData';

// IDs des modules connus (0 à 6)
const MODULE_IDS = ['0', '1', '2', '3', '4', '5', '6'];

// Cache global : tous les modules avec leurs questions Firestore
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function isCacheValid() {
  return _cache !== null && Date.now() - _cacheTime < CACHE_TTL;
}

/**
 * Charge toutes les questions depuis Firestore directement via les sous-collections,
 * sans dépendre de l'existence d'un document module parent.
 * Résultat mis en cache 10 minutes.
 */
export async function getAllModules() {
  if (isCacheValid()) return _cache;

  try {
    const modules = await Promise.all(
      MODULE_IDS.map(async (moduleId) => {
        const localModule = localQuizData.find((m) => m.id === parseInt(moduleId));

        try {
          const questionsSnap = await getDocs(
            query(
              collection(db, 'modules', moduleId, 'questions'),
              orderBy('order', 'asc')
            )
          );

          if (questionsSnap.empty) {
            // Sous-collection vide → fallback local pour ce module
            return localModule ?? null;
          }

          return {
            // Métadonnées du module depuis le fichier local (nom, description…)
            ...(localModule ?? {}),
            id: parseInt(moduleId),
            questions: questionsSnap.docs.map((q) => ({ ...q.data(), id: q.id })),
          };
        } catch {
          // Erreur Firestore pour ce module → fallback local
          return localModule ?? null;
        }
      })
    );

    const validModules = modules.filter(Boolean);

    if (validModules.length === 0) return localQuizData;

    _cache = validModules;
    _cacheTime = Date.now();
    return _cache;
  } catch (err) {
    console.warn('quizService: Firestore indisponible, fallback local.', err.message);
    return localQuizData;
  }
}

/**
 * Retourne un module par son id — utilise le cache, zéro requête supplémentaire.
 */
export async function getModuleById(moduleId) {
  const modules = await getAllModules();
  return modules.find((m) => m.id === parseInt(moduleId)) ?? null;
}

/**
 * Toutes les questions à plat.
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
 * Invalide le cache (après un nouveau seed ou une mise à jour admin).
 */
export function invalidateCache() {
  _cache = null;
  _cacheTime = 0;
}
