'use client';

import { useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';
import type { Messaging } from 'firebase/messaging';

import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from './provider';
import { firebaseConfig } from '@/firebase/config';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp | null;
    firestore: Firestore | null;
    auth: Auth | null;
    analytics?: Analytics;
    messaging?: Messaging;
  } | null>(null);
  const [initAttempted, setInitAttempted] = useState(false);

  useEffect(() => {
    if (firebaseConfig.apiKey) {
      try {
        const services = initializeFirebase();
        setFirebase(services);
      } catch (e: any) {
        console.error("Firebase initialization failed:", e.message);
        setFirebase({ app: null, firestore: null, auth: null });
      }
    } else {
      setFirebase({ app: null, firestore: null, auth: null });
    }
    setInitAttempted(true);
  }, []);

  // Always render the provider even if firebase is null to avoid context errors
  const value = firebase || { app: null, firestore: null, auth: null };

  return (
    <FirebaseProvider
      app={value.app}
      firestore={value.firestore}
      auth={value.auth}
      analytics={value.analytics}
      messaging={value.messaging}
    >
      {children}
    </FirebaseProvider>
  );
}
