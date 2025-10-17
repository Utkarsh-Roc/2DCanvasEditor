import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpi8ueAGCWG4MjHCd4A6xCxjxm0YgKvu4",
  authDomain: "canvas-editor-4239c.firebaseapp.com",
  projectId: "canvas-editor-4239c",
  storageBucket: "canvas-editor-4239c.firebasestorage.app",
  messagingSenderId: "237345111969",
  appId: "1:237345111969:web:71181dc8269b3c414655e0",
  measurementId: "G-TYKDFCBHCR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);