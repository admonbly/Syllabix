import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
  signInWithPhoneNumber,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  arrayUnion,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ========== AUTHENTICATION ==========

export const authFunctions = {
  signUp: async (email, password, { firstName, lastName, role = 'LEARNER', dateOfBirth = null, parentalConsentGiven = false, phoneNumber = '' } = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: firstName && lastName ? `${firstName} ${lastName}` : firstName ?? '',
      });

      const userData = {
        email: user.email,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        displayName: firstName && lastName ? `${firstName} ${lastName}` : '',
        phoneNumber: phoneNumber ?? '',
        phoneVerified: false,
        emailVerified: false,
        role,
        createdAt: new Date().toISOString(),
      };

      if (dateOfBirth) {
        userData.dateOfBirth = dateOfBirth;
        userData.parentalConsentGiven = parentalConsentGiven;
        userData.parentalConsentAt = parentalConsentGiven ? new Date().toISOString() : null;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      await sendEmailVerification(user);

      document.cookie = 'syllabix_session=1; path=/; SameSite=Strict';

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Initialise le reCAPTCHA invisible requis par Firebase Phone Auth
  initRecaptcha: (containerId) => {
    if (typeof window === 'undefined') return null;
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
    });
    return window.recaptchaVerifier;
  },

  // Envoie le SMS de vérification au numéro donné
  sendPhoneSMS: async (phoneNumber, containerId = 'recaptcha-container') => {
    try {
      const recaptcha = authFunctions.initRecaptcha(containerId);
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptcha);
      return verificationId;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Confirme le code SMS et lie le numéro au compte
  confirmPhoneSMS: async (verificationId, code) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const user = auth.currentUser;
      await linkWithCredential(user, credential);
      // Marquer le téléphone comme vérifié dans Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        phoneVerified: true,
        phoneVerifiedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Met à jour emailVerified dans Firestore après vérification email
  markEmailVerified: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await user.reload();
      if (user.emailVerified) {
        await updateDoc(doc(db, 'users', user.uid), {
          emailVerified: true,
          emailVerifiedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('markEmailVerified:', error);
    }
  },

  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Cookie lu par middleware.ts pour protéger les routes côté serveur.
      // La vérification du token Firebase est faite par le backend Spring Boot.
      document.cookie = 'syllabix_session=1; path=/; SameSite=Strict';
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      document.cookie = 'syllabix_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getSession: async () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user);
      });
    });
  },

  // Connexion par numéro de téléphone — étape 1 : envoyer le SMS
  sendPhoneLoginSMS: async (phoneNumber, containerId = 'recaptcha-login') => {
    if (typeof window === 'undefined') return null;
    if (window.recaptchaLoginVerifier) {
      try { window.recaptchaLoginVerifier.clear(); } catch (_) {}
    }
    window.recaptchaLoginVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
    });
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaLoginVerifier);
    window._phoneConfirmationResult = confirmationResult;
    return confirmationResult;
  },

  // Connexion par numéro de téléphone — étape 2 : confirmer le code SMS
  confirmPhoneLogin: async (code) => {
    const confirmationResult = window._phoneConfirmationResult;
    if (!confirmationResult) throw new Error('Aucun code SMS en attente.');
    const result = await confirmationResult.confirm(code);
    document.cookie = 'syllabix_session=1; path=/; SameSite=Strict; Max-Age=604800';
    // Créer le profil Firestore si première connexion
    try {
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email ?? '',
          firstName: '',
          lastName: '',
          displayName: user.displayName ?? '',
          phoneNumber: user.phoneNumber ?? '',
          phoneVerified: true,
          emailVerified: false,
          role: 'LEARNER',
          createdAt: new Date().toISOString(),
          authProvider: 'phone',
        });
      }
    } catch (_) {}
    return result.user;
  },

  // Mettre à jour le profil utilisateur dans Firestore + Firebase Auth
  updateUserProfile: async (uid, { firstName, lastName, phoneNumber } = {}) => {
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (firstName !== undefined || lastName !== undefined) {
      const displayName = [firstName, lastName].filter(Boolean).join(' ');
      updates.displayName = displayName;
      const user = auth.currentUser;
      if (user) await updateProfile(user, { displayName });
    }
    await updateDoc(doc(db, 'users', uid), updates);
  },

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Cookie session en premier — la redirection ne dépend pas de Firestore
    document.cookie = 'syllabix_session=1; path=/; SameSite=Strict; Max-Age=604800';

    // Vérifier si le profil est complet (a une date de naissance)
    let profileComplete = false;
    try {
      const userRef  = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // Première connexion Google — profil minimal, complétion requise
        await setDoc(userRef, {
          email:         user.email,
          firstName:     user.displayName?.split(' ')[0] ?? '',
          lastName:      user.displayName?.split(' ').slice(1).join(' ') ?? '',
          displayName:   user.displayName ?? '',
          phoneNumber:   '',
          phoneVerified: false,
          emailVerified: true,
          role:          'LEARNER',
          createdAt:     new Date().toISOString(),
          authProvider:  'google',
          profileComplete: false,
        });
        profileComplete = false;
      } else {
        // Profil existant — complet si dateOfBirth est renseigné
        profileComplete = !!(userSnap.data().dateOfBirth);
        if (profileComplete) {
          document.cookie = 'syllabix_profile=1; path=/; SameSite=Strict; Max-Age=604800';
        }
      }
    } catch (firestoreError) {
      console.warn('Firestore profile check skipped:', firestoreError.message);
      // En cas d'erreur Firestore on laisse passer — mieux que bloquer
      profileComplete = true;
    }

    return { user, profileComplete };
  },
};

