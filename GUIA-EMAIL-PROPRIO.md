# Guia: o e-mail de entrada do clube saindo do seu próprio domínio

Para a Wal. Refeito em 21 de outubro de 2026 para o domínio novo, **walquiriacristelli.com**, que será só seu e dos seus projetos. Toda regra de plataforma e todo preço citados aqui foram lidos nessa data; os links estão no fim. Preço é o que a tela mostrava no dia, nunca promessa.

## Por que fazer isso

Hoje o código de 6 dígitos que abre o app sai de um remetente de fábrica do Supabase, limitado a **2 e-mails por hora** por projeto (Supabase, "Auth rate limits", 21/10/2026). Na noite em que o link circular no grupo, a terceira amiga a pedir o código recebe "Muitos pedidos seguidos" e desiste. Com um remetente seu, o limite sobe para 30 por hora logo de saída e pode ser ajustado (Supabase, "Custom SMTP", 21/10/2026), e o e-mail chega com o nome que elas reconhecem: **Vinho, Book e Prosa**.

Em cinco linhas, o que esta configuração precisa entregar:

- **Tese:** o código chega em menos de um minuto, de um remetente com o nome do clube.
- **Para quem:** oito amigas, celular, a maioria no Gmail e no Hotmail.
- **O que elas fazem:** digitam o código. Nada mais.
- **Como saber que deu certo:** oito entradas na mesma noite, nenhuma no spam.
- **Marca:** se o logo sumisse, o nome do remetente ainda diria quem é.

## O desenho: um domínio seu, um subdomínio por projeto

O domínio é `walquiriacristelli.com`. O clube manda de **`oi@clube.walquiriacristelli.com`**. Cada projeto futuro ganha o próprio subdomínio (`loja.walquiriacristelli.com`, `curso.walquiriacristelli.com`), com SPF, DKIM e DMARC próprios. É a governança que uso em qualquer auditoria de identidade de remetente: um projeto que erra não derruba a reputação dos outros, e um subdomínio nasce com os registros limpos. O Supabase recomenda a mesma coisa, um domínio separado só para os e-mails de login (Supabase, "Custom SMTP", 21/10/2026).

Nota curta, assunto da empresa e não do clube: o domínio `superinteligencia.org` tem um SPF com mais consultas de DNS do que a regra permite (17; o limite é 10, RFC 7208, seção 4.6.4) e um DMARC com endereço de relatório de exemplo. Vale repassar a quem cuida dele. O clube não depende disso.

Tempo total: uma hora, contando a espera do DNS. Nada aqui exige programar. Ordem: registrar o domínio → conta na Resend → registros DNS → chave → Supabase → modelo do e-mail → teste.

## Passo 0. Registrar walquiriacristelli.com na Cloudflare (15 minutos)

Em 21/10/2026 o domínio estava livre (consulta RDAP pública na Verisign, que administra o `.com`). Registre pela **Cloudflare Registrar**: ela cobra "at or below what registries and ICANN charge us" e "does not mark up domain prices at all" (Cloudflare, "Registrar", 21/10/2026); a proteção de dados no WHOIS vem incluída sem custo; e o DNS do domínio já fica na própria Cloudflare, que é onde os registros do passo 2 entram. Um lugar só para tudo.

Sobre o preço: a Cloudflare só mostra o valor na tela de compra, depois do login. Um rastreador público de preços registrava, com a marca "Prices Updated: Oct 21, 2026", **US$ 10,46 por ano** para registro e renovação do `.com` na Cloudflare (domainoffer.net, 21/10/2026). A Verisign anunciou aumento do preço de atacado do `.com` a partir de **1º de novembro de 2026**, de até 7% (Realtime Register, 3/6/2026), então a renovação de 2027 deve vir um pouco acima disso. Pagamento em cartão internacional, em dólar. Para o seu orçamento: cerca de R$ 60 a R$ 70 por ano no câmbio de hoje.

