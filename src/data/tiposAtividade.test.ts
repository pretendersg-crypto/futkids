import { describe, expect, it } from 'vitest'
import { tipoDaRota } from './tiposAtividade'

describe('tipoDaRota', () => {
  it('treinos, fundamentos, cones e embaixadinhas de verdade são com o corpo', () => {
    for (const r of ['/treinos', '/treinos/aquecimento', '/goleiro/fundamentos', '/goleiro/saida', '/goleiro/treino/basicos', '/rali/contador'])
      expect(tipoDaRota(r), r).toBe('corpo')
  })
  it('jogos de goleiro e Futsal Tático são na tela', () => {
    for (const r of ['/tatica', '/goleiro/defesa/iniciante', '/goleiro?tipo=tela']) expect(tipoDaRota(r), r).toBe('tela')
  })
  it('módulos com os dois tipos não têm selo, a menos que o endereço diga', () => {
    expect(tipoDaRota('/rali')).toBeUndefined()
    expect(tipoDaRota('/reacao')).toBeUndefined()
    expect(tipoDaRota('/goleiro')).toBeUndefined()
    expect(tipoDaRota('/reacao?tipo=corpo')).toBe('corpo')
    expect(tipoDaRota(undefined)).toBeUndefined()
  })
})
