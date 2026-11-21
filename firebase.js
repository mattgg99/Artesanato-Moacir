// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cole aqui o objeto firebaseConfig copiado no console
const firebaseConfig = {
  apiKey: "AIzaSyA5OfRWlsUCjPYhcjNf1lZ92Bnl3WG_wrM",
  authDomain: "artesanato-escola.firebaseapp.com",
  projectId: "artesanato-escola",
  storageBucket: "artesanato-escola.firebasestorage.app",
  messagingSenderId: "821078364462",
  appId: "1:821078364462:web:3fff35c5e4bfbb0626aabf"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);