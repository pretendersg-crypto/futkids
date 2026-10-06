// Antes de cada exercício: o que fazer, quanto tempo/quantas vezes, exemplo e botão de começar.
import { useState } from 'react'
import { VideoPlayerModal } from '../../components/video/VideoPlayerModal'
import { videoPorId, type Exercicio } from '../../data/catalogo'
import { BonecoAnimado } from './BonecoAnimado'
import { descreverMeta } from './recompensa'

interface Props {
  exercicio: Exercicio
  /** Mensagem sobre o exercício anterior ("Muito bem!"), se houver */
  aviso?: string
  aoComecar: () => void
}

export function ApresentarExercicio({ exercicio, aviso, aoComecar }: Props) {
  const [exemploAberto, setExemploAberto] = useState(false)

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {aviso && <p className="w-full rounded-2xl bg-green-100 p-3 text-xl font-extrabold">{aviso}</p>}

      <h2 className="text-3xl font-extrabold">
        <span aria-hidden>{exercicio.emoji} </span>
        {exercicio.nome}
      </h2>
      <p className="rounded-full bg-orange-100 px-4 py-1 text-xl font-bold">{descreverMeta(exercicio)}</p>

      <BonecoAnimado animacao={exercicio.animacao} ritmoMs={exercicio.ritmoMs} tamanho={140} />

      <ol className="flex w-full flex-col gap-2 text-left text-lg">
        {exercicio.passos.map((passo, i) => (
          <li key={passo} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
            <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-fogo font-black text-white">
              {i + 1}
            </span>
            {passo}
          </li>
        ))}
      </ol>

      {/* Botões grudados logo acima da barra inferior: aparecem mesmo quando os passos são longos */}
      <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] grid w-full grid-cols-2 gap-3 bg-campo-claro/95 py-2">
        <button
          type="button"
          onClick={() => setExemploAberto(true)}
          className="min-h-16 rounded-3xl border-4 border-orange-300 bg-white text-lg font-extrabold whitespace-nowrap"
        >
          Ver exemplo 🎥
        </button>
        <button type="button" onClick={aoComecar} className="min-h-16 rounded-3xl bg-sol text-lg font-extrabold whitespace-nowrap shadow-lg">
          Começar ▶️
        </button>
      </div>

      <VideoPlayerModal
        aberto={exemploAberto}
        aoFechar={() => setExemploAberto(false)}
        titulo={exercicio.nome}
        video={videoPorId(exercicio.videoId)}
        alternativa={
          <div className="flex flex-col items-center gap-2">
            <BonecoAnimado animacao={exercicio.animacao} ritmoMs={exercicio.ritmoMs} tamanho={220} />
            <p className="text-center text-lg">Faça igual ao bonequinho! 👆</p>
          </div>
        }
      />
    </div>
  )
}
