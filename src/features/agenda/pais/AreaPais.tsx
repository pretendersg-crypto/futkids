// Área dos pais (ou treinador): escolher o programa de treinos, ver o mês com o que a criança
// fez, mudar qualquer dia, editar os links dos vídeos, os treinos do "Treinar", os fundamentos e
// gestos do goleiro, e ver os treinos de academia do calendário.
import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { ACADEMIA, OBSERVACOES_CALENDARIO, PROGRAMA_GOLEIROS, tipoPorId, TREINOS_CALENDARIO, treinoPorId, type TreinoExtra } from '../../../data/calendarioGoleiros'
import { useProgramaStore } from '../../../stores/programaStore'
import { useProgressStore } from '../../../stores/progressStore'
import { formatarData, hojeISO, somarDias } from '../../../utils/data'
import { linkSeguro } from '../../../utils/link'
import { LinkVideo } from '../BotaoVideo'
import { descreverPosicao, LETRAS_DIAS, planoDoDia } from '../semana'
import { EditorDia } from './EditorDia'
import { EditorSerie } from './treinos/EditorSerie'
import { exerciciosDoModulo } from '../../../data/catalogo'
import { todasAsSeries } from '../../treino/series'
import { useTreinosStore } from '../../../stores/treinosStore'
import { FormVideo } from './FormVideo'
import { EditorGesto } from './gestos/EditorGesto'
import { GestosDoGoleiro } from './gestos/GestosDoGoleiro'
import { CATEGORIAS, type CategoriaId } from '../../../data/categorias'
import { categoriaDaSerie, categoriaDoVideo } from '../../categoria/categoria'
import { CategoriaDoJogador } from '../../categoria/CategoriaDoJogador'
import { SeloCategoria } from '../../categoria/SeloCategoria'

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
  // Editor de um treino do "Treinar" (ocupa a área inteira): módulo, 'novo' ou null
  const [editandoSerie, setEditandoSerie] = useState<string | null>(null)
  // Editor de um gesto do goleiro (ocupa a área inteira): id, 'novo' ou null
  const [editandoGesto, setEditandoGesto] = useState<string | null>(null)
  // Assina os treinos dos pais: o calendário mostra nomes/ícones atualizados
  useTreinosStore((s) => s.seriesExtras)

  if (editandoSerie) {
    return <EditorSerie modulo={editandoSerie === 'novo' ? null : editandoSerie} aoVoltar={() => setEditandoSerie(null)} />
  }
  if (editandoGesto) {
    return <EditorGesto id={editandoGesto === 'novo' ? null : editandoGesto} aoVoltar={() => setEditandoGesto(null)} />
  }

  const andarMes = (passo: number) => setMes(({ ano, mes: m }) => ({ ano: ano + Math.floor((m + passo) / 12), mes: (((m + passo) % 12) + 12) % 12 }))

  return (
    <div className="flex flex-col gap-5">
      <CategoriaDoJogador />

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

      <TreinosDoApp aoEditar={setEditandoSerie} />

      <GestosDoGoleiro aoEditar={(id) => setEditandoGesto(id ?? 'novo')} />

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

/**
 * Vídeos dos treinos: os pais adicionam vídeos novos (tipo, ícone e link do YouTube) e podem
 * trocar o link dos vídeos do calendário (ex.: quando o treinador mandar outro).
 */
function VideosDosTreinos() {
  const programa = useProgramaStore()
  const [rascunho, setRascunho] = useState<Record<string, string>>({})
  const [erro, setErro] = useState<string | null>(null)
  // Janela do formulário: 'novo' ou o vídeo sendo editado
  const [formulario, setFormulario] = useState<'novo' | TreinoExtra | null>(null)
  const [confirmarRemocao, setConfirmarRemocao] = useState<string | null>(null)
  const comVideo = TREINOS_CALENDARIO.filter((t) => t.videoUrl || programa.videos[t.id])

  return (
    <section className="flex flex-col gap-2 rounded-3xl border-4 border-violet-200 bg-white p-3">
      <h2 className="text-xl font-extrabold">🎬 Vídeos dos treinos</h2>
      <p className="text-sm">
        Os vídeos abrem fora do app. Depois, cada um vai virar uma animação do bonequinho dentro do app. A categoria diz a partir de quando a
        criança vê o vídeo em "📺 Vídeos do treinador".
      </p>

      <button
        type="button"
        onClick={() => setFormulario('novo')}
        className="min-h-14 rounded-2xl border-4 border-dashed border-violet-400 bg-violet-50 text-lg font-extrabold"
      >
        ➕ Adicionar vídeo
      </button>

      {programa.extras.length > 0 && (
        <>
          <h3 className="pt-1 text-lg font-extrabold">Adicionados por você</h3>
          <p className="-mt-1 text-sm">Para usar num dia, toque no dia do calendário e em "Incluir treino".</p>
          <ul className="flex flex-col gap-2">
            {programa.extras.map((e) => {
              const tipo = tipoPorId(e.tipo)
              return (
                <li key={e.id} className="flex flex-col gap-2 rounded-2xl border-2 border-violet-100 p-2">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="text-3xl">
                      {e.emoji}
                    </span>
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="font-bold">{e.nome}</span>
                      <span className="flex flex-wrap items-center gap-1 text-xs font-bold text-violet-800">
                        {tipo.emoji} {tipo.nome} <SeloCategoria id={categoriaDoVideo(e, {})} />
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <LinkVideo url={e.videoUrl} titulo="Ver" className="min-h-11 text-sm" />
                    <button type="button" onClick={() => setFormulario(e)} className="min-h-11 rounded-xl border-2 border-violet-200 px-3 text-sm font-bold">
                      ✏️ Editar
                    </button>
                    {confirmarRemocao === e.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          programa.removerExtra(e.id)
                          setConfirmarRemocao(null)
                        }}
                        className="min-h-11 rounded-xl bg-red-600 px-3 text-sm font-bold text-white"
                      >
                        Confirmar remoção
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmarRemocao(e.id)}
                        className="min-h-11 rounded-xl border-2 border-red-200 px-3 text-sm font-bold text-red-800"
                      >
                        🗑️ Remover
                      </button>
                    )}
                  </div>
                  {confirmarRemocao === e.id && <p className="text-xs">Ele sai também dos dias do calendário em que você colocou.</p>}
                </li>
              )
            })}
          </ul>
        </>
      )}

      <h3 className="pt-1 text-lg font-extrabold">Do calendário</h3>
      {comVideo.map((t) => {
        const atual = programa.videos[t.id] ?? t.videoUrl ?? ''
        const valor = rascunho[t.id] ?? atual
        const mudou = valor !== atual
        return (
          <div key={t.id} className="flex flex-col gap-1 border-b-2 border-violet-50 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">
                {t.emoji} {t.nome} {programa.videos[t.id] && <span className="text-xs font-bold text-amber-700">(link trocado)</span>}
              </p>
              <label className="flex items-center gap-1 text-xs font-bold">
                Categoria
                <select
                  value={categoriaDoVideo(t, programa.categorias)}
                  onChange={(e) => {
                    const c = e.target.value as CategoriaId
                    programa.mudarCategoriaVideo(t.id, c === (t.categoria ?? 'baby') ? null : c)
                  }}
                  className="min-h-10 rounded-xl border-2 border-violet-200 bg-white px-1 text-sm font-bold"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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

      <Modal aberto={!!formulario} aoFechar={() => setFormulario(null)} titulo={formulario === 'novo' ? '➕ Novo vídeo' : '✏️ Editar vídeo'}>
        {formulario && (
          <FormVideo
            key={formulario === 'novo' ? 'novo' : formulario.id}
            inicial={formulario === 'novo' ? undefined : formulario}
            aoSalvar={(dados) => {
              if (formulario === 'novo') programa.adicionarExtra(dados)
              else programa.alterarExtra(formulario.id, dados)
              setFormulario(null)
            }}
          />
        )}
      </Modal>
    </section>
  )
}

/** Treinos do botão "Treinar": editar os exercícios de cada um e criar treinos novos */
function TreinosDoApp({ aoEditar }: { aoEditar: (modulo: string) => void }) {
  const loja = useTreinosStore()
  const series = todasAsSeries(loja.seriesExtras)

  return (
    <section className="flex flex-col gap-2 rounded-3xl border-4 border-violet-200 bg-white p-3">
      <h2 className="text-xl font-extrabold">💪 Treinos (botão Treinar)</h2>
      <p className="text-sm">
        Mude os exercícios, o movimento e a velocidade do bonequinho, ou use um GIF próprio, e a categoria em que cada treino abre. Os
        treinos novos aparecem no menu Treinos e podem ser colocados em qualquer dia do calendário.
      </p>
      <button
        type="button"
        onClick={() => aoEditar('novo')}
        className="min-h-14 rounded-2xl border-4 border-dashed border-violet-400 bg-violet-50 text-lg font-extrabold"
      >
        ➕ Adicionar treino
      </button>
      <ul className="flex flex-col gap-2">
        {series.map((s) => {
          const quantos = (loja.exercicios[s.modulo] ?? exerciciosDoModulo(s.modulo)).length
          const mudado = !!loja.exercicios[s.modulo] && !loja.seriesExtras.some((x) => x.modulo === s.modulo)
          const novo = loja.seriesExtras.some((x) => x.modulo === s.modulo)
          return (
            <li key={s.modulo}>
              <button type="button" onClick={() => aoEditar(s.modulo)} className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-4 p-2 text-left ${s.cor}`}>
                <span aria-hidden className="text-3xl">
                  {s.emoji}
                </span>
                <span className="flex flex-1 flex-col leading-tight">
                  <span className="font-extrabold">{s.titulo}</span>
                  <span className="flex flex-wrap items-center gap-1 text-xs font-bold">
                    <SeloCategoria id={categoriaDaSerie(s, loja.categorias)} />
                    {quantos} {quantos === 1 ? 'exercício' : 'exercícios'}
                    {mudado ? ' · mudado neste aparelho' : ''}
                    {novo ? ' · criado por você' : ''}
                  </span>
                </span>
                <span aria-hidden className="text-xl">
                  ✏️
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
