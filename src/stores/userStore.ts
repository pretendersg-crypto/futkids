// Dados do jogador: apelido e avatar. Nenhum dado pessoal: o apelido vem de uma lista pronta
// ou é digitado por um adulto, e tudo fica só no aparelho (localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AVATAR_PADRAO, type AvatarConfig } from '../features/avatar/opcoesAvatar'

interface UserState {
  /** Vazio enquanto a criança não montou o jogador pela primeira vez */
  apelido: string
  avatar: AvatarConfig
  salvarJogador: (apelido: string, avatar: AvatarConfig) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      apelido: '',
      avatar: AVATAR_PADRAO,
      salvarJogador: (apelido, avatar) => set({ apelido: apelido.trim(), avatar }),
    }),
    {
      name: 'futkids-jogador',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ apelido: s.apelido, avatar: s.avatar }),
    },
  ),
)
