// Minijogo "Posição" (visto de cima): a bola aparece em algum lugar da área e a criança escolhe
// onde o goleiro deve ficar. A resposta certa é onde a bissetriz do ângulo bola→traves cruza a
// linha em que o goleiro fica (um pouco à frente do gol). Sem pressa: depois de cada resposta
// o app desenha as linhas e explica.
import { useState } from 'react'
import { sons } from '../../utils/som'
import { RODADAS, type NivelGoleiro } from './niveis'
import { PlacarRodadas } from './PlacarRodadas'

interface Props {
  nivel: NivelGoleiro
  aoTerminar: (historico: boolean[]) => void
}

// Coordenadas do desenho (viewBox 0 0 100 110): gol em cima, traves em x=15 e x=85
const TRAVE_E = { x: 15, y: 6 }
const TRAVE_D = { x: 85, y: 6 }
/** Linha onde o goleiro fica (um passo à frente do gol) */
const LINHA_GOLEIRO = 16

interface Rodada {
  bola: { x: number; y: number }
  opcoes: number[]
  /** Índice da opção certa */
  certa: number
  /** Ponto ideal (onde a bissetriz cruza a linha do goleiro) */
  ideal: number
}

/** Onde a bissetriz do ângulo formado pela bola e as duas traves cruza a linha do goleiro */
function pontoIdeal(bola: { x: number; y: number }): number {
  const unit = (p: { x: number; y: number }) => {
    const dx = p.x - bola.x
    const dy = p.y - bola.y
    const d = Math.hypot(dx, dy)
    return { x: dx / d, y: dy / d }
  }
  const u1 = unit(TRAVE_E)
  const u2 = unit(TRAVE_D)
  const dir = { x: u1.x + u2.x, y: u1.y + u2.y }
  const t = (LINHA_GOLEIRO - bola.y) / dir.y
  return bola.x + t * dir.x
}

function sortearRodada(quantidade: number): Rodada {
  // Opções um pouco para dentro das traves: é a faixa onde o ponto ideal realmente cai
  const inicio = TRAVE_E.x + 10
  const fim = TRAVE_D.x - 10
  const espaco = (fim - inicio) / (quantidade - 1)
  const opcoes = Array.from({ length: quantidade }, (_, i) => inicio + i * espaco)
  // Sorteia PRIMEIRO qual opção será a certa (senão o meio ganharia quase sempre e a criança
  // aprenderia a "chutar" o meio) e depois uma posição de bola que leve a ela, sem empate.
  const desejada = Math.floor(Math.random() * quantidade)
  let reserva: Rodada | null = null
  for (let tentativa = 0; tentativa < 2000; tentativa++) {
    const bola = { x: 6 + Math.random() * 88, y: 26 + Math.random() * 74 }
    const ideal = pontoIdeal(bola)
    const distancias = opcoes.map((o) => Math.abs(o - ideal))
    const ordenadas = [...distancias].sort((a, b) => a - b)
    if (ordenadas[1] - ordenadas[0] < espaco * 0.3) continue // ambígua
    const rodada = { bola, opcoes, certa: distancias.indexOf(ordenadas[0]), ideal }
    if (rodada.certa === desejada) return rodada
    reserva ??= rodada
  }
  // Garantia: se não achar a desejada (não deve acontecer), usa qualquer rodada clara
  return reserva ?? { bola: { x: 50, y: 60 }, opcoes, certa: Math.floor(quantidade / 2), ideal: 50 }
}

