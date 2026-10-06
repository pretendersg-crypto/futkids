// Um desafio do Rali (/rali/:desafio). Os desafios na tela têm início (como jogar + escolher
// inclinar ou dedo) → jogo → resultado; os de bola e de corpo têm o próprio fluxo.
import { useCallback, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { pedirPermissaoMovimento } from '../hooks/useSensor'
import { ContadorEmbaixadinhas } from '../features/rali/ContadorEmbaixadinhas'
import type { Controle } from '../features/rali/controle'
import { desafioPorId, type Desafio } from '../features/rali/desafios'
import { FimRali } from '../features/rali/FimRali'
import { JogoConducao } from '../features/rali/JogoConducao'
import { JogoEmbaixadinha } from '../features/rali/JogoEmbaixadinha'
import { JogoPasseChute } from '../features/rali/JogoPasseChute'
import { finalizarRali, type ResultadoRali } from '../features/rali/pontuacao'
import { SaltosGoleiro } from '../features/rali/SaltosGoleiro'
import { useProgressStore } from '../stores/progressStore'
import { destravarSom } from '../utils/som'

export function JogoRali() {
  const desafio = desafioPorId(useParams().desafio)
  if (!desafio) return <Navigate to="/rali" replace />

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <Link to="/rali" aria-label="Sair do desafio" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ✖️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">
          <span aria-hidden>{desafio.emoji} </span>
          {desafio.nome}
        </h1>
      </header>
      {desafio.id === 'contador' && <ContadorEmbaixadinhas />}
      {desafio.id === 'saltos' && <SaltosGoleiro />}
      {desafio.tipo === 'tela' && <DesafioNaTela key={desafio.id} desafio={desafio} />}
    </div>
  )
}

interface Fim {
  resultado: ResultadoRali
  detalhes: string[]
}

function DesafioNaTela({ desafio }: { desafio: Desafio }) {
  const recorde = useProgressStore((s) => s.recordes[`rali:${desafio.id}`])
  const [controle, setControle] = useState<Controle | null>(null)
  const [partida, setPartida] = useState(0)
  const [fim, setFim] = useState<Fim | null>(null)

  async function comecar(escolha: Controle) {
    destravarSom()
    // Pedir a permissão do sensor precisa acontecer no toque (exigência do iPhone)
    if (escolha === 'inclinar') await pedirPermissaoMovimento()
    setFim(null)
    setControle(escolha)
    setPartida((p) => p + 1)
  }

  // Fim de cada jogo (chamado uma vez, quando o tempo acaba): recompensa + números da partida
  const terminarEmbaixadinha = useCallback((r: { pontos: number; toques: number; maiorCombo: number }) => {
    setFim({
      resultado: finalizarRali('embaixadinha', r.pontos, { embaixadinhas: r.toques }),
      detalhes: [`👟 ${r.toques} toques na bola`, `🔥 Maior combo: ${r.maiorCombo}`],
    })
  }, [])
  const terminarConducao = useCallback((r: { pontos: number; portoes: number; maiorCombo: number }) => {
    setFim({ resultado: finalizarRali('conducao', r.pontos), detalhes: [`🚧 ${r.portoes} portões`, `🔥 Maior combo: ${r.maiorCombo}`] })
  }, [])
  const terminarPasseChute = useCallback((r: { pontos: number; passes: number; gols: number; maiorCombo: number }) => {
    setFim({
      resultado: finalizarRali('passe-chute', r.pontos),
      detalhes: [`👟 ${r.passes} passes certos`, `⚽ ${r.gols} gols`, `🔥 Maior combo: ${r.maiorCombo}`],
    })
  }, [])

  if (fim) return <FimRali resultado={fim.resultado} detalhes={fim.detalhes} aoJogarDeNovo={() => controle && comecar(controle)} />

  if (!controle) {
    return (
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <ol className="flex w-full flex-col gap-2 text-left text-lg">
          {desafio.comoJogar.map((passo, i) => (
            <li key={passo} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-lime-600 font-black text-white">
                {i + 1}
              </span>
              {passo}
            </li>
          ))}
        </ol>
        <p className="text-lg">{recorde !== undefined ? `🏅 Seu recorde: ${recorde} pontos` : '✨ Primeira vez! Boa sorte!'}</p>
        {desafio.usaInclinacao ? (
          <>
            <p className="text-xl font-extrabold">Como você quer jogar?</p>
            <div className="grid w-full grid-cols-2 gap-3">
              <button type="button" onClick={() => comecar('inclinar')} className="flex min-h-24 flex-col items-center justify-center rounded-3xl bg-sol text-lg font-extrabold shadow-lg">
                <span aria-hidden className="text-4xl">
                  📱
                </span>
                Inclinando
              </button>
              <button
                type="button"
                onClick={() => comecar('dedo')}
                className="flex min-h-24 flex-col items-center justify-center rounded-3xl border-4 border-lime-400 bg-white text-lg font-extrabold"
              >
                <span aria-hidden className="text-4xl">
                  👆
                </span>
                Com o dedo
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => comecar('dedo')} className="min-h-16 w-full rounded-3xl bg-sol text-2xl font-extrabold shadow-lg">
            Jogar! ▶️
          </button>
        )}
      </div>
    )
  }

  if (desafio.id === 'embaixadinha') return <JogoEmbaixadinha key={partida} controle={controle} aoTerminar={terminarEmbaixadinha} />
  if (desafio.id === 'conducao') return <JogoConducao key={partida} controle={controle} aoTerminar={terminarConducao} />
  return <JogoPasseChute key={partida} aoTerminar={terminarPasseChute} />
}
