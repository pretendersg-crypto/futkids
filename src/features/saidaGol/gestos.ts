// Fundamentos e gestos técnicos do goleiro: o catálogo que vem pronto no app (os pais podem mudar
// e criar outros na área dos pais: stores/gestosStore.ts). Cada gesto tem categoria, como fazer,
// o erro mais comum, um desenho e, se os pais colocarem, vídeos reais (YouTube e/ou gravado).
// Os desenhos são poses do bonequinho num quadro de 140 x 150 (chão em y = 136).

export type CategoriaGesto = 'postura' | 'saida' | 'encaixe' | 'desvio' | 'queda' | 'um-contra-um' | 'reposicao' | 'pes' | 'comunicacao'

export const CATEGORIAS_GESTO: { id: CategoriaGesto; nome: string; emoji: string }[] = [
  { id: 'postura', nome: 'Postura e posicionamento', emoji: '🧍' },
  { id: 'saida', nome: 'Saída do gol', emoji: '🏃' },
  { id: 'encaixe', nome: 'Encaixe (agarrar)', emoji: '🤲' },
  { id: 'desvio', nome: 'Desvios', emoji: '🖐️' },
  { id: 'queda', nome: 'Quedas', emoji: '🤸' },
  { id: 'um-contra-um', nome: '1 contra 1', emoji: '✝️' },
  { id: 'reposicao', nome: 'Reposição', emoji: '🎯' },
  { id: 'pes', nome: 'Jogo com os pés', emoji: '🦶' },
  { id: 'comunicacao', nome: 'Comunicação', emoji: '🗣️' },
]

export const categoriaGestoPorId = (id: CategoriaGesto) => CATEGORIAS_GESTO.find((c) => c.id === id) ?? CATEGORIAS_GESTO[0]

export interface P {
  x: number
  y: number
}

export interface Pose {
  /** 'frente' = olhando para quem vê; 'lado' = de perfil, olhando para a direita (para a bola) */
  vista: 'frente' | 'lado'
  cabeca: P
  pescoco: P
  quadril: P
  /** [esquerdo, direito] na vista de frente; [de trás, da frente] na vista de lado */
  cotovelos: [P, P]
  maos: [P, P]
  joelhos: [P, P]
  pes: [P, P]
  bola?: P
  /** Setas de movimento (do corpo ou da bola) */
  setas?: { de: P; para: P; tracejada?: boolean; texto?: string }[]
  /** Altura do chão (mais baixo = está pulando) */
  chao?: number
}

const p = (x: number, y: number): P => ({ x, y })

