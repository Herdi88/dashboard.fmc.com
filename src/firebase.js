import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // ✅ Add this

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkEzsMzpvcNwfE68ruBoqLw6mO1k8NUKQ",
  authDomain: "callcenterdashboard9889.firebaseapp.com",
  projectId: "callcenterdashboard9889",
  storageBucket: "callcenterdashboard9889.appspot.com", // ✅ Fix extension to .app**spot**.com
  messagingSenderId: "806146798540",
  appId: "1:806146798540:web:d5473100500274eb842369",
  measurementId: "G-GR1KKWD52V",
};

// ✅ Initialize app and services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // ✅ Initialize storage

// ✅ Export everything needed
export { db, auth, app, storage };
