// Timer visual: anel que vai esvaziando + segundos restantes bem grandes no meio.
interface Props {
  restanteMs: number
  totalMs: number
  tamanho?: number
}

const RAIO = 88
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

export function TimerCircular({ restanteMs, totalMs, tamanho = 180 }: Props) {
  const fracao = totalMs > 0 ? restanteMs / totalMs : 0
  const segundos = Math.ceil(restanteMs / 1000)

  return (
    <div className="relative" style={{ width: tamanho, height: tamanho }} role="timer" aria-label={`${segundos} segundos`}>
      <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden>
        <circle cx="100" cy="100" r={RAIO} fill="#FFFFFF" stroke="#DCFCE7" strokeWidth="16" />
        <circle
          cx="100"
          cy="100"
          r={RAIO}
          fill="none"
          stroke="#F97316"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - fracao)}
        />
      </svg>
      <span aria-hidden className="absolute inset-0 grid place-items-center text-6xl font-black">
        {segundos}
      </span>
    </div>
  )
}