1. Crie a conta em https://dash.cloudflare.com/sign-up com o seu e-mail pessoal (não o da empresa: o domínio é seu). Confirme o e-mail pelo link que chega; sem e-mail verificado a Cloudflare não registra domínio ("You must have a verified account email address, to transfer or register domains", Cloudflare, "Register a new domain", 21/10/2026).
2. No painel, menu da esquerda, **Domain Registration** → **Register Domains**. Digite `walquiriacristelli.com` e clique **Search**.
3. Clique **Purchase** no resultado. Em "Payment option", escolha o prazo: **1 ano** basta (a renovação automática vem ligada de fábrica, "All registrations have Auto-renew turned on by default"; deixe ligada, é o que evita perder o domínio por esquecimento).
4. Preencha os dados de contato com **letras sem acento** e sem ç: a Cloudflare recusa caracteres fora do ASCII nesse formulário. "Walquiria Cristelli", endereço e telefone completos e verdadeiros; dados incompletos podem levar à suspensão do domínio. Esses dados ficam ocultos no WHOIS público "when permitted by the registry", e o `.com` permite.
5. Cartão, leia os termos, **Complete purchase**. Em até 30 segundos o domínio aparece em **Domain Registration** → **Manage Domains**, e chega um e-mail de confirmação.

Nada mais a fazer no domínio por enquanto. Ele não precisa de site; só de registros de e-mail.

## Passo 1. Criar a conta na Resend (10 minutos)

A **Resend** está entre os provedores que o próprio Supabase lista (Resend, AWS SES, Postmark, Twilio SendGrid, ZeptoMail, Brevo). O plano gratuito, lido em 21/10/2026: **3.000 e-mails por mês, 100 por dia, até 3 domínios**, sem cartão. O clube manda talvez 30 por mês. A tela de DNS dela é a mais simples que conheço: mostra os registros prontos para copiar e marca em verde quando encontra cada um.

1. Entre em https://resend.com e crie a conta com o mesmo e-mail pessoal. Confirme pelo link.
2. Menu da esquerda, **Domains** → **Add Domain**. Digite `clube.walquiriacristelli.com`. Em "Region", escolha **South America (São Paulo)** se aparecer; senão, a padrão.
3. A Resend mostra os registros DNS (normalmente três: uma chave **DKIM** em TXT, um **MX** e um **TXT de SPF**, num subdomínio de envio). Deixe a aba aberta: o passo 2 é copiá-los.

A Resend só envia a partir de um domínio que você comprove ser seu: "You must add and verify at least one domain to send emails with Resend" (Resend, "Domains", 21/10/2026).

## Passo 2. Os registros no domínio (SPF, DKIM, DMARC), na Cloudflare

Volte à Cloudflare: **Websites** (ou o nome do domínio) → `walquiriacristelli.com` → **DNS** → **Records** → **Add record** (Cloudflare, "Create DNS records", 21/10/2026). Para cada linha que a Resend mostrou, crie um registro com o mesmo **tipo**, o mesmo **nome** e o mesmo **valor**, e clique **Save**.

Dois detalhes que derrubam muita gente:

- Se a Cloudflare completar o nome com `.walquiriacristelli.com` sozinha, não repita o domínio no fim. O nome que a Resend mostra como `resend._domainkey.clube` entra como `resend._domainkey.clube`, e a Cloudflare acrescenta o resto.
- **Proxy status:** registros MX e TXT são sempre "DNS only" (nuvem cinza); só A, AAAA e CNAME podem ser "Proxied" (Cloudflare, "Proxy status", 21/10/2026). Se algum registro aparecer com nuvem laranja, clique nela até ficar cinza. E-mail não passa pelo proxy.

O que cada registro faz, na ordem em que um e-mail é julgado. Cada camada é pré-requisito da seguinte; pular uma deixa o remetente exposto:

