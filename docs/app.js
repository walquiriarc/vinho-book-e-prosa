// ============================================================
//  Vinho, Book e Prosa — lógica do app
//  Você não precisa editar este arquivo (mas pode, com o Claude Code).
// ============================================================

const cfg = window.APP_CONFIG || {};

// ---- Conexão com o banco compartilhado (Supabase) ----
// Guardamos o motivo exato da falha para explicar direito no rodapé.
let db = null;
let problemaConfig = null;
try {
  if (!window.supabase) {
    problemaConfig = "A biblioteca do Supabase não carregou. Verifique sua internet e recarregue a página.";
  } else if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf("COLE_AQUI") === 0) {
    problemaConfig = "Falta preencher o config.js com a URL e a chave do Supabase.";
  } else if (!cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.indexOf("COLE_AQUI") === 0) {
    problemaConfig = "Falta preencher a chave anon no config.js.";
  } else {
    db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }
} catch (e) {
  problemaConfig = "A URL do Supabase no config.js parece inválida: " + (e.message || e);
}

// ---- Estado em memória ----
const estado = { livros: [], votos: [], encontros: [], presencas: [], resenhas: [] };
let jaCarregouUmaVez = false;

// ============================================================
//  Atalhos
// ============================================================
const $ = (sel) => document.querySelector(sel);
const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function iniciais(nome) {
  const p = String(nome || "?").trim().split(/\s+/);
  return ((p[0] || "?")[0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}
function avatarHtml(nome, classe) {
  return '<span class="avatar ' + (classe || "") + '" title="' + esc(nome) + '">' + esc(iniciais(nome)) + "</span>";
}

// Nada neste app é apagado. O que sai de vista fica marcado como arquivado
// e pode voltar — por isso o banco nem tem permissão para excluir linhas.
function naoArquivados(lista) { return lista.filter((x) => !x.arquivado); }
function arquivados(lista) { return lista.filter((x) => x.arquivado); }

// ============================================================
//  ENTRADA NO CLUBE — login por e-mail
//  Só quem está na tabela "membras" do banco entra. O Supabase manda
//  um link para o e-mail; clicar nele é a prova de que a pessoa é ela.
//  Ninguém mais escolhe o próprio nome numa lista: quem você é vem do
//  login, então não dá para votar ou resenhar no nome de outra.
// ============================================================
let membra = null;   // nome de exibição de quem está logada
let sessao = null;

function pintarIdentidade() {
  $("#eu-avatar").textContent = membra ? iniciais(membra) : "?";
  $("#eu-nome").textContent = membra || "entrar";
}
function precisaIdentidade() {
  if (membra) return false;
  avisar("Entre com o seu e-mail para poder escrever.", "erro");
  return true;
}

// Tela de entrada, cobrindo o app inteiro. Não dá para fechar.
function mostrarPortao(erro) {
  abrirModal({
    titulo: "Entrar no clube",
    explica: "Só as membras do Vinho, Book e Prosa entram aqui. Coloque o seu e-mail e mandamos um link de acesso — não precisa inventar nem decorar senha.",
    podeFechar: false,
    corpo: '<form id="form-entrar">' +
      '<label class="campo"><span>Seu e-mail</span>' +
      '<input type="email" name="email" required autocomplete="email" placeholder="voce@exemplo.com"></label>' +
      (erro ? '<p class="explica" style="color:var(--erro)">' + esc(erro) + "</p>" : "") +
      '<div class="modal-acoes"><button type="submit" class="btn">Receber meu link</button></div></form>',
    aoAbrir(modal) {
      const f = modal.querySelector("#form-entrar");
      f.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const email = f.email.value.trim().toLowerCase();
        const botao = f.querySelector("button");
        botao.disabled = true; botao.textContent = "Enviando…";
        const r = await db.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: location.origin + location.pathname },
        });
        botao.disabled = false; botao.textContent = "Receber meu link";
        if (r.error) {
          console.error(r.error);
          mostrarPortao(/rate|limit|seconds/i.test(r.error.message || "")
            ? "Muitos pedidos seguidos. Espere um minuto e tente de novo."
            : "Não deu para enviar o link agora. Confira o e-mail e tente de novo.");
          return;
        }
        mostrarLinkEnviado(email);
      });
    },
  });
}

function mostrarLinkEnviado(email) {
  abrirModal({
    titulo: "Olhe o seu e-mail",
    explica: "Mandamos um link de acesso para " + email + ". Abra o e-mail NESTE MESMO aparelho e clique no link — você volta para cá já dentro do clube. Se não achar, olhe no spam.",
    podeFechar: false,
    corpo: '<div class="escolha-lista">' +
      '<button type="button" class="escolha" id="btn-outro-email">Usar outro e-mail</button></div>',
    aoAbrir(modal) {
      modal.querySelector("#btn-outro-email").addEventListener("click", () => mostrarPortao());
    },
  });
}

