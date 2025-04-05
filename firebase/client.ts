// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCiCNJPBrrEo6TLjFGT8a8VkRnk9_a14hQ",
  authDomain: "varsityiq-57118.firebaseapp.com",
  projectId: "varsityiq-57118",
  storageBucket: "varsityiq-57118.firebasestorage.app",
  messagingSenderId: "844720832711",
  appId: "1:844720832711:web:393a19fbb68393425c3ee2",
  measurementId: "G-M30JTPKDVH"
};

// Initialize Firebase
const app = !getApps.length ?  initializeApp(firebaseConfig) : getApp();


export const auth = getAuth(app);

export const db = getFirestore(app);