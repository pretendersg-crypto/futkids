// Grade de planejamento para computador: semanas em 7 colunas (domingo a sábado), cada dia com os
// treinos em "fichas", e a biblioteca de treinos ao lado. Arrastar da biblioteca para o dia inclui;
// arrastar uma ficha para outro dia move; ✕ tira; clicar num treino da biblioteca e depois no "+"
// de um dia também inclui. Serve para o plano de casa (pais) e o plano da turma (treinador).
import { useMemo, useState, type DragEvent } from 'react'
import type { ItemDia, TreinoCalendario } from '../../data/calendarioGoleiros'
import { diaDaSemana, formatarData, hojeISO, somarDias } from '../../utils/data'
import { linkSeguro } from '../../utils/link'
import { caminhoDoVideo, ehVideoDoApp, referenciaDoVideo } from '../../conta/videoDoApp'
import { NOMES_DIAS } from '../agenda/semana'

export interface GrupoDeTreinos {
  titulo: string
  treinos: TreinoCalendario[]
}

/** Ficha só para mostrar (ex.: o treino da turma na grade do plano de casa) */
export interface FichaDeOutroPlano {
  emoji: string
  nome: string
  origem: string
}

interface Props {
  grupos: GrupoDeTreinos[]
  /** Treinos do dia (sem o aquecimento automático) */
  itensDo: (data: string) => ItemDia[]
  definir: (data: string, itens: ItemDia[]) => void
  /** Volta o dia ao programa (só no plano de casa) */
  restaurar?: (data: string) => void
  alterado?: (data: string) => boolean
  /** ✅ fez tudo · 🟡 fez parte · '' */
  estado?: (data: string) => string
  /** Fichas de outro plano no mesmo dia (só leitura) */
  outros?: (data: string) => FichaDeOutroPlano[]
  nomeDe: (id: string) => { emoji: string; nome: string }
  /** Texto no dia sem treino */
  vazio?: string
  /** Vídeos enviados pelo treinador, para pendurar num treino do dia */
  videos?: { caminho: string; titulo: string }[]
}

const TIPO_DRAG = 'application/x-futkids'
type Arrasto = { tipo: 'novo'; treino: string } | { tipo: 'mover'; de: string; indice: number }

