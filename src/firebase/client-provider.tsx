
'use client';

import {useEffect, useState} from 'react';
import type {FirebaseApp} from 'firebase/app';
import type {Firestore} from 'firebase/firestore';

import {initializeFirebase, FirebaseProvider} from '@/firebase';
import { firebaseConfig } from '@/firebase/config';

export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp;
    firestore: Firestore;
  } | null>(null);
  const [initAttempted, setInitAttempted] = useState(false);

  useEffect(() => {
    // Only attempt if API Key is present. If missing, we skip Firebase 
    // but still allow the rest of the app to function.
    if (firebaseConfig.apiKey) {
      try {
        const {app, firestore} = initializeFirebase();
        setFirebase({app, firestore});
      } catch (e: any) {
        console.error("Firebase initialization failed:", e.message);
      }
    } else {
       console.warn("Firebase API Key is missing. Firebase features will be disabled, but app will continue.");
    }
    setInitAttempted(true);
  }, []);

  if (!initAttempted) {
    // Return children but keep them wrapped to prevent layout shifts
    // During hydration/init we just render children directly.
    return <div className="contents">{children}</div>;
  }

  if (!firebase) {
    // If firebase failed or was skipped, still render children
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
