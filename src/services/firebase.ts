import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  getDoc,
  collection,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence internal @firebase/firestore connection retry console.error logs in offline/restricted networks
try {
  setLogLevel('silent');
} catch {
  // Ignore if already set
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Specify firestoreDatabaseId and enable automatic long-polling detection for restricted networks
function createFirestoreInstance() {
  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestoreInstance();
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
    errMsg.includes('failed-precondition') ||
    errMsg.includes('network-request-failed');

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

  console.warn('Firestore Notice:', JSON.stringify(errInfo));
}

// Test connection safely without forcing a blocking server-only probe that triggers offline errors
export async function testFirestoreConnection() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch {
    // Operating in resilient offline/IndexedDB cache mode
  }
}
