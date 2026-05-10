import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: (window as any).__FIREBASE_CONFIG?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: (window as any).__FIREBASE_CONFIG?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (window as any).__FIREBASE_CONFIG?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (window as any).__FIREBASE_CONFIG?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (window as any).__FIREBASE_CONFIG?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (window as any).__FIREBASE_CONFIG?.appId || import.meta.env.VITE_FIREBASE_APP_ID,
};

// Avoid re-initializing on hot reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
