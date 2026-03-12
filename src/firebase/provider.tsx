'use client';

import {createContext, useContext} from 'react';
import type {FirebaseApp} from 'firebase/app';
import type {Firestore} from 'firebase/firestore';

const FirebaseContext = createContext<{
  app: FirebaseApp;
  firestore: Firestore;
} | null>(null);

export function FirebaseProvider({
  children,
  ...value
}: {
  app: FirebaseApp;
  firestore: Firestore;
  children: React.ReactNode;
}) {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseApp() {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.app;
}

export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
}
