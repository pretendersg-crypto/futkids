// Conquistas desbloqueadas (com a data), figurinhas ainda não vistas no álbum e a fila de
// comemorações. Salvo só no aparelho (localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { CONQUISTAS } from '../data/catalogo'
import { criterioAtingido, type DadosProgresso } from '../features/conquistas/criterios'
import { hojeISO } from '../utils/data'

interface AchievementsState {
  /** id da conquista → data do desbloqueio (AAAA-MM-DD) */
  desbloqueadas: Record<string, string>
  /** Desbloqueadas que a criança ainda não viu no álbum (ganham a animação de revelação) */
  naoVistas: string[]
  /** Desbloqueadas esperando a janela de comemoração (uma de cada vez) */
  paraComemorar: string[]
  /** Confere todas as regras e desbloqueia as que foram atingidas agora */
  verificar: (dados: DadosProgresso) => void
  marcarVistas: () => void
  /** Tira a primeira da fila de comemoração (depois que a janela foi fechada) */
  comemorada: () => void
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      desbloqueadas: {},
      naoVistas: [],
      paraComemorar: [],
      verificar: (dados) => {
        const { desbloqueadas } = get()
        const novas = CONQUISTAS.filter((c) => !desbloqueadas[c.id] && criterioAtingido(c.criterio, dados)).map((c) => c.id)
        if (novas.length === 0) return
        const hoje = hojeISO()
        set((s) => ({
          desbloqueadas: { ...s.desbloqueadas, ...Object.fromEntries(novas.map((id) => [id, hoje])) },
          naoVistas: [...s.naoVistas, ...novas],
          paraComemorar: [...s.paraComemorar, ...novas],
        }))
      },
      marcarVistas: () => set({ naoVistas: [] }),
      comemorada: () => set((s) => ({ paraComemorar: s.paraComemorar.slice(1) })),
    }),
    {
      name: 'futkids-conquistas',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ desbloqueadas: s.desbloqueadas, naoVistas: s.naoVistas, paraComemorar: s.paraComemorar }),
    },
  ),
)