function mostrarNaoAutorizada(email) {
  abrirModal({
    titulo: "Esse e-mail não está na lista",
    explica: "O endereço " + email + " não faz parte do Vinho, Book e Prosa. Se você é do clube, peça para a Wal acrescentar esse e-mail — ou entre com o endereço que ela cadastrou.",
    podeFechar: false,
    corpo: '<div class="escolha-lista">' +
      '<button type="button" class="escolha" id="btn-sair">Tentar com outro e-mail</button></div>',
    aoAbrir(modal) {
      modal.querySelector("#btn-sair").addEventListener("click", async () => {
        await db.auth.signOut();
        mostrarPortao();
      });
    },
  });
}

function abrirMenuConta() {
  if (!membra) { mostrarPortao(); return; }
  abrirModal({
    titulo: membra,
    explica: sessao && sessao.user ? "Você entrou com " + sessao.user.email + "." : "",
    corpo: '<div class="escolha-lista">' +
      '<button type="button" class="escolha" id="btn-sair-conta">Sair do clube neste aparelho</button></div>',
    aoAbrir(modal) {
      modal.querySelector("#btn-sair-conta").addEventListener("click", async () => {
        fecharModal();
        await db.auth.signOut();
      });
    },
  });
}

// Chamada sempre que a sessão muda (entrou, saiu, link clicado).
async function aplicarSessao(nova) {
  sessao = nova;
  if (!sessao) {
    membra = null; pintarIdentidade();
    Object.keys(estado).forEach((k) => { estado[k] = []; });
    renderTudo();
    status("Fora do clube", "");
    mostrarPortao();
    return;
  }
  // Está logada — mas é do clube? Quem não está na lista não enxerga nada.
  const eu = await db.from("membras").select("nome")
    .eq("email", String(sessao.user.email || "").toLowerCase()).maybeSingle();
  if (eu.error) { status(mensagemDeErro("conferir a sua entrada", eu.error), "erro"); return; }
  if (!eu.data) { membra = null; pintarIdentidade(); mostrarNaoAutorizada(sessao.user.email); return; }
  membra = eu.data.nome;
  pintarIdentidade();
  fecharModal();
  carregar();
}

// ============================================================
//  Modal e avisos
// ============================================================
function abrirModal({ titulo, explica, corpo, podeFechar = true, aoAbrir }) {
  const raiz = $("#modal-root");
  raiz.innerHTML =
    '<div class="overlay"' + (podeFechar ? ' data-fechar="1"' : "") + '>' +
    '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(titulo) + '">' +
    "<h3>" + esc(titulo) + "</h3>" +
    (explica ? '<p class="explica">' + esc(explica) + "</p>" : "") +
    corpo +
    (podeFechar ? '<div class="acoes"><button type="button" class="btn fantasma" data-fechar="1">Fechar</button></div>' : "") +
    "</div></div>";

  const modal = raiz.querySelector(".modal");
  if (podeFechar) {
    raiz.querySelector(".overlay").addEventListener("click", (ev) => {
      if (ev.target.matches("[data-fechar]")) fecharModal();
    });
  }
  const primeiro = modal.querySelector("button");
  if (primeiro) setTimeout(() => primeiro.focus(), 40);
  if (aoAbrir) aoAbrir(modal);
}
function fecharModal() { $("#modal-root").innerHTML = ""; }
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const ov = document.querySelector(".overlay");
  if (ov && ov.hasAttribute("data-fechar")) fecharModal();
});

function avisar(texto, tipo) {
  const caixa = $("#avisos");
  const a = el('<div class="aviso ' + (tipo || "ok") + '">' + esc(texto) + "</div>");
  caixa.appendChild(a);
  setTimeout(() => a.remove(), tipo === "erro" ? 6500 : 3800);
}
function status(texto, classe) {
  const s = $("#status-conexao");
  s.textContent = texto;
  s.className = "status " + (classe || "");
}

// ============================================================
//  BUG 2 e 6 — toda gravação verifica erro e avisa
//  O Supabase não lança exceção: ele devolve { data, error }.
//  Antes ninguém lia esse error, então falhas passavam em silêncio.
// ============================================================
function bancoOk() {
  if (db) return true;
  avisar(problemaConfig || "O banco de dados não está configurado.", "erro");
  return false;
}

function mensagemDeErro(oQue, e) {
  const cod = e && (e.code || e.status);
  if (cod === "23505") return "Isso já estava registrado.";
  if (cod === "23503") return "O item relacionado não existe mais. Atualize a página.";
  if (cod === "42501") return "O banco recusou a gravação. Confira se as políticas do schema.sql rodaram no Supabase.";
  if (cod === "42P01") return "A tabela não existe no banco. Rode o schema.sql completo no Supabase.";
  if (e && /failed to fetch|networkerror|load failed/i.test(e.message || "")) {
    return "Sem conexão com a internet. Tente de novo daqui a pouco.";
  }
  return "Não deu para " + oQue + ". Tente de novo.";
}

// Executa uma escrita: exige banco e identidade, trava o botão,
// confere o erro, recarrega e avisa o que aconteceu.
async function gravar(oQue, executar, botao, mensagemSucesso) {
  if (!bancoOk()) return false;
  if (precisaIdentidade()) return false;
  const rotuloAntigo = botao ? botao.textContent : null;
  if (botao) { botao.disabled = true; botao.textContent = "Salvando…"; }
  try {
    const r = await executar();
    if (r && r.error) throw r.error;
    await carregar({ silencioso: true });
    if (mensagemSucesso) avisar(mensagemSucesso);
    return true;
  } catch (e) {
    console.error(oQue, e);
    avisar(mensagemDeErro(oQue, e), "erro");
    return false;
  } finally {
    if (botao) { botao.disabled = false; botao.textContent = rotuloAntigo; }
  }
}

