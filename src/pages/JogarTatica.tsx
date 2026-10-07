// Uma rodada do Futsal Tático (/tatica/jogar): 5 puzzles escolhidos pelo rating da criança e pelos
// filtros (ou 1 puzzle escolhido na lista: ?id=...). Modo treino (sem tempo) ou contra o relógio
// (?modo=relogio). No fim: acertos, erros, tempo, rating antes → depois e a recompensa.
import { useCallback, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Mascote } from '../components/mascote/Mascote'
import { PainelRecompensa } from '../components/ui/PainelRecompensa'
import { FALAS_FIM, sortearFala } from '../data/mascote'
import { proximoPuzzle, puzzlesDoFiltro, type Filtros } from '../features/tatica/escolher'
import { puzzlePorId } from '../features/tatica/puzzles'
import { ResolverPuzzle } from '../features/tatica/ResolverPuzzle'
import type { CategoriaTatica, Dificuldade, Puzzle } from '../features/tatica/tipos'
import { entregarRecompensa, type ResultadoRecompensa } from '../stores/progressStore'
import { useTaticaStore, type TentativaTatica } from '../stores/taticaStore'

/** Puzzles por rodada */
const TAMANHO_RODADA = 5
/** Segundos por puzzle no modo contra o relógio */
const SEGUNDOS_RELOGIO = 60

function sortearPrimeiro(f: Filtros, ids: string[]): Puzzle | undefined {
  if (ids.length) return puzzlePorId(ids[0])
  const s = useTaticaStore.getState()
  return proximoPuzzle(f, s.rating, s.porPuzzle, [])
}

export function JogarTatica() {
  // "De novo" ou outro endereço (outro puzzle, outro filtro) começam uma rodada nova do zero
  const [rodada, setRodada] = useState(0)
  const { search } = useLocation()
  return <Rodada key={`${rodada}${search}`} aoRepetir={() => setRodada((r) => r + 1)} />
}

function Rodada({ aoRepetir }: { aoRepetir: () => void }) {
  const [params] = useSearchParams()
  const relogio = params.get('modo') === 'relogio'
  const filtros: Filtros = {
    dificuldade: (params.get('dif') as Dificuldade) || undefined,
    categoria: (params.get('cat') as CategoriaTatica) || undefined,
  }
  const ids = params.get('id') ? [params.get('id')!] : []
  const total = ids.length || TAMANHO_RODADA

  const [ratingInicial] = useState(() => useTaticaStore.getState().rating)
  const [atual, setAtual] = useState<Puzzle | undefined>(() => sortearPrimeiro(filtros, ids))
  const [feitos, setFeitos] = useState<TentativaTatica[]>([])
  const [fim, setFim] = useState<(ResultadoRecompensa & { xp: number; moedas: number }) | null>(null)

  const aoTerminar = useCallback((t: TentativaTatica) => setFeitos((f) => [...f, t]), [])

  function proximo() {
    const s = useTaticaStore.getState()
    const jaForam = feitos.map((f) => f.puzzle)
    const seguinte = feitos.length < total ? proximoPuzzle(filtros, s.rating, s.porPuzzle, jaForam) : undefined
    if (seguinte && !ids.length) return setAtual(seguinte)
    // Fim da rodada: recompensa uma vez só (5 XP por acerto de primeira, 2 pelos outros)
    const acertos = feitos.filter((f) => f.acertou).length
    const xp = acertos * 5 + (feitos.length - acertos) * 2
    const moedas = acertos
    setFim({ ...entregarRecompensa(xp, moedas, 'tatica'), xp, moedas })
  }

  if (!atual) {
    return (
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <p className="text-xl font-bold">Nenhum puzzle com esses filtros.</p>
        <Link to="/tatica" className="grid min-h-14 w-full place-items-center rounded-3xl bg-sol text-xl font-extrabold">
          Voltar 🧠
        </Link>
      </div>
    )
  }

  if (fim) return <FimRodada feitos={feitos} ratingInicial={ratingInicial} recompensa={fim} relogio={relogio} aoRepetir={aoRepetir} />

  // O botão do fim do puzzle só aparece depois que ele entrou em `feitos`
  const semMais = puzzlesDoFiltro(filtros).every((p) => feitos.some((f) => f.puzzle === p.id))
  const ehUltimo = ids.length > 0 || feitos.length >= total || semMais
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <Link to="/tatica" aria-label="Sair da rodada" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ✖️
        </Link>
        <p className="flex-1 text-lg font-extrabold">
          {relogio ? '⏱️ Contra o relógio' : '🧠 Treino'} · {Math.min(feitos.length + 1, total)}/{total}
        </p>
        <span className="flex gap-1" aria-label={`${feitos.filter((f) => f.acertou).length} acertos`}>
          {feitos.map((f, i) => (
            <span key={i} aria-hidden>
              {f.acertou ? '✅' : '❌'}
            </span>
          ))}
        </span>
      </header>
      <ResolverPuzzle
        key={atual.id}
        puzzle={atual}
        segundos={relogio ? SEGUNDOS_RELOGIO : undefined}
        aoTerminar={aoTerminar}
        aoProximo={proximo}
        textoProximo={ehUltimo ? 'Ver resultado 🏁' : 'Próximo puzzle ▶️'}
      />
    </section>
  )
}

