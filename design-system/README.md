# Pacote de implementação VBP

Preparado para `walquiriarc/vinho-book-e-prosa`, a partir do commit `3bb7427d9968ad75962a961250c0d948e5f7f925`. O aplicativo é HTML, CSS e JavaScript puro, publicado a partir de `docs/`. Os arquivos desta proposta já aplicam o sistema; não há npm, framework ou etapa de build no aplicativo.

## Arquivos

| Arquivo/pasta | Uso |
|---|---|
| `DESIGN.md` na raiz | Contrato visual para desenvolvimento e ferramentas de IA |
| `design-system/system.json` | Fonte de tokens da identidade e seus quatro modos |
| `design-system/resolved.json` | Valores finais para integrar em outras plataformas |
| `design-system/tokens/` | Quatro arquivos DTCG 2025.10 autocontidos |
| `docs/marca/tokens.css` | Variáveis de interface e aliases por tema |
| `docs/marca/fonts.css` e `fonts/` | Fontes locais WOFF e suas licenças |
| `docs/marca/logos/` | Logos originais nas duas paletas e derivados inversos |
| `docs/marca/brand.js` | Preferências de paleta e aparência no dispositivo |
| `docs/marca/icons/` e manifests | Ícones instaláveis nas duas paletas |
| `docs/styles.css` | Componentes existentes com a identidade editorial |
| `design-system/validation/` | Resultados da verificação de tokens e interface |

## Como revisar e aplicar

1. Abra a branch desta proposta e sirva `docs/` localmente, por exemplo `python3 -m http.server 8000 --directory docs`.
2. Confira Vinho & marfim e Oliva & rosé nas aparências clara e escura. A opção “Do aparelho” segue o sistema.
3. Confirme livros, votação, agenda, lidos, login, diálogos e formulários. Os dados e a configuração do Supabase não são alterados por este pacote.
4. Ao integrar a proposta na `main`, o fluxo de publicação existente do GitHub Pages poderá atualizar o site. A proposta é entregue separadamente para revisão.

As preferências usam `vbp_paleta` e `vbp_aparencia` em localStorage. Se o armazenamento estiver bloqueado, os controles funcionam durante a sessão. O nome completo das duas paletas aparece no seletor. Os ícones da instalação acompanham o manifest selecionado; sistemas operacionais podem manter o ícone já instalado, então a atualização visual da interface e a do ícone não têm necessariamente o mesmo momento.

## Evoluir o sistema

Edite `system.json`. Rode `python3 design-system/generate.py` para atualizar os exports e `python3 design-system/validate.py` para verificar contraste, referências e arquivos. Esse gerador é uma ferramenta de manutenção: os arquivos gerados já estão no repositório e o aplicativo abre diretamente, sem executá-lo.

Para Claude Code, Cursor ou outra ferramenta que trabalha no projeto, mantenha `DESIGN.md` como contexto e peça: “Aplique a identidade do DESIGN.md às telas existentes, mantendo ambas as paletas e os modos claro/escuro. Preserve ids, funções, login, votos, presença e rascunhos. Cores vêm dos tokens. Não acrescente framework nem build.”

## Bases técnicas

- DTCG 2025.10: https://www.designtokens.org/TR/2025.10/format/
- Contraste: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- As licenças OFL acompanham os arquivos das fontes.

A verificação automatizada cobre os pares de cores, referências e estados descritos. Os testes de interface usam dados fictícios e não gravam no Supabase. Não foi feita uma auditoria integral de acessibilidade nem uma sessão real de autenticação.
