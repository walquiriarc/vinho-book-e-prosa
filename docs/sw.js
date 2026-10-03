// Service worker: deixa o app instalável e abre mesmo sem internet
// (com o que estava em cache). Dados do Supabase nunca passam por aqui.
const VERSAO = "vbp-v2-identidade-dupla";
const CASCA = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./config.js",
  "./manifest.webmanifest",
  "./marca/brand.js",
  "./marca/fonts.css",
  "./marca/tokens.css",
  "./marca/fonts/cormorant-medium-italic.woff",
  "./marca/fonts/cormorant-semibold.woff",
  "./marca/fonts/lato-bold.woff",
  "./marca/fonts/lato-regular.woff",
  "./marca/logos/VBP_horizontal_oliva.svg",
  "./marca/logos/VBP_horizontal_vinho.svg",
  "./marca/logos/VBP_inverso_oliva.svg",
  "./marca/logos/VBP_inverso_vinho.svg",
  "./marca/logos/VBP_monocromatico_oliva.svg",
  "./marca/logos/VBP_monocromatico_vinho.svg",
  "./marca/logos/VBP_nome_inverso.svg",
  "./marca/logos/VBP_nome_oliva.svg",
  "./marca/logos/VBP_nome_vinho.svg",
  "./marca/logos/VBP_selo_oliva.svg",
  "./marca/logos/VBP_selo_vinho.svg",
  "./marca/logos/VBP_simbolo_inverso.svg",
  "./marca/logos/VBP_simbolo_oliva.svg",
  "./marca/logos/VBP_simbolo_vinho.svg",
  "./marca/logos/VBP_vertical_oliva.svg",
  "./marca/logos/VBP_vertical_vinho.svg",
  "./marca/manifest-vinho.webmanifest",
  "./marca/manifest-oliva.webmanifest",
  "./marca/icons/vinho-180.png",
  "./marca/icons/vinho-192.png",
  "./marca/icons/vinho-512.png",
  "./marca/icons/vinho-maskable-512.png",
  "./marca/icons/oliva-180.png",
  "./marca/icons/oliva-192.png",
  "./marca/icons/oliva-512.png",
  "./marca/icons/oliva-maskable-512.png"
];

self.addEventListener("install", (e) => {
  // Um arquivo faltando não pode derrubar a instalação inteira: guarda o que der.
  e.waitUntil(caches.open(VERSAO).then(async (c) => {
    for (const u of CASCA) { try { await c.add(u); } catch (_) {} }
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Só o que é nosso e só leitura. Supabase e CDN vão direto à rede.
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.includes("/capas/") || url.pathname.includes("/icones/") || url.pathname.includes("/marca/icons/")) {
    // imagens: cache primeiro (mudam raramente)
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      const copia = res.clone(); caches.open(VERSAO).then((c) => c.put(e.request, copia)); return res;
    })));
    return;
  }
  // código e páginas: rede primeiro (para atualizar na hora), cache se estiver sem internet
  e.respondWith(fetch(e.request).then((res) => {
    const copia = res.clone(); caches.open(VERSAO).then((c) => c.put(e.request, copia)); return res;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html"))));
});
