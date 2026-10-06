// Progresso da criança (XP, moedas, contadores de treinos, dias treinados e o que foi feito
// em cada dia), salvo só no aparelho (localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { hojeISO, somarDias } from '../utils/data'
import { nivelPorXP } from '../utils/nivel'
import { sequenciaAtual } from '../utils/sequencia'

export interface ResultadoXP {
  nivel: number
  /** true quando este ganho de XP fez a criança subir de nível (hora de comemorar!) */
  subiuDeNivel: boolean
}

export interface BonusSequencia {
  /** Dia (AAAA-MM-DD) em que o bônus foi dado */
  dia: string
  /** Dias seguidos treinando, contando com esse */
  dias: number
  xp: number
  moedas: number
}

/** Quantos dias de histórico por dia ficam guardados (a agenda só mostra a semana) */
const DIAS_DE_HISTORICO = 60

/** Bônus do 1º treino do dia quando há sequência: 2 dias = +10 XP ... 7 dias ou mais = +35 XP */
export function calcularBonusSequencia(dias: number): { xp: number; moedas: number } | null {
  if (dias < 2) return null
  return { xp: Math.min(dias, 7) * 5, moedas: 1 }
}

interface ProgressState {
  xp: number
  moedas: number
  /** Quantas vezes cada atividade foi concluída (ex.: { aquecimento: 3 }); base das conquistas */
  contadores: Record<string, number>
  /** Dias (AAAA-MM-DD) em que a criança treinou; base do streak da agenda */
  diasTreinados: string[]
  /** Atividades feitas em cada dia (ex.: { "2026-10-06": ["aquecimento", "goleiro"] }); base da agenda */
  atividadesPorDia: Record<string, string[]>
  /** Último bônus de sequência recebido (a agenda mostra quando é de hoje) */
  bonusSequencia: BonusSequencia | null
  /** Melhor resultado de cada jogo/nível (ex.: "goleiro:defesa:iniciante" → 8); a criança compete consigo mesma */
  recordes: Record<string, number>
  ganharXP: (quantidade: number) => ResultadoXP
  ganharMoedas: (quantidade: number) => void
  /** Desconta moedas; devolve false (sem descontar nada) se não houver saldo */
  gastarMoedas: (quantidade: number) => boolean
  /** Conta mais uma atividade concluída, marca hoje como dia de treino e dá o bônus de sequência */
  registrarAtividade: (tipo: string) => void
  /** Check-in de treino feito fora do app (escolinha, pelada...). Devolve false se hoje já contava. */
  fazerCheckin: () => boolean
  /** Soma uma quantidade a um contador sem marcar dia de treino (ex.: embaixadinhas feitas) */
  somarContador: (chave: string, quantidade: number) => void
  /** Guarda o resultado se for o melhor até agora; devolve true quando é recorde novo */
  registrarRecorde: (chave: string, valor: number) => boolean
}

export interface ResultadoRecompensa {
  /** Nível final e se subiu, já contando o bônus de sequência que o treino pode ter disparado */
  resultadoXP: ResultadoXP
  /** Bônus de dias seguidos ganho AGORA (primeiro treino do dia), para a tela de fim mostrar */
  bonusSequencia: BonusSequencia | null
}

/**
 * Entrega a recompensa de um treino concluído: XP, moedas e (se houver) o registro da atividade.
 * Mede o nível antes e depois de TUDO, então "Subiu de nível!" também aparece quando quem fez
 * subir foi o bônus de sequência. Chamar uma vez, no evento de fim do treino.
 */
export function entregarRecompensa(xp: number, moedas: number, atividade?: string): ResultadoRecompensa {
  const loja = useProgressStore.getState()
  const nivelAntes = nivelPorXP(loja.xp).nivel
  const bonusAntes = loja.bonusSequencia
  loja.ganharXP(xp)
  loja.ganharMoedas(moedas)
  if (atividade) loja.registrarAtividade(atividade)
  const depois = useProgressStore.getState()
  const nivel = nivelPorXP(depois.xp).nivel
  return {
    resultadoXP: { nivel, subiuDeNivel: nivel > nivelAntes },
    bonusSequencia: depois.bonusSequencia !== bonusAntes ? depois.bonusSequencia : null,
  }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      moedas: 0,
      contadores: {},
      diasTreinados: [],
      atividadesPorDia: {},
      bonusSequencia: null,
      recordes: {},
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
      registrarAtividade: (tipo) => {
        const s = get()
        const hoje = hojeISO()
        const primeiraDoDia = !s.diasTreinados.includes(hoje)
        const diasTreinados = primeiraDoDia ? [...s.diasTreinados, hoje] : s.diasTreinados
        const doDia = s.atividadesPorDia[hoje] ?? []
        // Guarda só os últimos dias, para o localStorage não crescer para sempre
        const limite = somarDias(hoje, -DIAS_DE_HISTORICO)
        const atividadesPorDia = Object.fromEntries(
          Object.entries({ ...s.atividadesPorDia, [hoje]: doDia.includes(tipo) ? doDia : [...doDia, tipo] }).filter(([dia]) => dia > limite),
        )
        set({ contadores: { ...s.contadores, [tipo]: (s.contadores[tipo] ?? 0) + 1 }, diasTreinados, atividadesPorDia })

        // Primeiro treino do dia com sequência: bônus (o dia seguido é premiado uma vez só)
        if (primeiraDoDia) {
          const dias = sequenciaAtual(diasTreinados, hoje)
          const bonus = calcularBonusSequencia(dias)
          if (bonus) {
            get().ganharXP(bonus.xp)
            get().ganharMoedas(bonus.moedas)
            set({ bonusSequencia: { dia: hoje, dias, ...bonus } })
          }
        }
      },
      fazerCheckin: () => {
        if (get().diasTreinados.includes(hojeISO())) return false
        get().registrarAtividade('checkin')
        return true
      },
      somarContador: (chave, quantidade) =>
        set((s) => ({ contadores: { ...s.contadores, [chave]: (s.contadores[chave] ?? 0) + Math.max(0, quantidade) } })),
      registrarRecorde: (chave, valor) => {
        const anterior = get().recordes[chave]
        if (anterior !== undefined && valor <= anterior) return false
        set((s) => ({ recordes: { ...s.recordes, [chave]: valor } }))
        // O primeiro resultado vira recorde, mas só é comemorado se for melhor que zero
        return anterior !== undefined || valor > 0
      },
    }),
    {
      name: 'futkids-progresso',
      // Campos novos não precisam de migração: o que faltar no salvo vem do valor inicial acima
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Só os dados vão para o localStorage, as funções não
      partialize: (s) => ({
        xp: s.xp,
        moedas: s.moedas,
        contadores: s.contadores,
        diasTreinados: s.diasTreinados,
        atividadesPorDia: s.atividadesPorDia,
        bonusSequencia: s.bonusSequencia,
        recordes: s.recordes,
      }),
    },
  ),
)
