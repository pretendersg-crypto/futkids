// Treinos de fundamentos do goleiro montados pelos pais/treinador: um nome e uma lista de gestos
// do catálogo (Goleiro → Fundamentos e gestos), cada um com quantas vezes ou quantos segundos.
// Podem entrar em qualquer dia da agenda (id "fund:<id>"). Só no aparelho (localStorage).
// O app já vem com 3 treinos prontos, que os pais podem mudar ou apagar.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface ItemTreinoFundamentos {
  /** Id do gesto (catálogo do app ou criado pelos pais) */
  gesto: string
  tipo: 'vezes' | 'segundos'
  quantidade: number
  /** Recado do treinador para este gesto (ex.: "6 de cada lado") */
  observacao?: string
}

export interface TreinoFundamentos {
  id: string
  nome: string
  emoji: string
  descricao: string
  itens: ItemTreinoFundamentos[]
}

const item = (gesto: string, quantidade: number, tipo: ItemTreinoFundamentos['tipo'] = 'vezes', observacao?: string): ItemTreinoFundamentos => ({
  gesto,
  tipo,
  quantidade,
  ...(observacao ? { observacao } : {}),
})

export const TREINOS_FUNDAMENTOS_INICIAIS: TreinoFundamentos[] = [
  {
    id: 'basicos',
    nome: 'Fundamentos básicos',
    emoji: '🧤',
    descricao: 'Posição base, andar de lado, encaixar e repor',
    itens: [item('base', 30, 'segundos', 'Fique firme na posição base, olhando para a frente'), item('lateral', 10), item('encaixe', 10), item('encaixe-medio', 10), item('rolar', 10)],
  },
  {
    id: 'um-contra-um',
    nome: 'Defesa no 1 contra 1',
    emoji: '✝️',
    descricao: 'Fechar o ângulo, sair e defender de perto',
    itens: [item('posicionamento', 10), item('saida', 8), item('cruz', 8, 'vezes', '4 de cada lado'), item('estrela', 6), item('recuo', 8)],
  },
  {
    id: 'quedas-desvios',
    nome: 'Quedas e desvios',
    emoji: '🤸',
    descricao: 'Cair de lado, espalmar e defender com o pé',
    itens: [
      item('queda-lateral', 12, 'vezes', '6 de cada lado, na grama ou no colchonete'),
      item('espalmar', 8),
      item('defesa-pe', 8, 'vezes', '4 de cada lado'),
      item('mergulho', 6, 'vezes', 'Só com colchonete'),
    ],
  },
]

interface TreinosFundamentosState {
  treinos: TreinoFundamentos[]
  salvarTreino: (t: TreinoFundamentos) => void
  removerTreino: (id: string) => void
}

export const useTreinosFundamentosStore = create<TreinosFundamentosState>()(
  persist(
    (set) => ({
      treinos: TREINOS_FUNDAMENTOS_INICIAIS,
      salvarTreino: (t) => set((s) => ({ treinos: s.treinos.some((x) => x.id === t.id) ? s.treinos.map((x) => (x.id === t.id ? t : x)) : [...s.treinos, t] })),
      removerTreino: (id) => set((s) => ({ treinos: s.treinos.filter((t) => t.id !== id) })),
    }),
    {
      name: 'futkids-treinos-fundamentos',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ treinos: s.treinos }),
    },
  ),
)
