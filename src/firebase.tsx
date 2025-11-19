// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCF7EJaLOtO7GjVpunDw88_eWDWSB0543g",
  authDomain: "hyper-skill-backend.firebaseapp.com",
  projectId: "hyper-skill-backend",
  storageBucket: "hyper-skill-backend.appspot.com",   // ✅ FIXED
  messagingSenderId: "833837255453",
  appId: "1:833837255453:web:7e1b32bfc6c7bb128aaff4",
  measurementId: "G-5CKMHDKT6M"
};

// Initialize app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);   // ✅ Export storage

export default app;
