# O que falta fazer (dono do app)

Atualizado em 12/10/2026. Está em ordem: cada etapa só depende das de cima.

- ✅ = já feito
- ⬜ = falta
- ❓ = não sei se foi feito (confira)

---

## Etapa 1 — Terminar a configuração do Firebase (grátis, ~10 min)

- ✅ Projeto `futkids-30a76` criado e configuração enviada.
- ✅ Login **Anônimo** ligado (aparelho da criança). Testado.
- ✅ Login com **Google** ligado. Você entrou nos testes.
- ✅ **App Check** registrado com "reCAPTCHA Enterprise". Testado.
- ❓ Login por **e-mail com link**: Authentication → Método de login → **E-mail/senha** → ligar
  **"Link do e-mail (login sem senha)"** → Salvar.
- ⬜ **Regras do Firestore (versão nova)**: Firestore Database → aba **Regras** → apagar tudo → colar
  o arquivo `firestore.rules` inteiro → **Publicar**. A versão nova tem plano individual, vídeos e
  leitores da turma.
- ⬜ **Domínio do site publicado**: Authentication → aba **Configurações** → **Domínios autorizados**
  → **Adicionar domínio** → `pretendersg-crypto.github.io`.
- ⬜ **Regras do Firestore de novo (15/10/2026)**: mudaram para o Futsal Tático e os circuitos com
  cones da turma (puzzles, pranchetas e circuitos do treinador). Mesmo caminho: Firestore Database → **Regras** → apagar tudo → colar o
  `firestore.rules` inteiro → **Publicar**. Sem isso, salvar puzzle ou circuito "para a turma" dá "sem permissão".
- ⬜ (Opcional) **Nova chave secreta do reCAPTCHA**, porque a antiga foi enviada no chat. O app não usa
  essa chave.

## Etapa 2 — Testar comigo no computador (grátis)

Com o servidor ligado (`npm.cmd --prefix D:\IA\FutKids run dev`):

- ⬜ **Sincronia corrigida:** refazer as edições que não tinham subido para o app do filho.
- ⬜ **Painel do computador** (`/painel`): montar o plano arrastando, copiar e limpar semana.
- ⬜ **Treinador:** plano da equipe, plano individual de um atleta e "copiar para outros atletas".
- ⬜ **Pais:** copiar o plano de casa de um filho para outro.
- ⬜ Me dizer o que ficou estranho. Eu corrijo.

## Etapa 3 — Publicar para você e escolinhas conhecidas (grátis)

- ⬜ **Preencher os seus dados** em `src/data/legal.ts`: nome (ou razão social), CPF/CNPJ,
  cidade/UF e e-mail de contato. Pode me mandar, que eu preencho. Eles aparecem nas páginas públicas
  de Privacidade e Termos.
- ⬜ Me pedir para **publicar**. Vai tudo: contas, escolinha, painel e plano individual. As páginas
  legais continuam com o aviso "Rascunho".
- ⬜ Testar no **celular** pelo site publicado: login, aparelho da criança e agenda.
- ⬜ Depois de uns **3 a 7 dias**, em App Check → APIs → Cloud Firestore: se quase tudo estiver
  "verificado", clicar em **Aplicar**.

## Etapa 4 — Antes de abrir para o público em geral

- ⬜ **Advogado** revisar a Política de Privacidade (`/privacidade`) e os Termos de Uso (`/termos`).
  O app trata dados e imagens de crianças (LGPD art. 14 e ECA).
- ⬜ Com o texto aprovado: me avisar para tirar o "Rascunho" (`RASCUNHO = false`).

## Etapa 5 — Vídeos do treinador e cobrança (passa a ter custo por uso)

**Decisões e contas:**
- ⬜ **Contador**: receber como pessoa física por enquanto ou abrir CNPJ. Para assinatura de software,
  o normal é ME no Simples (MEI não pode essa atividade).
- ⬜ **Confirmar os preços** (hoje provisórios): Básico R$ 49,90/mês ou R$ 499/ano; Pro R$ 99,90/mês
  ou R$ 999/ano. Espaço de vídeos: Grátis 1 GB, Básico 10 GB, Pro 50 GB.

**Firebase:**
- ⬜ Passar para o plano **Blaze**: ⚙️ → Uso e faturamento → Modificar plano.
- ⬜ **Alerta de gasto** (antes de qualquer outra coisa): Google Cloud → Faturamento → Orçamentos e
  alertas → R$ 50/mês, com alertas em 50%, 90% e 100%.
- ⬜ **Ligar o Storage**: Criação → Storage → Vamos começar → região **São Paulo** → modo produção.
  Na aba **Regras**, colar o `storage.rules` → Publicar → **aceitar** a permissão para ler o
  Firestore.

**Mercado Pago** (COBRANCA.md, passo 3):
- ⬜ Criar a conta e a **aplicação** "FutKids" (Checkout Pro + Assinaturas).
- ⬜ Configurar o **Webhook**:
  - URL: `https://southamerica-east1-futkids-30a76.cloudfunctions.net/avisoMercadoPago`;
  - eventos: Pagamentos, Planos e assinaturas, Pagamentos de assinaturas.
- ⬜ Guardar o **Access Token** e a **assinatura secreta** do webhook. São segredos: **não mande no
  chat**.

**Publicar o servidor** (no PowerShell, na pasta `D:\IA\FutKids`, um comando por vez):
- ⬜ `npx firebase-tools login`
- ⬜ `npx firebase-tools use futkids-30a76`
- ⬜ `npx firebase-tools functions:secrets:set MP_ACCESS_TOKEN` (cole o token quando pedir)
- ⬜ `npx firebase-tools functions:secrets:set MP_WEBHOOK_SECRET` (cole a assinatura secreta)
- ⬜ `npm --prefix functions install`
- ⬜ `npx firebase-tools deploy --only functions,firestore:rules,storage`

**Testar:**
- ⬜ **Vídeos**:
  - o treinador sobe um vídeo da turma e um individual;
  - confira no app do filho;
  - tire o filho da turma e veja o vídeo sumir.
- ⬜ **Cobrança com cartões de teste** do Mercado Pago (token de teste):
  - assinar;
  - ver o plano mudar;
  - cancelar a renovação.
- ⬜ Voltar ao **token de produção**, publicar o servidor de novo e fazer um pagamento real pequeno.

## Etapa 6 — Conteúdo (quando quiser)

- ⬜ **Imagens do goleiro laranja** para os outros gestos, no Leonardo, sem logo e com fundo branco
  (prompts em `src/local/PROMPTS_LEONARDO.md`).
- ⬜ **Vídeos curtos** do goleiro laranja (Leonardo Motion) para os gestos.
- ⬜ Me pedir para **atualizar o manual**: ele ainda não tem contas, escolinha nem painel.
