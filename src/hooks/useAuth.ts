import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Called at startup, then every time the user changes
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);           // already signed in (remembered by AsyncStorage)
        setLoading(false);
      } else {
        // First launch: create an anonymous account
        signInAnonymously(auth).catch((e) => {
          setError(String(e));
          setLoading(false);
        });
      }
    });
    return unsubscribe;       // stop listening when the component disappears
  }, []);

  return { user, loading, error };
}