/** Desenhos prontos (os pais escolhem um destes ao criar um gesto, ou usam uma imagem própria) */
const DADOS_POSES = {
  base: {
    vista: 'frente',
    cabeca: p(70, 34),
    pescoco: p(70, 48),
    quadril: p(70, 88),
    cotovelos: [p(52, 70), p(88, 70)],
    maos: [p(46, 84), p(94, 84)],
    // Joelhos para fora dos pés: dá para ver que estão dobrados
    joelhos: [p(44, 110), p(96, 110)],
    pes: [p(52, 134), p(88, 134)],
  },
  posicionamento: {
    vista: 'frente',
    cabeca: p(58, 34),
    pescoco: p(58, 48),
    quadril: p(58, 88),
    cotovelos: [p(40, 70), p(76, 70)],
    maos: [p(34, 84), p(82, 84)],
    joelhos: [p(32, 110), p(84, 110)],
    pes: [p(40, 134), p(76, 134)],
    bola: p(128, 22),
    setas: [{ de: p(120, 28), para: p(84, 56), tracejada: true, texto: 'linha da bola' }],
  },
  lateral: {
    vista: 'frente',
    cabeca: p(70, 34),
    pescoco: p(70, 48),
    quadril: p(70, 88),
    cotovelos: [p(52, 70), p(88, 70)],
    maos: [p(46, 86), p(94, 86)],
    joelhos: [p(48, 110), p(94, 110)],
    pes: [p(36, 134), p(108, 134)],
    setas: [{ de: p(96, 16), para: p(132, 16), texto: 'de lado' }],
  },
  'passo-cruzado': {
    vista: 'frente',
    cabeca: p(70, 32),
    pescoco: p(70, 46),
    quadril: p(70, 86),
    cotovelos: [p(52, 68), p(88, 68)],
    maos: [p(46, 84), p(94, 84)],
    // As pernas se cruzam abaixo dos joelhos (formam um X)
    joelhos: [p(60, 108), p(80, 108)],
    pes: [p(92, 134), p(48, 134)],
    setas: [{ de: p(96, 14), para: p(132, 14), texto: 'longe' }],
  },
  saida: {
    vista: 'lado',
    cabeca: p(86, 32),
    pescoco: p(80, 44),
    quadril: p(64, 82),
    cotovelos: [p(76, 64), p(90, 60)],
    maos: [p(90, 78), p(102, 70)],
    joelhos: [p(56, 108), p(82, 104)],
    pes: [p(42, 130), p(84, 134)],
    setas: [{ de: p(96, 14), para: p(130, 14), texto: 'para a bola' }],
  },
  recuo: {
    vista: 'lado',
    cabeca: p(78, 28),
    pescoco: p(76, 42),
    quadril: p(70, 82),
    cotovelos: [p(80, 64), p(88, 62)],
    maos: [p(92, 76), p(98, 72)],
    joelhos: [p(60, 108), p(82, 106)],
    pes: [p(52, 134), p(86, 134)],
    setas: [{ de: p(56, 14), para: p(14, 14), texto: 'de costas' }],
  },
  encaixe: {
    vista: 'lado',
    cabeca: p(82, 58),
    pescoco: p(76, 70),
    quadril: p(58, 98),
    cotovelos: [p(78, 94), p(84, 92)],
    maos: [p(92, 122), p(96, 120)],
    joelhos: [p(52, 132), p(80, 108)],
    pes: [p(32, 132), p(78, 134)],
    bola: p(106, 124),
    setas: [{ de: p(138, 126), para: p(120, 125), tracejada: true }],
  },
  'encaixe-medio': {
    vista: 'lado',
    cabeca: p(78, 32),
    pescoco: p(74, 46),
    quadril: p(64, 86),
    cotovelos: [p(76, 68), p(82, 76)],
    maos: [p(88, 72), p(90, 90)],
    joelhos: [p(58, 110), p(76, 110)],
    pes: [p(50, 134), p(80, 134)],
    bola: p(94, 81),
    setas: [{ de: p(138, 81), para: p(110, 81), tracejada: true }],
  },
  alta: {
    vista: 'frente',
    cabeca: p(70, 36),
    pescoco: p(70, 50),
    quadril: p(70, 86),
    cotovelos: [p(52, 36), p(88, 36)],
    maos: [p(60, 18), p(80, 18)],
    joelhos: [p(64, 108), p(86, 94)],
    pes: [p(62, 130), p(80, 112)],
    bola: p(70, 10),
    chao: 142,
    setas: [{ de: p(118, 136), para: p(118, 104), texto: 'salta' }],
  },
  espalmar: {
    vista: 'frente',
    cabeca: p(86, 40),
    pescoco: p(78, 52),
    quadril: p(62, 86),
    cotovelos: [p(62, 64), p(98, 40)],
    maos: [p(52, 76), p(112, 28)],
    joelhos: [p(52, 110), p(74, 108)],
    pes: [p(44, 134), p(70, 122)],
    bola: p(122, 18),
    setas: [{ de: p(126, 24), para: p(136, 44) }],
  },
  'defesa-pe': {
    vista: 'frente',
    cabeca: p(56, 38),
    pescoco: p(56, 52),
    quadril: p(58, 92),
    cotovelos: [p(38, 72), p(74, 74)],
    maos: [p(30, 90), p(82, 92)],
    joelhos: [p(46, 114), p(90, 118)],
    pes: [p(42, 134), p(118, 132)],
    bola: p(128, 126),
  },
  'queda-lateral': {
    vista: 'frente',
    // Cabeça um pouco acima dos braços (não some atrás das luvas)
    cabeca: p(94, 98),
    pescoco: p(86, 110),
    quadril: p(52, 120),
    cotovelos: [p(100, 98), p(104, 106)],
    maos: [p(116, 96), p(118, 104)],
    joelhos: [p(34, 124), p(38, 130)],
    pes: [p(18, 128), p(22, 134)],
    bola: p(127, 99),
  },
  mergulho: {
    vista: 'frente',
    cabeca: p(98, 50),
    pescoco: p(88, 58),
    quadril: p(56, 82),
    cotovelos: [p(104, 44), p(108, 52)],
    maos: [p(118, 36), p(120, 46)],
    joelhos: [p(40, 94), p(38, 86)],
    pes: [p(24, 106), p(22, 96)],
    bola: p(129, 38),
    chao: 142,
    setas: [{ de: p(30, 132), para: p(62, 112), texto: 'impulso' }],
  },
  cruz: {
    vista: 'frente',
    cabeca: p(62, 52),
    pescoco: p(62, 66),
    quadril: p(62, 104),
    cotovelos: [p(42, 82), p(82, 82)],
    maos: [p(24, 98), p(100, 100)],
    // Joelho esquerdo no chão (canela deitada) e perna direita esticada para o lado
    joelhos: [p(58, 134), p(92, 124)],
    pes: [p(38, 134), p(124, 133)],
  },
  abafa: {
    vista: 'lado',
    cabeca: p(90, 74),
    pescoco: p(82, 82),
    quadril: p(58, 100),
    cotovelos: [p(92, 98), p(88, 102)],
    maos: [p(104, 118), p(100, 122)],
    joelhos: [p(50, 132), p(76, 114)],
    pes: [p(30, 132), p(82, 134)],
    bola: p(112, 125),
    setas: [{ de: p(40, 60), para: p(84, 60), texto: 'avança' }],
  },
  estrela: {
    vista: 'frente',
    cabeca: p(70, 28),
    pescoco: p(70, 42),
    quadril: p(70, 80),
    cotovelos: [p(48, 38), p(92, 38)],
    maos: [p(28, 30), p(112, 30)],
    joelhos: [p(52, 102), p(88, 102)],
    pes: [p(36, 124), p(104, 124)],
    chao: 138,
  },
  rolar: {
    vista: 'lado',
    cabeca: p(86, 54),
    pescoco: p(78, 66),
    quadril: p(60, 94),
    cotovelos: [p(60, 74), p(86, 94)],
    maos: [p(46, 62), p(102, 120)],
    joelhos: [p(46, 116), p(84, 108)],
    pes: [p(28, 134), p(94, 134)],
    bola: p(112, 126),
    setas: [{ de: p(118, 134), para: p(138, 134), tracejada: true }],
  },
  'reposicao-alta': {
    vista: 'lado',
    cabeca: p(76, 34),
    pescoco: p(72, 46),
    quadril: p(62, 86),
    cotovelos: [p(56, 32), p(88, 58)],
    maos: [p(48, 18), p(102, 52)],
    joelhos: [p(50, 110), p(80, 104)],
    pes: [p(38, 134), p(90, 134)],
    bola: p(44, 11),
    setas: [{ de: p(62, 18), para: p(132, 18), texto: 'lança' }],
  },
  'reposicao-pe': {
    vista: 'lado',
    cabeca: p(62, 30),
    pescoco: p(60, 44),
    quadril: p(58, 84),
    cotovelos: [p(44, 62), p(76, 58)],
    maos: [p(34, 74), p(88, 66)],
    joelhos: [p(56, 110), p(80, 104)],
    pes: [p(54, 134), p(96, 120)],
    bola: p(106, 125),
    setas: [{ de: p(116, 125), para: p(138, 125), tracejada: true }],
  },
  comunicacao: {
    vista: 'frente',
    cabeca: p(64, 34),
    pescoco: p(64, 48),
    quadril: p(64, 88),
    cotovelos: [p(46, 54), p(84, 56)],
    maos: [p(50, 38), p(104, 40)],
    joelhos: [p(42, 110), p(88, 110)],
    pes: [p(48, 134), p(82, 134)],
    setas: [{ de: p(80, 24), para: p(112, 10), texto: 'fala!' }],
  },
} satisfies Record<string, Pose>

