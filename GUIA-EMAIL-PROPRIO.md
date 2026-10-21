# Guia: o e-mail de entrada do clube saindo do seu próprio remetente

Para a Wal. Escrito em 21 de outubro de 2026. Toda regra de plataforma citada aqui foi lida nas páginas oficiais nessa data; os links estão no fim.

## Por que fazer isso

Hoje o código de 6 dígitos que abre o app sai de um remetente de fábrica do Supabase, e esse remetente manda no máximo **2 e-mails por hora** por projeto (Supabase, "Auth rate limits", 21/10/2026). Na noite em que o link circular no grupo, a terceira amiga a pedir o código recebe "Muitos pedidos seguidos" e desiste. Com um remetente seu, o limite sobe para 30 por hora logo de saída e pode ser ajustado (Supabase, "Custom SMTP", 21/10/2026), e o e-mail chega com um nome que elas reconhecem: **Vinho, Book e Prosa**.

Em cinco linhas, o que esta configuração precisa entregar:

- **Tese:** o código chega em menos de um minuto, de um remetente com o nome do clube.
- **Para quem:** oito amigas, celular, a maioria no Gmail e no Hotmail.
- **O que elas fazem:** digitam o código. Nada mais.
- **Como saber que deu certo:** oito entradas na mesma noite, nenhuma no spam.
- **Marca:** se o logo sumisse, o nome do remetente ainda diria quem é.

Tempo total: de 20 a 40 minutos, a maior parte esperando o DNS propagar. Nada aqui exige programar.

## O que eu vi no seu domínio (e o que isso muda)

Seu e-mail é do domínio `superinteligencia.org`. Olhei os registros públicos dele em 21/10/2026:

- O DNS está na **Cloudflare** e o correio é do **Google Workspace**. Então existe alguém (você ou quem cuida do site) com acesso ao painel da Cloudflare. É lá que entram os registros deste guia.
- O **SPF** do domínio tem 17 consultas de DNS encadeadas (dois `include` para o mesmo provedor de hospedagem, um para uma ferramenta de disparo, `a` e `mx` repetidos, mais o Google). A regra do SPF permite **10**; acima disso o servidor que recebe devolve "permerror", o que vale tanto quanto não ter SPF (RFC 7208, seção 4.6.4). Isso é um problema do e-mail da empresa, não do clube, e **não** é para resolver agora. Só muda uma decisão: o clube **não deve** entrar nesse SPF. Ele usa um subdomínio próprio, com SPF limpo.
- O **DMARC** está em `p=none` com o endereço de relatório de exemplo `yourmail@yourdomain.com`, isto é, os relatórios vão para lugar nenhum. Também é assunto da empresa; anoto para você repassar a quem cuida do domínio.
- Existe uma chave **DKIM** no seletor `default` (provavelmente da hospedagem), nenhuma no seletor do Google.

Conclusão: o caminho certo é um **subdomínio só do clube**, `clube.superinteligencia.org`, com remetente `oi@clube.superinteligencia.org`. O Supabase recomenda exatamente isso, um domínio separado para os e-mails de login (Supabase, "Custom SMTP", 21/10/2026). O subdomínio nasce com SPF, DKIM e DMARC limpos, sem herdar o emaranhado do domínio principal, e se um dia a empresa trocar de hospedagem, o clube não sente.

Se você **não** tiver acesso ao painel da Cloudflare e não conseguir pedir os registros a quem tem, pule para a seção "Alternativa sem mexer em DNS: o Gmail".

## Passo 1. Criar a conta na Resend (10 minutos)

Escolhi a **Resend** entre os provedores que o próprio Supabase lista (Resend, AWS SES, Postmark, Twilio SendGrid, ZeptoMail, Brevo). O plano gratuito dela, lido em 21/10/2026: **3.000 e-mails por mês, 100 por dia, até 3 domínios**, sem cartão. O clube manda talvez 30 e-mails por mês. A Brevo também é gratuita (o site dela não deixa ler os limites sem JavaScript, então não cito números), mas a Resend tem a tela de DNS mais simples que conheço: ela mostra os registros prontos para copiar e marca em verde quando cada um foi encontrado.

