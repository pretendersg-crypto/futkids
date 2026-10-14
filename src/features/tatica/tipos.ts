// Futsal Tático: puzzles de "qual a melhor jogada?", como os puzzles de xadrez, numa quadra
// vista de cima. Coordenadas de 0 a 1: x = 0 é o gol da ESQUERDA (o seu gol), x = 1 é o gol da
// DIREITA (o gol adversário); y = 0 é a linha lateral de cima, y = 1 a de baixo.
// O seu time é sempre o AZUL (time 'A') e ataca para a direita.

export type Time = 'A' | 'B'
export type TipoAcao = 'passe' | 'movimentacao' | 'finalizacao' | 'drible' | 'marcacao' | 'desarme'
export type Dificuldade = 'facil' | 'intermediario' | 'avancado'
export type CategoriaTatica = 'ataque' | 'defesa' | 'transicao' | 'bola-parada' | 'sistemas'

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

/**
 * Uma pergunta do puzzle. Puzzles de sequência têm vários passos (passe → corrida → chute).
 * Três tipos:
 *  - jogada (o de sempre): escolher a melhor jogada entre as opções (setas);
 *  - posicao: tocar no LUGAR certo da quadra para um jogador (ex.: onde o fixo faz a cobertura);
 *  - erro: tocar no jogador que está mal posicionado.
 */
export type Passo = PassoJogada | PassoPosicao | PassoErro

interface PassoBase {
  pergunta: string
  /** Outros jogadores que se mexem depois da resposta certa (a bola e quem agiu mexem sozinhos) */
  depois?: Movimento[]
}

export interface PassoJogada extends PassoBase {
  tipo?: 'jogada'
  opcoes: Opcao[]
}

export interface PassoPosicao extends PassoBase {
  tipo: 'posicao'
  /** Quem vai para o lugar (do time azul) */
  jogador: string
  /** O lugar certo */
  certo: Ponto
  /** Quão perto do lugar certo vale (0 a 1; padrão RAIO_POSICAO) */
  raio?: number
  /** Por que ali */
  explicacao: string
  /** O que dizer quando toca longe (sem = uma frase padrão) */
  explicacaoErro?: string
}

export interface PassoErro extends PassoBase {
  tipo: 'erro'
  /** O jogador mal posicionado (do time azul) */
  errado: string
  /** Onde ele deveria estar (ele vai para lá depois da resposta) */
  corrigir?: Ponto
  /** O que está errado e como corrigir */
  explicacao: string
}

/** Quão perto do lugar certo vale, no "onde se posicionar" (≈ 3 m numa quadra de 40 m) */
export const RAIO_POSICAO = 0.08

export const tipoDoPasso = (p: Passo): 'jogada' | 'posicao' | 'erro' => p.tipo ?? 'jogada'
export const ehJogada = (p: Passo): p is PassoJogada => tipoDoPasso(p) === 'jogada'

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
  /** Recado de quem criou (treinador ou pais), mostrado no fim */
  comentario?: string
  /** Quem criou (só nos criados no app), ex.: "Treinador Luiz" */
  autor?: string
  /** De onde veio, preenchido na hora de mostrar (ex.: "⚽ Sub-9", "🏠 Família") */
  origem?: string
}

/** Rating de um puzzle criado no app, pela dificuldade */
export const RATING_POR_DIFICULDADE: Record<Dificuldade, number> = { facil: 850, intermediario: 1100, avancado: 1350 }

export const NOMES_DIFICULDADE: Record<Dificuldade, string> = { facil: 'Fácil', intermediario: 'Médio', avancado: 'Difícil' }
export const EMOJI_DIFICULDADE: Record<Dificuldade, string> = { facil: '🟢', intermediario: '🟡', avancado: '🔴' }
export const NOMES_CATEGORIA: Record<CategoriaTatica, string> = {
  ataque: 'Ataque',
  defesa: 'Defesa',
  transicao: 'Transição',
  'bola-parada': 'Bola parada',
  sistemas: 'Sistemas de jogo',
}
export const EMOJI_CATEGORIA: Record<CategoriaTatica, string> = { ataque: '⚔️', defesa: '🛡️', transicao: '🔁', 'bola-parada': '🚩', sistemas: '📐' }
export const CATEGORIAS_TATICA: CategoriaTatica[] = ['ataque', 'defesa', 'transicao', 'bola-parada', 'sistemas']
export const DIFICULDADES_TATICA: Dificuldade[] = ['facil', 'intermediario', 'avancado']
export const EMOJI_ACAO: Record<TipoAcao, string> = {
  passe: '👟',
  movimentacao: '🏃',
  finalizacao: '🥅',
  drible: '🌀',
  marcacao: '🧱',
  desarme: '🦶',
}

export const NOMES_ACAO: Record<TipoAcao, string> = {
  passe: 'Passe',
  movimentacao: 'Movimentação',
  finalizacao: 'Chute',
  drible: 'Drible',
  marcacao: 'Marcação',
  desarme: 'Desarme',
}

// ---------- Prancheta tática (lance explicado pelo treinador) ----------

export type TipoSeta = 'passe' | 'corrida' | 'conducao' | 'chute'

export const NOMES_SETA: Record<TipoSeta, string> = { passe: '👟 Passe', corrida: '🏃 Corrida', conducao: '⚽ Condução', chute: '🥅 Chute' }

/** Seta desenhada na prancheta */
export interface SetaPrancheta {
  de: Ponto
  para: Ponto
  tipo: TipoSeta
}

/** Um momento do lance: onde cada um está, com quem está a bola, as setas e o texto */
export interface QuadroPrancheta {
  texto: string
  /** Id do jogador → posição neste quadro (quem não está aqui fica onde estava) */
  posicoes: Record<string, Ponto>
  /** Quem está com a bola (null = sem bola) */
  bola: string | null
  setas: SetaPrancheta[]
}

/** Lance explicado passo a passo na quadra (sem resposta certa: é para ver e entender) */
export interface Prancheta {
  id: string
  titulo: string
  /** Frase de abertura */
  descricao: string
  categoria: CategoriaTatica
  jogadores: Jogador[]
  quadros: QuadroPrancheta[]
  comentario?: string
  autor?: string
  origem?: string
}