// ============================================================
//  BUG 3 — carregar confere o erro de TODAS as tabelas
//  e nunca apaga da tela os dados que já tínhamos.
// ============================================================
async function carregar({ silencioso = false } = {}) {
  if (!db) { status(problemaConfig || "Banco não configurado", "erro"); return; }
  if (!membra) return;   // fora do clube não há o que carregar
  try {
    const tabelas = ["livros", "votos", "encontros", "presencas", "resenhas"];
    const respostas = await Promise.all([
      db.from("livros").select("*").order("criado_em", { ascending: true }),
      db.from("votos").select("*"),
      db.from("encontros").select("*").order("data", { ascending: true }),
      db.from("presencas").select("*"),
      db.from("resenhas").select("*").order("criado_em", { ascending: true }),
    ]);
    respostas.forEach((r, i) => {
      if (r.error) { r.error.tabela = tabelas[i]; throw r.error; }
    });
    // Só substitui o estado depois que TODAS as consultas deram certo.
    respostas.forEach((r, i) => { estado[tabelas[i]] = r.data || []; });
    jaCarregouUmaVez = true;
    status("Conectado ✓", "ok");
    renderTudo();
  } catch (e) {
    console.error("carregar", e);
    const detalhe = e.tabela ? " (tabela " + e.tabela + ")" : "";
    status("Sem conexão com o banco" + detalhe, "erro");
    if (!silencioso || !jaCarregouUmaVez) {
      avisar(mensagemDeErro("carregar os dados", e), "erro");
    }
    // Importante: NÃO limpamos o estado. O que já estava na tela continua lá.
  }
}

// ============================================================
//  BUG 1 — o app não pode redesenhar por cima de quem está escrevendo
//  A atualização automática apagava a resenha no meio da frase.
//  Duas defesas: adiamos o redesenho enquanto há foco num campo,
//  e guardamos rascunhos para nada se perder de qualquer jeito.
// ============================================================
let redesenhoAdiado = false;

// As áreas que o redesenho recria do zero. Os formulários fixos do topo
// não entram aqui: eles nunca são destruídos, então digitar neles não
// precisa segurar a atualização.
const AREAS_RECRIADAS = "#lista-atual, #lista-fila, #lista-arquivados, #lista-votacao, #lista-encontros, #lista-lidos";

function estaEditando() {
  const a = document.activeElement;
  if (!a || !a.matches) return false;
  if (!a.matches("input, textarea, select")) return false;
  return !!a.closest(AREAS_RECRIADAS);
}

function renderTudo() {
  if (estaEditando()) { redesenhoAdiado = true; return; }
  redesenhoAdiado = false;
  renderLivros();
  renderVotacao();
  renderAgenda();
  renderLidos();
}

// Duas formas de retomar um redesenho adiado: assim que o foco sai do campo
// e, como rede de segurança, uma verificação periódica — para o redesenho
// nunca ficar preso caso o evento de foco não chegue.
document.addEventListener("focusout", () => {
  setTimeout(() => { if (redesenhoAdiado && !estaEditando()) renderTudo(); }, 150);
});
setInterval(() => { if (redesenhoAdiado && !estaEditando()) renderTudo(); }, 1500);

// --- rascunhos das resenhas (sobrevivem até a um recarregamento) ---
const rascunhos = {};
function chaveRascunho(livroId) { return "rascunho:" + (membra || "?") + ":" + livroId; }
function lerRascunho(livroId) {
  if (rascunhos[livroId] !== undefined) return rascunhos[livroId];
  try {
    const bruto = sessionStorage.getItem(chaveRascunho(livroId));
    rascunhos[livroId] = bruto ? JSON.parse(bruto) : null;
  } catch { rascunhos[livroId] = null; }
  return rascunhos[livroId];
}
function salvarRascunho(livroId, valor) {
  rascunhos[livroId] = valor;
  try { sessionStorage.setItem(chaveRascunho(livroId), JSON.stringify(valor)); } catch {}
}
function limparRascunho(livroId) {
  delete rascunhos[livroId];
  try { sessionStorage.removeItem(chaveRascunho(livroId)); } catch {}
}

// ============================================================
//  Datas
// ============================================================
const MES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function comoData(d) { try { return new Date(d + "T12:00:00"); } catch { return null; } }
function hojeISO() {
  const d = hoje();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function dataCurta(s) {
  const d = comoData(s);
  return d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "";
}
function hoje() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function diasAte(d) { return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - hoje()) / 86400000); }
function quando(n) {
  if (n < 0) return n === -1 ? "foi ontem" : "faz " + Math.abs(n) + " dias";
  if (n === 0) return "é hoje";
  if (n === 1) return "é amanhã";
  if (n <= 60) return "em " + n + " dias";
  return "";
}
function dataPorExtenso(d) {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" });
}

