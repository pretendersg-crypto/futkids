// Códigos de convite (aparelho da criança, outro responsável): 8 letras/números sem os que se
// confundem (0/O, 1/I/L), fáceis de ditar e digitar. Com validade curta e uso único, 31^8 (~850 bilhões)
// de combinações bastam para ninguém acertar no chute.
export const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
export const TAMANHO_CODIGO = 8

/** Versão do aviso de privacidade/termos aceita pelo responsável (muda quando o texto mudar) */
export const VERSAO_TERMOS = '2026-10-12'

export function gerarCodigo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(TAMANHO_CODIGO))
  return [...bytes].map((b) => ALFABETO[b % ALFABETO.length]).join('')
}

/** "ABCD2345" → "ABCD-2345" (só para mostrar) */
export const mostrarCodigo = (codigo: string) => `${codigo.slice(0, 4)}-${codigo.slice(4)}`

/** O que a pessoa digitou → código (maiúsculas, sem traço nem espaço) */
export function lerCodigo(texto: string): string {
  return texto
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, TAMANHO_CODIGO)
}

export const codigoCompleto = (codigo: string) => codigo.length === TAMANHO_CODIGO && [...codigo].every((c) => ALFABETO.includes(c))
