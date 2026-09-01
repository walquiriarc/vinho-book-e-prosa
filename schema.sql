-- ============================================================
--  Vinho, Book e Prosa — Banco de dados (Supabase / PostgreSQL)
-- ============================================================
--  Este arquivo JÁ FOI APLICADO no projeto "vinho-book-e-prosa".
--  Ele fica aqui como registro, e para o caso de você precisar
--  recriar o banco do zero um dia:
--  SQL Editor  ->  New query  ->  colar  ->  botão "Run".
--  Roda de uma vez só. Pode rodar de novo sem quebrar nada.
-- ============================================================

-- 1) LIVROS: a fila de leitura
create table if not exists livros (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  autor        text,
  sugerido_por text,
  -- status: 'fila' (esperando), 'atual' (lendo agora), 'lido' (concluído)
  status       text not null default 'fila',
  arquivado    boolean not null default false,
  criado_em    timestamptz not null default now()
);

-- 2) VOTOS: cada membra vota nos livros da fila (1 voto por membra por livro)
--    O voto liga e desliga em 'ativo' — a linha nunca é apagada.
create table if not exists votos (
  id        uuid primary key default gen_random_uuid(),
  livro_id  uuid not null references livros(id) on delete cascade,
  membra    text not null,
  ativo     boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (livro_id, membra)
);

-- 3) ENCONTROS: agenda das reuniões do clube
create table if not exists encontros (
  id        uuid primary key default gen_random_uuid(),
  data      date not null,
  hora      text,
  local     text,          -- endereço OU link da chamada de vídeo
  livro_id  uuid references livros(id) on delete set null,
  arquivado boolean not null default false,
  criado_em timestamptz not null default now()
);

-- 4) PRESENCAS: quem confirmou presença em cada encontro
--    Cancelar presença vira 'confirmado = false', não uma exclusão.
create table if not exists presencas (
  id          uuid primary key default gen_random_uuid(),
  encontro_id uuid not null references encontros(id) on delete cascade,
  membra      text not null,
  confirmado  boolean not null default true,
  criado_em   timestamptz not null default now(),
  unique (encontro_id, membra)
);

-- 5) RESENHAS: nota (1 a 5) e comentário de cada membra por livro
create table if not exists resenhas (
  id        uuid primary key default gen_random_uuid(),
  livro_id  uuid not null references livros(id) on delete cascade,
  membra    text not null,
  nota      int check (nota between 1 and 5),
  texto     text,
  criado_em timestamptz not null default now(),
  unique (livro_id, membra)
);

-- Colunas acrescentadas depois (para bancos que já existiam)
alter table livros    add column if not exists arquivado boolean not null default false;
alter table encontros add column if not exists arquivado boolean not null default false;
alter table votos     add column if not exists ativo     boolean not null default true;

-- Só pode existir UM livro com status 'atual' por vez (arquivados não contam).
drop index if exists um_livro_atual;
create unique index um_livro_atual on livros (status) where status = 'atual' and arquivado = false;

-- ============================================================
--  Permissões de acesso
-- ------------------------------------------------------------
--  O site é público na internet e a chave publicável vai junto
--  nele, então qualquer pessoa com o endereço consegue LER,
--  CRIAR e EDITAR. Para um clube fechado de 8 amigas, tudo bem.
--
--  O que NÃO liberamos é APAGAR: não existe política de delete,
--  e sem política o Postgres recusa a exclusão. Nada some do
--  banco — o que sai de vista é marcado como arquivado e volta
--  com um clique. Isso protege as resenhas e o histórico de
--  vocês contra um toque errado (ou contra um estranho curioso).
-- ============================================================

alter table livros    enable row level security;
alter table votos     enable row level security;
alter table encontros enable row level security;
alter table presencas enable row level security;
alter table resenhas  enable row level security;

-- Limpa políticas antigas (inclusive a versão anterior, que liberava tudo)
drop policy if exists acesso_livros    on livros;
drop policy if exists acesso_votos     on votos;
drop policy if exists acesso_encontros on encontros;
drop policy if exists acesso_presencas on presencas;
drop policy if exists acesso_resenhas  on resenhas;
drop policy if exists ler_livros on livros;      drop policy if exists criar_livros on livros;      drop policy if exists editar_livros on livros;
drop policy if exists ler_votos on votos;        drop policy if exists criar_votos on votos;        drop policy if exists editar_votos on votos;
drop policy if exists ler_encontros on encontros; drop policy if exists criar_encontros on encontros; drop policy if exists editar_encontros on encontros;
drop policy if exists ler_presencas on presencas; drop policy if exists criar_presencas on presencas; drop policy if exists editar_presencas on presencas;
drop policy if exists ler_resenhas on resenhas;  drop policy if exists criar_resenhas on resenhas;  drop policy if exists editar_resenhas on resenhas;

-- Ler, criar e editar: liberados. Apagar: nenhuma política = negado.
create policy ler_livros    on livros    for select using (true);
create policy criar_livros  on livros    for insert with check (true);
create policy editar_livros on livros    for update using (true) with check (true);

create policy ler_votos     on votos     for select using (true);
create policy criar_votos   on votos     for insert with check (true);
create policy editar_votos  on votos     for update using (true) with check (true);

create policy ler_encontros    on encontros for select using (true);
create policy criar_encontros  on encontros for insert with check (true);
create policy editar_encontros on encontros for update using (true) with check (true);

create policy ler_presencas    on presencas for select using (true);
create policy criar_presencas  on presencas for insert with check (true);
create policy editar_presencas on presencas for update using (true) with check (true);

create policy ler_resenhas    on resenhas for select using (true);
create policy criar_resenhas  on resenhas for insert with check (true);
create policy editar_resenhas on resenhas for update using (true) with check (true);
