// Área dos pais (ou treinador): escolher o programa de treinos, ver o mês com o que a criança
// fez, mudar qualquer dia, editar os links dos vídeos e ver os treinos de academia do calendário.
import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { ACADEMIA, OBSERVACOES_CALENDARIO, PROGRAMA_GOLEIROS, TREINOS_CALENDARIO, treinoPorId } from '../../../data/calendarioGoleiros'
import { useProgramaStore } from '../../../stores/programaStore'
import { useProgressStore } from '../../../stores/progressStore'
import { formatarData, hojeISO, somarDias } from '../../../utils/data'
import { linkSeguro } from '../../../utils/link'
import { LinkVideo } from '../BotaoVideo'
import { descreverPosicao, LETRAS_DIAS, planoDoDia } from '../semana'
import { EditorDia } from './EditorDia'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

/** Dias (AAAA-MM-DD) do mês, com casas vazias antes do dia 1 para alinhar no domingo */
function casasDoMes(ano: number, mes: number): (string | null)[] {
  const primeiro = new Date(Date.UTC(ano, mes, 1))
  const total = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
  const inicio = primeiro.toISOString().slice(0, 10)
  return [...Array<null>(primeiro.getUTCDay()).fill(null), ...Array.from({ length: total }, (_, i) => somarDias(inicio, i))]
}

