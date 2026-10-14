// Um lance da prancheta (/tatica/lance/:lance): sistemas de jogo que vêm no app e os lances que o
// treinador ou os pais criaram.
import { Link, Navigate, useParams } from 'react-router'
import { usePranchetas } from '../features/tatica/fontes'
import { VerPrancheta } from '../features/tatica/VerPrancheta'
import { EMOJI_CATEGORIA, NOMES_CATEGORIA } from '../features/tatica/tipos'

export function LanceTatico() {
  const id = useParams().lance
  const prancheta = usePranchetas().find((p) => p.id === id)
  if (!prancheta) return <Navigate to="/tatica?aba=lances" replace />

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <Link to="/tatica?aba=lances" aria-label="Voltar aos lances" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl leading-tight font-extrabold">{prancheta.titulo}</h1>
          <p className="text-sm font-bold">
            {EMOJI_CATEGORIA[prancheta.categoria]} {NOMES_CATEGORIA[prancheta.categoria]}
            {prancheta.origem && ` · ${prancheta.origem}`}
          </p>
        </div>
      </header>
      {prancheta.descricao && <p className="text-base">{prancheta.descricao}</p>}
      <VerPrancheta key={prancheta.id} prancheta={prancheta} />
    </section>
  )
}
