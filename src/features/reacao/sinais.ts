// Sinais do treino de reação (ideia do SwitchedOn): o celular mostra uma cor, uma seta, um número,
// um canto do gol, uma palavra colorida, uma toupeira ou só toca o apito, e a criança reage. Alguns
// sinais são de "NÃO reagir" (a finta e as cores distratoras): o certo é segurar.
// Aqui ficam os sinais possíveis e o sorteio.

export type CorId = 'vermelho' | 'azul' | 'verde' | 'amarelo' | 'roxo' | 'laranja'
export type DirecaoId = 'esquerda' | 'direita' | 'frente' | 'tras' | 'esq-frente' | 'dir-frente'

export interface CorSinal {
  id: CorId
  nome: string
  /** Cor da tela inteira (forte, para enxergar de longe) */
  fundo: string
  /** Cor do texto em cima do fundo (contraste) */
  texto: string
}

export const CORES: CorSinal[] = [
  { id: 'vermelho', nome: 'Vermelho', fundo: '#dc2626', texto: '#ffffff' },
  { id: 'azul', nome: 'Azul', fundo: '#2563eb', texto: '#ffffff' },
  { id: 'verde', nome: 'Verde', fundo: '#16a34a', texto: '#ffffff' },
  { id: 'amarelo', nome: 'Amarelo', fundo: '#facc15', texto: '#1f2937' },
  { id: 'roxo', nome: 'Roxo', fundo: '#7c3aed', texto: '#ffffff' },
  { id: 'laranja', nome: 'Laranja', fundo: '#ea580c', texto: '#ffffff' },
]

export interface DirecaoSinal {
  id: DirecaoId
  nome: string
  /** Rotação da seta desenhada (0 = apontando para a direita) */
  graus: number
  /** Lado contrário (seta vermelha = ir para o outro lado) */
  oposta: DirecaoId
  simbolo: string
}

// "frente" = seta para cima (em direção à tela), "trás" = seta para baixo
export const DIRECOES: DirecaoSinal[] = [
  { id: 'esquerda', nome: 'Esquerda', graus: 180, oposta: 'direita', simbolo: '⬅️' },
  { id: 'direita', nome: 'Direita', graus: 0, oposta: 'esquerda', simbolo: '➡️' },
  { id: 'frente', nome: 'Frente', graus: -90, oposta: 'tras', simbolo: '⬆️' },
  { id: 'tras', nome: 'Trás', graus: 90, oposta: 'frente', simbolo: '⬇️' },
  { id: 'esq-frente', nome: 'Esquerda alta', graus: -135, oposta: 'dir-frente', simbolo: '↖️' },
  { id: 'dir-frente', nome: 'Direita alta', graus: -45, oposta: 'esq-frente', simbolo: '↗️' },
]

export const corPorId = (id: CorId) => CORES.find((c) => c.id === id)!
export const direcaoPorId = (id: DirecaoId) => DIRECOES.find((d) => d.id === id)!

/** Partes do gol, como o goleiro vê de frente para o celular (esquerda da tela = esquerda dele) */
export type CantoId = 'alto-esq' | 'alto-meio' | 'alto-dir' | 'baixo-esq' | 'baixo-meio' | 'baixo-dir'

export interface CantoSinal {
  id: CantoId
  nome: string
  /** 0 = alto, 1 = baixo */
  linha: 0 | 1
  /** 0 = esquerda, 1 = meio, 2 = direita */
  coluna: 0 | 1 | 2
}

export const CANTOS: CantoSinal[] = [
  { id: 'alto-esq', nome: 'Alto esquerda', linha: 0, coluna: 0 },
  { id: 'alto-meio', nome: 'Alto meio', linha: 0, coluna: 1 },
  { id: 'alto-dir', nome: 'Alto direita', linha: 0, coluna: 2 },
  { id: 'baixo-esq', nome: 'Baixo esquerda', linha: 1, coluna: 0 },
  { id: 'baixo-meio', nome: 'Baixo meio', linha: 1, coluna: 1 },
  { id: 'baixo-dir', nome: 'Baixo direita', linha: 1, coluna: 2 },
]

