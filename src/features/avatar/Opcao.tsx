// Botão quadrado de escolha (cor de pele, estilo de cabelo, apelido...).
// A opção escolhida tem borda grossa E um ✓, para não depender só de cor.
import type { ReactNode } from 'react'

interface Props {
  selecionada: boolean
  /** Nome lido pelo leitor de tela (o conteúdo visual costuma ser só cor ou desenho) */
  rotulo: string
  aoEscolher: () => void
  children: ReactNode
  className?: string
}

export function Opcao({ selecionada, rotulo, aoEscolher, children, className = 'size-18' }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selecionada}
      aria-label={rotulo}
      onClick={aoEscolher}
      className={`relative flex items-center justify-center rounded-2xl border-4 bg-white ${
        selecionada ? 'border-campo-escuro shadow-md' : 'border-green-100'
      } ${className}`}
    >
      {children}
      {selecionada && (
        <span
          aria-hidden
          className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-campo text-sm font-black text-white"
        >
          ✓
        </span>
      )}
    </button>
  )
}
