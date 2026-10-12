# Cobrança (fase 4): como ligar o Mercado Pago

O código está pronto:
- o servidor fica em `functions/`;
- a tela "⭐ Planos" fica na área do treinador;
- os preços estão em `functions/src/planos.json`.

Nada cobra enquanto o servidor não for publicado e as chaves do Mercado Pago não estiverem configuradas.

## Como funciona

1. O dono da escolinha escolhe o plano em **Área do treinador → ⭐ Planos** e escolhe como pagar:
   - **assinatura mensal no cartão**, que renova sozinha;
   - **1 ano**, em Pix, boleto ou cartão em até 12x;
   - **1 mês**, em Pix ou boleto.
2. O app pede ao servidor (`criarPagamento`), que cria o pagamento no Mercado Pago com o preço do
   catálogo e devolve o link. A pessoa paga no Mercado Pago, e o FutKids nunca vê o cartão.
3. O Mercado Pago avisa o servidor (`avisoMercadoPago`). O servidor confere a assinatura do aviso,
   consulta o pagamento no Mercado Pago e muda o plano e os limites da escolinha. As regras do banco
   não deixam o app mudar o plano.
4. Todo dia às 3h, `vencerPlanos` volta para o grátis quem venceu sem renovar. Nada é apagado: o que
   passar do limite só fica bloqueado para crescer.
5. `contarAtletas` conta os atletas da escolinha e desfaz uma entrada acima do limite do plano.

**Planos:** Grátis (20 atletas), Básico e Pro.
- Família Premium está no catálogo como "em breve" (`disponivel: false`), porque os recursos dela
  (fotos e vídeos sincronizados, relatório) ainda não existem.
- **Os preços são provisórios.** Confirme antes de ligar.

## 1. Antes: receber como pessoa física

O Mercado Pago aceita conta de pessoa física. Mesmo assim, vender software com assinatura normalmente
pede CNPJ (MEI não pode ter essa atividade; costuma ser ME no Simples Nacional), para emitir nota e
pagar o imposto certo.

**Converse com um contador antes de cobrar de verdade.** Quando houver CNPJ, é só trocar a conta do
Mercado Pago (passo 3) e os dados em `src/data/legal.ts`.

## 2. Firebase: plano Blaze e alerta de gasto

As Cloud Functions exigem o plano **Blaze** (pago por uso, com cartão cadastrado). Nesse tamanho, o
uso costuma ficar dentro da cota gratuita.

1. Console do Firebase → ⚙️ → **Uso e faturamento** → **Detalhes e configurações** → **Modificar
   plano** → **Blaze**.
2. **Antes de qualquer outra coisa**, crie o alerta de gasto: Google Cloud → **Faturamento** →
   **Orçamentos e alertas** → orçamento de R$ 50/mês com alertas em 50%, 90% e 100%.

## 3. Mercado Pago: credenciais e aviso (webhook)

1. Crie a conta em <https://www.mercadopago.com.br> e entre em <https://www.mercadopago.com.br/developers>
   → **Suas integrações** → **Criar aplicação**.
   - Nome: FutKids.
   - Solução: **Pagamentos online**.
   - Produtos: **Checkout Pro** e **Assinaturas**.
2. Em **Credenciais de produção**, copie o **Access Token** (começa com `APP_USR-`). Ele é um
   **segredo**: não mande por chat nem coloque no código.
3. Em **Webhooks** → **Configurar notificações**:
   - **URL de produção:** `https://southamerica-east1-SEU-PROJETO.cloudfunctions.net/avisoMercadoPago`
     (troque `SEU-PROJETO` pelo id do projeto Firebase).
   - **Eventos:** marque **Pagamentos**, **Planos e assinaturas** (assinaturas) e **Pagamentos de
     assinaturas** (faturas).
   - Salve e copie a **assinatura secreta** que aparece. Ela também é um segredo.

## 4. Publicar o servidor (você, no terminal)

Na pasta `D:\IA\FutKids`, um comando por vez:

1. Entrar no Firebase pelo terminal (abre o navegador para você entrar):
   ```bash
   npx firebase-tools login
   ```
2. Escolher o projeto (troque `SEU-PROJETO`; ou edite o arquivo `.firebaserc`):
   ```bash
   npx firebase-tools use SEU-PROJETO
   ```
3. Guardar o Access Token como segredo (o terminal pede o valor; cole e dê Enter):
   ```bash
   npx firebase-tools functions:secrets:set MP_ACCESS_TOKEN
   ```
4. Guardar a assinatura secreta do webhook:
   ```bash
   npx firebase-tools functions:secrets:set MP_WEBHOOK_SECRET
   ```
5. Instalar o servidor:
   ```bash
   npm --prefix functions install
   ```
6. Publicar o servidor e as regras do banco:
   ```bash
   npx firebase-tools deploy --only functions,firestore:rules
   ```

Se o deploy perguntar o `URL_APP`, responda `https://pretendersg-crypto.github.io/futkids`.

## 5. Testar antes de cobrar de verdade

1. Use as **credenciais de teste** e os **usuários de teste** do Mercado Pago (Suas integrações →
   Contas de teste): troque o segredo `MP_ACCESS_TOKEN` pelo token de teste e publique de novo.
2. Pague com os cartões de teste do Mercado Pago e confira:
   - o plano muda em ⭐ Planos;
   - a validade aparece;
   - "Cancelar a renovação" funciona;
   - um pagamento recusado não muda nada.
3. Volte para o token de produção, publique de novo e faça um pagamento real pequeno.

## 6. Devolução (arrependimento de 7 dias)

O pedido chega pelo e-mail de contato. Para devolver:
1. No painel do Mercado Pago: **Atividade** → o pagamento → **Devolver**.
2. Se for assinatura, cancele também em ⭐ Planos.

O plano volta ao grátis no vencimento. Para cortar antes, mude o documento da escolinha no console do
Firestore: `plano: "gratis"` e os limites do grátis.