1. **SPF** diz quais servidores podem mandar e-mail em nome de `clube.walquiriacristelli.com`. O registro da Resend autoriza só os servidores dela.
2. **DKIM** é uma assinatura: a Resend assina cada e-mail com uma chave privada e o registro TXT publica a chave pública para o Gmail conferir. É o que o Google exige de todo remetente: "Set up SPF or DKIM email authentication for your sending domains" (Google, "Email sender guidelines", 21/10/2026). Com os dois, melhor.
3. **DMARC** diz o que fazer quando SPF e DKIM falham. A Resend não exige, mas é o que impede alguém de mandar e-mail fingindo ser o clube. Crie mais um registro TXT:
   - Tipo: `TXT` · Nome: `_dmarc.clube` · Valor: `v=DMARC1; p=none; rua=mailto:SEU-EMAIL-AQUI`
   - Troque `SEU-EMAIL-AQUI` pelo seu e-mail pessoal (é para onde vêm os relatórios). Não deixe um exemplo.
   - `p=none` é o começo certo: só observa. Depois de um mês vendo tudo passar, troque para `p=quarantine` e, mais tarde, `p=reject`. É a progressão que a própria Resend descreve (Resend, "DMARC", 21/10/2026). Com um único remetente no subdomínio, chegar a `p=reject` em dois meses é tranquilo.

Volte à Resend e clique **Verify DNS Records**. Costuma levar de minutos a uma hora; a tela fica verde quando encontra os três. Enquanto não ficar, não adianta seguir.

## Passo 3. A chave de API da Resend

1. Na Resend, **API Keys** → **Create API Key**. Nome: `supabase-clube`. Permissão: **Sending access**. Domínio: `clube.walquiriacristelli.com`.
2. A chave aparece **uma única vez**. Copie para o gerenciador de senhas do celular ou do Mac. Não para um arquivo no projeto, não para o WhatsApp, não para um chat. Se perder, apague essa e crie outra; não tem problema.

Essa chave é a senha do SMTP no passo 4. Ela não vai para o site nem para o repositório: fica só no painel do Supabase.

## Passo 4. Ligar a Resend no Supabase (5 minutos)

1. Entre em https://supabase.com/dashboard, abra o projeto **vinho-book-e-prosa**.
2. Menu da esquerda, **Authentication** → **Emails** → aba **SMTP Settings** (Supabase, "Production checklist", 21/10/2026). Ligue **Enable Custom SMTP**.
3. Preencha (servidor e usuário vêm da documentação da Resend, "Send with SMTP", 21/10/2026):
   - **Sender email:** `oi@clube.walquiriacristelli.com`
   - **Sender name:** `Vinho, Book e Prosa`
   - **Host:** `smtp.resend.com`
   - **Port number:** `465`
   - **Username:** `resend` (a palavra mesmo)
   - **Password:** a chave de API do passo 3
4. **Save**.

O endereço `oi@clube...` não precisa existir como caixa de entrada: ele só manda. Resposta das amigas não chega lá; elas falam com você no WhatsApp.

Depois disso o Supabase impõe sozinho 30 e-mails por hora, "to protect the reputation of your newly set up service" (Supabase, "Custom SMTP", 21/10/2026). Para oito amigas sobra. Se um dia precisar de mais: **Authentication** → **Rate Limits**. Outro limite que fica: a mesma pessoa só pode pedir um novo código 60 segundos depois do anterior (Supabase, "Auth rate limits", 21/10/2026); é proteção, não bug.

## Passo 5. O modelo do e-mail com o código

O e-mail de entrada precisa trazer o **código de 6 dígitos**, porque no iPhone o link abre no Safari, fora do app instalado, e a sessão não chega lá dentro. O código é a variável `{{ .Token }}`: "Contains a 6-digit One-Time-Password (OTP) that can be used instead of the {{ .ConfirmationURL }}" (Supabase, "Email templates", 21/10/2026). O modelo de fábrica não a inclui.

1. **Authentication** → **Emails** → aba **Templates** → **Magic Link**.
2. Em **Subject heading**: `Seu código para entrar no clube: {{ .Token }}`
3. Em **Message body**, apague o que está lá e cole:

