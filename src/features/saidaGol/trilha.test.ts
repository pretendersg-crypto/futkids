import { describe, expect, it } from 'vitest'
import { GESTOS_PRONTOS, type Gesto } from './gestos'
import { ETAPAS_TRILHA, etapaDoGesto, filaDaTrilha, gestosPorEtapa } from './trilha'
import { linkDeVideo, origemDoVideo } from '../../utils/link'

describe('trilha dos fundamentos', () => {
  it('cada gesto pronto aparece uma vez só, em alguma etapa', () => {
    const ids = ETAPAS_TRILHA.flatMap((e) => e.gestos)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual(GESTOS_PRONTOS.map((g) => g.id).sort())
  })

  it('ordem do curso: defesas e quedas → posicionamento → reposição → jogo, começando pela posição base', () => {
    expect(ETAPAS_TRILHA.map((e) => e.id)).toEqual(['defesas', 'posicionamento', 'reposicao', 'jogo'])
    expect(filaDaTrilha(GESTOS_PRONTOS)[0].id).toBe('base')
    expect(filaDaTrilha(GESTOS_PRONTOS)).toHaveLength(GESTOS_PRONTOS.length)
  })

  it('gesto criado pelos pais entra na etapa da categoria, depois dos prontos', () => {
    const criado: Gesto = { ...GESTOS_PRONTOS[0], id: 'meu-chute', nome: 'Meu chute', categoria: 'reposicao' }
    expect(etapaDoGesto(criado).id).toBe('reposicao')
    const reposicao = gestosPorEtapa([...GESTOS_PRONTOS, criado]).find((e) => e.etapa.id === 'reposicao')!
    expect(reposicao.gestos.at(-1)?.id).toBe('meu-chute')
  })
})

describe('links de vídeo', () => {
  it('aceita YouTube e aula da Hotmart; recusa outros sites', () => {
    expect(linkDeVideo('https://youtu.be/abc')).toBe('https://youtu.be/abc')
    expect(linkDeVideo('https://hotmart.com/pt-BR/club/ffutsal/products/1563064/content/64l9Xbobej')).toContain('hotmart.com')
    expect(linkDeVideo('https://ffutsal.club.hotmart.com/lesson/x')).not.toBeNull()
    expect(linkDeVideo('https://hotmart.com.golpe.net/x')).toBeNull()
    expect(linkDeVideo('javascript:alert(1)')).toBeNull()
    expect(origemDoVideo('https://hotmart.com/x')).toBe('hotmart')
  })

  it('as aulas dos gestos prontos são links válidos da Hotmart', () => {
    const comAula = GESTOS_PRONTOS.filter((g) => g.video)
    expect(comAula.length).toBeGreaterThan(10)
    for (const g of comAula) {
      expect(linkDeVideo(g.video!), g.id).toBe(g.video)
      expect(origemDoVideo(g.video!), g.id).toBe('hotmart')
    }
  })
})
