import { describe, expect, it } from 'vitest'
import { mesclarJson } from './mesclar'

const s = (state: unknown, version = 1) => JSON.stringify({ state, version })
const ler = (json: string | null) => (json ? JSON.parse(json).state : null)

describe('juntar o que os dois lados mudaram', () => {
  it('campos diferentes: fica com os dois (pai fixou a categoria, criança comprou item)', () => {
    const base = s({ apelido: 'Águia', categoriaFixa: null, itensComprados: [] })
    const local = s({ apelido: 'Águia', categoriaFixa: null, itensComprados: ['acessorio:coroa'] })
    const remoto = s({ apelido: 'Águia', categoriaFixa: 'iniciante', itensComprados: [] })
    expect(ler(mesclarJson(base, local, remoto, true))).toEqual({ apelido: 'Águia', categoriaFixa: 'iniciante', itensComprados: ['acessorio:coroa'] })
  })

  it('mapas por data: dias diferentes do plano mudados nos dois aparelhos ficam todos', () => {
    const base = s({ alteracoes: { '2026-10-20': { itens: [] } } })
    const local = s({ alteracoes: { '2026-10-20': { itens: [] }, '2026-10-21': { itens: [{ treino: 'forca' }] } } })
    const remoto = s({ alteracoes: { '2026-10-20': { itens: [{ treino: 'alongamento' }] } } })
    expect(ler(mesclarJson(base, local, remoto, false))).toEqual({
      alteracoes: { '2026-10-20': { itens: [{ treino: 'alongamento' }] }, '2026-10-21': { itens: [{ treino: 'forca' }] } },
    })
  })

  it('o mesmo campo mudado nos dois: vale o mais recente', () => {
    const base = s({ xp: 10 })
    expect(ler(mesclarJson(base, s({ xp: 20 }), s({ xp: 30 }), true))).toEqual({ xp: 20 })
    expect(ler(mesclarJson(base, s({ xp: 20 }), s({ xp: 30 }), false))).toEqual({ xp: 30 })
  })

  it('campo apagado de um lado e intacto do outro: fica apagado', () => {
    const base = s({ extras: { a: 1, b: 2 } })
    expect(ler(mesclarJson(base, s({ extras: { a: 1 } }), s({ extras: { a: 1, b: 2 } }), false))).toEqual({ extras: { a: 1 } })
  })

  it('versões diferentes do store ou JSON estranho: não junta', () => {
    expect(mesclarJson(undefined, s({ a: 1 }, 1), s({ a: 2 }, 2), true)).toBeNull()
    expect(mesclarJson(undefined, '[1]', s({ a: 2 }), true)).toBeNull()
  })
})
