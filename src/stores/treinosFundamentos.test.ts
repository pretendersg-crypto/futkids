// Treinos de fundamentos: os prontos usam gestos que existem, e a agenda acha o treino pelo id "fund:".
import { describe, expect, it } from 'vitest'
import { idDeFundamentos, treinoPorId } from '../data/calendarioGoleiros'
import { GESTOS_PRONTOS } from '../features/saidaGol/gestos'
import { TREINOS_FUNDAMENTOS_INICIAIS } from './treinosFundamentosStore'

describe('treinos de fundamentos', () => {
  it.each(TREINOS_FUNDAMENTOS_INICIAIS.map((t) => [t.id, t] as const))('%s usa gestos do catálogo, sem repetir', (_id, t) => {
    expect(t.itens.length).toBeGreaterThan(0)
    expect(new Set(t.itens.map((i) => i.gesto)).size).toBe(t.itens.length)
    for (const i of t.itens) {
      expect(GESTOS_PRONTOS.some((g) => g.id === i.gesto), i.gesto).toBe(true)
      expect(i.quantidade).toBeGreaterThan(0)
    }
  })
  it('a agenda acha o treino de fundamentos e ele conta como treino de goleiro', () => {
    const t = treinoPorId(idDeFundamentos('basicos'), [], [], TREINOS_FUNDAMENTOS_INICIAIS)
    expect(t?.nome).toBe('Fundamentos básicos')
    expect(t?.rota).toBe('/goleiro/treino/basicos')
    expect(t?.atividade).toBe('goleiro')
  })
  it('treino apagado não é achado', () => {
    expect(treinoPorId(idDeFundamentos('nao-existe'), [], [], TREINOS_FUNDAMENTOS_INICIAIS)).toBeUndefined()
  })
})
