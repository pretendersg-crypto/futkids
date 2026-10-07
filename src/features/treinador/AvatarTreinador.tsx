// Avatar do Pai/Mãe Treinador em SVG (mesmo estilo do avatar da criança): rosto com feições,
// cabelo, barba, óculos, brincos, agasalho de treinador e os itens liberados pelo nível
// (apito, prancheta, boné, medalha, troféu, estrela de mestre).
import { useId } from 'react'
import {
  AGASALHOS,
  CORES_CABELO_TREINADOR,
  corDe,
  PELES_TREINADOR,
  type AvatarTreinadorConfig,
  type CabeloAdulto,
} from './opcoesTreinador'

interface Props {
  config: AvatarTreinadorConfig
  tamanho?: number
  className?: string
}

const TINTA = '#1F2937'

/** Cabelo que fica ATRÁS da cabeça (comprido, rabo, coque, volume) */
function CabeloAtras({ estilo, cor }: { estilo: CabeloAdulto; cor: string }) {
  switch (estilo) {
    case 'longo':
      return <path d="M62 92 Q58 42 100 40 Q142 42 138 92 L146 150 Q122 160 100 158 Q78 160 54 150 Z" fill={cor} />
    case 'cacheado':
      return (
        <g fill={cor}>
          <circle cx="100" cy="74" r="44" />
          <circle cx="64" cy="96" r="16" />
          <circle cx="136" cy="96" r="16" />
        </g>
      )
    case 'rabo':
      return <ellipse cx="146" cy="96" rx="13" ry="30" transform="rotate(-18 146 96)" fill={cor} />
    case 'coque':
      return <circle cx="100" cy="42" r="17" fill={cor} />
    default:
      return null
  }
}

/** Cabelo da frente (topo da cabeça e franja) */
function CabeloFrente({ estilo, cor }: { estilo: CabeloAdulto; cor: string }) {
  switch (estilo) {
    case 'careca':
      return <path d="M82 58 Q92 52 104 54" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={4} strokeLinecap="round" fill="none" />
    case 'raspado':
      return <path d="M67 80 Q68 50 100 49 Q132 50 133 80 Q122 64 100 62 Q78 64 67 80 Z" fill={cor} opacity={0.85} />
    case 'ondulado':
      return <path d="M65 86 Q60 46 100 44 Q140 46 135 86 Q130 70 122 68 Q116 60 106 66 Q98 58 90 66 Q80 60 74 70 Q68 72 65 86 Z" fill={cor} />
    case 'longo':
    case 'rabo':
    case 'coque':
      return <path d="M66 88 Q62 46 100 45 Q138 46 134 88 Q128 66 110 62 Q96 72 72 72 Z" fill={cor} />
    case 'cacheado':
      return (
        <g fill={cor}>
          <circle cx="76" cy="66" r="12" />
          <circle cx="92" cy="56" r="13" />
          <circle cx="110" cy="56" r="13" />
          <circle cx="125" cy="66" r="12" />
        </g>
      )
    default:
      return <path d="M66 84 Q64 46 100 44 Q136 46 134 84 Q126 62 100 60 Q74 62 66 84 Z" fill={cor} />
  }
}