export function JogoPosicionamento({ nivel, aoTerminar }: Props) {
  const [rodada, setRodada] = useState(() => sortearRodada(nivel.posicionamento.opcoes))
  const [escolha, setEscolha] = useState<number | null>(null)
  const [historico, setHistorico] = useState<boolean[]>([])

  function escolher(i: number) {
    if (escolha !== null) return
    const acertou = i === rodada.certa
    if (acertou) sons.defesa()
    else sons.gol()
    setEscolha(i)
    setHistorico((h) => [...h, acertou])
  }

  function proxima() {
    if (historico.length >= RODADAS) {
      aoTerminar(historico)
      return
    }
    setRodada(sortearRodada(nivel.posicionamento.opcoes))
    setEscolha(null)
  }

  const respondeu = escolha !== null
  const acertou = escolha === rodada.certa
  const { bola } = rodada

  return (
    <div className="flex flex-col gap-3">
      <PlacarRodadas historico={historico} rotulo={{ singular: 'acerto', plural: 'acertos', emoji: '🎯' }} />
      <p className="text-center text-lg font-bold">Onde o goleiro deve ficar? 🤔</p>

      <div className="relative w-full select-none" style={{ aspectRatio: '100 / 110' }}>
        <svg viewBox="0 0 100 110" className="absolute inset-0 size-full overflow-hidden rounded-3xl border-4 border-white shadow-lg" aria-hidden>
          <rect width="100" height="110" fill="#22C55E" />
          {[0, 2, 4, 6].map((i) => (
            <rect key={i} y={i * 18 + 6} width="100" height="9" fill="#16A34A" />
          ))}
          {/* Rede, linha do gol, grande área, pequena área e marca do pênalti */}
          <rect x={TRAVE_E.x} y="0" width={TRAVE_D.x - TRAVE_E.x} height={TRAVE_E.y} fill="#FFFFFF" opacity="0.6" />
          <line x1="0" y1={TRAVE_E.y} x2="100" y2={TRAVE_E.y} stroke="#FFFFFF" strokeWidth="1" />
          <rect x="3" y={TRAVE_E.y} width="94" height="56" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <rect x="28" y={TRAVE_E.y} width="44" height="16" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="50" cy="48" r="0.9" fill="#FFFFFF" />
          <circle cx={TRAVE_E.x} cy={TRAVE_E.y} r="1.6" fill="#FFFFFF" />
          <circle cx={TRAVE_D.x} cy={TRAVE_D.y} r="1.6" fill="#FFFFFF" />

          {/* Depois da resposta: o ângulo da bola até as traves e o meio dele */}
          {respondeu && (
            <g>
              <polygon points={`${bola.x},${bola.y} ${TRAVE_E.x},${TRAVE_E.y} ${TRAVE_D.x},${TRAVE_D.y}`} fill="#FACC15" opacity="0.25" />
              <line x1={bola.x} y1={bola.y} x2={TRAVE_E.x} y2={TRAVE_E.y} stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="2 1.5" />
              <line x1={bola.x} y1={bola.y} x2={TRAVE_D.x} y2={TRAVE_D.y} stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="2 1.5" />
              <line x1={bola.x} y1={bola.y} x2={rodada.ideal} y2={LINHA_GOLEIRO} stroke="#FACC15" strokeWidth="1.2" />
            </g>
          )}
          <text x={bola.x} y={bola.y} textAnchor="middle" dominantBaseline="central" fontSize="8">
            ⚽
          </text>
        </svg>

        {/* Opções: luvas na linha do goleiro */}
        {rodada.opcoes.map((x, i) => {
          const certa = respondeu && i === rodada.certa
          const errada = respondeu && i === escolha && !acertou
          return (
            <button
              key={i}
              type="button"
              disabled={respondeu}
              onClick={() => escolher(i)}
              aria-label={`Lugar ${i + 1} de ${rodada.opcoes.length}${certa ? ', o certo' : ''}`}
              className={`absolute grid size-12 -translate-1/2 place-items-center rounded-full border-4 text-2xl shadow ${
                certa ? 'border-campo bg-sol' : errada ? 'border-red-600 bg-red-100' : 'border-white bg-white/80'
              }`}
              style={{ left: `${x}%`, top: `${(LINHA_GOLEIRO / 110) * 100}%` }}
            >
              <span aria-hidden>🧤</span>
              {certa && (
                <span aria-hidden className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-campo text-xs font-black text-white">
                  ✓
                </span>
              )}
              {errada && (
                <span aria-hidden className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-red-600 text-xs font-black text-white">
                  ✗
                </span>
              )}
            </button>
          )
        })}
      </div>

      {respondeu && (
        <div className="flex flex-col gap-3" role="status">
          <p className={`rounded-2xl p-3 text-center text-lg font-bold ${acertou ? 'bg-yellow-100' : 'bg-white'}`}>
            {acertou
              ? 'Isso! 👏 Você fechou o ângulo da bola.'
              : 'Quase! O melhor lugar fica no meio do caminho entre a bola e as duas traves (a linha amarela).'}
          </p>
          <button type="button" onClick={proxima} className="min-h-14 rounded-2xl bg-sol text-xl font-extrabold shadow">
            {historico.length >= RODADAS ? 'Ver resultado 🏁' : 'Próxima ➡️'}
          </button>
        </div>
      )}
    </div>
  )
}
