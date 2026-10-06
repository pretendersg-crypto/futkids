// Conteúdo provisório das telas que ainda serão implementadas nas próximas etapas.
import type { Modulo } from '../../data/modulos'

interface Props {
  modulo: Modulo
}

export function TelaEmConstrucao({ modulo }: Props) {
  return (
    <section className="flex flex-col items-center gap-4 pt-10 text-center">
      <span aria-hidden className="text-8xl">
        {modulo.emoji}
      </span>
      <h1 className="text-3xl font-extrabold">{modulo.titulo}</h1>
      <p className={`w-full rounded-3xl border-2 p-6 text-xl ${modulo.cor}`}>
        🚧 Estamos preparando este treino. Volte logo!
      </p>
    </section>
  )
}
