// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
  export const auth = getAuth(app);

  export default app;
