import { describe, expect, it } from 'vitest'
import { GESTOS_PRONTOS } from './gestos'
import { montarArtes, NOMES_ARTE_GESTO_APP } from './arteLocal'

describe('arte dos gestos', () => {
  it('junta imagem e vídeo da mesma pose', () => {
    const artes = montarArtes({ '../../assets/goleiro3d/base.webp': '/a/base.webp', '../../assets/goleiro3d/base.mp4': '/a/base.mp4' })
    expect(artes.base).toEqual({ imagem: '/a/base.webp', video: '/a/base.mp4' })
  })

  it('a arte da família troca a do app inteira (não mistura as duas)', () => {
    const app = { '../../assets/goleiro3d/base.webp': '/app/base.webp', '../../assets/goleiro3d/base.mp4': '/app/base.mp4', '../../assets/goleiro3d/cruz.webm': '/app/cruz.webm' }
    const familia = { '../../local/goleiro3d/base.png': '/fam/base.png' }
    const artes = montarArtes(app, familia)
    expect(artes.base).toEqual({ imagem: '/fam/base.png' })
    expect(artes.cruz).toEqual({ video: '/app/cruz.webm' })
  })

  it('GIF conta como imagem', () => {
    expect(montarArtes({ '../../assets/gestos/passe-primeira.gif': '/a/p.gif' })['passe-primeira']).toEqual({ imagem: '/a/p.gif' })
  })

  it('cada arquivo em src/assets/gestos tem o nome de um gesto (ver ARTE_DOS_GESTOS.md)', () => {
    const ids = new Set(GESTOS_PRONTOS.map((g) => g.id))
    for (const nome of NOMES_ARTE_GESTO_APP) expect(ids.has(nome), `src/assets/gestos/${nome}.*: não existe gesto "${nome}"`).toBe(true)
  })
})
