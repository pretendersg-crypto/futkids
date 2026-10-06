// Campo visto de frente: céu, gol com rede e gramado com a marca do pênalti.
// As posições dentro da arena usam frações (0 a 1) da largura/altura, e GOL diz onde fica o gol.
import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { GOL, PENALTI } from './geometria'
import './goleiro.css'


interface Props extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
  children?: ReactNode
}

export function Arena({ ref, children, className = '', ...resto }: Props) {
  return (
    <div
      ref={ref}
      {...resto}
      // @container: tamanhos internos em "cqw" acompanham a largura da arena
      className={`@container relative aspect-[4/5] w-full touch-none overflow-hidden rounded-3xl border-4 border-white shadow-lg select-none ${className}`}
    >
      {/* Céu e gramado */}
      <div className="absolute inset-x-0 top-0 h-[57%] bg-linear-to-b from-sky-300 to-sky-100" />
      <div className="gramado absolute inset-x-0 bottom-0 h-[43%]" />
      {/* Gol: traves e travessão brancos, rede atrás */}
      <div
        className="rede-gol absolute rounded-t-md border-[6px] border-b-0 border-white"
        style={{ left: `${GOL.x * 100}%`, top: `${GOL.y * 100}%`, width: `${GOL.w * 100}%`, height: `${GOL.h * 100}%` }}
      />
      {/* Linha do gol e marca do pênalti */}
      <div className="absolute inset-x-0 h-1 bg-white/80" style={{ top: `${(GOL.y + GOL.h) * 100}%` }} />
      <div
        className="absolute size-3 -translate-1/2 rounded-full bg-white"
        style={{ left: `${PENALTI.x * 100}%`, top: `${PENALTI.y * 100}%` }}
      />
      {children}
    </div>
  )
}

/** Mensagem grande no meio da arena depois de cada jogada */
export function AvisoJogada({ defendeu }: { defendeu: boolean }) {
  return (
    <p
      role="status"
      className={`aviso-jogada absolute top-1/2 left-1/2 z-20 -translate-1/2 rounded-3xl px-6 py-3 text-center text-3xl font-black whitespace-nowrap shadow-xl ${
        defendeu ? 'bg-sol text-campo-escuro' : 'bg-white text-campo-escuro'
      }`}
    >
      {defendeu ? 'DEFENDEU! 🧤' : 'Gol... quase! 💪'}
    </p>
  )
}
