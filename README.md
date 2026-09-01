# Vinho, Book e Prosa — guia de montagem (passo a passo)

Um app web para o clube: **fila de livros, votação, agenda de encontros e resenhas** — com os dados compartilhados entre as 8 membras. Todas acessam por **um único link**, do celular ou do computador, sem instalar nada. O visual segue a identidade do clube e acompanha o tema claro ou escuro do aparelho de cada uma.

O banco já está criado e conectado. Falta você **trocar os nomes das amigas no `config.js`** e **publicar o link**. Tempo estimado: **10 minutos**.

---

## Como funciona (em 1 minuto)

São 3 peças:

1. **O app** (estes arquivos aqui) — as telas que vocês usam.
2. **O Supabase** — um banco de dados grátis na nuvem que guarda os livros, votos, encontros e resenhas. É ele que faz as 8 verem os mesmos dados.
3. **O Netlify** (ou Vercel) — o serviço grátis que transforma o app num link para compartilhar.

Você não precisa entender de programação: é copiar, colar e clicar.

---

## PARTE 1 — Banco de dados · ✅ JÁ FEITO

O projeto **`vinho-book-e-prosa`** já foi criado na sua conta Supabase (região São Paulo,
plano gratuito) e as cinco tabelas já estão lá, com as permissões aplicadas.
Você não precisa fazer nada aqui.

Se um dia quiser ver o banco: https://supabase.com/dashboard → projeto `vinho-book-e-prosa`.

---

## PARTE 2 — Configurar o app · ⚠️ FALTA UMA COISA

A conexão com o banco já está preenchida no `config.js`. Falta só **uma** coisa,
e ela é obrigatória para as suas amigas conseguirem usar:

> Abra o **`config.js`** e troque `"Membra 2"`, `"Membra 3"`… pelos **nomes reais**
> das suas amigas. É essa lista que aparece na tela "Quem é você?".
> Pode ter mais ou menos de 8 nomes — é só acrescentar ou apagar linhas.

Se estiver usando o **Claude Code**, é só pedir: *"troca os nomes no config.js por
Ana, Bia, Carla..."* — ele faz.

---

## PARTE 3 — Testar no seu computador · ~2 min

Dê **dois cliques** no arquivo **`index.html`** — ele abre no navegador. No rodapé deve aparecer **"Conectado ✓"** (isso já foi testado aqui, contra o banco de verdade). Adicione um livro de teste para confirmar que salva, e depois remova.

- Se aparecer **"Sem conexão com o banco"**: o próprio rodapé diz o que está faltando.

---

## PARTE 4 — Publicar e gerar o link · ~10 min

O jeito mais simples (sem conta técnica):

1. Acesse **https://app.netlify.com/drop**.
2. **Arraste a pasta inteira** `clube-do-livro` para a área indicada na página.
3. Em segundos o Netlify te dá um **link** (ex.: `https://clube-do-livro-abc.netlify.app`).
4. Crie uma conta grátis (Google) quando ele pedir, para o link ficar permanente e você poder renomear.
5. **Mande esse link no grupo do WhatsApp.** Cada membra abre, escolhe o próprio nome no topo (em "Você é:") e começa a usar.

> Alternativa: **Vercel** (https://vercel.com) também funciona e é grátis. O Netlify Drop é o mais rápido porque é só arrastar.

---

## Como cada membra usa

- Na primeira vez que abre o link, o app pergunta **"Quem é você?"** e a pessoa escolhe o
  próprio nome. Fica lembrado naquele aparelho, e dá para trocar no botão do canto superior.
  Enquanto ninguém escolhe, o app não deixa gravar nada — assim ninguém vota no nome de outra.
- **Fila**: adicionar livros, definir o livro atual, marcar como lido.
  Só um livro fica como "Lendo agora" por vez.
- **Arquivar em vez de apagar**: o botão "Arquivar" tira o livro ou o encontro da tela sem
  destruir nada. Os itens guardados ficam numa seção "Arquivados" no fim da aba, com um
  botão "Trazer de volta". Nada neste app pode ser apagado de verdade.
- **Votação**: votar nos livros da fila (1 voto por pessoa por livro), com barra e destaque
  para o mais votado.
- **Agenda**: marcar encontros e confirmar presença. Os próximos aparecem primeiro, com
  contagem regressiva; os que já passaram ficam separados no fim.
- **Resenhas**: dar nota (estrelas) e escrever a opinião dos livros lidos.
  O que você digita fica guardado como rascunho mesmo antes de salvar — a atualização
  automática não apaga o que está sendo escrito.

O app atualiza sozinho a cada 15 segundos (só com a aba aberta na frente), então todas veem
as novidades quase na hora. Quando alguma gravação falha, aparece um aviso explicando o quê.

---

## Quer mudar alguma coisa? (usando o Claude Code)

Abra a pasta no Claude Code e peça em português, por exemplo:

- *"Muda as cores para tons de azul."*
- *"Adiciona um campo de número de páginas em cada livro."*
- *"Coloca um espaço para as citações favoritas de cada livro."*
- *"Quero que a votação mostre um pódio com os 3 mais votados."*

O `CLAUDE.md` deste projeto já explica ao Claude Code como o app é organizado, então ele entende tudo rápido. Depois de mudar, é só arrastar a pasta de novo no Netlify para atualizar o link.

---

## Perguntas comuns

**É seguro?** Vale saber como funciona de verdade: o site fica **público na internet** e a
chave do banco vai junto nele. Quem tiver o endereço consegue ler, escrever e editar. Na prática
ninguém chega lá por acaso, e para um clube fechado de 8 amigas isso é aceitável — mas não é um
cofre, então não guarde nada sensível ali.

O que **já está protegido**: ninguém consegue apagar nada. O banco não tem permissão de exclusão,
então livros, encontros, votos e resenhas não podem ser destruídos nem por engano nem por um
estranho curioso. O botão "Arquivar" só tira o item da tela — ele fica guardado e volta com um
clique. Isso foi testado tentando apagar de propósito: o registro sobreviveu.

**Precisa pagar algo?** Não. Supabase e Netlify têm planos grátis de sobra para 8 pessoas.

**Perco os dados se atualizar o app?** Não. Os dados ficam no Supabase, separados do app. Você pode republicar à vontade.

**Funciona no celular?** Sim, o layout se adapta. As membras podem até "adicionar à tela inicial" pelo navegador para virar um ícone parecido com app.
