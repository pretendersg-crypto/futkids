// Atalhos para escrever os puzzles sem repetir objetos grandes.
// Azul = seu time (ids "a<número>"), vermelho = adversário (ids "b<número>").
import type { Alvo, Jogador } from '../tipos'

export const azul = (numero: number, x: number, y: number, goleiro = false): Jogador => ({ id: `a${numero}`, time: 'A', numero, pos: { x, y }, goleiro })
export const verm = (numero: number, x: number, y: number, goleiro = false): Jogador => ({ id: `b${numero}`, time: 'B', numero, pos: { x, y }, goleiro })

/** Goleiros na posição de sempre (embaixo da trave) */
export const GOLEIRO_AZUL = azul(1, 0.03, 0.5, true)
export const GOLEIRO_VERMELHO = verm(1, 0.97, 0.5, true)

export const paraJogador = (id: string): Alvo => ({ tipo: 'jogador', id })
export const paraPonto = (x: number, y: number): Alvo => ({ tipo: 'ponto', pos: { x, y } })
export const GOL: Alvo = { tipo: 'gol' }
