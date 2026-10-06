// Menu de treinos: o aquecimento (sempre primeiro) e as séries de velocidade, rápido e devagar,
// força, prevenção e alongamento.
import { Link } from 'react-router'
import { AvisoAquecer } from '../features/treino/AvisoAquecer'
import { useAqueceuHoje } from '../features/treino/useAqueceuHoje'
import { SERIES } from '../features/treino/series'
import { useProgressStore } from '../stores/progressStore'

export function Treinos() {
  const contadores = useProgressStore((s) => s.contadores)
  const aqueceu = useAqueceuHoje()

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-center text-3xl font-extrabold">💪 Treinos</h1>
      <AvisoAquecer />

      <ul className="flex flex-col gap-3">
        {SERIES.map((s) => {
          const vezes = contadores[s.modulo] ?? 0
          return (
            <li key={s.modulo}>
              <Link to={s.rota} className={`flex min-h-22 items-center gap-4 rounded-3xl border-4 p-3 shadow-md ${s.cor}`}>
                <span aria-hidden className="text-5xl">
                  {s.emoji}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-xl font-extrabold">{s.titulo}</span>
                  <span className="text-base">{s.descricao}</span>
                  <span className="text-sm font-bold">
                    {s.modulo === 'aquecimento' && aqueceu ? '✅ Já aqueceu hoje' : vezes > 0 ? `🏅 Feito ${vezes} ${vezes === 1 ? 'vez' : 'vezes'}` : '✨ Ainda não fez'}
                  </span>
                </span>
                <span aria-hidden className="text-3xl">
                  ▶️
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
