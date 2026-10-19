import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore/lite';
import { db } from '../firebase.js';

// Firestore layout:
//   words/{wordId}                  → the shared word list (anyone reads, admins write)
//   users/{uid}/progress/{wordId}   → one learner's box and due date per word
//   admins/{uid}                    → an empty document that marks a user as admin

export async function fetchWords() {
  const snapshot = await getDocs(query(collection(db, 'words'), orderBy('createdAt')));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchProgress(uid) {
  const snapshot = await getDocs(collection(db, 'users', uid, 'progress'));
  const byId = {};
  snapshot.forEach((d) => {
    byId[d.id] = d.data();
  });
  return byId;
}

export function saveProgress(uid, wordId, { box, due }) {
  return setDoc(doc(db, 'users', uid, 'progress', wordId), {
    box,
    due,
    updatedAt: serverTimestamp(),
  });
}

export async function isAdmin(uid) {
  const snapshot = await getDoc(doc(db, 'admins', uid));
  return snapshot.exists();
}

export function addWord({ ar, translit, en, dialect }) {
  return addDoc(collection(db, 'words'), {
    ar,
    translit,
    en,
    dialect,
    createdAt: serverTimestamp(),
  });
}

// One batch = all words are saved together, or none are.
export function importStarterWords(words) {
  const batch = writeBatch(db);
  for (const { id, ...word } of words) {
    batch.set(doc(db, 'words', id), { ...word, createdAt: serverTimestamp() });
  }
  return batch.commit();
}
