// Progresso da criança (XP, moedas, contadores de treinos e dias treinados),
// salvo só no aparelho (localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { hojeISO } from '../utils/data'
import { nivelPorXP } from '../utils/nivel'

export interface ResultadoXP {
  nivel: number
  /** true quando este ganho de XP fez a criança subir de nível (hora de comemorar!) */
  subiuDeNivel: boolean
}

interface ProgressState {
  xp: number
  moedas: number
  /** Quantas vezes cada atividade foi concluída (ex.: { aquecimento: 3 }); base das conquistas */
  contadores: Record<string, number>
  /** Dias (AAAA-MM-DD) em que a criança treinou; base do streak da agenda */
  diasTreinados: string[]
  ganharXP: (quantidade: number) => ResultadoXP
  ganharMoedas: (quantidade: number) => void
  /** Desconta moedas; devolve false (sem descontar nada) se não houver saldo */
  gastarMoedas: (quantidade: number) => boolean
  /** Conta mais uma atividade concluída e marca hoje como dia de treino */
  registrarAtividade: (tipo: string) => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      moedas: 0,
      contadores: {},
      diasTreinados: [],
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
      registrarAtividade: (tipo) =>
        set((s) => {
          const hoje = hojeISO()
          return {
            contadores: { ...s.contadores, [tipo]: (s.contadores[tipo] ?? 0) + 1 },
            diasTreinados: s.diasTreinados.includes(hoje) ? s.diasTreinados : [...s.diasTreinados, hoje],
          }
        }),
    }),
    {
      name: 'futkids-progresso',
      // Campos novos não precisam de migração: o que faltar no salvo vem do valor inicial acima
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Só os dados vão para o localStorage, as funções não
      partialize: (s) => ({ xp: s.xp, moedas: s.moedas, contadores: s.contadores, diasTreinados: s.diasTreinados }),
    },
  ),
)
