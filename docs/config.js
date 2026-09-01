// ============================================================
//  CONFIGURAÇÃO — edite só este arquivo. É o único que você precisa mexer.
// ============================================================

// 1) Conexão com o banco (já preenchida — projeto "vinho-book-e-prosa",
//    criado na sua conta Supabase, região São Paulo).
//    Esta chave é do tipo "publicável": ela vai junto no site e serve
//    só para o app conversar com o banco. Não é a senha da sua conta.
const SUPABASE_URL = "https://fusnppamtxyjuyxpqfmk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1G0D7HqvBaF4MfGIW2ZnNQ_ar6wWS4x";

// 2) QUEM ENTRA NO CLUBE
//    A lista de membras NÃO fica mais aqui — ela vive no banco, na tabela
//    "membras", porque agora é ela que controla quem consegue entrar.
//    Para acrescentar alguém: Supabase -> Table Editor -> membras -> Insert row
//    (e-mail e nome). Ou peça ao Claude Code que ele faz.

// 3) NOME DO CLUBE (aparece no topo do app).
const NOME_DO_CLUBE = "Vinho, Book e Prosa";

// ---- não precisa mexer daqui pra baixo ----
window.APP_CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, NOME_DO_CLUBE };
