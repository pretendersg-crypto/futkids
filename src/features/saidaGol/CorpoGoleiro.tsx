// O goleiro uniformizado dos desenhos dos gestos (inspirado no uniforme do aluno: camisa verde-limão
// com o peito preto, manga longa preta, luvas e joelheiras pretas, calção verde-limão, meião e
// chuteira pretos, cabelo castanho com risca de lado). Proporção de criança: cabeça, mãos e pés um
// pouco maiores.
// Desenha o corpo em cima dos mesmos pontos das poses (cabeça, pescoço, quadril, cotovelos, mãos,
// joelhos e pés no quadro de 140 x 150), então toda pose pronta já sai com o uniforme. Não usa a foto
// do aluno nem escudo/patrocínio: é um desenho genérico com as cores do uniforme.
import { useId } from 'react'
import type { P, Pose } from './gestos'

const CORES_UNIFORME = {
  limao: '#b5e61d',
  limaoEscuro: '#7fb800',
  preto: '#1c1f24',
  pele: '#f2c9a0',
  peleEscura: '#c98f62',
  cabelo: '#4a2b17',
  cabeloClaro: '#6e4527',
  luva: '#23272e',
  palmaLuva: '#4b5563',
  contorno: '#14281a',
  sola: '#e5e7eb',
}

const C = CORES_UNIFORME

const soma = (a: P, b: P): P => ({ x: a.x + b.x, y: a.y + b.y })
const menos = (a: P, b: P): P => ({ x: a.x - b.x, y: a.y - b.y })
const vezes = (a: P, k: number): P => ({ x: a.x * k, y: a.y * k })
const entre = (a: P, b: P, t: number): P => soma(a, vezes(menos(b, a), t))
function unitario(a: P): P {
  const n = Math.hypot(a.x, a.y) || 1
  return { x: a.x / n, y: a.y / n }
}

