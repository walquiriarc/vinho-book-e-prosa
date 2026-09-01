// ============================================================
//  CONFIGURAÇÃO — edite só este arquivo. É o único que você precisa mexer.
// ============================================================

// 1) Conexão com o banco (já preenchida — projeto "vinho-book-e-prosa",
//    criado na sua conta Supabase, região São Paulo).
//    Esta chave é do tipo "publicável": ela vai junto no site e serve
//    só para o app conversar com o banco. Não é a senha da sua conta.
const SUPABASE_URL = "https://fusnppamtxyjuyxpqfmk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1G0D7HqvBaF4MfGIW2ZnNQ_ar6wWS4x";

// 2) OS NOMES DAS 8 MEMBRAS.
//    É a lista que aparece na tela "Quem é você?" quando cada uma abre o app.
//    Entrou alguém nova? Acrescente uma linha aqui e publique o site de novo.
const MEMBRAS = [
  "Wal",
  "Débora",
  "Morgana",
  "Bruninha",
  "Mari",
  "Ana Luisa",
  "Ana Luiza França",
  "Sarinha",
];

// 3) NOME DO CLUBE (aparece no topo do app).
const NOME_DO_CLUBE = "Vinho, Book e Prosa";

// ---- não precisa mexer daqui pra baixo ----
window.APP_CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, MEMBRAS, NOME_DO_CLUBE };
