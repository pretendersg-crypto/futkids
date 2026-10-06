// Avatar desenhado em SVG (leve, nítido em qualquer tamanho e sem baixar imagens).
import { useId } from 'react'
import {
  ACESSORIOS,
  buscarOpcao,
  CORES_CABELO,
  ESTILOS_CABELO,
  PELES,
  UNIFORMES,
  type AvatarConfig,
  type EstiloCabelo,
  type IdAcessorio,
} from './opcoesAvatar'

interface Props {
  config: AvatarConfig
  /** Lado do quadrado em pixels */
  tamanho?: number
  className?: string
}

// Franja padrão (cobre o topo da cabeça com uma "pontinha" no meio da testa)
const FRANJA = 'M54 92 Q50 38 100 36 Q150 38 146 92 Q140 62 116 58 Q104 70 88 60 Q60 62 54 92 Z'
// Cabelo bem curtinho, colado na cabeça
const RASPADO = 'M57 80 Q60 44 100 42 Q140 44 143 80 Q128 58 100 56 Q72 58 57 80 Z'

/** Partes do cabelo que ficam ATRÁS da cabeça (volume, cabelo comprido, rabo) */
function CabeloAtras({ estilo, cor }: { estilo: EstiloCabelo; cor: string }) {
  switch (estilo) {
    case 'cacheado':
      return <circle cx="100" cy="78" r="60" fill={cor} />
    case 'longo':
      return <path d="M50 90 Q46 34 100 32 Q154 34 150 90 L156 152 Q128 160 100 158 Q72 160 44 152 Z" fill={cor} />
    case 'rabo':
      return (
        <>
          <ellipse cx="160" cy="70" rx="15" ry="32" transform="rotate(28 160 70)" fill={cor} />
          <circle cx="146" cy="52" r="7" fill="#F472B6" />
        </>
      )
    case 'coque':
      return (
        <>
          <circle cx="100" cy="30" r="17" fill={cor} />
          <rect x="88" y="42" width="24" height="6" rx="3" fill="#F472B6" />
        </>
      )
    default:
      return null
  }
}

/** Partes do cabelo que ficam NA FRENTE da cabeça (franja, topete) */
function CabeloFrente({ estilo, cor }: { estilo: EstiloCabelo; cor: string }) {
  switch (estilo) {
    case 'cacheado':
      return (
        <g fill={cor}>
          <circle cx="64" cy="64" r="14" />
          <circle cx="80" cy="52" r="16" />
          <circle cx="100" cy="47" r="17" />
          <circle cx="120" cy="52" r="16" />
          <circle cx="136" cy="64" r="14" />
        </g>
      )
    case 'moicano':
      return (
        <>
          <path d={RASPADO} fill={cor} opacity="0.45" />
          <path d="M90 62 Q86 20 100 14 Q114 20 110 62 Z" fill={cor} />
        </>
      )
    case 'raspado':
      return <path d={RASPADO} fill={cor} opacity="0.85" />
    case 'espetado':
      return <path d="M54 88 L50 52 L64 58 L68 30 L82 48 L92 22 L102 46 L114 24 L120 48 L134 32 L136 58 L150 52 L146 88 Q132 62 100 60 Q68 62 54 88 Z" fill={cor} />
    default:
      // curto, longo e rabo de cavalo usam a mesma franja
      return <path d={FRANJA} fill={cor} />
  }
}

