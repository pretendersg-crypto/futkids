// Resolver um puzzle: toque no jogador que pisca, depois na jogada (seta) — ou escolha pelos
// botões embaixo da quadra. Acertou: a jogada acontece na quadra e vem a explicação; nos puzzles
// de sequência, segue para o próximo passo. Errou: explicação do porquê e tenta de novo (com dica
// ou revelando a resposta). No fim, o conceito ensinado e a mudança do rating.
import { useEffect, useRef, useState } from 'react'
import { useTaticaStore, type TentativaTatica } from '../../stores/taticaStore'
import { sons } from '../../utils/som'
import { Quadra, type EstadoOpcao } from './Quadra'
import { EMOJI_ACAO, EMOJI_CATEGORIA, EMOJI_DIFICULDADE, NOMES_CATEGORIA, NOMES_DIFICULDADE, type Opcao, type Puzzle } from './tipos'
import { aplicarJogada, jogadoresQueAgem, opcaoCorreta, opcoesDoJogador, type Cena } from './validador'

interface Props {
  puzzle: Puzzle
  /** Contra o relógio: segundos para resolver (sem = treino, sem tempo) */
  segundos?: number
  /** Chamado uma vez, quando o puzzle termina (resolvido ou revelado) */
  aoTerminar: (t: TentativaTatica) => void
  aoProximo: () => void
  textoProximo: string
}

type Retorno = { opcao: Opcao; certo: boolean; revelada?: boolean } | null

