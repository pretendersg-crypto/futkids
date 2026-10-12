# Conta (Firebase): como ligar

A conta do FutKids usa o **Firebase**, um serviço do Google, para o login e para guardar na nuvem os
planos e o progresso. O desenho completo (famílias, atletas, escolinhas, planos pagos) está em
[ARQUITETURA_CONTAS.md](ARQUITETURA_CONTAS.md).

Enquanto `src/conta/firebaseConfig.ts` estiver com `null`, o app funciona como antes, só no
aparelho, e mostra "Conta: em breve".

## 1. Criar o projeto

1. Entre em <https://console.firebase.google.com> com a sua conta Google.
2. Clique em **Criar um projeto** e dê um nome (ex.: `futkids`).
3. **Desligue** o Google Analytics. O app não usa, e assim nada de uso é coletado.

## 2. Ligar os 3 jeitos de entrar

Menu **Criação → Authentication → Vamos começar**, aba **Método de login**:

1. **Google** → Ativar → escolha o e-mail de suporte → Salvar.
2. **E-mail/senha** → ligue **Link do e-mail (login sem senha)** → Salvar. A primeira chave, de senha,
   pode ficar desligada.
3. **Anônimo** → Ativar → Salvar. É assim que o aparelho da criança entra só com o código do atleta,
   sem e-mail.

Na aba **Configurações → Domínios autorizados**, clique em **Adicionar domínio** e coloque
`pretendersg-crypto.github.io`. O `localhost` já vem na lista.

## 3. Criar o banco de dados (Firestore)

1. Menu **Criação → Firestore Database → Criar banco de dados**.
2. Local: **southamerica-east1 (São Paulo)**.
3. Comece no **modo de produção**.
4. Na aba **Regras**, apague o que estiver lá, cole todo o conteúdo do arquivo `firestore.rules`
   deste projeto e clique em **Publicar**.

## 4. Pegar a configuração do app web

1. Clique na engrenagem ⚙️ → **Configurações do projeto** → **Seus apps** → ícone **`</>`** (Web).
2. Apelido: `futkids`. **Não** marque Firebase Hosting (o site continua no GitHub Pages).
3. Copie o bloco `const firebaseConfig = { ... }` que aparece e mande para o Claude, que coloca em
   `src/conta/firebaseConfig.ts`.

Esses valores **não são senha**: todo app web do Firebase mostra isso no navegador. Quem protege os
dados são as regras do passo 3.

## 5. Proteção contra uso indevido (App Check), antes de abrir ao público

O App Check faz o banco só aceitar pedidos que vêm do app, e não de um robô gastando a sua cota. Ele
usa o **reCAPTCHA Enterprise**, que no Google Cloud agora se chama **Fraud Defense**.

1. Abra o **Google Cloud Console** no **mesmo projeto** do Firebase (`futkids-30a76`) e procure por
   **Fraud Defense** na barra de busca. Se pedir, ative a API.
2. Crie uma **chave** (key):
   - tipo **Site** (Website);
   - domínios `pretendersg-crypto.github.io` e `localhost`;
   - não marque "desafio de caixa de seleção" (checkbox): o App Check usa a chave por pontuação, que
     não aparece para a criança.
3. Copie o **ID da chave** (a chave do site). No Enterprise não há chave secreta.
4. No Firebase: **Criação/Segurança → App Check → Apps → seu app web → reCAPTCHA Enterprise**, cole
   o ID da chave e salve.
5. Mande o **ID da chave** para o Claude. Ele não é segredo. O Claude coloca em
   `APP_CHECK_CHAVE_SITE` (`src/conta/firebaseConfig.ts`).
6. Deixe uns dias só **monitorando** (App Check → APIs → Cloud Firestore → métricas).
   - Se quase tudo vier "verificado", clique em **Aplicar** (enforce).
   - No computador de testes, o console do navegador mostra um "token de depuração". Cadastre esse
     token em App Check → Gerenciar tokens de depuração.

