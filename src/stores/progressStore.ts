// Progresso da criança (XP e moedas), salvo só no aparelho (localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { nivelPorXP } from '../utils/nivel'

export interface ResultadoXP {
  nivel: number
  /** true quando este ganho de XP fez a criança subir de nível (hora de comemorar!) */
  subiuDeNivel: boolean
}

interface ProgressState {
  xp: number
  moedas: number
  ganharXP: (quantidade: number) => ResultadoXP
  ganharMoedas: (quantidade: number) => void
  /** Desconta moedas; devolve false (sem descontar nada) se não houver saldo */
  gastarMoedas: (quantidade: number) => boolean
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      moedas: 0,
      ganharXP: (quantidade) => {
        const antes = nivelPorXP(get().xp).nivel
        const xp = get().xp + Math.max(0, quantidade)
        set({ xp })
        const depois = nivelPorXP(xp).nivel
        return { nivel: depois, subiuDeNivel: depois > antes }
      },
      ganharMoedas: (quantidade) => set((s) => ({ moedas: s.moedas + Math.max(0, quantidade) })),
      gastarMoedas: (quantidade) => {
        if (quantidade < 0 || get().moedas < quantidade) return false
        set((s) => ({ moedas: s.moedas - quantidade }))
        return true
      },
    }),
    {
      name: 'futkids-progresso',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Só os dados vão para o localStorage, as funções não
      partialize: (s) => ({ xp: s.xp, moedas: s.moedas }),
    },
  ),
)
