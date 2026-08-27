import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function getAdminApp() {
  if (!getApps().length) {
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn("Missing FIREBASE_PROJECT_ID - Firebase Admin not initialized");
      return null;
    }
    
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error: any) {
      console.error('Firebase admin initialization error', error.stack);
    }
  }
  return getApps()[0];
}

import { App } from 'firebase-admin/app';

export const getAdminAuth = () => {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin SDK failed to initialize. Check your Environment Variables.");
  return getAuth(app as App);
};

export const getAdminDb = () => {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin SDK failed to initialize. Check your Environment Variables.");
  return getFirestore(app as App);
};
