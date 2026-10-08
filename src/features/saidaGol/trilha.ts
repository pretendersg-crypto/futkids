// Trilha sugerida dos fundamentos do goleiro, na ordem dos blocos de um curso de goleiro de futsal
// (FFutsal): defesas e quedas → posicionamento → reposição → jogo. A posição base abre a trilha
// (é a base de todas as defesas). Gestos criados pelos pais entram na etapa da categoria deles,
// depois dos prontos.
import type { CategoriaGesto, Gesto } from './gestos'

export interface EtapaTrilha {
  id: string
  numero: number
  nome: string
  emoji: string
  descricao: string
  /** Gestos prontos, na ordem */
  gestos: string[]
  /** Categorias dos gestos criados pelos pais que caem nesta etapa */
  categorias: CategoriaGesto[]
}

export const ETAPAS_TRILHA: EtapaTrilha[] = [
  {
    id: 'defesas',
    numero: 1,
    nome: 'Defesas e quedas',
    emoji: '🤸',
    descricao: 'Comece pela posição base, depois agarrar, espalmar e cair do jeito certo.',
    gestos: ['base', 'encaixe', 'encaixe-medio', 'alta', 'espalmar', 'queda-lateral', 'mergulho', 'defesa-pe', 'cruz'],
    categorias: ['encaixe', 'desvio', 'queda'],
  },
  {
    id: 'posicionamento',
    numero: 2,
    nome: 'Posicionamento',
    emoji: '🧍',
    descricao: 'Onde ficar no gol, como se mexer e como organizar a defesa.',
    gestos: ['posicionamento', 'lateral', 'passo-cruzado', 'comunicacao'],
    categorias: ['postura', 'comunicacao'],
  },
  {
    id: 'reposicao',
    numero: 3,
    nome: 'Reposição',
    emoji: '🎯',
    descricao: 'Recomeçar o jogo com a mão e com o pé.',
    gestos: ['rolar', 'reposicao-alta', 'reposicao-pe'],
    categorias: ['reposicao'],
  },
  {
    id: 'jogo',
    numero: 4,
    nome: 'No jogo',
    emoji: '⚽',
    descricao: 'Sair do gol, enfrentar o 1 contra 1 e jogar com os pés.',
    gestos: ['saida', 'recuo', 'abafa', 'estrela', 'passe-pe'],
    categorias: ['saida', 'um-contra-um', 'pes'],
  },
]

/** Etapa de um gesto: a que lista o gesto pronto ou, para os criados, a da categoria */
export function etapaDoGesto(g: Pick<Gesto, 'id' | 'categoria'>): EtapaTrilha {
  return ETAPAS_TRILHA.find((e) => e.gestos.includes(g.id)) ?? ETAPAS_TRILHA.find((e) => e.categorias.includes(g.categoria)) ?? ETAPAS_TRILHA[0]
}

/** Os gestos de cada etapa, na ordem da trilha (prontos na ordem da lista, depois os criados) */
export function gestosPorEtapa(gestos: Gesto[]): { etapa: EtapaTrilha; gestos: Gesto[] }[] {
  return ETAPAS_TRILHA.map((etapa) => {
    const prontos = etapa.gestos.flatMap((id) => gestos.filter((g) => g.id === id))
    const outros = gestos.filter((g) => !etapa.gestos.includes(g.id) && !ETAPAS_TRILHA.some((e) => e.gestos.includes(g.id)) && etapaDoGesto(g).id === etapa.id)
    return { etapa, gestos: [...prontos, ...outros] }
  })
}

/** Todos os gestos numa fila só, na ordem da trilha (para o Anterior / Próximo) */
export function filaDaTrilha(gestos: Gesto[]): Gesto[] {
  return gestosPorEtapa(gestos).flatMap((e) => e.gestos)
}
