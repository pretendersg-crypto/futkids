// Conta NESTE aparelho: quem entrou (id e e-mail do responsável, ou "aparelho da criança" sem e-mail),
// a família, os atletas dela (apelidos) e qual atleta usa este aparelho agora. Fica só no aparelho.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Atleta {
  id: string
  apelido: string
}

export type EstadoSincronia = 'parada' | 'sincronizando' | 'em-dia' | 'sem-internet' | 'erro'

interface ContaState {
  uid: string | null
  email: string | null
  /** true = aparelho da criança (entrou com o código do atleta, sem e-mail) */
  aparelhoDaCrianca: boolean
  familia: string | null
  /** Escolinha em que este adulto é treinador (null = não é treinador) */
  escolinha: string | null
  atletas: Atleta[]
  /** Atleta cujos dados estão ativos neste aparelho (null = ainda não escolheu) */
  atletaAtivo: string | null
  /** Última sincronia completa (ms) */
  sincronizadoEm: number | null
  estado: EstadoSincronia
  erro: string | null
  entrou: (dados: { uid: string; email: string | null; aparelhoDaCrianca: boolean; familia: string | null; escolinha?: string | null }) => void
  definirEscolinha: (escolinha: string | null) => void
  definirAtletas: (atletas: Atleta[]) => void
  definirAtletaAtivo: (id: string | null) => void
  definirEstado: (estado: EstadoSincronia, erro?: string | null) => void
  marcarSincronizado: () => void
  limpar: () => void
}

const VAZIO = { uid: null, email: null, aparelhoDaCrianca: false, familia: null, escolinha: null, atletas: [], atletaAtivo: null, sincronizadoEm: null }

export const useContaStore = create<ContaState>()(
  persist(
    (set) => ({
      ...VAZIO,
      estado: 'parada',
      erro: null,
      entrou: (dados) => set(dados),
      definirAtletas: (atletas) => set({ atletas }),
      definirEscolinha: (escolinha) => set({ escolinha }),
      definirAtletaAtivo: (atletaAtivo) => set({ atletaAtivo }),
      definirEstado: (estado, erro = null) => set({ estado, erro }),
      marcarSincronizado: () => set({ sincronizadoEm: Date.now(), estado: 'em-dia', erro: null }),
      limpar: () => set({ ...VAZIO, estado: 'parada', erro: null }),
    }),
    {
      name: 'futkids-conta',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        uid: s.uid,
        email: s.email,
        aparelhoDaCrianca: s.aparelhoDaCrianca,
        familia: s.familia,
        escolinha: s.escolinha,
        atletas: s.atletas,
        atletaAtivo: s.atletaAtivo,
        sincronizadoEm: s.sincronizadoEm,
      }),
      // v1 (família = conta do Google, "filhos") nunca foi publicada: começa do zero
      migrate: () => VAZIO,
    },
  ),
)

/** Apelido do atleta ativo neste aparelho (ou null) */
export function apelidoDoAtletaAtivo(): string | null {
  const { atletas, atletaAtivo } = useContaStore.getState()
  return atletas.find((a) => a.id === atletaAtivo)?.apelido ?? null
}
