// Sinais do treino de reação (ideia do SwitchedOn): o celular mostra uma cor, uma seta ou um
// número e o goleiro reage com o corpo. Aqui ficam os sinais possíveis e o sorteio.

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

/** Um sinal mostrado na tela */
export type Sinal =
  | { tipo: 'cor'; cor: CorId }
  /** invertida = seta vermelha: o certo é ir para o lado contrário */
  | { tipo: 'seta'; direcao: DirecaoId; invertida: boolean }
  | { tipo: 'numero'; numero: number }

/** O que o drill pode sortear (o drill guarda isto; ver drills.ts) */
export interface ConfigSinais {
  cores: CorId[]
  setas: DirecaoId[]
  /** Seta verde (vai para onde aponta) ou vermelha (vai para o lado contrário) */
  setaVermelha: boolean
  /** Números de 1 até este (0 = sem números) */
  numeros: number
}

/** Resposta certa de um sinal, para o modo "toque" (ex.: "cor:azul", "dir:esquerda", "num:3") */
export function respostaCerta(s: Sinal): string {
  if (s.tipo === 'cor') return `cor:${s.cor}`
  if (s.tipo === 'numero') return `num:${s.numero}`
  return `dir:${s.invertida ? direcaoPorId(s.direcao).oposta : s.direcao}`
}

const chaveSinal = (s: Sinal) => (s.tipo === 'seta' ? `${respostaCerta(s)}:${s.invertida}` : respostaCerta(s))

/** Todos os sinais possíveis de um drill */
export function sinaisPossiveis(c: ConfigSinais): Sinal[] {
  const lista: Sinal[] = [
    ...c.cores.map((cor): Sinal => ({ tipo: 'cor', cor })),
    ...c.numeros > 0 ? Array.from({ length: c.numeros }, (_, i): Sinal => ({ tipo: 'numero', numero: i + 1 })) : [],
  ]
  for (const direcao of c.setas) {
    lista.push({ tipo: 'seta', direcao, invertida: false })
    if (c.setaVermelha) lista.push({ tipo: 'seta', direcao, invertida: true })
  }
  return lista
}

/**
 * Sorteia o próximo sinal. Evita repetir o mesmo sinal 3 vezes seguidas (a criança acharia que
 * travou), mas deixa repetir 2 vezes: senão ela "adivinha" que o próximo será diferente.
 */
export function sortearSinal(c: ConfigSinais, anteriores: Sinal[]): Sinal {
  const todos = sinaisPossiveis(c)
  const [a, b] = anteriores.slice(-2).map(chaveSinal)
  const opcoes = todos.length > 1 && a && a === b ? todos.filter((s) => chaveSinal(s) !== a) : todos
  return opcoes[Math.floor(Math.random() * opcoes.length)]
}

/** Texto falado em voz alta (para quando o celular está longe) */
export function textoDoSinal(s: Sinal): string {
  if (s.tipo === 'cor') return corPorId(s.cor).nome
  if (s.tipo === 'numero') return String(s.numero)
  const nome = direcaoPorId(s.direcao).nome
  return s.invertida ? `Contrário! ${nome}` : nome
}

/** Botões de resposta do modo toque: só os que o drill pode pedir */
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
  ]
}
