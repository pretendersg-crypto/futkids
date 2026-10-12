// Painel → plano de casa do atleta (o que os pais montam): a grade com o programa e as trocas dos pais,
// o que a criança já fez em cada dia e, se ela estiver numa escolinha, os treinos da turma (só leitura).
import { useCallback } from 'react'
import { useContaStore } from '../../conta/contaStore'
import { useTurmasStore } from '../../conta/turmasStore'
import { TREINOS_CALENDARIO, treinoDeExtra, treinoDeFundamentos, treinoDeSerie, treinoPorId, type ItemDia } from '../../data/calendarioGoleiros'
import { useProgramaStore } from '../../stores/programaStore'
import { useProgressStore } from '../../stores/progressStore'
import { pontuarTreinador } from '../../stores/treinadorStore'
import { TREINOS_FUNDAMENTOS_INICIAIS, useTreinosFundamentosStore } from '../../stores/treinosFundamentosStore'
import { useTreinosStore } from '../../stores/treinosStore'
import { formatarData } from '../../utils/data'
import { diaDoProgramaOriginal, planoDoDia } from '../agenda/semana'
import { GradePlano, type FichaDeOutroPlano, type GrupoDeTreinos } from './GradePlano'

export function PlanoDeCasa() {
  const programa = useProgramaStore()
  const series = useTreinosStore((s) => s.seriesExtras)
  const fundamentos = useTreinosFundamentosStore((s) => s.treinos)
  const atividadesPorDia = useProgressStore((s) => s.atividadesPorDia)
  const atleta = useContaStore((s) => s.atletaAtivo)
  const planosDaTurma = useTurmasStore((s) => (atleta ? s.porAtleta[atleta] : undefined))

  const grupos: GrupoDeTreinos[] = [
    { titulo: 'Treinos de fundamentos', treinos: fundamentos.map(treinoDeFundamentos) },
    { titulo: 'Treinos criados por você', treinos: series.map(treinoDeSerie) },
    { titulo: 'Vídeos que você adicionou', treinos: programa.extras.map(treinoDeExtra) },
    { titulo: 'Treinos do app e do calendário', treinos: TREINOS_CALENDARIO.filter((t) => t.id !== 'aquecimento') },
  ]

  const itensDo = useCallback(
    (data: string): ItemDia[] => (programa.alteracoes[data] ?? diaDoProgramaOriginal(data, programa)).itens.filter((i) => i.treino !== 'aquecimento'),
    [programa],
  )

  const nomeDe = (id: string) => {
    const t = treinoPorId(id, programa.extras, series, [...fundamentos, ...TREINOS_FUNDAMENTOS_INICIAIS])
    return { emoji: t?.emoji ?? '❔', nome: t?.nome ?? id }
  }

  const estado = (data: string) => {
    const plano = planoDoDia(data, programa)
    if (plano.descanso) return ''
    const feitas = atividadesPorDia[data] ?? []
    const feitos = plano.treinos.filter((t) => feitas.includes(t.atividade)).length
    return feitos === plano.treinos.length ? '✅' : feitos > 0 ? '🟡' : ''
  }

  const outros = (data: string): FichaDeOutroPlano[] =>
    (planosDaTurma ?? []).flatMap((p) =>
      (p.dias[data] ?? []).map((i) => {
        const t = treinoPorId(i.treino, [], [], TREINOS_FUNDAMENTOS_INICIAIS)
        return { emoji: t?.emoji ?? '⚽', nome: t?.nome ?? i.treino, origem: `⚽ ${p.nome}` }
      }),
    )

  return (
    <GradePlano
      grupos={grupos}
      itensDo={itensDo}
      definir={(data, itens) => {
        programa.alterarDia(data, { itens })
        pontuarTreinador('planejarDia', data, `Planejou o dia ${formatarData(data)}`)
      }}
      restaurar={(data) => programa.alterarDia(data, null)}
      alterado={(data) => Boolean(programa.alteracoes[data])}
      estado={estado}
      outros={outros}
      nomeDe={nomeDe}
    />
  )
}