// ============================================================
//  Abas
// ============================================================
function trocarAba(nome, livroId) {
  if (!document.getElementById("painel-" + nome)) nome = "livros";
  document.querySelectorAll(".aba").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.aba === nome)));
  document.querySelectorAll(".painel").forEach((p) => { p.hidden = p.id !== "painel-" + nome; });
  try { sessionStorage.setItem("aba", nome); } catch {}
  if (livroId) {
    setTimeout(() => {
      const alvo = document.getElementById("livro-" + livroId);
      if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }
}

function botao(texto, classe, aoClicar) {
  const b = el('<button type="button" class="' + classe + '">' + esc(texto) + "</button>");
  b.addEventListener("click", () => aoClicar(b));
  return b;
}

// ============================================================
//  ABA 1 — FILA DE LIVROS
// ============================================================
function destinoEscolhido() {
  const r = document.querySelector('input[name="destino"]:checked');
  return r ? r.value : "fila";
}

// A dica embaixo das opções: avisa o que acontece com o livro atual e
// mostra o campo de data só quando o destino é "já lido".
function atualizarDicaDestino() {
  const destino = destinoEscolhido();
  const dica = $("#dica-destino");
  const campoData = $("#campo-terminado");
  const atual = naoArquivados(estado.livros).find((l) => l.status === "atual");
  campoData.hidden = destino !== "lido";
  if (destino === "lido" && !$("#novo-terminado").value) $("#novo-terminado").value = hojeISO();
  if (destino === "atual" && atual) {
    dica.textContent = '"' + atual.titulo + '" volta para Quero ler.';
    dica.hidden = false;
  } else if (destino === "atual") {
    dica.textContent = "Vira a leitura do clube agora.";
    dica.hidden = false;
  } else {
    dica.hidden = true;
  }
}

async function addLivro(ev) {
  ev.preventDefault();
  const campoTitulo = $("#novo-titulo");
  const campoAutor = $("#novo-autor");
  const titulo = campoTitulo.value.trim();
  const autor = campoAutor.value.trim();
  const destino = destinoEscolhido();
  const terminado = $("#novo-terminado").value || hojeISO();
  if (!titulo) { campoTitulo.focus(); return; }

  const anterior = destino === "atual" ? naoArquivados(estado.livros).find((l) => l.status === "atual") : null;
  const mensagem =
    destino === "lido"  ? '"' + titulo + '" guardado em Lidos. Dê a sua nota!' :
    destino === "atual" ? (anterior ? '"' + titulo + '" é a leitura atual. "' + anterior.titulo + '" voltou para Quero ler.'
                                    : '"' + titulo + '" é a leitura atual.') :
                          '"' + titulo + '" entrou em Quero ler.';

  let novoId = null;
  const ok = await gravar("adicionar o livro", async () => {
    if (anterior) {
      const r = await db.from("livros").update({ status: "fila" }).eq("id", anterior.id);
      if (r.error) return r;
    }
    const linha = { titulo, autor, sugerido_por: membra, status: destino };
    if (destino === "lido") linha.terminado_em = terminado;
    const ins = await db.from("livros").insert(linha).select("id").single();
    if (!ins.error && ins.data) novoId = ins.data.id;
    return ins;
  }, $("#btn-add-livro"), mensagem);

  if (ok) {
    campoTitulo.value = ""; campoAutor.value = ""; $("#novo-terminado").value = "";
    const padrao = document.querySelector('input[name="destino"][value="fila"]');
    if (padrao) padrao.checked = true;
    atualizarDicaDestino();
    if (destino === "lido") trocarAba("lidos", novoId);
    else campoTitulo.focus();
  }
}

// BUG 5 — só um livro pode ser a leitura atual.
// Antes cada clique criava mais um "Lendo agora" e ficavam vários ao mesmo tempo.
async function definirAtual(id, btn) {
  await gravar("definir a leitura atual", async () => {
    const rebaixa = await db.from("livros").update({ status: "fila" }).eq("status", "atual").neq("id", id);
    if (rebaixa.error) return rebaixa;
    return db.from("livros").update({ status: "atual" }).eq("id", id);
  }, btn, "Leitura atual definida. O livro anterior voltou para Quero ler.");
}
async function mudarStatus(id, status, btn, msg) {
  const dados = { status };
  if (status === "lido") dados.terminado_em = hojeISO();   // terminou hoje; dá para ajustar em Lidos
  if (status === "fila") dados.terminado_em = null;
  return gravar("mudar o livro de lugar", () => db.from("livros").update(dados).eq("id", id), btn, msg);
}
async function alterarDataLido(livro, btn) {
  abrirModal({
    titulo: "Quando terminamos?",
    explica: '"' + livro.titulo + '"',
    corpo: '<form id="form-data"><label class="campo"><span>Terminado em</span>' +
      '<input type="date" name="data" required value="' + esc(livro.terminado_em || hojeISO()) + '"></label>' +
      '<div class="modal-acoes"><button type="submit" class="btn">Salvar</button></div></form>',
    aoAbrir(modal) {
      modal.querySelector("#form-data").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const data = ev.target.data.value;
        fecharModal();
        await gravar("alterar a data", () => db.from("livros").update({ terminado_em: data }).eq("id", livro.id), btn, "Data alterada.");
      });
    },
  });
}
async function arquivarLivro(livro, btn) {
  if (!confirm('Tirar "' + livro.titulo + '" da lista?\n\nEle sai da tela, mas os votos e as resenhas continuam guardados — e dá para trazer de volta quando quiser.')) return;
  await gravar("arquivar o livro",
    () => db.from("livros").update({ arquivado: true }).eq("id", livro.id),
    btn, "Livro arquivado. Está no fim da aba Livros.");
}
async function restaurarLivro(livro, btn) {
  // Volta sempre para Quero ler: outro livro pode ter virado a leitura atual enquanto isso.
  await gravar("trazer o livro de volta",
    () => db.from("livros").update({ arquivado: false, status: livro.status === "atual" ? "fila" : livro.status }).eq("id", livro.id),
    btn, "Livro de volta na lista.");
}

