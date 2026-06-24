import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDcBVIAy8Xe8lVSaOmUof7I5nBm73SVBX4",
  authDomain: "campus-docket.firebaseapp.com",
  projectId: "campus-docket",
  storageBucket: "campus-docket.firebasestorage.app",
  messagingSenderId: "473029701448",
  appId: "1:473029701448:web:c05a43dfdeab076f530d7d",
  measurementId: "G-56EBPV282H",
};

const requiredConfig = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

for (const key of requiredConfig) {
  if (!firebaseConfig[key]) {
    throw new Error(
      `Missing Firebase environment variable for ${key}. Update your .env file.`,
    );
  }
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