1. Entre em https://resend.com e crie a conta com o seu e-mail. Confirme pelo link que chega.
2. No menu da esquerda, **Domains** → **Add Domain**. Digite `clube.superinteligencia.org`. Em "Region", escolha **South America (São Paulo)** se aparecer; senão, a padrão.
3. A Resend mostra uma lista de registros DNS (normalmente três: uma chave **DKIM** em TXT, um **MX** e um **TXT de SPF** num subdomínio de envio). Deixe essa aba aberta; o passo 2 é copiar cada um para a Cloudflare.

A Resend só envia a partir de um domínio que você comprove ser seu: "You must add and verify at least one domain to send emails with Resend" (Resend, "Domains", 21/10/2026). Por isso o passo 2 não é opcional.

## Passo 2. Os registros no domínio (SPF, DKIM, DMARC)

Quem faz: você, se tiver login na Cloudflare, ou a pessoa que cuida do site da empresa. O que mandar para ela, se for o caso: "Preciso que você crie estes registros DNS em `superinteligencia.org`" e a lista que a Resend mostrou. Nenhum deles toca no que já existe.

Na Cloudflare: **DNS** → **Records** → **Add record**. Para cada linha da Resend, crie um registro com o mesmo **tipo**, o mesmo **nome** e o mesmo **valor**. Detalhe que derruba muita gente: no campo "Proxy status", escolha **DNS only** (nuvem cinza), nunca "Proxied". E se a Cloudflare completar o nome com `.superinteligencia.org` sozinha, não repita o domínio no fim.

O que cada registro faz, na ordem em que um e-mail é julgado (é a ordem que uso em qualquer auditoria de identidade de remetente, e cada camada é pré-requisito da seguinte):

1. **SPF** diz quais servidores podem mandar e-mail em nome de `clube.superinteligencia.org`. O registro que a Resend dá autoriza só os servidores dela. Como é um subdomínio novo, não há conflito com o SPF estourado do domínio principal.
2. **DKIM** é uma assinatura: a Resend assina cada e-mail com uma chave privada, e o registro TXT publica a chave pública para o Gmail conferir. É o que o Google exige de todo remetente: "Set up SPF or DKIM email authentication for your sending domains" (Google, "Email sender guidelines", 21/10/2026). Com os dois, melhor.
3. **DMARC** diz o que fazer quando SPF e DKIM falham. A Resend não exige, mas é a camada que impede alguém de mandar e-mail fingindo ser o clube. Crie mais um registro TXT:
   - Nome: `_dmarc.clube.superinteligencia.org`
   - Valor: `v=DMARC1; p=none; rua=mailto:SEU-EMAIL-AQUI`
   - Troque `SEU-EMAIL-AQUI` pelo seu e-mail de verdade (é para onde vêm os relatórios). Não deixe o exemplo, que foi o erro do domínio principal.
   - `p=none` é o começo certo: só observa. Depois de um mês vendo tudo passar, troque para `p=quarantine` e, mais tarde, `p=reject`. É a progressão que a própria Resend descreve (Resend, "DMARC", 21/10/2026). Para o clube, com um único remetente, chegar a `p=reject` em dois meses é tranquilo.

Volte à Resend e clique em **Verify DNS Records**. Costuma levar de minutos a uma hora; a tela fica verde quando encontra os três. Enquanto não ficar, não adianta seguir.

## Passo 3. A chave de API da Resend

1. Na Resend, **API Keys** → **Create API Key**. Nome: `supabase-clube`. Permissão: **Sending access**. Domínio: `clube.superinteligencia.org`.
2. A chave aparece **uma única vez**. Copie para o gerenciador de senhas do seu celular ou do Mac (não para um arquivo no projeto, não para o WhatsApp, não para o chat). Se perder, apague essa e crie outra; não tem problema.

Essa chave é a senha do SMTP no passo 4. Ela não vai para o site nem para o repositório: fica só dentro do painel do Supabase.

## Passo 4. Ligar a Resend no Supabase (5 minutos)