function cartaoLivro(l) {
  const partes = [];
  if (l.autor) partes.push("de " + esc(l.autor));
  if (l.sugerido_por) partes.push("sugerido por " + esc(l.sugerido_por));
  const rotuloSelo = { fila: "Quero ler", atual: "Lendo agora", lido: "Lido" }[l.status] || l.status;

  const c = el('<article class="item" id="livro-' + esc(l.id) + '">' +
    '<span class="selo ' + esc(l.status) + '">' + esc(rotuloSelo) + "</span>" +
    '<div class="titulo">' + esc(l.titulo) + "</div>" +
    (partes.length ? '<div class="meta">' + partes.join(" · ") + "</div>" : "") +
    '<div class="acoes"></div></article>');

  const acoes = c.querySelector(".acoes");
  if (l.arquivado) {
    acoes.appendChild(botao("Trazer de volta", "btn fantasma mini", (b) => restaurarLivro(l, b)));
  } else {
    if (l.status === "fila") acoes.appendChild(botao("Definir como leitura atual", "btn fantasma mini", (b) => definirAtual(l.id, b)));
    if (l.status === "atual") acoes.appendChild(botao("Marcar como lido", "btn fantasma mini",
      (b) => mudarStatus(l.id, "lido", b, "Guardado em Lidos. Dê a sua nota!").then((ok) => { if (ok) trocarAba("lidos", l.id); })));
    if (l.status === "lido") acoes.appendChild(botao("Voltar para Quero ler", "btn fantasma mini", (b) => mudarStatus(l.id, "fila", b, "Livro voltou para Quero ler.")));
    acoes.appendChild(botao("Arquivar", "btn perigo mini", (b) => arquivarLivro(l, b)));
  }
  return c;
}

function renderLivros() {
  const bloco = (container, itens, vazio) => {
    container.innerHTML = "";
    if (!itens.length) { container.appendChild(el('<p class="vazio">' + esc(vazio) + "</p>")); return; }
    itens.forEach((l) => container.appendChild(cartaoLivro(l)));
  };
  const vivos = naoArquivados(estado.livros);
  bloco($("#lista-atual"), vivos.filter((l) => l.status === "atual"),
    "Nenhum livro em leitura. Escolha um em Quero ler, ou adicione acima como \"Lendo agora\".");
  bloco($("#lista-fila"), vivos.filter((l) => l.status === "fila"),
    "Nada em Quero ler ainda. Adicione um livro no formulário acima.");
  atualizarDicaDestino();

  const guardados = arquivados(estado.livros);
  $("#titulo-arquivados").hidden = !guardados.length;
  $("#lista-arquivados").innerHTML = "";
  guardados.forEach((l) => $("#lista-arquivados").appendChild(cartaoLivro(l)));
}

// ============================================================
//  ABA 2 — VOTAÇÃO
// ============================================================
function votosDo(livroId) { return estado.votos.filter((v) => v.livro_id === livroId && v.ativo !== false); }
function jaVotei(livroId) { return votosDo(livroId).some((v) => v.membra === membra); }

async function alternarVoto(livroId, btn) {
  const tinha = jaVotei(livroId);
  // O voto liga e desliga na mesma linha, em vez de ser apagado.
  const linha = estado.votos.find((v) => v.livro_id === livroId && v.membra === membra);
  await gravar(tinha ? "remover o voto" : "registrar o voto",
    () => linha
      ? db.from("votos").update({ ativo: !tinha }).eq("id", linha.id)
      : db.from("votos").insert({ livro_id: livroId, membra, ativo: true }),
    btn, tinha ? "Voto removido." : "Voto registrado.");
}

