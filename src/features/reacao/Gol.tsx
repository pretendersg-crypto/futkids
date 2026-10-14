// O gol do treino de reação, dividido em 6 partes (2 linhas x 3 colunas), visto de frente como o
// goleiro vê. Serve para mostrar o sinal de longe (celular no chão) e, no modo toque, é a própria
// resposta: a criança toca na parte em que a bola apareceu. A grade da toupeira (3 x 3) também.
import type { ReactNode } from 'react'
import { CANTOS, CASAS_TOUPEIRA, type CantoId } from './sinais'

const REDE = 'repeating-linear-gradient(45deg, rgba(255,255,255,.12) 0 2px, transparent 2px 14px), repeating-linear-gradient(-45deg, rgba(255,255,255,.12) 0 2px, transparent 2px 14px)'

interface PropsGol {
  /** Canto com a bola agora (null = sem bola) */
  bola: CantoId | null
  /** Cantos que o drill usa (os outros ficam apagados) */
  cantos: CantoId[]
  /** Modo toque: tocar numa parte */
  aoTocar?: (canto: CantoId) => void
  /** Algo por cima do gol (ex.: "FINTA!") */
  sobre?: ReactNode
}

export function Gol({ bola, cantos, aoTocar, sobre }: PropsGol) {
  return (
    <div className="relative flex size-full items-center justify-center">
      {/* Trave (3 lados) e rede; proporção do gol de futsal (3 m x 2 m) */}
      <div className="relative aspect-[3/2] max-h-full w-full rounded-t-lg border-x-[10px] border-t-[10px] border-white bg-slate-700" style={{ backgroundImage: REDE }}>
        <div className="grid size-full grid-cols-3 grid-rows-2">
          {CANTOS.map((c) => {
            const usado = cantos.includes(c.id)
            const comBola = bola === c.id
            const conteudo = comBola && (
              <span aria-hidden className="pop text-[70cqmin] leading-none drop-shadow-lg">
                ⚽
              </span>
            )
            // container-type: o tamanho da bola acompanha o da casa
            const classe = `grid place-items-center overflow-hidden [container-type:size] border border-dashed border-white/25 ${comBola ? 'bg-yellow-300/40' : ''} ${usado ? '' : 'bg-black/30'}`
            return aoTocar && usado ? (
              <button
                key={c.id}
                type="button"
                aria-label={c.nome}
                // pointerdown responde no instante do toque (o click espera o dedo sair)
                onPointerDown={(e) => {
                  e.preventDefault()
                  aoTocar(c.id)
                }}
                className={`${classe} touch-manipulation select-none active:bg-white/30`}
              >
                {conteudo}
              </button>
            ) : (
              <div key={c.id} className={classe}>
                {conteudo}
              </div>
            )
          })}
        </div>
        {sobre && <div className="pointer-events-none absolute inset-0 grid place-items-center">{sobre}</div>}
      </div>
    </div>
  )
}

/** Grade de 9 buracos do bate-toupeira */
export function Toupeiras({ casa, aoTocar }: { casa: number | null; aoTocar?: (casa: number) => void }) {
  return (
    <div className="grid aspect-square max-h-full w-full max-w-[min(100%,28rem)] grid-cols-3 gap-3 rounded-3xl bg-green-700 p-3">
      {Array.from({ length: CASAS_TOUPEIRA }, (_, i) => {
        const comToupeira = casa === i
        return (
          <button
            key={i}
            type="button"
            aria-label={`Buraco ${i + 1}`}
            disabled={!aoTocar}
            onPointerDown={(e) => {
              e.preventDefault()
              aoTocar?.(i)
            }}
            className="grid touch-manipulation place-items-center overflow-hidden rounded-full bg-amber-900 [container-type:size] shadow-[inset_0_8px_12px_rgba(0,0,0,.5)] select-none active:scale-95"
          >
            {comToupeira && (
              <span aria-hidden className="pop text-[65cqmin] leading-none">
                🐹
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
