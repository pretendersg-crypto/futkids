// Falas do Bolinha, o mascote. Curtas, animadas e sem bronca: errar faz parte.
// Para adicionar falas, é só incluir nas listas (o app sorteia uma).

export const FALAS_FIM = {
  /** Resultado ótimo (3 estrelas, série completa, recorde) */
  otimo: ['Que show! 🤩', 'Você é fera! ⭐', 'Uau, que treino! 🔥', 'Tá voando! 🚀'],
  /** Resultado bom */
  bom: ['Muito bem! 👏', 'Tá ficando craque! ⚽', 'Mandou bem! 💪', 'É isso aí! 🙌'],
  /** Resultado baixo: incentivo */
  esforco: ['Errar faz parte do treino! 💪', 'Na próxima vai! Eu acredito! 🙌', 'Cada treino te deixa melhor! ⭐', 'Bora de novo? Eu torço por você! 📣'],
}

export type NivelFala = keyof typeof FALAS_FIM

export function sortearFala(lista: string[]): string {
  return lista[Math.floor(Math.random() * lista.length)]
}

/** Saudação pela hora do dia */
export function saudacao(agora = new Date()): string {
  const hora = agora.getHours()
  return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
}
