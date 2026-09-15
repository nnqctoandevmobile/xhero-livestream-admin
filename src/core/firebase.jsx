import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-api-key-xhero-livestream",
  authDomain: import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain.firebaseapp.com",
  databaseURL: import.meta.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://dummy-db-url.firebaseio.com",
  projectId: import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-bucket.appspot.com",
  messagingSenderId: import.meta.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const rtdb = getDatabase(app);
