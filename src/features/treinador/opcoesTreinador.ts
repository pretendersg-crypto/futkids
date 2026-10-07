// Avatar do Pai/Mãe Treinador: opções de aparência e os itens que vão sendo desbloqueados com o
// nível de treinador (gamificação do adulto: planejar, estudar e acompanhar dão pontos).
import { CORES_CABELO, PELES } from '../avatar/opcoesAvatar'

export type Genero = 'pai' | 'mae'
export type CabeloAdulto = 'curto' | 'raspado' | 'careca' | 'ondulado' | 'cacheado' | 'longo' | 'rabo' | 'coque'
export type Barba = 'nenhuma' | 'bigode' | 'cavanhaque' | 'cheia'
export type IdItem = 'apito' | 'prancheta' | 'bone' | 'medalha' | 'trofeu' | 'estrela'

export interface AvatarTreinadorConfig {
  genero: Genero
  pele: string
  cabelo: CabeloAdulto
  corCabelo: string
  barba: Barba
  oculos: boolean
  brincos: boolean
  agasalho: string
  /** Itens desbloqueados que o adulto escolheu mostrar */
  usar: IdItem[]
}

export const PELES_TREINADOR = PELES
export const CORES_CABELO_TREINADOR = [...CORES_CABELO.filter((c) => !c.preco), { id: 'grisalho', nome: 'Grisalho', cor: '#9CA3AF' }]

export const CABELOS_ADULTO: { id: CabeloAdulto; nome: string }[] = [
  { id: 'curto', nome: 'Curto' },
  { id: 'raspado', nome: 'Raspado' },
  { id: 'careca', nome: 'Careca' },
  { id: 'ondulado', nome: 'Ondulado' },
  { id: 'cacheado', nome: 'Cacheado' },
  { id: 'longo', nome: 'Longo' },
  { id: 'rabo', nome: 'Rabo de cavalo' },
  { id: 'coque', nome: 'Coque' },
]

export const BARBAS: { id: Barba; nome: string }[] = [
  { id: 'nenhuma', nome: 'Sem barba' },
  { id: 'bigode', nome: 'Bigode' },
  { id: 'cavanhaque', nome: 'Cavanhaque' },
  { id: 'cheia', nome: 'Barba cheia' },
]

/** Cor do agasalho; `nivel` = a partir de qual nível de treinador ele é liberado */
export const AGASALHOS: { id: string; nome: string; cor: string; nivel: number }[] = [
  { id: 'verde', nome: 'Verde', cor: '#15803d', nivel: 1 },
  { id: 'azul', nome: 'Azul', cor: '#1d4ed8', nivel: 1 },
  { id: 'vermelho', nome: 'Vermelho', cor: '#b91c1c', nivel: 1 },
  { id: 'preto', nome: 'Preto', cor: '#1f2937', nivel: 1 },
  { id: 'roxo', nome: 'Roxo', cor: '#7c3aed', nivel: 1 },
  { id: 'laranja', nome: 'Laranja', cor: '#ea580c', nivel: 1 },
  { id: 'dourado', nome: 'Dourado (nível 5)', cor: '#c9971c', nivel: 5 },
]

/** Itens do avatar: cada nível de treinador libera um */
export const ITENS: { id: IdItem; nome: string; emoji: string; nivel: number }[] = [
  { id: 'apito', nome: 'Apito', emoji: '📯', nivel: 1 },
  { id: 'prancheta', nome: 'Prancheta', emoji: '📋', nivel: 2 },
  { id: 'bone', nome: 'Boné', emoji: '🧢', nivel: 3 },
  { id: 'medalha', nome: 'Medalha', emoji: '🏅', nivel: 4 },
  { id: 'trofeu', nome: 'Troféu', emoji: '🏆', nivel: 6 },
  { id: 'estrela', nome: 'Estrela de Mestre', emoji: '🌟', nivel: 7 },
]

export const AVATAR_PADRAO: Record<Genero, AvatarTreinadorConfig> = {
  pai: { genero: 'pai', pele: 'p3', cabelo: 'curto', corCabelo: 'castanho', barba: 'nenhuma', oculos: false, brincos: false, agasalho: 'verde', usar: ['apito'] },
  mae: { genero: 'mae', pele: 'p3', cabelo: 'longo', corCabelo: 'castanho', barba: 'nenhuma', oculos: false, brincos: true, agasalho: 'verde', usar: ['apito'] },
}

export const corDe = <T extends { id: string; cor: string }>(lista: T[], id: string) => (lista.find((x) => x.id === id) ?? lista[0]).cor

/** O avatar como ele aparece no nível atual: itens e agasalho ainda não liberados ficam de fora */
export function avatarDoNivel(config: AvatarTreinadorConfig, nivel: number): AvatarTreinadorConfig {
  const agasalho = AGASALHOS.find((g) => g.id === config.agasalho)
  return {
    ...config,
    usar: config.usar.filter((id) => (ITENS.find((i) => i.id === id)?.nivel ?? 99) <= nivel),
    agasalho: agasalho && agasalho.nivel <= nivel ? config.agasalho : AGASALHOS[0].id,
  }
}
