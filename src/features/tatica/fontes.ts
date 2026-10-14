// De onde vêm os puzzles e as pranchetas do Futsal Tático:
//  - os que vêm no app (puzzles/ e pranchetas.ts);
//  - os criados pelos pais (stores/taticaCriadaStore, valem para a família);
//  - os do treinador para a turma do atleta ativo (chegam pela sincronia em turmasStore).
// O que vem da nuvem é conferido antes de aparecer (puzzle quebrado fica de fora).
import { useMemo } from 'react'
import { useContaStore } from '../../conta/contaStore'
import { useTurmasStore, type TaticaGuardada } from '../../conta/turmasStore'
import { useTaticaCriadaStore } from '../../stores/taticaCriadaStore'
import { conferirPrancheta, PRANCHETAS_PRONTAS } from './pranchetas'
import { PUZZLES } from './puzzles'
import { CATEGORIAS_TATICA, DIFICULDADES_TATICA, type Prancheta, type Puzzle } from './tipos'
import { conferirPuzzle } from './validador'

export const ORIGEM_FAMILIA = '🏠 Família'

const SEM_TATICAS: TaticaGuardada[] = []

function puzzleValido(p: Puzzle): boolean {
  try {
    return CATEGORIAS_TATICA.includes(p.categoria) && DIFICULDADES_TATICA.includes(p.dificuldade) && conferirPuzzle(p).length === 0
  } catch {
    return false
  }
}

function pranchetaValida(p: Prancheta): boolean {
  try {
    return conferirPrancheta(p).length === 0
  } catch {
    return false
  }
}

/** Lê o que veio da turma (só o tipo pedido, e só se estiver certo) */
function daTurma<T extends Puzzle | Prancheta>(lista: TaticaGuardada[], tipo: 'puzzle' | 'prancheta', valido: (x: T) => boolean): T[] {
  return lista.flatMap((t) => {
    if (t.tipo !== tipo) return []
    try {
      const x = { ...(JSON.parse(t.json) as T), id: t.id, origem: `⚽ ${t.turmaNome}` }
      return valido(x) ? [x] : []
    } catch {
      return []
    }
  })
}

function juntarPuzzles(familia: Puzzle[], turma: TaticaGuardada[]): Puzzle[] {
  return [...PUZZLES, ...familia.map((p) => ({ ...p, origem: ORIGEM_FAMILIA })).filter(puzzleValido), ...daTurma<Puzzle>(turma, 'puzzle', puzzleValido)]
}

function juntarPranchetas(familia: Prancheta[], turma: TaticaGuardada[]): Prancheta[] {
  return [...PRANCHETAS_PRONTAS, ...familia.map((p) => ({ ...p, origem: ORIGEM_FAMILIA })).filter(pranchetaValida), ...daTurma<Prancheta>(turma, 'prancheta', pranchetaValida)]
}

const taticasDoAtletaAtivo = () => {
  const atleta = useContaStore.getState().atletaAtivo
  return (atleta && useTurmasStore.getState().taticasPorAtleta[atleta]) || SEM_TATICAS
}

/** Todos os puzzles agora (fora do React: sorteio da rodada, histórico) */
export function todosOsPuzzles(): Puzzle[] {
  return juntarPuzzles(useTaticaCriadaStore.getState().puzzles, taticasDoAtletaAtivo())
}

export const puzzlePorIdEmTodos = (id: string | undefined) => todosOsPuzzles().find((p) => p.id === id)

export function todasAsPranchetas(): Prancheta[] {
  return juntarPranchetas(useTaticaCriadaStore.getState().pranchetas, taticasDoAtletaAtivo())
}

/** Hook: lê as fontes como pedaços estáveis do store (lista nova a cada leitura = loop infinito) */
function useTaticasDaTurma(): TaticaGuardada[] {
  const atleta = useContaStore((s) => s.atletaAtivo)
  return useTurmasStore((s) => (atleta && s.taticasPorAtleta[atleta]) || SEM_TATICAS)
}

export function usePuzzles(): Puzzle[] {
  const familia = useTaticaCriadaStore((s) => s.puzzles)
  const turma = useTaticasDaTurma()
  return useMemo(() => juntarPuzzles(familia, turma), [familia, turma])
}

export function usePranchetas(): Prancheta[] {
  const familia = useTaticaCriadaStore((s) => s.pranchetas)
  const turma = useTaticasDaTurma()
  return useMemo(() => juntarPranchetas(familia, turma), [familia, turma])
}
