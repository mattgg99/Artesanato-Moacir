// js/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Exemplos:
// protegerPagina("vendedor", ...)               -> só vendedor
// protegerPagina(["cliente", "vendedor"], ...)  -> cliente e vendedor
export function protegerPagina(tiposPermitidos, aoCarregar) {
  const permitidos = Array.isArray(tiposPermitidos) ? tiposPermitidos : [tiposPermitidos];

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    const tipo = snap.data()?.tipo;

    if (!permitidos.includes(tipo)) {
      location.href = "index.html";
      return;
    }
    aoCarregar(user, tipo);
  });
}
