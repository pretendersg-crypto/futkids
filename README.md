# FutKids ⚽

Jogo de treino de futebol para crianças de 6 a 12 anos, com foco em goleiro. Funciona no navegador
do celular e pode ser instalado como app (PWA), inclusive sem internet.

- **Treinos**: aquecimento (sempre antes) e séries de velocidade, rápido e devagar (intervalado),
  força com o peso do corpo, prevenção de lesões e alongamento, com bonequinho animado, timer e contador,
  e os **vídeos do treinador** por categoria
- **Categorias do jogador**: 🍼 Baby → 🌱 Novato → ⚽ Iniciante → 🌶️ Sabor Pro → 🥇 Profissional → 👑 Lenda.
  A criança sobe pelo nível (XP): Baby 1, Novato 3, Iniciante 5, Sabor Pro 8, Profissional 12, Lenda 17.
  Cada treino do botão Treinar e cada vídeo tem uma categoria e fica com 🔒 até a criança chegar nela.
  Na aba Pais, um adulto pode escolher a categoria na mão e mudar a categoria de cada treino e vídeo. O que
  está na agenda do dia abre naquele dia, mesmo acima da categoria.
- **Goleiro**: 3 minijogos (Defesa, Reflexo, Posição) em 3 níveis + fundamentos com bola de verdade
- **Rali de Gestos**: desafios por inclinação do celular ou toque, contador de embaixadinhas reais e
  saltos contados pelo acelerômetro (só com um adulto liberando)
- **Reação** (ideia do app SwitchedOn): o celular mostra cores, setas (verdes ou vermelhas = "ao contrário")
  e números, e o goleiro reage. Dois modos:
  - **celular no chão**: os sinais passam sozinhos, em tela cheia, com bip e voz opcional, em séries com descanso
    (ex.: cone da cor, mergulho para o lado da seta, bola do número);
  - **toque na tela**: a criança toca a resposta e o app mede o tempo de reação e os acertos.

  8 drills prontos (adaptados para 6 a 12 anos), **criar/copiar drills** (portão dos pais) e **histórico**
  com data, sinais, séries, acertos, reação média e gráfico da evolução (`futkids-reacao` no localStorage).
- **Futsal Tático** (Home → 🧠): puzzles de "qual a melhor jogada?" como os de xadrez, numa quadra vista de
  cima. Toque no jogador que pisca e na seta da jogada (passe, correr, chutar, driblar, marcar). Explicação
  de cada escolha, dica, revelar, puzzles de **sequência** (tabela, pivô, 2 contra 1, bloqueio...), rating
  (Elo), acertos seguidos, rodada de 5 em modo treino ou **contra o relógio**, filtros por dificuldade e tipo,
  lista de puzzles e gráfico do progresso. 19 puzzles: ataque, defesa (com goleiro), transição e bola parada.
- **Alimentação do Craque**: lições com o mascote, jogo das turmas dos alimentos, monte o prato,
  verdade ou mentira e garrafinha de água do treino (sem dieta, calorias ou suplementos)
- **Agenda**: calendário de pré-temporada de goleiros (61 dias, com os vídeos do treinador) ou plano
  infantil de 4 semanas, check-in, dias seguidos, missões e lembrete diário
- **Área dos pais** (aba "Pais" na Agenda, com PIN): escolher o programa e a data de início, ver o mês com o que a
  criança fez, mudar qualquer dia, trocar os links dos vídeos e ver os treinos de academia do calendário
- **Treinos editáveis pelos pais** (aba Pais → "💪 Treinos (botão Treinar)"):
  - mudar os exercícios de qualquer série: nome, ícone, por tempo, repetições ou rápido e devagar, quantidade,
    velocidade e qual movimento do bonequinho (galeria com prévia), além dos passos;
  - usar um GIF próprio no lugar do bonequinho (até 3 MB, guardado no aparelho);
  - criar treinos novos, que aparecem no menu Treinos e podem entrar em qualquer dia do calendário.

  Tudo fica só no aparelho (`futkids-treinos` no localStorage e os GIFs no IndexedDB `futkids-midia`).
- **Perfil**: álbum de figurinhas, conquistas e loja do avatar com moedas
- **Bolinha**, o mascote que guia e torce

**Privacidade (LGPD infantil):** sem anúncios, sem login, sem servidor. Nenhum dado sai do aparelho:
tudo fica no `localStorage` do navegador. A criança não digita nome. O apelido vem de uma lista ou é
digitado por um adulto, e as partes "de adulto" (apelido livre, compartilhar, lembrete, desafio com o
celular no corpo) ficam atrás de uma conta de multiplicar ("portão dos pais").

