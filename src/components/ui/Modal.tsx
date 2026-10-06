// Janela por cima da tela, usando o <dialog> nativo do navegador
// (já prende o foco dentro da janela e fecha com Esc / botão voltar do teclado).
import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  children: ReactNode
}

export function Modal({ aberto, aoFechar, titulo, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (aberto && !dialogo.open) dialogo.showModal()
    if (!aberto && dialogo.open) dialogo.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      // No React o "close" de uma janela aberta DENTRO desta (ex.: portão dos pais sobre a
      // comemoração) sobe até aqui; só reage ao fechamento desta própria janela
      onClose={(e) => e.target === ref.current && aoFechar()}
      // Toque no fundo escuro (fora da caixa) fecha a janela
      onClick={(e) => e.target === ref.current && aoFechar()}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl bg-white p-0 text-campo-escuro shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-2xl font-extrabold">{titulo}</h2>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-green-100 text-2xl"
          >
            ✖️
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
