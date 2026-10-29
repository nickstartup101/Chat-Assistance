// js/kb/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDfPWpTCTuaUVwl_TNWAbNDToqIgLWC4Bs",
  authDomain: "chat-assistance-8cf77.firebaseapp.com",
  projectId: "chat-assistance-8cf77",
  storageBucket: "chat-assistance-8cf77.firebasestorage.app",
  messagingSenderId: "365797216726",
  appId: "1:365797216726:web:4666dda738d246fd6f5477",
  measurementId: "G-D15HFYCFMW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy 
};
