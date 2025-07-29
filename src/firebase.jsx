// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCN82e4ls26Z0UrYCNkCoV3bjgs1f_Xpj8",
  authDomain: "expense-tracker-d5475.firebaseapp.com",
  projectId: "expense-tracker-d5475",
  storageBucket: "expense-tracker-d5475.firebasestorage.app",
  messagingSenderId: "296706724884",
  appId: "1:296706724884:web:d694eb9f0d9178c8584301",
  measurementId: "G-66WLN0FD11"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword };
