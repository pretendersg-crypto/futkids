// Store de cada chave sincronizada, para recarregar a tela quando chega um dado novo da nuvem
// (ex.: o pai mudou o plano no celular dele e o tablet da criança atualiza sozinho).
import { useAchievementsStore } from '../stores/achievementsStore'
import { useAgendaStore } from '../stores/agendaStore'
import { useAlimentacaoStore } from '../stores/alimentacaoStore'
import { useGestosConcluidosStore } from '../stores/gestosConcluidosStore'
import { useGestosStore } from '../stores/gestosStore'
import { usePaisStore } from '../stores/paisStore'
import { useProgramaStore } from '../stores/programaStore'
import { useProgressStore } from '../stores/progressStore'
import { useReacaoStore } from '../stores/reacaoStore'
import { useTaticaCriadaStore } from '../stores/taticaCriadaStore'
import { useTaticaStore } from '../stores/taticaStore'
import { useTreinadorStore } from '../stores/treinadorStore'
import { useTreinosFundamentosStore } from '../stores/treinosFundamentosStore'
import { useTreinosStore } from '../stores/treinosStore'
import { useUserStore } from '../stores/userStore'
import type { ChaveSincronizada } from './chaves'

interface ComPersist {
  persist: { rehydrate: () => Promise<void> | void }
  /** Avisa quando o store muda (a sincronia envia logo em seguida) */
  subscribe: (ouvinte: () => void) => () => void
}

export const STORES: Record<ChaveSincronizada, ComPersist> = {
  'futkids-pais': usePaisStore,
  'futkids-treinos': useTreinosStore,
  'futkids-gestos': useGestosStore,
  'futkids-treinos-fundamentos': useTreinosFundamentosStore,
  'futkids-treinador': useTreinadorStore,
  'futkids-tatica-criada': useTaticaCriadaStore,
  'futkids-jogador': useUserStore,
  'futkids-progresso': useProgressStore,
  'futkids-conquistas': useAchievementsStore,
  'futkids-agenda': useAgendaStore,
  'futkids-alimentacao': useAlimentacaoStore,
  'futkids-programa': useProgramaStore,
  'futkids-reacao': useReacaoStore,
  'futkids-tatica': useTaticaStore,
  'futkids-gestos-concluidos': useGestosConcluidosStore,
}

/** Lê de novo do localStorage o store de uma chave (depois de gravar o que veio da nuvem) */
export async function recarregarStore(chave: ChaveSincronizada): Promise<void> {
  await STORES[chave].persist.rehydrate()
}
