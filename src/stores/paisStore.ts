// PIN da área dos pais. Guardado só como resumo (hash SHA-256 com sal), nunca o PIN em si.
// É uma trava para a criança não mexer na agenda; não é segurança contra um adulto com o aparelho.
// É da família (com a conta Google, o mesmo PIN vale em todos os aparelhos). A categoria escolhida
// pelos pais é de cada filho e fica no userStore.
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
      // v2: a categoria fixa saiu daqui (foi para o userStore, que lê o valor antigo ao migrar)
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ pin: s.pin }),
      migrate: (salvo) => {
        // Guarda a categoria antiga para o userStore achar, seja qual for a ordem de carregar
        const antiga = (salvo as { categoriaFixa?: string | null }).categoriaFixa
        if (antiga) {
          try {
            localStorage.setItem('futkids-categoria-antiga', antiga)
          } catch {
            // sem espaço: fica a categoria pelo XP
          }
        }
        return { pin: (salvo as { pin?: string | null }).pin ?? null }
      },
    },
  ),
)