export const cantoPorId = (id: CantoId) => CANTOS.find((c) => c.id === id)!

/** Casas do bate-toupeira (grade 3 x 3) */
export const CASAS_TOUPEIRA = 9

/** Um sinal mostrado na tela */
export type Sinal =
  /** naoVai = cor distratora: o certo é NÃO reagir */
  | { tipo: 'cor'; cor: CorId; naoVai?: boolean }
  /** invertida = seta vermelha: o certo é ir para o lado contrário */
  | { tipo: 'seta'; direcao: DirecaoId; invertida: boolean }
  | { tipo: 'numero'; numero: number }
  /** Só o apito, sem nada novo na tela */
  | { tipo: 'som' }
  /** A bola num canto do gol */
  | { tipo: 'canto'; canto: CantoId }
  /** Finta: o certo é NÃO reagir (ficar na posição base) */
  | { tipo: 'finta' }
  /** O nome de uma cor escrito com tinta de outra: vale a cor da tinta */
  | { tipo: 'palavra'; palavra: CorId; tinta: CorId }
  /** A toupeira numa casa da grade (0 a 8) */
  | { tipo: 'toupeira'; casa: number }

/** O que o drill pode sortear (o drill guarda isto; ver drills.ts). Os opcionais vieram depois. */
export interface ConfigSinais {
  cores: CorId[]
  setas: DirecaoId[]
  /** Seta verde (vai para onde aponta) ou vermelha (vai para o lado contrário) */
  setaVermelha: boolean
  /** Números de 1 até este (0 = sem números) */
  numeros: number
  /** Cantos do gol */
  cantos?: CantoId[]
  /** Apito (só som) */
  som?: boolean
  /** Às vezes vem a finta: não reagir */
  fintas?: boolean
  /** Cores que aparecem mas são para NÃO reagir (ex.: "só no verde") */
  distratores?: CorId[]
  /** As cores viram palavras pintadas de outra cor: vale a tinta */
  palavras?: boolean
  /** Bate-toupeira: a toupeira aparece numa das 9 casas */
  toupeira?: boolean
}

/** Mais ou menos 1 em cada 3 sinais é de não reagir, quando o drill tem finta ou distratores */
export const CHANCE_NAO_VAI = 0.3

/**
 * Resposta certa de um sinal, para o modo "toque" (ex.: "cor:azul", "dir:esquerda", "num:3",
 * "canto:alto-esq"). null = sinal de NÃO reagir (o certo é não tocar).
 */
export function respostaCerta(s: Sinal): string | null {
  switch (s.tipo) {
    case 'cor':
      return s.naoVai ? null : `cor:${s.cor}`
    case 'numero':
      return `num:${s.numero}`
    case 'seta':
      return `dir:${s.invertida ? direcaoPorId(s.direcao).oposta : s.direcao}`
    case 'som':
      return 'vai'
    case 'canto':
      return `canto:${s.canto}`
    case 'finta':
      return null
    case 'palavra':
      return `cor:${s.tinta}`
    case 'toupeira':
      return `casa:${s.casa}`
  }
}

/** Identifica o sinal (para não repetir 3 vezes seguidas) */
function chaveSinal(s: Sinal): string {
  if (s.tipo === 'seta') return `${respostaCerta(s)}:${s.invertida}`
  if (s.tipo === 'palavra') return `palavra:${s.palavra}:${s.tinta}`
  if (s.tipo === 'cor') return `cor:${s.cor}`
  return respostaCerta(s) ?? s.tipo
}

