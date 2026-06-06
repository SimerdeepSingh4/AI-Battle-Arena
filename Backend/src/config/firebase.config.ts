import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Handle escaped newlines in private key
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

let isMockAuth = false;
let db: admin.firestore.Firestore | null = null;

if (!projectId || !clientEmail || !privateKey) {
  console.warn(
    '⚠️ Firebase configurations (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are missing.'
  );
  console.warn('⚠️ Starting Backend in MOCK AUTH MODE. User limits will be handled in memory.');
  isMockAuth = true;
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    db = admin.firestore();
    console.log('🛡️ Firebase Admin successfully initialized. Firestore is active.');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    console.warn('⚠️ Falling back to MOCK AUTH MODE.');
    isMockAuth = true;
  }
}

export { admin, db, isMockAuth };
