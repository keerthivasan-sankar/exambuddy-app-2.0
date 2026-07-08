import React, { createContext, useState, useEffect } from 'react';
import { User, Exam } from './types';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, addDoc, updateDoc } from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  updateUser: (updates: Partial<User>) => Promise<void>;
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'userId'>) => Promise<void>;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  updateUser: async () => {},
  exams: [],
  addExam: async () => {},
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    let unsubscribeExams: (() => void) | undefined;

    // Check for redirect errors
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect login error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Authentication failed: Your domain is not authorized. Please add it to your Firebase Console under Authentication > Settings > Authorized domains.");
      } else {
        alert("Authentication error: " + error.message);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeExams) unsubscribeExams();

      if (firebaseUser) {
        // Fetch or create user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            // Create default user profile
            const defaultUser: Omit<User, 'id'> = {
              name: firebaseUser.displayName || 'Anonymous User',
              mobile: '',
              gender: '',
              homeCity: '',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              verified: false,
              isOnline: true,
              lastActive: Date.now()
            };
            setDoc(userRef, defaultUser).then(() => {
              setUser({ id: firebaseUser.uid, ...defaultUser } as User);
            });
          }
        });

        // Set online status
        updateDoc(userRef, { isOnline: true, lastActive: Date.now() }).catch(() => {});

        const handleUnload = () => {
          updateDoc(userRef, { isOnline: false, lastActive: Date.now() }).catch(() => {});
        };
        window.addEventListener('beforeunload', handleUnload);

        // Listen to exams
        const q = query(collection(db, 'exams'), where('userId', '==', firebaseUser.uid));
        unsubscribeExams = onSnapshot(q, (snapshot) => {
          const loadedExams: Exam[] = [];
          snapshot.forEach((doc) => {
            loadedExams.push({ id: doc.id, ...doc.data() } as Exam);
          });
          setExams(loadedExams);
        });

        setLoading(false);
      } else {
        setUser(null);
        setExams([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeExams) unsubscribeExams();
    };
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      alert("Login failed: " + error.message);
    }
  };

  const logout = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { isOnline: false, lastActive: Date.now() });
      } catch (error) {
        console.error('Error setting offline status', error);
      }
    }
    await signOut(auth);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, updates);
  };

  const addExam = async (exam: Omit<Exam, 'id' | 'userId'>) => {
    if (!user) return;
    const examData = {
      ...exam,
      userId: user.id
    };
    await addDoc(collection(db, 'exams'), examData);
  };

  return (
    <AppContext.Provider value={{ user, updateUser, exams, addExam, loading, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};
