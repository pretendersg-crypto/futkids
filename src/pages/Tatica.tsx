// Futsal Tático (/tatica): puzzles de "qual a melhor jogada?", como os puzzles de xadrez.
// Abas: Jogar (rodada de 5, treino ou contra o relógio, com filtros), Puzzles (lista para escolher
// um) e Progresso (rating, gráfico, acertos por categoria e últimas tentativas).
import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Modal } from '../components/ui/Modal'
import { SeloTipo } from '../components/ui/TipoAtividade'
import { PortaoDosPais } from '../components/ui/PortaoDosPais'
import { puzzlesDoFiltro } from '../features/tatica/escolher'
import { PUZZLES, puzzlePorId } from '../features/tatica/puzzles'
import {
  EMOJI_CATEGORIA,
  EMOJI_DIFICULDADE,
  NOMES_CATEGORIA,
  NOMES_DIFICULDADE,
  type CategoriaTatica,
  type Dificuldade,
} from '../features/tatica/tipos'
import { useTaticaStore } from '../stores/taticaStore'
import { destravarSom } from '../utils/som'

type Aba = 'jogar' | 'puzzles' | 'progresso'
const ABAS: [Aba, string][] = [
  ['jogar', '▶️ Jogar'],
  ['puzzles', '📋 Puzzles'],
  ['progresso', '📈 Progresso'],
]
const DIFICULDADES: Dificuldade[] = ['facil', 'intermediario', 'avancado']
const CATEGORIAS: CategoriaTatica[] = ['ataque', 'defesa', 'transicao', 'bola-parada']

export function Tatica() {
  const [params, setParams] = useSearchParams()
  const aba = (ABAS.find(([id]) => id === params.get('aba'))?.[0] ?? 'jogar') as Aba
  const { rating, sequencia, melhorSequencia } = useTaticaStore()

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-center text-3xl font-extrabold">🧠 Futsal Tático</h1>
      <SeloTipo tipo="tela" className="-mt-2 self-center px-3 py-1 text-sm" />
      <div className="grid grid-cols-3 gap-2 text-center">
        <Numero emoji="⭐" valor={rating} rotulo="seu rating" />
        <Numero emoji="🔥" valor={sequencia} rotulo="acertos seguidos" />
        <Numero emoji="🏅" valor={melhorSequencia} rotulo="recorde" />
      </div>

      <div role="tablist" aria-label="Partes do Futsal Tático" className="grid grid-cols-3 gap-1 rounded-3xl bg-white p-1 shadow">
        {ABAS.map(([id, nome]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setParams(id === 'jogar' ? {} : { aba: id }, { replace: true })}
            className={`min-h-12 rounded-3xl text-base font-extrabold ${aba === id ? 'bg-emerald-600 text-white' : ''}`}
          >
            {nome}
          </button>
        ))}
      </div>

      {aba === 'jogar' && <AbaJogar />}
      {aba === 'puzzles' && <AbaPuzzles />}
      {aba === 'progresso' && <AbaProgresso />}
    </section>
  )
}

function Numero({ emoji, valor, rotulo }: { emoji: string; valor: number; rotulo: string }) {
  return (
    <div className="flex flex-col rounded-2xl border-4 border-emerald-200 bg-white p-2">
      <span className="text-2xl font-black">
        <span aria-hidden>{emoji} </span>
        {valor}
      </span>
      <span className="text-xs font-bold">{rotulo}</span>
    </div>
  )
}

function Chip({ ativo, aoTocar, children }: { ativo: boolean; aoTocar: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={aoTocar}
      className={`min-h-11 rounded-full border-2 px-3 text-sm font-bold ${ativo ? 'border-emerald-600 bg-emerald-100' : 'border-emerald-200 bg-white'}`}
    >
      {children}
    </button>
  )
}