export type PoseId = keyof typeof DADOS_POSES
export const POSES: Record<PoseId, Pose> = DADOS_POSES
export const POSE_IDS = Object.keys(POSES) as PoseId[]

/** Desenho do gesto: um dos prontos ou uma imagem/GIF dos pais (id no IndexedDB) */
export type Desenho = { tipo: 'pose'; pose: PoseId } | { tipo: 'imagem'; id: string }

export interface Gesto {
  id: string
  nome: string
  categoria: CategoriaGesto
  /** Frase curta */
  resumo: string
  comoFazer: string[]
  /** O erro mais comum, para o adulto corrigir */
  atencao: string
  desenho: Desenho
  /** Vídeo real: link do YouTube ou de uma aula da Hotmart */
  video?: string
  /** Vídeo gravado no aparelho (id no IndexedDB) */
  videoLocal?: string
}

const pose = (id: PoseId): Desenho => ({ tipo: 'pose', pose: id })

/**
 * Aula do curso FFutsal "Goleiro de futsal do 0" (Hotmart Club) com o mesmo gesto. É um curso pago:
 * o link só abre para quem está logado na Hotmart e comprou o curso (o app não copia nada do vídeo).
 * Links conferidos na área de membros em 07/10/2026; os pais podem trocar ou tirar no editor do gesto.
 */
