import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase.js';

// Every visitor gets an anonymous Firebase account, so progress is saved per learner
// without a sign-up form. Firebase remembers it in the browser between visits.
export function useAnonymousUser() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (current) => {
      if (current) setUser(current);
      else signInAnonymously(auth).catch(setError);
    });
    return unsubscribe;
  }, []);

  return { user, error };
}
