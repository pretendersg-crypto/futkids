# Contas do FutKids: famílias, escolinhas e (depois) planos pagos

Desenho combinado em 12/10/2026, a partir das escolhas do dono do app:

- Público: **famílias e treinadores de escolinha**.
- Gratuito agora, com cobrança depois para **os dois**: escolinha e família premium.
- Atleta cadastrado **dos dois jeitos**: o treinador cadastra e convida, ou a família entra pelo código
  da turma.
- O treinador vê **tudo de treino** do atleta, depois que a família autoriza.
- Login com **Google** e **e-mail com link** (sem senha).

A base continua no Firebase: login (Authentication), banco (Firestore) e, na fase de cobrança, as
funções de servidor (Cloud Functions).

## 1. Quem é quem

| Papel | Entra com | Pode |
|---|---|---|
| **Responsável** (pai/mãe) | Google ou e-mail | Criar a família, cadastrar filhos (só o apelido), montar o plano de casa, ver tudo dos filhos, autorizar ou tirar o filho de uma turma, apagar tudo |
| **Treinador** | Google ou e-mail | Criar a escolinha (ou entrar por convite), criar turmas, cadastrar atletas, montar o plano da turma, ver o treino dos atletas autorizados |
| **Aparelho da criança** | Código do atleta (sem e-mail) | Ver o plano dela (turma + casa) e registrar o progresso. Nada mais |

Uma pessoa pode ser responsável e treinador ao mesmo tempo (ex.: o pai que treina a turma do filho).

## 2. Dados na nuvem (Firestore)

```
usuarios/{uid}                     e-mail, papéis, aceite dos termos (versão e data)
familias/{familia}                 responsáveis [uid], plano: gratis | premium
familias/{familia}/dados/{chave}   biblioteca da família (treinos, gestos, PIN, Pai Treinador)
atletas/{atleta}                   apelido, família (ou vazia, enquanto não aceitou o convite),
                                   turmas autorizadas, quem criou, aparelhos ligados
atletas/{atleta}/dados/{chave}     jogador, progresso, conquistas, plano de casa, reação, tática...
escolinhas/{escola}                nome, donos [uid], treinadores [uid], plano: gratis | pago, limites
escolinhas/{escola}/dados/{chave}  biblioteca da escolinha (treinos e gestos dela)
escolinhas/{escola}/turmas/{turma} nome, treinadores [uid], atletas [id], código de entrada
  .../turmas/{turma}/plano         plano da turma (dias e treinos)
convites/{código}                  convite de atleta, de treinador, de turma ou de aparelho
                                   (código longo, com validade e uso único)
```

**O atleta é da família.** O treinador cadastra e convida. Até a família aceitar, o atleta tem só o
apelido e o treinador não vê progresso nenhum. Quando a família aceita, ela vira a dona e autoriza a
turma, e pode tirar a autorização quando quiser. Isso atende à LGPD (art. 14): dado de criança só com
consentimento específico do responsável.

**Plano da criança na agenda** = plano das turmas dela + plano de casa da família, juntos no mesmo dia,
cada item com a origem marcada ("⚽ Turma Sub-9" / "🏠 Casa").

## 3. Quem lê e grava o quê (regras do Firestore)

- `familias/*`: só os responsáveis da família.
- `atletas/{a}` e `dados`:
  - os responsáveis da família leem e gravam;
  - os aparelhos ligados ao atleta leem e gravam o progresso;
  - os treinadores das turmas autorizadas **só leem**.
- `escolinhas/*`, as turmas e o plano da turma: os treinadores gravam. Os atletas da turma, e os
  aparelhos e famílias deles, leem o plano da turma.
- `convites/*`: quem tem o código lê aquele convite (o código é o próprio id, longo e com validade).
- Aparelho da criança: entra como **usuário anônimo** do Firebase e troca o código do atleta por
  acesso só àquele atleta.
- `plano` e `limites`: só o servidor muda, depois que existir pagamento. As regras recusam mudança feita
  pelo app.

## 4. Gratuito agora, pago depois

Desde o começo, cada escolinha e cada família nascem com `plano: "gratis"` e `limites`. O app
respeita esses limites. Para cobrar depois, só se liga o pagamento, sem refazer os dados.

Sugestão inicial (a decidir quando for cobrar):

| | Grátis | Pago |
|---|---|---|
| Escolinha | 1 treinador, 1 turma, até 20 atletas | Mais treinadores, turmas e atletas; relatório da turma (PDF); vídeos da escolinha na nuvem |
| Família | Tudo do app, filhos sem limite | Fotos e vídeos sincronizados entre aparelhos; relatório de evolução |

Pagamento: Pix e cartão por **Mercado Pago** (ou Stripe), com assinatura mensal. Funciona assim:
1. O app abre o pagamento.
2. O Mercado Pago avisa o servidor (Cloud Function) quando o pagamento entra.
3. O servidor muda o `plano`.

As Cloud Functions exigem o plano **Blaze** do Firebase (pago por uso, com cartão cadastrado). Só ativa
nessa fase, com alerta de gasto.

## 5. Fases

1. **Fundação** (grátis, sem servidor):
   - login Google e e-mail com link, papéis, aceite dos termos;
   - família com pai e mãe;
   - atletas e aparelho da criança por código;
   - a conta da família que já está pronta (`src/conta`) passa a usar `atletas` no lugar de "filhos".
