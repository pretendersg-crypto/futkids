// Figurinha animada. O tipo "padrao" é desenhado aqui (emoji sobre um selo colorido com borda
// branca, estilo figurinha recortada); "imagem" usa o arquivo do designer (PNG/SVG/WebP animado).
// "lottie" ainda mostra o emoji reserva: ver README para ligar a biblioteca quando chegar o 1º arquivo.
import { useId, useState } from 'react'
import { urlDeSticker, type AnimacaoSticker, type Sticker } from '../../data/catalogo'
import './stickers.css'

interface Props {
  sticker: Sticker
  tamanho?: number
  /** Toca a animação de revelação (figurinha recém-desbloqueada) */
  revelar?: boolean
}

const CORES_RESERVA: [string, string] = ['#FDE68A', '#F59E0B']

// 12 raios saindo do centro (triângulos finos), calculados uma vez só
const RAIOS = Array.from({ length: 12 }, (_, i) => {
  const angulo = (i * 30 * Math.PI) / 180
  const abertura = (7 * Math.PI) / 180
  const ponta = (a: number) => `${60 + 85 * Math.cos(a)},${60 + 85 * Math.sin(a)}`
  return `60,60 ${ponta(angulo - abertura)} ${ponta(angulo + abertura)}`
})

function StickerPadrao({ emoji, cores, animacao, tamanho }: { emoji: string; cores: [string, string]; animacao: AnimacaoSticker; tamanho: number }) {
  // Ids únicos: a mesma figurinha pode aparecer várias vezes na tela (álbum + comemoração)
  const id = useId()
  const gradiente = `grad${id}`
  const recorte = `clip${id}`

  return (
    <svg viewBox="0 0 120 120" width={tamanho} height={tamanho} className="sticker" aria-hidden>
      <defs>
        <linearGradient id={gradiente} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cores[0]} />
          <stop offset="1" stopColor={cores[1]} />
        </linearGradient>
        <clipPath id={recorte}>
          <circle cx="60" cy="60" r="50" />
        </clipPath>
      </defs>
      <g className={`sticker-${animacao}`}>
        <circle cx="60" cy="63" r="56" fill="#000000" opacity="0.15" />
        <circle cx="60" cy="60" r="57" fill="#FFFFFF" />
        <circle cx="60" cy="60" r="50" fill={`url(#${gradiente})`} />
        <g clipPath={`url(#${recorte})`}>
          <g className="sticker-raios" fill="#FFFFFF" opacity="0.2">
            {RAIOS.map((pontos) => (
              <polygon key={pontos} points={pontos} />
            ))}
          </g>
          <g transform="rotate(20 60 60)">
            <rect className="sticker-brilho" x="-10" y="-30" width="22" height="180" fill="#FFFFFF" opacity="0.45" />
          </g>
        </g>
        <text x="60" y="64" textAnchor="middle" dominantBaseline="central" fontSize="56">
          {emoji}
        </text>
      </g>
    </svg>
  )
}

export function StickerAnimado({ sticker, tamanho = 96, revelar = false }: Props) {
  const [imagemFalhou, setImagemFalhou] = useState(false)

  let conteudo
  if (sticker.tipo === 'padrao') {
    conteudo = <StickerPadrao emoji={sticker.emoji} cores={sticker.cores} animacao={sticker.animacao} tamanho={tamanho} />
  } else if (sticker.tipo === 'imagem' && !imagemFalhou) {
    conteudo = (
      <img
        src={urlDeSticker(sticker.url)}
        width={tamanho}
        height={tamanho}
        alt=""
        loading="lazy"
        onError={() => setImagemFalhou(true)}
        className="object-contain"
      />
    )
  } else {
    // Lottie (ainda sem biblioteca) ou imagem que não carregou: emoji reserva
    conteudo = <StickerPadrao emoji={sticker.emojiReserva ?? '🏆'} cores={CORES_RESERVA} animacao="pulsa" tamanho={tamanho} />
  }

  return <span className={`inline-block ${revelar ? 'sticker-revelar' : ''}`}>{conteudo}</span>
}
