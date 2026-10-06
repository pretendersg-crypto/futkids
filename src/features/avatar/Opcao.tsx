// Botão quadrado de escolha (cor de pele, estilo de cabelo, apelido...).
// A opção escolhida tem borda grossa E um ✓, para não depender só de cor.
// Item da loja ainda não comprado: fica apagadinho, com 🔒 e o preço em moedas.
import type { ReactNode } from 'react'

interface Props {
  selecionada: boolean
  /** Nome lido pelo leitor de tela (o conteúdo visual costuma ser só cor ou desenho) */
  rotulo: string
  aoEscolher: () => void
  children: ReactNode
  className?: string
  /** Preço, quando é item da loja ainda bloqueado */
  preco?: number
}

export function Opcao({ selecionada, rotulo, aoEscolher, children, className = 'size-18', preco }: Props) {
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
      <span className={`flex items-center justify-center ${preco ? 'opacity-50 grayscale-[60%]' : ''}`}>{children}</span>
      {preco !== undefined && (
        <span aria-hidden className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow-300 px-1.5 text-xs font-black whitespace-nowrap shadow">
          🔒 {preco}
        </span>
      )}
      {selecionada && (
        <span
          aria-hidden
          className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-green-700 text-sm font-black text-white"
        >
          ✓
        </span>
      )}
    </button>
  )
}
