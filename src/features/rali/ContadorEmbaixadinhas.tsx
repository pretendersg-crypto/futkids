// Embaixadinhas com bola de verdade: o celular fica parado no chão e alguém (um adulto ou a
// própria criança) toca +1 a cada embaixadinha. Sem cronômetro: termina quando quiser.
import { useState } from 'react'
import { destravarSom, sons } from '../../utils/som'
import { FimRali } from './FimRali'
import { finalizarRali, type ResultadoRali } from './pontuacao'

export function ContadorEmbaixadinhas() {
  const [sequencia, setSequencia] = useState(0)
  const [melhor, setMelhor] = useState(0)
  const [total, setTotal] = useState(0)
  const [resultado, setResultado] = useState<ResultadoRali | null>(null)

  function mais1() {
    destravarSom()
    sons.toque(sequencia + 1)
    setSequencia((s) => s + 1)
    setMelhor((m) => Math.max(m, sequencia + 1))
    setTotal((t) => t + 1)
  }

  function caiu() {
    if (sequencia > 0) sons.gol()
    setSequencia(0)
  }

  function recomecar() {
    setSequencia(0)
    setMelhor(0)
    setTotal(0)
    setResultado(null)
  }

  if (resultado) {
    return <FimRali resultado={resultado} detalhes={[`⚽ ${total} embaixadinhas no total`, `🔥 Maior sequência: ${melhor}`]} aoJogarDeNovo={recomecar} />
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-2xl bg-yellow-100 p-3 text-center text-base font-bold">
        📱⬇️ Deixe o celular no chão, longe da bola. Toque +1 a cada embaixadinha.
      </p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <p className="rounded-2xl bg-white py-1 shadow-sm">
          <span className="block text-xs font-bold">🔥 Agora</span>
          <span key={sequencia} className="pop inline-block text-3xl font-black">
            {sequencia}
          </span>
        </p>
        <p className="rounded-2xl bg-white py-1 shadow-sm">
          <span className="block text-xs font-bold">🏅 Melhor</span>
          <span className="text-3xl font-black">{melhor}</span>
        </p>
        <p className="rounded-2xl bg-white py-1 shadow-sm">
          <span className="block text-xs font-bold">⚽ Total</span>
          <span className="text-3xl font-black">{total}</span>
        </p>
      </div>

      {/* Botão gigante: dá para acertar sem olhar direito, com a bola no ar */}
      <button
        type="button"
        onClick={mais1}
        className="min-h-[38vh] rounded-[2.5rem] border-8 border-lime-400 bg-lime-100 text-7xl font-black shadow-lg active:scale-95"
      >
        +1 ⚽
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={caiu} className="min-h-16 rounded-3xl border-4 border-orange-300 bg-white text-xl font-extrabold">
          Caiu 😅
        </button>
        <button
          type="button"
          disabled={total === 0}
          // Pontos = total do dia (o esforço todo conta); a melhor sequência aparece nos detalhes
          onClick={() => setResultado(finalizarRali('contador', total, { embaixadinhas: total }))}
          className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow disabled:opacity-50"
        >
          Terminar ✅
        </button>
      </div>
    </div>
  )
}
