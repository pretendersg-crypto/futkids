// Um drill de reação (/reacao/:drill): como montar → execução em tela cheia → resultado.
import { useCallback, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { drillPorId, minutosDoDrill, resumoSinais, type Drill } from '../features/reacao/drills'
import { ExecutarDrill } from '../features/reacao/ExecutarDrill'
import { finalizarDrill, type Placar, type ResultadoDrill } from '../features/reacao/finalizar'
import { FimDrill } from '../features/reacao/FimDrill'
import { falar, temVoz } from '../features/reacao/voz'
import { useReacaoStore } from '../stores/reacaoStore'
import { destravarSom } from '../utils/som'

export function DrillReacao() {
  const criados = useReacaoStore((s) => s.drills)
  const drill = drillPorId(useParams().drill, criados)
  if (!drill) return <Navigate to="/reacao" replace />
  return <TelaDrill key={drill.id} drill={drill} />
}

function TelaDrill({ drill }: { drill: Drill }) {
  const [rodada, setRodada] = useState(0)
  const [rodando, setRodando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoDrill | null>(null)

  function comecar() {
    // Som e voz só funcionam depois de um toque: libera os dois aqui
    destravarSom()
    if (drill.voz) falar('Vamos lá!')
    setResultado(null)
    setRodada((r) => r + 1)
    setRodando(true)
  }

  const aoTerminar = useCallback(
    (placar: Placar, completo: boolean, duracaoS: number) => {
      setRodando(false)
      setResultado(finalizarDrill(drill, placar, completo, duracaoS))
    },
    [drill],
  )

  if (rodando) return <ExecutarDrill key={rodada} drill={drill} aoTerminar={aoTerminar} />
  if (resultado) return <FimDrill resultado={resultado} aoRepetir={comecar} />

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/reacao" aria-label="Voltar" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">
          <span aria-hidden>{drill.emoji} </span>
          {drill.nome}
        </h1>
      </header>

      <section className="flex flex-col gap-2 rounded-3xl border-4 border-teal-300 bg-teal-50 p-4">
        <h2 className="text-xl font-extrabold">{drill.modo === 'toque' ? '👆 Na tela' : '📱 Celular no chão'}</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
          {drill.instrucoes.map((passo) => (
            <li key={passo}>{passo}</li>
          ))}
          {drill.instrucoes.length === 0 && <li>Reaja ao sinal o mais rápido que puder!</li>}
        </ol>
      </section>

      <ul className="flex flex-wrap gap-2 text-base font-bold">
        <li className="rounded-full bg-white px-3 py-1 shadow">🚦 {resumoSinais(drill)}</li>
        <li className="rounded-full bg-white px-3 py-1 shadow">
          🔁 {drill.series} × {drill.repeticoes} sinais
        </li>
        {drill.series > 1 && drill.descansoS > 0 && <li className="rounded-full bg-white px-3 py-1 shadow">💧 {drill.descansoS} s de descanso</li>}
        <li className="rounded-full bg-white px-3 py-1 shadow">⏱️ uns {minutosDoDrill(drill)} min</li>
        {drill.voz && temVoz() && <li className="rounded-full bg-white px-3 py-1 shadow">🗣️ fala o sinal</li>}
      </ul>

      {drill.modo === 'auto' && (
        <p className="rounded-2xl bg-yellow-100 p-3 text-base">
          👨‍👩‍👧 Um adulto por perto. Deixe o celular apoiado onde a bola não pegue, e o espaço livre de móveis.
        </p>
      )}

      <button type="button" onClick={comecar} className="min-h-18 rounded-3xl bg-sol text-2xl font-extrabold shadow-lg">
        Começar ▶️
      </button>
    </div>
  )
}
