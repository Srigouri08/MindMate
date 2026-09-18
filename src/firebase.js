import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Firebase web API keys are client-side configuration, not authentication secrets.
  // Prefer the Render/Vite environment variable, but keep the known project key as
  // a fallback so a missing Render env var does not make the entire React app crash.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD5C4BiWIVeDaH0sTOxSZfzHgQumdrT9bE",
  authDomain: "mindmate-2b226.firebaseapp.com",
  projectId: "mindmate-2b226",
  storageBucket: "mindmate-2b226.firebasestorage.app",
  messagingSenderId: "796027601091",
  appId: "1:796027601091:web:36cbdb26841972afe86276",
  measurementId: "G-N8BFN7J3E9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