/** Traço grosso com contorno escuro (desenha o contorno por baixo, um pouco mais largo) */
function Traco({ pontos, largura, cor, contorno = C.contorno, url }: { pontos: P[]; largura: number; cor: string; contorno?: string; url?: string }) {
  const pts = pontos.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')
  return (
    <>
      <polyline points={pts} fill="none" stroke={contorno} strokeWidth={largura + 3} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts} fill="none" stroke={url ?? cor} strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

/** Até onde o calção cobre a coxa (do quadril ao joelho) */
const CALCAO = 0.62

/** Perna: coxa e joelho de fora do calção, meião e chuteira. Na vista de lado, cada perna leva o seu pedaço de calção */
function Perna({ quadril, joelho, pe, lado, vista }: { quadril: P; joelho: P; pe: P; lado: number; vista: Pose['vista'] }) {
  const fimCalcao = entre(quadril, joelho, CALCAO)
  const inicioMeiao = entre(joelho, pe, 0.2)
  // Chuteira: na vista de lado aponta para a frente (direita); de frente, um pouco para fora
  const bico = vista === 'lado' ? { x: 6, y: 0 } : { x: lado * 2, y: 0 }
  const centro = soma(pe, { x: bico.x, y: 1.5 })
  return (
    <g>
      <Traco pontos={[fimCalcao, joelho, inicioMeiao]} largura={9} cor={C.pele} />
      {vista === 'lado' && <Traco pontos={[quadril, fimCalcao]} largura={15} cor={C.limao} />}
      <Traco pontos={[inicioMeiao, pe]} largura={9.5} cor={C.preto} />
      {/* Joelheira preta */}
      <Traco pontos={[entre(fimCalcao, joelho, 0.6), entre(joelho, pe, 0.14)]} largura={12} cor={C.luva} />
      <ellipse cx={centro.x} cy={centro.y + 2.4} rx={vista === 'lado' ? 11.5 : 9.5} ry={2.4} fill={C.sola} stroke={C.contorno} strokeWidth={1.5} />
      <ellipse cx={centro.x} cy={centro.y} rx={vista === 'lado' ? 11 : 9} ry={5.2} fill={C.preto} stroke={C.contorno} strokeWidth={1.5} />
    </g>
  )
}

function Braco({ ombro, cotovelo, mao }: { ombro: P; cotovelo: P; mao: P }) {
  // A mão fica um pouco além do ponto do pulso, na direção do antebraço
  const direcao = unitario(menos(mao, cotovelo))
  const palma = soma(mao, vezes(direcao, 2))
  return (
    <g>
      <Traco pontos={[ombro, cotovelo, mao]} largura={9} cor={C.preto} />
      {/* Punho da luva verde-limão (separa a manga preta da luva preta) */}
      <Traco pontos={[soma(mao, vezes(direcao, -3)), soma(mao, vezes(direcao, -0.5))]} largura={10.5} cor={C.limao} />
      {/* Luva de goleiro aberta: dedos grandes em leque e a palma mais clara */}
      <g>
        {[-0.6, -0.2, 0.2, 0.6].map((a) => {
          const ang = Math.atan2(direcao.y, direcao.x) + a
          const ponta = soma(palma, { x: Math.cos(ang) * 8.5, y: Math.sin(ang) * 8.5 })
          return (
            <g key={a}>
              <line x1={palma.x} y1={palma.y} x2={ponta.x} y2={ponta.y} stroke={C.contorno} strokeWidth={6} strokeLinecap="round" />
              <line x1={palma.x} y1={palma.y} x2={ponta.x} y2={ponta.y} stroke={C.luva} strokeWidth={4.2} strokeLinecap="round" />
            </g>
          )
        })}
        <circle cx={palma.x} cy={palma.y} r={6.4} fill={C.luva} stroke={C.contorno} strokeWidth={1.5} />
        <circle cx={palma.x} cy={palma.y} r={3.4} fill={C.palmaLuva} />
      </g>
    </g>
  )
}

function Cabeca({ centro, pescoco, vista }: { centro: P; pescoco: P; vista: Pose['vista'] }) {
  // Gira a cabeça para o lado oposto ao pescoço (funciona em pé, deitado e mergulhando)
  const cima = unitario(menos(centro, pescoco))
  const angulo = (Math.atan2(cima.x, -cima.y) * 180) / Math.PI
  const { x, y } = centro
  return (
    <g transform={`rotate(${angulo.toFixed(1)} ${x} ${y}) translate(${x} ${y}) scale(1.15) translate(${-x} ${-y})`}>
      <circle cx={x} cy={y} r={12} fill={C.pele} stroke={C.contorno} strokeWidth={2} />
      {vista === 'frente' ? (
        <>
          {/* Cabelo castanho curto, com risca de lado e a franja caindo para a esquerda */}
          <path
            d={`M${x - 12.6} ${y + 1} A12.6 12.6 0 0 1 ${x + 12.6} ${y + 1} Q${x + 11.5} ${y - 4.5} ${x + 6} ${y - 6.5} Q${x - 2} ${y - 7.5} ${x - 9} ${y - 1.5} Q${x - 11.5} ${y - 0.5} ${x - 12.6} ${y + 1} Z`}
            fill={C.cabelo}
          />
          <path d={`M${x + 4} ${y - 12} Q${x + 5.5} ${y - 9} ${x + 6} ${y - 6.5}`} fill="none" stroke={C.cabeloClaro} strokeWidth={1.2} strokeLinecap="round" />
          {/* Olhos escuros com brilho */}
          <circle cx={x - 4.3} cy={y + 2.5} r={2} fill={C.contorno} />
          <circle cx={x + 4.3} cy={y + 2.5} r={2} fill={C.contorno} />
          <circle cx={x - 3.7} cy={y + 1.8} r={0.7} fill="#fff" />
          <circle cx={x + 4.9} cy={y + 1.8} r={0.7} fill="#fff" />
          <path d={`M${x - 3} ${y + 7.5} Q${x} ${y + 9} ${x + 3} ${y + 7.5}`} fill="none" stroke={C.contorno} strokeWidth={1.4} strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* De perfil, olhando para a direita: cabelo atrás e em cima, orelha, olho na frente */}
          <path d={`M${x - 10} ${y + 7.6} A12.6 12.6 0 0 1 ${x + 9.2} ${y - 8.6} Q${x + 4} ${y - 3} ${x - 2} ${y - 3.5} Q${x - 4} ${y + 3} ${x - 10} ${y + 7.6} Z`} fill={C.cabelo} />
          <ellipse cx={x - 3} cy={y + 3.5} rx={2} ry={2.8} fill={C.pele} stroke={C.peleEscura} strokeWidth={1.2} />
          <circle cx={x + 6.5} cy={y + 2} r={2} fill={C.contorno} />
          <circle cx={x + 7.1} cy={y + 1.3} r={0.7} fill="#fff" />
          <path d={`M${x + 5} ${y + 8} Q${x + 7.5} ${y + 8.8} ${x + 9} ${y + 7}`} fill="none" stroke={C.contorno} strokeWidth={1.4} strokeLinecap="round" />
        </>
      )}
    </g>
  )
}

