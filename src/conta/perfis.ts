// Troca de filho neste aparelho, só com o localStorage: os dados do filho que sai ficam guardados numa
// cópia ("futkids-perfil:<filho>:<chave>") e os do filho que entra são postos no lugar. A sincronia
// depois traz o que houver de mais novo na nuvem. Quem chama recarrega a página em seguida.
import { CHAVES_FILHO, chaveGuardada } from './chaves'

/** Perfil com os dados que o aparelho tinha antes de entrar na conta (nada se perde) */
export const PERFIL_ANTES_DA_CONTA = 'aparelho-antes-da-conta'

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravar(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave)
    else localStorage.setItem(chave, valor)
  } catch {
    // sem espaço no aparelho: a nuvem ainda tem os dados
  }
}

/** Copia os dados de filho que estão ativos para a cópia guardada do perfil */
export function guardarPerfil(filho: string) {
  for (const chave of CHAVES_FILHO) gravar(chaveGuardada(filho, chave), ler(chave))
}

/** Põe no lugar os dados guardados do perfil (sem cópia = começa vazio, a nuvem completa) */
export function carregarPerfil(filho: string) {
  for (const chave of CHAVES_FILHO) gravar(chave, ler(chaveGuardada(filho, chave)))
}

/** Tem dados guardados deste perfil no aparelho? */
export function temPerfilGuardado(filho: string): boolean {
  return CHAVES_FILHO.some((chave) => ler(chaveGuardada(filho, chave)) !== null)
}

/** Apaga a cópia guardada de um perfil */
export function esquecerPerfil(filho: string) {
  for (const chave of CHAVES_FILHO) gravar(chaveGuardada(filho, chave), null)
}

export function trocarPerfil(de: string | null, para: string) {
  if (de) guardarPerfil(de)
  carregarPerfil(para)
}
