// Identidade VBP: paleta e aparência independentes. Sem conexão com o banco.
(function () {
  "use strict";
  const raiz = document.documentElement;
  const PALETAS = ["vinho", "oliva"];
  const APARENCIAS = ["auto", "light", "dark"];
  const rotulos = { vinho: "Vinho & marfim", oliva: "Oliva & rosé" };
  function ler(chave, valores, padrao) {
    try { const valor = localStorage.getItem(chave); return valores.includes(valor) ? valor : padrao; }
    catch (_) { return padrao; }
  }
  let paleta = ler("vbp_paleta", PALETAS, "vinho");
  let aparencia = ler("vbp_aparencia", APARENCIAS, "auto");
  const consultaEscuro = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function aplicarAtributos() {
    raiz.dataset.paleta = paleta;
    if (aparencia === "auto") raiz.removeAttribute("data-theme");
    else raiz.dataset.theme = aparencia;
  }
  aplicarAtributos(); // Antes de carregar as folhas de estilo, para evitar troca de cores na abertura.
  function atualizar() {
    const escuro = aparencia === "dark" || (aparencia === "auto" && consultaEscuro && consultaEscuro.matches);
    const versao = escuro ? "inverso" : paleta;
    raiz.style.setProperty("--vbp-login-logo", 'url("marca/logos/VBP_simbolo_' + versao + '.svg")');
    document.querySelectorAll("img[data-marca]").forEach(function (img) {
      img.src = "marca/logos/VBP_" + img.dataset.marca + "_" + versao + ".svg";
    });
    document.querySelectorAll("[data-paleta-opcao]").forEach(function (botao) {
      botao.setAttribute("aria-pressed", String(botao.dataset.paletaOpcao === paleta));
    });
    const seletor = document.getElementById("marca-aparencia");
    if (seletor) seletor.value = aparencia;
    const cor = getComputedStyle(raiz).getPropertyValue("--vbp-primary").trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && cor) meta.content = cor;
    const manifesto = document.querySelector('link[rel="manifest"]');
    if (manifesto) manifesto.href = "marca/manifest-" + paleta + ".webmanifest";
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = "marca/icons/" + paleta + "-192.png";
    const apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (apple) apple.href = "marca/icons/" + paleta + "-180.png";
    const feedback = document.getElementById("marca-feedback");
    if (feedback) feedback.textContent = "Paleta " + rotulos[paleta] + ".";
  }
  function guardar() {
    try { localStorage.setItem("vbp_paleta", paleta); localStorage.setItem("vbp_aparencia", aparencia); }
    catch (_) {} // Preferências continuam funcionando com armazenamento bloqueado.
  }
  document.addEventListener("DOMContentLoaded", function () {
    atualizar();
    document.addEventListener("click", function (evento) {
      const botao = evento.target.closest("[data-paleta-opcao]");
      if (!botao || !PALETAS.includes(botao.dataset.paletaOpcao)) return;
      paleta = botao.dataset.paletaOpcao;
      guardar(); aplicarAtributos(); atualizar();
    });
    document.getElementById("marca-aparencia").addEventListener("change", function (evento) {
      if (!APARENCIAS.includes(evento.target.value)) return;
      aparencia = evento.target.value;
      guardar(); aplicarAtributos(); atualizar();
    });
  });
  if (consultaEscuro) {
    if (consultaEscuro.addEventListener) consultaEscuro.addEventListener("change", atualizar);
    else if (consultaEscuro.addListener) consultaEscuro.addListener(atualizar);
  }
})();
