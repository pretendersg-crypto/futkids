// Cronômetro com pausa. Mede pelo relógio do aparelho (Date.now), então não atrasa
// se o celular demorar a rodar o intervalo. Para reiniciar, remonte o componente (prop `key`).
import { useEffect, useRef, useState } from 'react'

export function useTimer(duracaoMs: number, ativo: boolean, aoTerminar: () => void) {
  const [decorridoMs, setDecorridoMs] = useState(0)
  const acumulado = useRef(0)
  const terminou = useRef(false)
  const aoTerminarRef = useRef(aoTerminar)

  useEffect(() => {
    aoTerminarRef.current = aoTerminar
  })

  useEffect(() => {
    if (!ativo || terminou.current) return
    const inicio = Date.now()
    const id = setInterval(() => {
      const total = acumulado.current + Date.now() - inicio
      setDecorridoMs(Math.min(total, duracaoMs))
      if (total >= duracaoMs && !terminou.current) {
        terminou.current = true
        clearInterval(id)
        aoTerminarRef.current()
      }
    }, 100)
    return () => {
      clearInterval(id)
      acumulado.current += Date.now() - inicio
    }
  }, [ativo, duracaoMs])

  return { decorridoMs, restanteMs: Math.max(0, duracaoMs - decorridoMs) }
}
