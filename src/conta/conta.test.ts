import { describe, expect, it } from 'vitest'
import { CHAVES_APARELHO, CHAVES_FAMILIA, CHAVES_FILHO } from './chaves'
import { decidir } from './decidir'

describe('chaves da conta da família', () => {
  it('todo store salvo está em família, filho ou aparelho (e em uma só)', () => {
    const fontes = import.meta.glob<string>(['../stores/*.ts', '!../stores/*.test.ts'], { eager: true, query: '?raw', import: 'default' })
    const nomes = Object.values(fontes).flatMap((codigo) => [...codigo.matchAll(/name: '(futkids[^']*)'/g)].map((m) => m[1]))
    expect(nomes.length).toBeGreaterThan(10)
    const todas: string[] = [...CHAVES_FAMILIA, ...CHAVES_FILHO, ...CHAVES_APARELHO]
    expect(new Set(todas).size).toBe(todas.length)
    for (const nome of nomes) expect(todas, nome).toContain(nome)
  })
})

describe('decidir a sincronia', () => {
  it('primeira vez: só no aparelho envia; só na nuvem baixa', () => {
    expect(decidir('{"a":1}', {}, null)).toBe('enviar')
    expect(decidir(null, {}, null)).toBe('nada')
    expect(decidir(null, {}, { json: '{"a":1}', em: 10 })).toBe('baixar')
  })

  it('aparelho sem o dado baixa mesmo que a nuvem não tenha mudado', () => {
    expect(decidir(null, { base: '{"a":1}', baseEm: 10 }, { json: '{"a":1}', em: 10 })).toBe('baixar')
  })

  it('aparelho novo com dado padrão e nuvem com dado: a nuvem ganha', () => {
    expect(decidir('{"padrao":true}', {}, { json: '{"a":1}', em: 10 })).toBe('baixar')
  })

  it('só um lado mudou: esse lado ganha', () => {
    const meta = { base: '{"a":1}', baseEm: 10 }
    expect(decidir('{"a":2}', meta, { json: '{"a":1}', em: 10 })).toBe('enviar')
    expect(decidir('{"a":1}', meta, { json: '{"a":3}', em: 20 })).toBe('baixar')
    expect(decidir('{"a":1}', meta, { json: '{"a":1}', em: 10 })).toBe('nada')
  })

  it('os dois mudaram: ganha o mais recente', () => {
    const remoto = { json: '{"a":3}', em: 20 }
    expect(decidir('{"a":2}', { base: '{"a":1}', baseEm: 10, alteradoEm: 30 }, remoto)).toBe('enviar')
    expect(decidir('{"a":2}', { base: '{"a":1}', baseEm: 10, alteradoEm: 15 }, remoto)).toBe('baixar')
    expect(decidir('{"a":3}', { base: '{"a":1}', baseEm: 10, alteradoEm: 15 }, remoto)).toBe('nada')
  })
})