---

## Como rodar

Precisa do [Node.js](https://nodejs.org) 20.19+ ou 22.12+ (o Vite 8 exige).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (normalmente http://localhost:5173). No computador, use o modo celular
das ferramentas do navegador (F12 → ícone de celular) para ver como fica no telefone.

### Testar no celular (sensores e instalação)

Os sensores de movimento e a instalação só funcionam em HTTPS. Com o celular no mesmo Wi-Fi do computador:

```bash
npm run dev:celular
```

Abra no celular o endereço `https://…:5173` que aparece no terminal e aceite o aviso de certificado
(é um certificado de teste). Esse modo deixa o servidor visível na rede local: use só em rede de confiança.

### Testes

```bash
npm test
```

Testes (Vitest) do Futsal Tático: validador de jogada, aplicação da jogada na quadra, cálculo do rating
e conferência de todos os puzzles.

### Outros comandos

| Comando | O que faz |
| --- | --- |
| `npm run build` | Gera a versão final em `dist/` (inclui o service worker do PWA e o `404.html`) |
| `npm run preview` | Serve o `dist/` para conferir a versão final |
| `npm run lint` | Confere o código (oxlint) |

---

## Como adicionar conteúdo (sem mexer em código)

Os conteúdos ficam em arquivos JSON/TS dentro de `src/data/`.

### Exercícios (treinos e fundamentos do goleiro): `src/data/exercicios.json`

```json
{
  "id": "polichinelo",
  "modulo": "aquecimento",
  "nome": "Polichinelo",
  "emoji": "⭐",
  "tipo": "repeticoes",
  "meta": 15,
  "ritmoMs": 1400,
  "animacao": "polichinelo",
  "xp": 10,
  "videoId": "aq-polichinelo",
  "passos": ["Pule abrindo braços e pernas", "Pule de novo fechando", "Siga o ritmo do bip"]
}
```

- `modulo`: `aquecimento`, `velocidade`, `ritmo`, `forca`, `prevencao`, `alongamento` (séries do menu
  Treinos, listadas em `src/features/treino/series.ts`) ou `goleiro` (fundamentos). A série mostra os
  exercícios na ordem do arquivo
- `tipo`:
  - `tempo`: `meta` em segundos
  - `repeticoes`: `meta` = quantas vezes. O app conta sozinho no ritmo de `ritmoMs`, com um bip a cada repetição
  - `intervalos`: `meta` = rodadas de parte rápida + parte devagar, com
    `"intervalo": { "forteS": 15, "fracoS": 15 }`
- `animacao`: um dos movimentos do bonequinho (`corrida`, `polichinelo`, `agachamento`,
  `alongamento-lateral`, `moinho`, `encaixe`, `saida-gol`, `reposicao`, `pontinha`, `equilibrio`, `cruz`,
  `prancha`, `braco-cruzado`, `quadriceps`). Movimento novo = keyframes em `src/features/treino/boneco.css` + nome
  no tipo `AnimacaoBoneco` em `src/data/catalogo.ts`

### Calendário de goleiros e vídeos do treinador: `src/data/calendarioGoleiros.ts`

- `TREINOS_CALENDARIO`: cada treino do calendário. Os campos são:
  - `videoUrl`: o vídeo original, que abre fora do app só depois da conta para adultos;
  - `rota`: a série animada do app que adapta o treino para a criança;
  - `atividade`: o que marca o dia como feito.
- `PROGRAMA_GOLEIROS`: os 61 dias, na ordem do PDF. Um dia sem itens é descanso. Um item pode ter
  `video` próprio, que vale só naquele dia.
- **Vídeo virando animação:** crie a série nova (exercícios em `exercicios.json` + entrada em
  `src/features/treino/series.ts`) e troque a `rota` do treino para ela.
- **Vídeos novos pelo app:** na área dos pais, "➕ Adicionar vídeo" pede o tipo (aquecimento, alongamento, HIIT,
  corrida, força e velocidade, força com técnica, prevenção, técnica de goleiro, academia ou outro), um ícone, um nome e o
  link do YouTube. O tipo define a série animada e o que conta como feito (`TIPOS_TREINO` neste arquivo). O vídeo
  pode ser colocado em qualquer dia do calendário.
- **O que os pais mudam pelo app** (data de início, dias trocados, links, vídeos adicionados): fica só no aparelho
  (`futkids-programa` no localStorage). Para mudar o calendário de todo mundo, edite este arquivo.

### Vídeos de exemplo: `src/data/videos.json`

```json
{ "id": "aq-polichinelo", "titulo": "Polichinelo", "duracao": 20, "urlVideo": "polichinelo.mp4", "thumbnailUrl": "polichinelo.webp" }
```

- Com `urlVideo` vazio, o botão "Ver exemplo 🎥" mostra o bonequinho animado
- Caminho relativo = arquivo em `public/videos/`. Para usar um CDN, crie um `.env` com
  `VITE_VIDEOS_BASE_URL=https://seu-cdn/videos/`. URL completa (`https://…`) também funciona
- Se o vídeo falhar, o app volta para o bonequinho
- Vídeos **não** entram no cache offline (são grandes). Prefira MP4 curto e leve (~720p, poucos MB)
- Evite YouTube/redes sociais: podem coletar dados da criança

### Conquistas e figurinhas: `src/data/conquistas.json`

```json
{
  "id": "goleiro-5",
  "numero": 5,
  "nome": "Paredão",
  "descricao": "Faça 5 treinos de goleiro",
  "criterio": { "tipo": "contador", "chave": "goleiro", "minimo": 5 },
  "sticker": { "tipo": "padrao", "emoji": "🧱", "cores": ["#93C5FD", "#1D4ED8"], "animacao": "pulsa" }
}
```

- `numero`: a vaga no álbum
- `criterio.tipo`:
  - `contador`: as chaves existentes são `aquecimento`, `velocidade`, `ritmo`, `forca`, `prevencao`,
    `alongamento`, `goleiro`, `rali`, `checkin`, `embaixadinhas`, `alimentacao`, `turmas-perfeito`,
    `quiz-comida-perfeito`, `prato-campeao` e `agua-dias`
  - `nivel`
  - `sequencia`: dias seguidos (recorde)
  - `diasTreinados`
- As regras são conferidas sozinhas sempre que o progresso muda (inclusive regras novas, na próxima abertura)
- **Figurinhas do designer**:
  - `{ "tipo": "imagem", "url": "goleiro-5.webp", "emojiReserva": "🧱" }`, com o arquivo em
    `public/stickers/`. PNG, SVG ou WebP animado.
  - `{ "tipo": "lottie", "url": "goleiro-5.json", "emojiReserva": "🧱" }`: hoje mostra o emoji reserva.
    Para ativar, instale `lottie-web` e carregue-o com `import()` dentro de
    `src/components/stickers/StickerAnimado.tsx`, assim ele só baixa quando uma figurinha Lottie aparecer.

### Puzzles do Futsal Tático: `src/features/tatica/puzzles/`

Um arquivo por tipo (`ataque.ts`, `defesa.ts`, `transicao.ts`, `bolaParada.ts`). Para criar um puzzle,
copie um parecido e mude:

- `jogadores`: `azul(numero, x, y)` é o seu time, `verm(numero, x, y)` o adversário; `x` e `y` vão de 0 a 1
  (x = 0 é o seu gol, à esquerda; x = 1 é o gol adversário; y = 0 é a lateral de cima);
- `bola`: quem começa com a bola (ex.: `'a10'`);
- `passos`: cada jogada, com a `pergunta` e as `opcoes` (quem faz, `acao`, alvo `paraJogador('a9')`,
  `paraPonto(x, y)` ou `GOL`, o texto do botão, se é a `correta` e a `explicacao`). Exatamente uma certa
  por passo. Em puzzles de sequência, `depois` move outros jogadores após a jogada certa;
- `dica`, `conceito` (o que se aprende) e `rating` (≈650 fácil … 1350 difícil).

Depois rode `npm test`: ele confere todos os puzzles (uma resposta certa por passo, jogadores que existem,
coordenadas dentro da quadra, quem passa está com a bola...).

### Outros conteúdos

| O quê | Onde |
| --- | --- |
| Calendário de goleiros: os 61 dias, os treinos, os links dos vídeos e a academia | `src/data/calendarioGoleiros.ts` |
| Plano infantil (4 semanas que se repetem; o aquecimento entra sozinho antes de cada treino) | `src/data/agenda.json` |
| Lições, alimentos, perguntas do quiz e momentos da água | `src/data/alimentacao.ts` |
| Apelidos prontos | `src/data/apelidos.ts` |
| Falas do mascote | `src/data/mascote.ts` |
| Itens do avatar e preços da loja | `src/features/avatar/opcoesAvatar.ts` (campo `preco`) |
| Níveis do goleiro (velocidade, tamanho, XP) | `src/features/goleiro/niveis.ts` |
| Desafios do rali | `src/features/rali/desafios.ts` |
| Drills de reação prontos (sinais, séries, tempos e instruções) | `src/features/reacao/drills.ts` |
| Cores e setas dos sinais de reação | `src/features/reacao/sinais.ts` |
| Módulos da Home e da barra inferior | `src/data/modulos.ts` |
| Categorias (nomes, ícones e nível de cada uma) | `src/data/categorias.ts` |
| Categoria padrão de cada treino do app | `src/features/treino/series.ts` (campo `categoria`) |
| Categoria padrão de cada vídeo do calendário | `src/data/calendarioGoleiros.ts` (campo `categoria`) |

---

## Publicar (GitHub Pages)

O workflow `.github/workflows/deploy.yml` publica sozinho a cada `git push` na branch `master`:
roda o lint, gera o build e publica em `https://<usuário>.github.io/<repositório>/`.

Primeira vez:

1. Crie o repositório no GitHub e envie o código (`git push`)
2. Em **Settings → Pages → Build and deployment**, escolha **Source: GitHub Actions**
3. Acompanhe na aba **Actions**. No fim aparece o endereço publicado

Detalhes:

- O app usa o nome do repositório como subpasta (`BASE_PATH=/<repositório>/`). Em outro serviço
  publicado na raiz (Netlify, Cloudflare Pages), faça o build sem `BASE_PATH`
- O GitHub Pages não conhece as rotas do app. Por isso o build cria um `404.html` (cópia do
  `index.html`): abrir `/futkids/agenda` direto funciona
- Versão nova publicada: o PWA se atualiza sozinho na próxima abertura

### Instalar no celular

Abra o endereço publicado no Chrome (Android) ou Safari (iPhone):

- **Android**: menu ⋮ → **Instalar app** (ou "Adicionar à tela inicial")
- **iPhone**: botão Compartilhar → **Adicionar à Tela de Início**

Ou pelo próprio app: quando ele está aberto pelo navegador, a Home mostra a faixa **"📲 Instale o FutKids"**
e o Perfil tem o botão **"Instalar o app neste aparelho"** (com o portão dos pais). Onde o navegador deixa
(Chrome/Samsung Internet no Android), instala com um toque; no iPhone/iPad mostra o passo a passo.
Instalado, o app gira junto com a tela (bom no tablet apoiado na horizontal).

### Lembrete diário

Funciona sem servidor:

- Com o app aberto, o aviso chega na hora
- Com o app fechado, aparece ao abrir
- No Chrome do Android com o app instalado, às vezes chega antes (Periodic Background Sync, sem
  horário garantido). O código fica em `public/lembrete-sw.js`

---

## Estrutura

```
src/
├── components/   ui (Modal, ProgressBar, PortaoDosPais…), stickers (figurinhas, álbum),
│                 video (VideoPlayerModal), mascote (Bolinha)
├── features/     aquecimento, treino (série guiada + bonequinho), goleiro, rali, tatica (puzzles,
│                 quadra SVG, validador, rating), reacao (drills,
│                 motor dos sinais, histórico), categoria (Baby…Lenda, cadeados), agenda,
│                 conquistas, avatar
├── stores/       zustand + localStorage: userStore, progressStore, achievementsStore,
│                 agendaStore, configStore, treinosStore, reacaoStore, taticaStore
├── data/         conteúdos (exercícios, vídeos, conquistas, agenda, apelidos, mascote)
├── hooks/        useTimer, useSensor, useLoopJogo, useWakeLock
├── pages/        uma tela por rota (as maiores carregam sob demanda)
└── utils/        datas, sequência de dias, nível, sons (Web Audio)
```

**Tecnologias:** React 19, Vite, TypeScript, Tailwind CSS 4, Zustand, Framer Motion, React Router,
vite-plugin-pwa. Sons gerados na hora (sem arquivos de áudio). Figurinhas, avatar, mascote e
bonequinho desenhados em SVG.

**Dica para testar:** no `npm run dev`, o console do navegador tem `__futkids` com os stores
(ex.: `__futkids.progresso.getState().ganharXP(120)`). Isso não vai para o build final.
