// Pai/Mãe Treinador: perfil (apelido e avatar), XP de treinador, ações já pontuadas, lições
// estudadas e as últimas conquistas. Só no aparelho (localStorage). Nenhum dado pessoal: o
// "apelido" é como a criança chama o adulto no app (ex.: "Treinador", "Mãe Treinadora").
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { nivelTreinador } from '../features/treinador/niveis'
import type { AvatarTreinadorConfig } from '../features/treinador/opcoesTreinador'
import { medalhasGanhas, PONTOS, type TipoPonto } from '../features/treinador/pontos'
import { diaDaSemana, hojeISO, somarDias } from '../utils/data'

export interface PerfilTreinador {
  apelido: string
  avatar: AvatarTreinadorConfig
}

export interface Ganho {
  quando: string
  texto: string
  xp: number
}

/** Aviso que aparece por cima da área dos pais (não fica salvo) */
export interface AvisoTreinador {
  id: number
  xp: number
  texto: string
  /** Título do nível novo, se subiu */
  subiu?: string
  /** Medalhas novas */
  medalhas: string[]
}

interface TreinadorState {
  perfil: PerfilTreinador | null
  xp: number
  /** Ações já pontuadas ("tipo:referência") */
  chaves: string[]
  /** Lições concluídas: id → acertos no quiz (melhor resultado) */
  licoes: Record<string, number>
  historico: Ganho[]
  aviso: AvisoTreinador | null
  salvarPerfil: (p: PerfilTreinador) => void
  /** Dá os pontos da ação (uma vez por referência). Devolve true se pontuou. */
  pontuar: (tipo: TipoPonto, referencia: string, texto: string) => boolean
  /** Guarda o resultado de uma lição (o melhor) */
  registrarLicao: (id: string, acertos: number) => void
  fecharAviso: () => void
}

const MAXIMO_HISTORICO = 40

export const useTreinadorStore = create<TreinadorState>()(
  persist(
    (set, get) => ({
      perfil: null,
      xp: 0,
      chaves: [],
      licoes: {},
      historico: [],
      aviso: null,
      salvarPerfil: (perfil) => set({ perfil }),
      pontuar: (tipo, referencia, texto) => {
        const s = get()
        const chave = `${tipo}:${referencia}`
        if (s.chaves.includes(chave)) return false
        const xp = PONTOS[tipo]
        const chaves = [...s.chaves, chave]
        const antes = nivelTreinador(s.xp).atual
        const depois = nivelTreinador(s.xp + xp).atual
        const medalhasAntes = new Set(medalhasGanhas(s.chaves).map((m) => m.id))
        const novas = medalhasGanhas(chaves).filter((m) => !medalhasAntes.has(m.id))
        const genero = s.perfil?.avatar.genero ?? 'pai'
        set({
          xp: s.xp + xp,
          chaves,
          historico: [{ quando: new Date().toISOString(), texto, xp }, ...s.historico].slice(0, MAXIMO_HISTORICO),
          aviso: {
            id: Date.now(),
            xp,
            texto,
            ...(depois.nivel > antes.nivel ? { subiu: `${depois.emoji} ${depois.titulo[genero]}` } : {}),
            medalhas: novas.map((m) => `${m.emoji} ${m.nome}`),
          },
        })
        return true
      },
      registrarLicao: (id, acertos) => set((s) => ({ licoes: { ...s.licoes, [id]: Math.max(acertos, s.licoes[id] ?? 0) } })),
      fecharAviso: () => set({ aviso: null }),
    }),
    {
      name: 'futkids-treinador',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ perfil: s.perfil, xp: s.xp, chaves: s.chaves, licoes: s.licoes, historico: s.historico }),
    },
  ),
)

/** Atalho para as telas: pontua o treinador (fora de componentes também) */
export const pontuarTreinador = (tipo: TipoPonto, referencia: string, texto: string) => useTreinadorStore.getState().pontuar(tipo, referencia, texto)

/** Abriu a área dos pais hoje: pontua o dia e, no 3º dia da semana, a semana acompanhada */
export function registrarVisitaDosPais() {
  const hoje = hojeISO()
  pontuarTreinador('abrirPais', hoje, 'Abriu a área dos pais')
  const domingo = somarDias(hoje, -diaDaSemana(hoje))
  const diasDaSemana = useTreinadorStore.getState().chaves.filter((c) => c.startsWith('abrirPais:') && c.slice('abrirPais:'.length) >= domingo).length
  if (diasDaSemana >= 3) pontuarTreinador('semanaAcompanhada', domingo, 'Semana acompanhada de perto')
}
