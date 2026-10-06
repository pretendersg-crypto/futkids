// Configuração dos minijogos de goleiro e dos 3 níveis de dificuldade.
// Os níveis do goleiro são liberados pelo nível do jogador (XP), como pede a gamificação.

export type NivelGoleiroId = 'iniciante' | 'intermediario' | 'avancado'
export type JogoGoleiroId = 'defesa' | 'reflexo' | 'posicionamento'

export interface NivelGoleiro {
  id: NivelGoleiroId
  nome: string
  emoji: string
  /** Nível do jogador (XP) necessário para liberar */
  nivelJogadorMinimo: number
  xpPorDefesa: number
  /** Defesa: tempo que a bola leva até o gol e "alcance" da luva (fração da largura do gol) */
  defesa: { duracaoChuteMs: number; raioLuva: number }
  /** Reflexo: quanto tempo a bola fica esperando o toque e tamanho dela (fração da largura do gol) */
  reflexo: { tempoBolaMs: number; tamanhoBola: number }
  /** Posição: quantas opções de lugar no gol */
  posicionamento: { opcoes: number }
}

export const NIVEIS: NivelGoleiro[] = [
  {
    id: 'iniciante',
    nome: 'Iniciante',
    emoji: '🟢',
    nivelJogadorMinimo: 1,
    xpPorDefesa: 2,
    defesa: { duracaoChuteMs: 2200, raioLuva: 0.15 },
    reflexo: { tempoBolaMs: 1700, tamanhoBola: 0.22 },
    posicionamento: { opcoes: 3 },
  },
  {
    id: 'intermediario',
    nome: 'Intermediário',
    emoji: '🟡',
    nivelJogadorMinimo: 3,
    xpPorDefesa: 3,
    defesa: { duracaoChuteMs: 1600, raioLuva: 0.12 },
    reflexo: { tempoBolaMs: 1200, tamanhoBola: 0.18 },
    posicionamento: { opcoes: 4 },
  },
  {
    id: 'avancado',
    nome: 'Avançado',
    emoji: '🔴',
    nivelJogadorMinimo: 5,
    xpPorDefesa: 4,
    defesa: { duracaoChuteMs: 1150, raioLuva: 0.1 },
    reflexo: { tempoBolaMs: 850, tamanhoBola: 0.15 },
    posicionamento: { opcoes: 5 },
  },
]

export interface JogoGoleiro {
  id: JogoGoleiroId
  nome: string
  emoji: string
  descricao: string
  /** Instruções curtas da tela de início */
  comoJogar: string[]
}

export const JOGOS: JogoGoleiro[] = [
  {
    id: 'defesa',
    nome: 'Defesa',
    emoji: '🧤',
    descricao: 'Arraste a luva até a bola',
    comoJogar: ['Olhe para onde a bola vai', 'Arraste a luva 🧤 com o dedo até lá', 'Chegue antes da bola!'],
  },
  {
    id: 'reflexo',
    nome: 'Reflexo',
    emoji: '⚡',
    descricao: 'Toque rápido na bola',
    comoJogar: ['A bola aparece em qualquer canto do gol', 'Toque nela bem rápido', 'Quanto mais rápido, melhor!'],
  },
  {
    id: 'posicionamento',
    nome: 'Posição',
    emoji: '📐',
    descricao: 'Escolha o lugar certo no gol',
    comoJogar: ['Veja onde está a bola', 'Toque no lugar onde o goleiro deve ficar', 'Dica: fique no meio do caminho entre a bola e as traves'],
  },
]

/** Chutes (ou bolas) por partida */
export const RODADAS = 10

export function nivelPorId(id: string | undefined): NivelGoleiro | undefined {
  return NIVEIS.find((n) => n.id === id)
}

export function jogoPorId(id: string | undefined): JogoGoleiro | undefined {
  return JOGOS.find((j) => j.id === id)
}

export function nivelLiberado(nivel: NivelGoleiro, nivelJogador: number): boolean {
  return nivelJogador >= nivel.nivelJogadorMinimo
}

export function chaveRecorde(jogo: JogoGoleiroId, nivel: NivelGoleiroId): string {
  return `goleiro:${jogo}:${nivel}`
}
