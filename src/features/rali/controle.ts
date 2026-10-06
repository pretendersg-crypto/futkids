// Controle horizontal dos desafios na tela: inclinar o celular OU arrastar o dedo.
// O jogo pergunta só "para onde o jogador quer ir" (0 = esquerda, 1 = direita).
import { useRef, type PointerEvent, type RefObject } from 'react'
import { useInclinacao } from '../../hooks/useSensor'

export type Controle = 'inclinar' | 'dedo'

export function useControleHorizontal(controle: Controle, arenaRef: RefObject<HTMLDivElement | null>, ativo: boolean) {
  const { inclinacao, estado } = useInclinacao(ativo && controle === 'inclinar')
  const dedo = useRef(0.5)
  // Sem sensor (aparelho sem giroscópio ou permissão negada): cai para o dedo sozinho
  const usandoDedo = controle === 'dedo' || estado === 'sem-sensor'

  function aoTocar(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.buttons === 0) return
    const r = arenaRef.current?.getBoundingClientRect()
    if (r) dedo.current = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  }

  return {
    /** Posição desejada (0 a 1), lida a cada quadro pelo laço do jogo */
    alvo: () => (usandoDedo ? dedo.current : 0.5 + inclinacao.current * 0.5),
    usandoDedo,
    semSensor: controle === 'inclinar' && estado === 'sem-sensor',
    eventos: { onPointerDown: aoTocar, onPointerMove: aoTocar },
  }
}
