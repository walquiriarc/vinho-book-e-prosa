---
version: alpha
name: VBP App · oliva-dark
colors:
  background: '#211D1A'
  surface: '#2B2521'
  surface-subtle: '#352C28'
  text: '#F6F0E7'
  text-muted: '#D1C0B3'
  border: '#51453C'
  control-border: '#938174'
  rose: '#D9B3AA'
  rose-ink: '#D9B3AA'
  champagne: '#C6A579'
  on-primary: '#211D1A'
  disabled-background: '#3F3530'
  disabled-text: '#D1C0B3'
  success: '#B9CEA7'
  success-background: '#2D3829'
  warning: '#E3C897'
  warning-background: '#3F3421'
  error: '#E9AAA9'
  error-background: '#432A2C'
  info: '#BBD0E0'
  info-background: '#273440'
  primary: '#CCD4B5'
  primary-hover: '#DCE1C9'
  primary-active: '#E7EBDC'
  primary-soft: '#35402C'
  focus: '#CCD4B5'
typography:
  display-lg:
    fontFamily: Cormorant Garamond
    fontSize: 3.5rem
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -0.025em
  display-md:
    fontFamily: Cormorant Garamond
    fontSize: 2.75rem
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Cormorant Garamond
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Cormorant Garamond
    fontSize: 1.875rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Cormorant Garamond
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0em
  title-md:
    fontFamily: Lato
    fontSize: 1.125rem
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0em
  body-lg:
    fontFamily: Lato
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0em
  body-md:
    fontFamily: Lato
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: Lato
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label-md:
    fontFamily: Lato
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: 0.01em
  caption:
    fontFamily: Lato
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  overline:
    fontFamily: Lato
    fontSize: 0.8125rem
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.1em
spacing:
  '0': 0rem
  '1': 0.25rem
  '2': 0.5rem
  '3': 0.75rem
  '4': 1rem
  '5': 1.25rem
  '6': 1.5rem
  '8': 2rem
  '10': 2.5rem
  '12': 3rem
  '16': 4rem
  '24': 6rem
rounded:
  control: 4px
  card: 4px
  full: 9999px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.control}'
    height: 44px
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
    textColor: '{colors.on-primary}'
  button-primary-active:
    backgroundColor: '{colors.primary-active}'
    textColor: '{colors.on-primary}'
  button-disabled:
    backgroundColor: '{colors.disabled-background}'
    textColor: '{colors.disabled-text}'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.card}'
    padding: '{spacing.6}'
  page:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text}'
  muted:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text-muted}'
  layer:
    backgroundColor: '{colors.surface-subtle}'
    textColor: '{colors.text}'
  badge-brand:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.primary}'
  input-focus:
    textColor: '{colors.focus}'
  decorative-border:
    backgroundColor: '{colors.border}'
  input-border:
    backgroundColor: '{colors.control-border}'
  rose-detail:
    backgroundColor: '{colors.rose}'
  lettering-detail:
    textColor: '{colors.rose-ink}'
  ornament:
    backgroundColor: '{colors.champagne}'
  status-success:
    backgroundColor: '{colors.success-background}'
    textColor: '{colors.success}'
  status-warning:
    backgroundColor: '{colors.warning-background}'
    textColor: '{colors.warning}'
  status-error:
    backgroundColor: '{colors.error-background}'
    textColor: '{colors.error}'
  status-info:
    backgroundColor: '{colors.info-background}'
    textColor: '{colors.info}'
---

# Vinho, Book e Prosa — identidade do aplicativo

## Overview
O encontro é o centro. O aplicativo organiza o que o clube já faz: livros, votação, agenda e resenhas. A direção editorial combina a assinatura VBP, papel marfim, títulos com presença e texto próximo. Não acrescentar linguagens de luxo que afastem as integrantes.

Vinho & marfim e Oliva & rosé são duas expressões oficiais equivalentes. As duas têm os mesmos componentes, telas e recursos. Aparência clara/escura é outra preferência, independente da paleta. Resultam quatro modos: vinho-light, vinho-dark, oliva-light e oliva-dark. A escolha inicial técnica é vinho com aparência do aparelho; cada pessoa pode escolher livremente e a preferência fica no dispositivo.

