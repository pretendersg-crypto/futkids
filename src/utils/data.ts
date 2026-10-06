/** Data de hoje no fuso do aparelho, no formato AAAA-MM-DD (toISOString usaria UTC e erraria o dia à noite) */
export function hojeISO(agora = new Date()): string {
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}
