import {initializeApp, getApp, getApps, type FirebaseApp} from 'firebase/app';
import {getFirestore, type Firestore} from 'firebase/firestore';

import {firebaseConfig} from './config';

export {
  FirebaseProvider,
  useFirebaseApp,
  useFirestore,
} from './provider';

let app: FirebaseApp;
let firestore: Firestore;

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
  } else {
    app = getApp();
    firestore = getFirestore(app);
  }
  return {app, firestore};
}

export {initializeFirebase};
