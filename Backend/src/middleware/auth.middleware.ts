import type { Request, Response, NextFunction } from 'express';
import { admin, db, isMockAuth } from '../config/firebase.config.js';

// Configuration: Daily battle limit per user
const DAILY_BATTLE_LIMIT = 5;

// In-memory store for local mock limits
interface MockLimit {
  battlesCount: number;
  lastResetDate: string;
}
const mockLimitsStore = new Map<string, MockLimit>();

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication is required. Please sign in to run a battle.'
    });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'Authentication token is empty.'
    });
  }

  let uid = '';
  let email = '';

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC

  // 1. Authentication Check
  if (isMockAuth || token.startsWith('mock-')) {
    // Mock authentication: extract data from token e.g. mock-token:uid:email
    if (token.startsWith('mock-')) {
      const parts = token.split(':');
      uid = parts[1] || 'mock-user-uid';
      email = parts[2] || 'mock-user@example.com';
    } else {
      uid = 'mock-user-uid';
      email = 'mock-user@example.com';
    }
    console.log(`[Auth-Mock] Authenticated user ${email} (UID: ${uid})`);
  } else {
    // Production Firebase Authentication
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      uid = decodedToken.uid;
      email = decodedToken.email || '';
    } catch (error: any) {
      console.error('[Auth-Error] Failed to verify Firebase token:', error.message);
      return res.status(401).json({
        error: 'Session expired or invalid token. Please sign in again.'
      });
    }
  }

  // Set user on request object
  req.user = { uid, email };

  // 2. Daily Battle Limits Rate Control
  if (isMockAuth || token.startsWith('mock-')) {
    // In-Memory limit tracking for local development
    const userLimit = mockLimitsStore.get(uid);

    if (!userLimit) {
      // First battle for this user
      mockLimitsStore.set(uid, { battlesCount: 1, lastResetDate: today });
    } else {
      if (userLimit.lastResetDate !== today) {
        // Reset count for a new day
        userLimit.battlesCount = 1;
        userLimit.lastResetDate = today;
      } else {
        // Check limit
        if (userLimit.battlesCount >= DAILY_BATTLE_LIMIT) {
          return res.status(429).json({
            error: `Daily limit reached. You have exhausted your daily quota of ${DAILY_BATTLE_LIMIT} battles. Try again tomorrow!`
          });
        }
        // Increment
        userLimit.battlesCount += 1;
      }
      mockLimitsStore.set(uid, userLimit);
    }
    console.log(`[Limit-Mock] User ${email} has run ${mockLimitsStore.get(uid)?.battlesCount}/${DAILY_BATTLE_LIMIT} battles today.`);
  } else {
    // Production Firestore limit tracking
    if (!db) {
      return res.status(500).json({
        error: 'Database error. Firebase Firestore is not initialized.'
      });
    }

    try {
      const userRef = db.collection('user_limits').doc(uid);
      const doc = await userRef.get();

      if (!doc.exists) {
        // First battle entry in Firestore
        await userRef.set({
          battlesCount: 1,
          lastResetDate: today,
          email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`[Limit-Firestore] Initialized usage document for ${email}.`);
      } else {
        const data = doc.data();
        if (!data) throw new Error('Document data is empty.');

        if (data.lastResetDate !== today) {
          // Reset count for a new day
          await userRef.update({
            battlesCount: 1,
            lastResetDate: today,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`[Limit-Firestore] Reset daily battles count for ${email}.`);
        } else {
          // Check limit
          if (data.battlesCount >= DAILY_BATTLE_LIMIT) {
            return res.status(429).json({
              error: `Daily limit reached. You have exhausted your daily quota of ${DAILY_BATTLE_LIMIT} battles. Try again tomorrow!`
            });
          }
          // Increment in Firestore
          await userRef.update({
            battlesCount: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`[Limit-Firestore] Incremented battles count for ${email}: ${data.battlesCount + 1}/${DAILY_BATTLE_LIMIT}`);
        }
      }
    } catch (error) {
      console.error('[Limit-Error] Firestore limit operation failed:', error);
      return res.status(500).json({
        error: 'Failed to evaluate usage limits. Please try again.'
      });
    }
  }

  next();
}