```html
<p>Oi! Aqui é o app do <strong>Vinho, Book e Prosa</strong>.</p>
<p>Seu código para entrar é:</p>
<p style="font-size:32px;letter-spacing:6px;font-family:monospace"><strong>{{ .Token }}</strong></p>
<p>Digite esse código na tela do app. Ele vale por pouco tempo e só uma vez.</p>
<p>Se preferir, e estiver no computador, pode <a href="{{ .ConfirmationURL }}">entrar por este link</a>.</p>
<p style="color:#777;font-size:13px">Se você não pediu esse código, é só ignorar este e-mail.</p>
```

4. **Save**.

O código no assunto é de propósito: no celular ele aparece na notificação, junto do remetente `Vinho, Book e Prosa <oi@clube.walquiriacristelli.com>`, e a amiga nem precisa abrir o e-mail. A validade padrão do código é uma hora, e a recomendação do próprio Supabase é não passar disso (Supabase, "Production checklist", 21/10/2026). Não mexa.

## Passo 6. Testar antes de mandar o link no grupo

1. Abra o app no celular, toque no seu nome → **Sair do clube neste aparelho**.
2. Na tela de entrada, use o seu e-mail. O código deve chegar em menos de um minuto, do remetente **Vinho, Book e Prosa** (`oi@clube.walquiriacristelli.com`). Se cair no spam, marque "não é spam" e siga; na primeira semana de um domínio novo isso pode acontecer uma vez.
3. Abra esse e-mail no Gmail pelo computador: três pontinhos → **Mostrar original**. Nas primeiras linhas devem aparecer **SPF: PASS**, **DKIM: PASS** e **DMARC: PASS**, todos citando `clube.walquiriacristelli.com`. Um FAIL aponta o registro do passo 2 que está errado ou ainda não propagou; a Resend mostra qual.
4. Digite o código e entre.
5. O teste que importa: peça a **três amigas** que entrem com um minuto de intervalo entre elas. Antes, a terceira ficava de fora. Agora as três entram. Só então mande no grupo: "O app voltou com e-mail novo. Quem não conseguir entrar, me chama."
6. Dois dias depois, olhe a Resend em **Logs**: cada envio aparece como "Delivered". Um "Bounced" quer dizer e-mail digitado errado na lista de membras.

## Alternativa sem domínio: o Gmail

Se preferir resolver hoje, antes de registrar o domínio, o Supabase aceita qualquer servidor SMTP, inclusive o do Gmail. Não precisa de registro nenhum, porque o Google já autentica o próprio domínio. O preço é que o remetente passa a ser o seu endereço pessoal (o Gmail reescreve o "De"), com o nome que você escolher.

1. Na sua Conta Google, ligue a **verificação em duas etapas**. Depois abra https://myaccount.google.com/apppasswords e crie uma **senha de app** chamada `supabase-clube`. Ela tem 16 letras e aparece uma vez (Google, "Sign in with app passwords", 21/10/2026). Guarde no gerenciador de senhas.
2. No Supabase, **Authentication** → **Emails** → **SMTP Settings**: Sender email = o seu Gmail; Sender name = `Vinho, Book e Prosa`; Host = `smtp.gmail.com`; Port = `465`; Username = o seu endereço completo; Password = a senha de app (Google, "Send email from a printer, scanner, or app", 21/10/2026: `smtp.gmail.com`, 465 com SSL ou 587 com TLS, autenticação com a conta).
3. Limites: conta Gmail comum, **500 e-mails por dia** (Google, "Gmail sending limits", 21/10/2026); conta do Google Workspace pelo `smtp.gmail.com`, **2.000 por dia** (mesma página do item 2). Cem vezes o que o clube usa.
4. Faça o teste do passo 6 igual.

Por que não é o primeiro caminho: a senha de app dá acesso ao seu e-mail inteiro, não só ao envio. Se vazar do painel do Supabase, alguém lê a sua caixa. Com a Resend, uma chave vazada só manda e-mail, e você a apaga com um clique. Quando o domínio estiver no ar, troque pelo caminho principal; é só refazer o passo 4.

