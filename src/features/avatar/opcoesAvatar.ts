// Opções de customização do avatar. Para adicionar uma opção nova, basta incluir na lista;
// o editor mostra tudo automaticamente. Ids salvos que deixarem de existir caem na primeira opção.
// Opções com `preco` são da loja: aparecem com cadeado até a criança comprar com moedas.

export interface AvatarConfig {
  pele: string
  cabelo: string
  corCabelo: string
  uniforme: string
  /** Acessório da cabeça ("nenhum", faixa, boné...) */
  acessorio: string
}

/** Campo comum: preço em moedas (sem preço = grátis desde o início) */
interface Item {
  id: string
  nome: string
  preco?: number
}

interface OpcaoCor extends Item {
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

export type EstiloCabelo = 'curto' | 'cacheado' | 'longo' | 'rabo' | 'moicano' | 'raspado' | 'espetado' | 'coque'

export const ESTILOS_CABELO: (Item & { id: EstiloCabelo })[] = [
  { id: 'curto', nome: 'Curto' },
  { id: 'cacheado', nome: 'Cacheado' },
  { id: 'longo', nome: 'Longo' },
  { id: 'rabo', nome: 'Rabo de cavalo' },
  { id: 'moicano', nome: 'Moicano' },
  { id: 'raspado', nome: 'Raspado' },
  { id: 'espetado', nome: 'Espetado', preco: 30 },
  { id: 'coque', nome: 'Coque', preco: 25 },
]

export const CORES_CABELO: OpcaoCor[] = [
  { id: 'preto', nome: 'Preto', cor: '#1F1A17' },
  { id: 'castanho', nome: 'Castanho', cor: '#5A3825' },
  { id: 'loiro', nome: 'Loiro', cor: '#E3B23C' },
  { id: 'ruivo', nome: 'Ruivo', cor: '#B7472A' },
  { id: 'azul', nome: 'Azul', cor: '#3B82F6' },
  { id: 'rosa', nome: 'Rosa', cor: '#EC4899' },
  { id: 'verde', nome: 'Verde', cor: '#22C55E', preco: 20 },
  { id: 'roxo', nome: 'Roxo', cor: '#A855F7', preco: 20 },
  { id: 'dourado', nome: 'Dourado', cor: '#FACC15', preco: 30 },
]

export interface Uniforme extends Item {
  camisa: string
  /** Cor da gola e do número */
  detalhe: string
  /** Cor das listras verticais (sem = camisa lisa) */
  listras?: string
}

export const UNIFORMES: Uniforme[] = [
  { id: 'verde', nome: 'Verde', camisa: '#16A34A', detalhe: '#FACC15' },
  { id: 'azul', nome: 'Azul', camisa: '#2563EB', detalhe: '#FFFFFF' },
  { id: 'vermelho', nome: 'Vermelho', camisa: '#DC2626', detalhe: '#FFFFFF' },
  { id: 'amarelo', nome: 'Amarelo', camisa: '#FACC15', detalhe: '#15803D' },
  { id: 'preto', nome: 'Preto', camisa: '#1F2937', detalhe: '#F97316' },
  { id: 'roxo', nome: 'Roxo', camisa: '#7C3AED', detalhe: '#FACC15' },
  { id: 'listrado', nome: 'Listrado', camisa: '#16A34A', detalhe: '#FFFFFF', listras: '#FFFFFF', preco: 35 },
  { id: 'neon', nome: 'Goleiro neon', camisa: '#A3E635', detalhe: '#DB2777', preco: 40 },
  { id: 'dourado', nome: 'Dourado', camisa: '#EAB308', detalhe: '#111827', listras: '#FDE047', preco: 60 },
]

export type IdAcessorio = 'nenhum' | 'faixa' | 'bone' | 'oculos' | 'coroa'

export const ACESSORIOS: (Item & { id: IdAcessorio; emoji: string })[] = [
  { id: 'nenhum', nome: 'Nenhum', emoji: '🚫' },
  { id: 'faixa', nome: 'Faixa', emoji: '🎽', preco: 20 },
  { id: 'bone', nome: 'Boné', emoji: '🧢', preco: 30 },
  { id: 'oculos', nome: 'Óculos escuros', emoji: '🕶️', preco: 35 },
  { id: 'coroa', nome: 'Coroa de craque', emoji: '👑', preco: 80 },
]

export const AVATAR_PADRAO: AvatarConfig = {
  pele: 'p3',
  cabelo: 'curto',
  corCabelo: 'castanho',
  uniforme: 'verde',
  acessorio: 'nenhum',
}

/** Busca a opção pelo id; se não achar (dado antigo salvo), usa a primeira da lista */
export function buscarOpcao<T extends { id: string }>(lista: T[], id: string | undefined): T {
  return lista.find((o) => o.id === id) ?? lista[0]
}

/** Partes do avatar que têm itens (é também o prefixo da chave do item comprado) */
export type ParteAvatar = keyof AvatarConfig

/** Chave de um item da loja, ex.: "acessorio:coroa" */
export function chaveItem(parte: ParteAvatar, id: string): string {
  return `${parte}:${id}`
}
