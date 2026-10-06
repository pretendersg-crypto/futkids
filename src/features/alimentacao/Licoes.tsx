// Lições curtas com o Bolinha: cada lição tem 3 frases, mostradas uma de cada vez.
// A primeira vez que termina uma lição dá um pouquinho de XP.
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Mascote } from '../../components/mascote/Mascote'
import { LICOES } from '../../data/alimentacao'
import { useAlimentacaoStore } from '../../stores/alimentacaoStore'
import { entregarRecompensa } from '../../stores/progressStore'
import { destravarSom, sons } from '../../utils/som'

const PREMIO_LICAO = { xp: 5, moedas: 1 }

/** Lista das lições */
export function ListaLicoes() {
  const vistas = useAlimentacaoStore((s) => s.licoesVistas)
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center text-2xl font-extrabold">📖 Aprender com o Bolinha</h1>
      <p className="text-center text-base font-bold">
        {vistas.length} de {LICOES.length} lições
      </p>
      <ul className="grid grid-cols-2 gap-3">
        {LICOES.map((l) => (
          <li key={l.id}>
            <Link
              to={`/alimentacao/aprender/${l.id}`}
              className={`relative flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl border-4 p-2 text-center text-lg leading-tight font-extrabold ${
                vistas.includes(l.id) ? 'border-green-400 bg-green-50' : 'border-rose-300 bg-white'
              }`}
            >
              <span aria-hidden className="text-4xl">
                {l.emoji}
              </span>
              {l.titulo}
              {vistas.includes(l.id) && (
                <span aria-label="lição vista" className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-green-700 text-sm text-white">
                  ✓
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Uma lição, frase por frase (a key reinicia tudo ao trocar de lição) */
export function LicaoAberta() {
  const { licao: id } = useParams()
  const licao = LICOES.find((l) => l.id === id)
  if (!licao) return <p className="text-center text-lg">Lição não encontrada.</p>
  return <Licao key={licao.id} licao={licao} />
}

function Licao({ licao }: { licao: (typeof LICOES)[number] }) {
  const [frase, setFrase] = useState(0)
  const [concluida, setConcluida] = useState(false)
  const [ganhou, setGanhou] = useState(false)
  const ultima = frase >= licao.frases.length - 1
  const proxima = LICOES[LICOES.indexOf(licao) + 1]

  function avancar() {
    destravarSom()
    if (!ultima) {
      sons.toque(frase + 1)
      return setFrase((f) => f + 1)
    }
    const primeiraVez = !useAlimentacaoStore.getState().licoesVistas.includes(licao.id)
    useAlimentacaoStore.getState().verLicao(licao.id)
    setConcluida(true)
    sons.concluido()
    if (primeiraVez) {
      entregarRecompensa(PREMIO_LICAO.xp, PREMIO_LICAO.moedas)
      setGanhou(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span aria-hidden className="text-7xl">
        {licao.emoji}
      </span>
      <h1 className="text-2xl font-extrabold">{licao.titulo}</h1>
      <p className="text-sm font-bold">
        {frase + 1} de {licao.frases.length}
      </p>
      <div key={frase} className="entrada-tela w-full">
        <Mascote humor={concluida ? 'comemorando' : 'feliz'} fala={licao.frases[frase]} balao="baixo" tamanho={88} />
      </div>
      {ganhou && (
        <p role="status" className="pop rounded-3xl border-4 border-yellow-400 bg-yellow-100 px-6 py-2 text-xl font-extrabold">
          ⭐ +{PREMIO_LICAO.xp} XP 🪙 +{PREMIO_LICAO.moedas}
        </p>
      )}
      <div className="grid w-full grid-cols-2 gap-3">
        <Link to="/alimentacao/aprender" className="grid min-h-16 place-items-center rounded-3xl border-4 border-rose-300 bg-white text-lg font-extrabold">
          Lições 📖
        </Link>
        {concluida ? (
          <Link
            to={proxima ? `/alimentacao/aprender/${proxima.id}` : '/alimentacao'}
            className="grid min-h-16 place-items-center rounded-3xl bg-sol text-lg font-extrabold shadow-lg"
          >
            {proxima ? `Próxima ${proxima.emoji}` : 'Comida 🍎'}
          </Link>
        ) : (
          <button type="button" onClick={avancar} className="min-h-16 rounded-3xl bg-sol text-lg font-extrabold shadow-lg">
            {ultima ? 'Entendi! ✅' : 'Próximo ➡️'}
          </button>
        )}
      </div>
    </div>
  )
}
