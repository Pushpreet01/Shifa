import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, Timestamp, connectFirestoreEmulator, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

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
const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log("Persistence can only be enabled in one tab at a time.");
  } else if (err.code === 'unimplemented') {
    console.log("The current browser does not support all of the features required to enable persistence.");
  }
});

if (__DEV__) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log("Connected to Firebase Emulators");
  } catch (e) {
    console.log("Emulator connection error", e);
  }
}

export { db, Timestamp, auth };