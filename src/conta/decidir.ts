// Regra da sincronia, sem nada de rede (testável): para cada dado (uma chave do localStorage), o que
// fazer comparando o que está no aparelho, o que está na nuvem e o último ponto em que os dois eram
// iguais ("base"). Quem mudou sozinho ganha; se os dois mudaram, ganha a mudança mais recente.

export interface Remoto {
  json: string
  /** Quando foi gravado na nuvem (ms) */
  em: number
  /** Versão do formato dos dados do app que gravou (VERSAO_DADOS); sem = 1 */
  app?: number
}

/** O dado na nuvem foi gravado por um app mais novo que este? */
export const gravadoPorAppMaisNovo = (remoto: Remoto | null, versao: number) => (remoto?.app ?? 1) > versao

export interface MetaChave {
  /** Último conteúdo igual nos dois lados */
  base?: string
  /** "em" da nuvem nesse momento */
  baseEm?: number
  /** Quando o aparelho percebeu a última mudança local (ms) */
  alteradoEm?: number
}

/** juntar = os dois lados mudaram: junta campo a campo (mesclar.ts); o que der conflito, vale o mais recente */
export type Acao = 'nada' | 'enviar' | 'baixar' | 'juntar'

export function decidir(local: string | null, meta: MetaChave, remoto: Remoto | null): Acao {
  if (!remoto) return local ? 'enviar' : 'nada'
  // Nada no aparelho (perfil novo aqui ou dado apagado): o da nuvem vale
  if (local === null) return 'baixar'
  const localMudou = local !== null && local !== meta.base
  const remotoMudou = remoto.em !== meta.baseEm
  if (!remotoMudou) return localMudou ? 'enviar' : 'nada'
  if (!localMudou) return local === remoto.json ? 'nada' : 'baixar'
  // Os dois mudaram: junta o que cada um mudou
  if (local === remoto.json) return 'nada'
  return 'juntar'
}

/** Nos campos mudados pelos dois lados, o aparelho é o mais recente? (sem saber quando mudou, não) */
export const aparelhoMaisRecente = (meta: MetaChave, remoto: Remoto) => meta.alteradoEm !== undefined && meta.alteradoEm > remoto.em
