// Rating no estilo dos puzzles de xadrez (Elo simplificado): acertar um puzzle mais difícil que
// o seu rating sobe muito; errar um mais fácil desce mais. Acertar = resolver sem errar nenhuma
// vez e sem pedir para revelar (a dica não conta como erro, mas o rating ganho cai pela metade).

export const RATING_INICIAL = 800
export const RATING_MINIMO = 100
/** Quanto o rating pode mudar num puzzle */
const K = 32

/** Chance esperada de acertar (0 a 1) pela diferença entre o rating do jogador e o do puzzle */
export function chanceEsperada(ratingJogador: number, ratingPuzzle: number): number {
  return 1 / (1 + 10 ** ((ratingPuzzle - ratingJogador) / 400))
}

/** Quanto o rating muda (inteiro, positivo ou negativo) */
export function variacaoRating(ratingJogador: number, ratingPuzzle: number, acertou: boolean, usouDica = false): number {
  const esperado = chanceEsperada(ratingJogador, ratingPuzzle)
  let delta = K * ((acertou ? 1 : 0) - esperado)
  if (acertou && usouDica) delta /= 2
  return Math.round(delta)
}

/** Novo rating, nunca abaixo do mínimo */
export function novoRating(ratingJogador: number, ratingPuzzle: number, acertou: boolean, usouDica = false): number {
  return Math.max(RATING_MINIMO, ratingJogador + variacaoRating(ratingJogador, ratingPuzzle, acertou, usouDica))
}
