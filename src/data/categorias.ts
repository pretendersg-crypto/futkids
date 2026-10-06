// Categorias do jogador: Baby → Novato → Iniciante → Sabor Pro → Profissional → Lenda.
// A criança sobe de categoria pelo nível (XP); na área dos pais um adulto pode escolher a categoria
// na mão. Cada treino (botão Treinar) e cada vídeo pertence a uma categoria e fica com cadeado
// até a criança chegar nela (o que os pais colocam na agenda do dia fica liberado naquele dia).

export type CategoriaId = 'baby' | 'novato' | 'iniciante' | 'sabor-pro' | 'profissional' | 'lenda'

export interface Categoria {
  id: CategoriaId
  nome: string
  emoji: string
  /** Nível do jogador (XP) em que a categoria é liberada */
  nivelMinimo: number
  /** Classes do selo (fundo claro + borda forte, texto escuro) */
  cor: string
}

// Com ~30-50 XP por treino: Novato em ~1 semana, Iniciante em ~2-3, Sabor Pro em ~1 mês e meio,
// Profissional em ~3 meses e Lenda em ~5 meses treinando quase todo dia (ver utils/nivel.ts)
export const CATEGORIAS: Categoria[] = [
  { id: 'baby', nome: 'Baby', emoji: '🍼', nivelMinimo: 1, cor: 'bg-pink-100 border-pink-400' },
  { id: 'novato', nome: 'Novato', emoji: '🌱', nivelMinimo: 3, cor: 'bg-lime-100 border-lime-500' },
  { id: 'iniciante', nome: 'Iniciante', emoji: '⚽', nivelMinimo: 5, cor: 'bg-sky-100 border-sky-500' },
  { id: 'sabor-pro', nome: 'Sabor Pro', emoji: '🌶️', nivelMinimo: 8, cor: 'bg-orange-100 border-orange-500' },
  { id: 'profissional', nome: 'Profissional', emoji: '🥇', nivelMinimo: 12, cor: 'bg-yellow-100 border-yellow-500' },
  { id: 'lenda', nome: 'Lenda', emoji: '👑', nivelMinimo: 17, cor: 'bg-violet-100 border-violet-500' },
]

export const categoriaPorId = (id: CategoriaId | undefined): Categoria => CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0]

/** Posição na escada (Baby = 0 ... Lenda = 5) */
export const posicaoCategoria = (id: CategoriaId | undefined) => CATEGORIAS.indexOf(categoriaPorId(id))

/** Categoria que o nível (XP) dá */
export function categoriaPorNivel(nivel: number): Categoria {
  return [...CATEGORIAS].reverse().find((c) => nivel >= c.nivelMinimo) ?? CATEGORIAS[0]
}

/** Próxima categoria depois desta (undefined na Lenda) */
export const proximaCategoria = (id: CategoriaId): Categoria | undefined => CATEGORIAS[posicaoCategoria(id) + 1]

/** O item da categoria `doItem` está liberado para quem está na categoria `doJogador`? */
export const categoriaLiberada = (doItem: CategoriaId | undefined, doJogador: CategoriaId) => posicaoCategoria(doItem) <= posicaoCategoria(doJogador)
