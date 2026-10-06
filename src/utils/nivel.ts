// Regras de nível: o XP total da criança vira "nível + quanto falta para o próximo".

/** XP necessário para sair do nível `n` e chegar ao `n + 1`: 100, 150, 200... (cresce devagar) */
export function xpParaPassarDoNivel(n: number): number {
  return 50 + 50 * n
}

export interface InfoNivel {
  /** Nível atual (começa em 1) */
  nivel: number
  /** XP já conquistado dentro do nível atual */
  xpNoNivel: number
  /** XP total que o nível atual pede para subir */
  xpParaProximo: number
}

export function nivelPorXP(xpTotal: number): InfoNivel {
  let nivel = 1
  let resto = Math.max(0, Math.floor(xpTotal))
  while (resto >= xpParaPassarDoNivel(nivel)) {
    resto -= xpParaPassarDoNivel(nivel)
    nivel++
  }
  return { nivel, xpNoNivel: resto, xpParaProximo: xpParaPassarDoNivel(nivel) }
}
