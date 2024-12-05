import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCs7U4Z5gHoFWAfV2xW4RL-xM2bq3Fszvk",
  authDomain: "degen-poker-app.firebaseapp.com",
  projectId: "degen-poker-app",
  storageBucket: "degen-poker-app.firebasestorage.app",
  messagingSenderId: "1068273819914",
  appId: "1:1068273819914:web:42a380c4a63b06763c9af3",
  measurementId: "G-MKZSZJXB35"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

//export { db, auth, doc, getDoc, setDoc, updateDoc };