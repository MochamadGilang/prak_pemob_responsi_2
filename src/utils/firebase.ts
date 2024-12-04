// src/utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
apiKey: "AIzaSyBF6gcbn_UuhV7u_bC2lSf-QUOq1jRGpL0",

  authDomain: "vue-firebase-11f89.firebaseapp.com",

  projectId: "vue-firebase-11f89",

  storageBucket: "vue-firebase-11f89.firebasestorage.app",

  messagingSenderId: "747790111316",

  appId: "1:747790111316:web:35809f424b8559eb6893c1"

};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();

// modifikasi src/utils/firebase.ts
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(firebase);

export { auth, googleProvider, db };