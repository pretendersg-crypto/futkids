// De onde vêm os circuitos com cones:
//  - os que vêm no app (circuitos.ts);
//  - os criados pelos pais (stores/circuitosStore, valem para a família);
//  - os do treinador para a turma do atleta ativo (chegam pela sincronia em turmasStore, tipo "circuito").
// O vídeo de exemplo que a família pôs num circuito vale mais que o do próprio circuito.
// O que vem da nuvem é conferido antes de aparecer (circuito quebrado fica de fora).
import { useMemo } from 'react'
import { useContaStore } from '../../conta/contaStore'
import { useTurmasStore, type TaticaGuardada } from '../../conta/turmasStore'
import { useCircuitosStore } from '../../stores/circuitosStore'
import { CIRCUITOS, conferirCircuito, type Circuito } from './circuitos'
import { GESTOS_PRONTOS } from './gestos'
import { useGestos } from './useGestos'

export const ORIGEM_FAMILIA_CIRCUITO = '🏠 Família'

const SEM_TATICAS: TaticaGuardada[] = []
const NIVEIS = ['facil', 'medio', 'dificil']

function valido(c: Circuito, gestos: string[]): boolean {
  try {
    return NIVEIS.includes(c.nivel) && Array.isArray(c.cones) && Array.isArray(c.passos) && conferirCircuito(c, gestos).length === 0
  } catch {
    return false
  }
}

export function juntarCircuitos(familia: Circuito[], videos: Record<string, string>, turma: TaticaGuardada[], gestos: string[]): Circuito[] {
  // O treinador só usa os gestos do app (os da família dele não existem nos aparelhos dos atletas)
  const prontos = GESTOS_PRONTOS.map((g) => g.id)
  const daTurma = turma.flatMap((t) => {
    if (t.tipo !== 'circuito') return []
    try {
      const c = { ...(JSON.parse(t.json) as Circuito), id: t.id, origem: `⚽ ${t.turmaNome}` }
      return valido(c, prontos) ? [c] : []
    } catch {
      return []
    }
  })
  const todos = [...CIRCUITOS, ...familia.map((c) => ({ ...c, origem: ORIGEM_FAMILIA_CIRCUITO })).filter((c) => valido(c, gestos)), ...daTurma]
  return todos.map((c) => (videos[c.id] ? { ...c, video: videos[c.id] } : c))
}

/** Todos os circuitos que o atleta ativo pode fazer */
export function useCircuitos(): Circuito[] {
  const familia = useCircuitosStore((s) => s.criados)
  const videos = useCircuitosStore((s) => s.videos)
  const atleta = useContaStore((s) => s.atletaAtivo)
  const turma = useTurmasStore((s) => (atleta && s.taticasPorAtleta[atleta]) || SEM_TATICAS)
  const gestos = useGestos()
  return useMemo(
    () =>
      juntarCircuitos(
        familia,
        videos,
        turma,
        gestos.map((g) => g.id),
      ),
    [familia, videos, turma, gestos],
  )
}
