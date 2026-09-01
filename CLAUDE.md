# Contexto para o Claude Code — Vinho, Book e Prosa

App web simples (sem build, sem framework) para o clube do livro de 8 membras.
Dados compartilhados via Supabase. Publicado como site estático (Netlify/Vercel).

## Stack
- HTML + CSS + JavaScript puro (vanilla). **Sem** Node/npm/bundler/build.
- Supabase JS v2, carregado por CDN no `index.html`.
- Persistência: tabelas no Supabase (ver `schema.sql`).
- Identidade sem login: a pessoa escolhe seu nome numa lista (`MEMBRAS` em `config.js`),
  guardado em `localStorage` do aparelho dela. A escolha é **obrigatória** — sem ela
  o app não grava nada, para ninguém votar no nome de outra pessoa por engano.

## Arquivos
- `index.html` — estrutura: cabeçalho (nome do clube + botão de identidade), 4 abas
  (fila, votação, agenda, resenhas), rodapé com status, `#avisos` e `#modal-root`.
- `styles.css` — identidade visual do clube. Tudo sai de variáveis em `:root`.
- `config.js` — **único arquivo que a usuária edita**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `MEMBRAS`, `NOME_DO_CLUBE`. Exposto em `window.APP_CONFIG`.
- `app.js` — toda a lógica.
- `schema.sql` — tabelas, índice de unicidade e políticas RLS.

## Identidade visual
Paleta ameixa com quatro cores de seção — fila (mostarda), votação (ameixa),
agenda (coral), resenhas (verde-azulado). Tipografia: **Fraunces** nos títulos,
**Karla** no texto, **Space Mono** em rótulos, datas e números.
Tema claro e escuro completos.

## Tabelas
- `livros(id, titulo, autor, sugerido_por, status, arquivado)` — status ∈ {fila, atual, lido}.
  Um índice parcial garante **um único** livro `atual` (arquivados não contam).
- `votos(id, livro_id, membra, ativo)` — único por (livro_id, membra)
- `encontros(id, data, hora, local, livro_id, arquivado)`
- `presencas(id, encontro_id, membra, confirmado)` — único por (encontro_id, membra)
- `resenhas(id, livro_id, membra, nota 1..5, texto)` — único por (livro_id, membra)

## NADA É APAGADO — regra estrutural
O banco **não tem política de delete**. Sem política, o Postgres recusa qualquer
exclusão, mesmo com a chave publicável que vai no site. Consequências para quem
mexer no código:
- **Nunca escreva `.delete()` no app.** Não vai funcionar e não deve.
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
- Render: `renderFila`, `renderVotacao`, `renderAgenda`, `renderResenhas`, coordenadas
  por `renderTudo()`.
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
