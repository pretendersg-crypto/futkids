import { describe, expect, it } from 'vitest'
import type { TaticaGuardada } from '../../conta/turmasStore'
import { circuitoEmBranco, CIRCUITOS, conferirCircuito, textoPadrao, type Circuito } from './circuitos'
import { juntarCircuitos } from './fontesCircuitos'
import { GESTOS_PRONTOS } from './gestos'

const GESTOS = GESTOS_PRONTOS.map((g) => g.id)
const comNome = (c: Circuito): Circuito => ({ ...c, nome: 'Meu circuito', objetivo: 'Treinar a saída.' })

describe('circuitos com cones', () => {
  it.each(CIRCUITOS.map((c) => [c.id, c] as const))('%s (do app) passa na conferência', (_id, c) => {
    expect(conferirCircuito(c, GESTOS)).toEqual([])
  })

  it('circuito em branco só precisa de nome e objetivo para valer', () => {
    expect(conferirCircuito(circuitoEmBranco(), GESTOS).length).toBeGreaterThan(0)
    expect(conferirCircuito(comNome(circuitoEmBranco()), GESTOS)).toEqual([])
  })

  it('acha passo para cone que não existe, gesto que não existe e cone fora da quadra', () => {
    const c = comNome(circuitoEmBranco())
    c.cones.push({ id: 'Z', x: 30, y: 2, cor: 'azul' })
    c.passos.push({ de: 'G', para: 'X', movimento: 'saida', gesto: 'nao-existe', texto: 'x' })
    const erros = conferirCircuito(c, GESTOS)
    expect(erros).toContain('cone Z fora da quadra')
    expect(erros.some((e) => e.includes('cone para onde vai'))).toBe(true)
    expect(erros.some((e) => e.includes('escolha o gesto'))).toBe(true)
  })

  it('texto sugerido conforme o movimento', () => {
    expect(textoPadrao({ de: 'G', para: 'A', movimento: 'recuo', gesto: 'recuo', texto: '' })).toBe('Volte de costas até o cone A.')
  })
})

describe('juntar os circuitos (app, família e turma)', () => {
  const daTurma = (c: unknown, tipo: TaticaGuardada['tipo'] = 'circuito'): TaticaGuardada => ({ id: 'nuvem1', tipo, titulo: 'x', json: JSON.stringify(c), em: 1, turma: 't', turmaNome: 'Sub-9' })

  it('o da turma entra com a origem; o quebrado e os de outro tipo ficam de fora', () => {
    const bom = comNome(circuitoEmBranco())
    const lista = juntarCircuitos([], {}, [daTurma(bom), { ...daTurma({ nome: '' }), id: 'quebrado' }, { ...daTurma(bom, 'puzzle'), id: 'puzzle' }], GESTOS)
    const naTurma = lista.filter((c) => c.origem)
    expect(naTurma.map((c) => [c.id, c.origem])).toEqual([['nuvem1', '⚽ Sub-9']])
  })

  it('o vídeo posto pela família vale mais que o do circuito', () => {
    const lista = juntarCircuitos([], { 'sai-e-volta': 'https://youtu.be/abc' }, [], GESTOS)
    expect(lista.find((c) => c.id === 'sai-e-volta')?.video).toBe('https://youtu.be/abc')
  })
})