**Custo:** até **10 mil verificações por mês grátis**. O app só pede uma verificação nova quando o
"passe" vence, e não a cada leitura. Para gastar menos, aumente a validade do passe em App Check →
Apps → ⋮ → TTL (ex.: 12 horas). Se o Google Cloud pedir uma conta de faturamento para ativar a API,
ela será a mesma do plano Blaze da fase de cobrança.

## 6. Custos e alerta de gasto

- No plano **Spark** (gratuito) não há cobrança: se a cota do dia acabar, o banco para até o dia
  seguinte.
- Quando passar para o **Blaze** (fase de cobrança), faça isto antes de qualquer outra coisa:
  - Google Cloud → Faturamento → **Orçamentos e alertas**;
  - crie um orçamento baixo (ex.: R$ 50/mês) com alertas em 50%, 90% e 100%.

## Antes de abrir ao público (checklist)

- [ ] `src/data/legal.ts`:
  - [ ] nome ou razão social, CPF/CNPJ, cidade e e-mail de contato preenchidos;
  - [ ] `RASCUNHO = false`.
- [ ] Política de Privacidade (`/privacidade`) e Termos de Uso (`/termos`) **revisados por um
      advogado**. O app trata dados de crianças (LGPD art. 14).
- [ ] App Check ligado e aplicado (seção 5).
- [ ] Regras do Firestore publicadas com a versão atual de `firestore.rules`.
- [ ] Teste de ponta a ponta feito:
  - [ ] pai e mãe;
  - [ ] aparelho da criança;
  - [ ] treinador e turma;
  - [ ] tirar da escolinha;
  - [ ] apagar a conta;
  - [ ] baixar os dados.

## Como funciona (Fase 1: famílias)

- **Responsável no celular dele:** Conta → "Sou o responsável" → aceita o aviso → entra com Google
  ou com o link no e-mail → "Criar a minha família" → adiciona os atletas pelo apelido.
  - Para entrar sem montar jogador, use o link "Sou adulto…" na tela do jogador ou o endereço `/conta`.
- **Outro responsável (pai/mãe):** o 1º toca em "👥 Convidar o outro responsável" e passa o código.
  O 2º entra na conta dele e digita o código em "Sua família". O código vale 7 dias, uma vez só.
- **Aparelho da criança:** o responsável toca em "📱 Ligar o aparelho dele". No tablet da criança:
  Conta → "Este é o aparelho da criança" → digita o código (vale 24 horas, uma vez só). Não fica
  e-mail nenhum no aparelho. Em "🔗 Aparelhos", o responsável desliga um aparelho perdido.
- **Treinador de escolinha** (`/treinador`, ou Conta → "Sou treinador de escolinha"): entra com
  Google ou e-mail, cria a escolinha e a turma, cadastra os atletas pelo apelido (o que gera um
  convite para a família) ou passa o **código da turma**, e monta o plano da turma. A família põe o
  filho na turma em Conta → atleta → "⚽ Entrar numa turma", autorizando o treinador a ver os
  treinos. Detalhes em ARQUITETURA_CONTAS.md, seção 5.1.
- **Montar o plano:** no topo da área dos pais, **"📋 Plano de: …"** escolhe o atleta.
- **Sincronia:**
  - O que o responsável muda chega no aparelho da criança na hora, e o progresso volta.
  - Sem internet, cada aparelho segue normalmente e envia quando a internet voltar.
  - Se os dois lados mudarem o mesmo dado, vale a mudança mais recente.
- **O que é de quem** (lista completa em `src/conta/chaves.ts`):
  - **Família:** treinos e gestos criados pelos pais, treinos de fundamentos, PIN e Pai Treinador.
  - **Atleta:** jogador, progresso, conquistas, plano de casa, reação e tática.
  - **Só no aparelho:** fotos e vídeos gravados.
- **Apagar:** Conta → Privacidade, sair e apagar.
  - Se você é o único responsável, apaga tudo da família na nuvem.
  - Se há outro responsável, você só sai da família e os dados continuam com ele.
