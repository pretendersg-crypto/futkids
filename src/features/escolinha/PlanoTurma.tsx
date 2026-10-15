// Plano da turma (treinador): os próximos 14 dias, cada um com os treinos do app (calendário,
// séries e treinos de fundamentos prontos) e um link de vídeo opcional. Chega na agenda de cada
// atleta da turma, marcado "⚽ <turma>".
import { useEffect, useState } from 'react'
import { TREINOS_CALENDARIO, treinoDeCircuito, treinoDeFundamentos, treinoDeGesto, treinoPorId, type ItemDia } from '../../data/calendarioGoleiros'
import { CIRCUITOS } from '../saidaGol/circuitos'
import { GESTOS_PRONTOS } from '../saidaGol/gestos'
import { TREINOS_FUNDAMENTOS_INICIAIS } from '../../stores/treinosFundamentosStore'
import { formatarData, hojeISO, somarDias, diaDaSemana } from '../../utils/data'
import { linkSeguro } from '../../utils/link'
import { NOMES_DIAS } from '../agenda/semana'
import { BOTAO, useAcao } from '../conta/acao'
import { MensagemErro } from '../conta/comum'

type Dias = Record<string, ItemDia[]>

const OPCOES = [
  ...TREINOS_CALENDARIO.filter((t) => t.id !== 'aquecimento'),
  ...TREINOS_FUNDAMENTOS_INICIAIS.map(treinoDeFundamentos),
  ...GESTOS_PRONTOS.map(treinoDeGesto),
  ...CIRCUITOS.map(treinoDeCircuito),
]
const nomeDe = (id: string) => {
  const t = treinoPorId(id, [], [], TREINOS_FUNDAMENTOS_INICIAIS)
  return t ? `${t.emoji} ${t.nome}` : id
}

interface Props {
  carregar: () => Promise<Dias>
  salvar: (dias: Dias) => Promise<void>
}

export function PlanoTurma({ carregar, salvar }: Props) {
  const [dias, setDias] = useState<Dias | null>(null)
  const [mudou, setMudou] = useState(false)
  const { ocupado, erro, rodar } = useAcao()
  const hoje = hojeISO()
  const datas = Array.from({ length: 14 }, (_, i) => somarDias(hoje, i))

  useEffect(() => {
    let vivo = true
    carregar()
      .then((d) => vivo && setDias(d))
      .catch(() => vivo && setDias({}))
    return () => {
      vivo = false
    }
  }, [carregar])

  if (!dias) return <p>Carregando o plano…</p>
  const atual = dias

  const mudar = (data: string, itens: ItemDia[]) => {
    setDias({ ...atual, [data]: itens })
    setMudou(true)
  }

  function copiarSemana() {
    // Os 7 primeiros dias vão também para os 7 seguintes
    const novos = { ...atual }
    for (let i = 0; i < 7; i++) novos[somarDias(hoje, i + 7)] = [...(atual[somarDias(hoje, i)] ?? [])]
    setDias(novos)
    setMudou(true)
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {datas.map((data) => (
          <DiaDoPlano key={data} data={data} itens={dias[data] ?? []} aoMudar={(itens) => mudar(data, itens)} />
        ))}
      </ul>
      <button type="button" onClick={copiarSemana} className={`${BOTAO} bg-white`}>
        🔁 Repetir esta semana na próxima
      </button>
      <MensagemErro erro={erro} />
      <button
        type="button"
        disabled={!mudou || ocupado}
        onClick={() =>
          rodar(async () => {
            for (const itens of Object.values(dias)) {
              if (itens.some((i) => i.video && !linkSeguro(i.video))) throw new Error('Algum link de vídeo não começa com http:// ou https://')
            }
            await salvar(dias)
            setMudou(false)
          })
        }
        className={`${BOTAO} sticky bottom-2 bg-sol`}
      >
        {ocupado ? 'Salvando…' : mudou ? '💾 Salvar o plano da turma' : '✅ Plano salvo'}
      </button>
    </div>
  )
}

function DiaDoPlano({ data, itens, aoMudar }: { data: string; itens: ItemDia[]; aoMudar: (itens: ItemDia[]) => void }) {
  const [novo, setNovo] = useState('')
  return (
    <li className="flex flex-col gap-2 rounded-2xl bg-white p-2">
      <p className="font-extrabold">
        {NOMES_DIAS[diaDaSemana(data)]}, {formatarData(data)}
        {itens.length === 0 && <span className="font-normal"> · sem treino da turma</span>}
      </p>
      {itens.map((item, i) => (
        <div key={`${item.treino}-${i}`} className="flex flex-col gap-1 rounded-xl border-2 border-sky-100 p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold">{nomeDe(item.treino)}</span>
            <button type="button" onClick={() => aoMudar(itens.filter((_, j) => j !== i))} aria-label="Tirar treino" className="rounded-full px-2 text-xl">
              ✖️
            </button>
          </div>
          <input
            type="url"
            inputMode="url"
            value={item.video ?? ''}
            placeholder="Link de vídeo (opcional)"
            onChange={(e) => aoMudar(itens.map((x, j) => (j === i ? { ...x, video: e.target.value || undefined } : x)))}
            className="min-h-10 rounded-lg border-2 border-sky-100 px-2 text-sm"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <select value={novo} onChange={(e) => setNovo(e.target.value)} aria-label="Treino para incluir" className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-sky-200 bg-white px-2">
          <option value="">Incluir treino…</option>
          {OPCOES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.emoji} {t.nome}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!novo}
          onClick={() => {
            aoMudar([...itens, { treino: novo }])
            setNovo('')
          }}
          className={`${BOTAO} bg-sky-600 text-white`}
        >
          Incluir
        </button>
      </div>
    </li>
  )
}
