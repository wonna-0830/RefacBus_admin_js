// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5zG-0HbEPbR1GFmytjGLaxr8cvKVpXHQ",
  authDomain: "refacuserbus.firebaseapp.com",
  databaseURL: "https://refacuserbus-default-rtdb.firebaseio.com",
  projectId: "refacuserbus",
  storageBucket: "refacuserbus.firebasestorage.app",
  messagingSenderId: "162680522381",
  appId: "1:162680522381:web:e49cfa0bfb00ebe63b44c4",
  measurementId: "G-JZ4LBGHMB2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
getAnalytics(app); // analytics는 사용 안해도 되지만 있어도 괜찮아

// 필요한 기능 export
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
export const firestoreDb = getFirestore(app);
