// Circuitos com cones para treinar a SAÍDA DO GOL do goleiro (6 a 12 anos).
// Posições em METROS, olhando da quadra para o gol: x = 0 é o meio do gol (de -10 a 10, a largura
// da quadra), y = 0 é a linha do gol e cresce para dentro da quadra (a área vai até 6 m).
// Cada passo diz de onde para onde o goleiro vai, como se mexe e qual gesto técnico usar.

export type CorCone = 'laranja' | 'amarelo' | 'azul' | 'vermelho'

export interface Cone {
  id: string
  x: number
  y: number
  cor: CorCone
  /** Para que serve o cone (aparece na lista de material) */
  papel?: string
}

/**
 * Como o goleiro se mexe no passo:
 * - parado: faz o gesto no lugar (no cone `de`)
 * - saida / recuo / lateral: vai de `de` até `para`
 * - bola: o goleiro fica e a BOLA vai até `para` (reposição)
 */
export type Movimento = 'parado' | 'saida' | 'recuo' | 'lateral' | 'bola'

export interface PassoCircuito {
  de: string
  para?: string
  movimento: Movimento
  /** Id do gesto técnico (os do app, em gestos.ts; a criança vê a versão mudada pelos pais) */
  gesto: string
  texto: string
}

export interface Circuito {
  id: string
  nome: string
  emoji: string
  nivel: 'facil' | 'medio' | 'dificil'
  objetivo: string
  /** Quantas vezes e descanso */
  repeticoes: string
  cones: Cone[]
  /** Onde a bola começa, se o circuito usa bola (o adulto rola ou lança dali) */
  bola?: { x: number; y: number; texto: string }
  passos: PassoCircuito[]
  seguranca?: string
}

/** Cor e traço de cada movimento nas setas do desenho (e na legenda) */
export const ESTILO_MOVIMENTO: Record<Exclude<Movimento, 'parado'>, { cor: string; traco?: string; nome: string }> = {
  saida: { cor: '#ea580c', nome: 'Saída (de frente)' },
  recuo: { cor: '#2563eb', traco: '5 3', nome: 'Recuo (de costas)' },
  lateral: { cor: '#9333ea', traco: '1.5 2.5', nome: 'Lateral (de lado)' },
  bola: { cor: '#111827', traco: '2 3', nome: 'Caminho da bola' },
}

export const NOME_NIVEL = { facil: '🟢 Fácil', medio: '🟡 Médio', dificil: '🔴 Difícil' }

