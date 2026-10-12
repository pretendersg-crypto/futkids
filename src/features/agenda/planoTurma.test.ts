import { beforeEach, describe, expect, it } from 'vitest'
import { useContaStore } from '../../conta/contaStore'
import { useTurmasStore } from '../../conta/turmasStore'
import { useProgramaStore } from '../../stores/programaStore'
import { planoDoDia } from './semana'

const DIA = '2026-11-10'

beforeEach(() => {
  useContaStore.setState({ atletaAtivo: 'a1' })
  useTurmasStore.setState({
    porAtleta: {
      a1: [{ turma: 't1', nome: 'Sub-9', escolinha: 'Bom de Bola', dias: { [DIA]: [{ treino: 'fund:basicos' }, { treino: 'alongamento', video: 'https://youtu.be/x' }] } }],
    },
  })
})

describe('plano da turma na agenda', () => {
  it('junta turma e casa, marca a origem, põe o aquecimento antes e não repete treino', () => {
    const cfg = { ...useProgramaStore.getState(), alteracoes: { [DIA]: { itens: [{ treino: 'alongamento' }, { treino: 'forca' }] } } }
    const { treinos, descanso } = planoDoDia(DIA, cfg)
    expect(descanso).toBe(false)
    expect(treinos.map((t) => t.id)).toEqual(['aquecimento', 'fund:basicos', 'alongamento', 'forca'])
    expect(treinos.find((t) => t.id === 'fund:basicos')?.origem).toBe('⚽ Sub-9')
    // o alongamento estava nos dois: vale o da turma (com o vídeo do treinador)
    expect(treinos.find((t) => t.id === 'alongamento')).toMatchObject({ origem: '⚽ Sub-9', video: 'https://youtu.be/x' })
    expect(treinos.find((t) => t.id === 'forca')?.origem).toBe('🏠 Casa')
  })

  it('dia de descanso em casa ainda tem o treino da turma', () => {
    const cfg = { ...useProgramaStore.getState(), alteracoes: { [DIA]: { itens: [] } } }
    expect(planoDoDia(DIA, cfg).treinos.map((t) => t.id)).toEqual(['aquecimento', 'fund:basicos', 'alongamento'])
  })

  it('plano individual do treinador aparece como "Para você", junto com o da turma', () => {
    useTurmasStore.setState({
      porAtleta: {
        a1: [
          { turma: 't1', nome: 'Sub-9', escolinha: 'Bom de Bola', dias: { [DIA]: [{ treino: 'fund:basicos' }] } },
          { turma: 't1', nome: 'Para você', escolinha: 'Bom de Bola', individual: true, dias: { [DIA]: [{ treino: 'fund:quedas-desvios' }] } },
        ],
      },
    })
    const cfg = { ...useProgramaStore.getState(), alteracoes: { [DIA]: { itens: [] } } }
    const treinos = planoDoDia(DIA, cfg).treinos
    expect(treinos.map((t) => [t.id, t.origem])).toEqual([
      ['aquecimento', undefined],
      ['fund:basicos', '⚽ Sub-9'],
      ['fund:quedas-desvios', '⚽ Para você'],
    ])
  })

  it('sem escolinha nada muda (e não aparece a origem)', () => {
    useTurmasStore.setState({ porAtleta: {} })
    const cfg = { ...useProgramaStore.getState(), alteracoes: { [DIA]: { itens: [{ treino: 'forca' }] } } }
    const treinos = planoDoDia(DIA, cfg).treinos
    expect(treinos.map((t) => t.id)).toEqual(['aquecimento', 'forca'])
    expect(treinos.every((t) => t.origem === undefined)).toBe(true)
  })
})