export function GradePlano({ grupos, itensDo, definir, restaurar, alterado, estado, outros, nomeDe, vazio = 'Descanso', videos = [] }: Props) {
  const hoje = hojeISO()
  const [inicio, setInicio] = useState(() => somarDias(hoje, -diaDaSemana(hoje)))
  const [semanas, setSemanas] = useState(4)
  const [busca, setBusca] = useState('')
  const [escolhido, setEscolhido] = useState<string | null>(null)
  const [sobre, setSobre] = useState<string | null>(null)
  const [videoDe, setVideoDe] = useState<{ data: string; indice: number } | null>(null)

  const linhas = Array.from({ length: semanas }, (_, s) => Array.from({ length: 7 }, (_, d) => somarDias(inicio, s * 7 + d)))
  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return grupos
      .map((g) => ({ ...g, treinos: t ? g.treinos.filter((x) => x.nome.toLowerCase().includes(t)) : g.treinos }))
      .filter((g) => g.treinos.length > 0)
  }, [grupos, busca])

  function incluir(data: string, treino: string) {
    definir(data, [...itensDo(data), { treino }])
  }

  function soltar(e: DragEvent, data: string) {
    e.preventDefault()
    setSobre(null)
    let a: Arrasto
    try {
      a = JSON.parse(e.dataTransfer.getData(TIPO_DRAG)) as Arrasto
    } catch {
      return
    }
    if (a.tipo === 'novo') return incluir(data, a.treino)
    if (a.de === data) return
    const origem = itensDo(a.de)
    const item = origem[a.indice]
    if (!item) return
    definir(a.de, origem.filter((_, i) => i !== a.indice))
    definir(data, [...itensDo(data), item])
  }

  const arrastar = (e: DragEvent, a: Arrasto) => {
    e.dataTransfer.setData(TIPO_DRAG, JSON.stringify(a))
    e.dataTransfer.effectAllowed = a.tipo === 'novo' ? 'copy' : 'move'
  }

  function copiarSemana(semana: string[]) {
    for (const data of semana) definir(somarDias(data, 7), itensDo(data))
  }

  function limparSemana(semana: string[]) {
    for (const data of semana) definir(data, [])
  }

  const editando = videoDe ? itensDo(videoDe.data)[videoDe.indice] : null

  return (
    <div className="flex min-h-0 gap-4">
      {/* Grade */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setInicio(somarDias(inicio, -7))} className="rounded-xl bg-white px-3 py-2 font-bold shadow">
            ◀ Semana anterior
          </button>
          <button type="button" onClick={() => setInicio(somarDias(hoje, -diaDaSemana(hoje)))} className="rounded-xl bg-white px-3 py-2 font-bold shadow">
            Hoje
          </button>
          <button type="button" onClick={() => setInicio(somarDias(inicio, 7))} className="rounded-xl bg-white px-3 py-2 font-bold shadow">
            Próxima semana ▶
          </button>
          <label className="ml-auto flex items-center gap-2 font-bold">
            Mostrar
            <select value={semanas} onChange={(e) => setSemanas(Number(e.target.value))} className="rounded-xl border-2 border-violet-200 bg-white px-2 py-1">
              {[1, 2, 4, 6].map((n) => (
                <option key={n} value={n}>
                  {n} semana{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm font-black text-slate-600">
          {NOMES_DIAS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {linhas.map((semana) => (
          <div key={semana[0]} className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-slate-600">
                Semana de {formatarData(semana[0])} a {formatarData(semana[6])}
              </span>
              <button type="button" onClick={() => copiarSemana(semana)} className="font-bold text-violet-700 underline">
                Copiar para a semana seguinte
              </button>
              <button type="button" onClick={() => limparSemana(semana)} className="font-bold text-red-700 underline">
                Limpar a semana
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {semana.map((data) => {
                const itens = itensDo(data)
                const deOutro = outros?.(data) ?? []
                const mudou = alterado?.(data) ?? false
                const feito = estado?.(data) ?? ''
                return (
                  <div
                    key={data}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setSobre(data)
                    }}
                    onDragLeave={() => setSobre((s) => (s === data ? null : s))}
                    onDrop={(e) => soltar(e, data)}
                    className={`flex min-h-36 flex-col gap-1 rounded-2xl border-2 p-1.5 transition-colors ${
                      sobre === data ? 'border-violet-600 bg-violet-100' : data === hoje ? 'border-violet-500 bg-violet-50' : mudou ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
                    } ${data < hoje ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-black">{formatarData(data).slice(0, 5)}</span>
                      {feito && <span title="O que a criança fez">{feito}</span>}
                      {mudou && restaurar && (
                        <button type="button" onClick={() => restaurar(data)} title="Voltar ao que o programa diz" className="ml-auto font-bold text-amber-700">
                          ↩ programa
                        </button>
                      )}
                    </div>
                    {deOutro.map((f, i) => (
                      <span key={`o${i}`} title={f.origem} className="truncate rounded-lg bg-sky-100 px-1.5 py-1 text-left text-xs">
                        {f.emoji} {f.nome} <span className="font-bold">{f.origem}</span>
                      </span>
                    ))}
                    {itens.length === 0 && deOutro.length === 0 && <span className="text-xs text-slate-500">😴 {vazio}</span>}
                    {itens.map((item, i) => {
                      const t = nomeDe(item.treino)
                      return (
                        <div
                          key={`${item.treino}-${i}`}
                          draggable
                          onDragStart={(e) => arrastar(e, { tipo: 'mover', de: data, indice: i })}
                          title={`${t.nome} (arraste para outro dia)`}
                          className="group relative flex cursor-grab items-start gap-1 rounded-lg border border-violet-200 bg-violet-50 px-1.5 py-1 text-left text-xs active:cursor-grabbing"
                        >
                          <span aria-hidden>{t.emoji}</span>
                          <span className="line-clamp-2 min-w-0 flex-1 leading-tight font-bold break-words">{t.nome}</span>
                          {item.video && (
                            <span aria-label="Com vídeo só deste dia" className="group-hover:hidden">
                              🎬
                            </span>
                          )}
                          {/* Ações aparecem ao passar o mouse (ou ao focar com o teclado) */}
                          <span className="absolute top-0.5 right-0.5 hidden gap-0.5 rounded-md bg-white/95 px-0.5 shadow group-focus-within:flex group-hover:flex">
                            <button type="button" onClick={() => setVideoDe({ data, indice: i })} title="Vídeo só deste dia" aria-label={`Vídeo de ${t.nome} neste dia`}>
                              🎬
                            </button>
                            <button type="button" onClick={() => definir(data, itens.filter((_, k) => k !== i))} title="Tirar" aria-label={`Tirar ${t.nome}`} className="px-0.5 font-black text-red-600">
                              ✕
                            </button>
                          </span>
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      disabled={!escolhido}
                      onClick={() => escolhido && incluir(data, escolhido)}
                      title={escolhido ? `Incluir ${nomeDe(escolhido).nome}` : 'Escolha um treino na biblioteca ou arraste para cá'}
                      className="mt-auto rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 enabled:hover:border-violet-500 enabled:hover:text-violet-700 disabled:cursor-default"
                    >
                      {escolhido ? `+ ${nomeDe(escolhido).nome}` : '+ arraste um treino'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Biblioteca */}
      <aside className="sticky top-4 flex max-h-[calc(100dvh-8rem)] w-72 shrink-0 flex-col gap-2 overflow-hidden rounded-3xl border-2 border-violet-200 bg-white p-3">
        <h3 className="text-lg font-extrabold">📚 Treinos</h3>
        <p className="text-xs">Arraste para um dia, ou clique para escolher e depois use o "+" do dia.</p>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Procurar treino…" className="rounded-xl border-2 border-violet-200 px-3 py-2" />
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          {filtrados.map((g) => (
            <div key={g.titulo} className="flex flex-col gap-1">
              <p className="text-xs font-black text-slate-500 uppercase">{g.titulo}</p>
              {g.treinos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  draggable
                  onDragStart={(e) => arrastar(e, { tipo: 'novo', treino: t.id })}
                  onClick={() => setEscolhido((x) => (x === t.id ? null : t.id))}
                  className={`flex cursor-grab items-center gap-2 rounded-xl border-2 px-2 py-1.5 text-left text-sm ${
                    escolhido === t.id ? 'border-violet-600 bg-violet-100 font-bold' : 'border-transparent bg-slate-50 hover:border-violet-200'
                  }`}
                >
                  <span aria-hidden className="text-lg">
                    {t.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t.nome}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Vídeo de uma ficha */}
      {videoDe && editando && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30" onClick={() => setVideoDe(null)}>
          <div className="flex w-[28rem] flex-col gap-2 rounded-3xl bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-extrabold">
              🎬 Vídeo só deste dia · {nomeDe(editando.treino).nome} · {NOMES_DIAS[diaDaSemana(videoDe.data)]} {formatarData(videoDe.data)}
            </p>
            {videos.length > 0 && (
              <select
                defaultValue={ehVideoDoApp(editando.video) ? caminhoDoVideo(editando.video) : ''}
                onChange={(e) => {
                  const caminho = e.target.value
                  const itens = itensDo(videoDe.data).map((x, i) => (i === videoDe.indice ? { treino: x.treino, ...(caminho ? { video: referenciaDoVideo(caminho) } : {}) } : x))
                  definir(videoDe.data, itens)
                  setVideoDe(null)
                }}
                className="rounded-xl border-2 border-red-200 bg-white px-3 py-2"
              >
                <option value="">🎬 Escolher um vídeo enviado…</option>
                {videos.map((v) => (
                  <option key={v.caminho} value={v.caminho}>
                    {v.titulo}
                  </option>
                ))}
              </select>
            )}
            <input
              autoFocus
              type="url"
              defaultValue={ehVideoDoApp(editando.video) ? '' : (editando.video ?? '')}
              placeholder="https://… (vazio = o vídeo de sempre)"
              onKeyDown={(e) => {
                if (e.key === 'Escape') return setVideoDe(null)
                if (e.key !== 'Enter') return
                const valor = (e.target as HTMLInputElement).value.trim()
                if (valor && !linkSeguro(valor)) return
                const itens = itensDo(videoDe.data).map((x, i) => (i === videoDe.indice ? { treino: x.treino, ...(valor ? { video: linkSeguro(valor)! } : {}) } : x))
                definir(videoDe.data, itens)
                setVideoDe(null)
              }}
              className="rounded-xl border-2 border-violet-200 px-3 py-2"
            />
            <p className="text-xs">{videos.length > 0 ? 'Escolha um vídeo enviado, ou cole um link e aperte Enter. ' : 'Cole um link e aperte Enter. '}Esc ou clique fora para cancelar.</p>
          </div>
        </div>
      )}
    </div>
  )
}
