'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';
import type { Messaging } from 'firebase/messaging';

export interface FirebaseContextValue {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  analytics?: Analytics;
  messaging?: Messaging;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({
  children,
  ...value
}: FirebaseContextValue & {
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
  // Safely return analytics without throwing, supporting Firebase as an optional service
  // This prevents build errors during Next.js prerendering
  return context?.analytics;
}

export function useMessaging() {
  const context = useContext(FirebaseContext);
  return context?.messaging;
}
