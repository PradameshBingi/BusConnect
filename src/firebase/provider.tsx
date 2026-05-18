
'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';
import type { Messaging } from 'firebase/messaging';

const FirebaseContext = createContext<{
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  analytics?: Analytics;
  messaging?: Messaging;
} | null>(null);

export function FirebaseProvider({
  children,
  ...value
}: {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  analytics?: Analytics;
  messaging?: Messaging;
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
  return context?.app;
}

export function useFirestore() {
  const context = useContext(FirebaseContext);
  return context?.firestore;
}

export function useAuth() {
  const context = useContext(FirebaseContext);
  return context?.auth;
}

export function useAnalytics() {
  const context = useContext(FirebaseContext);
  return context?.analytics;
}

export function useMessaging() {
  const context = useContext(FirebaseContext);
  return context?.messaging;
}