/** Calção de frente: uma peça só (cintura, gancho e as duas pernas), sem risco no meio */
function CalcaoDeFrente({ quadril, quadris, joelhos, descer, largura }: { quadril: P; quadris: [P, P]; joelhos: [P, P]; descer: P; largura: P }) {
  const pontos: P[] = []
  const cintura = (lado: number) => soma(soma(quadril, vezes(largura, 13 * lado)), vezes(descer, -6))
  const barra = (i: 0 | 1) => {
    const fim = entre(quadris[i], joelhos[i], CALCAO)
    const dir = unitario(menos(fim, quadris[i]))
    let fora = { x: -dir.y, y: dir.x }
    // "Fora" é o lado longe do meio do corpo
    if ((fora.x * largura.x + fora.y * largura.y) * (i === 0 ? 1 : -1) < 0) fora = vezes(fora, -1)
    return { fora: soma(fim, vezes(fora, 8)), dentro: soma(fim, vezes(fora, -8)) }
  }
  const esq = barra(0)
  const dir = barra(1)
  pontos.push(cintura(1), esq.fora, esq.dentro, soma(quadril, vezes(descer, 8)), dir.dentro, dir.fora, cintura(-1))
  return <polygon points={pontos.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')} fill={C.limao} stroke={C.contorno} strokeWidth={1.6} strokeLinejoin="round" />
}

/** O goleiro inteiro numa pose (sem chão, bola e setas, que ficam com o DesenhoGesto) */
export function CorpoGoleiro({ pose }: { pose: Pose }) {
  const gradiente = `camisa-${useId().replace(/:/g, '')}`
  const lado = pose.vista === 'lado'
  // Direção do tronco (do pescoço ao quadril) e a perpendicular, para achar ombros e quadris
  const descer = unitario(menos(pose.quadril, pose.pescoco))
  const largura = { x: -descer.y, y: descer.x }
  const baseOmbro = soma(pose.pescoco, vezes(descer, 4))
  const ombros: [P, P] = lado ? [soma(baseOmbro, vezes(largura, 2)), soma(baseOmbro, vezes(largura, -2))] : [soma(baseOmbro, vezes(largura, 10)), soma(baseOmbro, vezes(largura, -10))]
  const quadris: [P, P] = lado ? [pose.quadril, pose.quadril] : [soma(pose.quadril, vezes(largura, 6)), soma(pose.quadril, vezes(largura, -6))]
  // Na vista de lado, o braço e a perna de trás ficam mais apagados (dá noção de profundidade)
  const tras = 0.6

  const perna = (i: 0 | 1) => <Perna quadril={quadris[i]} joelho={pose.joelhos[i]} pe={pose.pes[i]} lado={i === 0 ? -1 : 1} vista={pose.vista} />
  const braco = (i: 0 | 1) => <Braco ombro={ombros[i]} cotovelo={pose.cotovelos[i]} mao={pose.maos[i]} />

  return (
    <g>
      <defs>
        {/* Camisa: peito preto que vira verde-limão na barriga, como no uniforme */}
        <linearGradient id={gradiente} gradientUnits="userSpaceOnUse" x1={pose.pescoco.x} y1={pose.pescoco.y} x2={pose.quadril.x} y2={pose.quadril.y}>
          <stop offset="0" stopColor={C.preto} />
          <stop offset="0.45" stopColor={C.preto} />
          <stop offset="0.72" stopColor={C.limao} />
          <stop offset="1" stopColor={C.limao} />
        </linearGradient>
      </defs>

      {lado ? (
        <g opacity={tras}>
          {perna(0)}
          {braco(0)}
        </g>
      ) : (
        <>
          {perna(0)}
          {perna(1)}
          <CalcaoDeFrente quadril={pose.quadril} quadris={quadris} joelhos={pose.joelhos} descer={descer} largura={largura} />
        </>
      )}

      {/* Pescoço, tronco (camisa, que cobre a cintura do calção) e golinha em V */}
      <Traco pontos={[pose.pescoco, entre(pose.pescoco, pose.cabeca, 0.5)]} largura={7} cor={C.pele} />
      {lado && <Traco pontos={[pose.quadril, pose.quadril]} largura={17} cor={C.limao} />}
      <Traco pontos={[soma(pose.pescoco, vezes(descer, 3)), soma(pose.quadril, vezes(descer, lado ? -4 : -9))]} largura={lado ? 19 : 25} cor={C.preto} url={`url(#${gradiente})`} />
      <polyline
        points={[soma(soma(pose.pescoco, vezes(largura, 4.5)), vezes(descer, 1.5)), soma(pose.pescoco, vezes(descer, 6)), soma(soma(pose.pescoco, vezes(largura, -4.5)), vezes(descer, 1.5))]
          .map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`)
          .join(' ')}
        fill="none"
        stroke={C.limao}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Cabeca centro={pose.cabeca} pescoco={pose.pescoco} vista={pose.vista} />
      {lado && perna(1)}
      {!lado && braco(0)}
      {braco(1)}
    </g>
  )
}
