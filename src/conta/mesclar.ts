// Junção de três vias para quando o aparelho E a nuvem mudaram o mesmo dado: compara cada lado com a
// "base" (o último conteúdo igual nos dois) e fica com o que cada um mudou. Ex.: o pai mudou a
// categoria do filho e a criança comprou um item do avatar → os dois ficam. Só quando os dois mudaram
// o MESMO campo de jeitos diferentes vale o mais recente.
// Objetos são juntados campo a campo (em qualquer profundidade); listas e valores simples, inteiros.

type Json = null | boolean | number | string | Json[] | { [chave: string]: Json }

const ehObjeto = (v: unknown): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v)
const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

function juntar(base: Json | undefined, local: Json | undefined, remoto: Json | undefined, localVence: boolean): Json | undefined {
  if (igual(local, remoto)) return local
  if (igual(local, base)) return remoto // só a nuvem mudou
  if (igual(remoto, base)) return local // só o aparelho mudou
  if (ehObjeto(local) && ehObjeto(remoto)) {
    const b = ehObjeto(base) ? base : {}
    const resultado: Record<string, Json> = {}
    for (const chave of new Set([...Object.keys(local), ...Object.keys(remoto), ...Object.keys(b)])) {
      const v = juntar(b[chave], local[chave], remoto[chave], localVence)
      if (v !== undefined) resultado[chave] = v
    }
    return resultado
  }
  // Os dois mudaram o mesmo campo (ou uma lista): vale o mais recente
  return localVence ? local : remoto
}

/**
 * Junta os dois JSONs do store (formato do persist: { state, version }). Devolve null se algum lado não
 * for um objeto ou se as versões do store forem diferentes (aí vale a regra "o mais recente ganha").
 */
export function mesclarJson(base: string | undefined, local: string, remoto: string, localMaisRecente: boolean): string | null {
  try {
    const l = JSON.parse(local) as Json
    const r = JSON.parse(remoto) as Json
    const b = base ? (JSON.parse(base) as Json) : undefined
    if (!ehObjeto(l) || !ehObjeto(r)) return null
    if (l.version !== r.version) return null
    return JSON.stringify(juntar(b, l, r, localMaisRecente))
  } catch {
    return null
  }
}
