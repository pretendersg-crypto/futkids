// Confere os dados dos gestos do goleiro e dos circuitos com cones (rode `npm test` depois de mudar).
import { describe, expect, it } from 'vitest'
import { todosOsGestos } from '../../stores/gestosStore'
import { CIRCUITOS, ondeTermina } from './circuitos'
import { CATEGORIAS_GESTO, GESTOS_PRONTOS, POSES, type Gesto } from './gestos'

describe('gestos do goleiro', () => {
  it('ids únicos', () => {
    expect(new Set(GESTOS_PRONTOS.map((g) => g.id)).size).toBe(GESTOS_PRONTOS.length)
  })
  it.each(GESTOS_PRONTOS.map((g) => [g.id, g] as const))('%s tem categoria, desenho e como fazer', (_id, g) => {
    expect(CATEGORIAS_GESTO.some((c) => c.id === g.categoria)).toBe(true)
    if (g.desenho.tipo === 'pose') expect(POSES[g.desenho.pose]).toBeDefined()
    expect(g.comoFazer.length).toBeGreaterThan(0)
    expect(g.nome.trim()).not.toBe('')
  })
  it('todas as categorias têm pelo menos um gesto', () => {
    for (const c of CATEGORIAS_GESTO) expect(GESTOS_PRONTOS.some((g) => g.categoria === c.id), c.id).toBe(true)
  })
  it('as mudanças dos pais substituem o original e os criados entram no fim', () => {
    const mudado: Gesto = { ...GESTOS_PRONTOS[0], nome: 'Base do treinador', video: 'https://youtu.be/abc' }
    const criado: Gesto = { ...GESTOS_PRONTOS[0], id: 'gesto-novo', nome: 'Novo' }
    const lista = todosOsGestos({ editados: { [mudado.id]: mudado }, criados: [criado] })
    expect(lista[0].nome).toBe('Base do treinador')
    expect(lista[lista.length - 1].id).toBe('gesto-novo')
    expect(lista).toHaveLength(GESTOS_PRONTOS.length + 1)
  })
})

describe('circuitos com cones', () => {
  it.each(CIRCUITOS.map((c) => [c.id, c] as const))('%s usa gestos e cones que existem', (_id, c) => {
    const cones = new Set(c.cones.map((x) => x.id))
    expect(cones.size).toBe(c.cones.length)
    for (const p of c.passos) {
      expect(GESTOS_PRONTOS.some((g) => g.id === p.gesto), `gesto ${p.gesto}`).toBe(true)
      expect(cones.has(p.de), `cone ${p.de}`).toBe(true)
      if (p.movimento !== 'parado') expect(p.para && cones.has(p.para), `cone ${p.para}`).toBe(true)
    }
  })
  it.each(CIRCUITOS.map((c) => [c.id, c] as const))('%s: cada passo começa onde o anterior terminou', (_id, c) => {
    c.passos.forEach((p, i) => {
      if (i > 0) expect(p.de, `passo ${i + 1}`).toBe(ondeTermina(c.passos[i - 1]))
    })
  })
})