export function AreaPais({ aoSair }: { aoSair: () => void }) {
  const programa = useProgramaStore()
  const atividadesPorDia = useProgressStore((s) => s.atividadesPorDia)
  const hoje = hojeISO()
  const [mes, setMes] = useState(() => ({ ano: Number(hoje.slice(0, 4)), mes: Number(hoje.slice(5, 7)) - 1 }))
  const [editando, setEditando] = useState<string | null>(null)

  const andarMes = (passo: number) => setMes(({ ano, mes: m }) => ({ ano: ano + Math.floor((m + passo) / 12), mes: (((m + passo) % 12) + 12) % 12 }))

  return (
    <div className="flex flex-col gap-5">
      {/* Programa */}
      <section className="flex flex-col gap-2 rounded-3xl border-4 border-violet-200 bg-white p-3">
        <h2 className="text-xl font-extrabold">📋 Programa de treinos</h2>
        {(
          [
            ['goleiros', `Calendário de goleiros (pré-temporada, ${PROGRAMA_GOLEIROS.length} dias, com os vídeos)`],
            ['infantil', 'Plano infantil do app (4 semanas que se repetem)'],
          ] as const
        ).map(([id, texto]) => (
          <label key={id} className="flex min-h-12 items-center gap-3 text-base font-bold">
            <input type="radio" name="programa" checked={programa.ativo === id} onChange={() => programa.configurar({ ativo: id })} className="size-6 accent-violet-600" />
            {texto}
          </label>
        ))}
        {programa.ativo === 'goleiros' && (
          <div className="flex flex-col gap-2 rounded-2xl bg-violet-50 p-2">
            <label className="flex items-center justify-between gap-2 text-base font-bold">
              Dia 1 do calendário
              <input
                type="date"
                value={programa.inicio}
                onChange={(e) => e.target.value && programa.configurar({ inicio: e.target.value })}
                className="min-h-11 rounded-xl border-2 border-violet-200 px-2"
              />
            </label>
            <p className="text-sm">No PDF, o dia 1 é um domingo.</p>
            <label className="flex min-h-11 items-center gap-3 text-base font-bold">
              <input type="checkbox" checked={programa.repetir} onChange={(e) => programa.configurar({ repetir: e.target.checked })} className="size-6 accent-violet-600" />
              Começar de novo quando acabar
            </label>
          </div>
        )}
        <p className="text-sm font-bold">Hoje: {descreverPosicao(hoje, programa)}</p>
      </section>

      {/* Mês */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Mês anterior" onClick={() => andarMes(-1)} className="grid size-12 place-items-center rounded-full bg-white text-xl shadow">
            ◀
          </button>
          <h2 className="text-xl font-extrabold">
            {MESES[mes.mes]} {mes.ano}
          </h2>
          <button type="button" aria-label="Próximo mês" onClick={() => andarMes(1)} className="grid size-12 place-items-center rounded-full bg-white text-xl shadow">
            ▶
          </button>
        </div>
        <p className="text-sm">Toque num dia para mudar. ✅ fez tudo · 🟡 fez uma parte · ✏️ mudado pelos pais</p>
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`Agenda de ${MESES[mes.mes]}`}>
          {LETRAS_DIAS.map((l, i) => (
            <span key={i} aria-hidden className="text-center text-xs font-black">
              {l}
            </span>
          ))}
          {casasDoMes(mes.ano, mes.mes).map((dia, i) => {
            if (!dia) return <span key={`v${i}`} />
            const plano = planoDoDia(dia, programa)
            const feitas = atividadesPorDia[dia] ?? []
            const feitos = plano.treinos.filter((t) => feitas.includes(t.atividade)).length
            const estado = plano.descanso ? '' : feitos === plano.treinos.length ? '✅' : feitos > 0 ? '🟡' : ''
            // O treino principal (o 1º é o aquecimento automático)
            const principal = plano.treinos[1] ?? plano.treinos[0]
            return (
              <button
                key={dia}
                type="button"
                onClick={() => setEditando(dia)}
                aria-label={`${formatarData(dia)}: ${plano.descanso ? 'descanso' : plano.treinos.map((t) => t.titulo).join(', ')}${estado === '✅' ? ', feito' : ''}${plano.alterado ? ', mudado pelos pais' : ''}`}
                className={`relative flex min-h-16 flex-col items-center rounded-xl border-2 p-0.5 text-xs leading-tight ${
                  dia === hoje ? 'border-violet-600 bg-violet-100' : plano.alterado ? 'border-amber-400 bg-amber-50' : 'border-violet-100 bg-white'
                }`}
              >
                <span className="font-black">{Number(dia.slice(8))}</span>
                <span aria-hidden className="text-lg">
                  {plano.descanso ? '😴' : principal?.emoji}
                </span>
                <span aria-hidden className="w-full truncate text-[0.6rem]">
                  {plano.descanso ? '' : principal?.titulo}
                </span>
                {(estado || plano.alterado) && (
                  <span aria-hidden className="absolute -top-1 -right-1 text-xs">
                    {estado}
                    {plano.alterado ? '✏️' : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Avisos do calendário */}
      <section className="flex flex-col gap-2 rounded-3xl border-4 border-red-200 bg-white p-3">
        <h2 className="text-xl font-extrabold text-red-700">⚠️ Atenção (do calendário)</h2>
        {OBSERVACOES_CALENDARIO.map((o) => {
          const t = treinoPorId(o.treino)
          const url = programa.videos[o.treino] ?? t?.videoUrl
          return (
            <div key={o.titulo} className="flex flex-col gap-1">
              <p className="text-base">
                <b>{o.titulo}:</b> {o.texto}
              </p>
              {url && <LinkVideo url={url} titulo={o.titulo} className="self-start text-sm" />}
            </div>
          )
        })}
      </section>

      <VideosDosTreinos />

      {/* Academia */}
      <section className="flex flex-col gap-2 rounded-3xl border-4 border-sky-200 bg-white p-3">
        <h2 className="text-xl font-extrabold">🏋️ Academia (do calendário)</h2>
        <p className="rounded-2xl bg-red-50 p-2 text-sm font-bold text-red-800">{ACADEMIA.aviso}</p>
        <p className="text-sm">{ACADEMIA.finalDoTreino}</p>
        {ACADEMIA.aulas.map((a) => (
          <LinkVideo key={a.url} url={a.url} titulo={a.nome} className="text-sm" />
        ))}
      </section>

      <button type="button" onClick={aoSair} className="min-h-14 rounded-2xl border-4 border-violet-200 bg-white text-lg font-extrabold">
        🔒 Sair da área dos pais
      </button>

      <Modal aberto={!!editando} aoFechar={() => setEditando(null)} titulo="✏️ Mudar o dia">
        {editando && <EditorDia key={editando} data={editando} aoFechar={() => setEditando(null)} />}
      </Modal>
    </div>
  )
}

/** Link do vídeo de cada treino: os pais podem trocar (ex.: quando o treinador mandar outro) */
function VideosDosTreinos() {
  const programa = useProgramaStore()
  const [rascunho, setRascunho] = useState<Record<string, string>>({})
  const [erro, setErro] = useState<string | null>(null)
  const comVideo = TREINOS_CALENDARIO.filter((t) => t.videoUrl || programa.videos[t.id])

  return (
    <section className="flex flex-col gap-2 rounded-3xl border-4 border-violet-200 bg-white p-3">
      <h2 className="text-xl font-extrabold">🎬 Vídeos dos treinos</h2>
      <p className="text-sm">Os vídeos abrem fora do app. Depois, cada um vai virar uma animação do bonequinho dentro do app.</p>
      {comVideo.map((t) => {
        const atual = programa.videos[t.id] ?? t.videoUrl ?? ''
        const valor = rascunho[t.id] ?? atual
        const mudou = valor !== atual
        return (
          <div key={t.id} className="flex flex-col gap-1 border-b-2 border-violet-50 pb-2">
            <p className="font-bold">
              {t.emoji} {t.nome} {programa.videos[t.id] && <span className="text-xs font-bold text-amber-700">(link trocado)</span>}
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={valor}
                aria-label={`Link do vídeo de ${t.nome}`}
                onChange={(e) => {
                  setErro(null)
                  setRascunho((r) => ({ ...r, [t.id]: e.target.value }))
                }}
                className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-violet-200 px-2 text-sm"
              />
              {mudou ? (
                <button
                  type="button"
                  onClick={() => {
                    const seguro = linkSeguro(valor)
                    if (!seguro) return setErro(t.id)
                    programa.alterarVideo(t.id, seguro === t.videoUrl ? null : seguro)
                    setRascunho((r) => {
                      const resto = { ...r }
                      delete resto[t.id]
                      return resto
                    })
                  }}
                  className="min-h-11 rounded-xl bg-violet-600 px-3 font-bold text-white"
                >
                  Salvar
                </button>
              ) : (
                atual && <LinkVideo url={atual} titulo="" className="min-h-11 px-3 text-sm" />
              )}
            </div>
            {erro === t.id && <p className="text-sm font-bold text-red-700">❌ O link precisa começar com https://</p>}
            {programa.videos[t.id] && t.videoUrl && (
              <button type="button" onClick={() => programa.alterarVideo(t.id, null)} className="self-start text-sm font-bold underline">
                Voltar ao vídeo original
              </button>
            )}
          </div>
        )
      })}
    </section>
  )
}