// ========== USER OPERATIONS ==========

export const userDB = {
  // Récupérer le profil complet d'un utilisateur (incluant le rôle)
  getUserProfile: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Sauvegarder la progression de l'utilisateur
  saveUserProgress: async (userId, moduleId, score, answers) => {
    try {
      const progressRef = doc(db, 'users', userId, 'progress', moduleId);
      await setDoc(progressRef, {
        moduleId,
        score,
        answers,
        completedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  },

  // Récupérer la progression de l'utilisateur
  getUserProgress: async (userId) => {
    try {
      const progressRef = collection(db, 'users', userId, 'progress');
      const snapshot = await getDocs(progressRef);
      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  },

  // Récupérer la progression pour un module spécifique
  getModuleProgress: async (userId, moduleId) => {
    try {
      const progressRef = doc(db, 'users', userId, 'progress', moduleId);
      const docSnap = await getDoc(progressRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting module progress:', error);
      throw error;
    }
  },

  // Obtenir les certificats de l'utilisateur
  getUserCertificates: async (userId) => {
    try {
      const certificatesRef = collection(db, 'users', userId, 'certificates');
      const snapshot = await getDocs(certificatesRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting certificates:', error);
      throw error;
    }
  },

  // Sauvegarder un certificat (dans la subcollection utilisateur + collection publique)
  saveCertificate: async (userId, certificateData) => {
    try {
      const certificatesRef = collection(db, 'users', userId, 'certificates');
      const docRef = doc(certificatesRef);
      const certData = { ...certificateData, createdAt: new Date().toISOString() };
      await setDoc(docRef, certData);
      // Collection publique pour la page de partage /certificate/[id]
      await setDoc(doc(db, 'certificates', docRef.id), { ...certData, userId });
      return docRef.id;
    } catch (error) {
      console.error('Error saving certificate:', error);
      throw error;
    }
  },

  // Sauvegarder la date de la dernière tentative de certification (cooldown)
  saveCertAttempt: async (userId, examKey) => {
    try {
      await setDoc(doc(db, 'users', userId, 'examAttempts', examKey), {
        lastAttemptAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving cert attempt:', error);
    }
  },

  // Récupérer la dernière tentative de certification
  getLastCertAttempt: async (userId, examKey) => {
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'examAttempts', examKey));
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      console.error('Error getting cert attempt:', error);
      return null;
    }
  },

  // Récupérer un certificat public par son ID (pour la page de partage)
  getPublicCertificate: async (certId) => {
    try {
      const snap = await getDoc(doc(db, 'certificates', certId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
      console.error('Error getting public certificate:', error);
      return null;
    }
  },

  // Attribuer un badge de module (idempotent — arrayUnion évite les doublons)
  saveBadge: async (userId, badge) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        badges: arrayUnion({
          moduleId:   badge.moduleId,
          moduleName: badge.moduleName,
          score:      badge.score,
          earnedAt:   new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error saving badge:', error);
    }
  },

  // Récupérer les badges d'un utilisateur
  getUserBadges: async (userId) => {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      return snap.exists() ? (snap.data().badges ?? []) : [];
    } catch (error) {
      console.error('Error getting badges:', error);
      return [];
    }
  },

  // ── Listeners temps réel (retournent une fonction unsubscribe) ──────────────

  subscribeToProgress: (userId, callback) => {
    const ref = collection(db, 'users', userId, 'progress');
    return onSnapshot(ref, (snap) => {
      callback(snap.docs.map((d) => d.data()));
    }, (err) => console.error('subscribeToProgress:', err));
  },

  subscribeToCertificates: (userId, callback) => {
    const ref = collection(db, 'users', userId, 'certificates');
    return onSnapshot(ref, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('subscribeToCertificates:', err));
  },

  subscribeToBadges: (userId, callback) => {
    const ref = doc(db, 'users', userId);
    return onSnapshot(ref, (snap) => {
      callback(snap.exists() ? (snap.data().badges ?? []) : []);
    }, (err) => console.error('subscribeToBadges:', err));
  },

  // ── Sessions d'entraînement et d'évaluation ─────────────────────────────────

  saveSession: async (userId, sessionData) => {
    try {
      const ref = collection(db, 'users', userId, 'sessions');
      await addDoc(ref, {
        ...sessionData,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  },

  getUserSessions: async (userId, limitCount = 20) => {
    try {
      const ref = collection(db, 'users', userId, 'sessions');
      const q = query(ref, orderBy('createdAt', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  },

  subscribeToSessions: (userId, callback, limitCount = 10) => {
    const ref = collection(db, 'users', userId, 'sessions');
    const q = query(ref, orderBy('createdAt', 'desc'), limit(limitCount));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('subscribeToSessions:', err));
  },
};

// ========== BLOG/ARTICLES OPERATIONS ==========

export const blogDB = {
  // Récupérer les articles
  getArticles: async (limitCount = 10) => {
    try {
      const articlesRef = collection(db, 'articles');
      const q = query(
        articlesRef,
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting articles:', error);
      return [];
    }
  },

  // Récupérer un article par slug
  getArticleBySlug: async (slug) => {
    try {
      const articlesRef = collection(db, 'articles');
      const q = query(articlesRef, where('slug', '==', slug));
      const snapshot = await getDocs(q);
      return snapshot.docs.length > 0 ? snapshot.docs[0].data() : null;
    } catch (error) {
      console.error('Error getting article by slug:', error);
      return null;
    }
  },

  // Peupler Firestore avec les articles par défaut (seulement si vide)
  seedArticles: async (articles) => {
    try {
      const articlesRef = collection(db, 'articles');
      const snapshot = await getDocs(articlesRef);
      if (!snapshot.empty) return; // Déjà peuplé
      for (const article of articles) {
        await setDoc(doc(articlesRef, article.slug), {
          ...article,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Seed error:', error);
    }
  },

  // Récupérer les articles par catégorie
  getArticlesByCategory: async (category, limitCount = 10) => {
    try {
      const articlesRef = collection(db, 'articles');
      const q = query(
        articlesRef,
        where('category', '==', category),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting articles by category:', error);
      return [];
    }
  },
};

// ========== UTILITY ==========

export const utils = {
  // Vérification synchrone — fiable uniquement après que Firebase a résolu l'état d'auth.
  // Préférer onAuthChange ou isAuthenticatedAsync dans les cas critiques.
  isAuthenticated: () => !!auth.currentUser,

  // Vérification asynchrone — attend la résolution de l'état Firebase avant de répondre.
  isAuthenticatedAsync: () =>
    new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(!!user);
      });
    }),

  // Obtenir l'utilisateur actuel
  getCurrentUser: () => auth.currentUser,

  // Écouter les changements d'authentification
  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
};
