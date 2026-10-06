// Opções de customização do avatar. Para adicionar uma opção nova, basta incluir na lista;
// o editor mostra tudo automaticamente. Ids salvos que deixarem de existir caem na primeira opção.

export interface AvatarConfig {
  pele: string
  cabelo: string
  corCabelo: string
  uniforme: string
}

interface OpcaoCor {
  id: string
  nome: string
  cor: string
}

export const PELES: OpcaoCor[] = [
  { id: 'p1', nome: 'Pele 1', cor: '#FDDBB4' },
  { id: 'p2', nome: 'Pele 2', cor: '#F1C27D' },
  { id: 'p3', nome: 'Pele 3', cor: '#E0AC69' },
  { id: 'p4', nome: 'Pele 4', cor: '#C68642' },
  { id: 'p5', nome: 'Pele 5', cor: '#8D5524' },
  { id: 'p6', nome: 'Pele 6', cor: '#5C3A1E' },
]

export type EstiloCabelo = 'curto' | 'cacheado' | 'longo' | 'rabo' | 'moicano' | 'raspado'

export const ESTILOS_CABELO: { id: EstiloCabelo; nome: string }[] = [
  { id: 'curto', nome: 'Curto' },
  { id: 'cacheado', nome: 'Cacheado' },
  { id: 'longo', nome: 'Longo' },
  { id: 'rabo', nome: 'Rabo de cavalo' },
  { id: 'moicano', nome: 'Moicano' },
  { id: 'raspado', nome: 'Raspado' },
]

export const CORES_CABELO: OpcaoCor[] = [
  { id: 'preto', nome: 'Preto', cor: '#1F1A17' },
  { id: 'castanho', nome: 'Castanho', cor: '#5A3825' },
  { id: 'loiro', nome: 'Loiro', cor: '#E3B23C' },
  { id: 'ruivo', nome: 'Ruivo', cor: '#B7472A' },
  { id: 'azul', nome: 'Azul', cor: '#3B82F6' },
  { id: 'rosa', nome: 'Rosa', cor: '#EC4899' },
]

export interface Uniforme {
  id: string
  nome: string
  camisa: string
  /** Cor da gola e do número */
  detalhe: string
}

export const UNIFORMES: Uniforme[] = [
  { id: 'verde', nome: 'Verde', camisa: '#16A34A', detalhe: '#FACC15' },
  { id: 'azul', nome: 'Azul', camisa: '#2563EB', detalhe: '#FFFFFF' },
  { id: 'vermelho', nome: 'Vermelho', camisa: '#DC2626', detalhe: '#FFFFFF' },
  { id: 'amarelo', nome: 'Amarelo', camisa: '#FACC15', detalhe: '#15803D' },
  { id: 'preto', nome: 'Preto', camisa: '#1F2937', detalhe: '#F97316' },
  { id: 'roxo', nome: 'Roxo', camisa: '#7C3AED', detalhe: '#FACC15' },
]

export const AVATAR_PADRAO: AvatarConfig = {
  pele: 'p3',
  cabelo: 'curto',
  corCabelo: 'castanho',
  uniforme: 'verde',
}

/** Busca a opção pelo id; se não achar (dado antigo salvo), usa a primeira da lista */
export function buscarOpcao<T extends { id: string }>(lista: T[], id: string): T {
  return lista.find((o) => o.id === id) ?? lista[0]
}
