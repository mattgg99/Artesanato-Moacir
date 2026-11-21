// js/auth.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("form-login");
const btnCadastrar = document.getElementById("btn-cadastrar");
const erro = document.getElementById("erro");

// Login
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.textContent = "";
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, senha.value);
    const snap = await getDoc(doc(db, "usuarios", cred.user.uid));
    const tipo = snap.data()?.tipo;
    location.href = tipo === "vendedor" ? "vendedor.html" : "cliente.html";
  } catch (err) {
    erro.textContent = "E-mail ou senha incorretos.";
  }
});

// Cadastro (sempre cria cliente)
btnCadastrar.addEventListener("click", async () => {
  erro.textContent = "";
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, senha.value);
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      email: email.value,
      tipo: "cliente"
    });
    location.href = "cliente.html";
  } catch (err) {
    erro.textContent = "Não foi possível criar a conta: " + err.message;
  }
});
