// Trilhas sugeridas dos fundamentos, como um curso, uma para cada tipo de atleta:
//  - GOLEIRO, na ordem dos blocos de um curso de goleiro de futsal (FFutsal): defesas e quedas →
//    posicionamento → reposição → jogo. A posição base abre a trilha (é a base de todas as defesas);
//  - LINHA: domínio e passe → condução e drible → finalização → marcação;
//  - e, no fim das duas, as etapas COMUNS aos dois (movimentação, visão de jogo e comunicação).
// Dentro de cada etapa, do básico ao avançado. Gestos criados pelos pais entram na etapa da
// categoria deles, depois dos prontos.
import { categoriaGestoPorId, publicoDoGesto, type CategoriaGesto, type Gesto, type PublicoGesto } from './gestos'

export type TipoAtleta = 'goleiro' | 'linha'

export interface EtapaTrilha {
  id: string
  /** De quem é a etapa ('todos' = aparece nas duas trilhas, no fim) */
  publico: PublicoGesto
  nome: string
  emoji: string
  descricao: string
  /** Gestos prontos, na ordem */
  gestos: string[]
  /** Categorias dos gestos criados pelos pais que caem nesta etapa */
  categorias: CategoriaGesto[]
}

export const ETAPAS_TRILHA: EtapaTrilha[] = [
  // ---------- Goleiro ----------
  {
    id: 'defesas',
    publico: 'goleiro',
    nome: 'Defesas e quedas',
    emoji: '🤸',
    descricao: 'Comece pela posição base, depois agarrar, espalmar e cair do jeito certo.',
    gestos: ['base', 'encaixe', 'encaixe-medio', 'alta', 'espalmar', 'queda-lateral', 'levantar-rapido', 'defesa-pe', 'mergulho', 'encaixe-queda', 'reflexo', 'desvio-por-cima', 'cruz'],
    categorias: ['encaixe', 'desvio', 'queda'],
  },
  {
    id: 'posicionamento',
    publico: 'goleiro',
    nome: 'Posicionamento',
    emoji: '🧍',
    descricao: 'Onde ficar no gol, como se mexer e como organizar a defesa.',
    gestos: ['posicionamento', 'lateral', 'comunicacao', 'passo-cruzado', 'posicao-escanteio', 'barreira'],
    categorias: ['postura'],
  },
  {
    id: 'reposicao',
    publico: 'goleiro',
    nome: 'Reposição',
    emoji: '🎯',
    descricao: 'Recomeçar o jogo com a mão e com o pé.',
    gestos: ['rolar', 'reposicao-alta', 'reposicao-pe'],
    categorias: ['reposicao'],
  },
  {
    id: 'jogo',
    publico: 'goleiro',
    nome: 'No jogo',
    emoji: '⚽',
    descricao: 'Sair do gol, enfrentar o 1 contra 1 e jogar com os pés.',
    gestos: ['saida', 'recuo', 'abafa', 'estrela', 'passe-pe'],
    categorias: ['saida', 'um-contra-um', 'pes'],
  },
  // ---------- Linha ----------
  {
    id: 'bola-no-pe',
    publico: 'linha',
    nome: 'Domínio e passe',
    emoji: '👟',
    descricao: 'Parar a bola e passar certo: a base de tudo no futsal.',
    gestos: ['dominio-sola', 'passe-interno', 'passe-sola', 'dominio-orientado', 'passe-primeira', 'dominio-de-costas'],
    categorias: ['dominio', 'passe'],
  },
  {
    id: 'conducao',
    publico: 'linha',
    nome: 'Condução e drible',
    emoji: '🌀',
    descricao: 'Levar a bola colada no pé, proteger e passar pelo marcador.',
    gestos: ['conducao', 'conducao-sola', 'protecao', 'drible-corte', 'finta-corpo'],
    categorias: ['conducao'],
  },
  {
    id: 'finalizacao',
    publico: 'linha',
    nome: 'Finalização',
    emoji: '🥅',
    descricao: 'Chutar rápido, forte ou colocado, conforme a jogada.',
    gestos: ['chute-bico', 'chute-peito-pe', 'finalizacao-canto'],
    categorias: ['finalizacao'],
  },
  {
    id: 'marcacao',
    publico: 'linha',
    nome: 'Marcação',
    emoji: '🛡️',
    descricao: 'Defender sem a bola: postura e o bote na hora certa.',
    gestos: ['marcacao-postura', 'desarme'],
    categorias: ['marcacao'],
  },
  // ---------- Comuns aos dois ----------
  {
    id: 'movimento',
    publico: 'todos',
    nome: 'Movimentação (para todos)',
    emoji: '⚡',
    descricao: 'Esperar pronto, sair rápido e mudar de direção: vale para goleiro e linha.',
    gestos: ['base-atletica', 'arrancada', 'mudanca-direcao'],
    categorias: ['movimentacao'],
  },
  {
    id: 'cabeca-no-jogo',
    publico: 'todos',
    nome: 'Visão e comunicação (para todos)',
    emoji: '👀',
    descricao: 'Olhar antes de receber e falar com o time.',
    gestos: ['olhar-antes', 'pedir-bola'],
    categorias: ['visao', 'comunicacao'],
  },
]

/** As etapas da trilha de um tipo de atleta: as dele e, no fim, as comuns */
export function etapasDe(atleta: TipoAtleta): EtapaTrilha[] {
  return [...ETAPAS_TRILHA.filter((e) => e.publico === atleta), ...ETAPAS_TRILHA.filter((e) => e.publico === 'todos')]
}

/** Etapa de um gesto: a que lista o gesto pronto ou, para os criados, a da categoria */
export function etapaDoGesto(g: Pick<Gesto, 'id' | 'categoria' | 'publico'>): EtapaTrilha {
  const publico = publicoDoGesto(g)
  return (
    ETAPAS_TRILHA.find((e) => e.gestos.includes(g.id)) ??
    ETAPAS_TRILHA.find((e) => e.categorias.includes(g.categoria) && (e.publico === publico || publico === categoriaGestoPorId(g.categoria).publico)) ??
    ETAPAS_TRILHA.find((e) => e.publico === publico) ??
    ETAPAS_TRILHA[0]
  )
}

/** A trilha em que o gesto aparece primeiro (o de linha na de linha; os outros na do goleiro) */
export const trilhaDoGesto = (g: Pick<Gesto, 'publico' | 'categoria'>): TipoAtleta => (publicoDoGesto(g) === 'linha' ? 'linha' : 'goleiro')

/** Os gestos de cada etapa da trilha, na ordem (prontos na ordem da lista, depois os criados) */
export function gestosPorEtapa(gestos: Gesto[], atleta: TipoAtleta = 'goleiro'): { etapa: EtapaTrilha; gestos: Gesto[] }[] {
  const listados = new Set(ETAPAS_TRILHA.flatMap((e) => e.gestos))
  return etapasDe(atleta).map((etapa) => {
    const prontos = etapa.gestos.flatMap((id) => gestos.filter((g) => g.id === id))
    const outros = gestos.filter((g) => !listados.has(g.id) && etapaDoGesto(g).id === etapa.id)
    return { etapa, gestos: [...prontos, ...outros] }
  })
}

/** Todos os gestos da trilha numa fila só (para o Anterior / Próximo) */
export function filaDaTrilha(gestos: Gesto[], atleta: TipoAtleta = 'goleiro'): Gesto[] {
  return gestosPorEtapa(gestos, atleta).flatMap((e) => e.gestos)
}
