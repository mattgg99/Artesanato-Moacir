// js/vendedor.js
import { db, auth } from "./firebase.js";
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { protegerPagina } from "./guard.js";

const form = document.getElementById("form-produto");
const titulo = document.getElementById("titulo-form");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const previa = document.getElementById("previa");
const erro = document.getElementById("erro");
const lista = document.getElementById("lista-produtos");

const campos = {
  nome: document.getElementById("nome"),
  categoria: document.getElementById("categoria"),
  descricao: document.getElementById("descricao"),
  preco: document.getElementById("preco"),
  imagem: document.getElementById("imagem"),
  whatsapp: document.getElementById("whatsapp"),
  pix: document.getElementById("pix")
};

// Guarda o id do produto que está sendo editado (null = cadastrando um novo)
let editandoId = null;

// Guarda no navegador o WhatsApp e o Pix, para não digitar de novo a cada produto
const CONTATO_KEY = "contato-vendedor";

document.getElementById("sair").addEventListener("click", async () => {
  await signOut(auth);
  location.href = "index.html";
});

function formatarPreco(valor) {
  return "R$ " + Number(valor).toFixed(2).replace(".", ",");
}

// Aceita "25,90", "25.90" ou "25". Devolve o número, ou null se o valor for inválido.
function lerPreco(texto) {
  const limpo = texto.trim().replace(/\s/g, "").replace("R$", "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  const valor = Number(limpo);
  return valor > 0 ? valor : null;
}

function atualizarPrevia() {
  const valor = lerPreco(campos.preco.value);
  previa.textContent = valor === null
    ? "Preço: digite um valor, ex: 25,90"
    : "Preço: " + formatarPreco(valor);
}

campos.preco.addEventListener("input", atualizarPrevia);

function preencherContatoSalvo() {
  const salvo = JSON.parse(localStorage.getItem(CONTATO_KEY) || "{}");
  campos.whatsapp.value = salvo.whatsapp || "";
  campos.pix.value = salvo.pix || "";
}

function entrarModoEdicao(id, p) {
  editandoId = id;
  campos.nome.value = p.nome;
  campos.categoria.value = p.categoria || "";
  campos.descricao.value = p.descricao || "";
  campos.preco.value = Number(p.preco).toFixed(2).replace(".", ",");
  campos.imagem.value = p.imagem || "";
  campos.whatsapp.value = p.whatsapp || "";
  campos.pix.value = p.pix || "";
  atualizarPrevia();

  titulo.textContent = "Editar produto";
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.hidden = false;
  erro.textContent = "";
  form.scrollIntoView({ behavior: "smooth" });
}

function sairModoEdicao() {
  editandoId = null;
  form.reset();
  preencherContatoSalvo();
  atualizarPrevia();

  titulo.textContent = "Novo produto";
  btnSalvar.textContent = "Adicionar produto";
  btnCancelar.hidden = true;
}

btnCancelar.addEventListener("click", sairModoEdicao);

async function carregarProdutos() {
  lista.innerHTML = "";
  const snap = await getDocs(collection(db, "produtos"));

  snap.forEach((item) => {
    const p = item.data();

    const li = document.createElement("li");
    li.className = "item-produto";

    const texto = document.createElement("span");
    texto.textContent = `${p.nome} · ${formatarPreco(p.preco)}`;

    const acoes = document.createElement("div");
    acoes.className = "acoes-item";

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn-editar";
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => entrarModoEdicao(item.id, p));

    const btnApagar = document.createElement("button");
    btnApagar.type = "button";
    btnApagar.className = "btn-apagar";
    btnApagar.textContent = "Apagar";
    btnApagar.addEventListener("click", async () => {
      if (!confirm(`Apagar "${p.nome}"?`)) return;
      await deleteDoc(doc(db, "produtos", item.id));
      if (editandoId === item.id) sairModoEdicao();
      carregarProdutos();
    });

    acoes.append(btnEditar, btnApagar);
    li.append(texto, acoes);
    lista.appendChild(li);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.textContent = "";

  const preco = lerPreco(campos.preco.value);
  if (preco === null) {
    erro.textContent = "Preço inválido. Use algo como 25,90.";
    return;
  }

  const dados = {
    nome: campos.nome.value.trim(),
    categoria: campos.categoria.value,
    descricao: campos.descricao.value.trim(),
    preco,
    imagem: campos.imagem.value.trim(),
    whatsapp: campos.whatsapp.value.trim(),
    pix: campos.pix.value.trim()
  };

  try {
    if (editandoId) {
      // Atualiza o produto existente, sem criar um novo
      await updateDoc(doc(db, "produtos", editandoId), dados);
    } else {
      await addDoc(collection(db, "produtos"), dados);
    }

    localStorage.setItem(CONTATO_KEY, JSON.stringify({
      whatsapp: dados.whatsapp,
      pix: dados.pix
    }));

    sairModoEdicao();
    carregarProdutos();
  } catch (err) {
    console.error(err);
    erro.textContent = "Não foi possível salvar: " + err.code;
  }
});

protegerPagina("vendedor", () => {
  preencherContatoSalvo();
  carregarProdutos();
});