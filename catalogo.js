// js/catalogo.js
import { db, auth } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { protegerPagina } from "./guard.js";

const inputBusca = document.getElementById("busca");
const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const botoesFiltro = document.querySelectorAll(".pilula");
const linkVendedor = document.getElementById("link-vendedor");

const modal = document.getElementById("modal-compra");
const modalTitulo = document.getElementById("modal-titulo");
const modalPreco = document.getElementById("modal-preco");
const modalPix = document.getElementById("modal-pix");
const btnCopiarPix = document.getElementById("btn-copiar-pix");
const formPedido = document.getElementById("form-pedido");

let produtos = [];
let categoriaAtiva = "Todos";
let produtoEmCompra = null;

document.getElementById("sair").addEventListener("click", async () => {
  await signOut(auth);
  location.href = "index.html";
});

function formatarPreco(valor) {
  return "R$ " + Number(valor).toFixed(2).replace(".", ",");
}

// "(82) 99999-9999" vira "5582999999999", o formato que o link do WhatsApp aceita
function linkWhatsapp(numero, mensagem) {
  const digitos = String(numero).replace(/\D/g, "");
  const completo = digitos.length <= 11 ? "55" + digitos : digitos;
  return `https://wa.me/${completo}?text=${encodeURIComponent(mensagem)}`;
}

function criarCard(p) {
  const card = document.createElement("article");
  card.className = "card";

  const imagem = document.createElement("div");
  imagem.className = "card-imagem";
  if (p.imagem) {
    const img = document.createElement("img");
    img.src = p.imagem;
    img.alt = p.nome;
    imagem.appendChild(img);
  }

  const corpo = document.createElement("div");
  corpo.className = "card-corpo";

  const categoria = document.createElement("span");
  categoria.className = "categoria";
  categoria.textContent = p.categoria || "Sem categoria";

  const nome = document.createElement("h3");
  nome.className = "nome";
  nome.textContent = p.nome;

  const descricao = document.createElement("p");
  descricao.className = "descricao";
  descricao.textContent = p.descricao || "";

  const preco = document.createElement("strong");
  preco.className = "preco";
  preco.textContent = formatarPreco(p.preco);

  const acoes = document.createElement("div");
  acoes.className = "acoes-card";

  // Comprar só aparece se o vendedor preencheu Pix e WhatsApp
  if (p.pix && p.whatsapp) {
    const btnComprar = document.createElement("button");
    btnComprar.type = "button";
    btnComprar.textContent = "Comprar";
    btnComprar.addEventListener("click", () => abrirCompra(p));
    acoes.appendChild(btnComprar);
  }

  if (p.whatsapp) {
    const btnWhats = document.createElement("a");
    btnWhats.className = "btn-whats";
    btnWhats.textContent = "WhatsApp";
    btnWhats.href = linkWhatsapp(p.whatsapp, `Olá! Tenho interesse no produto "${p.nome}".`);
    btnWhats.target = "_blank";
    btnWhats.rel = "noopener";
    acoes.appendChild(btnWhats);
  }

  corpo.append(categoria, nome, descricao, preco);
  if (acoes.childElementCount > 0) corpo.appendChild(acoes);
  card.append(imagem, corpo);
  return card;
}

// Desenha os cards de acordo com a busca e a categoria escolhidas
function desenhar() {
  const termo = inputBusca.value.trim().toLowerCase();

  const filtrados = produtos.filter((p) => {
    const bateCategoria = categoriaAtiva === "Todos" || p.categoria === categoriaAtiva;
    const texto = (p.nome + " " + (p.descricao || "")).toLowerCase();
    return bateCategoria && texto.includes(termo);
  });

  lista.innerHTML = "";
  contador.textContent = filtrados.length + (filtrados.length === 1 ? " produto" : " produtos");

  if (filtrados.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "vazio";
    vazio.textContent = "Nenhum produto encontrado.";
    lista.appendChild(vazio);
    return;
  }

  filtrados.forEach((p) => lista.appendChild(criarCard(p)));
}

// ----- Modal de compra -----

function abrirCompra(p) {
  produtoEmCompra = p;
  modalTitulo.textContent = "Comprar: " + p.nome;
  modalPreco.textContent = "Valor: " + formatarPreco(p.preco);
  modalPix.textContent = p.pix;
  btnCopiarPix.textContent = "Copiar chave Pix";
  formPedido.reset();
  modal.hidden = false;
}

function fecharCompra() {
  modal.hidden = true;
  produtoEmCompra = null;
}

document.getElementById("modal-fechar").addEventListener("click", fecharCompra);

// Clicar fora da caixa também fecha
modal.addEventListener("click", (e) => {
  if (e.target === modal) fecharCompra();
});

btnCopiarPix.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(produtoEmCompra.pix);
    btnCopiarPix.textContent = "Chave copiada!";
  } catch (err) {
    alert("Não consegui copiar. Copie manualmente: " + produtoEmCompra.pix);
  }
});

// Monta a mensagem e abre o WhatsApp do vendedor
formPedido.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("pedido-nome").value.trim();
  const sala = document.getElementById("pedido-sala").value.trim();
  const serie = document.getElementById("pedido-serie").value.trim();

  const mensagem =
    `Olá! Quero comprar: ${produtoEmCompra.nome} (${formatarPreco(produtoEmCompra.preco)}).\n` +
    `Nome: ${nome}\nSala: ${sala}\nSérie: ${serie}\n` +
    `Estou interressado(a) no seu produto que vi no catálogo do projeto do Artesanato Moacir.`;

  window.open(linkWhatsapp(produtoEmCompra.whatsapp, mensagem), "_blank");
  fecharCompra();
});

// ----- Filtros e busca -----

botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    categoriaAtiva = botao.dataset.categoria;
    botoesFiltro.forEach((b) => b.classList.toggle("ativa", b === botao));
    desenhar();
  });
});

inputBusca.addEventListener("input", desenhar);

// ----- Carregamento -----

protegerPagina(["cliente", "vendedor"], async (user, tipo) => {
  if (tipo === "vendedor") linkVendedor.hidden = false;

  const snap = await getDocs(collection(db, "produtos"));
  produtos = snap.docs.map((d) => d.data());
  desenhar();
});