function renderVotacao() {
  const cont = $("#lista-votacao");
  cont.innerHTML = "";
  const fila = naoArquivados(estado.livros)
    .filter((l) => l.status === "fila")
    .map((l) => ({ ...l, votos: votosDo(l.id).length }))
    .sort((a, b) => b.votos - a.votos || a.titulo.localeCompare(b.titulo, "pt-BR"));

  if (!fila.length) {
    cont.appendChild(el('<p class="vazio">Nada em Quero ler para votar. Adicione livros na aba Livros.</p>'));
    return;
  }
  const maximo = Math.max(1, fila[0].votos);

  fila.forEach((l, i) => {
    const votei = jaVotei(l.id);
    const quem = votosDo(l.id).map((v) => v.membra);
    const lidera = l.votos > 0 && l.votos === fila[0].votos;

    const c = el('<article class="item' + (lidera ? " lider" : "") + '">' +
      (lidera && i === 0 ? '<span class="selo" style="--c:var(--votacao)">Mais votado</span>' : "") +
      '<div class="titulo">' + esc(l.titulo) + "</div>" +
      (l.autor ? '<div class="meta">de ' + esc(l.autor) + "</div>" : "") +
      '<div class="barra-votos"><i style="width:' + Math.round((l.votos / maximo) * 100) + '%"></i></div>' +
      '<div class="linha-mono"><span class="contador-votos">' + l.votos + "</span> " +
      (l.votos === 1 ? "voto" : "votos") + (quem.length ? " · " + quem.map(esc).join(", ") : "") + "</div>" +
      '<div class="acoes"></div></article>');

    c.querySelector(".acoes").appendChild(
      botao(votei ? "Tirar meu voto" : "Votar neste", votei ? "btn fantasma mini" : "btn mini", (b) => alternarVoto(l.id, b))
    );
    cont.appendChild(c);
  });
}

// ============================================================
//  ABA 3 — AGENDA
//  BUG 7 — encontros passados não ficam mais no topo para sempre.
// ============================================================
async function addEncontro(ev) {
  ev.preventDefault();
  const data = $("#novo-data").value;
  const hora = $("#novo-hora").value;
  const local = $("#novo-local").value.trim();
  const livro_id = $("#novo-encontro-livro").value || null;
  if (!data) { avisar("Escolha uma data para o encontro.", "erro"); $("#novo-data").focus(); return; }

  const ok = await gravar("marcar o encontro",
    () => db.from("encontros").insert({ data, hora, local, livro_id }),
    $("#btn-add-encontro"), "Encontro marcado.");
  if (ok) { $("#novo-data").value = ""; $("#novo-hora").value = ""; $("#novo-local").value = ""; $("#novo-encontro-livro").value = ""; }
}
async function arquivarEncontro(en, btn) {
  if (!confirm("Tirar este encontro da agenda?\n\nEle sai da tela, mas dá para trazer de volta quando quiser.")) return;
  await gravar("arquivar o encontro",
    () => db.from("encontros").update({ arquivado: true }).eq("id", en.id),
    btn, "Encontro arquivado. Está no fim da aba Agenda.");
}
async function restaurarEncontro(en, btn) {
  await gravar("trazer o encontro de volta",
    () => db.from("encontros").update({ arquivado: false }).eq("id", en.id),
    btn, "Encontro de volta na agenda.");
}
async function alternarPresenca(encontroId, btn) {
  const linha = estado.presencas.find((p) => p.encontro_id === encontroId && p.membra === membra);
  const vou = !!(linha && linha.confirmado !== false);
  await gravar(vou ? "cancelar a presença" : "confirmar a presença",
    () => linha
      ? db.from("presencas").update({ confirmado: !vou }).eq("id", linha.id)
      : db.from("presencas").insert({ encontro_id: encontroId, membra, confirmado: true }),
    btn, vou ? "Presença cancelada." : "Presença confirmada.");
}

function cartaoEncontro(en, passado) {
  const d = comoData(en.data);
  const livro = estado.livros.find((l) => l.id === en.livro_id);
  const confirmadas = estado.presencas.filter((p) => p.encontro_id === en.id && p.confirmado !== false);
  const euVou = confirmadas.some((p) => p.membra === membra);
  const detalhes = [en.hora ? esc(en.hora) : "", en.local ? esc(en.local) : "Local a definir"].filter(Boolean).join(" · ");

  const c = el('<article class="item' + (passado ? " passado" : "") + '">' +
    '<div class="topo-item">' +
      '<div class="data-bloco"><div class="dia">' + (d ? d.getDate() : "–") + "</div>" +
      '<div class="mes">' + (d ? MES_CURTO[d.getMonth()] : "") + "</div></div>" +
      "<div>" +
        '<div class="titulo">' + (d ? esc(dataPorExtenso(d)) : esc(en.data)) + "</div>" +
        '<div class="meta">' + detalhes + (livro ? " · lendo " + esc(livro.titulo) : "") + "</div>" +
        (d ? '<div class="contagem">' + esc(quando(diasAte(d))) + "</div>" : "") +
        '<div class="presentes"></div>' +
        '<div class="acoes"></div>' +
      "</div>" +
    "</div></article>");

  const presentes = c.querySelector(".presentes");
  if (confirmadas.length) {
    confirmadas.forEach((p) => presentes.appendChild(el(avatarHtml(p.membra))));
  } else {
    presentes.appendChild(el('<span class="nenhuma">ninguém confirmou ainda</span>'));
  }

  const acoes = c.querySelector(".acoes");
  if (en.arquivado) {
    acoes.appendChild(botao("Trazer de volta", "btn fantasma mini", (b) => restaurarEncontro(en, b)));
  } else {
    if (!passado) {
      acoes.appendChild(botao(euVou ? "Não vou mais" : "Eu vou", euVou ? "btn fantasma mini" : "btn mini",
        (b) => alternarPresenca(en.id, b)));
    }
    acoes.appendChild(botao("Arquivar", "btn perigo mini", (b) => arquivarEncontro(en, b)));
  }
  return c;
}

