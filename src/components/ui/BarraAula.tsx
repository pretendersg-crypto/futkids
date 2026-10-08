// Barra fixa no pé da tela, igual à de um curso online: ⏮ Anterior · 📋 Lista · ✅ Concluída ·
// ⏭ Próximo. Usada nos fundamentos do goleiro (trilha dos gestos e treinos de fundamentos).
interface Props {
  /** undefined = está no primeiro (botão apagado) */
  aoAnterior?: () => void
  aoLista: () => void
  concluida: boolean
  aoConcluir: () => void
  /** false = ainda não pode marcar (ex.: cronômetro rodando) */
  podeConcluir?: boolean
  /** undefined = está no último (botão apagado), a menos que haja rotuloProximo */
  aoProximo?: () => void
  /** Troca o "Próximo" (ex.: "Terminar" no último passo do treino) */
  rotuloProximo?: { emoji: string; texto: string }
}

export function BarraAula({ aoAnterior, aoLista, concluida, aoConcluir, podeConcluir = true, aoProximo, rotuloProximo }: Props) {
  const botao = 'flex min-h-16 min-w-0 flex-col items-center justify-center rounded-2xl text-xs leading-tight font-extrabold disabled:opacity-35'
  return (
    <nav
      aria-label="Navegação dos fundamentos"
      className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 grid grid-cols-4 gap-1 rounded-3xl bg-slate-800 p-1.5 text-white shadow-lg"
    >
      <button type="button" onClick={aoAnterior} disabled={!aoAnterior} className={botao}>
        <span aria-hidden className="text-2xl">
          ⏮️
        </span>
        Anterior
      </button>
      <button type="button" onClick={aoLista} className={botao}>
        <span aria-hidden className="text-2xl">
          📋
        </span>
        Lista
      </button>
      <button
        type="button"
        onClick={aoConcluir}
        disabled={!podeConcluir}
        aria-pressed={concluida}
        className={`${botao} ${concluida ? 'bg-green-500 text-white' : 'bg-white text-slate-900'}`}
      >
        <span aria-hidden className="text-2xl">
          {concluida ? '✅' : '⬜'}
        </span>
        Concluída
      </button>
      {/* Depois de concluir, o Próximo acende (é o passo seguinte) */}
      <button type="button" onClick={aoProximo} disabled={!aoProximo} className={`${botao} ${concluida && aoProximo ? 'bg-sol text-slate-900' : ''}`}>
        <span aria-hidden className="text-2xl">
          {rotuloProximo?.emoji ?? '⏭️'}
        </span>
        {rotuloProximo?.texto ?? 'Próximo'}
      </button>
    </nav>
  )
}