const aulaFFutsal = (id: string) => `https://hotmart.com/pt-BR/club/ffutsal/products/1563064/content/${id}`

export const GESTOS_PRONTOS: Gesto[] = [
  // ---------- Postura e posicionamento ----------
  {
    id: 'base',
    nome: 'Posição base',
    categoria: 'postura',
    resumo: 'Pronto para defender',
    comoFazer: [
      'Pés afastados na largura dos ombros.',
      'Joelhos dobrados, peso na ponta dos pés.',
      'Tronco um pouco à frente.',
      'Mãos na frente do corpo, palmas viradas para a bola.',
    ],
    atencao: 'Calcanhar no chão e pernas esticadas deixam o goleiro lento.',
    desenho: pose('base'),
  },
  {
    id: 'posicionamento',
    nome: 'Posicionamento (fechar o ângulo)',
    categoria: 'postura',
    resumo: 'Ficar na linha entre a bola e o meio do gol',
    comoFazer: [
      'Imagine uma linha da bola até o meio do seu gol.',
      'Fique em cima dessa linha.',
      'Saia um pouco à frente: os cantos ficam menores.',
      'A bola mudou de lugar? Mude junto.',
    ],
    atencao: 'Ficar sempre no meio do gol, mesmo com a bola na lateral: um canto fica todo aberto.',
    desenho: pose('posicionamento'),
    video: aulaFFutsal('2OME31QnO6'),
  },
  {
    id: 'lateral',
    nome: 'Deslocamento lateral',
    categoria: 'postura',
    resumo: 'Andar de lado sem cruzar as pernas',
    comoFazer: [
      'Abra um pé para o lado e traga o outro, sem cruzar.',
      'Fique sempre de frente para a bola.',
      'Corpo baixo, como na posição base.',
      'Não pule: os pés quase raspam o chão.',
    ],
    atencao: 'Cruzar as pernas: se a bola vier nessa hora, o goleiro cai.',
    desenho: pose('lateral'),
    video: aulaFFutsal('M7qZErRmOx'),
  },
  {
    id: 'passo-cruzado',
    nome: 'Passo cruzado',
    categoria: 'postura',
    resumo: 'Cruzar as pernas para chegar longe e rápido',
    comoFazer: [
      'Use quando a bola vai para longe e não dá tempo de andar de lado.',
      'A perna de trás cruza pela frente da outra.',
      'Tronco e olhos continuam virados para a bola.',
      'Termine em posição base.',
    ],
    atencao: 'Usar o passo cruzado perto da bola: é a hora mais fácil de levar o gol.',
    desenho: pose('passo-cruzado'),
  },
  // ---------- Saída do gol ----------
  {
    id: 'saida',
    nome: 'Saída rápida',
    categoria: 'saida',
    resumo: 'Correr para a frente com passos curtos',
    comoFazer: [
      'Saia com passos curtos e rápidos.',
      'Tronco inclinado para a frente.',
      'Mãos prontas na frente do corpo, sem balançar os braços.',
      'Freie com as pernas abertas, já na posição base.',
    ],
    atencao: 'Passos longos demais: o goleiro não consegue frear nem mudar de direção.',
    desenho: pose('saida'),
  },
  {
    id: 'recuo',
    nome: 'Recuo (de costas)',
    categoria: 'saida',
    resumo: 'Voltar ao gol sem virar as costas para a bola',
    comoFazer: ['Volte de costas, com passos curtos.', 'Olhos sempre na bola (para a frente).', 'Joelhos um pouco dobrados e mãos prontas.'],
    atencao: 'Virar de costas para correr: a bola pode vir e o goleiro não vê.',
    desenho: pose('recuo'),
  },
  // ---------- Encaixe ----------
  {
    id: 'encaixe',
    nome: 'Encaixe baixo (bola rasteira)',
    categoria: 'encaixe',
    resumo: 'Ajoelhar atrás da bola e agarrar com as duas mãos',
    comoFazer: [
      'Fique atrás da linha da bola.',
      'Um joelho desce até perto do chão, junto do outro pé: o corpo vira uma "parede".',
      'Mãos juntas embaixo, dedos apontando para o chão.',
      'Traga a bola para o peito.',
    ],
    atencao: 'Abrir as pernas: a bola passa por baixo, no meio delas.',
    desenho: pose('encaixe'),
  },
  {
    id: 'encaixe-medio',
    nome: 'Encaixe médio (barriga e peito)',
    categoria: 'encaixe',
    resumo: 'Abraçar a bola contra o corpo',
    comoFazer: [
      'Fique atrás da bola, com o corpo de frente para ela.',
      'Braços por baixo da bola, como uma "cestinha".',
      'Quando a bola bater, abrace e aperte contra a barriga ou o peito.',
      'Curve um pouco o tronco para a frente.',
    ],
    atencao: 'Tentar só com as mãos, longe do corpo: a bola escapa e sobra para o atacante.',
    desenho: pose('encaixe-medio'),
  },
  {
    id: 'alta',
    nome: 'Encaixe alto (mãos em W)',
    categoria: 'encaixe',
    resumo: 'Saltar e agarrar no alto, com o joelho protegendo',
    comoFazer: [
      'Corra e salte com UMA perna.',
      'Suba o outro joelho: ele protege o corpo.',
      'Mãos em W: polegares quase se tocando, atrás da bola.',
      'Agarre no ponto mais alto e traga a bola para o peito.',
    ],
    atencao: 'Saltar com as duas pernas e sem o joelho: o goleiro fica sem proteção no choque.',
    desenho: pose('alta'),
  },
  // ---------- Desvios ----------
  {
    id: 'espalmar',
    nome: 'Espalmar',
    categoria: 'desvio',
    resumo: 'Tirar a bola para fora quando não dá para agarrar',
    comoFazer: [
      'Use para bola forte ou longe demais para agarrar.',
      'Mão bem aberta e firme.',
      'Empurre a bola para FORA, para o lado do gol, nunca para o meio.',
      'Levante rápido: pode vir rebote.',
    ],
    atencao: 'Espalmar para o meio da área: a bola sobra na frente do atacante.',
    desenho: pose('espalmar'),
  },
  {
    id: 'defesa-pe',
    nome: 'Defesa com o pé',
    categoria: 'desvio',
    resumo: 'Fechar a bola rasteira com a perna esticada',
    comoFazer: [
      'Bola rasteira, rápida e perto do corpo: não dá tempo de abaixar.',
      'Estique a perna para o lado da bola, sola do pé virada para ela.',
      'Braços abertos para ajudar no equilíbrio e cobrir mais gol.',
    ],
    atencao: 'Chutar a bola para o meio: a defesa com o pé só bloqueia, não chuta.',
    desenho: pose('defesa-pe'),
    video: aulaFFutsal('x7WldKr2O2'),
  },
  // ---------- Quedas ----------
  {
    id: 'queda-lateral',
    nome: 'Queda lateral',
    categoria: 'queda',
    resumo: 'Cair de lado para pegar a bola baixa no canto',
    comoFazer: [
      'Comece na posição base.',
      'Dê um passo para o lado da bola e caia de lado (nunca de barriga).',
      'Mãos juntas na frente, agarrando a bola.',
      'Primeiro toca o chão a lateral da perna, depois o quadril e o ombro.',
    ],
    atencao: 'Cair de barriga ou com o braço esticado no chão: dói e pode machucar. Treine na grama ou no colchonete.',
    desenho: pose('queda-lateral'),
    video: aulaFFutsal('ROxYWzlK4D'),
  },
  {
    id: 'mergulho',
    nome: 'Mergulho',
    categoria: 'queda',
    resumo: 'Voar para pegar a bola a meia altura ou alta, no canto',
    comoFazer: [
      'Impulsione com a perna do lado da bola.',
      'Braços esticados na direção da bola, mãos juntas.',
      'Agarre (ou espalme para fora) e caia de lado, com a bola protegida.',
    ],
    atencao: 'Mergulhar sem necessidade: se dá para chegar com um passo, não pule. Só com colchonete para os pequenos.',
    desenho: pose('mergulho'),
    video: aulaFFutsal('Z722YPVL7N'),
  },
  // ---------- 1 contra 1 ----------
  {
    id: 'cruz',
    nome: 'Cruz',
    categoria: 'um-contra-um',
    resumo: 'Fechar o chute de perto com o corpo em forma de cruz',
    comoFazer: [
      'Saia até bem perto do atacante e fique baixo.',
      'Desça um joelho ao chão.',
      'Estique a outra perna para o lado, cobrindo o canto.',
      'Abra os braços: o corpo vira uma cruz e fecha o gol.',
    ],
    atencao: 'Fazer a cruz cedo demais (longe do atacante): ele dribla ou chuta por cima.',
    desenho: pose('cruz'),
    video: aulaFFutsal('64l9Xbobej'),
  },
  {
    id: 'abafa',
    nome: 'Bloqueio (abafa)',
    categoria: 'um-contra-um',
    resumo: 'Ir na bola no pé do atacante e cobri-la',
    comoFazer: [
      'Só quando a bola se afasta do pé do atacante.',
      'Avance rápido e baixo.',
      'Mãos primeiro na bola, corpo de lado atrás delas.',
      'Rosto protegido atrás dos braços.',
    ],
    atencao: 'Ir de cabeça ou de frente para o pé do atacante: perigo de levar chute. Só com a orientação de um adulto.',
    desenho: pose('abafa'),
    video: aulaFFutsal('YOm9XBvQOd'),
  },
  {
    id: 'estrela',
    nome: 'Parede (estrela)',
    categoria: 'um-contra-um',
    resumo: 'Ficar grande na frente do atacante, abrindo braços e pernas',
    comoFazer: [
      'Atacante bem perto e de frente: não dá tempo de cruz.',
      'Abra braços e pernas, como uma estrela.',
      'Fique em pé e grande, ocupando o máximo do gol.',
    ],
    atencao: 'Abrir antes da hora: ele espera e chuta por baixo das pernas.',
    desenho: pose('estrela'),
    video: aulaFFutsal('YOm9XBvQOd'),
  },
  // ---------- Reposição ----------
  {
    id: 'rolar',
    nome: 'Reposição rolando',
    categoria: 'reposicao',
    resumo: 'Repor a bola com a mão, rente ao chão',
    comoFazer: [
      'Dê um passo à frente com a perna do lado contrário à mão da bola.',
      'Abaixe bem, como no boliche.',
      'Solte a bola rente ao chão, na direção do companheiro.',
    ],
    atencao: 'Soltar a bola alta: ela quica e o companheiro tem dificuldade para dominar.',
    desenho: pose('rolar'),
    video: aulaFFutsal('R4jX3XMy7a'),
  },
  {
    id: 'reposicao-alta',
    nome: 'Reposição por cima (lançamento)',
    categoria: 'reposicao',
    resumo: 'Lançar a bola longe com a mão, por cima do ombro',
    comoFazer: [
      'Bola na mão, braço esticado para trás.',
      'Passo à frente com a perna contrária ao braço.',
      'Gire o braço por cima do ombro e solte na frente.',
      'Mire no espaço à frente do companheiro.',
    ],
    atencao: 'Lançar alto demais: a bola demora e o adversário chega antes.',
    desenho: pose('reposicao-alta'),
    video: aulaFFutsal('z7rmJzzNej'),
  },
  {
    id: 'reposicao-pe',
    nome: 'Reposição com o pé',
    categoria: 'reposicao',
    resumo: 'Bola no chão e passe com o pé',
    comoFazer: [
      'Coloque a bola no chão, na frente do corpo.',
      'Pé de apoio ao lado da bola.',
      'Passe com a parte de dentro do pé, rasteiro.',
    ],
    atencao: 'Chutão sem direção: quase sempre a bola volta para o adversário.',
    desenho: pose('reposicao-pe'),
    video: aulaFFutsal('gOpRJdzVeJ'),
  },
  // ---------- Jogo com os pés ----------
  {
    id: 'passe-pe',
    nome: 'Passe e domínio (goleiro-linha)',
    categoria: 'pes',
    resumo: 'Jogar com os pés como um jogador de linha',
    comoFazer: [
      'Domine a bola com a sola ou a parte de dentro do pé.',
      'Levante a cabeça antes de passar.',
      'Passe rasteiro e firme para o companheiro livre.',
      'Depois de passar, volte rápido para o gol.',
    ],
    atencao: 'Ficar muito tempo com a bola longe do gol: se perder, o gol fica vazio.',
    desenho: pose('reposicao-pe'),
    video: aulaFFutsal('r48nBV1v7R'),
  },
  // ---------- Comunicação ----------
  {
    id: 'comunicacao',
    nome: 'Comunicação',
    categoria: 'comunicacao',
    resumo: 'Falar e organizar a defesa',
    comoFazer: [
      'O goleiro vê a quadra inteira: avise os companheiros.',
      'Palavras curtas: "Minha!", "Sai!", "Marca o 9!", "Tempo!".',
      'Fale alto e cedo, antes da jogada acontecer.',
    ],
    atencao: 'Ficar calado: a defesa não sabe quem marca quem.',
    desenho: pose('comunicacao'),
    video: aulaFFutsal('kOXgNXoX7W'),
  },
]

export const gestoProntoPorId = (id: string) => GESTOS_PRONTOS.find((g) => g.id === id)
