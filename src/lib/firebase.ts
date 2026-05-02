// Firebase client (browser-safe; web config is publishable)
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_Rq-AUPShO_k7ozCRKKCx25ieqm_kc0g",
  authDomain: "farm-fresh-direct-de299.firebaseapp.com",
  projectId: "farm-fresh-direct-de299",
  storageBucket: "farm-fresh-direct-de299.firebasestorage.app",
  messagingSenderId: "1003930835815",
  appId: "1:1003930835815:web:67816c90c9a34ffcaeadc2",
  measurementId: "G-BEHTY1CLCR",
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
