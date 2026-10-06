// Sensores de movimento do celular: inclinação (giroscópio/orientação) e acelerômetro.
// Tudo tem alternativa: se o aparelho não tiver sensor (ou a permissão for negada),
// o estado vira "sem-sensor" e o jogo usa o toque.
import { useEffect, useRef, useState } from 'react'

export type EstadoSensor = 'verificando' | 'ok' | 'sem-sensor'

type ComPermissao = { requestPermission?: () => Promise<'granted' | 'denied'> }

/**
 * iPhone (iOS 13+) só libera os sensores depois de pedir permissão DENTRO de um toque.
 * Nos outros aparelhos não há pedido. Devolve false se a pessoa negar.
 */
export async function pedirPermissaoMovimento(): Promise<boolean> {
  try {
    const orientacao = (globalThis.DeviceOrientationEvent as unknown as ComPermissao | undefined)?.requestPermission
    const movimento = (globalThis.DeviceMotionEvent as unknown as ComPermissao | undefined)?.requestPermission
    if (orientacao && (await orientacao()) !== 'granted') return false
    if (movimento && (await movimento()) !== 'granted') return false
    return true
  } catch {
    return false
  }
}

/** Quanto tempo esperar o primeiro dado do sensor antes de concluir que não há sensor */
const ESPERA_SENSOR_MS = 1500

/**
 * Inclinação lateral do celular em pé, de -1 (deitado para a esquerda) a 1 (direita);
 * ±30° já chega no máximo, para a criança não precisar virar muito. Fica num ref para o
 * laço do jogo ler sem re-renderizar.
 */
export function useInclinacao(ativo: boolean) {
  const inclinacao = useRef(0)
  const [estado, setEstado] = useState<EstadoSensor>('verificando')

  useEffect(() => {
    if (!ativo) return
    let recebeu = false
    const aoMudar = (e: DeviceOrientationEvent) => {
      if (e.gamma === null) return
      recebeu = true
      const alvo = Math.max(-1, Math.min(1, e.gamma / 30))
      inclinacao.current = inclinacao.current * 0.6 + alvo * 0.4 // suaviza a tremedeira da mão
      setEstado('ok')
    }
    window.addEventListener('deviceorientation', aoMudar)
    const espera = setTimeout(() => !recebeu && setEstado('sem-sensor'), ESPERA_SENSOR_MS)
    return () => {
      window.removeEventListener('deviceorientation', aoMudar)
      clearTimeout(espera)
    }
  }, [ativo])

  return { inclinacao, estado }
}

/**
 * Conta pulos com o celular preso ao corpo (bolso com zíper ou braçadeira).
 * Um pulo = um instante "sem peso" no ar (aceleração total < 5 m/s², quase queda livre)
 * seguido do impacto da aterrissagem (> 16 m/s²) em até 0,7 s.
 */
export function useContadorSaltos(ativo: boolean, aoSaltar: () => void) {
  const [estado, setEstado] = useState<EstadoSensor>('verificando')
  const aoSaltarRef = useRef(aoSaltar)
  useEffect(() => {
    aoSaltarRef.current = aoSaltar
  })

  useEffect(() => {
    if (!ativo) return
    let recebeu = false
    let noAr = -Infinity
    let ultimoSalto = -Infinity
    const aoMover = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a || a.x === null || a.y === null || a.z === null) return
      recebeu = true
      setEstado('ok')
      const total = Math.hypot(a.x, a.y, a.z)
      const agora = performance.now()
      if (total < 5) noAr = agora
      else if (total > 16 && agora - noAr < 700 && agora - ultimoSalto > 350) {
        ultimoSalto = agora
        aoSaltarRef.current()
      }
    }
    window.addEventListener('devicemotion', aoMover)
    const espera = setTimeout(() => !recebeu && setEstado('sem-sensor'), ESPERA_SENSOR_MS)
    return () => {
      window.removeEventListener('devicemotion', aoMover)
      clearTimeout(espera)
    }
  }, [ativo])

  return estado
}
