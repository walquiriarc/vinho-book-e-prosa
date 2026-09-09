# Vinho, Book e Prosa — guia de montagem (passo a passo)

Um app web para o clube: **fila de livros, votação, agenda de encontros e resenhas** — com os dados compartilhados entre as 8 membras. Todas acessam por **um único link**, do celular ou do computador, sem instalar nada. O visual segue a identidade do clube e acompanha o tema claro ou escuro do aparelho de cada uma.

O banco já está criado e conectado. Falta você **trocar os nomes das amigas no `config.js`** e **publicar o link**. Tempo estimado: **10 minutos**.


**O app está no ar:** https://walquiriarc.github.io/vinho-book-e-prosa/
**Código:** https://github.com/walquiriarc/vinho-book-e-prosa

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

Dê **dois cliques** no arquivo **`docs/index.html`** — ele abre no navegador. No rodapé deve aparecer **"Conectado ✓"** (isso já foi testado aqui, contra o banco de verdade). Adicione um livro de teste para confirmar que salva, e depois remova.

- Se aparecer **"Sem conexão com o banco"**: o próprio rodapé diz o que está faltando.

---

## PARTE 4 — Publicar · ✅ JÁ FEITO

O site está publicado pelo **GitHub Pages**, a partir do repositório
`walquiriarc/vinho-book-e-prosa` (branch `main`):

> **https://walquiriarc.github.io/vinho-book-e-prosa/**

É esse o link para mandar no grupo do WhatsApp.

### Para atualizar o site depois de mexer no código

No Terminal, dentro da pasta do projeto:

```
cd ~/Downloads/clube-do-livro
git add -A
git commit -m "descreva a mudanca"
git push
```

Em cerca de um minuto o site no ar já reflete a alteração. Os dados no Supabase
não são afetados — eles ficam no banco, separados do site.

---

## Instalar como app no celular (sem loja)

Não precisa de Play Store nem App Store. Depois de entrar, o app oferece **"Leve o clube
para a tela inicial"**. No Android é um toque em *Instalar*; no iPhone, pelo Safari:
*Compartilhar → Adicionar à Tela de Início*. Fica um ícone do clube, abre em tela cheia,
como app de verdade — e abre mesmo sem internet (mostrando o que estava em cache).

**Importante no iPhone:** entre pelo ícone e, na tela do e-mail, **digite o código de 6
dígitos** em vez de clicar no link — o link abre no Safari, fora do app.

## Como cada membra usa

- Na primeira vez, o app pede **o e-mail** e manda uma mensagem com um **código de 6
  dígitos** e um link. Ela digita o código (ou clica no link) e entra — sem senha para
  decorar. Depois disso o aparelho lembra.
- **Só os e-mails cadastrados entram.** Quem não está na lista do clube não vê nada,
  nem tendo o endereço do site. E como a entrada é por e-mail, ninguém consegue votar
  ou resenhar no nome de outra.
- **Livros**: adicionar livros escolhendo onde entram — **Quero ler**, **Lendo agora** ou
  **Já lido** (bom para cadastrar de uma vez o histórico do clube). Só um livro fica como
  "Lendo agora" por vez: ao colocar outro, o anterior volta para Quero ler, e o app avisa.
- **Arquivar em vez de apagar**: o botão "Arquivar" tira o livro ou o encontro da tela sem
  destruir nada. Os itens guardados ficam numa seção "Arquivados" no fim da aba, com um
  botão "Trazer de volta". Nada neste app pode ser apagado de verdade.
- **Votação**: votar nos livros de Quero ler (1 voto por pessoa por livro), com barra e destaque
  para o mais votado.
- **Agenda**: marcar encontros e confirmar presença. Os próximos aparecem primeiro, com
  contagem regressiva; os que já passaram ficam separados no fim.
- **Lidos**: os livros terminados, do mais recente para o mais antigo, cada um com a nota
  (estrelas) e a opinião de cada uma. A data de término é preenchida sozinha e dá para ajustar.
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
