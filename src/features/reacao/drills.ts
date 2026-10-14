// Drills de reação: os prontos (adaptados dos drills de goleiro do SwitchedOn para crianças de
// 6 a 12 anos: menos repetições, mais descanso, quedas só em grama/colchonete), agora também para
// jogador de linha e para todos, e o formato dos drills criados pelos pais/treinador (guardados em
// stores/reacaoStore.ts). Os prontos ficam mais lentos ou mais rápidos conforme a categoria.
import type { CategoriaId } from '../../data/categorias'
import type { ConfigSinais } from './sinais'

/**
 * - auto: o celular fica no chão/apoiado a uns 2-3 passos e os sinais passam sozinhos
 * - toque: a criança toca a resposta certa na tela; o app mede o tempo de reação e os acertos
 * - memoria: a tela mostra uma sequência de cores e a criança repete (ExecutarMemoria)
 * - duelo: duas crianças, uma de cada lado do tablet; ganha quem toca primeiro (ExecutarDuelo)
 */
export type ModoDrill = 'auto' | 'toque' | 'memoria' | 'duelo'

/** Para quem é o drill (o filtro do topo da tela de Reação) */
export type PublicoDrill = 'goleiro' | 'linha' | 'todos'

export const PUBLICOS: { id: PublicoDrill; nome: string; emoji: string }[] = [
  { id: 'todos', nome: 'Todos', emoji: '👥' },
  { id: 'goleiro', nome: 'Goleiro', emoji: '🧤' },
  { id: 'linha', nome: 'Linha', emoji: '⚽' },
]

export interface Drill extends ConfigSinais {
  id: string
  nome: string
  emoji: string
  /** Frase curta do menu */
  descricao: string
  /** Como montar e o que fazer em cada sinal (lido por um adulto antes de começar) */
  instrucoes: string[]
  modo: ModoDrill
  /** Sem = todos */
  publico?: PublicoDrill
  series: number
  /** Sinais por série */
  repeticoes: number
  descansoS: number
  /** Tempo sem sinal entre um e outro: sorteado entre min e max (a criança não adivinha o ritmo) */
  esperaMinMs: number
  esperaMaxMs: number
  /** Quanto tempo o sinal fica na tela (no modo toque, é o tempo para responder) */
  exibicaoMs: number
  /** Falar o sinal em voz alta (bom quando o celular está longe) */
  voz: boolean
  /** Sinais que vêm quase seguidos (2 = rebote: defende, levanta e defende de novo). Sem = 1. */
  rajada?: number
}

const BASE = { cores: [], setas: [], setaVermelha: false, numeros: 0, voz: false } satisfies Partial<Drill>
const CORES_3 = ['vermelho', 'azul', 'amarelo'] as const satisfies ConfigSinais['cores']
const CORES_4 = ['vermelho', 'azul', 'verde', 'amarelo'] as const satisfies ConfigSinais['cores']