function renderAgenda() {
  // seletor de livro do formulário (preserva o que estava escolhido)
  const selL = $("#novo-encontro-livro");
  if (document.activeElement !== selL) {
    const escolhido = selL.value;
    selL.innerHTML = '<option value="">Nenhum (opcional)</option>';
    naoArquivados(estado.livros).filter((l) => l.status !== "lido").forEach((l) =>
      selL.appendChild(el('<option value="' + esc(l.id) + '">' + esc(l.titulo) + "</option>")));
    selL.value = escolhido;
  }

  const cont = $("#lista-encontros");
  cont.innerHTML = "";
  const guardados = arquivados(estado.encontros);
  const vivos = naoArquivados(estado.encontros);
  if (!vivos.length && !guardados.length) {
    cont.appendChild(el('<p class="vazio">Nenhum encontro marcado ainda.</p>'));
    return;
  }

  const comData = vivos.map((en) => ({ en, d: comoData(en.data) }));
  const futuros = comData.filter((x) => x.d && diasAte(x.d) >= 0).sort((a, b) => a.d - b.d);
  const passados = comData.filter((x) => !x.d || diasAte(x.d) < 0).sort((a, b) => b.d - a.d);

  cont.appendChild(el('<h2 class="subtitulo">Próximos encontros</h2>'));
  if (!futuros.length) cont.appendChild(el('<p class="vazio">Nada marcado daqui pra frente.</p>'));
  futuros.forEach((x) => cont.appendChild(cartaoEncontro(x.en, false)));

  if (passados.length) {
    cont.appendChild(el('<h2 class="subtitulo">Já aconteceram</h2>'));
    passados.slice(0, 5).forEach((x) => cont.appendChild(cartaoEncontro(x.en, true)));
    if (passados.length > 5) {
      cont.appendChild(el('<p class="vazio">e mais ' + (passados.length - 5) + " encontro(s) antigo(s).</p>"));
    }
  }

  if (guardados.length) {
    cont.appendChild(el('<h2 class="subtitulo">Arquivados</h2>'));
    guardados.forEach((en) => cont.appendChild(cartaoEncontro(en, true)));
  }
}

// ============================================================
//  ABA 4 — RESENHAS
// ============================================================
function minhaResenha(livroId) { return estado.resenhas.find((r) => r.livro_id === livroId && r.membra === membra); }
function mediaNota(livroId) {
  const notas = estado.resenhas.filter((r) => r.livro_id === livroId && r.nota).map((r) => r.nota);
  if (!notas.length) return null;
  return (notas.reduce((a, b) => a + b, 0) / notas.length);
}
function estrelasFixas(n) {
  let s = "";
  for (let i = 1; i <= 5; i++) s += i <= n ? "<span>★</span>" : '<span class="off">★</span>';
  return '<span class="estrelas-fixas" aria-label="' + n + ' de 5">' + s + "</span>";
}

async function salvarResenha(livroId, nota, texto, btn) {
  const existente = minhaResenha(livroId);
  const ok = await gravar("salvar a resenha",
    () => existente
      ? db.from("resenhas").update({ nota, texto }).eq("id", existente.id)
      : db.from("resenhas").insert({ livro_id: livroId, membra, nota, texto }),
    btn, "Resenha salva.");
  // Limpa o rascunho e redesenha, para a marca "não salvo" sumir na hora.
  if (ok) { limparRascunho(livroId); renderLidos(); }
}

// Estrelas acessíveis: botões de verdade, com teclado e leitor de tela.
function seletorEstrelas(valorInicial, aoEscolher) {
  const wrap = el('<div class="estrelas n-' + valorInicial + '" role="radiogroup" aria-label="Sua nota de 1 a 5"></div>');
  for (let i = 1; i <= 5; i++) {
    const b = el('<button type="button" role="radio" aria-checked="' + (i === valorInicial) +
      '" aria-label="' + i + (i === 1 ? " estrela" : " estrelas") + '" data-n="' + i + '">★</button>');
    wrap.appendChild(b);
  }
  const aplicar = (n) => {
    wrap.className = "estrelas n-" + n;
    wrap.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(Number(b.dataset.n) === n)));
    aoEscolher(n);
  };
  wrap.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-n]");
    if (b) aplicar(Number(b.dataset.n));
  });
  wrap.addEventListener("keydown", (ev) => {
    const atual = Number(wrap.className.replace("estrelas n-", "")) || 0;
    if (ev.key === "ArrowRight" || ev.key === "ArrowUp") { ev.preventDefault(); aplicar(Math.min(5, atual + 1)); }
    if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") { ev.preventDefault(); aplicar(Math.max(1, atual - 1)); }
  });
  return wrap;
}

