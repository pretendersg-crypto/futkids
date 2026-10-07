// Gamificação do Pai/Mãe Treinador: lições, níveis e medalhas.
import { describe, expect, it } from 'vitest'
import { LICOES } from './licoes'
import { NIVEIS_TREINADOR, nivelTreinador } from './niveis'
import { ITENS } from './opcoesTreinador'
import { contagens, MEDALHAS, medalhasGanhas, PONTOS } from './pontos'

describe('lições do treinador', () => {
  it('ids únicos', () => {
    expect(new Set(LICOES.map((l) => l.id)).size).toBe(LICOES.length)
  })
  it.each(LICOES.map((l) => [l.id, l] as const))('%s tem texto e um quiz válido', (_id, l) => {
    expect(l.texto.length).toBeGreaterThan(0)
    expect(l.quiz.length).toBeGreaterThanOrEqual(3)
    for (const q of l.quiz) {
      expect(q.opcoes.length).toBeGreaterThanOrEqual(2)
      expect(q.certa).toBeGreaterThanOrEqual(0)
      expect(q.certa).toBeLessThan(q.opcoes.length)
      expect(new Set(q.opcoes).size).toBe(q.opcoes.length)
      expect(q.porque.trim()).not.toBe('')
    }
  })
})

describe('níveis do treinador', () => {
  it('começa no nível 1 e sobe com o XP', () => {
    expect(nivelTreinador(0).atual.nivel).toBe(1)
    expect(nivelTreinador(99).atual.nivel).toBe(1)
    expect(nivelTreinador(100).atual.nivel).toBe(2)
    expect(nivelTreinador(5000).atual.nivel).toBe(NIVEIS_TREINADOR.length)
    expect(nivelTreinador(5000).proximo).toBeUndefined()
  })
  it('XP dos níveis sempre cresce e todo item é liberado por um nível que existe', () => {
    NIVEIS_TREINADOR.forEach((n, i) => i > 0 && expect(n.xp).toBeGreaterThan(NIVEIS_TREINADOR[i - 1].xp))
    for (const item of ITENS) expect(NIVEIS_TREINADOR.some((n) => n.nivel === item.nivel)).toBe(true)
  })
  it('estudar todas as lições já leva além do nível 2', () => {
    const xp = LICOES.length * (PONTOS.licao + PONTOS.quizPerfeito)
    expect(nivelTreinador(xp).atual.nivel).toBeGreaterThan(2)
  })
})

describe('medalhas', () => {
  it('conta as ações por tipo', () => {
    const c = contagens(['planejarDia:2026-10-01', 'planejarDia:2026-10-02', 'licao:regras', 'coisa-estranha:x'])
    expect(c.planejarDia).toBe(2)
    expect(c.licao).toBe(1)
  })
  it('primeiro plano sai com o primeiro treino de fundamentos', () => {
    expect(medalhasGanhas([]).map((m) => m.id)).not.toContain('primeiro-plano')
    expect(medalhasGanhas(['criarFundamentos:abc']).map((m) => m.id)).toContain('primeiro-plano')
  })
  it('formado só com todas as lições', () => {
    const quase = LICOES.slice(1).map((l) => `licao:${l.id}`)
    expect(medalhasGanhas(quase).map((m) => m.id)).not.toContain('professor')
    expect(medalhasGanhas([...quase, `licao:${LICOES[0].id}`]).map((m) => m.id)).toContain('professor')
  })
  it('ids únicos', () => {
    expect(new Set(MEDALHAS.map((m) => m.id)).size).toBe(MEDALHAS.length)
  })
})
