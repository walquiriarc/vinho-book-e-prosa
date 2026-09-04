# Contexto para o Claude Code — Vinho, Book e Prosa

App web simples (sem build, sem framework) para o clube do livro de 8 membras.
Dados compartilhados via Supabase. Publicado como site estático (Netlify/Vercel).

## Stack
- HTML + CSS + JavaScript puro (vanilla). **Sem** Node/npm/bundler/build.
- Supabase JS v2, carregado por CDN no `index.html`.
- Persistência: tabelas no Supabase (ver `schema.sql`).
- **Login por e-mail** (link mágico do Supabase Auth). Quem você é vem do login,
  não de uma escolha na tela — ninguém consegue agir no nome de outra.
  A lista de quem pode entrar é a tabela `membras` no banco.

## Arquivos
Só a pasta **`docs/`** vai para o ar — ela contém o SITE, apesar do nome.
O nome é imposição do GitHub Pages, que só publica da raiz ou de `docs/`.
README.md, CLAUDE.md e schema.sql ficam FORA dela, para não serem servidos
publicamente junto com o app.

- `docs/index.html` — estrutura: cabeçalho (nome do clube + botão de identidade), 4 abas
  (**livros**, votação, agenda, **lidos**), rodapé com status, `#avisos` e `#modal-root`.
  Na aba Livros, o formulário de adicionar tem um seletor de destino (Quero ler /
  Lendo agora / Já lido); "Já lido" mostra o campo de data.
- `docs/styles.css` — identidade visual do clube. Tudo sai de variáveis em `:root`.
- `docs/config.js` — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NOME_DO_CLUBE`.
  A lista de membras NÃO está mais aqui: ela vive na tabela `membras`.
- `docs/app.js` — toda a lógica.
- `schema.sql` — tabelas, índice de unicidade e políticas RLS.

## Identidade visual
Paleta ameixa com quatro cores de seção — fila (mostarda), votação (ameixa),
agenda (coral), resenhas (verde-azulado). Tipografia: **Fraunces** nos títulos,
**Karla** no texto, **Space Mono** em rótulos, datas e números.
Tema claro e escuro completos.

## Tabelas
- `livros(id, titulo, autor, sugerido_por, status, arquivado, terminado_em)` — status ∈ {fila, atual, lido}.
  Na tela, `fila` aparece como **"Quero ler"** (o nome interno não mudou). `terminado_em` é
  preenchido com hoje ao virar `lido`, zerado ao voltar para `fila`, e editável na aba Lidos.
  Um índice parcial garante **um único** livro `atual` (arquivados não contam).
- `votos(id, livro_id, membra, ativo)` — único por (livro_id, membra)
- `encontros(id, data, hora, local, livro_id, arquivado)`
- `presencas(id, encontro_id, membra, confirmado)` — único por (encontro_id, membra)
- `resenhas(id, livro_id, membra, nota 1..5, texto)` — único por (livro_id, membra)

## SÓ MEMBRAS ENTRAM — regra estrutural
Todas as políticas do banco são `to authenticated using (public.eh_membra())`.
Consequências:
- Sem login, o Supabase devolve **zero linhas** e recusa qualquer escrita.
- Logada com e-mail fora da tabela `membras`: também zero. O app mostra
  "esse e-mail não está na lista".
- `aplicarSessao()` no `app.js` é o coração disso: consulta `membras` pelo e-mail
  da sessão, define `membra` (o nome de exibição) e só então chama `carregar()`.
- `carregar()` retorna cedo se `membra` for nulo — não adianta buscar deslogada.
- Para acrescentar alguém: `insert into membras (email, nome) values (...)`.
- Ao mudar o endereço do site, atualize **Site URL** e **Redirect URLs** no painel
  do Supabase (Authentication -> URL Configuration), senão o link do e-mail volta
  para o lugar errado.

## NADA É APAGADO — regra estrutural
O banco **não tem política de delete**. Sem política, o Postgres recusa qualquer
exclusão, mesmo com a chave publicável que vai no site. Consequências para quem
mexer no código:
- **Uma única exceção à regra de não apagar:** livro SEM histórico (nenhum voto ativo,
  nenhuma resenha, nenhum encontro ligado) pode ser excluído de vez — política
  `excluir_livros` + função `livro_tem_historico()`. No app, `botaoRemover(l)` mostra
  "Excluir" ou "Arquivar" conforme `temHistorico(l)`. `excluirLivro()` pede `.select("id")`
  de volta: zero linhas significa que o banco recusou (o app avisa para arquivar).
  Fora esse caso, **nunca escreva `.delete()` no app.**
- Tirar de vista = `arquivado = true` (livros, encontros). Voltar = `arquivado = false`.
- Tirar um voto = `ativo = false` na mesma linha. Cancelar presença = `confirmado = false`.
- As listas usam `naoArquivados()` / `arquivados()` para separar o que aparece.
- Livro que volta do arquivo entra como `fila`, nunca como `atual` — outro livro
  pode ter virado a leitura atual enquanto ele estava guardado.

## Como o app.js está organizado
- `carregar()` busca as 5 tabelas, **confere o erro de todas elas** e só substitui
  o `estado` se tudo deu certo. Numa falha, mantém na tela o que já tinha.
- `gravar(oQue, executar, botao, mensagem)` é o caminho único de toda escrita:
  exige banco e identidade, trava o botão, lê o `error` que o Supabase devolve,
  recarrega e avisa. **Nunca chame `db.from(...).insert()` direto.**
- `avisar(texto, tipo)` mostra um aviso flutuante. `status(texto, classe)` escreve no rodapé.
- `abrirModal({...})` / `fecharModal()` para diálogos; `abrirEscolhaMembra()` é a tela
  "Quem é você?".
- Render: `renderLivros`, `renderVotacao`, `renderAgenda`, `renderLidos`, coordenadas
  por `renderTudo()`. A aba Lidos ordena por `terminado_em` decrescente (sem data vai ao fim).
- `trocarAba(nome, livroId?)` aceita um id para rolar até o cartão `#livro-<id>` — usado
  ao adicionar ou marcar um livro como lido, para levar a pessoa direto até ele.
- Atualização automática a cada 15s, só com a aba visível.

## Convenções
- Código e comentários em **português (pt-BR)**.
- Escapar texto vindo das pessoas com `esc()` ao montar HTML.
- **Cores só via variáveis do `:root`.** Nunca escreva uma cor literal dentro de um
  `@media` ou de um bloco `[data-theme]` — isso quebra um dos dois temas.
- **Não redesenhe por cima de quem está digitando.** `renderTudo()` adia o redesenho
  quando o foco está numa área que será recriada (`AREAS_RECRIADAS`). Se você criar
  uma nova área dinâmica com campos dentro, acrescente o seletor dela nessa constante.
- Rascunhos de resenha ficam em `sessionStorage` e repovoam o editor depois de um
  redesenho. Limpe com `limparRascunho()` quando a gravação der certo.
- Toda escrita passa por `gravar()`, e todo erro fala com a pessoa em português.
- Não introduzir passo de build: manter tudo abrível com dois cliques em `index.html`.

## Como testar
Abrir `index.html` no navegador. O rodapé mostra "Conectado ✓" quando o Supabase responde.
Sem o `config.js` preenchido, o rodapé diz exatamente o que está faltando.

## Publicar
Arrastar a pasta em https://app.netlify.com/drop (ou usar Vercel).
Republicar sobrescreve; os dados no Supabase permanecem.
