// Editor de uma data da agenda (área dos pais): trocar, tirar ou incluir treinos, mudar o vídeo
// só daquele dia, marcar descanso ou voltar ao que o programa diz.
import { useState } from 'react'
import { TREINOS_CALENDARIO, treinoPorId, type ItemDia } from '../../../data/calendarioGoleiros'
import { useProgramaStore } from '../../../stores/programaStore'
import { diaDaSemana, formatarData } from '../../../utils/data'
import { linkSeguro } from '../../../utils/link'
import { LinkVideo } from '../BotaoVideo'
import { diaDoProgramaOriginal, NOMES_DIAS } from '../semana'

interface Props {
  data: string
  aoFechar: () => void
}

export function EditorDia({ data, aoFechar }: Props) {
  const programa = useProgramaStore()
  const original = diaDoProgramaOriginal(data, programa)
  const [itens, setItens] = useState<ItemDia[]>(() => (programa.alteracoes[data] ?? original).itens.filter((i) => i.treino !== 'aquecimento'))
  const [novo, setNovo] = useState('')
  const [erro, setErro] = useState('')

  const nomeOriginal = original.itens.length ? original.itens.map((i) => treinoPorId(i.treino)?.nome ?? i.treino).join(' + ') : 'Descanso'
  const opcoes = TREINOS_CALENDARIO.filter((t) => t.id !== 'aquecimento')

  function salvar(lista: ItemDia[]) {
    for (const i of lista) {
      if (i.video && !linkSeguro(i.video)) return setErro('Algum link de vídeo não começa com http:// ou https://')
    }
    programa.alterarDia(data, { itens: lista.map((i) => ({ treino: i.treino, ...(i.video ? { video: linkSeguro(i.video)! } : {}) })) })
    aoFechar()
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base">
        <b>
          {NOMES_DIAS[diaDaSemana(data)]}, {formatarData(data)}
        </b>
        <br />
        No programa: {nomeOriginal}
      </p>
      <p className="text-sm">🔥 O aquecimento entra sozinho antes de qualquer treino.</p>

      {itens.length === 0 && <p className="rounded-2xl bg-violet-50 p-3 text-lg font-bold">😴 Dia de descanso</p>}
      <ul className="flex flex-col gap-2">
        {itens.map((item, i) => {
          const t = treinoPorId(item.treino)
          const videoPadrao = programa.videos[item.treino] ?? t?.videoUrl
          return (
            <li key={`${item.treino}-${i}`} className="flex flex-col gap-2 rounded-2xl border-4 border-violet-200 p-2">
              <div className="flex items-center gap-2">
                <span aria-hidden className="text-2xl">
                  {t?.emoji}
                </span>
                <span className="flex-1 font-bold">{t?.nome ?? item.treino}</span>
                <button
                  type="button"
                  aria-label={`Tirar ${t?.nome}`}
                  onClick={() => setItens((l) => l.filter((_, k) => k !== i))}
                  className="grid size-10 place-items-center rounded-full bg-red-50 text-lg"
                >
                  ✖️
                </button>
              </div>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Vídeo só deste dia (opcional)
                <input
                  type="url"
                  value={item.video ?? ''}
                  placeholder={videoPadrao ?? 'sem vídeo'}
                  onChange={(e) => {
                    setErro('')
                    setItens((l) => l.map((x, k) => (k === i ? { ...x, video: e.target.value || undefined } : x)))
                  }}
                  className="min-h-11 rounded-xl border-2 border-violet-200 px-2 text-sm"
                />
              </label>
              {(item.video || videoPadrao) && <LinkVideo url={item.video || videoPadrao!} titulo="Ver vídeo" className="self-start text-sm" />}
            </li>
          )
        })}
      </ul>

      <div className="flex gap-2">
        <select
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          aria-label="Treino para incluir"
          className="min-h-12 flex-1 rounded-xl border-2 border-violet-200 bg-white px-2 text-base"
        >
          <option value="">Incluir treino…</option>
          {opcoes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.emoji} {t.nome}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!novo}
          onClick={() => {
            setItens((l) => [...l, { treino: novo }])
            setNovo('')
          }}
          className="min-h-12 rounded-xl bg-violet-600 px-4 font-extrabold text-white disabled:opacity-40"
        >
          Incluir
        </button>
      </div>

      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}
      <button type="button" onClick={() => salvar(itens)} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
        Salvar este dia ✅
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => salvar([])} className="min-h-12 rounded-2xl border-4 border-violet-200 bg-white font-bold">
          😴 Descanso
        </button>
        <button
          type="button"
          disabled={!programa.alteracoes[data]}
          onClick={() => {
            programa.alterarDia(data, null)
            aoFechar()
          }}
          className="min-h-12 rounded-2xl border-4 border-violet-200 bg-white font-bold disabled:opacity-40"
        >
          ↩️ Voltar ao programa
        </button>
      </div>
    </div>
  )
}