export function ResolverPuzzle({ puzzle, segundos, aoTerminar, aoProximo, textoProximo }: Props) {
  const registrar = useTaticaStore((s) => s.registrar)
  const [passoIdx, setPassoIdx] = useState(0)
  const [cena, setCena] = useState<Cena>({ jogadores: puzzle.jogadores, bola: puzzle.bola })
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [estados, setEstados] = useState<Record<string, EstadoOpcao>>({})
  const [retorno, setRetorno] = useState<Retorno>(null)
  const [erros, setErros] = useState(0)
  const [usouDica, setUsouDica] = useState(false)
  const [revelou, setRevelou] = useState(false)
  const [restante, setRestante] = useState(segundos ?? 0)
  const [tentativa, setTentativa] = useState<TentativaTatica | null>(null)
  const inicio = useRef(0)

  const passo = puzzle.passos[passoIdx]
  const ultimoPasso = passoIdx === puzzle.passos.length - 1
  const agem = jogadoresQueAgem(passo)
  const acabou = tentativa !== null
  // Quem joga já vem escolhido quando só um jogador pode agir (menos um toque para a criança)
  const escolhido = selecionado ?? (agem.length === 1 ? agem[0] : null)
  const aguardando = retorno === null && !acabou

  useEffect(() => {
    inicio.current = Date.now()
  }, [])

  function finalizar(revelada: boolean) {
    const t = registrar(puzzle, {
      acertou: erros === 0 && !revelada && !revelou,
      usouDica,
      revelou: revelada || revelou,
      erros,
      tempoS: Math.round((Date.now() - inicio.current) / 1000),
    })
    setTentativa(t)
    aoTerminar(t)
  }

  function escolher(opcao: Opcao, revelada = false) {
    // Revelar vale mesmo com a explicação de um erro aberta
    if (acabou || (!revelada && !aguardando)) return
    setSelecionado(opcao.jogador)
    if (opcao.correta) {
      if (!revelada) sons.defesa()
      setEstados({ [opcao.id]: 'certo' })
      setRetorno({ opcao, certo: true, revelada })
      // A jogada acontece na quadra (os jogadores deslizam até o lugar novo)
      setCena((c) => aplicarJogada(c, passo, opcao))
      setSelecionado(null)
      if (ultimoPasso) finalizar(revelada)
    } else {
      sons.gol()
      setErros((e) => e + 1)
      setEstados({ [opcao.id]: 'errado' })
      setRetorno({ opcao, certo: false })
    }
  }

  function revelar() {
    setRevelou(true)
    escolher(opcaoCorreta(passo), true)
  }

  function continuar() {
    setPassoIdx((i) => i + 1)
    setRetorno(null)
    setEstados({})
  }

  // Contra o relógio: o tempo para enquanto a criança lê o acerto de um passo da sequência
  const relogioParado = acabou || retorno?.certo === true
  useEffect(() => {
    if (!segundos || relogioParado) return
    const t = window.setInterval(() => setRestante((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearInterval(t)
  }, [segundos, relogioParado])
  // Tempo esgotado = revela a resposta (o puzzle conta como não resolvido)
  const esgotou = !!segundos && restante === 0 && !relogioParado
  useEffect(() => {
    if (esgotou) revelar()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só quando o tempo acaba
  }, [esgotou])

  const opcoesVisiveis = escolhido ? opcoesDoJogador(passo, escolhido) : []

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
        <span className="rounded-full bg-white px-2 py-0.5 shadow">
          {EMOJI_DIFICULDADE[puzzle.dificuldade]} {NOMES_DIFICULDADE[puzzle.dificuldade]}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 shadow">
          {EMOJI_CATEGORIA[puzzle.categoria]} {NOMES_CATEGORIA[puzzle.categoria]}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 shadow">⭐ {puzzle.rating}</span>
        {segundos ? (
          <span className={`ml-auto rounded-full px-3 py-0.5 text-base tabular-nums ${restante <= 10 && !acabou ? 'bg-red-600 text-white' : 'bg-white shadow'}`}>
            ⏱️ {restante}s
          </span>
        ) : null}
      </div>

      <div>
        <h2 className="text-2xl font-extrabold">{puzzle.titulo}</h2>
        <p className="text-base">{puzzle.contexto}</p>
      </div>
      <p className="rounded-2xl bg-emerald-700 px-3 py-2 text-lg font-extrabold text-white">{acabou ? '🏁 Fim do puzzle' : passo.pergunta}</p>

      <Quadra
        jogadores={cena.jogadores}
        bola={cena.bola}
        agem={aguardando ? agem : []}
        selecionado={aguardando ? escolhido : null}
        opcoes={aguardando || (retorno && !retorno.certo) ? opcoesVisiveis : []}
        estados={estados}
        interativa={aguardando}
        aoTocarJogador={setSelecionado}
        aoEscolher={(o) => escolher(o)}
      />

      {/* Escolha pelos botões (mesmas jogadas das setas; também para o teclado) */}
      {aguardando && !escolhido && <p className="text-center text-base font-bold">👆 Toque no jogador que está piscando 🟡</p>}
      {aguardando && escolhido && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">
            Jogadas do {cena.jogadores.find((j) => j.id === escolhido)?.numero}: toque na seta na quadra ou aqui embaixo.
            {agem.length > 1 && (
              <button type="button" onClick={() => setSelecionado(null)} className="ml-2 underline">
                trocar jogador
              </button>
            )}
          </p>
          <div className="grid gap-2">
            {opcoesVisiveis.map((o) => (
              <button key={o.id} type="button" onClick={() => escolher(o)} className="flex min-h-12 items-center gap-2 rounded-2xl border-4 border-emerald-200 bg-white px-3 text-left text-base font-bold">
                <span aria-hidden className="text-xl">
                  {EMOJI_ACAO[o.acao]}
                </span>
                {o.rotulo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resposta */}
      {retorno && (
        <div role="status" className={`pop flex flex-col gap-2 rounded-3xl border-4 p-3 ${retorno.certo ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
          <p className="text-xl font-extrabold">
            {retorno.revelada ? `👀 A jogada certa: ${retorno.opcao.rotulo}` : retorno.certo ? '✅ Boa! ' + retorno.opcao.rotulo : '❌ ' + retorno.opcao.rotulo + ': não é a melhor'}
          </p>
          <p className="text-base">{retorno.opcao.explicacao}</p>
          {retorno.opcao.consequencia && !retorno.certo && <p className="text-base font-bold">⚠️ {retorno.opcao.consequencia}</p>}
          {!retorno.certo && (
            <button
              type="button"
              onClick={() => {
                setRetorno(null)
                setEstados({})
              }}
              className="min-h-12 rounded-2xl bg-white font-extrabold shadow"
            >
              Tentar de novo 🔁
            </button>
          )}
          {retorno.certo && !ultimoPasso && (
            <button type="button" onClick={continuar} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
              Continuar a jogada ▶️
            </button>
          )}
        </div>
      )}

      {/* Dica e revelar */}
      {!acabou && (retorno === null || !retorno.certo) && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!puzzle.dica || usouDica}
            onClick={() => setUsouDica(true)}
            className="min-h-12 rounded-2xl border-4 border-yellow-300 bg-white font-bold disabled:opacity-50"
          >
            💡 Dica
          </button>
          <button
            type="button"
            onClick={() => {
              setRetorno(null)
              revelar()
            }}
            className="min-h-12 rounded-2xl border-4 border-slate-300 bg-white font-bold"
          >
            👀 Revelar
          </button>
        </div>
      )}
      {usouDica && puzzle.dica && !acabou && <p className="rounded-2xl bg-yellow-100 p-3 text-base font-bold">💡 {puzzle.dica}</p>}

      {/* Fim: conceito e rating */}
      {tentativa && (
        <div className="flex flex-col gap-3">
          <div className="rounded-3xl border-4 border-emerald-400 bg-white p-3">
            <p className="text-lg font-extrabold">📘 O que aprender</p>
            <p className="text-base">{puzzle.conceito}</p>
          </div>
          <p className={`text-center text-xl font-extrabold ${tentativa.delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {tentativa.acertou ? '🎉 Resolvido de primeira!' : tentativa.revelou ? '👀 Revelado' : '👍 Resolvido com erro'} · ⭐ {tentativa.rating} ({tentativa.delta >= 0 ? '+' : ''}
            {tentativa.delta})
          </p>
          <button type="button" onClick={aoProximo} className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
            {textoProximo}
          </button>
        </div>
      )}
    </div>
  )
}
