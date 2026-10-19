import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// The "lite" Firestore SDK only does one-time reads and writes (no live listeners, no offline cache).
// That is all this app needs, and it roughly halves the JavaScript the browser downloads.
import { getFirestore } from 'firebase/firestore/lite';

// The web config is public by design: it only tells the SDK which project to talk to.
// What protects the data is firestore.rules, not this object.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app && getAuth(app);
export const db = app && getFirestore(app);
