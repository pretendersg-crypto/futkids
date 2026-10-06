// Jogo "Monte o prato do campeão": a criança toca nos alimentos para colocar no prato.
// O prato tem a metade para protetores (verduras, legumes e frutas), um quarto para energia e um
// quarto para construtores. Uma lista mostra o que falta; o "de vez em quando" fica fora do prato.
import { useState } from 'react'
import { Link } from 'react-router'
import { Mascote } from '../../components/mascote/Mascote'
import { PainelRecompensa } from '../../components/ui/PainelRecompensa'
import { ALIMENTOS, turmaPorId, type Alimento, type IdTurma } from '../../data/alimentacao'
import { destravarSom, sons } from '../../utils/som'
import { finalizarJogoComida, type ResultadoJogoComida } from './premio'

const MAXIMO_NO_PRATO = 6

/** Alimentos oferecidos: alguns de cada turma, embaralhados */
function sortearOpcoes(): Alimento[] {
  const quantos: Record<IdTurma, number> = { energia: 3, construtor: 3, protetor: 4, vezEmQuando: 2 }
  const embaralhados = [...ALIMENTOS].sort(() => Math.random() - 0.5)
  return (Object.keys(quantos) as IdTurma[]).flatMap((t) => embaralhados.filter((a) => a.turma === t).slice(0, quantos[t])).sort(() => Math.random() - 0.5)
}

function regras(prato: Alimento[]) {
  const conta = (t: IdTurma) => prato.filter((a) => a.turma === t).length
  return [
    { texto: '2 protetores 🛡️ (verdura, legume ou fruta)', ok: conta('protetor') >= 2 },
    { texto: '1 de energia ⚡', ok: conta('energia') >= 1 },
    { texto: '1 construtor 💪', ok: conta('construtor') >= 1 },
    { texto: 'Nada de "de vez em quando" 🎈', ok: conta('vezEmQuando') === 0 },
  ]
}

/** Posições (em %) dentro de cada parte do prato, para os emojis não ficarem um em cima do outro */
const LUGARES: Record<Exclude<IdTurma, 'vezEmQuando'>, [number, number][]> = {
  protetor: [[26, 30], [24, 55], [34, 75], [38, 42], [14, 44], [30, 62]],
  energia: [[68, 26], [80, 38], [62, 40], [74, 16], [86, 26], [70, 46]],
  construtor: [[68, 64], [80, 58], [64, 78], [76, 80], [86, 68], [72, 70]],
}

export function MontePrato() {
  const [partida, setPartida] = useState(0)
  return <Partida key={partida} aoJogarDeNovo={() => setPartida((p) => p + 1)} />
}