## O que fica como manutenção (quase nada)

- **Nada semanal.** O remetente funciona enquanto a conta da Resend existir e o DNS ficar como está.
- **Uma vez por ano:** a Cloudflare renova o domínio sozinha no cartão (Auto-renew). Se o cartão vencer, chega e-mail avisando; trocar o cartão em **Billing** resolve. Perder o domínio é a única coisa que derruba tudo de uma vez.
- **Em dois meses:** subir o DMARC de `p=none` para `p=quarantine`, depois `p=reject`. Um campo num registro TXT.
- **Cada projeto novo seu:** repetir os passos 1 a 3 com outro subdomínio (`nome-do-projeto.walquiriacristelli.com`). O plano gratuito da Resend aceita 3 domínios; subdomínios contam cada um.

## Fontes (todas lidas em 21 de outubro de 2026)

- Verisign RDAP, `walquiriacristelli.com`: https://rdap.verisign.com/com/v1/domain/walquiriacristelli.com (resposta 404 = domínio livre)
- Cloudflare, Registrar: https://www.cloudflare.com/products/registrar/ (preço "at or below what registries and ICANN charge us"; WHOIS redigido sem custo)
- Cloudflare, Register a new domain: https://developers.cloudflare.com/registrar/get-started/register-domain/ (e-mail verificado; contato em ASCII; Auto-renew ligado por padrão; até 10 anos)
- Cloudflare, Create DNS records: https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/ (DNS → Records → Add record)
- Cloudflare, Proxy status: https://developers.cloudflare.com/dns/proxy-status/ (só A, AAAA e CNAME podem ser "Proxied"; o resto é "DNS only")
- domainoffer.net, Cloudflare .com: https://domainoffer.net/tld/com/cloudflare ("Prices Updated: Oct 21, 2026", US$ 10,46 registro e renovação; rastreador de terceiros, não a Cloudflare)
- Realtime Register, .com pricing changes (3/6/2026): https://realtimeregister.com/blogs/com-pricing-changes-what-partners-should-expect (aumento de atacado do `.com` em 1/11/2026, até 7%)
- Supabase, Auth rate limits: https://supabase.com/docs/guides/auth/rate-limits (2 e-mails por hora no remetente de fábrica; 60 segundos entre pedidos)
- Supabase, Custom SMTP: https://supabase.com/docs/guides/auth/auth-smtp (30 por hora após SMTP próprio; provedores; domínio separado para login)
- Supabase, Email templates: https://supabase.com/docs/guides/auth/auth-email-templates (`{{ .Token }}` é o código de 6 dígitos)
- Supabase, Production checklist: https://supabase.com/docs/guides/deployment/going-into-prod (Authentication → Emails → SMTP Settings; validade do código até uma hora)
- Resend, Pricing: https://resend.com/pricing (3.000 por mês, 100 por dia, 3 domínios)
- Resend, Send with SMTP: https://resend.com/docs/send-with-smtp (`smtp.resend.com`, 465 e 587, usuário `resend`, senha = chave de API)
- Resend, Domains: https://resend.com/docs/dashboard/domains/introduction (precisa verificar um domínio seu)
- Resend, DMARC: https://resend.com/docs/dashboard/domains/dmarc (registro `_dmarc`; none → quarantine → reject)
- Google, Email sender guidelines: https://support.google.com/a/answer/81126 (SPF ou DKIM para todo remetente)
- Google, Gmail sending limits: https://support.google.com/mail/answer/22839 (500 por dia)
- Google, Send email from a printer, scanner, or app: https://support.google.com/a/answer/176600 (`smtp.gmail.com`, 465/587, 2.000 por dia no Workspace)
- Google, Sign in with app passwords: https://support.google.com/accounts/answer/185833
- RFC 7208, seção 4.6.4: https://www.rfc-editor.org/rfc/rfc7208#section-4.6.4 (limite de 10 consultas de DNS no SPF; só para a nota sobre o domínio da empresa)
