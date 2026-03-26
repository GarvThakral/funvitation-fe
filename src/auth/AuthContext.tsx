import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase-client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const auth = firebaseAuth;
const googleProvider = new GoogleAuthProvider();
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe = () => undefined;

    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.warn('Failed to apply local auth persistence.', error);
      }

      if (!isMounted) {
        return;
      }

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    };

    void initAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        if (!auth) throw new Error('Firebase Auth is not configured');
        await signInWithEmailAndPassword(auth, email, password);
      },
      signInWithGoogle: async () => {
        if (!auth) throw new Error('Firebase Auth is not configured');
        await signInWithPopup(auth, googleProvider);
      },
      signUp: async (email, password) => {
        if (!auth) throw new Error('Firebase Auth is not configured');
        await createUserWithEmailAndPassword(auth, email, password);
      },
      signOut: async () => {
        if (!auth) throw new Error('Firebase Auth is not configured');
        await firebaseSignOut(auth);
      },
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
