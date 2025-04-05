import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Type for Firebase Admin services
type FirebaseAdmin = {
  auth: ReturnType<typeof getAuth>;
  db: ReturnType<typeof getFirestore>;
  app: App;
};

// Global variable to cache Firebase Admin instance
let firebaseAdminInstance: FirebaseAdmin | null = null;

const createFirebaseAdmin = (): FirebaseAdmin => {
  // Validate environment variables
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Missing FIREBASE_PROJECT_ID environment variable");
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error("Missing FIREBASE_CLIENT_EMAIL environment variable");
  }
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error("Missing FIREBASE_PRIVATE_KEY environment variable");
  }

  // Initialize the Firebase Admin SDK
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
};

export const getFirebaseAdmin = (): FirebaseAdmin => {
  // Return cached instance if exists
  if (firebaseAdminInstance) return firebaseAdminInstance;

  // Check for existing initialized apps
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAdminInstance = {
      app: existingApps[0],
      auth: getAuth(existingApps[0]),
      db: getFirestore(existingApps[0]),
    };
    return firebaseAdminInstance;
  }

  // Create and cache new instance
  firebaseAdminInstance = createFirebaseAdmin();
  return firebaseAdminInstance;
};

// Export initialized services
export const { auth, db } = getFirebaseAdmin();