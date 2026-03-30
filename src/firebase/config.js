/**
 * Firebase Configuration for Cuterus
 * Project: cuterus-b9bb2
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC5X3HrrhBtKgZYJ7Z8Bil6FIxX_DLMRQw",
  authDomain: "cuterus-b9bb2.firebaseapp.com",
  projectId: "cuterus-b9bb2",
  storageBucket: "cuterus-b9bb2.firebasestorage.app",
  messagingSenderId: "526353951272",
  appId: "1:526353951272:web:a02a7635563e24f88d231d",
  measurementId: "G-LKHN32FHFE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser, not during build)
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Firestore (database)
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export { app, analytics };
