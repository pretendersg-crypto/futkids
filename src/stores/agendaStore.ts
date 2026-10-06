// Configuração do lembrete diário e prêmios de missão já resgatados (só no aparelho).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AgendaState {
  lembreteAtivo: boolean
  /** Horário do lembrete, "HH:MM" */
  horario: string
  /** Último dia (AAAA-MM-DD) em que o lembrete já avisou; avisa no máximo 1 vez por dia */
  ultimoAvisoDia: string | null
  /** Aviso "Hora de treinar!" esperando aparecer dentro do app */
  avisoNoApp: boolean
  /** Missões cujo prêmio já foi pego (ex.: "dia:2026-10-06", "semana:2026-10-04") */
  missoesResgatadas: string[]
  configurarLembrete: (ativo: boolean, horario: string) => void
  registrarAviso: (dia: string, noApp: boolean) => void
  fecharAvisoNoApp: () => void
  /** Marca o prêmio da missão como pego; devolve false se já tinha sido pego */
  resgatarMissao: (chave: string) => boolean
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set, get) => ({
      lembreteAtivo: false,
      horario: '17:00',
      ultimoAvisoDia: null,
      avisoNoApp: false,
      missoesResgatadas: [],
      configurarLembrete: (lembreteAtivo, horario) => set({ lembreteAtivo, horario }),
      registrarAviso: (dia, noApp) => set({ ultimoAvisoDia: dia, avisoNoApp: noApp }),
      fecharAvisoNoApp: () => set({ avisoNoApp: false }),
      resgatarMissao: (chave) => {
        if (get().missoesResgatadas.includes(chave)) return false
        // Guarda só as últimas, a lista não precisa crescer para sempre
        set((s) => ({ missoesResgatadas: [...s.missoesResgatadas, chave].slice(-60) }))
        return true
      },
    }),
    {
      name: 'futkids-agenda',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lembreteAtivo: s.lembreteAtivo,
        horario: s.horario,
        ultimoAvisoDia: s.ultimoAvisoDia,
        avisoNoApp: s.avisoNoApp,
        missoesResgatadas: s.missoesResgatadas,
      }),
    },
  ),
)