export const DRILLS_PRONTOS: Drill[] = [
  // ---------- Na tela ----------
  {
    ...BASE,
    id: 'teste-reacao',
    nome: 'Teste de reação',
    emoji: '⏱️',
    descricao: 'Toque na cor certa o mais rápido que puder',
    instrucoes: [
      'Segure o celular com as duas mãos.',
      'Quando a cor aparecer, toque no botão da mesma cor.',
      'Faça sempre do mesmo jeito para comparar com os outros dias no histórico.',
    ],
    modo: 'toque',
    publico: 'todos',
    cores: [...CORES_4],
    series: 1,
    repeticoes: 12,
    descansoS: 0,
    esperaMinMs: 1000,
    esperaMaxMs: 2500,
    exibicaoMs: 2500,
  },
  {
    ...BASE,
    id: 'seta-maluca-toque',
    nome: 'Seta maluca (na tela)',
    emoji: '🔀',
    descricao: 'Verde: igual. Vermelha: ao contrário!',
    instrucoes: [
      'Seta VERDE: toque no lado para onde ela aponta.',
      'Seta VERMELHA: toque no lado CONTRÁRIO.',
      'Treina a cabeça a decidir rápido, como no jogo.',
    ],
    modo: 'toque',
    publico: 'todos',
    setas: ['esquerda', 'direita'],
    setaVermelha: true,
    series: 1,
    repeticoes: 12,
    descansoS: 0,
    esperaMinMs: 900,
    esperaMaxMs: 2200,
    exibicaoMs: 2500,
  },
  {
    ...BASE,
    id: 'canto-gol-toque',
    nome: 'Canto do gol (na tela)',
    emoji: '🥅',
    descricao: 'A bola aparece num canto: toque nele!',
    instrucoes: [
      'A tela vira um gol dividido em 6 partes.',
      'A bola aparece numa parte: toque nela o mais rápido que puder.',
      'Olhe para o gol inteiro, não só para o meio: é assim que o goleiro enxerga o chute.',
    ],
    modo: 'toque',
    publico: 'goleiro',
    cantos: ['alto-esq', 'alto-meio', 'alto-dir', 'baixo-esq', 'baixo-meio', 'baixo-dir'],
    series: 1,
    repeticoes: 15,
    descansoS: 0,
    esperaMinMs: 800,
    esperaMaxMs: 2000,
    exibicaoMs: 1600,
  },
  {
    ...BASE,
    id: 'ouvido-rapido',
    nome: 'Ouvido rápido (na tela)',
    emoji: '👂',
    descricao: 'Ouviu o apito? Toque!',
    instrucoes: [
      'Deixe o som do celular ligado.',
      'A tela não muda: só o apito avisa.',
      'Ouviu o apito: toque no botão AGORA o mais rápido que puder. Tocou antes, não vale!',
    ],
    modo: 'toque',
    publico: 'todos',
    som: true,
    series: 1,
    repeticoes: 10,
    descansoS: 0,
    esperaMinMs: 1500,
    esperaMaxMs: 4500,
    exibicaoMs: 2000,
  },
  {
    ...BASE,
    id: 'so-no-verde',
    nome: 'Só no verde (na tela)',
    emoji: '🟢',
    descricao: 'Toque só quando for verde. As outras cores, segure!',
    instrucoes: [
      'Verde: toque no botão verde bem rápido.',
      'Qualquer outra cor: NÃO toque. Segurar também vale ponto!',
      'Treina a cabeça a não cair na finta.',
    ],
    modo: 'toque',
    publico: 'todos',
    cores: ['verde'],
    distratores: ['vermelho', 'azul', 'amarelo'],
    series: 1,
    repeticoes: 15,
    descansoS: 0,
    esperaMinMs: 700,
    esperaMaxMs: 1800,
    exibicaoMs: 1400,
  },
  {
    ...BASE,
    id: 'bate-toupeira',
    nome: 'Bate-toupeira',
    emoji: '🐹',
    descricao: 'A toupeira aparece em qualquer canto: pegue!',
    instrucoes: [
      'A tela vira uma grade de 9 buracos.',
      'A toupeira sai de um buraco: toque nela antes que se esconda.',
      'Olhe para a tela inteira de uma vez (visão de jogo).',
    ],
    modo: 'toque',
    publico: 'todos',
    toupeira: true,
    series: 1,
    repeticoes: 20,
    descansoS: 0,
    esperaMinMs: 400,
    esperaMaxMs: 1200,
    exibicaoMs: 1200,
  },
  {
    ...BASE,
    id: 'cor-da-tinta',
    nome: 'Cor da tinta',
    emoji: '🎨',
    descricao: 'Toque na cor da TINTA, não na palavra (a partir de 9 anos)',
    instrucoes: [
      'Aparece o nome de uma cor pintado com OUTRA cor. Ex.: "AZUL" escrito em vermelho.',
      'Toque na cor da TINTA (no exemplo, vermelho), não no que está escrito.',
      'É difícil mesmo! Treina a atenção e a decisão.',
    ],
    modo: 'toque',
    publico: 'todos',
    cores: [...CORES_4],
    palavras: true,
    series: 1,
    repeticoes: 12,
    descansoS: 0,
    esperaMinMs: 900,
    esperaMaxMs: 2000,
    exibicaoMs: 3000,
  },
  {
    ...BASE,
    id: 'memoria-cores',
    nome: 'Memória de cores',
    emoji: '🧠',
    descricao: 'Veja a sequência e repita. Ela cresce a cada acerto!',
    instrucoes: [
      'As cores piscam uma de cada vez. Preste atenção na ordem.',
      'Depois toque nas cores na mesma ordem.',
      'Acertou: a sequência cresce. Você tem 3 vidas.',
    ],
    modo: 'memoria',
    publico: 'todos',
    cores: [...CORES_4],
    series: 1,
    // Maior sequência possível (aí termina com vitória)
    repeticoes: 15,
    descansoS: 0,
    esperaMinMs: 250,
    esperaMaxMs: 250,
    // Quanto tempo cada cor pisca
    exibicaoMs: 700,
  },
  {
    ...BASE,
    id: 'duelo',
    nome: 'Duelo (2 jogadores)',
    emoji: '⚔️',
    descricao: 'Tablet na mesa, um de cada lado: quem toca primeiro?',
    instrucoes: [
      'Deite o tablet (ou celular) na mesa. Um jogador de cada lado, de frente um para o outro.',
      'Cada um tem os seus botões de cores perto de si.',
      'A cor aparece no meio: quem tocar primeiro na cor certa ganha o ponto. Tocou errado, o ponto é do outro!',
    ],
    modo: 'duelo',
    publico: 'todos',
    cores: [...CORES_3],
    series: 1,
    repeticoes: 11,
    descansoS: 0,
    esperaMinMs: 1500,
    esperaMaxMs: 3500,
    exibicaoMs: 3000,
  },

  // ---------- Com o corpo: goleiro ----------
  {
    ...BASE,
    id: 'defesa-pe-colorida',
    nome: 'Defesa com o pé colorida',
    emoji: '🦶',
    descricao: 'A cor manda qual cone o pé vai buscar',
    instrucoes: [
      'Coloque 3 cones (ou garrafas, chinelos) coloridos em volta, a 2 passos: vermelho, azul e amarelo.',
      'Fique na posição de goleiro no meio.',
      'Apareceu a cor: estique a perna e toque no cone daquela cor. Volte para o meio.',
      'Apoie o celular no chão ou numa cadeira, de frente para você.',
    ],
    modo: 'auto',
    publico: 'goleiro',
    cores: [...CORES_3],
    series: 3,
    repeticoes: 8,
    descansoS: 30,
    esperaMinMs: 2500,
    esperaMaxMs: 4000,
    exibicaoMs: 1500,
    voz: true,
  },
  {
    ...BASE,
    id: 'mergulho-seta',
    nome: 'Mergulho da seta',
    emoji: '🧤',
    descricao: 'Caia para o lado que a seta mandar',
    instrucoes: [
      'Só na grama ou num colchonete!',
      'Fique ajoelhado ou agachado, na posição de goleiro.',
      'Seta para a esquerda: caia de lado para a esquerda, mãos na frente. Seta para a direita: para a direita.',
      'Levante com calma e espere o próximo sinal.',
    ],
    modo: 'auto',
    publico: 'goleiro',
    setas: ['esquerda', 'direita'],
    series: 3,
    repeticoes: 6,
    descansoS: 40,
    esperaMinMs: 3500,
    esperaMaxMs: 5500,
    exibicaoMs: 1500,
    voz: true,
  },
  {
    ...BASE,
    id: 'canto-gol',
    nome: 'Canto do gol',
    emoji: '🥅',
    descricao: 'A bola acende num canto: defenda lá!',
    instrucoes: [
      'Fique na posição base, de frente para o celular (a esquerda da tela é a sua esquerda).',
      'Bola em CIMA: salte e espalme ou encaixe alto, com as mãos em W.',
      'Bola EMBAIXO: encaixe baixo no meio, ou defesa baixa / com o pé nos cantos.',
      'Quedas só na grama ou no colchonete. Volte para a base antes do próximo.',
    ],
    modo: 'auto',
    publico: 'goleiro',
    cantos: ['alto-esq', 'alto-meio', 'alto-dir', 'baixo-esq', 'baixo-meio', 'baixo-dir'],
    series: 3,
    repeticoes: 6,
    descansoS: 40,
    esperaMinMs: 3500,
    esperaMaxMs: 5500,
    exibicaoMs: 1500,
    voz: true,
  },
  {
    ...BASE,
    id: 'chute-ou-finta',
    nome: 'Chute ou finta?',
    emoji: '🙅',
    descricao: 'Bola no canto: defenda. Finta: fique firme!',
    instrucoes: [
      'Fique na posição base, de frente para o celular.',
      'Apareceu a BOLA num canto: faça a defesa daquele lado.',
      'Apareceu a FINTA: não se jogue! Fique firme na base, com os pés no chão.',
      'No 1 contra 1, quem cai antes perde: o goleiro paciente defende mais.',
    ],
    modo: 'auto',
    publico: 'goleiro',
    cantos: ['alto-esq', 'alto-dir', 'baixo-esq', 'baixo-dir'],
    fintas: true,
    series: 3,
    repeticoes: 8,
    descansoS: 30,
    esperaMinMs: 3000,
    esperaMaxMs: 5000,
    exibicaoMs: 1300,
  },
  {
    ...BASE,
    id: 'rebote',
    nome: 'Rebote',
    emoji: '🔁',
    descricao: 'Defende, levanta rápido e defende de novo!',
    instrucoes: [
      'Só na grama ou num colchonete!',
      'Os sinais vêm em DUPLA: a primeira seta e, logo depois, a segunda.',
      'Defenda para o lado da primeira seta, levante rápido e defenda para o lado da segunda (o rebote).',
      'Depois da dupla, volte para a base e respire.',
    ],
    modo: 'auto',
    publico: 'goleiro',
    setas: ['esquerda', 'direita'],
    rajada: 2,
    series: 3,
    repeticoes: 6,
    descansoS: 45,
    esperaMinMs: 4000,
    esperaMaxMs: 6000,
    exibicaoMs: 1000,
    voz: true,
  },
  {
    ...BASE,
    id: 'comando-goleiro',
    nome: 'Comando do goleiro',
    emoji: '🗣️',
    descricao: 'Cada cor é um grito: o goleiro manda no time!',
    instrucoes: [
      'VERDE: grite "MINHA!" e saia com os braços para cima, como quem pega a bola.',
      'VERMELHO: grite "FORA!" e faça o soco para afastar a bola.',
      'AMARELO: grite "SOBE!" e aponte para a frente, mandando o time subir.',
      'Grite alto e com confiança: o goleiro é a voz do time.',
    ],
    modo: 'auto',
    publico: 'goleiro',
    cores: ['verde', 'vermelho', 'amarelo'],
    series: 2,
    repeticoes: 8,
    descansoS: 30,
    esperaMinMs: 2500,
    esperaMaxMs: 4000,
    exibicaoMs: 1500,
  },
  {
    ...BASE,
    id: 'bola-numero',
    nome: 'Bola do número',
    emoji: '🔢',
    descricao: 'Vá até a bola do número e encaixe',
    instrucoes: [
      'Coloque 3 bolas (ou cones) a uns 3 passos, cada uma com um papel: 1, 2 e 3.',
      'Apareceu o número: corra, encaixe aquela bola no peito e volte.',
      'Um adulto pode devolver a bola para o lugar.',
    ],
    modo: 'auto',
    publico: 'goleiro',
    numeros: 3,
    series: 3,
    repeticoes: 6,
    descansoS: 40,
    esperaMinMs: 4000,
    esperaMaxMs: 6000,
    exibicaoMs: 2000,
    voz: true,
  },
  {
    ...BASE,
    id: 'sai-ou-fica',
    nome: 'Sai ou fica?',
    emoji: '✋',
    descricao: 'Verde sai do gol, vermelho fica e defende',
    instrucoes: [
      'Fique em cima da linha (ou entre 2 cones, como se fosse o gol).',
      'VERDE: dê 3 passos rápidos para a frente e pule com os braços para cima, como quem pega um cruzamento.',
      'VERMELHO: fique no gol e faça a defesa baixa (agache e ponha as mãos no chão na frente).',
      'Volte para a linha e espere o próximo.',
    ],
    modo: 'auto',
    publico: 'goleiro',
    cores: ['verde', 'vermelho'],
    series: 2,
    repeticoes: 8,
    descansoS: 40,
    esperaMinMs: 3000,
    esperaMaxMs: 5000,
    exibicaoMs: 1500,
    voz: true,
  },
  {
    ...BASE,
    id: 'pes-rapidos',
    nome: 'Pés rápidos',
    emoji: '👟',
    descricao: 'Um passo para onde a seta apontar',
    instrucoes: [
      'Fique na posição de goleiro, pernas um pouco abertas.',
      'Dê um passo rápido para o lado da seta (frente, trás, esquerda ou direita) e volte.',
      'Mãos sempre prontas na frente do corpo!',
    ],
    modo: 'auto',
    publico: 'goleiro',
    setas: ['esquerda', 'direita', 'frente', 'tras'],
    series: 3,
    repeticoes: 10,
    descansoS: 30,
    esperaMinMs: 1500,
    esperaMaxMs: 3000,
    exibicaoMs: 1200,
  },

  // ---------- Com o corpo: jogador de linha ----------
  {
    ...BASE,
    id: 'passe-cor',
    nome: 'Passe na cor',
    emoji: '🎯',
    descricao: 'Passe a bola no golzinho da cor',
    instrucoes: [
      'Monte 3 golzinhos de 2 cones (ou garrafas) a uns 6 passos, em leque: um vermelho, um azul e um amarelo.',
      'Fique no meio com a bola, de frente para o celular.',
      'Apareceu a cor: passe a bola (de primeira ou com 1 toque) pelo golzinho daquela cor.',
      'Busque a bola e volte para o meio. Com várias bolas fica mais rápido!',
    ],
    modo: 'auto',
    publico: 'linha',
    cores: [...CORES_3],
    series: 3,
    repeticoes: 6,
    descansoS: 30,
    esperaMinMs: 6000,
    esperaMaxMs: 9000,
    exibicaoMs: 1800,
    voz: true,
  },
  {
    ...BASE,
    id: 'chute-no-canto',
    nome: 'Chute no canto',
    emoji: '🥅',
    descricao: 'A tela mostra o canto: finalize lá!',
    instrucoes: [
      'Bola parada a uns 6 passos do gol (ou de uma parede com 4 alvos de fita).',
      'Apareceu a bola num canto: chute naquele canto. Embaixo = chute rasteiro.',
      'Olhe para o alvo, não para a bola, na hora de decidir.',
      'Busque a bola e arrume para o próximo. Com várias bolas fica mais rápido!',
    ],
    modo: 'auto',
    publico: 'linha',
    cantos: ['alto-esq', 'alto-dir', 'baixo-esq', 'baixo-dir'],
    series: 3,
    repeticoes: 5,
    descansoS: 30,
    esperaMinMs: 7000,
    esperaMaxMs: 10000,
    exibicaoMs: 2000,
    voz: true,
  },
  {
    ...BASE,
    id: 'drible-seta',
    nome: 'Drible da seta',
    emoji: '🔀',
    descricao: 'Conduzindo a bola, corte para o lado certo',
    instrucoes: [
      'Conduza a bola devagar de um lado para o outro, numa faixa de uns 4 passos, sempre de frente para o celular.',
      'Seta VERDE: corte a bola para o lado da seta e acelere 2 passos.',
      'Seta VERMELHA: corte para o lado CONTRÁRIO (é o drible: engana o marcador).',
      'Bola sempre perto do pé!',
    ],
    modo: 'auto',
    publico: 'linha',
    setas: ['esquerda', 'direita'],
    setaVermelha: true,
    series: 3,
    repeticoes: 8,
    descansoS: 30,
    esperaMinMs: 2500,
    esperaMaxMs: 4000,
    exibicaoMs: 1300,
    voz: true,
  },
  {
    ...BASE,
    id: 'arrancada',
    nome: 'Arrancada',
    emoji: '🏃',
    descricao: 'Saia como um foguete até o cone da cor',
    instrucoes: [
      'Coloque 3 cones coloridos (vermelho, azul, amarelo) a uns 5 passos, em leque.',
      'Fique parado no meio, com um pé um pouco na frente do outro.',
      'Apareceu a cor: arranque rápido até o cone, toque nele e volte trotando.',
      'O primeiro passo é o mais importante: curto e rápido!',
    ],
    modo: 'auto',
    publico: 'linha',
    cores: [...CORES_3],
    series: 3,
    repeticoes: 5,
    descansoS: 40,
    esperaMinMs: 5000,
    esperaMaxMs: 7000,
    exibicaoMs: 1500,
    voz: true,
  },
  {
    ...BASE,
    id: 'marcacao',
    nome: 'Marcação',
    emoji: '🛡️',
    descricao: 'Movimente-se como um zagueiro',
    instrucoes: [
      'Fique na posição de marcação: joelhos dobrados, um pé na frente, braços abertos.',
      'Seta para o LADO: 2 passos laterais, sem cruzar as pernas.',
      'Seta para a FRENTE: avance 2 passos rápidos (pressione o atacante).',
      'Seta para TRÁS: recue 2 passos de costas, sem virar.',
    ],
    modo: 'auto',
    publico: 'linha',
    setas: ['esquerda', 'direita', 'frente', 'tras'],
    series: 3,
    repeticoes: 8,
    descansoS: 30,
    esperaMinMs: 2000,
    esperaMaxMs: 3500,
    exibicaoMs: 1200,
  },
  {
    ...BASE,
    id: 'olha-antes',
    nome: 'Olhe antes de receber',
    emoji: '👀',
    descricao: 'Espie por cima do ombro e gire para o lado certo',
    instrucoes: [
      'Celular apoiado ATRÁS de você, a uns 3 passos. Um adulto fica na sua frente com a bola.',
      'Olhe por cima do ombro várias vezes: a seta aparece rapidinho, de surpresa.',
      'Viu a seta: peça a bola. Receba e já gire com ela para o lado que a seta mostrou.',
      'Craque olha ANTES de a bola chegar!',
    ],
    modo: 'auto',
    publico: 'linha',
    setas: ['esquerda', 'direita'],
    series: 3,
    repeticoes: 6,
    descansoS: 30,
    esperaMinMs: 4000,
    esperaMaxMs: 6500,
    exibicaoMs: 900,
  },

  // ---------- Com o corpo: todos ----------
  {
    ...BASE,
    id: 'seta-maluca',
    nome: 'Seta maluca (no corpo)',
    emoji: '🚦',
    descricao: 'Verde vai, vermelha vai ao contrário',
    instrucoes: [
      'Marque 2 cones, um de cada lado, a 3 passos.',
      'Seta VERDE: deslize de lado (passo lateral) até o cone para onde ela aponta.',
      'Seta VERMELHA: deslize para o cone do lado CONTRÁRIO.',
      'Volte para o meio sempre de frente para o celular.',
    ],
    modo: 'auto',
    publico: 'todos',
    setas: ['esquerda', 'direita'],
    setaVermelha: true,
    series: 3,
    repeticoes: 8,
    descansoS: 30,
    esperaMinMs: 2500,
    esperaMaxMs: 4000,
    exibicaoMs: 1500,
    voz: true,
  },
  {
    ...BASE,
    id: 'apito',
    nome: 'Apito',
    emoji: '📣',
    descricao: 'Deitado, ouviu o apito: levanta e arranca!',
    instrucoes: [
      'Deixe o som do celular ligado e alto.',
      'Coloque um cone a uns 5 passos. Deite de barriga para baixo (ou sente) virado para ele.',
      'A tela não avisa: só o APITO. Ouviu, levante rápido e corra até o cone.',
      'Volte trotando e deite de novo.',
    ],
    modo: 'auto',
    publico: 'todos',
    som: true,
    series: 3,
    repeticoes: 5,
    descansoS: 40,
    esperaMinMs: 3000,
    esperaMaxMs: 8000,
    exibicaoMs: 1000,
  },
  {
    ...BASE,
    id: 'estatua',
    nome: 'Estátua',
    emoji: '🗿',
    descricao: 'Verde: mexe! Vermelho: estátua!',
    instrucoes: [
      'VERDE: corra no lugar, levantando os joelhos, até a próxima cor.',
      'VERMELHO: vire estátua na hora e fique parado até a próxima cor.',
      'Se mexeu na estátua, faça 3 polichinelos de castigo (de brincadeira!).',
    ],
    modo: 'auto',
    publico: 'todos',
    cores: ['verde', 'vermelho'],
    series: 2,
    repeticoes: 10,
    descansoS: 30,
    esperaMinMs: 2000,
    esperaMaxMs: 4500,
    exibicaoMs: 1200,
    voz: true,
  },
]

