# Trocar a arte (GIF, imagem ou vídeo) dos gestos

Cada gesto do 📖 Fundamentos e gestos mostra um **desenho** (o bonequinho). Você pode trocar esse
desenho por um **GIF, imagem ou vídeo curto**, para **todo mundo** que usa o app publicado.

## Como fazer

1. Salve o arquivo com o **nome do gesto** (coluna "Arquivo" da tabela abaixo), por exemplo
   `passe-primeira.gif`.
   - Tipos aceitos: `.gif`, `.webp`, `.png`, `.jpg`, `.mp4`, `.webm`.
   - Prefira **vídeo curto `.mp4`** (fica bem mais leve que GIF): até uns 5 segundos, sem som,
     quadrado ou em pé. Se for GIF, procure deixar com **menos de 2 MB**.
2. Coloque o arquivo na pasta **`D:\IA\FutKids\srcssets\gestos\`**.
3. Me peça para **publicar**. Eu confiro os nomes (um teste avisa se algum arquivo não bate com um
   gesto) e publico.

Para **trocar** um GIF que já foi publicado: coloque o novo com o **mesmo nome** (substituindo o
antigo) e peça para publicar. Para **voltar ao desenho**, apague o arquivo e peça para publicar.

## Regras importantes

- ⚠️ A pasta `src/assets/gestos/` vai para o **site público**. Só use **personagem genérico ou
  desenho**: **nunca foto ou vídeo de criança de verdade** (LGPD e ECA) e sem marcas (logo de
  material esportivo etc.).
- Arte que deve ficar **só no seu computador** (ex.: feita a partir da foto do seu filho) vai em
  **`src/local/gestos/`**, com o mesmo nome. Essa pasta nunca vai para o GitHub nem para o site.
- Ordem do que aparece: imagem posta pelos pais no aparelho (editor de gesto) → arte do seu
  computador (`src/local`) → arte publicada do gesto (`src/assets/gestos`) → arte da pose
  (`src/assets/goleiro3d`, vale para todos os gestos com o mesmo desenho) → o desenho.
- Com vídeo, ele roda sozinho, em loop e sem som, na página do gesto; nas listas aparece parado.

## Nomes dos arquivos

A última coluna é o desenho que o gesto usa hoje: gestos com o mesmo desenho são os que mais
ganham com uma arte própria.

### 🧤 Goleiro

| Arquivo | Gesto | Categoria | Nível | Desenho de hoje |
|---|---|---|---|---|
| `base` | Posição base | Postura e posicionamento | Básico | `base` |
| `posicionamento` | Posicionamento (fechar o ângulo) | Postura e posicionamento | Intermediário | `posicionamento` |
| `lateral` | Deslocamento lateral | Postura e posicionamento | Básico | `lateral` |
| `passo-cruzado` | Passo cruzado | Postura e posicionamento | Intermediário | `passo-cruzado` |
| `saida` | Saída rápida | Saída do gol | Básico | `saida` |
| `recuo` | Recuo (de costas) | Saída do gol | Básico | `recuo` |
| `encaixe` | Encaixe baixo (bola rasteira) | Encaixe (agarrar) | Básico | `encaixe` |
| `encaixe-medio` | Encaixe médio (barriga e peito) | Encaixe (agarrar) | Básico | `encaixe-medio` |
| `alta` | Encaixe alto (mãos em W) | Encaixe (agarrar) | Intermediário | `alta` |
| `espalmar` | Espalmar | Desvios | Intermediário | `espalmar` |
| `defesa-pe` | Defesa com o pé | Desvios | Intermediário | `defesa-pe` |
| `queda-lateral` | Queda lateral | Quedas | Intermediário | `queda-lateral` |
| `mergulho` | Mergulho | Quedas | Avançado | `mergulho` |
| `cruz` | Cruz | 1 contra 1 | Avançado | `cruz` |
| `abafa` | Bloqueio (abafa) | 1 contra 1 | Avançado | `abafa` |
| `estrela` | Parede (estrela) | 1 contra 1 | Avançado | `estrela` |
| `rolar` | Reposição rolando | Reposição | Básico | `rolar` |
| `reposicao-alta` | Reposição por cima (lançamento) | Reposição | Intermediário | `reposicao-alta` |
| `reposicao-pe` | Reposição com o pé | Reposição | Intermediário | `reposicao-pe` |
| `passe-pe` | Passe e domínio (goleiro-linha) | Jogo com os pés | Avançado | `reposicao-pe` |
| `comunicacao` | Comunicação | Comunicação | Básico | `comunicacao` |
| `levantar-rapido` | Levantar rápido depois da queda | Quedas | Intermediário | `levantar` |
| `encaixe-queda` | Encaixe com queda | Quedas | Avançado | `queda-lateral` |
| `desvio-por-cima` | Desvio por cima | Desvios | Avançado | `espalmar` |
| `reflexo` | Defesa de reflexo | Desvios | Avançado | `base` |
| `posicao-escanteio` | Posição no escanteio | Postura e posicionamento | Intermediário | `posicionamento` |
| `barreira` | Montar a barreira | Postura e posicionamento | Avançado | `comunicacao` |

### ⚽ Linha

| Arquivo | Gesto | Categoria | Nível | Desenho de hoje |
|---|---|---|---|---|
| `dominio-sola` | Domínio com a sola | Domínio | Básico | `dominio-sola` |
| `dominio-orientado` | Domínio orientado | Domínio | Intermediário | `passe-interno` |
| `dominio-de-costas` | Domínio de costas (pivô) | Domínio | Avançado | `protecao` |
| `passe-interno` | Passe com a parte de dentro | Passe | Básico | `passe-interno` |
| `passe-sola` | Passe de sola | Passe | Intermediário | `dominio-sola` |
| `passe-primeira` | Passe de primeira | Passe | Avançado | `passe-interno` |
| `conducao` | Condução de bola | Condução e drible | Básico | `conducao` |
| `conducao-sola` | Condução com a sola | Condução e drible | Intermediário | `dominio-sola` |
| `drible-corte` | Corte (mudar de direção) | Condução e drible | Intermediário | `drible` |
| `finta-corpo` | Finta de corpo | Condução e drible | Avançado | `drible` |
| `protecao` | Proteção de bola | Condução e drible | Intermediário | `protecao` |
| `chute-bico` | Chute de bico | Finalização | Básico | `chute` |
| `chute-peito-pe` | Chute com o peito do pé | Finalização | Intermediário | `chute` |
| `finalizacao-canto` | Tocar no canto | Finalização | Avançado | `passe-interno` |
| `marcacao-postura` | Posição de marcação | Marcação | Básico | `marcacao-linha` |
| `desarme` | Desarme (o bote certo) | Marcação | Intermediário | `marcacao-linha` |

### 👥 Comuns

| Arquivo | Gesto | Categoria | Nível | Desenho de hoje |
|---|---|---|---|---|
| `base-atletica` | Posição de expectativa | Movimentação | Básico | `base-linha` |
| `arrancada` | Arrancada (primeiro passo) | Movimentação | Básico | `arrancada` |
| `mudanca-direcao` | Frear e mudar de direção | Movimentação | Intermediário | `mudanca-direcao` |
| `olhar-antes` | Olhar antes de receber | Visão de jogo | Intermediário | `olhar` |
| `pedir-bola` | Pedir a bola | Comunicação | Básico | `pedir` |

