// Níveis do Pai/Mãe Treinador: o XP vem de planejar, estudar e acompanhar a criança.
// Cada nível tem um título (no masculino ou feminino) e libera um item do avatar (opcoesTreinador.ts).
import type { Genero } from './opcoesTreinador'

export interface NivelTreinador {
  nivel: number
  /** XP total para chegar neste nível */
  xp: number
  titulo: Record<Genero, string>
  emoji: string
}

export const NIVEIS_TREINADOR: NivelTreinador[] = [
  { nivel: 1, xp: 0, titulo: { pai: 'Treinador Estreante', mae: 'Treinadora Estreante' }, emoji: '🌱' },
  { nivel: 2, xp: 100, titulo: { pai: 'Auxiliar Técnico', mae: 'Auxiliar Técnica' }, emoji: '📋' },
  { nivel: 3, xp: 250, titulo: { pai: 'Treinador de Base', mae: 'Treinadora de Base' }, emoji: '⚽' },
  { nivel: 4, xp: 500, titulo: { pai: 'Treinador de Goleiros', mae: 'Treinadora de Goleiros' }, emoji: '🧤' },
  { nivel: 5, xp: 900, titulo: { pai: 'Preparador Pro', mae: 'Preparadora Pro' }, emoji: '🔥' },
  { nivel: 6, xp: 1400, titulo: { pai: 'Professor', mae: 'Professora' }, emoji: '🎓' },
  { nivel: 7, xp: 2000, titulo: { pai: 'Mestre dos Goleiros', mae: 'Mestra dos Goleiros' }, emoji: '👑' },
]

export interface InfoNivelTreinador {
  atual: NivelTreinador
  proximo?: NivelTreinador
  /** XP dentro do nível atual e quanto falta para o próximo */
  xpNoNivel: number
  xpDoNivel: number
}

export function nivelTreinador(xp: number): InfoNivelTreinador {
  const atual = [...NIVEIS_TREINADOR].reverse().find((n) => xp >= n.xp) ?? NIVEIS_TREINADOR[0]
  const proximo = NIVEIS_TREINADOR.find((n) => n.nivel === atual.nivel + 1)
  return { atual, proximo, xpNoNivel: xp - atual.xp, xpDoNivel: proximo ? proximo.xp - atual.xp : 1 }
}
