// "3, 2, 1, Vai!" antes de cada exercício, com bip a cada número.
import { useEffect } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { sons } from '../../utils/som'

interface Props {
  aoTerminar: () => void
}

export function Contagem({ aoTerminar }: Props) {
  const { decorridoMs } = useTimer(3000, true, () => {
    sons.largada()
    aoTerminar()
  })
  const numero = 3 - Math.floor(decorridoMs / 1000)

  useEffect(() => {
    if (numero > 0) sons.contagem()
  }, [numero])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" aria-live="assertive">
      <p className="text-2xl font-bold">Prepare-se!</p>
      {/* key troca a cada número, refazendo o "pulo" do número */}
      <span key={numero} className="pop text-9xl font-black text-orange-600">
        {numero > 0 ? numero : 'Vai!'}
      </span>
    </div>
  )
}
