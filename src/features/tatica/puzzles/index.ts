// Todos os puzzles do Futsal Tático. Para criar um novo, copie um puzzle parecido no arquivo da
// categoria (ataque, defesa, transição, bola parada, saída do goleiro), mude os dados e rode `npm test`:
// o teste confere se cada passo tem exatamente uma resposta certa, se os jogadores existem etc.
import type { Puzzle } from '../tipos'
import { PUZZLES_ATAQUE } from './ataque'
import { PUZZLES_BOLA_PARADA } from './bolaParada'
import { PUZZLES_DEFESA } from './defesa'
import { PUZZLES_SAIDA_GOLEIRO } from './saidaGoleiro'
import { PUZZLES_TRANSICAO } from './transicao'

export const PUZZLES: Puzzle[] = [...PUZZLES_ATAQUE, ...PUZZLES_DEFESA, ...PUZZLES_TRANSICAO, ...PUZZLES_BOLA_PARADA, ...PUZZLES_SAIDA_GOLEIRO].sort((a, b) => a.rating - b.rating)

export const puzzlePorId = (id: string | undefined) => PUZZLES.find((p) => p.id === id)
