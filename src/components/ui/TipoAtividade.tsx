// Selo e bloco dos dois tipos de atividade (🏃 treino com o corpo / 🎮 jogo na tela), iguais em
// todas as telas para a diferença ficar clara à primeira vista.
import type { ReactNode } from 'react'
import { TIPOS, type TipoAtividade } from '../../data/tiposAtividade'

/** Selo pequeno, para cartões e itens da agenda */
export function SeloTipo({ tipo, className = '' }: { tipo: TipoAtividade; className?: string }) {
  const t = TIPOS[tipo]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black tracking-wide whitespace-nowrap uppercase ${t.corSelo} ${className}`}>
      <span aria-hidden>{t.emoji}</span> {t.selo}
    </span>
  )
}

/** Bloco de seção: cabeçalho grande com o tipo e o conteúdo dentro de uma moldura da mesma cor */
export function BlocoTipo({ tipo, titulo, explicacao, id, children }: { tipo: TipoAtividade; titulo?: string; explicacao?: string; id?: string; children: ReactNode }) {
  const t = TIPOS[tipo]
  return (
    <section id={id} aria-label={titulo ?? t.titulo} className={`flex flex-col gap-3 rounded-3xl border-4 p-3 ${t.corBloco}`}>
      <header className="flex items-center gap-3">
        <span aria-hidden className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${t.corSelo}`}>
          {t.emoji}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-xs font-black tracking-wide uppercase opacity-80">{t.selo}</span>
          <span className="text-xl leading-tight font-extrabold">{titulo ?? t.titulo}</span>
          <span className="text-sm leading-snug">{explicacao ?? t.explicacao}</span>
        </span>
      </header>
      {children}
    </section>
  )
}
