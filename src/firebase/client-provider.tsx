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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseConfig.apiKey) {
      try {
        const {app, firestore} = initializeFirebase();
        setFirebase({app, firestore});
      } catch (e: any) {
        console.error("Firebase initialization error:", e);
        setError(`Firebase initialization failed: ${e.message}`);
      }
    } else {
       console.warn("Firebase API Key is missing. Firebase features will be disabled.");
       setError("Firebase API Key is missing. Please check your .env file and ensure Firebase is set up correctly.");
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
        <div className="w-full max-w-lg p-6 bg-card border border-destructive rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-destructive mb-2">Firebase Configuration Error</h1>
          <p className="text-card-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">This usually happens when the Firebase environment variables (like `NEXT_PUBLIC_FIREBASE_API_KEY`) are not set correctly. Please ensure your Firebase project is properly configured.</p>
        </div>
      </div>
    );
  }

  if (!firebase) {
    // You can show a loading skeleton here while Firebase is initializing
    return null; 
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