1. Entre em https://supabase.com/dashboard, abra o projeto **vinho-book-e-prosa**.
2. No menu da esquerda, **Authentication** → **Emails** → aba **SMTP Settings** (Supabase, "Production checklist", 21/10/2026). Ligue **Enable Custom SMTP**.
3. Preencha (os valores de servidor vêm da documentação da Resend, "Send with SMTP", 21/10/2026):
   - **Sender email:** `oi@clube.superinteligencia.org`
   - **Sender name:** `Vinho, Book e Prosa`
   - **Host:** `smtp.resend.com`
   - **Port number:** `465`
   - **Username:** `resend` (a palavra mesmo)
   - **Password:** a chave de API do passo 3
4. **Save**.

Depois disso o Supabase impõe sozinho o limite de 30 e-mails por hora, "to protect the reputation of your newly set up service" (Supabase, "Custom SMTP", 21/10/2026). Para oito amigas sobra. Se um dia precisar de mais: **Authentication** → **Rate Limits** → "Rate limit for sending emails". Outro limite que fica: a mesma pessoa só pode pedir um novo código 60 segundos depois do anterior (Supabase, "Auth rate limits", 21/10/2026); é proteção, não bug.

## Passo 5. O modelo do e-mail com o código

O e-mail de entrada precisa trazer o **código de 6 dígitos**, porque no iPhone o link abre no Safari, fora do app instalado, e a sessão não chega lá dentro. O código é a variável `{{ .Token }}`: "Contains a 6-digit One-Time-Password (OTP) that can be used instead of the {{ .ConfirmationURL }}" (Supabase, "Email templates", 21/10/2026). O modelo de fábrica não a inclui.

1. **Authentication** → **Emails** → aba **Templates** → **Magic Link**.
2. Em **Subject heading**, coloque: `Seu código para entrar no clube: {{ .Token }}`
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

O código no assunto é de propósito: no celular, ele aparece na notificação, e a amiga nem precisa abrir o e-mail. Sobre o tempo de validade: o padrão do Supabase é uma hora, e a própria recomendação deles é não passar disso (Supabase, "Production checklist", 21/10/2026). Não mexa.

## Passo 6. Testar antes de mandar o link no grupo

1. Abra o app no celular, toque no seu nome → **Sair do clube neste aparelho**.
2. Na tela de entrada, use o seu e-mail. O código deve chegar em menos de um minuto, do remetente **Vinho, Book e Prosa**. Se cair no spam, marque "não é spam" e siga; na primeira semana isso pode acontecer uma vez.
3. Abra esse e-mail no Gmail pelo computador: três pontinhos → **Mostrar original**. Nas primeiras linhas devem aparecer **SPF: PASS**, **DKIM: PASS** e **DMARC: PASS**. Se algum estiver FAIL, o registro correspondente do passo 2 está errado ou ainda não propagou; a Resend mostra qual.
4. Digite o código e entre. Pronto para a sua conta.
5. O teste que importa: peça a **três amigas** que entrem com um intervalo de um minuto entre elas. Antes, a terceira ficava de fora. Agora as três entram. Só então mande no grupo: "O app voltou com e-mail novo. Quem não conseguir entrar, me chama."
6. Dois dias depois, olhe o painel da Resend em **Logs**: cada envio aparece com "Delivered". Um "Bounced" quer dizer e-mail digitado errado na tabela de membras.

## Alternativa sem mexer em DNS: o Gmail

Se não der para mexer no domínio, o Supabase aceita qualquer servidor SMTP, inclusive o do Gmail. Não precisa de registro nenhum, porque o Google já autentica o próprio domínio. O preço é que o remetente passa a ser o seu endereço pessoal (o Gmail reescreve o "De"), com o nome que você escolher.

1. Na sua Conta Google, ligue a **verificação em duas etapas** (obrigatória para o passo seguinte). Depois abra https://myaccount.google.com/apppasswords e crie uma **senha de app** chamada `supabase-clube`. Ela tem 16 letras e aparece uma vez (Google, "Sign in with app passwords", 21/10/2026). Guarde no gerenciador de senhas.
2. No Supabase, **Authentication** → **Emails** → **SMTP Settings**:
   - **Sender email:** o seu endereço do Gmail ou do Workspace
   - **Sender name:** `Vinho, Book e Prosa`
   - **Host:** `smtp.gmail.com`
   - **Port:** `465`
   - **Username:** o seu endereço completo
   - **Password:** a senha de app
   (Google, "Send email from a printer, scanner, or app", 21/10/2026: `smtp.gmail.com`, porta 465 com SSL ou 587 com TLS, autenticação com a conta.)