function AbaJogar() {
  const [dif, setDif] = useState<Dificuldade | null>(null)
  const [cat, setCat] = useState<CategoriaTatica | null>(null)
  const quantos = puzzlesDoFiltro({ dificuldade: dif ?? undefined, categoria: cat ?? undefined }).length
  const busca = (modo: string) => {
    const q = new URLSearchParams()
    if (modo === 'relogio') q.set('modo', modo)
    if (dif) q.set('dif', dif)
    if (cat) q.set('cat', cat)
    // toString em vez de q.size: size não existe em celulares mais antigos
    const texto = q.toString()
    return `/tatica/jogar${texto ? `?${texto}` : ''}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-3xl border-4 border-emerald-300 bg-emerald-50 p-3 text-base">
        <span aria-hidden className="text-4xl">
          ♟️
        </span>
        <p>
          Como nos puzzles de xadrez: veja a jogada na quadra e descubra a <b>melhor decisão</b>. Toque no jogador que pisca 🟡 e depois na seta da
          jogada. Você é sempre o time <b className="text-blue-700">azul</b>, atacando para a direita ➡️.
        </p>
      </div>

      <Link
        to={busca('treino')}
        onClick={destravarSom}
        className={`grid min-h-18 place-items-center rounded-3xl bg-sol text-2xl font-extrabold shadow-lg ${quantos ? '' : 'pointer-events-none opacity-50'}`}
      >
        Rodada de 5 puzzles ▶️
      </Link>
      <Link
        to={busca('relogio')}
        onClick={destravarSom}
        className={`grid min-h-14 place-items-center rounded-3xl border-4 border-emerald-400 bg-white text-xl font-extrabold ${quantos ? '' : 'pointer-events-none opacity-50'}`}
      >
        ⏱️ Contra o relógio (60 s cada)
      </Link>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-lg font-extrabold">Escolher o tipo (opcional)</legend>
        <div className="flex flex-wrap gap-2">
          <Chip ativo={dif === null} aoTocar={() => setDif(null)}>
            Todas
          </Chip>
          {DIFICULDADES.map((d) => (
            <Chip key={d} ativo={dif === d} aoTocar={() => setDif(d)}>
              {EMOJI_DIFICULDADE[d]} {NOMES_DIFICULDADE[d]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip ativo={cat === null} aoTocar={() => setCat(null)}>
            Todos
          </Chip>
          {CATEGORIAS.map((c) => (
            <Chip key={c} ativo={cat === c} aoTocar={() => setCat(c)}>
              {EMOJI_CATEGORIA[c]} {NOMES_CATEGORIA[c]}
            </Chip>
          ))}
        </div>
        <p className="text-sm font-bold">{quantos ? `${quantos} puzzles com essa escolha` : 'Nenhum puzzle com essa escolha'}</p>
      </fieldset>
    </div>
  )
}

function AbaPuzzles() {
  const porPuzzle = useTaticaStore((s) => s.porPuzzle)
  return (
    <div className="flex flex-col gap-4">
      {DIFICULDADES.map((d) => (
        <div key={d} className="flex flex-col gap-2">
          <h2 className="text-xl font-extrabold">
            {EMOJI_DIFICULDADE[d]} {NOMES_DIFICULDADE[d]}
          </h2>
          <ul className="flex flex-col gap-2">
            {PUZZLES.filter((p) => p.dificuldade === d).map((p) => {
              const desempenho = porPuzzle[p.id]
              return (
                <li key={p.id}>
                  <Link
                    to={`/tatica/jogar?id=${p.id}`}
                    onClick={destravarSom}
                    className="flex min-h-16 items-center gap-3 rounded-2xl border-4 border-emerald-200 bg-white p-2"
                  >
                    <span aria-hidden className="text-3xl">
                      {EMOJI_CATEGORIA[p.categoria]}
                    </span>
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="font-extrabold">
                        {p.titulo} {p.passos.length > 1 && <span className="text-xs font-bold">· {p.passos.length} jogadas</span>}
                      </span>
                      <span className="text-sm">
                        {NOMES_CATEGORIA[p.categoria]} · ⭐ {p.rating}
                      </span>
                    </span>
                    <span className="text-sm font-bold">
                      {!desempenho ? '✨ novo' : desempenho.ultimoAcerto ? '✅' : '🔁'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function AbaProgresso() {
  const { historico, porPuzzle, melhorRating, zerar } = useTaticaStore()
  const [apagar, setApagar] = useState<'portao' | 'confirmar' | null>(null)

  if (historico.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border-4 border-dashed border-emerald-300 bg-white p-6 text-center">
        <span aria-hidden className="text-6xl">
          📈
        </span>
        <p className="text-xl font-extrabold">Nenhum puzzle ainda</p>
        <p>Jogue uma rodada e o seu rating aparece aqui.</p>
      </div>
    )
  }

  const acertosPorCategoria = CATEGORIAS.map((c) => {
    const tentativas = historico.filter((t) => puzzlePorId(t.puzzle)?.categoria === c)
    return { c, total: tentativas.length, acertos: tentativas.filter((t) => t.acertou).length }
  })
  const resolvidos = Object.values(porPuzzle).filter((d) => d.acertos > 0).length

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 gap-2">
        <li className="rounded-2xl border-4 border-emerald-200 bg-white p-2 text-center">
          <span className="block text-2xl font-black">🏆 {melhorRating}</span>
          <span className="text-sm font-bold">maior rating</span>
        </li>
        <li className="rounded-2xl border-4 border-emerald-200 bg-white p-2 text-center">
          <span className="block text-2xl font-black">
            ✅ {resolvidos}/{PUZZLES.length}
          </span>
          <span className="text-sm font-bold">puzzles resolvidos</span>
        </li>
      </ul>

      <GraficoRating valores={historico.slice(-30).map((t) => t.rating)} />

      <div className="flex flex-col gap-2 rounded-3xl border-4 border-emerald-200 bg-white p-3">
        <p className="font-extrabold">🎯 Acertos de primeira por tipo</p>
        {acertosPorCategoria.map(({ c, total, acertos }) => (
          <div key={c} className="flex items-center gap-2 text-sm font-bold">
            <span className="w-32 shrink-0">
              {EMOJI_CATEGORIA[c]} {NOMES_CATEGORIA[c]}
            </span>
            <span className="h-4 flex-1 overflow-hidden rounded-full bg-emerald-100">
              <span className="block h-full rounded-full bg-emerald-500" style={{ width: total ? `${(acertos / total) * 100}%` : '0%' }} />
            </span>
            <span className="w-12 text-right">{total ? `${acertos}/${total}` : '—'}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-lg font-extrabold">🕑 Últimas tentativas</p>
        <ul className="flex flex-col gap-1">
          {[...historico]
            .reverse()
            .slice(0, 15)
            .map((t, i) => (
              <li key={`${t.quando}-${i}`} className="flex items-center gap-2 rounded-xl bg-white px-2 py-1 text-sm">
                <span aria-hidden>{t.acertou ? '✅' : t.revelou ? '👀' : '🔁'}</span>
                <span className="flex-1 truncate font-bold">{puzzlePorId(t.puzzle)?.titulo ?? t.puzzle}</span>
                <span className={t.delta >= 0 ? 'text-green-700' : 'text-red-700'}>
                  {t.delta >= 0 ? '+' : ''}
                  {t.delta}
                </span>
                <span className="text-slate-600">{new Date(t.quando).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
              </li>
            ))}
        </ul>
      </div>

      <button type="button" onClick={() => setApagar('portao')} className="min-h-12 rounded-2xl border-4 border-red-200 bg-white font-bold text-red-800">
        🗑️ Zerar rating e histórico
      </button>
      <Modal aberto={apagar !== null} aoFechar={() => setApagar(null)} titulo="Zerar o Futsal Tático">
        {apagar === 'portao' && <PortaoDosPais aoLiberar={() => setApagar('confirmar')} />}
        {apagar === 'confirmar' && (
          <div className="flex flex-col gap-3">
            <p className="text-lg">O rating volta para o começo e o histórico é apagado neste aparelho.</p>
            <button
              type="button"
              onClick={() => {
                zerar()
                setApagar(null)
              }}
              className="min-h-14 rounded-2xl bg-red-700 text-xl font-extrabold text-white"
            >
              Zerar
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

/** Linha do rating ao longo das tentativas (para cima = melhor) */
function GraficoRating({ valores }: { valores: number[] }) {
  if (valores.length < 2) return null
  const L = 320
  const A = 120
  const M = 18
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const faixa = Math.max(40, max - min)
  const x = (i: number) => M + (i * (L - 2 * M)) / (valores.length - 1)
  const y = (v: number) => A - M - ((v - min) / faixa) * (A - 2 * M)
  return (
    <figure className="flex flex-col gap-1 rounded-3xl border-4 border-emerald-200 bg-white p-3">
      <figcaption className="font-extrabold">⭐ Seu rating nas últimas {valores.length} tentativas</figcaption>
      <svg viewBox={`0 0 ${L} ${A}`} className="w-full" role="img" aria-label={`Rating de ${valores[0]} para ${valores[valores.length - 1]}`}>
        <text x={4} y={12} fontSize={10} fill="#475569">
          {max}
        </text>
        <text x={4} y={A - 4} fontSize={10} fill="#475569">
          {min}
        </text>
        <polyline points={valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="#059669" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(valores.length - 1)} cy={y(valores[valores.length - 1])} r={5} fill="#059669" />
      </svg>
    </figure>
  )
}
