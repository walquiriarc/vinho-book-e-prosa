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
  terminado_em date,   -- quando o clube terminou (preenchido ao marcar como lido; editável)
  capa_url     text,   -- imagem da capa: arquivo em docs/capas/ ou link externo
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
alter table livros    add column if not exists terminado_em date;
alter table livros    add column if not exists capa_url text;

-- Só pode existir UM livro com status 'atual' por vez (arquivados não contam).
drop index if exists um_livro_atual;
create unique index um_livro_atual on livros (status) where status = 'atual' and arquivado = false;

-- ============================================================
--  QUEM ENTRA NO CLUBE
-- ------------------------------------------------------------
--  O login é por e-mail (link mágico do Supabase). Só os e-mails
--  desta tabela enxergam qualquer coisa. Para acrescentar alguém:
--    insert into membras (email, nome) values ('fulana@x.com','Fulana');
-- ============================================================
create table if not exists membras (
  id        uuid primary key default gen_random_uuid(),
  email     text not null unique,
  nome      text not null,
  criado_em timestamptz not null default now()
);

create or replace function public.normaliza_email() returns trigger
language plpgsql as $$
begin
  new.email := lower(trim(new.email));
  return new;
end $$;

drop trigger if exists membras_normaliza_email on membras;
create trigger membras_normaliza_email before insert or update on membras
  for each row execute function public.normaliza_email();

-- "Quem está pedindo é do clube?"
create or replace function public.eh_membra() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from membras
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.meu_nome() returns text
language sql stable security definer set search_path = public as $$
  select nome from membras
  where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

alter table membras enable row level security;

-- ============================================================
--  Permissões de acesso
-- ------------------------------------------------------------
--  SÓ MEMBRAS LOGADAS. Quem não fez login não enxerga uma linha,
--  mesmo tendo a chave que vai dentro do site. Quem fez login com
--  um e-mail fora da tabela "membras" também não enxerga nada.
--
--  E ninguém APAGA: não existe política de delete, e sem política
--  o Postgres recusa a exclusão. O que sai de vista é marcado como
--  arquivado e volta com um clique.
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
create policy ler_livros on livros for select to authenticated using (public.eh_membra());
create policy criar_livros on livros for insert to authenticated with check (public.eh_membra());
create policy editar_livros on livros for update to authenticated using (public.eh_membra()) with check (public.eh_membra());

create policy ler_votos on votos for select to authenticated using (public.eh_membra());
create policy criar_votos on votos for insert to authenticated with check (public.eh_membra());
create policy editar_votos on votos for update to authenticated using (public.eh_membra()) with check (public.eh_membra());

create policy ler_encontros on encontros for select to authenticated using (public.eh_membra());
create policy criar_encontros on encontros for insert to authenticated with check (public.eh_membra());
create policy editar_encontros on encontros for update to authenticated using (public.eh_membra()) with check (public.eh_membra());

create policy ler_presencas on presencas for select to authenticated using (public.eh_membra());
create policy criar_presencas on presencas for insert to authenticated with check (public.eh_membra());
create policy editar_presencas on presencas for update to authenticated using (public.eh_membra()) with check (public.eh_membra());

create policy ler_resenhas on resenhas for select to authenticated using (public.eh_membra());
create policy criar_resenhas on resenhas for insert to authenticated with check (public.eh_membra());
create policy editar_resenhas on resenhas for update to authenticated using (public.eh_membra()) with check (public.eh_membra());

-- A lista de membras: cada membra vê o clube inteiro. Estranho não vê nada.
drop policy if exists ler_membras on membras;
create policy ler_membras on membras for select to authenticated using (public.eh_membra());

-- ============================================================
--  A ÚNICA exclusão permitida: livro sem histórico
-- ------------------------------------------------------------
--  Livro que ninguém votou, ninguém resenhou e nenhum encontro usa
--  pode ser excluído de vez (erro de digitação, duplicado). Com
--  qualquer histórico, só arquivar.
-- ============================================================
create or replace function public.livro_tem_historico(livro uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from votos     v where v.livro_id = livro and v.ativo)
      or exists (select 1 from resenhas  r where r.livro_id = livro)
      or exists (select 1 from encontros e where e.livro_id = livro);
$$;

drop policy if exists excluir_livros on livros;
create policy excluir_livros on livros for delete to authenticated
  using (public.eh_membra() and not public.livro_tem_historico(id));

