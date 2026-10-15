import { describe, expect, it } from 'vitest'
import { idDeGesto, treinoPorId } from './calendarioGoleiros'

describe('gesto técnico no plano', () => {
  it('um gesto do app vira treino que abre a aula dele e conta como goleiro', () => {
    const t = treinoPorId(idDeGesto('base'))
    expect(t).toMatchObject({ id: 'gesto:base', nome: 'Posição base', rota: '/fundamentos/base', atividade: 'goleiro' })
  })

  it('gesto que não existe no aparelho não aparece', () => {
    expect(treinoPorId('gesto:nao-existe')).toBeUndefined()
  })
})