function Partida({ aoJogarDeNovo }: { aoJogarDeNovo: () => void }) {
  const [opcoes] = useState(sortearOpcoes)
  const [prato, setPrato] = useState<Alimento[]>([])
  const [conferido, setConferido] = useState(false)
  const [resultado, setResultado] = useState<ResultadoJogoComida | null>(null)
  const lista = regras(prato)
  const tudoCerto = lista.every((r) => r.ok)

  function alternar(a: Alimento) {
    destravarSom()
    setConferido(false)
    setPrato((p) => (p.includes(a) ? p.filter((x) => x !== a) : p.length >= MAXIMO_NO_PRATO ? p : [...p, a]))
  }

  function pronto() {
    setConferido(true)
    if (!tudoCerto) return sons.gol()
    sons.vitoria()
    setResultado(finalizarJogoComida('prato', lista.length, lista.length, 'prato-campeao'))
  }

  const noPrato = (t: Exclude<IdTurma, 'vezEmQuando'>) => prato.filter((a) => a.turma === t)
  const naMesa = prato.filter((a) => a.turma === 'vezEmQuando')

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center text-2xl font-extrabold">🍽️ Monte o prato do campeão</h1>

      {/* O prato: metade protetores (esquerda), um quarto energia (cima) e um quarto construtores (baixo) */}
      <div className="relative mx-auto aspect-square w-full max-w-72" aria-label={`Prato com: ${prato.map((a) => a.nome).join(', ') || 'nada ainda'}`} role="img">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
          <path d="M50 6 A44 44 0 0 0 50 94 Z" fill="#DCFCE7" />
          <path d="M50 6 A44 44 0 0 1 94 50 L50 50 Z" fill="#FEF9C3" />
          <path d="M94 50 A44 44 0 0 1 50 94 L50 50 Z" fill="#FFE4E6" />
          <line x1="50" y1="6" x2="50" y2="94" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="50" y1="50" x2="94" y2="50" stroke="#FFFFFF" strokeWidth="2" />
          <text x="27" y="12" fontSize="6" textAnchor="middle" fill="#166534" fontWeight="700">🛡️ protetores</text>
          <text x="74" y="9" fontSize="5" textAnchor="middle" fill="#854D0E" fontWeight="700">⚡ energia</text>
          <text x="74" y="95" fontSize="5" textAnchor="middle" fill="#9F1239" fontWeight="700">💪 construtores</text>
        </svg>
        {(['protetor', 'energia', 'construtor'] as const).flatMap((t) =>
          noPrato(t).map((a, i) => {
            const [x, y] = LUGARES[t][i % LUGARES[t].length]
            return (
              <span key={a.id} aria-hidden className="pop absolute -translate-1/2 text-4xl" style={{ left: `${x}%`, top: `${y}%` }}>
                {a.emoji}
              </span>
            )
          }),
        )}
      </div>
      {naMesa.length > 0 && (
        <p className="text-center text-base font-bold">
          Fora do prato (de vez em quando): {naMesa.map((a) => a.emoji).join(' ')}
        </p>
      )}

      {resultado ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <Mascote humor="comemorando" fala="Prato de campeão! Colorido e com todas as turmas! 🏆" tamanho={72} />
          {resultado.recompensa ? (
            <PainelRecompensa xp={resultado.xp} moedas={resultado.moedas} {...resultado.recompensa} />
          ) : (
            <p className="rounded-2xl bg-white p-3 text-lg font-bold">O prêmio deste jogo já saiu hoje. Volte amanhã! 😉</p>
          )}
          <div className="grid w-full grid-cols-2 gap-3">
            <button type="button" onClick={aoJogarDeNovo} className="min-h-16 rounded-3xl border-4 border-rose-300 bg-white text-xl font-extrabold">
              De novo 🔁
            </button>
            <Link to="/alimentacao" className="grid min-h-16 place-items-center rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
              Comida 🍎
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* O que o prato precisa ter */}
          <ul className="flex flex-col gap-1 rounded-2xl bg-white p-3 text-base font-bold">
            {lista.map((r) => (
              <li key={r.texto} className={r.ok ? 'text-green-800' : conferido ? 'text-red-700' : ''}>
                {r.ok ? '✅' : conferido ? '❌' : '⬜'} {r.texto}
              </li>
            ))}
          </ul>

          <p className="text-center text-base font-bold">
            Toque para colocar ou tirar ({prato.length}/{MAXIMO_NO_PRATO})
          </p>
          <ul className="grid grid-cols-4 gap-2">
            {opcoes.map((a) => {
              const escolhido = prato.includes(a)
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    aria-pressed={escolhido}
                    aria-label={`${a.nome}, ${turmaPorId(a.turma).nome}`}
                    onClick={() => alternar(a)}
                    className={`flex h-full min-h-20 w-full flex-col items-center justify-center rounded-2xl border-4 bg-white text-xs leading-tight font-bold ${
                      escolhido ? 'border-campo-escuro shadow-md' : 'border-rose-100'
                    }`}
                  >
                    <span aria-hidden className="text-3xl">
                      {a.emoji}
                    </span>
                    {a.nome}
                  </button>
                </li>
              )
            })}
          </ul>

          {conferido && !tudoCerto && (
            <p role="status" className="rounded-2xl bg-yellow-100 p-3 text-center text-lg font-bold">
              Quase! Olhe a lista: falta o que está com ❌.
            </p>
          )}
          <button
            type="button"
            disabled={prato.length < 3}
            onClick={pronto}
            className="min-h-16 rounded-3xl bg-sol text-2xl font-extrabold shadow-lg disabled:opacity-50"
          >
            Pronto! 🍽️
          </button>
        </>
      )}
    </div>
  )
}
