// PIN da área dos pais. Guardado só como resumo (hash SHA-256 com sal), nunca o PIN em si.
// É uma trava para a criança não mexer na agenda; não é segurança contra um adulto com o aparelho.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface PaisState {
  /** "sal:hash" do PIN; null = ainda não criado */
  pin: string | null
  criarPin: (pin: string) => Promise<void>
  conferirPin: (pin: string) => Promise<boolean>
  apagarPin: () => void
}

async function resumo(sal: string, pin: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${sal}:${pin}`))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const usePaisStore = create<PaisState>()(
  persist(
    (set, get) => ({
      pin: null,
      criarPin: async (pin) => {
        const sal = [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, '0')).join('')
        set({ pin: `${sal}:${await resumo(sal, pin)}` })
      },
      conferirPin: async (pin) => {
        const salvo = get().pin
        if (!salvo) return false
        const [sal, hash] = salvo.split(':')
        return (await resumo(sal, pin)) === hash
      },
      apagarPin: () => set({ pin: null }),
    }),
    {
      name: 'futkids-pais',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ pin: s.pin }),
    },
  ),
)
