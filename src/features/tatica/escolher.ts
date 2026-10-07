// Qual puzzle vem a seguir: dentro dos filtros, primeiro os que a criança ainda não acertou,
// com rating perto do dela (um pouco acima, para desafiar). Sorteia entre os 3 mais adequados
// para a rodada não ser sempre igual.
import type { DesempenhoPuzzle } from '../../stores/taticaStore'
import { PUZZLES } from './puzzles'
import type { CategoriaTatica, Dificuldade, Puzzle } from './tipos'

export interface Filtros {
  dificuldade?: Dificuldade
  categoria?: CategoriaTatica
}

export function puzzlesDoFiltro(f: Filtros): Puzzle[] {
  return PUZZLES.filter((p) => (!f.dificuldade || p.dificuldade === f.dificuldade) && (!f.categoria || p.categoria === f.categoria))
}

export function proximoPuzzle(f: Filtros, rating: number, porPuzzle: Record<string, DesempenhoPuzzle>, jaNaRodada: string[], sorteio = Math.random): Puzzle | undefined {
  const candidatos = puzzlesDoFiltro(f).filter((p) => !jaNaRodada.includes(p.id))
  if (candidatos.length === 0) return undefined
  const alvo = rating + 50
  // Nota menor = melhor: quem nunca acertou vem antes; depois, o rating mais perto do alvo
  const nota = (p: Puzzle) => (porPuzzle[p.id]?.ultimoAcerto ? 1000 : 0) + Math.abs(p.rating - alvo) / 10
  const ordenados = [...candidatos].sort((a, b) => nota(a) - nota(b))
  return ordenados[Math.floor(sorteio() * Math.min(3, ordenados.length))]
}
