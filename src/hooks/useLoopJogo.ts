// Laço dos jogos de ação: chama `passo(dt)` a cada quadro enquanto `ativo`.
// Usa requestAnimationFrame (suave e economiza bateria). Se o navegador parar de entregar
// quadros (alguns WebViews, aba em segundo plano), um relógio reserva mantém o jogo andando.
import { useEffect, useRef } from 'react'

/** Maior passo de tempo por quadro: evita a bola "teletransportar" depois de um engasgo */
const DT_MAXIMO = 0.05

export function useLoopJogo(passo: (dtSegundos: number) => void, ativo: boolean) {
  const passoRef = useRef(passo)
  useEffect(() => {
    passoRef.current = passo
  })

  useEffect(() => {
    if (!ativo) return
    let ultimo = performance.now()
    let raf = 0
    const tick = () => {
      const agora = performance.now()
      const dt = Math.min(DT_MAXIMO, (agora - ultimo) / 1000)
      ultimo = agora
      if (dt > 0) passoRef.current(dt)
    }
    const quadro = () => {
      tick()
      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)
    const reserva = setInterval(() => {
      if (performance.now() - ultimo > 100) tick()
    }, 50)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(reserva)
    }
  }, [ativo])
}
