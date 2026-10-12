// Área dos pais aberta na sessão: depois de trocar de filho (a página recarrega), ela continua
// aberta por 5 minutos, sem pedir o PIN de novo. Só nesta aba (sessionStorage).
const CHAVE_SESSAO = 'futkids-pais-liberado-ate'
export function liberadoNaSessao(): boolean {
  try {
    return Number(sessionStorage.getItem(CHAVE_SESSAO) ?? 0) > Date.now()
  } catch {
    return false
  }
}
export function manterPaisLiberado() {
  try {
    sessionStorage.setItem(CHAVE_SESSAO, String(Date.now() + 5 * 60_000))
  } catch {
    // sem sessionStorage: pede o PIN de novo
  }
}

