// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyAhFJhlj089TNmFDuIa5iFLuLUtz6-Oowo",
  authDomain: "checkmate-reandlog.firebaseapp.com",
  projectId: "checkmate-reandlog",
  storageBucket: "checkmate-reandlog.appspot.com",
  messagingSenderId: "515150413780",
  appId: "1:515150413780:web:ab8389d59f5a0b4add2041",
  measurementId: "G-WBLWMBRKD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const firestore = getFirestore(app);

// Export app if needed
export default app;