## Colors
Os valores executáveis vivem em `design-system/system.json`, com os quatro modos em `resolved.json` e nos JSONs DTCG. Os exports CSS já estão prontos em `docs/marca/tokens.css`. A seleção usa `data-paleta="vinho|oliva"` e `data-theme="light|dark"`; sem `data-theme`, segue o aparelho. No modo claro, os valores aprovados de assinatura são #63121C e #626B50, com marfim #F6F0E7. O modo escuro usa derivados claros da assinatura para preservar a leitura; os logos usam contornos inversos em marfim.

`primary` dá identidade a ações e seleção; `text` e `text-muted` sustentam leitura; `surface` e `background` diferenciam papel e página. `border` separa áreas; `control-border` identifica campos com contraste maior. `rose`, `rose-ink` e `champagne` são detalhes decorativos ou do lettering, não cores de texto corrido. `success`, `warning`, `error` e `info` têm funções de estado, sempre acompanhadas por palavras. As cores das quatro seções do app apontam para a assinatura do tema: os nomes das abas distinguem os destinos.

## Typography
Cormorant Garamond no título, nas aberturas e nos títulos dos livros; Lato no texto, nas ações, nos formulários e nas datas. São as fontes do brand book, hospedadas localmente como WOFF, com licenças OFL. O arquivo Cormorant normal incluído é a instância 600; o itálico é 500; Lato inclui 400 e 700. Os 12 estilos de referência estão nos tokens. O app usa rem para texto e adapta títulos nas telas pequenas. O lettering original da marca é um SVG pronto; não substituí-lo por fonte.

## Layout
Escala de espaçamento de 4 px, com passos de 8 px e margens confortáveis. A estrutura existente continua: Livros, Votação, Agenda e Lidos. O cabeçalho mostra símbolo e lettering no desktop. No celular, símbolo de 120 px com nome acessível em texto evita encolher a assinatura completa até ficar ilegível. Cartões e formulários usam margens claras, sem depender de cor para distinguir a função. Abaixo de 420 px, capas e conteúdo podem empilhar para preservar campos e os alvos das estrelas.

## Elevation & Depth
Cartões planos com bordas e diferenças de superfície. Reservar sombra suave ao diálogo e à capa de livro. O fundo dos diálogos usa sobreposição escura. Não adicionar sombras a todos os elementos nem gradientes decorativos.

## Shapes
Raio de 4 px em controles e cartões. Círculos ficam restritos a avatares e amostras de paleta. O desenho do VBP, da taça e do livro não muda entre os temas. Símbolo de 120 px ou maior e selo de 160 px ou maior na interface; favicons e ícones do sistema são adaptações técnicas de tamanho que usam a mesma matriz. Preservar proporções e uma área livre ao redor. Os ícones maskable mantêm o desenho dentro da área segura.

## Components
Botão principal usa primary/on-primary, com hover e pressionado definidos. Secundários usam fundo transparente, borda forte e texto de assinatura. Desabilitados têm valores próprios, sem reduzir opacidade de toda a peça. Campos usam borda com contraste maior, rótulo visível, placeholder de apoio e foco de 3 px. Não esconder rótulos. Abas usam o nome da seção, estado aria-selected e linha de seleção. O seletor das paletas usa aria-pressed e os dois nomes. A aparência tem rótulo e três opções: aparelho, clara, escura.

Notas mantêm estrelas e rótulos numéricos do app. Os alvos de controles têm pelo menos 44 px. A identidade não altera autenticação, políticas do banco, votos, presença, arquivamento nem rascunhos. Toda escrita continua passando por gravar(). CSS respeita prefers-reduced-motion. Status nunca deve depender só de cor. O pacote valida contraste dos pares usados; essa validação não substitui uma auditoria completa do produto.

## Do's and Don'ts
- Manter as duas paletas disponíveis em cada tela e com os mesmos recursos.
- Tratar a aparência clara/escura separadamente da escolha de vinho ou oliva.
- Usar os SVGs aprovados: não redesenhar VBP, taça, livro ou lettering.
- Manter os valores de cor em system.json e os literais CSS somente no :root; seletores de aparência usam aliases.
- Preservar funções, ids, autenticação, proteção de rascunhos e regras de dados do app.
- Não instalar framework, bundler ou dependências para aplicar esta identidade.
- Não usar rosé ou champagne como texto pequeno sobre o marfim.
- Não remover foco visível; não comunicar erro ou seleção só por cor.
- Depois de alterar assets, atualizar a versão e a casca do service worker e conferir todos os arquivos locais.
