// Animações dos desenhos dos gestos: cada uma é uma lista de poses (quadros) que o goleiro percorre
// e volta (vai e vem), com a duração de cada ida. Entre um quadro e outro, todos os pontos do corpo
// são interpolados, então os joelhos dobram e os braços mexem de verdade.
// Para animar outro gesto, inclua aqui uma entrada com o id da pose e os quadros.
import { POSES, type P, type Pose, type PoseId } from './gestos'

export interface Animacao {
  quadros: Pose[]
  /** Duração de cada ida (de um quadro ao seguinte), em ms */
  ms: number
}

const mover = (q: P, dx: number, dy: number): P => ({ x: q.x + dx, y: q.y + dy })

/** A mesma pose um pouco mais agachada: tronco, cabeça e braços descem, joelhos abrem */
function agachar(pose: Pose, quanto: number): Pose {
  const desce = (q: P) => mover(q, 0, quanto)
  return {
    ...pose,
    cabeca: desce(pose.cabeca),
    pescoco: desce(pose.pescoco),
    quadril: desce(pose.quadril),
    cotovelos: [mover(pose.cotovelos[0], -1, quanto), mover(pose.cotovelos[1], 1, quanto)],
    maos: [mover(pose.maos[0], -1, quanto * 0.8), mover(pose.maos[1], 1, quanto * 0.8)],
    joelhos: [mover(pose.joelhos[0], -quanto * 0.5, quanto * 0.45), mover(pose.joelhos[1], quanto * 0.5, quanto * 0.45)],
  }
}

export const ANIMACOES: Partial<Record<PoseId, Animacao>> = {
  // Posição base: "molinha" de goleiro esperando o chute (sobe e desce na ponta dos pés)
  base: { quadros: [POSES.base, agachar(POSES.base, 5)], ms: 650 },
}

const misturar = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
const misturarPar = (a: [P, P], b: [P, P], t: number): [P, P] => [misturar(a[0], b[0], t), misturar(a[1], b[1], t)]

/** Pose entre dois quadros (t de 0 a 1). Vista, bola, setas e chão vêm do primeiro */
export function poseEntre(a: Pose, b: Pose, t: number): Pose {
  return {
    ...a,
    cabeca: misturar(a.cabeca, b.cabeca, t),
    pescoco: misturar(a.pescoco, b.pescoco, t),
    quadril: misturar(a.quadril, b.quadril, t),
    cotovelos: misturarPar(a.cotovelos, b.cotovelos, t),
    maos: misturarPar(a.maos, b.maos, t),
    joelhos: misturarPar(a.joelhos, b.joelhos, t),
    pes: misturarPar(a.pes, b.pes, t),
  }
}

/** Pose da animação num instante (ms desde o começo): vai do 1º ao último quadro e volta, suave */
export function poseNoTempo(anim: Animacao, ms: number): Pose {
  const trechos = anim.quadros.length - 1
  if (trechos < 1) return anim.quadros[0]
  const ciclo = anim.ms * trechos * 2
  const posicao = ((ms % ciclo) + ciclo) % ciclo / anim.ms
  // Ida e volta: 0..trechos..0
  const p = posicao <= trechos ? posicao : 2 * trechos - posicao
  const i = Math.min(Math.floor(p), trechos - 1)
  const t = p - i
  const suave = (1 - Math.cos(Math.PI * t)) / 2
  return poseEntre(anim.quadros[i], anim.quadros[i + 1], suave)
}
