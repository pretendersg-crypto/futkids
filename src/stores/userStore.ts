// Dados do jogador: apelido, avatar, itens comprados na loja e a categoria escolhida pelos pais.
// Nenhum dado pessoal: o apelido vem de uma lista pronta ou é digitado por um adulto.
// É de cada filho (com a conta da família, vai junto com o perfil dele).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CategoriaId } from '../data/categorias'
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
  /** Categoria escolhida pelos pais; null = sobe sozinha pelo XP */
  categoriaFixa: CategoriaId | null
  fixarCategoria: (categoria: CategoriaId | null) => void
}

/** Categoria fixa que ficava no store dos pais (antes da conta da família, versão 2) */
function categoriaDoStoreDosPais(): CategoriaId | null {
  try {
    const doStore = JSON.parse(localStorage.getItem('futkids-pais') ?? '{}')?.state?.categoriaFixa as CategoriaId | null | undefined
    return doStore ?? (localStorage.getItem('futkids-categoria-antiga') as CategoriaId | null)
  } catch {
    return null
  }
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
      categoriaFixa: null,
      fixarCategoria: (categoriaFixa) => set({ categoriaFixa }),
    }),
    {
      name: 'futkids-jogador',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ apelido: s.apelido, avatar: s.avatar, itensComprados: s.itensComprados, categoriaFixa: s.categoriaFixa }),
      // v1 → v2: o avatar ganhou "acessorio" (completa com os valores padrão)
      // v2 → v3: a categoria fixa veio do store dos pais (que passou a ser da família toda)
      migrate: (salvo, versao) => {
        let dados = salvo as Partial<UserState>
        if (versao < 2) dados = { ...dados, avatar: { ...AVATAR_PADRAO, ...dados.avatar } }
        if (versao < 3) dados = { ...dados, categoriaFixa: categoriaDoStoreDosPais() }
        return dados
      },
    },
  ),
)
