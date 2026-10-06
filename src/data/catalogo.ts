// Tipos e acesso aos dados de exercícios, vídeos e conquistas (os dados ficam nos .json
// desta pasta, para poderem ser editados sem mexer em código).
import conquistasJson from './conquistas.json'
import exerciciosJson from './exercicios.json'
import videosJson from './videos.json'

/** tempo: dura `meta` segundos · repeticoes: `meta` vezes no ritmo · intervalos: `meta` rodadas de rápido + devagar */
export type TipoExercicio = 'tempo' | 'repeticoes' | 'intervalos'

/** Animações do bonequinho demonstrador (definidas em features/treino/boneco.css) */
export type AnimacaoBoneco =
  | 'corrida'
  | 'polichinelo'
  | 'agachamento'
  | 'alongamento-lateral'
  | 'moinho'
  | 'encaixe'
  | 'saida-gol'
  | 'reposicao'
  | 'pontinha'
  | 'equilibrio'
  | 'cruz'
  | 'prancha'
  | 'braco-cruzado'
  | 'quadriceps'

export interface Exercicio {
  id: string
  /** Módulo dono do exercício (ex.: "aquecimento") */
  modulo: string
  nome: string
  emoji: string
  tipo: TipoExercicio
  /** Segundos (tipo "tempo"), número de repetições ("repeticoes") ou de rodadas ("intervalos") */
  meta: number
  /** Só no tipo "intervalos": segundos de cada parte da rodada (ex.: 15 rápido + 15 devagar) */
  intervalo?: { forteS: number; fracoS: number }
  /** Duração de um ciclo do movimento: ritmo do bonequinho e, nas repetições, tempo de cada uma */
  ritmoMs: number
  animacao: AnimacaoBoneco
  /** XP ganho ao completar o exercício */
  xp: number
  videoId: string
  /** 2 ou 3 instruções bem curtas */
  passos: string[]
  /** GIF/imagem próprio enviado pelos pais (id no IndexedDB); no lugar do bonequinho */
  gif?: string
}

export interface Video {
  id: string
  titulo: string
  /** Duração em segundos (0 = desconhecida) */
  duracao: number
  /** Vazio = ainda não há vídeo; o app mostra a animação do bonequinho no lugar */
  urlVideo: string
  thumbnailUrl: string
}

export const EXERCICIOS = exerciciosJson as Exercicio[]
export const VIDEOS = videosJson as Video[]

export function exerciciosDoModulo(modulo: string): Exercicio[] {
  return EXERCICIOS.filter((e) => e.modulo === modulo)
}

export function videoPorId(id: string): Video | undefined {
  return VIDEOS.find((v) => v.id === id)
}

/**
 * Endereço final de um arquivo de vídeo/miniatura. Caminhos relativos usam a base
 * VITE_VIDEOS_BASE_URL (ex.: um CDN); sem ela, a pasta public/videos/ do próprio app.
 */
export function urlDeMidia(caminho: string): string {
  if (!caminho || /^https?:\/\//.test(caminho)) return caminho
  const base = import.meta.env.VITE_VIDEOS_BASE_URL || `${import.meta.env.BASE_URL}videos/`
  return base.replace(/\/?$/, '/') + caminho.replace(/^\//, '')
}

// ---------- Conquistas ----------

/** Endereço de uma imagem de figurinha: caminho relativo = pasta public/stickers/ do app */
export function urlDeSticker(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${import.meta.env.BASE_URL}stickers/${url.replace(/^\//, '')}`
}


/** Regra para desbloquear uma conquista (avaliada em features/conquistas/criterios.ts) */
export type Criterio =
  /** Contador de atividades do progresso (ex.: chave "goleiro" = treinos de goleiro concluídos) */
  | { tipo: 'contador'; chave: string; minimo: number }
  | { tipo: 'nivel'; minimo: number }
  /** Maior sequência de dias seguidos treinando */
  | { tipo: 'sequencia'; minimo: number }
  /** Total de dias diferentes com treino */
  | { tipo: 'diasTreinados'; minimo: number }

export type AnimacaoSticker = 'balanca' | 'pulsa' | 'gira' | 'brilha'

/** Visual da figurinha. "padrao" é desenhado pelo app; os outros recebem arquivos do designer. */
export type Sticker =
  | { tipo: 'padrao'; emoji: string; cores: [string, string]; animacao: AnimacaoSticker }
  /** Imagem (PNG/SVG/WebP animado) em public/stickers/ ou URL completa */
  | { tipo: 'imagem'; url: string; emojiReserva?: string }
  /** Animação Lottie (JSON). Ver README: a biblioteca só entra quando o primeiro arquivo chegar */
  | { tipo: 'lottie'; url: string; emojiReserva?: string }

export interface Conquista {
  id: string
  /** Posição no álbum (Nº 01, Nº 02...) */
  numero: number
  nome: string
  descricao: string
  criterio: Criterio
  sticker: Sticker
}

// [...].sort em vez de toSorted: toSorted não existe em celulares mais antigos
export const CONQUISTAS = [...(conquistasJson as Conquista[])].sort((a, b) => a.numero - b.numero)

export function conquistaPorId(id: string): Conquista | undefined {
  return CONQUISTAS.find((c) => c.id === id)
}