function FimRodada({
  feitos,
  ratingInicial,
  recompensa,
  relogio,
  aoRepetir,
}: {
  aoRepetir: () => void
  feitos: TentativaTatica[]
  ratingInicial: number
  recompensa: ResultadoRecompensa & { xp: number; moedas: number }
  relogio: boolean
}) {
  const sequencia = useTaticaStore((s) => s.sequencia)
  const acertos = feitos.filter((f) => f.acertou).length
  const rating = feitos.length ? feitos[feitos.length - 1].rating : ratingInicial
  const delta = rating - ratingInicial
  const tempo = feitos.reduce((t, f) => t + f.tempoS, 0)
  const [fala] = useState(() => sortearFala(acertos === feitos.length ? FALAS_FIM.otimo : acertos > 0 ? FALAS_FIM.bom : FALAS_FIM.esforco))

  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <Mascote humor={acertos > 0 ? 'comemorando' : 'torcendo'} fala={fala} tamanho={80} />
      <h1 className="text-3xl font-extrabold">
        {acertos} de {feitos.length} de primeira!
      </h1>
      <ul className="grid w-full grid-cols-2 gap-2">
        {[
          ['⭐', `${rating}`, `rating (${delta >= 0 ? '+' : ''}${delta})`],
          ['🔥', `${sequencia}`, 'acertos seguidos'],
          ['❌', `${feitos.reduce((t, f) => t + f.erros, 0)}`, 'erros'],
          ['⏱️', `${Math.floor(tempo / 60)}:${String(tempo % 60).padStart(2, '0')}`, relogio ? 'contra o relógio' : 'de treino'],
        ].map(([emoji, valor, rotulo]) => (
          <li key={rotulo} className="flex flex-col rounded-2xl border-4 border-emerald-200 bg-white p-2">
            <span className="text-2xl font-black">
              <span aria-hidden>{emoji} </span>
              {valor}
            </span>
            <span className="text-sm font-bold">{rotulo}</span>
          </li>
        ))}
      </ul>
      <PainelRecompensa xp={recompensa.xp} moedas={recompensa.moedas} resultadoXP={recompensa.resultadoXP} bonusSequencia={recompensa.bonusSequencia} />
      <div className="grid w-full grid-cols-2 gap-3 pt-2">
        <Link to="/tatica" className="grid min-h-16 place-items-center rounded-3xl border-4 border-emerald-400 bg-white text-xl font-extrabold">
          Tática 🧠
        </Link>
        <button type="button" onClick={aoRepetir} className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
          De novo 🔁
        </button>
      </div>
    </div>
  )
}