3. Limites: uma conta Gmail comum manda **500 e-mails por dia** (Google, "Gmail sending limits", 21/10/2026); uma conta do Google Workspace, pelo `smtp.gmail.com`, **2.000 por dia** (mesma página do passo 2). Qualquer um dos dois é cem vezes o que o clube usa.
4. Faça o teste do passo 6 igual.

Por que não é o primeiro caminho: a senha de app dá acesso ao seu e-mail inteiro, não só ao envio. Se ela vazar do painel do Supabase, alguém lê a sua caixa. Com a Resend, uma chave vazada só manda e-mail, e você a apaga com um clique. Para um clube de oito amigas o risco é pequeno; ainda assim prefiro a chave que só faz uma coisa.

## O que fica como manutenção (quase nada)

- **Nada semanal.** O remetente funciona enquanto a conta da Resend existir e o DNS ficar como está.
- **Em dois meses:** subir o DMARC de `p=none` para `p=quarantine`, depois `p=reject`. Um campo num registro TXT.
- **Se trocar o domínio ou a Resend:** refazer os passos 1 a 4. O app não muda; a configuração vive toda no painel do Supabase.
- **Para a empresa, fora do clube:** o SPF de `superinteligencia.org` com 17 consultas e o DMARC com e-mail de exemplo. Vale repassar a quem cuida do domínio; os e-mails da empresa estão sendo entregues apesar disso, não por causa disso.

## Fontes (todas lidas em 21 de outubro de 2026)

- Supabase, Auth rate limits: https://supabase.com/docs/guides/auth/rate-limits (2 e-mails por hora no remetente de fábrica; 60 segundos entre pedidos da mesma pessoa)
- Supabase, Custom SMTP: https://supabase.com/docs/guides/auth/auth-smtp (30 por hora após SMTP próprio; lista de provedores; domínio separado para login; SPF, DKIM e DMARC com o provedor)
- Supabase, Email templates: https://supabase.com/docs/guides/auth/auth-email-templates (`{{ .Token }}` é o código de 6 dígitos)
- Supabase, Production checklist: https://supabase.com/docs/guides/deployment/going-into-prod (caminho Authentication → Emails → SMTP Settings; validade do código até uma hora)
- Resend, Pricing: https://resend.com/pricing (plano gratuito: 3.000 por mês, 100 por dia, 3 domínios)
- Resend, Send with SMTP: https://resend.com/docs/send-with-smtp (`smtp.resend.com`, portas 465 e 587, usuário `resend`, senha é a chave de API)
- Resend, Domains: https://resend.com/docs/dashboard/domains/introduction (precisa verificar um domínio seu)
- Resend, DMARC: https://resend.com/docs/dashboard/domains/dmarc (registro `_dmarc`; progressão none → quarantine → reject)
- Google, Email sender guidelines: https://support.google.com/a/answer/81126 (SPF ou DKIM para todo remetente; DMARC exigido acima de 5.000 por dia)
- Google, Gmail sending limits: https://support.google.com/mail/answer/22839 (500 por dia na conta comum)
- Google, Send email from a printer, scanner, or app: https://support.google.com/a/answer/176600 (`smtp.gmail.com`, 465 SSL / 587 TLS, 2.000 por dia no Workspace)
- Google, Sign in with app passwords: https://support.google.com/accounts/answer/185833 (senha de 16 caracteres; exige verificação em duas etapas)
- RFC 7208, seção 4.6.4: https://www.rfc-editor.org/rfc/rfc7208#section-4.6.4 (limite de 10 consultas de DNS por avaliação de SPF)
- Registros DNS de `superinteligencia.org`: consulta pública (`dig` nos resolvedores 1.1.1.1 e 8.8.8.8) em 21/10/2026
