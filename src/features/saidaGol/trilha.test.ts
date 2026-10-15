import { describe, expect, it } from 'vitest'
import { GESTOS_PRONTOS, POSES, publicoDoGesto, type Gesto } from './gestos'
import { ETAPAS_TRILHA, etapaDoGesto, etapasDe, filaDaTrilha, gestosPorEtapa } from './trilha'
import { linkDeVideo, origemDoVideo } from '../../utils/link'

describe('trilha dos fundamentos', () => {
  it('cada gesto pronto aparece uma vez só, em alguma etapa', () => {
    const ids = ETAPAS_TRILHA.flatMap((e) => e.gestos)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual(GESTOS_PRONTOS.map((g) => g.id).sort())
  })

  it('goleiro: defesas e quedas → posicionamento → reposição → jogo, começando pela posição base, e no fim os comuns', () => {
    expect(etapasDe('goleiro').map((e) => e.id)).toEqual(['defesas', 'posicionamento', 'reposicao', 'jogo', 'movimento', 'cabeca-no-jogo'])
    expect(filaDaTrilha(GESTOS_PRONTOS, 'goleiro')[0].id).toBe('base')
  })

  it('linha: domínio e passe → condução → finalização → marcação, e no fim os comuns', () => {
    expect(etapasDe('linha').map((e) => e.id)).toEqual(['bola-no-pe', 'conducao', 'finalizacao', 'marcacao', 'movimento', 'cabeca-no-jogo'])
    const fila = filaDaTrilha(GESTOS_PRONTOS, 'linha')
    expect(fila[0].id).toBe('dominio-sola')
    // Nenhum gesto só de goleiro na trilha de linha (e vice-versa)
    expect(fila.every((g) => publicoDoGesto(g) !== 'goleiro')).toBe(true)
    expect(filaDaTrilha(GESTOS_PRONTOS, 'goleiro').every((g) => publicoDoGesto(g) !== 'linha')).toBe(true)
  })

  it('as duas trilhas juntas têm todos os gestos; os comuns aparecem nas duas', () => {
    const goleiro = filaDaTrilha(GESTOS_PRONTOS, 'goleiro').map((g) => g.id)
    const linha = filaDaTrilha(GESTOS_PRONTOS, 'linha').map((g) => g.id)
    expect(new Set([...goleiro, ...linha]).size).toBe(GESTOS_PRONTOS.length)
    expect(goleiro).toContain('arrancada')
    expect(linha).toContain('arrancada')
  })

  it('tem gestos de goleiro, de linha e comuns, nos 3 níveis; goleiro desenhado de laranja e linha de azul', () => {
    for (const publico of ['goleiro', 'linha', 'todos'] as const) {
      const doPublico = GESTOS_PRONTOS.filter((g) => publicoDoGesto(g) === publico)
      expect(doPublico.length, publico).toBeGreaterThanOrEqual(5)
      if (publico !== 'todos') expect(new Set(doPublico.map((g) => g.nivel))).toEqual(new Set(['facil', 'intermediario', 'avancado']))
    }
    for (const g of GESTOS_PRONTOS) {
      expect(g.nivel, g.id).toBeDefined()
      if (g.desenho.tipo !== 'pose') continue
      // Desenho de linha (sem luvas) só em gesto que não é de goleiro, e vice-versa
      expect(Boolean(POSES[g.desenho.pose].linha), g.id).toBe(publicoDoGesto(g) !== 'goleiro')
    }
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
