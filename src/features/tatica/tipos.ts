// Futsal Tático: puzzles de "qual a melhor jogada?", como os puzzles de xadrez, numa quadra
// vista de cima. Coordenadas de 0 a 1: x = 0 é o gol da ESQUERDA (o seu gol), x = 1 é o gol da
// DIREITA (o gol adversário); y = 0 é a linha lateral de cima, y = 1 a de baixo.
// O seu time é sempre o AZUL (time 'A') e ataca para a direita.

export type Time = 'A' | 'B'
export type TipoAcao = 'passe' | 'movimentacao' | 'finalizacao' | 'drible' | 'marcacao' | 'desarme'
export type Dificuldade = 'facil' | 'intermediario' | 'avancado'
export type CategoriaTatica = 'ataque' | 'defesa' | 'transicao' | 'bola-parada'

export interface Ponto {
  x: number
  y: number
}

export interface Jogador {
  id: string
  time: Time
  numero: number
  pos: Ponto
  goleiro?: boolean
}

/** Para onde vai a ação: um jogador (passe, marcação), um lugar da quadra ou o gol adversário */
export type Alvo = { tipo: 'jogador'; id: string } | { tipo: 'ponto'; pos: Ponto } | { tipo: 'gol' }

/** Um jogador que muda de lugar depois da jogada certa (ex.: o defensor que vem na bola) */
export interface Movimento {
  jogador: string
  para: Ponto
}

export interface Opcao {
  id: string
  /** Quem faz a ação (sempre do time azul) */
  jogador: string
  acao: TipoAcao
  alvo: Alvo
  /** Texto do botão, curto e para criança (ex.: "Passe para o 9") */
  rotulo: string
  correta: boolean
  /** Por que é boa (ou por que não é) */
  explicacao: string
  /** O que aconteceria no jogo (ex.: "O 4 corta o passe e sai no contra-ataque") */
  consequencia?: string
}

/** Uma jogada do puzzle. Puzzles de sequência têm vários passos (passe → corrida → chute). */
export interface Passo {
  pergunta: string
  opcoes: Opcao[]
  /** Outros jogadores que se mexem depois da jogada certa (a bola e quem agiu mexem sozinhos) */
  depois?: Movimento[]
}

export interface Puzzle {
  id: string
  titulo: string
  dificuldade: Dificuldade
  categoria: CategoriaTatica
  /** A situação do jogo, ex.: "Placar 2 a 2, faltam 30 segundos" */
  contexto: string
  jogadores: Jogador[]
  /** Quem começa com a bola */
  bola: string
  passos: Passo[]
  dica?: string
  /** O conceito ensinado, mostrado no fim (2-4 frases) */
  conceito: string
  /** "Força" do puzzle (Elo), ex.: 800 fácil ... 1400 difícil */
  rating: number
}

export const NOMES_DIFICULDADE: Record<Dificuldade, string> = { facil: 'Fácil', intermediario: 'Médio', avancado: 'Difícil' }
export const EMOJI_DIFICULDADE: Record<Dificuldade, string> = { facil: '🟢', intermediario: '🟡', avancado: '🔴' }
export const NOMES_CATEGORIA: Record<CategoriaTatica, string> = {
  ataque: 'Ataque',
  defesa: 'Defesa',
  transicao: 'Transição',
  'bola-parada': 'Bola parada',
}
export const EMOJI_CATEGORIA: Record<CategoriaTatica, string> = { ataque: '⚔️', defesa: '🛡️', transicao: '🔁', 'bola-parada': '🚩' }
export const EMOJI_ACAO: Record<TipoAcao, string> = {
  passe: '👟',
  movimentacao: '🏃',
  finalizacao: '🥅',
  drible: '🌀',
  marcacao: '🧱',
  desarme: '🦶',
}
