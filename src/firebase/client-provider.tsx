
'use client';

import { useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';
import type { Messaging } from 'firebase/messaging';

import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
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
      }
    } else {
      console.warn("Firebase API Key is missing. Firebase supportive services will be disabled.");
    }
    setInitAttempted(true);
  }, []);

  if (!initAttempted) {
    return <div className="contents">{children}</div>;
  }

  if (!firebase) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      firestore={firebase.firestore}
      auth={firebase.auth}
      analytics={firebase.analytics}
      messaging={firebase.messaging}
    >
      {children}
    </FirebaseProvider>
  );
}
