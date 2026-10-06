// Mostra como fazer o exercício: o GIF próprio dos pais (se tiver) ou o bonequinho animado.
import type { Exercicio } from '../../data/catalogo'
import { useImagemLocal } from '../../hooks/useImagemLocal'
import { BonecoAnimado } from './BonecoAnimado'

interface Props {
  exercicio: Pick<Exercicio, 'animacao' | 'ritmoMs' | 'gif' | 'nome'>
  tamanho?: number
  /** Ritmo diferente do exercício (ex.: parte devagar dos intervalos) */
  ritmoMs?: number
  pausado?: boolean
}

export function Demonstracao({ exercicio, tamanho = 150, ritmoMs, pausado = false }: Props) {
  const gif = useImagemLocal(exercicio.gif)
  if (exercicio.gif && gif) {
    return (
      <img
        src={gif}
        alt={`Como fazer: ${exercicio.nome}`}
        style={{ width: tamanho, height: tamanho * 1.22 }}
        className="rounded-2xl bg-white object-contain"
      />
    )
  }
  return <BonecoAnimado animacao={exercicio.animacao} ritmoMs={ritmoMs ?? exercicio.ritmoMs} tamanho={tamanho} pausado={pausado} />
}
