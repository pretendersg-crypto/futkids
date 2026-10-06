// Faixa "Hora de treinar!" no topo, quando o lembrete chega com o app na tela.
import { Link } from 'react-router'
import { useAgendaStore } from '../../stores/agendaStore'

export function AvisoLembrete() {
  const visivel = useAgendaStore((s) => s.avisoNoApp)
  const fechar = useAgendaStore((s) => s.fecharAvisoNoApp)
  if (!visivel) return null

  return (
    <div role="status" className="aviso-jogada fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 mx-auto flex max-w-md items-center gap-2 rounded-3xl border-4 border-violet-400 bg-violet-100 p-2 shadow-xl">
      <span aria-hidden className="text-3xl">
        ⏰
      </span>
      <Link to="/agenda" onClick={fechar} className="flex-1 text-lg leading-tight font-extrabold">
        Hora de treinar! <span className="block text-sm font-bold">Toque para ver a agenda</span>
      </Link>
      <button type="button" onClick={fechar} aria-label="Fechar aviso" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-xl">
        ✖️
      </button>
    </div>
  )
}
