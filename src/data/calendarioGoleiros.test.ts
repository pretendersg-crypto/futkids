import { describe, expect, it } from 'vitest'
import { idDeCircuito, idDeGesto, treinoPorId } from './calendarioGoleiros'

describe('gesto técnico no plano', () => {
  it('um gesto do app vira treino que abre a aula dele e conta como goleiro', () => {
    const t = treinoPorId(idDeGesto('base'))
    expect(t).toMatchObject({ id: 'gesto:base', nome: 'Posição base', rota: '/fundamentos/base', atividade: 'goleiro' })
  })

  it('gesto que não existe no aparelho não aparece', () => {
    expect(treinoPorId('gesto:nao-existe')).toBeUndefined()
  })
})

describe('circuito com cones no plano', () => {
  it('um circuito do app vira treino que abre o circuito e conta como goleiro', () => {
    expect(treinoPorId(idDeCircuito('saida-em-v'))).toMatchObject({ nome: 'Saída em V', rota: '/goleiro/saida/saida-em-v', atividade: 'goleiro' })
  })
  it('circuito que não existe neste aparelho não aparece', () => {
    expect(treinoPorId('circuito:nao-existe')).toBeUndefined()
  })
})
