// Dados do jogador: apelido, avatar e itens comprados na loja. Nenhum dado pessoal: o apelido
// vem de uma lista pronta ou é digitado por um adulto, e tudo fica só no aparelho (localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AVATAR_PADRAO, type AvatarConfig } from '../features/avatar/opcoesAvatar'
import { useProgressStore } from './progressStore'

interface UserState {
  /** Vazio enquanto a criança não montou o jogador pela primeira vez */
  apelido: string
  avatar: AvatarConfig
  /** Itens da loja já comprados, ex.: ["acessorio:coroa", "uniforme:neon"] */
  itensComprados: string[]
  salvarJogador: (apelido: string, avatar: AvatarConfig) => void
  /** Compra com moedas; devolve false (sem gastar nada) se não tiver saldo ou já tiver o item */
  comprarItem: (chave: string, preco: number) => boolean
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      apelido: '',
      avatar: AVATAR_PADRAO,
      itensComprados: [],
      salvarJogador: (apelido, avatar) => set({ apelido: apelido.trim(), avatar }),
      comprarItem: (chave, preco) => {
        if (get().itensComprados.includes(chave)) return false
        if (!useProgressStore.getState().gastarMoedas(preco)) return false
        set((s) => ({ itensComprados: [...s.itensComprados, chave] }))
        return true
      },
    }),
    {
      name: 'futkids-jogador',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ apelido: s.apelido, avatar: s.avatar, itensComprados: s.itensComprados }),
      // v1 → v2: o avatar ganhou "acessorio" (completa com os valores padrão)
      migrate: (salvo, versao) => {
        const dados = salvo as Partial<UserState>
        if (versao < 2) return { ...dados, avatar: { ...AVATAR_PADRAO, ...dados.avatar } }
        return dados
      },
    },
  ),
)