function renderLidos() {
  const cont = $("#lista-lidos");
  cont.innerHTML = "";
  // Do mais recente para o mais antigo; sem data vai para o fim.
  const lidos = naoArquivados(estado.livros).filter((l) => l.status === "lido")
    .sort((a, b) => String(b.terminado_em || "").localeCompare(String(a.terminado_em || ""))
                 || String(b.criado_em || "").localeCompare(String(a.criado_em || "")));
  if (!lidos.length) {
    cont.appendChild(el('<p class="vazio">Ainda não terminamos nenhum livro. Quando terminarem, marque como lido na aba Livros — ou adicione um livro antigo já como "Já lido".</p>'));
    return;
  }

  lidos.forEach((l) => {
    const media = mediaNota(l.id);
    const minha = minhaResenha(l.id);
    const rascunho = lerRascunho(l.id);

    const c = el('<article class="item" id="livro-' + esc(l.id) + '">' +
      '<div class="titulo">' + esc(l.titulo) + "</div>" +
      '<div class="meta">' + (l.autor ? "de " + esc(l.autor) + " · " : "") +
        (media ? "média " + media.toFixed(1).replace(".", ",") + " de 5 " + estrelasFixas(Math.round(media)) : "sem notas ainda") +
      "</div>" +
      '<div class="linha-data"><span class="linha-mono" style="margin-top:0">' +
        (l.terminado_em ? "terminado em " + esc(dataCurta(l.terminado_em)) : "sem data de término") +
      "</span></div></article>");
    c.querySelector(".linha-data").appendChild(botao(l.terminado_em ? "Alterar data" : "Informar data", "btn fantasma mini", (b) => alterarDataLido(l, b)));

    // ---- editor da pessoa que está usando ----
    if (membra) {
      let nota = rascunho ? rascunho.nota : (minha ? minha.nota : 0);
      const editor = el('<div class="editor-resenha"></div>');
      const rotulo = el('<div class="rotulo-editor">Sua nota, ' + esc(membra) + "</div>");
      editor.appendChild(rotulo);

      const txt = el('<textarea placeholder="O que você achou do livro?"></textarea>');
      txt.value = rascunho ? rascunho.texto : (minha ? minha.texto || "" : "");

      const marcarRascunho = () => {
        salvarRascunho(l.id, { nota, texto: txt.value });
        if (!rotulo.querySelector(".marca-rascunho")) {
          rotulo.appendChild(el('<span class="marca-rascunho"> · não salvo</span>'));
        }
      };
      if (rascunho) rotulo.appendChild(el('<span class="marca-rascunho"> · não salvo</span>'));

      const estrelas = seletorEstrelas(nota, (n) => { nota = n; marcarRascunho(); });
      txt.addEventListener("input", marcarRascunho);

      const salvar = botao(minha ? "Atualizar minha resenha" : "Salvar minha resenha", "btn", (b) => {
        if (!nota) { avisar("Escolha uma nota de 1 a 5 estrelas.", "erro"); return; }
        salvarResenha(l.id, nota, txt.value.trim(), b);
      });

      editor.appendChild(estrelas);
      editor.appendChild(txt);
      const acoes = el('<div class="acoes"></div>');
      acoes.appendChild(salvar);
      if (rascunho) {
        acoes.appendChild(botao("Descartar rascunho", "btn fantasma mini", () => { limparRascunho(l.id); renderLidos(); }));
      }
      editor.appendChild(acoes);
      c.appendChild(editor);
    }

    // ---- resenhas das outras ----
    estado.resenhas
      .filter((r) => r.livro_id === l.id && r.membra !== membra)
      .forEach((r) => {
        c.appendChild(el('<div class="resenha-item">' + avatarHtml(r.membra) +
          "<div><div class=\"quem\">" + esc(r.membra) + " " + estrelasFixas(r.nota || 0) + "</div>" +
          (r.texto ? '<p class="texto">"' + esc(r.texto) + '"</p>' : "") + "</div></div>"));
      });

    cont.appendChild(c);
  });
}

// ============================================================
//  Início
// ============================================================
function iniciar() {
  const nome = cfg.NOME_DO_CLUBE || "Vinho, Book e Prosa";
  $("#titulo-clube").textContent = nome;
  document.title = nome;

  pintarIdentidade();
  $("#btn-membra").addEventListener("click", abrirMenuConta);

  document.querySelectorAll(".aba").forEach((btn) => {
    btn.addEventListener("click", () => trocarAba(btn.dataset.aba));
  });
  try {
    const salva = sessionStorage.getItem("aba");
    if (salva) trocarAba(salva);
  } catch {}

  $("#form-livro").addEventListener("submit", addLivro);
  document.querySelectorAll('input[name="destino"]').forEach((r) => r.addEventListener("change", atualizarDicaDestino));
  $("#form-encontro").addEventListener("submit", addEncontro);
  $("#btn-atualizar").addEventListener("click", () => carregar());

  if (!db) { status(problemaConfig || "Banco não configurado", "erro"); return; }

  // O Supabase avisa quando a sessão muda — inclusive ao voltar do link do e-mail.
  db.auth.onAuthStateChange((_evento, nova) => {
    // Limpa o endereço, para o link de acesso não ficar visível na barra.
    if (location.hash.includes("access_token")) {
      history.replaceState(null, "", location.origin + location.pathname);
    }
    aplicarSessao(nova);
  });
  db.auth.getSession().then(({ data }) => aplicarSessao(data.session));

  // Atualização automática: a cada 15s, e só com a aba visível.
  setInterval(() => {
    if (document.visibilityState === "visible") carregar({ silencioso: true });
  }, 15000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") carregar({ silencioso: true });
  });
}

iniciar();
