// Resolver um puzzle. Três tipos de pergunta:
//  - jogada: toque no jogador que pisca, depois na jogada (seta), ou escolha pelos botões;
//  - onde se posicionar: toque no LUGAR da quadra para onde o jogador deve ir;
//  - encontre o erro: toque no jogador azul mal posicionado.
// Acertou: a quadra mostra a resposta (a jogada acontece, o jogador vai para o lugar) e vem a
// explicação; nos puzzles de sequência, segue para o próximo passo. Errou: explicação e tenta de
// novo (com dica ou revelando a resposta). No fim, o conceito, o recado de quem criou e o rating.
import { useEffect, useRef, useState } from 'react'
import { useTaticaStore, type TentativaTatica } from '../../stores/taticaStore'
import { sons } from '../../utils/som'
import { Quadra, type EstadoOpcao, type Marca } from './Quadra'
import { EMOJI_ACAO, EMOJI_CATEGORIA, EMOJI_DIFICULDADE, ehJogada, NOMES_CATEGORIA, NOMES_DIFICULDADE, RAIO_POSICAO, type Opcao, type Ponto, type Puzzle } from './tipos'
import { acertouErro, acertouPosicao, aplicarJogada, aplicarPasso, jogadoresQueAgem, opcaoCorreta, opcoesDoJogador, type Cena } from './validador'

interface Props {
  puzzle: Puzzle
  /** Contra o relógio: segundos para resolver (sem = treino, sem tempo) */
  segundos?: number
  /** Testar no editor: não mexe no rating nem no histórico */
  teste?: boolean
  /** Chamado uma vez, quando o puzzle termina (resolvido ou revelado) */
  aoTerminar: (t: TentativaTatica) => void
  aoProximo: () => void
  textoProximo: string
}

type Retorno = {
  certo: boolean
  revelada?: boolean
  /** Título da caixa de resposta */
  titulo: string
  explicacao: string
  consequencia?: string
} | null

const VERDE = '#4ade80'
const VERMELHO = '#f87171'