export const CIRCUITOS: Circuito[] = [
  {
    id: 'sai-e-volta',
    nome: 'Sai e volta',
    emoji: '⬆️',
    nivel: 'facil',
    objetivo: 'Sair do gol rápido e voltar para o lugar sem perder a bola de vista.',
    repeticoes: '5 vezes · 20 s de descanso',
    cones: [
      { id: 'G', x: 0, y: 0.6, cor: 'azul', papel: 'meio do gol (começo)' },
      { id: 'A', x: 0, y: 3.5, cor: 'laranja' },
    ],
    passos: [
      { de: 'G', movimento: 'parado', gesto: 'base', texto: 'No meio do gol, fique na posição base.' },
      { de: 'G', para: 'A', movimento: 'saida', gesto: 'saida', texto: 'Saia rápido até o cone A, com passos curtos.' },
      { de: 'A', movimento: 'parado', gesto: 'base', texto: 'Freie no cone e fique na posição base, como se a bola viesse.' },
      { de: 'A', para: 'G', movimento: 'recuo', gesto: 'recuo', texto: 'Volte de costas até o meio do gol, sem virar e olhando para a frente.' },
    ],
  },
  {
    id: 'saida-em-v',
    nome: 'Saída em V',
    emoji: '✌️',
    nivel: 'facil',
    objetivo: 'Sair na diagonal, na direção da bola, para fechar o ângulo de chute.',
    repeticoes: '4 vezes cada lado · 30 s de descanso',
    cones: [
      { id: 'G', x: 0, y: 0.6, cor: 'azul', papel: 'meio do gol (começo)' },
      { id: 'A', x: -2.5, y: 3, cor: 'laranja' },
      { id: 'B', x: 2.5, y: 3, cor: 'laranja' },
    ],
    passos: [
      { de: 'G', movimento: 'parado', gesto: 'base', texto: 'Posição base no meio do gol.' },
      { de: 'G', para: 'A', movimento: 'saida', gesto: 'saida', texto: 'Saia na diagonal até o cone A, como se a bola estivesse lá.' },
      { de: 'A', movimento: 'parado', gesto: 'base', texto: 'Freie em posição base, de frente para onde estaria a bola.' },
      { de: 'A', para: 'G', movimento: 'recuo', gesto: 'recuo', texto: 'Volte de costas para o meio do gol.' },
      { de: 'G', para: 'B', movimento: 'saida', gesto: 'saida', texto: 'Agora saia na diagonal até o cone B.' },
      { de: 'B', movimento: 'parado', gesto: 'base', texto: 'Freie em posição base.' },
      { de: 'B', para: 'G', movimento: 'recuo', gesto: 'recuo', texto: 'Volte de costas para o meio do gol.' },
    ],
  },
  {
    id: 'arco-do-gol',
    nome: 'Arco na frente do gol',
    emoji: '🌈',
    nivel: 'facil',
    objetivo: 'Andar de lado no arco do gol, sempre de frente, e sair na hora certa.',
    repeticoes: '3 voltas · 30 s de descanso',
    cones: [
      { id: 'A', x: -2, y: 1.2, cor: 'amarelo' },
      { id: 'B', x: 0, y: 1.8, cor: 'amarelo' },
      { id: 'C', x: 2, y: 1.2, cor: 'amarelo' },
      { id: 'D', x: 0, y: 4, cor: 'laranja' },
    ],
    passos: [
      { de: 'A', movimento: 'parado', gesto: 'base', texto: 'Comece no cone A, em posição base, de frente para a quadra.' },
      { de: 'A', para: 'B', movimento: 'lateral', gesto: 'lateral', texto: 'Passos laterais até o cone B, sem cruzar as pernas.' },
      { de: 'B', para: 'C', movimento: 'lateral', gesto: 'lateral', texto: 'Continue de lado até o cone C.' },
      { de: 'C', para: 'B', movimento: 'lateral', gesto: 'lateral', texto: 'Volte de lado até o cone B.' },
      { de: 'B', para: 'D', movimento: 'saida', gesto: 'saida', texto: 'Saia de frente até o cone D.' },
      { de: 'D', movimento: 'parado', gesto: 'base', texto: 'Freie em posição base.' },
      { de: 'D', para: 'B', movimento: 'recuo', gesto: 'recuo', texto: 'Volte de costas até o cone B.' },
    ],
  },
  {
    id: 'sai-encaixa-repoe',
    nome: 'Sai, encaixa e repõe',
    emoji: '🤲',
    nivel: 'medio',
    objetivo: 'Sair para uma bola rasteira, agarrar com segurança e já repor para um companheiro.',
    repeticoes: '6 bolas · 20 s de descanso',
    cones: [
      { id: 'G', x: 0, y: 0.6, cor: 'azul', papel: 'meio do gol (começo)' },
      { id: 'A', x: 0, y: 3.8, cor: 'laranja', papel: 'onde agarrar a bola' },
      { id: 'R', x: 4.5, y: 6, cor: 'amarelo', papel: 'companheiro (alvo da reposição)' },
    ],
    bola: { x: 0, y: 8, texto: 'Um adulto rola a bola rasteira na direção do cone A.' },
    passos: [
      { de: 'G', movimento: 'parado', gesto: 'base', texto: 'Posição base no meio do gol. O adulto rola a bola.' },
      { de: 'G', para: 'A', movimento: 'saida', gesto: 'saida', texto: 'Saia rápido para atacar a bola antes que ela chegue ao gol.' },
      { de: 'A', movimento: 'parado', gesto: 'encaixe', texto: 'Ajoelhe atrás da bola e encaixe com as duas mãos.' },
      { de: 'A', para: 'R', movimento: 'bola', gesto: 'rolar', texto: 'Levante e role a bola com a mão até o cone amarelo R.' },
      { de: 'A', para: 'G', movimento: 'recuo', gesto: 'recuo', texto: 'Volte de costas para o gol, pronto para a próxima.' },
    ],
  },
  {
    id: 'um-contra-um-cruz',
    nome: '1 contra 1: a cruz',
    emoji: '✝️',
    nivel: 'medio',
    objetivo: 'Sair no atacante que vem sozinho, chegar perto e fechar o chute com a cruz.',
    repeticoes: '5 vezes · 30 s de descanso',
    cones: [
      { id: 'G', x: 0, y: 0.6, cor: 'azul', papel: 'meio do gol (começo)' },
      { id: 'A', x: 1.5, y: 3.6, cor: 'laranja', papel: 'onde parar' },
      { id: 'X', x: 3, y: 6.5, cor: 'vermelho', papel: 'atacante (um colega ou o adulto com a bola)' },
    ],
    passos: [
      { de: 'G', movimento: 'parado', gesto: 'base', texto: 'Posição base. O atacante (cone vermelho) vem com a bola.' },
      { de: 'G', para: 'A', movimento: 'saida', gesto: 'saida', texto: 'Saia na direção do atacante, na linha entre ele e o meio do gol.' },
      { de: 'A', movimento: 'parado', gesto: 'base', texto: 'Freie a 2 passos dele, bem baixo, pronto.' },
      { de: 'A', movimento: 'parado', gesto: 'cruz', texto: 'Quando ele for chutar, faça a CRUZ para o lado do gol que ele mira.' },
      { de: 'A', para: 'G', movimento: 'recuo', gesto: 'recuo', texto: 'Levante rápido e volte de costas para o gol.' },
    ],
    seguranca: 'Faça a cruz na grama, no colchonete ou com joelheira. O atacante chuta fraco e rasteiro.',
  },
  {
    id: 'bola-alta',
    nome: 'Saída para bola alta',
    emoji: '🙌',
    nivel: 'dificil',
    objetivo: 'Sair do gol para agarrar uma bola alta, protegido pelo joelho, e repor rápido.',
    repeticoes: '5 bolas · 30 s de descanso',
    cones: [
      { id: 'G', x: 0, y: 0.6, cor: 'azul', papel: 'meio do gol (começo)' },
      { id: 'A', x: -1.5, y: 3, cor: 'laranja', papel: 'onde a bola cai' },
      { id: 'R', x: 4.5, y: 5.5, cor: 'amarelo', papel: 'companheiro (alvo da reposição)' },
    ],
    bola: { x: -5, y: 6, texto: 'Um adulto lança a bola alta, com a mão, por cima do cone A.' },
    passos: [
      { de: 'G', movimento: 'parado', gesto: 'base', texto: 'Posição base. Olhe a bola sair da mão do adulto.' },
      { de: 'G', para: 'A', movimento: 'saida', gesto: 'saida', texto: 'Saia em direção ao cone A, onde a bola vai cair.' },
      { de: 'A', movimento: 'parado', gesto: 'alta', texto: 'Salte com uma perna, suba o joelho e agarre no alto, com as mãos em W.' },
      { de: 'A', para: 'R', movimento: 'bola', gesto: 'rolar', texto: 'Caia equilibrado e role a bola até o cone amarelo R.' },
      { de: 'A', para: 'G', movimento: 'recuo', gesto: 'recuo', texto: 'Volte de costas para o gol.' },
    ],
    seguranca: 'Bola leve no começo. Só um goleiro por vez na bola, para ninguém trombar.',
  },
  {
    id: 'circuito-completo',
    nome: 'Circuito completo da saída',
    emoji: '🏆',
    nivel: 'dificil',
    objetivo: 'Juntar tudo: andar de lado, sair, fechar com a cruz, voltar, encaixar e repor.',
    repeticoes: '3 voltas · 1 min de descanso',
    cones: [
      { id: 'A', x: -2.8, y: 1.7, cor: 'amarelo' },
      { id: 'B', x: 2.8, y: 1.7, cor: 'amarelo' },
      { id: 'C', x: 0.5, y: 3.6, cor: 'laranja', papel: 'fazer a cruz' },
      { id: 'G', x: 0, y: 0.6, cor: 'azul', papel: 'meio do gol' },
      { id: 'D', x: -2.5, y: 4, cor: 'laranja', papel: 'encaixar a bola' },
      { id: 'R', x: 4.5, y: 6, cor: 'amarelo', papel: 'alvo da reposição' },
    ],
    bola: { x: -2.5, y: 8, texto: 'Na parte do encaixe, um adulto rola a bola na direção do cone D.' },
    passos: [
      { de: 'A', movimento: 'parado', gesto: 'base', texto: 'Comece no cone A, em posição base.' },
      { de: 'A', para: 'B', movimento: 'lateral', gesto: 'lateral', texto: 'Passos laterais até o cone B.' },
      { de: 'B', para: 'C', movimento: 'saida', gesto: 'saida', texto: 'Saia até o cone C.' },
      { de: 'C', movimento: 'parado', gesto: 'cruz', texto: 'Faça a cruz.' },
      { de: 'C', para: 'G', movimento: 'recuo', gesto: 'recuo', texto: 'Levante e volte de costas até o meio do gol.' },
      { de: 'G', para: 'D', movimento: 'saida', gesto: 'saida', texto: 'Saia na diagonal até o cone D para atacar a bola rasteira.' },
      { de: 'D', movimento: 'parado', gesto: 'encaixe', texto: 'Encaixe a bola.' },
      { de: 'D', para: 'R', movimento: 'bola', gesto: 'rolar', texto: 'Role a bola até o cone amarelo R.' },
      { de: 'D', para: 'G', movimento: 'recuo', gesto: 'recuo', texto: 'Volte de costas para o meio do gol. Fim da volta!' },
    ],
    seguranca: 'Cruz na grama, no colchonete ou com joelheira.',
  },
]

export const circuitoPorId = (id: string | undefined) => CIRCUITOS.find((c) => c.id === id)

/** Onde o goleiro está depois de cada passo (o cone `para`, ou continua no `de`) */
export const ondeTermina = (passo: PassoCircuito) => (passo.movimento === 'parado' || passo.movimento === 'bola' ? passo.de : (passo.para ?? passo.de))