export function AvatarTreinador({ config, tamanho = 120, className = '' }: Props) {
  const id = useId()
  const pele = corDe(PELES_TREINADOR, config.pele)
  const cabelo = corDe(CORES_CABELO_TREINADOR, config.corCabelo)
  const agasalho = corDe(AGASALHOS, config.agasalho)
  const usa = (item: AvatarTreinadorConfig['usar'][number]) => config.usar.includes(item)
  const mae = config.genero === 'mae'

  return (
    <svg viewBox="0 0 200 200" width={tamanho} height={tamanho} className={className} role="img" aria-label={`Avatar de ${mae ? 'treinadora' : 'treinador'}`}>
      <defs>
        <clipPath id={`${id}-circulo`}>
          <circle cx="100" cy="100" r="98" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="98" fill="#dcfce7" />
      <g clipPath={`url(#${id}-circulo)`}>
        <CabeloAtras estilo={config.cabelo} cor={cabelo} />

        {/* Agasalho de treinador: gola, zíper e as listras nos ombros */}
        <path d="M30 210 Q32 150 100 138 Q168 150 170 210 Z" fill={agasalho} />
        <path d="M56 160 L44 210 M64 154 L54 210 M144 160 L156 210 M136 154 L146 210" stroke="#ffffff" strokeWidth={4} opacity={0.85} />
        <path d="M84 140 L100 162 L116 140" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" />
        <line x1="100" y1="162" x2="100" y2="210" stroke="#ffffff" strokeWidth={3} opacity={0.8} />

        {/* Pescoço, orelhas e rosto */}
        <rect x="88" y="116" width="24" height="28" rx="8" fill={pele} />
        <circle cx="66" cy="94" r="8" fill={pele} />
        <circle cx="134" cy="94" r="8" fill={pele} />
        {config.brincos && (
          <g fill="#FACC15" stroke="#A16207" strokeWidth={1}>
            <circle cx="66" cy="106" r="3.5" />
            <circle cx="134" cy="106" r="3.5" />
          </g>
        )}
        <ellipse cx="100" cy="90" rx="34" ry="40" fill={pele} />

        <CabeloFrente estilo={config.cabelo} cor={cabelo} />

        {/* Feições: sobrancelhas, olhos (com cílios na mãe), nariz e sorriso */}
        <path d="M80 80 Q88 76 95 80 M105 80 Q112 76 120 80" stroke={config.cabelo === 'careca' ? TINTA : cabelo} strokeWidth={3} strokeLinecap="round" fill="none" />
        <circle cx="88" cy="91" r="4.5" fill={TINTA} />
        <circle cx="112" cy="91" r="4.5" fill={TINTA} />
        <circle cx="89.5" cy="89.5" r="1.4" fill="#fff" />
        <circle cx="113.5" cy="89.5" r="1.4" fill="#fff" />
        {mae && <path d="M82 88 L79 85 M118 88 L121 85" stroke={TINTA} strokeWidth={2} strokeLinecap="round" />}
        <path d="M100 96 Q97 103 101 104" stroke={TINTA} strokeOpacity={0.5} strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M88 111 Q100 121 112 111" stroke={TINTA} strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx="80" cy="104" r="5" fill="#F472B6" opacity={0.25} />
        <circle cx="120" cy="104" r="5" fill="#F472B6" opacity={0.25} />

        {/* Barba (cor do cabelo) */}
        {config.barba === 'bigode' && <path d="M88 106 Q100 100 112 106 Q100 104 88 106 Z" fill={cabelo} stroke={cabelo} strokeWidth={3} strokeLinejoin="round" />}
        {config.barba === 'cavanhaque' && (
          <>
            <path d="M89 106 Q100 101 111 106" stroke={cabelo} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d="M92 120 Q100 132 108 120 Q100 124 92 120 Z" fill={cabelo} />
          </>
        )}
        {config.barba === 'cheia' && (
          <path d="M66 92 Q68 128 100 132 Q132 128 134 92 Q130 112 116 116 Q100 104 84 116 Q70 112 66 92 Z" fill={cabelo} opacity={0.92} />
        )}
        {config.barba === 'cheia' && <path d="M90 112 Q100 118 110 112" stroke={TINTA} strokeWidth={2.5} fill="none" strokeLinecap="round" />}

        {config.oculos && (
          <g fill="none" stroke={TINTA} strokeWidth={2.5}>
            <circle cx="88" cy="91" r="9" />
            <circle cx="112" cy="91" r="9" />
            <path d="M97 90 Q100 87 103 90 M79 89 L69 86 M121 89 L131 86" />
          </g>
        )}

        {/* Itens liberados pelo nível */}
        {usa('bone') && (
          <g>
            <path d="M64 78 Q64 44 100 42 Q136 44 136 78 Z" fill={agasalho} />
            <path d="M98 76 Q140 70 160 82 Q132 88 98 80 Z" fill={agasalho} stroke="#00000033" strokeWidth={1.5} />
            <circle cx="100" cy="43" r="3" fill="#ffffff" />
          </g>
        )}
        {usa('apito') && (
          <g>
            <path d="M90 140 L98 172 M110 140 L102 172" stroke="#E5E7EB" strokeWidth={2.5} />
            <rect x="92" y="170" width="18" height="10" rx="5" fill="#9CA3AF" stroke="#4B5563" strokeWidth={1.5} />
            <circle cx="96" cy="175" r="2" fill="#4B5563" />
          </g>
        )}
        {usa('medalha') && (
          <g>
            <path d="M68 150 L76 168 L84 150" fill="#2563EB" />
            <circle cx="76" cy="174" r="9" fill="#FACC15" stroke="#A16207" strokeWidth={2} />
            <text x="76" y="178" fontSize="10" textAnchor="middle" fill="#A16207" fontWeight={900}>
              1
            </text>
          </g>
        )}
        {usa('prancheta') && (
          <g transform="rotate(-8 152 176)">
            <rect x="134" y="152" width="36" height="46" rx="4" fill="#A16207" />
            <rect x="139" y="160" width="26" height="34" rx="2" fill="#ffffff" />
            <rect x="145" y="148" width="14" height="8" rx="2" fill="#9CA3AF" />
            <path d="M143 168 H161 M143 175 H161 M143 182 H155" stroke="#16A34A" strokeWidth={2} />
          </g>
        )}
        {usa('trofeu') && (
          <g>
            <path d="M18 150 H42 V160 Q42 174 30 176 Q18 174 18 160 Z" fill="#FACC15" stroke="#A16207" strokeWidth={2} />
            <path d="M18 154 Q10 154 12 162 Q14 168 20 166 M42 154 Q50 154 48 162 Q46 168 40 166" fill="none" stroke="#A16207" strokeWidth={2} />
            <rect x="26" y="176" width="8" height="8" fill="#A16207" />
            <rect x="20" y="184" width="20" height="6" rx="2" fill="#A16207" />
          </g>
        )}
      </g>
      {usa('estrela') && (
        <path
          d="M168 14 L173 27 L187 28 L176 37 L180 51 L168 43 L156 51 L160 37 L149 28 L163 27 Z"
          fill="#FACC15"
          stroke="#A16207"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
