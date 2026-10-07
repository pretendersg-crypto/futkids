// Editor de um treino do "Treinar" (área dos pais): nome/ícone (treinos novos) e a lista de
// exercícios (incluir, editar, mudar a ordem, tirar). Só grava ao tocar em "Salvar treino".
import { useState } from 'react'
import { Modal } from '../../../../components/ui/Modal'
import { exerciciosDoModulo, type Exercicio } from '../../../../data/catalogo'
import { ICONES_TREINO } from '../../../../data/calendarioGoleiros'
import { useTreinosStore } from '../../../../stores/treinosStore'
import { limparMidiaSolta } from '../../../../utils/limparMidia'
import { descreverMeta } from '../../../treino/recompensa'
import { seriePorModulo, SERIES } from '../../../treino/series'
import type { CategoriaId } from '../../../../data/categorias'
import { categoriaDaSerie, SERIES_SEMPRE_LIBERADAS } from '../../../categoria/categoria'
import { SeletorCategoria } from '../../../categoria/SeletorCategoria'
import { EditorExercicio } from './EditorExercicio'

interface Props {
  /** Série a editar; null = treino novo */
  modulo: string | null
  aoVoltar: () => void
}

const novoId = (prefixo: string) => `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

function exercicioNovo(modulo: string): Exercicio {
  return {
    id: novoId('ex'),
    modulo,
    nome: 'Novo exercício',
    emoji: '⭐',
    tipo: 'tempo',
    meta: 20,
    ritmoMs: 1400,
    animacao: 'polichinelo',
    xp: 10,
    videoId: '',
    passos: [],
  }
}

export function EditorSerie({ modulo: moduloInicial, aoVoltar }: Props) {
  const loja = useTreinosStore()
  const [modulo] = useState(() => moduloInicial ?? novoId('pais'))
  const original = SERIES.some((s) => s.modulo === modulo)
  const serie = seriePorModulo(modulo, loja.seriesExtras)
  const editado = !!loja.exercicios[modulo]

  const [titulo, setTitulo] = useState(serie?.titulo ?? '')
  const [emoji, setEmoji] = useState(serie?.emoji ?? '⭐')
  const [descricao, setDescricao] = useState(serie?.descricao ?? '')
  const [categoria, setCategoria] = useState<CategoriaId>(() => (serie ? categoriaDaSerie(serie, loja.categorias) : 'baby'))
  const [exercicios, setExercicios] = useState<Exercicio[]>(() => loja.exercicios[modulo] ?? exerciciosDoModulo(modulo))
  const [editando, setEditando] = useState<Exercicio | null>(null)
  const [erro, setErro] = useState('')
  const [confirmar, setConfirmar] = useState<'remover' | 'restaurar' | null>(null)

  function voltar() {
    // Depois de gravar (ou desistir), apaga do aparelho os GIFs/vídeos que nada usa mais
    limparMidiaSolta()
    aoVoltar()
  }

  function salvar() {
    if (!original && !titulo.trim()) return setErro('Dê um nome ao treino.')
    if (exercicios.length === 0) return setErro('O treino precisa de pelo menos 1 exercício.')
    // Treino do app em que só a categoria mudou: não marca os exercícios como "mudados"
    const mesmosExercicios = JSON.stringify(exercicios) === JSON.stringify(loja.exercicios[modulo] ?? exerciciosDoModulo(modulo))
    if (!original || !mesmosExercicios) {
      loja.salvarSerie(modulo, exercicios, original ? undefined : { modulo, titulo: titulo.trim(), emoji, descricao: descricao.trim() || 'Treino criado pelos pais', categoria })
    }
    // Treino do app: guarda a categoria só se for diferente da original
    if (original && !SERIES_SEMPRE_LIBERADAS.includes(modulo)) loja.mudarCategoria(modulo, categoria === serie?.categoria ? null : categoria)
    voltar()
  }

  const mover = (i: number, passo: number) =>
    setExercicios((l) => {
      const j = i + passo
      if (j < 0 || j >= l.length) return l
      const nova = [...l]
      ;[nova[i], nova[j]] = [nova[j], nova[i]]
      return nova
    })

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={voltar} className="min-h-12 self-start rounded-2xl bg-white px-4 text-lg font-bold shadow">
        ⬅️ Voltar sem salvar
      </button>
      <h2 className="text-2xl font-extrabold">
        {moduloInicial ? `✏️ ${serie?.emoji ?? ''} ${serie?.titulo ?? 'Treino'}` : '➕ Novo treino'}
      </h2>

      {original ? (
        <p className="rounded-2xl bg-violet-50 p-3 text-sm">
          Este é um treino do app: dá para mudar os exercícios. {editado && 'Ele já foi mudado neste aparelho.'}
        </p>
      ) : (
        <section className="flex flex-col gap-3 rounded-3xl border-4 border-violet-200 bg-white p-3">
          <label className="flex flex-col gap-1 text-base font-bold">
            Nome do treino
            <input type="text" value={titulo} maxLength={30} onChange={(e) => setTitulo(e.target.value)} className="min-h-12 rounded-xl border-2 border-violet-200 px-3" />
          </label>
          <label className="flex flex-col gap-1 text-base font-bold">
            Descrição curta (opcional)
            <input type="text" value={descricao} maxLength={50} onChange={(e) => setDescricao(e.target.value)} className="min-h-12 rounded-xl border-2 border-violet-200 px-3" />
          </label>
          <fieldset>
            <legend className="mb-1 text-base font-bold">Ícone</legend>
            <div className="grid grid-cols-8 gap-1">
              {ICONES_TREINO.map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={emoji === i}
                  aria-label={`Ícone ${i}`}
                  onClick={() => setEmoji(i)}
                  className={`grid aspect-square place-items-center rounded-xl border-4 text-xl ${emoji === i ? 'border-violet-600 bg-violet-100' : 'border-transparent bg-violet-50'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      )}

      {SERIES_SEMPRE_LIBERADAS.includes(modulo) ? (
        <p className="rounded-2xl bg-violet-50 p-3 text-sm">
          🍼 {modulo === 'aquecimento' ? 'O aquecimento é sempre Baby: ele vem antes de qualquer treino.' : 'Os fundamentos do goleiro ficam sempre liberados.'}
        </p>
      ) : (
        <section className="rounded-3xl border-4 border-violet-200 bg-white p-3">
          <SeletorCategoria valor={categoria} aoMudar={setCategoria} rotulo="Categoria: a partir de quando a criança pode fazer" comNivel />
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-xl font-extrabold">Exercícios ({exercicios.length})</h3>
        <ol className="flex flex-col gap-2">
          {exercicios.map((e, i) => (
            <li key={e.id} className="flex items-center gap-2 rounded-2xl border-4 border-violet-100 bg-white p-2">
              <span aria-hidden className="text-2xl">
                {e.emoji}
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate font-bold">
                  {i + 1}. {e.nome}
                </span>
                <span className="text-xs">
                  {descreverMeta(e)}
                  {e.gif ? ' · GIF próprio' : ''}
                </span>
              </span>
              <div className="flex shrink-0 gap-1">
                <button type="button" aria-label={`Subir ${e.nome}`} disabled={i === 0} onClick={() => mover(i, -1)} className="grid size-10 place-items-center rounded-lg bg-violet-50 disabled:opacity-30">
                  ▲
                </button>
                <button type="button" aria-label={`Descer ${e.nome}`} disabled={i === exercicios.length - 1} onClick={() => mover(i, 1)} className="grid size-10 place-items-center rounded-lg bg-violet-50 disabled:opacity-30">
                  ▼
                </button>
                <button type="button" aria-label={`Editar ${e.nome}`} onClick={() => setEditando(e)} className="grid size-10 place-items-center rounded-lg bg-violet-100">
                  ✏️
                </button>
                <button type="button" aria-label={`Tirar ${e.nome}`} onClick={() => setExercicios((l) => l.filter((x) => x.id !== e.id))} className="grid size-10 place-items-center rounded-lg bg-red-50">
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setEditando(exercicioNovo(modulo))}
          className="min-h-14 rounded-2xl border-4 border-dashed border-violet-400 bg-violet-50 text-lg font-extrabold"
        >
          ➕ Adicionar exercício
        </button>
      </section>

      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}
      <button type="button" onClick={salvar} className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
        Salvar treino ✅
      </button>

      {original && editado && (
        <button
          type="button"
          onClick={() => {
            if (confirmar !== 'restaurar') return setConfirmar('restaurar')
            loja.restaurarSerie(modulo)
            voltar()
          }}
          className="min-h-12 rounded-2xl border-4 border-violet-200 bg-white font-bold"
        >
          {confirmar === 'restaurar' ? 'Confirmar: voltar ao original' : '↩️ Voltar aos exercícios originais'}
        </button>
      )}
      {!original && moduloInicial && (
        <button
          type="button"
          onClick={() => {
            if (confirmar !== 'remover') return setConfirmar('remover')
            loja.removerSerieExtra(modulo)
            voltar()
          }}
          className="min-h-12 rounded-2xl border-4 border-red-200 bg-white font-bold text-red-800"
        >
          {confirmar === 'remover' ? 'Confirmar: apagar este treino' : '🗑️ Apagar este treino'}
        </button>
      )}

      <Modal aberto={!!editando} aoFechar={() => setEditando(null)} titulo={editando && exercicios.some((x) => x.id === editando.id) ? '✏️ Exercício' : '➕ Exercício novo'}>
        {editando && (
          <EditorExercicio
            key={editando.id}
            inicial={editando}
            aoSalvar={(salvo) => {
              setExercicios((l) => (l.some((x) => x.id === salvo.id) ? l.map((x) => (x.id === salvo.id ? salvo : x)) : [...l, salvo]))
              setEditando(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