-- ============================================================
--  Outubro de 2026 — progresso de leitura, séries e filmes,
--  aniversários, sessões de cinema e cadastro de membras pelo app
-- ------------------------------------------------------------
--  Tudo aqui é aditivo: coluna nova, tabela nova, política nova.
--  Nenhuma política existente ficou mais permissiva e continua
--  não existindo política de delete. Pode rodar de novo sem quebrar.
-- ============================================================

-- 6) Tipo do item em "Quero ler": livro (padrão), série ou filme.
--    Só livro vira "atual" e só livro entra na votação — o app cuida disso.
alter table livros add column if not exists tipo text not null default 'livro';
alter table livros drop constraint if exists livros_tipo_valido;
alter table livros add constraint livros_tipo_valido check (tipo in ('livro', 'serie', 'filme'));

-- 7) Total de páginas do livro (opcional): com ele o progresso vira porcentagem.
alter table livros add column if not exists paginas int;
alter table livros drop constraint if exists livros_paginas_positivas;
alter table livros add constraint livros_paginas_positivas check (paginas is null or paginas > 0);

-- 8) PROGRESSOS: em que página cada membra está em cada livro (1 linha por membra por livro).
create table if not exists progressos (
  id            uuid primary key default gen_random_uuid(),
  livro_id      uuid not null references livros(id) on delete cascade,
  membra        text not null,
  pagina        int not null default 0 check (pagina >= 0),
  atualizado_em timestamptz not null default now(),
  criado_em     timestamptz not null default now(),
  unique (livro_id, membra)
);
alter table progressos enable row level security;
drop policy if exists ler_progressos on progressos;
drop policy if exists criar_progressos on progressos;
drop policy if exists editar_progressos on progressos;
create policy ler_progressos on progressos for select to authenticated using (public.eh_membra());
create policy criar_progressos on progressos for insert to authenticated with check (public.eh_membra());
create policy editar_progressos on progressos for update to authenticated using (public.eh_membra()) with check (public.eh_membra());

-- Um livro com página marcada também "tem histórico": só arquiva, não exclui.
create or replace function public.livro_tem_historico(livro uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from votos      v where v.livro_id = livro and v.ativo)
      or exists (select 1 from resenhas   r where r.livro_id = livro)
      or exists (select 1 from encontros  e where e.livro_id = livro)
      or exists (select 1 from progressos p where p.livro_id = livro);
$$;

-- 9) Tipo do encontro: o encontro do clube (padrão) ou a sessão de cinema.
alter table encontros add column if not exists tipo text not null default 'encontro';
alter table encontros drop constraint if exists encontros_tipo_valido;
alter table encontros add constraint encontros_tipo_valido check (tipo in ('encontro', 'cinema'));

-- 10) Aniversário de cada membra: só dia e mês (repete todo ano, o ano não importa).
alter table membras add column if not exists aniversario_dia smallint;
alter table membras add column if not exists aniversario_mes smallint;
alter table membras drop constraint if exists membras_aniversario_valido;
alter table membras add constraint membras_aniversario_valido check (
  (aniversario_dia is null and aniversario_mes is null)
  or (aniversario_dia between 1 and 31 and aniversario_mes between 1 and 12)
);

-- 11) Cadastro de membra pelo app: uma membra logada pode acrescentar outra
--     e guardar aniversários. O e-mail não muda depois de cadastrado — é ele
--     que abre a porta, e uma troca errada deixaria alguém de fora.
drop policy if exists criar_membras on membras;
drop policy if exists editar_membras on membras;
create policy criar_membras on membras for insert to authenticated with check (public.eh_membra());
create policy editar_membras on membras for update to authenticated using (public.eh_membra()) with check (public.eh_membra());

create or replace function public.membras_email_fixo() returns trigger
language plpgsql as $$
begin
  if lower(trim(new.email)) is distinct from old.email then
    raise exception 'O e-mail de uma membra não muda depois de cadastrado.' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists membras_email_fixo on membras;
create trigger membras_email_fixo before update on membras
  for each row execute function public.membras_email_fixo();

-- ============================================================
--  Endurecimento (21/10/2026, avisos do linter de segurança do Supabase)
--  Sem mudança de comportamento: as políticas rodam como `authenticated`,
--  que continua podendo chamar as funções; só quem não entrou perde o acesso.
-- ============================================================
alter function public.normaliza_email() set search_path = public;
alter function public.membras_email_fixo() set search_path = public;
revoke execute on function public.eh_membra() from public, anon;
revoke execute on function public.meu_nome() from public, anon;
revoke execute on function public.livro_tem_historico(uuid) from public, anon;
grant execute on function public.eh_membra() to authenticated;
grant execute on function public.meu_nome() to authenticated;
grant execute on function public.livro_tem_historico(uuid) to authenticated;