/** Sinais em que a criança reage */
export function sinaisDeReagir(c: ConfigSinais): Sinal[] {
  const lista: Sinal[] = []
  if (c.palavras) {
    // Palavra e tinta sempre diferentes: é aí que a cabeça precisa segurar a leitura
    for (const palavra of c.cores) for (const tinta of c.cores) if (palavra !== tinta) lista.push({ tipo: 'palavra', palavra, tinta })
  } else {
    lista.push(...c.cores.map((cor): Sinal => ({ tipo: 'cor', cor })))
  }
  if (c.numeros > 0) lista.push(...Array.from({ length: c.numeros }, (_, i): Sinal => ({ tipo: 'numero', numero: i + 1 })))
  for (const direcao of c.setas) {
    lista.push({ tipo: 'seta', direcao, invertida: false })
    if (c.setaVermelha) lista.push({ tipo: 'seta', direcao, invertida: true })
  }
  for (const canto of c.cantos ?? []) lista.push({ tipo: 'canto', canto })
  if (c.som) lista.push({ tipo: 'som' })
  if (c.toupeira) lista.push(...Array.from({ length: CASAS_TOUPEIRA }, (_, casa): Sinal => ({ tipo: 'toupeira', casa })))
  return lista
}

/** Sinais de NÃO reagir (finta e cores distratoras) */
export function sinaisDeSegurar(c: ConfigSinais): Sinal[] {
  const lista: Sinal[] = (c.distratores ?? []).map((cor) => ({ tipo: 'cor', cor, naoVai: true }))
  if (c.fintas) lista.push({ tipo: 'finta' })
  return lista
}

/** Todos os sinais possíveis de um drill */
export function sinaisPossiveis(c: ConfigSinais): Sinal[] {
  return [...sinaisDeReagir(c), ...sinaisDeSegurar(c)]
}

/**
 * Sorteia o próximo sinal. Com finta/distratores, uns 30% são de não reagir. Evita repetir o mesmo
 * sinal 3 vezes seguidas (a criança acharia que travou), mas deixa repetir 2 vezes: senão ela
 * "adivinha" que o próximo será diferente.
 */
export function sortearSinal(c: ConfigSinais, anteriores: Sinal[], sorte: () => number = Math.random): Sinal {
  const reagir = sinaisDeReagir(c)
  const segurar = sinaisDeSegurar(c)
  const todos = segurar.length > 0 && (reagir.length === 0 || sorte() < CHANCE_NAO_VAI) ? segurar : reagir
  const [a, b] = anteriores.slice(-2).map(chaveSinal)
  const opcoes = todos.length > 1 && a && a === b ? todos.filter((s) => chaveSinal(s) !== a) : todos
  return opcoes[Math.floor(sorte() * opcoes.length)]
}

/** Texto falado em voz alta (para quando o celular está longe). Vazio = não fala (o apito é o sinal). */
export function textoDoSinal(s: Sinal): string {
  switch (s.tipo) {
    case 'cor':
      return corPorId(s.cor).nome
    case 'numero':
      return String(s.numero)
    case 'seta': {
      const nome = direcaoPorId(s.direcao).nome
      return s.invertida ? `Contrário! ${nome}` : nome
    }
    case 'canto':
      return cantoPorId(s.canto).nome
    case 'finta':
      return 'Finta!'
    case 'som':
    case 'palavra':
    case 'toupeira':
      return ''
  }
}

/** Respostas que ficam numa grade desenhada no lugar do sinal (gol ou toupeira), no modo toque */
export const temGrade = (c: ConfigSinais) => Boolean(c.toupeira || (c.cantos?.length ?? 0) > 0)

/** Botões de resposta do modo toque: só os que o drill pode pedir (os da grade ficam de fora) */
export function botoesDeResposta(c: ConfigSinais): { id: string; rotulo: string; cor?: CorSinal }[] {
  const direcoes = new Set<DirecaoId>()
  for (const d of c.setas) {
    direcoes.add(d)
    if (c.setaVermelha) direcoes.add(direcaoPorId(d).oposta)
  }
  return [
    ...c.cores.map((id) => ({ id: `cor:${id}`, rotulo: corPorId(id).nome, cor: corPorId(id) })),
    ...DIRECOES.filter((d) => direcoes.has(d.id)).map((d) => ({ id: `dir:${d.id}`, rotulo: d.simbolo })),
    ...Array.from({ length: c.numeros }, (_, i) => ({ id: `num:${i + 1}`, rotulo: String(i + 1) })),
    ...(c.som ? [{ id: 'vai', rotulo: '👆 AGORA!' }] : []),
  ]
}