2. **Escolinha:**
   - escolinha, convite de treinador, turmas;
   - atleta pelo convite do treinador ou pelo código da turma;
   - autorização da família;
   - plano da turma na agenda da criança;
   - painel do treinador com o progresso de cada atleta.
3. **Antes de abrir para o público:**
   - App Check (só o app grava no banco), alerta de gasto, limites do plano grátis;
   - páginas públicas de **Política de Privacidade** e **Termos de Uso**, incluindo os termos para
     escolinhas (a escolinha também trata dados dos atletas);
   - checagem de versão dos dados entre aparelhos.
   - Os textos jurídicos eu escrevo como rascunho, mas, por envolver crianças, devem ser revisados por
     um advogado.
4. **Cobrança:** plano Blaze, Cloud Functions, Mercado Pago, tela de planos e de assinatura.

## 5.1 Como ficou a fase 2 (12/10/2026)

- **Treinador:** em `/treinador` (ou Conta → "Sou treinador de escolinha"):
  - cria a escolinha (plano grátis: 1 treinador, 1 turma, 20 atletas) ou entra com o código de outro
    treinador;
  - cria a turma;
  - cadastra o atleta só pelo apelido, o que gera um **convite** para a família (30 dias), ou passa o
    **código da turma** (vários usos) para as famílias que já usam o app;
  - monta o **plano da turma** dos próximos 14 dias, com "repetir a semana";
  - vê o **treino** de cada atleta autorizado: nível, XP, dias treinados e conquistas.
- **Família:** Conta → atleta → **⚽ Entrar numa turma**, com o código e a caixa de autorização ("os
  treinadores podem VER os treinos..."). **Tirar** a qualquer hora: o treinador perde o acesso na hora.
- **Agenda da criança:** os treinos da turma entram no dia marcados "⚽ <turma>", os de casa marcados
  "🏠 Casa". O mesmo treino nos dois aparece uma vez só, valendo o da turma.
- **Limites da v1:**
  - um atleta fica em **uma escolinha** por vez, mas pode estar em várias turmas dela;
  - o plano da turma usa só treinos do próprio app (calendário, séries e treinos de fundamentos
    prontos), com um link de vídeo opcional. Biblioteca própria da escolinha fica para depois;
  - o limite de 20 atletas é conferido pelo app. As regras do banco conferem só o limite de turmas e de
    treinadores. Contar atletas com segurança precisa do servidor (fase 4).

## 5.2 Como ficou a fase 3 (12/10/2026)

- **Política de Privacidade** (`/privacidade`) e **Termos de Uso** (`/termos`):
  - páginas públicas, em linguagem simples;
  - incluem segurança nos treinos e regras para escolinhas;
  - os dados do controlador ficam em `src/data/legal.ts`, e enquanto `RASCUNHO = true` aparece o
    aviso de rascunho.
- **Aceites:**
  - responsável e treinador aceitam a política e os termos ao entrar (guarda a versão e a data);
  - quem cria a escolinha aceita a parte "Escolinhas e treinadores".
- **Baixar os meus dados:** um arquivo .json com tudo o que a nuvem guarda da família e dos atletas
  (direito de acesso e de portabilidade).
- **Versão do formato dos dados** (`VERSAO_DADOS`): cada dado na nuvem leva a versão do app que gravou.
  Um aparelho com app antigo não aplica nem sobrescreve dado de app mais novo, e mostra "atualize o
  app". Um teste avisa quando a versão de um store muda.
- **App Check** (reCAPTCHA v3): fica pronto no código e é ligado quando a chave existir.
- **Custo:** o plano Spark não cobra. O alerta de gasto é criado quando passar para o Blaze (fase 4).
- **Checklist antes de abrir ao público:** FIREBASE.md.

## 5.3 Como ficou a fase 4 (12/10/2026)

- **Mercado Pago**, recebendo como pessoa física por enquanto (CNPJ depois). Planos da escolinha por
  faixa de atletas: **Grátis** (20 atletas), **Básico** (60) e **Pro** (500), mensal ou anual.
  - Os preços são provisórios e ficam em `functions/src/planos.json`. É o mesmo arquivo que o app
    mostra.
  - Família Premium fica "em breve".
- **Servidor** (`functions/`, Cloud Functions 2ª geração, em São Paulo):
  - `criarPagamento`: assinatura mensal no cartão ou pagamento avulso por Pix, boleto ou cartão;
  - `avisoMercadoPago`: webhook com conferência do x-signature, idempotente;
  - `cancelarAssinatura`;
  - `vencerPlanos`: todo dia;
  - `contarAtletas`: limite de atletas garantido pelo servidor.
- Regras de cobrança puras e testadas em `functions/src/regras.ts`. O app só lê o plano: plano,
  limites, validade, assinatura e contagem só o servidor grava.
- Tela **⭐ Planos** na área do treinador. Termos com pagamento, renovação, cancelamento e
  arrependimento de 7 dias (CDC, art. 49).
- Como ligar: **COBRANCA.md**.

## 6. O que o dono do app precisa fazer

- Criar o projeto Firebase (FIREBASE.md) e, além do Google, ligar em Authentication:
  - **E-mail/senha → Link do e-mail (login sem senha)**;
  - **Anônimo** (para o aparelho da criança).
- Na fase 3: definir quem é o controlador dos dados (pessoa física ou empresa, CNPJ), o e-mail de
  contato para pedidos da LGPD e passar os textos por revisão jurídica.
- Na fase 4: conta no Mercado Pago (ou Stripe) e cartão no plano Blaze.
