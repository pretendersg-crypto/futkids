// Tipos e acesso aos dados de exercícios e vídeos (os dados ficam nos .json desta pasta,
// para poderem ser editados sem mexer em código).
import exerciciosJson from './exercicios.json'
import videosJson from './videos.json'

export type TipoExercicio = 'tempo' | 'repeticoes'

/** Animações do bonequinho demonstrador (definidas em features/aquecimento/boneco.css) */
export type AnimacaoBoneco = 'corrida' | 'polichinelo' | 'agachamento' | 'alongamento-lateral' | 'moinho'

export interface Exercicio {
  id: string
  /** Módulo dono do exercício (ex.: "aquecimento") */
  modulo: string
  nome: string
  emoji: string
  tipo: TipoExercicio
  /** Segundos (tipo "tempo") ou número de repetições (tipo "repeticoes") */
  meta: number
  /** Duração de um ciclo do movimento: ritmo do bonequinho e, nas repetições, tempo de cada uma */
  ritmoMs: number
  animacao: AnimacaoBoneco
  /** XP ganho ao completar o exercício */
  xp: number
  videoId: string
  /** 2 ou 3 instruções bem curtas */
  passos: string[]
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
  const base = import.meta.env.VITE_VIDEOS_BASE_URL || '/videos/'
  return base.replace(/\/?$/, '/') + caminho.replace(/^\//, '')
}
