// Drills de reação: os prontos (adaptados dos drills de goleiro do SwitchedOn para crianças de
// 6 a 12 anos: menos repetições, mais descanso, quedas só em grama/colchonete) e o formato
// dos drills criados pelos pais/treinador (guardados em stores/reacaoStore.ts).
import type { ConfigSinais } from './sinais'

/**
 * - auto: o celular fica no chão/apoiado a uns 2-3 passos e os sinais passam sozinhos
 * - toque: a criança toca a resposta certa na tela; o app mede o tempo de reação e os acertos
 */
export type ModoDrill = 'auto' | 'toque'

export interface Drill extends ConfigSinais {
  id: string
  nome: string
  emoji: string
  /** Frase curta do menu */
  descricao: string
  /** Como montar e o que fazer em cada sinal (lido por um adulto antes de começar) */
  instrucoes: string[]
  modo: ModoDrill
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
}

const BASE = { cores: [], setas: [], setaVermelha: false, numeros: 0, voz: false } satisfies Partial<Drill>

export const DRILLS_PRONTOS: Drill[] = [
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
    cores: ['vermelho', 'azul', 'verde', 'amarelo'],
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
      'Treina a cabeça a decidir rápido, como no gol.',
    ],
    modo: 'toque',
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
    cores: ['vermelho', 'azul', 'amarelo'],
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
    setas: ['esquerda', 'direita', 'frente', 'tras'],
    series: 3,
    repeticoes: 10,
    descansoS: 30,
    esperaMinMs: 1500,
    esperaMaxMs: 3000,
    exibicaoMs: 1200,
    voz: false,
  },
]

export function drillPorId(id: string | undefined, criados: Drill[]): Drill | undefined {
  return DRILLS_PRONTOS.find((d) => d.id === id) ?? criados.find((d) => d.id === id)
}

export const ehDrillPronto = (id: string) => DRILLS_PRONTOS.some((d) => d.id === id)

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
    series: 3,
    repeticoes: 8,
    descansoS: 30,
    esperaMinMs: 2500,
    esperaMaxMs: 4000,
    exibicaoMs: 1500,
    voz: true,
  }
}

/** Duração aproximada do drill inteiro, em minutos (para o menu) */
export function minutosDoDrill(d: Drill): number {
  const porSinal = (d.esperaMinMs + d.esperaMaxMs) / 2 + d.exibicaoMs
  const total = d.series * d.repeticoes * porSinal + Math.max(0, d.series - 1) * d.descansoS * 1000
  return Math.max(1, Math.round(total / 60_000))
}

/** Resumo dos sinais, ex.: "3 cores · 2 setas (verde/vermelha)" */
export function resumoSinais(d: ConfigSinais): string {
  const partes: string[] = []
  if (d.cores.length) partes.push(`${d.cores.length} cores`)
  if (d.setas.length) partes.push(`${d.setas.length} setas${d.setaVermelha ? ' (verde/vermelha)' : ''}`)
  if (d.numeros) partes.push(`números 1-${d.numeros}`)
  return partes.join(' · ')
}
