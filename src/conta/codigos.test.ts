import { describe, expect, it } from 'vitest'
import { ALFABETO, codigoCompleto, gerarCodigo, lerCodigo, mostrarCodigo } from './codigos'

describe('códigos de convite', () => {
  it('8 caracteres, só do alfabeto sem letras que se confundem', () => {
    for (let i = 0; i < 200; i++) {
      const c = gerarCodigo()
      expect(c).toHaveLength(8)
      expect(codigoCompleto(c)).toBe(true)
    }
    for (const confusa of ['0', 'O', '1', 'I', 'L']) expect(ALFABETO).not.toContain(confusa)
  })

  it('aceita o código digitado com traço, espaço e minúsculas', () => {
    expect(lerCodigo(' abcd-2345 ')).toBe('ABCD2345')
    expect(mostrarCodigo('ABCD2345')).toBe('ABCD-2345')
    expect(codigoCompleto('ABCD2345')).toBe(true)
    expect(codigoCompleto('ABC')).toBe(false)
    expect(codigoCompleto('ABCD0345')).toBe(false)
  })
})
