// Desafios do Rali de Gestos.
//  - "tela": jogados no celular (inclinando ou arrastando o dedo)
//  - "bola": com bola de verdade e o celular parado no chão
//  - "corpo": celular preso ao corpo contando o movimento; só com um adulto liberando

export type DesafioId = 'embaixadinha' | 'conducao' | 'passe-chute' | 'contador' | 'saltos'

export interface Desafio {
  id: DesafioId
  tipo: 'tela' | 'bola' | 'corpo'
  nome: string
  emoji: string
  descricao: string
  comoJogar: string[]
  /** Pode ser jogado inclinando o celular (senão é só toque) */
  usaInclinacao: boolean
}

export const DESAFIOS: Desafio[] = [
  {
    id: 'embaixadinha',
    tipo: 'tela',
    nome: 'Embaixadinha',
    emoji: '👟',
    descricao: 'Não deixe a bola cair!',
    comoJogar: ['Coloque a chuteira embaixo da bola', 'Cada toque vale ponto', 'Toques seguidos aumentam o combo 🔥'],
    usaInclinacao: true,
  },
  {
    id: 'conducao',
    tipo: 'tela',
    nome: 'Condução',
    emoji: '🚧',
    descricao: 'Leve a bola entre os cones',
    comoJogar: ['A bola corre sozinha para a frente', 'Passe pelo meio dos cones', 'Fica mais rápido com o tempo!'],
    usaInclinacao: true,
  },
  {
    id: 'passe-chute',
    tipo: 'tela',
    nome: 'Passe e chute',
    emoji: '🎯',
    descricao: 'Deslize o dedo para passar e chutar',
    comoJogar: ['Veja quem está brilhando ✨', 'Deslize o dedo da bola até ele', 'No chute, mire longe do goleiro!'],
    usaInclinacao: false,
  },
  {
    id: 'contador',
    tipo: 'bola',
    nome: 'Embaixadinhas de verdade',
    emoji: '⚽',
    descricao: 'Conte suas embaixadinhas com bola',
    comoJogar: ['Deixe o celular no chão, longe da bola', 'Toque +1 a cada embaixadinha', 'A bola caiu? Toque em "Caiu" e recomece a sequência'],
    usaInclinacao: false,
  },
  {
    id: 'saltos',
    tipo: 'corpo',
    nome: 'Saltos de goleiro',
    emoji: '🦘',
    descricao: 'O celular conta seus pulos',
    comoJogar: ['Celular no bolso com zíper ou na braçadeira', 'Pule o máximo que conseguir em 30 segundos', 'Cada pulo faz um bip'],
    usaInclinacao: false,
  },
]

export function desafioPorId(id: string | undefined): Desafio | undefined {
  return DESAFIOS.find((d) => d.id === id)
}
