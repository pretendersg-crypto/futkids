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

export type Acao = 'nada' | 'enviar' | 'baixar'

export function decidir(local: string | null, meta: MetaChave, remoto: Remoto | null): Acao {
  if (!remoto) return local ? 'enviar' : 'nada'
  // Nada no aparelho (perfil novo aqui ou dado apagado): o da nuvem vale
  if (local === null) return 'baixar'
  const localMudou = local !== null && local !== meta.base
  const remotoMudou = remoto.em !== meta.baseEm
  if (!remotoMudou) return localMudou ? 'enviar' : 'nada'
  if (!localMudou) return local === remoto.json ? 'nada' : 'baixar'
  // Os dois mudaram: o mais recente ganha (sem saber quando o local mudou, a nuvem ganha)
  if (local === remoto.json) return 'nada'
  return meta.alteradoEm !== undefined && meta.alteradoEm > remoto.em ? 'enviar' : 'baixar'
}
