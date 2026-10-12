// Painel → plano da turma (treinador): escolhe a turma, monta na grade e salva na nuvem. Só treinos do
// app (os criados em casa pelas famílias não existem para a turma).
import { useCallback, useEffect, useState } from 'react'
import { TREINOS_CALENDARIO, treinoDeFundamentos, treinoPorId, type ItemDia } from '../../data/calendarioGoleiros'
import type { DadosEscolinha, DiasDaTurma } from '../../conta/nuvemEscolinha'
import { TREINOS_FUNDAMENTOS_INICIAIS } from '../../stores/treinosFundamentosStore'
import { BOTAO, useAcao } from '../conta/acao'
import { MensagemErro } from '../conta/comum'
import { GradePlano, type GrupoDeTreinos } from './GradePlano'

const nuvem = () => import('../../conta/nuvemEscolinha')

const GRUPOS: GrupoDeTreinos[] = [
  { titulo: 'Treinos de fundamentos', treinos: TREINOS_FUNDAMENTOS_INICIAIS.map(treinoDeFundamentos) },
  { titulo: 'Treinos do app e do calendário', treinos: TREINOS_CALENDARIO.filter((t) => t.id !== 'aquecimento') },
]

const nomeDe = (id: string) => {
  const t = treinoPorId(id, [], [], TREINOS_FUNDAMENTOS_INICIAIS)
  return { emoji: t?.emoji ?? '❔', nome: t?.nome ?? id }
}

export function PlanoDaTurmaGrade({ escolinha }: { escolinha: string }) {
  const [esc, setEsc] = useState<DadosEscolinha | null>(null)
  const [turma, setTurma] = useState<string | null>(null)
  const [dias, setDias] = useState<DiasDaTurma | null>(null)
  const [mudou, setMudou] = useState(false)
  const { ocupado, erro, rodar } = useAcao()

  useEffect(() => {
    let vivo = true
    nuvem()
      .then((n) => n.lerEscolinha(escolinha))
      .then((d) => {
        if (!vivo) return
        setEsc(d)
        setTurma((t) => t ?? d.turmas[0]?.id ?? null)
      })
      .catch(() => undefined)
    return () => {
      vivo = false
    }
  }, [escolinha])

  useEffect(() => {
    if (!turma) return
    let vivo = true
    nuvem()
      .then((n) => n.lerPlanoTurma(escolinha, turma))
      .then((d) => {
        if (!vivo) return
        setDias(d)
        setMudou(false)
      })
      .catch(() => vivo && setDias({}))
    return () => {
      vivo = false
    }
  }, [escolinha, turma])

  // Sair com mudanças sem salvar: o navegador pergunta antes
  useEffect(() => {
    if (!mudou) return
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [mudou])

  const itensDo = useCallback((data: string): ItemDia[] => dias?.[data] ?? [], [dias])

  if (!esc) return <p>Carregando a escolinha…</p>
  if (esc.turmas.length === 0) return <p>Crie uma turma na Área do treinador primeiro.</p>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-lg font-extrabold">
          ⚽ Turma
          <select
            value={turma ?? ''}
            onChange={(e) => {
              if (mudou && !confirm('Há mudanças sem salvar nesta turma. Trocar mesmo assim?')) return
              setDias(null)
              setTurma(e.target.value)
            }}
            className="rounded-xl border-2 border-sky-300 bg-white px-3 py-1.5"
          >
            {esc.turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!mudou || ocupado || !turma || !dias}
          onClick={() =>
            rodar(async () => {
              await (await nuvem()).salvarPlanoTurma(escolinha, turma!, dias!)
              setMudou(false)
            })
          }
          className={`${BOTAO} ml-auto ${mudou ? 'bg-sol' : 'bg-white'}`}
        >
          {ocupado ? 'Salvando…' : mudou ? '💾 Salvar o plano da turma' : '✅ Plano salvo'}
        </button>
      </div>
      <MensagemErro erro={erro} />
      {!dias ? (
        <p>Carregando o plano…</p>
      ) : (
        <GradePlano
          grupos={GRUPOS}
          itensDo={itensDo}
          definir={(data, itens) => {
            setDias((d) => ({ ...(d ?? {}), [data]: itens }))
            setMudou(true)
          }}
          nomeDe={nomeDe}
          vazio="Sem treino da turma"
        />
      )}
    </div>
  )
}
