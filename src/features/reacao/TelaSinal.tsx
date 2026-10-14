// Desenho de um sinal: cor (bloco enorme), seta (verde ou vermelha), número gigante, o gol com a
// bola num canto, a finta, a palavra colorida ou a toupeira. Feito para ser visto a uns 3 passos.
// O apito ("som") não tem desenho: a tela de espera continua (ver ExecutarDrill).
import { Gol, Toupeiras } from './Gol'
import { CANTOS, corPorId, direcaoPorId, type Sinal } from './sinais'

interface Props {
  sinal: Sinal
  /** Tamanho em px da seta/número (a cor ocupa o espaço todo) */
  tamanho: number
}

/** Placa da finta: o certo é segurar */
export function PlacaFinta() {
  return (
    <div className="pop flex flex-col items-center gap-1 rounded-3xl bg-slate-900/90 px-6 py-4 text-center text-white">
      <span aria-hidden className="text-[min(22vw,8rem)] leading-none">
        🕺
      </span>
      <span className="text-4xl font-black text-amber-300 uppercase">Finta!</span>
      <span className="text-xl font-extrabold">Fique firme 🧱</span>
    </div>
  )
}

export function TelaSinal({ sinal, tamanho }: Props) {
  switch (sinal.tipo) {
    case 'cor': {
      const cor = corPorId(sinal.cor)
      return (
        <div className="grid size-full place-items-center rounded-[2rem]" style={{ background: cor.fundo, color: cor.texto }}>
          {/* O nome também aparece: ajuda quem confunde cores (daltonismo) */}
          <span className="text-5xl font-black tracking-wide uppercase drop-shadow">{cor.nome}</span>
        </div>
      )
    }

    case 'numero':
      return (
        <div className="grid size-full place-items-center rounded-[2rem] bg-white text-slate-900">
          <span className="leading-none font-black" style={{ fontSize: `min(${tamanho}px, 70vw)` }}>
            {sinal.numero}
          </span>
        </div>
      )

    case 'canto':
      return (
        <div className="grid size-full place-items-center p-2">
          <Gol bola={sinal.canto} cantos={CANTOS.map((c) => c.id)} />
        </div>
      )

    case 'finta':
      return (
        <div className="grid size-full place-items-center rounded-[2rem] bg-slate-900">
          <PlacaFinta />
        </div>
      )

    case 'palavra': {
      const tinta = corPorId(sinal.tinta)
      return (
        <div className="grid size-full place-items-center rounded-[2rem] bg-white">
          {/* A tinta é o que vale: a palavra é a "pegadinha" */}
          <span className="text-[min(18vw,6rem)] leading-none font-black uppercase" style={{ color: tinta.fundo }}>
            {corPorId(sinal.palavra).nome}
          </span>
        </div>
      )
    }

    case 'toupeira':
      return (
        <div className="grid size-full place-items-center p-2">
          <Toupeiras casa={sinal.casa} />
        </div>
      )

    case 'som':
      return null

    case 'seta': {
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
  }
}
