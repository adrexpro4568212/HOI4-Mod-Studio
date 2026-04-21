// ─── Firebase Service Configuration ──────────────────────────────────────────
// HOI4 Mod Studio — Firebase Integration
// Project: hoi4-mod-studio

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';

export type { User };

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  setLogLevel,
} from 'firebase/firestore';
import { getAI, getGenerativeModel } from 'firebase/ai';

// ─── Config ───────────────────────────────────────────────────────────────────

const firebaseConfig = {
  projectId: 'hoi4-mod-studio',
  appId: '1:257070960348:web:2b4df1c30f3e30a638ee19',
  storageBucket: 'hoi4-mod-studio.firebasestorage.app',
  apiKey: 'AIzaSyB2LoUAnyH2dSsR2GnS1w_y-zsqWVXmV6I',
  authDomain: 'hoi4-mod-studio.firebaseapp.com',
  messagingSenderId: '257070960348',
};

// Avoid re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Safe initialization of services
let dbInstance;
try {
  dbInstance = getFirestore(app);
  // Suppress verbose Firestore logs (Database not found spams)
  setLogLevel('error');
} catch (e) {
  console.warn('[Firebase] Firestore initialization failed:', e);
}

export const db = dbInstance;
export const storage = getStorage(app);
export const auth = getAuth(app);

let aiInstance;
try {
  aiInstance = getAI(app);
} catch (e) {
  console.warn("[Firebase] AI initialization failed:", e);
}
export const ai = aiInstance;

// Use gemini-2.0-flash for speed/efficiency
let generativeModel;
try {
  if (ai) {
    generativeModel = getGenerativeModel(ai, { 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });
  }
} catch (e) {
  console.warn("[Firebase] Generative model initialization failed:", e);
}

export const model = generativeModel;
export const isCloudEnabled = !!db && !!ai;

console.log(`[Firebase] Initialized for project: ${firebaseConfig.projectId}`);

// ─── Auth ─────────────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(res.user, { displayName: name });
  return res.user;
};

export const loginWithEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const resetPassword = (email: string) => 
  sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);
export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// ─── Firestore helpers ────────────────────────────────────────────────────────

/** Save the full mod store snapshot for a user */
export async function saveProjectToCloud(uid: string, projectData: Record<string, unknown>) {
  if (!db) {
    console.warn("[Firebase] Firestore is not initialized. Skipping cloud save.");
    return;
  }
  try {
    const projectRef = doc(db, 'users', uid, 'projects', 'default');
    await setDoc(projectRef, {
      ...projectData,
      lastSaved: serverTimestamp(),
    });
    console.log(`[Firebase] Project saved successfully for user: ${uid}`);
  } catch (error) {
    console.error(`[Firebase] Error saving project:`, error);
    throw error;
  }
}

/** Load the saved project snapshot for a user */
export async function loadProjectFromCloud(uid: string): Promise<Record<string, unknown> | null> {
  if (!db) return null;
  try {
    const projectRef = doc(db, 'users', uid, 'projects', 'default');
    const snap = await getDoc(projectRef);
    if (!snap.exists()) return null;
    console.log(`[Firebase] Project loaded successfully for user: ${uid}`);
    return snap.data() as Record<string, unknown>;
  } catch (error) {
    console.error(`[Firebase] Error loading project:`, error);
    throw error;
  }
}

/** Delete saved project */
export async function deleteProjectFromCloud(uid: string) {
  if (!db) {
    console.warn('[Firebase] Firestore is not initialized. Skipping delete.');
    return;
  }
  const docRef = doc(db, 'users', uid, 'projects', 'default');
  await deleteDoc(docRef);
}

/** Fetch public community templates */
export async function fetchCommunityTemplates(maxCount = 20) {
  if (!db) return [];
  const q = query(
    collection(db, 'templates'),
    orderBy('createdAt', 'desc'),
    limit(maxCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Share current project as a community template */
export async function shareAsTemplate(
  uid: string,
  displayName: string,
  templateData: Record<string, unknown>
) {
  if (!db) throw new Error("Cloud features are disabled");
  try {
    const templateRef = doc(collection(db, 'templates'));
    await setDoc(templateRef, {
      authorUid: uid,
      authorName: displayName,
      createdAt: serverTimestamp(),
      ...templateData,
    });
    console.log(`[Firebase] Template shared: ${templateRef.id}`);
    return templateRef.id;
  } catch (error) {
    console.error(`[Firebase] Error sharing template:`, error);
    throw error;
  }
}

/** Fetch public changelog entries */
export async function fetchChangelog(maxCount = 10) {
  if (!db) return [];
  const q = query(
    collection(db, 'changelog'),
    orderBy('date', 'desc'),
    limit(maxCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

/** Upload a file (Blob/File) to a user's directory and return URL */
export async function uploadPortrait(uid: string, file: Blob | File, fileName: string): Promise<string> {
  try {
    const storageRef = ref(storage, `users/${uid}/portraits/${Date.now()}_${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    console.log(`[Firebase] File uploaded: ${url}`);
    return url;
  } catch (error) {
    console.error(`[Firebase] Error uploading file:`, error);
    throw error;
  }
}

/** Delete an image by its full URL */
export async function deleteImage(url: string) {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (e) {
    console.error("Error deleting image from storage:", e);
  }
}

/** Share a public snapshot of an exported mod */
export async function shareExportedMod(uid: string, modName: string, exportData: string) {
  if (!db) {
    console.warn('[Firebase] Firestore is not initialized. Cannot share mod.');
    throw new Error('Cloud features are disabled.');
  }
  const docRef = doc(collection(db, 'shared_mods'));
  await setDoc(docRef, {
    authorUid: uid,
    modName: modName,
    content: exportData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
