// Grade de planejamento para computador: semanas em 7 colunas (domingo a sábado), cada dia com os
// treinos em "fichas". Cada dia tem "+ Adicionar", que abre a lista de treinos (com abas e busca);
// arrastar uma ficha para outro dia move; ✕ tira. A lista lateral (opcional) serve para arrastar.
// Serve para o plano de casa (pais) e o plano da turma (treinador).
import { useMemo, useState, type DragEvent } from 'react'
import type { ItemDia, TreinoCalendario } from '../../data/calendarioGoleiros'
import { diaDaSemana, formatarData, hojeISO, somarDias } from '../../utils/data'
import { linkSeguro } from '../../utils/link'
import { caminhoDoVideo, ehVideoDoApp, referenciaDoVideo } from '../../conta/videoDoApp'
import { NOMES_DIAS } from '../agenda/semana'

export interface GrupoDeTreinos {
  titulo: string
  /** Aba da lista de treinos (vários grupos podem ficar na mesma aba); sem = o próprio título */
  secao?: string
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

const diaMes = (data: string) => formatarData(data).slice(0, 5)
const secaoDe = (g: GrupoDeTreinos) => g.secao ?? g.titulo

/** Os grupos com o texto da busca (no nome, no detalhe ou no título do grupo, ex.: "quedas") */
function filtrar(grupos: GrupoDeTreinos[], busca: string) {
  const t = busca.trim().toLowerCase()
  if (!t) return grupos
  return grupos
    .map((g) => ({ ...g, treinos: g.treinos.filter((x) => `${x.nome} ${x.detalhe ?? ''} ${g.titulo}`.toLowerCase().includes(t)) }))
    .filter((g) => g.treinos.length > 0)
}

export function GradePlano({ grupos, itensDo, definir, restaurar, alterado, estado, outros, nomeDe, vazio = 'Descanso', videos = [] }: Props) {
  const hoje = hojeISO()
  const [inicio, setInicio] = useState(() => somarDias(hoje, -diaDaSemana(hoje)))
  const [semanas, setSemanas] = useState(2)
  const [sobre, setSobre] = useState<string | null>(null)
  const [videoDe, setVideoDe] = useState<{ data: string; indice: number } | null>(null)
  /** O dia em que a lista de treinos está aberta ("+ Adicionar") */
  const [adicionandoEm, setAdicionandoEm] = useState<string | null>(null)
  // A lista lateral para arrastar fica escondida até pedir (a grade ganha espaço)
  const [comBiblioteca, setComBiblioteca] = useState(false)
  const [busca, setBusca] = useState('')

  const linhas = Array.from({ length: semanas }, (_, s) => Array.from({ length: 7 }, (_, d) => somarDias(inicio, s * 7 + d)))
  const filtrados = useMemo(() => filtrar(grupos, busca), [grupos, busca])

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
    if (!confirm(`Tirar todos os treinos da semana de ${diaMes(semana[0])} a ${diaMes(semana[6])}?`)) return
    for (const data of semana) definir(data, [])
  }

  const editando = videoDe ? itensDo(videoDe.data)[videoDe.indice] : null
  const ultimoDia = linhas[linhas.length - 1][6]
  const botaoBarra = 'rounded-xl bg-white px-3 py-1.5 font-bold shadow hover:bg-violet-50'

