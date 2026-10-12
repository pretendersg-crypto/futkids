# Conta da família (Firebase): como ligar

A conta da família usa o **Firebase**, um serviço do Google. Ele cuida do login com Google e guarda
na nuvem os planos e o progresso de cada filho. O plano gratuito (Spark) dá e sobra para uma família
ou um time. Enquanto `src/conta/firebaseConfig.ts` estiver com `null`, o app funciona como antes, só
no aparelho, e mostra "Conta da família: em breve".

## 1. Criar o projeto

1. Entre em <https://console.firebase.google.com> com a sua conta Google.
2. Clique em **Criar um projeto** e dê um nome (ex.: `futkids-familia`).
3. **Desligue** o Google Analytics. O app não usa, e assim nada de uso é coletado.

## 2. Ligar o login com Google

1. No menu: **Criação → Authentication → Vamos começar**.
2. Na aba **Método de login**, escolha **Google**, ligue a chave **Ativar**, escolha o e-mail de
   suporte e **Salve**.
3. Na aba **Configurações → Domínios autorizados**, clique em **Adicionar domínio** e coloque:
   - `pretendersg-crypto.github.io` (o site publicado)
   - `localhost` já vem na lista (para testar no computador)

## 3. Criar o banco de dados (Firestore)

1. No menu: **Criação → Firestore Database → Criar banco de dados**.
2. Local: **southamerica-east1 (São Paulo)**.
3. Comece no **modo de produção**.
4. Na aba **Regras**, apague o que estiver lá, cole o conteúdo do arquivo `firestore.rules` deste
   projeto e clique em **Publicar**.

## 4. Pegar a configuração do app web

1. Na engrenagem ⚙️ → **Configurações do projeto** → **Seus apps** → ícone **`</>`** (Web).
2. Apelido do app: `futkids`. **Não** marque Firebase Hosting (o site continua no GitHub Pages).
3. O Firebase mostra um bloco `const firebaseConfig = { apiKey: ..., authDomain: ..., ... }`.
4. Copie esse bloco e mande para o Claude. Ele coloca em `src/conta/firebaseConfig.ts`.

Esses valores **não são senha**: todo app web do Firebase mostra isso no navegador. Quem protege os
dados são as regras do passo 3.

## Como funciona depois de ligado

- **Celular do pai:** Agenda → 👨‍👩‍👧 Pais → ☁️ Conta da família → aceita o aviso → **Entrar com
  Google**. Cria os filhos pelo apelido. No topo da área dos pais, **"📋 Plano de: …"** troca o filho
  cujo plano você está montando.
- **Aparelho da criança:** entra uma vez com o Google do pai e escolhe **qual filho treina ali**. O
  aparelho fica nesse filho. Trocar de filho ou sair só pela área dos pais, com o PIN.
- **Sincronia:** o que o pai muda chega no aparelho da criança na hora, se os dois estiverem com
  internet. O progresso da criança volta para o pai. Sem internet, cada aparelho segue normalmente e
  envia quando a internet volta. Se os dois mudarem o mesmo dado ao mesmo tempo, vale o mais recente.
- **O que é de cada um:**
  - **Da família:** treinos e gestos criados pelos pais, treinos de fundamentos, PIN e Pai/Mãe
    Treinador.
  - **De cada filho:** jogador, progresso, conquistas, agenda/plano, reação, tática e gestos
    concluídos.
  - **Só do aparelho, nunca vai para a nuvem:** fotos e vídeos gravados, som e a faixa de instalar.
  - A lista completa está em `src/conta/chaves.ts`.
- **Apagar:** Conta da família → Privacidade, sair e apagar → **Apagar a conta e todos os dados da
  nuvem**.
