const campoCep = document.getElementById("cep");
const campoRua = document.getElementById("rua");
const campoBairro = document.getElementById("bairro");
const campoCidade = document.getElementById("cidade");
const campoUf = document.getElementById("uf");
const mensagem = document.getElementById("mensagem");
const listaHistorico = document.getElementById("historico");
const historicoVazio = document.getElementById("historico-vazio");

const CHAVE_HISTORICO = "historicoCeps";
const LIMITE_HISTORICO = 5;

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo;
  mensagem.hidden = false;
}

function esconderMensagem() {
  mensagem.hidden = true;
  mensagem.textContent = "";
}

function limparCampos() {
  campoRua.value = "";
  campoBairro.value = "";
  campoCidade.value = "";
  campoUf.value = "";
}

function preencherCampos(dados) {
  campoRua.value = dados.logradouro;
  campoBairro.value = dados.bairro;
  campoCidade.value = dados.localidade;
  campoUf.value = dados.uf;
}

// Histórico (LocalStorage)
function lerHistorico() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_HISTORICO)) || [];
  } catch {
    return [];
  }
}

function salvarNoHistorico(dados) {
  const historico = lerHistorico().filter(item => item.cep !== dados.cep);
  historico.unshift({
    cep: dados.cep,
    logradouro: dados.logradouro,
    bairro: dados.bairro,
    localidade: dados.localidade,
    uf: dados.uf
  });
  localStorage.setItem(
    CHAVE_HISTORICO,
    JSON.stringify(historico.slice(0, LIMITE_HISTORICO))
  );
  mostrarHistorico();
}

function mostrarHistorico() {
  const historico = lerHistorico();
  listaHistorico.innerHTML = "";
  historicoVazio.hidden = historico.length > 0;

  historico.forEach(item => {
    const li = document.createElement("li");
    const cep = document.createElement("strong");
    cep.textContent = item.cep;
    const endereco = document.createElement("span");
    endereco.textContent =
      `${item.logradouro} - ${item.bairro}, ${item.localidade}/${item.uf}`;
    li.append(cep, endereco);
    listaHistorico.appendChild(li);
  });
}

// Busca na ViaCEP
async function buscarCep() {
  const cep = campoCep.value.replace(/\D/g, "");

  esconderMensagem();
  limparCampos();

  if (cep.length === 0) return;

  if (cep.length !== 8) {
    mostrarMensagem("CEP inválido. Digite 8 números.", "erro");
    return;
  }

  mostrarMensagem("Buscando CEP...", "info");

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resposta.ok) throw new Error("Erro na resposta do servidor");

    const dados = await resposta.json();

    if (dados.erro) {
      mostrarMensagem("CEP não encontrado.", "erro");
      return;
    }

    esconderMensagem();
    preencherCampos(dados);
    salvarNoHistorico(dados);
  } catch (erro) {
    mostrarMensagem("Não foi possível buscar o CEP. Tente novamente.", "erro");
  }
}

campoCep.addEventListener("input", () => {
  const numeros = campoCep.value.replace(/\D/g, "").slice(0, 8);
  campoCep.value = numeros.length > 5
    ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
    : numeros;
});

campoCep.addEventListener("blur", buscarCep);

mostrarHistorico();
