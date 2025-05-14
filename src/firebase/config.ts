// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZii_8SQwkdzKaRAT4lJZ-zgED8EduzgA",
  authDomain: "tgbot-29e30.firebaseapp.com",
  projectId: "tgbot-29e30",
  storageBucket: "tgbot-29e30.firebasestorage.app",
  messagingSenderId: "72277336797",
  appId: "1:72277336797:web:389b024ac1575c610eb134",
  measurementId: "G-HLKG4KF088"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { db, analytics };
export default app; 