export function drillPorId(id: string | undefined, criados: Drill[]): Drill | undefined {
  return DRILLS_PRONTOS.find((d) => d.id === id) ?? criados.find((d) => d.id === id)
}

export const ehDrillPronto = (id: string) => DRILLS_PRONTOS.some((d) => d.id === id)

/** Drills que dá para criar/copiar no editor (memória e duelo têm regras próprias) */
export const ehEditavel = (d: Drill) => d.modo === 'auto' || d.modo === 'toque'

/** Bloco da tela de Reação: com o corpo (celular no chão) ou na tela */
export const ehDoCorpo = (d: Drill) => d.modo === 'auto'

/** O drill aparece no filtro? ("todos" mostra tudo; goleiro/linha mostram os dele e os de todos) */
export const combinaComPublico = (d: Drill, filtro: PublicoDrill) => filtro === 'todos' || (d.publico ?? 'todos') === 'todos' || d.publico === filtro

export function novoDrill(): Drill {
  return {
    ...BASE,
    cores: ['vermelho', 'azul'],
    id: `drill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    nome: '',
    emoji: '⚡',
    descricao: '',
    instrucoes: [],
    modo: 'auto',
    publico: 'todos',
    series: 3,
    repeticoes: 8,
    descansoS: 30,
    esperaMinMs: 2500,
    esperaMaxMs: 4000,
    exibicaoMs: 1500,
    voz: true,
  }
}

/**
 * Ritmo pela categoria (só nos drills prontos; os criados usam os tempos que o adulto escolheu):
 * Baby tem mais tempo para ver e reagir, Lenda menos. A espera muda pela metade (ainda precisa de
 * tempo para voltar à posição).
 */
const FATOR_RITMO: Record<CategoriaId, number> = { baby: 1.5, novato: 1.3, iniciante: 1.15, 'sabor-pro': 1, profissional: 0.85, lenda: 0.75 }

export function drillNoRitmo(d: Drill, categoria: CategoriaId): Drill {
  if (!ehDrillPronto(d.id)) return d
  const f = FATOR_RITMO[categoria]
  const fEspera = 1 + (f - 1) / 2
  return {
    ...d,
    exibicaoMs: Math.round(d.exibicaoMs * f),
    esperaMinMs: Math.round(d.esperaMinMs * fEspera),
    esperaMaxMs: Math.round(d.esperaMaxMs * fEspera),
  }
}

/** Duração aproximada do drill inteiro, em minutos (para o menu) */
export function minutosDoDrill(d: Drill): number {
  if (d.modo === 'memoria') return 3
  const porSinal = (d.esperaMinMs + d.esperaMaxMs) / 2 + d.exibicaoMs
  const total = d.series * d.repeticoes * porSinal + Math.max(0, d.series - 1) * d.descansoS * 1000
  return Math.max(1, Math.round(total / 60_000))
}

/** Resumo dos sinais, ex.: "3 cores · 2 setas (verde/vermelha)" */
export function resumoSinais(d: ConfigSinais): string {
  const partes: string[] = []
  if (d.palavras) partes.push(`palavras em ${d.cores.length} cores`)
  else if (d.cores.length) partes.push(`${d.cores.length} ${d.cores.length === 1 ? 'cor' : 'cores'}`)
  if (d.setas.length) partes.push(`${d.setas.length} setas${d.setaVermelha ? ' (verde/vermelha)' : ''}`)
  if (d.numeros) partes.push(`números 1-${d.numeros}`)
  if (d.cantos?.length) partes.push(`${d.cantos.length} cantos do gol`)
  if (d.som) partes.push('apito')
  if (d.toupeira) partes.push('toupeira')
  if (d.fintas) partes.push('finta')
  if (d.distratores?.length) partes.push(`${d.distratores.length} cores para segurar`)
  return partes.join(' · ')
}