  return (
    <div className="flex min-h-0 gap-4">
      {/* Grade */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setInicio(somarDias(inicio, -7))} aria-label="Semana anterior" className={botaoBarra}>
            ◀
          </button>
          <button type="button" onClick={() => setInicio(somarDias(hoje, -diaDaSemana(hoje)))} className={botaoBarra}>
            Hoje
          </button>
          <button type="button" onClick={() => setInicio(somarDias(inicio, 7))} aria-label="Próxima semana" className={botaoBarra}>
            ▶
          </button>
          <span className="px-1 text-lg font-extrabold">
            {diaMes(inicio)} a {diaMes(ultimoDia)}
          </span>
          <select
            value={semanas}
            onChange={(e) => setSemanas(Number(e.target.value))}
            aria-label="Quantas semanas mostrar"
            className="rounded-xl border-2 border-violet-200 bg-white px-2 py-1 font-bold"
          >
            {[1, 2, 4].map((n) => (
              <option key={n} value={n}>
                {n} semana{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setComBiblioteca((b) => !b)} className={`ml-auto ${botaoBarra}`}>
            {comBiblioteca ? '📚 Fechar a lista' : '📚 Lista para arrastar'}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-sm font-black text-slate-600">
          {NOMES_DIAS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {linhas.map((semana) => (
          <div key={semana[0]} className="flex flex-col gap-1">
            <div className="flex items-center justify-end gap-3 text-xs">
              <button type="button" onClick={() => copiarSemana(semana)} title="Repete estes 7 dias na semana de baixo" className="font-bold text-violet-700 hover:underline">
                📋 Repetir na semana seguinte
              </button>
              <button type="button" onClick={() => limparSemana(semana)} className="font-bold text-red-700 hover:underline">
                🗑️ Limpar a semana
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {semana.map((data) => {
                const itens = itensDo(data)
                const deOutro = outros?.(data) ?? []
                const mudou = alterado?.(data) ?? false
                const feito = estado?.(data) ?? ''
                const ehHoje = data === hoje
                return (
                  <div
                    key={data}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setSobre(data)
                    }}
                    onDragLeave={() => setSobre((s) => (s === data ? null : s))}
                    onDrop={(e) => soltar(e, data)}
                    className={`flex min-h-32 flex-col gap-1 rounded-xl border-2 p-1.5 transition-colors ${
                      sobre === data ? 'border-violet-600 bg-violet-100' : ehHoje ? 'border-violet-500 bg-violet-50' : mudou ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
                    } ${data < hoje ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-black">{diaMes(data)}</span>
                      {ehHoje && <span className="rounded bg-violet-600 px-1 font-black text-white">HOJE</span>}
                      {feito && <span title="O que a criança fez">{feito}</span>}
                      {mudou && restaurar && (
                        <button type="button" onClick={() => restaurar(data)} title="Voltar ao que o programa diz" className="ml-auto font-bold text-amber-700">
                          ↩
                        </button>
                      )}
                    </div>
                    {deOutro.map((f, i) => (
                      <span key={`o${i}`} title={`${f.nome} (${f.origem})`} className="truncate rounded-lg bg-sky-100 px-1.5 py-1 text-left text-xs">
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
                          className="flex cursor-grab items-start gap-1 rounded-lg border border-violet-200 bg-violet-50 px-1.5 py-1 text-left text-xs active:cursor-grabbing"
                        >
                          <span aria-hidden>{t.emoji}</span>
                          {/* Quebra por sílabas em português (Along-amento), nunca no meio sem hífen */}
                          <span lang="pt-BR" className="line-clamp-3 min-w-0 flex-1 leading-tight font-bold hyphens-auto">
                            {t.nome}
                          </span>
                          <button
                            type="button"
                            onClick={() => setVideoDe({ data, indice: i })}
                            title={item.video ? 'Tem vídeo só deste dia (trocar)' : 'Pôr um vídeo só deste dia'}
                            aria-label={`Vídeo de ${t.nome} neste dia`}
                            className={item.video ? '' : 'opacity-30 hover:opacity-100'}
                          >
                            🎬
                          </button>
                          <button
                            type="button"
                            onClick={() => definir(data, itens.filter((_, k) => k !== i))}
                            title="Tirar deste dia"
                            aria-label={`Tirar ${t.nome}`}
                            className="px-0.5 font-black text-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setAdicionandoEm(data)}
                      className="mt-auto rounded-lg border-2 border-dashed border-violet-300 py-1 text-xs font-extrabold text-violet-700 hover:border-violet-500 hover:bg-violet-100"
                    >
                      + Adicionar
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lista lateral, para arrastar */}
      {comBiblioteca && (
        <aside className="sticky top-4 flex max-h-[calc(100dvh-6rem)] w-56 shrink-0 flex-col gap-2 overflow-hidden rounded-2xl border-2 border-violet-200 bg-white p-2.5">
          <p className="text-sm leading-snug font-bold">Arraste um treino para o dia.</p>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Procurar…" className="rounded-xl border-2 border-violet-200 px-3 py-1.5" />
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
            {filtrados.map((g) => (
              <div key={g.titulo} className="flex flex-col gap-1">
                <p className="text-xs font-black text-slate-500">{g.secao ? `${g.secao} · ${g.titulo}` : g.titulo}</p>
                {g.treinos.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => arrastar(e, { tipo: 'novo', treino: t.id })}
                    title={t.detalhe ?? t.nome}
                    className="flex cursor-grab items-center gap-2 rounded-xl border-2 border-transparent bg-slate-50 px-2 py-1 text-left text-sm hover:border-violet-200 active:cursor-grabbing"
                  >
                    <span aria-hidden>{t.emoji}</span>
                    <span className="min-w-0 flex-1 truncate">{t.nome}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* "+ Adicionar": a lista de treinos para o dia */}
      {adicionandoEm && (
        <EscolherTreino
          data={adicionandoEm}
          grupos={grupos}
          noDia={itensDo(adicionandoEm).map((i) => nomeDe(i.treino))}
          aoEscolher={(treino) => incluir(adicionandoEm, treino)}
          aoFechar={() => setAdicionandoEm(null)}
        />
      )}

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

/**
 * A lista de treinos de um dia: abas (gestos técnicos, fundamentos, app…), busca e os treinos em
 * botões. Cada clique inclui no dia e a janela continua aberta para incluir mais; "Pronto" fecha.
 */
function EscolherTreino({
  data,
  grupos,
  noDia,
  aoEscolher,
  aoFechar,
}: {
  data: string
  grupos: GrupoDeTreinos[]
  noDia: { emoji: string; nome: string }[]
  aoEscolher: (treino: string) => void
  aoFechar: () => void
}) {
  const secoes = [...new Set(grupos.map(secaoDe))]
  const [secao, setSecao] = useState(secoes[0] ?? '')
  const [busca, setBusca] = useState('')
  // Com busca, procura em todas as abas
  const visiveis = busca.trim() ? filtrar(grupos, busca) : grupos.filter((g) => secaoDe(g) === secao)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={aoFechar}>
      <div
        role="dialog"
        aria-label="Adicionar treino"
        onKeyDown={(e) => e.key === 'Escape' && aoFechar()}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100dvh-2rem)] w-[min(52rem,100%)] flex-col gap-3 rounded-3xl bg-white p-4 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <h3 className="flex-1 text-xl font-extrabold">
            + Adicionar em {NOMES_DIAS[diaDaSemana(data)]}, {diaMes(data)}
          </h3>
          <button type="button" onClick={aoFechar} className="rounded-xl bg-sol px-4 py-2 font-extrabold shadow">
            ✅ Pronto
          </button>
        </div>
        <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm">
          <b>Neste dia:</b> {noDia.length ? noDia.map((t) => `${t.emoji} ${t.nome}`).join(' · ') : 'nada ainda (descanso)'}
        </p>
        <input autoFocus value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="🔎 Procurar (ex.: queda, encaixe, HIIT)…" className="rounded-xl border-2 border-violet-200 px-3 py-2" />
        {!busca.trim() && (
          <div className="flex flex-wrap gap-1.5" role="tablist">
            {secoes.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={s === secao}
                onClick={() => setSecao(s)}
                className={`rounded-full px-3 py-1.5 text-sm font-bold ${s === secao ? 'bg-violet-600 text-white' : 'bg-violet-100 hover:bg-violet-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          {visiveis.length === 0 && <p className="text-sm">Nenhum treino com esse nome.</p>}
          {visiveis.map((g) => (
            <div key={g.titulo} className="flex flex-col gap-1.5">
              <p className="text-sm font-black text-slate-600">{g.titulo}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {g.treinos.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => aoEscolher(t.id)}
                    title={t.detalhe ?? t.nome}
                    className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-sm hover:border-violet-400 hover:bg-violet-50"
                  >
                    <span aria-hidden className="text-lg">
                      {t.emoji}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight font-bold">{t.nome}</span>
                    <span aria-hidden className="font-black text-violet-600">
                      +
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
