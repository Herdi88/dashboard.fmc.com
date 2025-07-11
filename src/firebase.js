import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkEzsMzpvcNwfE68ruBoqLw6mO1k8NUKQ",
  authDomain: "callcenterdashboard9889.firebaseapp.com",
  projectId: "callcenterdashboard9889",
  storageBucket: "callcenterdashboard9889.firebasestorage.app",
  messagingSenderId: "806146798540",
  appId: "1:806146798540:web:d5473100500274eb842369",
  measurementId: "G-GR1KKWD52V",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
