// Gestos técnicos do goleiro usados nos circuitos de saída do gol: o desenho (pose do bonequinho
// em coordenadas de um quadro 140 x 150, chão em y = 136) e como fazer, em frases curtas.

export type GestoId = 'base' | 'saida' | 'recuo' | 'lateral' | 'encaixe' | 'rolar' | 'cruz' | 'alta'

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

export interface Gesto {
  id: GestoId
  nome: string
  /** Frase curta para o passo a passo */
  resumo: string
  comoFazer: string[]
  /** O erro mais comum, para o adulto corrigir */
  atencao: string
  pose: Pose
}

const p = (x: number, y: number): P => ({ x, y })

export const GESTOS: Record<GestoId, Gesto> = {
  base: {
    id: 'base',
    nome: 'Posição base',
    resumo: 'Pronto para defender',
    comoFazer: [
      'Pés afastados na largura dos ombros.',
      'Joelhos dobrados, peso na ponta dos pés.',
      'Tronco um pouco à frente.',
      'Mãos na frente do corpo, palmas viradas para a bola.',
    ],
    atencao: 'Calcanhar no chão e pernas esticadas deixam o goleiro lento.',
    pose: {
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
  },
  saida: {
    id: 'saida',
    nome: 'Saída rápida',
    resumo: 'Correr para a frente com passos curtos',
    comoFazer: [
      'Saia com passos curtos e rápidos.',
      'Tronco inclinado para a frente.',
      'Mãos prontas na frente do corpo, sem balançar os braços.',
      'Freie com as pernas abertas, já na posição base.',
    ],
    atencao: 'Passos longos demais: o goleiro não consegue frear nem mudar de direção.',
    pose: {
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
  },
  recuo: {
    id: 'recuo',
    nome: 'Recuo (de costas)',
    resumo: 'Voltar ao gol sem virar as costas para a bola',
    comoFazer: [
      'Volte de costas, com passos curtos.',
      'Olhos sempre na bola (para a frente).',
      'Joelhos um pouco dobrados e mãos prontas.',
    ],
    atencao: 'Virar de costas para correr: a bola pode vir e o goleiro não vê.',
    pose: {
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
  },
  lateral: {
    id: 'lateral',
    nome: 'Deslocamento lateral',
    resumo: 'Andar de lado sem cruzar as pernas',
    comoFazer: [
      'Abra um pé para o lado e traga o outro, sem cruzar.',
      'Fique sempre de frente para a bola.',
      'Corpo baixo, como na posição base.',
      'Não pule: os pés quase raspam o chão.',
    ],
    atencao: 'Cruzar as pernas: se a bola vier nessa hora, o goleiro cai.',
    pose: {
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
  },
  encaixe: {
    id: 'encaixe',
    nome: 'Encaixe da bola rasteira',
    resumo: 'Ajoelhar atrás da bola e agarrar com as duas mãos',
    comoFazer: [
      'Fique atrás da linha da bola.',
      'Um joelho desce até perto do chão, junto do outro pé: o corpo vira uma "parede".',
      'Mãos juntas embaixo, dedos apontando para o chão.',
      'Traga a bola para o peito.',
    ],
    atencao: 'Abrir as pernas: a bola passa por baixo, no meio delas.',
    pose: {
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
  },
  rolar: {
    id: 'rolar',
    nome: 'Reposição rolando',
    resumo: 'Repor a bola com a mão, rente ao chão',
    comoFazer: [
      'Dê um passo à frente com a perna do lado contrário à mão da bola.',
      'Abaixe bem, como no boliche.',
      'Solte a bola rente ao chão, na direção do companheiro.',
    ],
    atencao: 'Soltar a bola alta: ela quica e o companheiro tem dificuldade para dominar.',
    pose: {
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
  },
  cruz: {
    id: 'cruz',
    nome: 'Cruz (1 contra 1)',
    resumo: 'Fechar o chute de perto com o corpo em forma de cruz',
    comoFazer: [
      'Saia até bem perto do atacante e fique baixo.',
      'Desça um joelho ao chão.',
      'Estique a outra perna para o lado, cobrindo o canto.',
      'Abra os braços: o corpo vira uma cruz e fecha o gol.',
    ],
    atencao: 'Fazer a cruz cedo demais (longe do atacante): ele dribla ou chuta por cima.',
    pose: {
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
  },
  alta: {
    id: 'alta',
    nome: 'Bola alta (mãos em W)',
    resumo: 'Saltar e agarrar no alto, com o joelho protegendo',
    comoFazer: [
      'Corra e salte com UMA perna.',
      'Suba o outro joelho: ele protege o corpo.',
      'Mãos em W: polegares quase se tocando, atrás da bola.',
      'Agarre no ponto mais alto e traga a bola para o peito.',
    ],
    atencao: 'Saltar com as duas pernas e sem o joelho: o goleiro fica sem proteção no choque.',
    pose: {
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
  },
}

export const LISTA_GESTOS: Gesto[] = Object.values(GESTOS)
