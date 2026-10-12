// Pedaços de tela da conta: cartão, mensagem de erro e o código em letras grandes.
import type { ReactNode } from 'react'
import { mostrarCodigo } from '../../conta/codigos'

export function Cartao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border-4 border-sky-300 bg-sky-50 p-3">
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      {children}
    </section>
  )
}

export function MensagemErro({ erro }: { erro: string }) {
  if (!erro) return null
  return (
    <p role="alert" className="font-bold text-red-700">
      ❌ {erro}
    </p>
  )
}

/** Código de convite em letras grandes, fácil de ditar */
export function CodigoGrande({ codigo, legenda }: { codigo: string; legenda: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
      <p className="font-mono text-4xl font-black tracking-widest select-all">{mostrarCodigo(codigo)}</p>
      <p className="text-center text-sm">{legenda}</p>
    </div>
  )
}
