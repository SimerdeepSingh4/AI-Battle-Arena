import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth = null;
let googleProvider = null;
let githubProvider = null;
let isMockAuth = false;

// Check if critical client config is missing
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn("⚠️ Firebase configurations (VITE_FIREBASE_API_KEY, etc.) are missing.");
  console.warn("⚠️ Starting Frontend in MOCK AUTH MODE.");
  isMockAuth = true;
} else {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
  } catch (error) {
    console.error("❌ Error initializing Firebase Client SDK:", error);
    console.warn("⚠️ Falling back to MOCK AUTH MODE.");
    isMockAuth = true;
  }
}

export { auth, googleProvider, githubProvider, isMockAuth };
