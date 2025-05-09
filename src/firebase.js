// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxINe2Sk3bFN9r_YjBIFje7rvvSgTo0N0",
  authDomain: "david-c362f.firebaseapp.com",
  projectId: "david-c362f",
  storageBucket: "david-c362f.firebasestorage.app",
  messagingSenderId: "251313190956",
  appId: "1:251313190956:web:45dda40cc4f30f1b0c3989",
  measurementId: "G-1L3QYTYFP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };