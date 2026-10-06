// Desenho de um sinal: cor (bloco enorme), seta (verde ou vermelha) ou número gigante.
// Feito para ser visto a uns 3 passos de distância.
import { corPorId, direcaoPorId, type Sinal } from './sinais'

interface Props {
  sinal: Sinal
  /** Tamanho em px da seta/número (a cor ocupa o espaço todo) */
  tamanho: number
}

export function TelaSinal({ sinal, tamanho }: Props) {
  if (sinal.tipo === 'cor') {
    const cor = corPorId(sinal.cor)
    return (
      <div className="grid size-full place-items-center rounded-[2rem]" style={{ background: cor.fundo, color: cor.texto }}>
        {/* O nome também aparece: ajuda quem confunde cores (daltonismo) */}
        <span className="text-5xl font-black tracking-wide uppercase drop-shadow">{cor.nome}</span>
      </div>
    )
  }

  if (sinal.tipo === 'numero') {
    return (
      <div className="grid size-full place-items-center rounded-[2rem] bg-white text-slate-900">
        <span className="leading-none font-black" style={{ fontSize: `min(${tamanho}px, 70vw)` }}>
          {sinal.numero}
        </span>
      </div>
    )
  }

  const direcao = direcaoPorId(sinal.direcao)
  const cor = sinal.invertida ? '#dc2626' : '#16a34a'
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 rounded-[2rem] bg-slate-900">
      <svg
        viewBox="0 0 100 100"
        // Cabe em tela estreita: no máximo `tamanho` px e 80% da largura
        style={{ transform: `rotate(${direcao.graus}deg)`, width: `min(${tamanho}px, 80%)`, height: 'auto' }}
        role="img"
        aria-label={`Seta ${sinal.invertida ? 'vermelha' : 'verde'} para ${direcao.nome}`}
      >
        <path d="M8 38 H58 V16 L94 50 L58 84 V62 H8 Z" fill={cor} stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      </svg>
      {sinal.invertida && <span className="text-2xl font-black text-red-300 uppercase">Ao contrário!</span>}
    </div>
  )
}