export function ResolverPuzzle({ puzzle, segundos, teste, aoTerminar, aoProximo, textoProximo }: Props) {
  const registrar = useTaticaStore((s) => s.registrar)
  const [passoIdx, setPassoIdx] = useState(0)
  const [cena, setCena] = useState<Cena>({ jogadores: puzzle.jogadores, bola: puzzle.bola })
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [estados, setEstados] = useState<Record<string, EstadoOpcao>>({})
  const [marcas, setMarcas] = useState<Marca[]>([])
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
  const jogada = ehJogada(passo) ? passo : null
  // Quem joga já vem escolhido quando só um jogador pode agir (menos um toque para a criança)
  const escolhido = jogada ? (selecionado ?? (agem.length === 1 ? agem[0] : null)) : null
  const aguardando = retorno === null && !acabou
  const numero = (id: string) => cena.jogadores.find((j) => j.id === id)?.numero ?? '?'

  useEffect(() => {
    inicio.current = Date.now()
  }, [])

  function finalizar(revelada: boolean) {
    const r = {
      acertou: erros === 0 && !revelada && !revelou,
      usouDica,
      revelou: revelada || revelou,
      erros,
      tempoS: Math.round((Date.now() - inicio.current) / 1000),
    }
    // No teste do editor, o resultado não conta
    const t = teste ? { puzzle: puzzle.id, quando: new Date().toISOString(), ...r, rating: useTaticaStore.getState().rating, delta: 0 } : registrar(puzzle, r)
    setTentativa(t)
    aoTerminar(t)
  }

  /** Resposta certa (ou revelada): mostra, mexe a quadra e termina se era a última pergunta */
  function acertou(r: Omit<NonNullable<Retorno>, 'certo'>, novaCena: Cena) {
    if (!r.revelada) sons.defesa()
    setRetorno({ ...r, certo: true })
    setCena(novaCena)
    setSelecionado(null)
    if (ultimoPasso) finalizar(Boolean(r.revelada))
  }

  function errou(r: Omit<NonNullable<Retorno>, 'certo'>) {
    sons.gol()
    setErros((e) => e + 1)
    setRetorno({ ...r, certo: false })
  }

  // ----- jogada -----
  function escolher(opcao: Opcao, revelada = false) {
    // Revelar vale mesmo com a explicação de um erro aberta
    if (!jogada || acabou || (!revelada && !aguardando)) return
    setSelecionado(opcao.jogador)
    if (opcao.correta) {
      setEstados({ [opcao.id]: 'certo' })
      // A jogada acontece na quadra (os jogadores deslizam até o lugar novo)
      acertou({ revelada, titulo: revelada ? `👀 A jogada certa: ${opcao.rotulo}` : `✅ Boa! ${opcao.rotulo}`, explicacao: opcao.explicacao }, aplicarJogada(cena, jogada, opcao))
    } else {
      setEstados({ [opcao.id]: 'errado' })
      errou({ titulo: `❌ ${opcao.rotulo}: não é a melhor`, explicacao: opcao.explicacao, consequencia: opcao.consequencia })
    }
  }

  // ----- onde se posicionar -----
  function tocarLugar(p: Ponto, revelada = false) {
    if (passo.tipo !== 'posicao' || acabou || (!revelada && !aguardando)) return
    const raio = passo.raio ?? RAIO_POSICAO
    if (revelada || acertouPosicao(passo, p)) {
      setMarcas([{ pos: passo.certo, cor: VERDE, raio, rotulo: '✅' }])
      acertou(
        { revelada, titulo: revelada ? `👀 O lugar certo do ${numero(passo.jogador)}` : `✅ Isso! O ${numero(passo.jogador)} fica bem aí`, explicacao: passo.explicacao },
        aplicarPasso(cena, passo),
      )
    } else {
      setMarcas([{ pos: p, cor: VERMELHO, rotulo: '❌' }])
      errou({ titulo: '❌ Ainda não é o melhor lugar', explicacao: passo.explicacaoErro ?? 'Pense: onde ele ajuda mais o time? Olhe a bola, o gol e os adversários.' })
    }
  }

  // ----- encontre o erro -----
  function tocarSuspeito(id: string, revelada = false) {
    if (passo.tipo !== 'erro' || acabou || (!revelada && !aguardando)) return
    if (revelada || acertouErro(passo, id)) {
      setSelecionado(passo.errado)
      setMarcas(passo.corrigir ? [{ pos: passo.corrigir, cor: VERDE, raio: 0.05, rotulo: 'aqui' }] : [])
      acertou({ revelada, titulo: revelada ? `👀 Era o ${numero(passo.errado)}` : `✅ Achou! O ${numero(passo.errado)} está mal posicionado`, explicacao: passo.explicacao }, aplicarPasso(cena, passo))
    } else {
      setSelecionado(id)
      errou({ titulo: `❌ O ${numero(id)} está fazendo a parte dele`, explicacao: 'Procure outro: quem deixou um espaço, um adversário livre ou o gol desprotegido?' })
    }
  }

  function revelar() {
    setRevelou(true)
    if (jogada) escolher(opcaoCorreta(jogada), true)
    else if (passo.tipo === 'posicao') tocarLugar(passo.certo, true)
    else if (passo.tipo === 'erro') tocarSuspeito(passo.errado, true)
  }

  function continuar() {
    setPassoIdx((i) => i + 1)
    setRetorno(null)
    setEstados({})
    setMarcas([])
    setSelecionado(null)
  }

  function tentarDeNovo() {
    setRetorno(null)
    setEstados({})
    setMarcas([])
    if (!jogada) setSelecionado(null)
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
  const azuis = cena.jogadores.filter((j) => j.time === 'A').map((j) => j.id)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
        <span className="rounded-full bg-white px-2 py-0.5 shadow">
          {EMOJI_DIFICULDADE[puzzle.dificuldade]} {NOMES_DIFICULDADE[puzzle.dificuldade]}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 shadow">
          {EMOJI_CATEGORIA[puzzle.categoria]} {NOMES_CATEGORIA[puzzle.categoria]}
        </span>
        {puzzle.origem ? <span className="rounded-full bg-sky-100 px-2 py-0.5 shadow">{puzzle.origem}</span> : <span className="rounded-full bg-white px-2 py-0.5 shadow">⭐ {puzzle.rating}</span>}
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
        agem={aguardando && passo.tipo !== 'erro' ? agem : []}
        selecionado={jogada ? (aguardando ? escolhido : null) : selecionado}
        opcoes={jogada && (aguardando || (retorno && !retorno.certo)) ? opcoesVisiveis : []}
        estados={estados}
        interativa={aguardando}
        aoTocarJogador={passo.tipo === 'erro' ? (id) => tocarSuspeito(id) : setSelecionado}
        aoEscolher={(o) => escolher(o)}
        clicaveis={aguardando && passo.tipo === 'erro' ? azuis : []}
        aoTocarQuadra={aguardando && passo.tipo === 'posicao' ? (p) => tocarLugar(p) : undefined}
        marcas={marcas}
      />

      {/* O que fazer agora */}
      {aguardando && passo.tipo === 'posicao' && (
        <p className="text-center text-base font-bold">👆 Toque na quadra no lugar para onde o {numero(passo.jogador)} 🟡 deve ir</p>
      )}
      {aguardando && passo.tipo === 'erro' && <p className="text-center text-base font-bold">👆 Toque no jogador azul que está mal posicionado</p>}
      {/* Escolha pelos botões (mesmas jogadas das setas; também para o teclado) */}
      {aguardando && jogada && !escolhido && <p className="text-center text-base font-bold">👆 Toque no jogador que está piscando 🟡</p>}
      {aguardando && jogada && escolhido && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">
            Jogadas do {numero(escolhido)}: toque na seta na quadra ou aqui embaixo.
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
          <p className="text-xl font-extrabold">{retorno.titulo}</p>
          <p className="text-base">{retorno.explicacao}</p>
          {retorno.consequencia && !retorno.certo && <p className="text-base font-bold">⚠️ {retorno.consequencia}</p>}
          {!retorno.certo && (
            <button type="button" onClick={tentarDeNovo} className="min-h-12 rounded-2xl bg-white font-extrabold shadow">
              Tentar de novo 🔁
            </button>
          )}
          {retorno.certo && !ultimoPasso && (
            <button type="button" onClick={continuar} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
              Continuar ▶️
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

      {/* Fim: conceito, recado de quem criou e rating */}
      {tentativa && (
        <div className="flex flex-col gap-3">
          <div className="rounded-3xl border-4 border-emerald-400 bg-white p-3">
            <p className="text-lg font-extrabold">📘 O que aprender</p>
            <p className="text-base">{puzzle.conceito}</p>
          </div>
          {puzzle.comentario && (
            <div className="rounded-3xl border-4 border-sky-300 bg-sky-50 p-3">
              <p className="text-lg font-extrabold">🗣️ Recado {puzzle.autor ? `de ${puzzle.autor}` : 'do treinador'}</p>
              <p className="text-base whitespace-pre-line">{puzzle.comentario}</p>
            </div>
          )}
          {teste ? (
            <p className="text-center text-lg font-extrabold">🧪 Teste: {tentativa.acertou ? 'resolvido de primeira' : `${tentativa.erros} erro(s)`} (não conta no rating)</p>
          ) : (
            <p className={`text-center text-xl font-extrabold ${tentativa.delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {tentativa.acertou ? '🎉 Resolvido de primeira!' : tentativa.revelou ? '👀 Revelado' : '👍 Resolvido com erro'} · ⭐ {tentativa.rating} ({tentativa.delta >= 0 ? '+' : ''}
              {tentativa.delta})
            </p>
          )}
          <button type="button" onClick={aoProximo} className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
            {textoProximo}
          </button>
        </div>
      )}
    </div>
  )
}
