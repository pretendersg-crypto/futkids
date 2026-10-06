/** Data de hoje no fuso do aparelho, no formato AAAA-MM-DD (toISOString usaria UTC e erraria o dia à noite) */
export function hojeISO(agora = new Date()): string {
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

/** AAAA-MM-DD → DD/MM/AAAA */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

/** Data AAAA-MM-DD mais `dias` dias (negativo volta). Conta em UTC para não sofrer com horário de verão. */
export function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, dia) + dias * 86_400_000).toISOString().slice(0, 10)
}

/** Dia da semana de uma data AAAA-MM-DD: 0 = domingo ... 6 = sábado */
export function diaDaSemana(iso: string): number {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
}

/** Minutos desde a meia-noite de um horário "HH:MM" */
export function minutosDoHorario(horario: string): number {
  const [h, m] = horario.split(':').map(Number)
  return h * 60 + m
}
