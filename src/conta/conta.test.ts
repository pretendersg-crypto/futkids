import { describe, expect, it } from 'vitest'
import { CHAVES_APARELHO, CHAVES_FAMILIA, CHAVES_FILHO, VERSAO_DADOS } from './chaves'
import { aparelhoMaisRecente, decidir, gravadoPorAppMaisNovo } from './decidir'

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

describe('versão do formato dos dados', () => {
  // Se este teste falhar porque a "version" de um store mudou: suba VERSAO_DADOS em chaves.ts e
  // atualize a lista abaixo (assim um aparelho com o app antigo não estraga o formato novo).
  const VERSOES_DOS_STORES: Record<string, number> = {
    'futkids-conquistas': 1,
    'futkids-agenda': 1,
    'futkids-alimentacao': 1,
    'futkids-config': 1,
    'futkids-gestos-concluidos': 1,
    'futkids-gestos': 1,
    'futkids-pais': 2,
    'futkids-programa': 1,
    'futkids-progresso': 1,
    'futkids-reacao': 1,
    'futkids-tatica': 1,
    'futkids-treinador': 1,
    'futkids-treinos-fundamentos': 1,
    'futkids-treinos': 1,
    'futkids-jogador': 3,
  }

  it('as versões dos stores são as conhecidas para VERSAO_DADOS = 1', () => {
    const fontes = import.meta.glob<string>(['../stores/*.ts', '!../stores/*.test.ts'], { eager: true, query: '?raw', import: 'default' })
    const achadas: Record<string, number> = {}
    for (const codigo of Object.values(fontes)) {
      const nome = /name: '(futkids[^']*)'/.exec(codigo)?.[1]
      const versao = /\n\s*version: (\d+),/.exec(codigo)?.[1]
      if (nome) achadas[nome] = Number(versao ?? 0)
    }
    expect(VERSAO_DADOS).toBe(1)
    expect(achadas).toEqual(VERSOES_DOS_STORES)
  })

  it('dado gravado por um app mais novo é recusado', () => {
    expect(gravadoPorAppMaisNovo({ json: '{}', em: 1 }, 1)).toBe(false)
    expect(gravadoPorAppMaisNovo({ json: '{}', em: 1, app: 1 }, 1)).toBe(false)
    expect(gravadoPorAppMaisNovo({ json: '{}', em: 1, app: 2 }, 1)).toBe(true)
    expect(gravadoPorAppMaisNovo(null, 1)).toBe(false)
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

  it('aparelho novo com dado padrão e nuvem com dado: junta (nos campos em comum, a nuvem ganha)', () => {
    expect(decidir('{"padrao":true}', {}, { json: '{"a":1}', em: 10 })).toBe('juntar')
  })

  it('só um lado mudou: esse lado ganha', () => {
    const meta = { base: '{"a":1}', baseEm: 10 }
    expect(decidir('{"a":2}', meta, { json: '{"a":1}', em: 10 })).toBe('enviar')
    expect(decidir('{"a":1}', meta, { json: '{"a":3}', em: 20 })).toBe('baixar')
    expect(decidir('{"a":1}', meta, { json: '{"a":1}', em: 10 })).toBe('nada')
  })

  it('os dois mudaram: junta (e no conflito vale o mais recente)', () => {
    const remoto = { json: '{"a":3}', em: 20 }
    expect(decidir('{"a":2}', { base: '{"a":1}', baseEm: 10, alteradoEm: 30 }, remoto)).toBe('juntar')
    expect(decidir('{"a":3}', { base: '{"a":1}', baseEm: 10, alteradoEm: 15 }, remoto)).toBe('nada')
    expect(aparelhoMaisRecente({ alteradoEm: 30 }, remoto)).toBe(true)
    expect(aparelhoMaisRecente({ alteradoEm: 15 }, remoto)).toBe(false)
    expect(aparelhoMaisRecente({}, remoto)).toBe(false)
  })
})
