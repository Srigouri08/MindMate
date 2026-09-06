import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5C4BiWIVeDaH0sTOxSZfzHgQumdrT9bE",
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