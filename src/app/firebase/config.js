// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkj8LLSALwoPJoXk7G9PwU4VnrYDXoCA0",
  authDomain: "vivelupamerica.firebaseapp.com",
  projectId: "vivelupamerica",
  storageBucket: "vivelupamerica.firebasestorage.app",
  messagingSenderId: "77705325971",
  appId: "1:77705325971:web:8d4cb0958e4d1ed7da0c66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };