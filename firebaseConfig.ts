import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRnRHR25zkfrv4eZ_QBvmCfobSXnJVM0s",
  authDomain: "eventapp-fd016.firebaseapp.com",
  projectId: "eventapp-fd016",
  storageBucket: "eventapp-fd016.firebasestorage.app",
  messagingSenderId: "541518153179",
  appId: "1:541518153179:web:8bd118a75c9ea59d5593fe",
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };