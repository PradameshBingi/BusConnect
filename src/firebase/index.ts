
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';
import { getMessaging, type Messaging } from 'firebase/messaging';

import { firebaseConfig } from './config';

export {
  FirebaseProvider,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useAnalytics,
  useMessaging
} from './provider';

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;
let analytics: Analytics | undefined;
let messaging: Messaging | undefined;

function initializeFirebase() {
  if (!firebaseConfig.apiKey) {
    throw new Error("Missing Firebase API Key");
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  firestore = getFirestore(app);
  auth = getAuth(app);
  
  if (typeof window !== 'undefined') {
    isSupported().then(supported => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
        } catch (e) {
          console.warn("Analytics initialization failed");
        }
      }
    });
    
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn("Firebase Messaging not supported in this environment");
    }
  }

  return { app, firestore, auth, analytics, messaging };
}

export { initializeFirebase };
