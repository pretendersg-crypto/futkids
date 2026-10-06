# FutKids ⚽

Jogo de treino de futebol para crianças de 6 a 12 anos, com foco em goleiro. Funciona no navegador
do celular e pode ser instalado como app (PWA), inclusive sem internet.

- **Treinos**: aquecimento (sempre antes) e séries de velocidade, rápido e devagar (intervalado),
  força com o peso do corpo, prevenção de lesões e alongamento, com bonequinho animado, timer e contador
- **Goleiro**: 3 minijogos (Defesa, Reflexo, Posição) em 3 níveis + fundamentos com bola de verdade
- **Rali de Gestos**: desafios por inclinação do celular ou toque, contador de embaixadinhas reais e
  saltos contados pelo acelerômetro (só com um adulto liberando)
- **Alimentação do Craque**: lições com o mascote, jogo das turmas dos alimentos, monte o prato,
  verdade ou mentira e garrafinha de água do treino (sem dieta, calorias ou suplementos)
- **Agenda**: calendário de pré-temporada de goleiros (61 dias, com os vídeos do treinador) ou plano
  infantil de 4 semanas, check-in, dias seguidos, missões e lembrete diário
- **Área dos pais** (aba "Pais" na Agenda, com PIN): escolher o programa e a data de início, ver o mês com o que a
  criança fez, mudar qualquer dia, trocar os links dos vídeos e ver os treinos de academia do calendário
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
| Módulos da Home e da barra inferior | `src/data/modulos.ts` |

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
├── features/     aquecimento, treino (série guiada + bonequinho), goleiro, rali, agenda,
│                 conquistas, avatar
├── stores/       zustand + localStorage: userStore, progressStore, achievementsStore,
│                 agendaStore, configStore
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
