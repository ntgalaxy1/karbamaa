import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isOfflineError =
    errMsg.includes('client is offline') ||
    errMsg.includes('Could not reach Cloud Firestore backend') ||
    errMsg.includes('unavailable') ||
    errMsg.includes('failed-precondition');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };

  if (isOfflineError) {
    console.warn('[Firestore Offline Mode] Operating with local cache & IndexedDB:', JSON.stringify(errInfo));
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot safely without throwing unhandled exceptions or console errors
export async function testFirestoreConnection() {
  try {
    const probePromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore probe timeout')), 4000)
    );
    await Promise.race([probePromise, timeoutPromise]);
    console.log('Firestore connection verified successfully.');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('[Firestore Initial Connection] App operating in resilient offline/cache mode:', msg);
  }
}

// Execute connection test on import
testFirestoreConnection();