/** Acessório da cabeça, desenhado por cima do cabelo */
function Acessorio({ id }: { id: IdAcessorio }) {
  switch (id) {
    case 'faixa':
      return <path d="M54 74 Q100 58 146 74 L146 84 Q100 68 54 84 Z" fill="#DC2626" />
    case 'bone':
      return (
        <>
          <path d="M52 80 Q50 32 100 30 Q150 32 148 80 Q100 70 52 80 Z" fill="#2563EB" />
          <ellipse cx="100" cy="80" rx="56" ry="9" fill="#1D4ED8" />
          <circle cx="100" cy="32" r="4" fill="#1D4ED8" />
        </>
      )
    case 'oculos':
      return (
        <g>
          <rect x="68" y="83" width="28" height="18" rx="7" fill="#111827" />
          <rect x="104" y="83" width="28" height="18" rx="7" fill="#111827" />
          <line x1="96" y1="90" x2="104" y2="90" stroke="#111827" strokeWidth="4" />
          <line x1="74" y1="88" x2="82" y2="88" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          <line x1="110" y1="88" x2="118" y2="88" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        </g>
      )
    case 'coroa':
      return (
        <g>
          <polygon points="62,54 70,24 86,42 100,14 114,42 130,24 138,54" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="100" cy="40" r="4" fill="#DC2626" />
          <circle cx="80" cy="47" r="3" fill="#2563EB" />
          <circle cx="120" cy="47" r="3" fill="#16A34A" />
        </g>
      )
    default:
      return null
  }
}

export function Avatar({ config, tamanho = 96, className }: Props) {
  const pele = buscarOpcao(PELES, config.pele).cor
  const corCabelo = buscarOpcao(CORES_CABELO, config.corCabelo).cor
  const estilo = buscarOpcao(ESTILOS_CABELO, config.cabelo).id
  const uniforme = buscarOpcao(UNIFORMES, config.uniforme)
  const acessorio = buscarOpcao(ACESSORIOS, config.acessorio).id
  // Id único do recorte das listras (vários avatares aparecem juntos no editor)
  const recorteCamisa = `camisa${useId()}`

  return (
    <svg viewBox="0 0 200 200" width={tamanho} height={tamanho} className={className} aria-hidden>
      <CabeloAtras estilo={estilo} cor={corCabelo} />

      {/* Pescoço e camisa com gola em V e número 1 (de goleiro!) */}
      <rect x="86" y="126" width="28" height="32" rx="8" fill={pele} />
      <path d="M30 200 Q32 160 72 150 L128 150 Q168 160 170 200 Z" fill={uniforme.camisa} />
      {uniforme.listras && (
        <>
          <clipPath id={recorteCamisa}>
            <path d="M30 200 Q32 160 72 150 L128 150 Q168 160 170 200 Z" />
          </clipPath>
          <g clipPath={`url(#${recorteCamisa})`} fill={uniforme.listras} opacity="0.85">
            {[38, 62, 86, 110, 134, 158].map((x) => (
              <rect key={x} x={x - 5} y="148" width="10" height="56" />
            ))}
          </g>
        </>
      )}
      <path d="M86 150 L100 166 L114 150" fill="none" stroke={uniforme.detalhe} strokeWidth="6" strokeLinejoin="round" />
      <text x="100" y="194" textAnchor="middle" fontSize="24" fontWeight="900" fill={uniforme.detalhe}>
        1
      </text>

      {/* Orelhas e cabeça */}
      <circle cx="54" cy="96" r="10" fill={pele} />
      <circle cx="146" cy="96" r="10" fill={pele} />
      <circle cx="100" cy="90" r="46" fill={pele} />

      {/* Bochechas, olhos com brilho e sorriso */}
      <circle cx="74" cy="106" r="7" fill="#F87171" opacity="0.35" />
      <circle cx="126" cy="106" r="7" fill="#F87171" opacity="0.35" />
      <circle cx="82" cy="92" r="6" fill="#1F1A17" />
      <circle cx="118" cy="92" r="6" fill="#1F1A17" />
      <circle cx="84" cy="90" r="2" fill="#FFFFFF" />
      <circle cx="120" cy="90" r="2" fill="#FFFFFF" />
      <path d="M84 110 Q100 124 116 110" fill="none" stroke="#7F1D1D" strokeWidth="4" strokeLinecap="round" />

      <CabeloFrente estilo={estilo} cor={corCabelo} />
      <Acessorio id={acessorio} />
    </svg>
  )
}
