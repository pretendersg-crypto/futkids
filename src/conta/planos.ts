// Catálogo dos planos no app. O arquivo é o MESMO que o servidor usa para cobrar
// (functions/src/planos.json), então o preço mostrado é sempre o preço cobrado.
import planosJson from '../../functions/src/planos.json'

export type AlvoPlano = 'escolinha' | 'familia'
export type Periodo = 'mensal' | 'anual'
export type Forma = 'assinatura' | 'avulso'

export interface PlanoDoCatalogo {
  id: string
  nome: string
  limites: { treinadores?: number; turmas?: number; atletas?: number }
  precos: { mensal: number; anual: number } | null
  recursos: string[]
  disponivel: boolean
}

const CATALOGO = planosJson as unknown as Record<AlvoPlano, Record<string, Omit<PlanoDoCatalogo, 'id' | 'disponivel'> & { disponivel?: boolean }>>

export function planosDe(alvo: AlvoPlano): PlanoDoCatalogo[] {
  return Object.entries(CATALOGO[alvo]).map(([id, p]) => ({ ...p, id, disponivel: p.disponivel !== false }))
}

export const reais = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Quanto o anual economiza em relação a 12 meses */
export function economiaAnual(p: PlanoDoCatalogo): number {
  return p.precos ? Math.max(0, p.precos.mensal * 12 - p.precos.anual) : 0
}
