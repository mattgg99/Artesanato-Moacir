// js/tema.js
const botao = document.getElementById("btn-tema");

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  botao.textContent = tema === "dark" ? "☀️" : "🌙";
}

// Carrega o tema salvo na última vez (ou o claro, se nunca escolheu)
aplicarTema(localStorage.getItem("tema") === "dark" ? "dark" : "light");

botao.addEventListener("click", () => {
  const atual = document.documentElement.getAttribute("data-theme");
  const novo = atual === "dark" ? "light" : "dark";
  localStorage.setItem("tema", novo);
  aplicarTema(novo);
});