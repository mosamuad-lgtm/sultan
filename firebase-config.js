// Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsb_A_YmaPqfCTCv4O1Vanl2kl1b9ooJo",
  authDomain: "sultan-f08bb.firebaseapp.com",
  projectId: "sultan-f08bb",
  storageBucket: "sultan-f08bb.firebasestorage.app",
  messagingSenderId: "490818414636",
  appId: "1:490818414636:web:5478d9a521ec49ebb3c989",
  measurementId: "G-WLZD2LK8WK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
