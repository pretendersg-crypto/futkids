import { describe, expect, it } from 'vitest'
import { ANIMACOES, poseNoTempo } from './animacoes'
import { POSES } from './gestos'

describe('animação da posição base', () => {
  const anim = ANIMACOES.base!

  it('começa na pose base, desce até o agachamento e volta', () => {
    expect(poseNoTempo(anim, 0)).toEqual(POSES.base)
    const embaixo = poseNoTempo(anim, anim.ms)
    expect(embaixo.quadril.y).toBeCloseTo(POSES.base.quadril.y + 5)
    expect(embaixo.joelhos[0].x).toBeLessThan(POSES.base.joelhos[0].x)
    expect(poseNoTempo(anim, anim.ms * 2).quadril.y).toBeCloseTo(POSES.base.quadril.y)
  })

  it('o movimento é contínuo (sem pulos entre quadros) e os pés não saem do chão', () => {
    let anterior = poseNoTempo(anim, 0)
    for (let ms = 16; ms < anim.ms * 4; ms += 16) {
      const atual = poseNoTempo(anim, ms)
      expect(Math.abs(atual.quadril.y - anterior.quadril.y)).toBeLessThan(0.7)
      expect(atual.pes).toEqual(POSES.base.pes)
      anterior = atual
    }
  })
})
