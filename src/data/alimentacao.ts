// Conteúdo do módulo "Alimentação do Craque", para crianças a partir de 6 anos.
// Ideias gerais de alimentação de quem pratica esporte, em linguagem infantil: comida como
// combustível, as turmas dos alimentos, prato colorido, lanche antes, água, recuperação e sono.
// De propósito, NÃO entra: calorias, gramas por quilo, peso corporal, dieta nem suplementos.

export type IdTurma = 'energia' | 'construtor' | 'protetor' | 'vezEmQuando'

export interface Turma {
  id: IdTurma
  nome: string
  emoji: string
  /** O que a turma faz, em uma frase */
  funcao: string
  /** Classes de cor (fundo claro + borda) */
  cor: string
}

export const TURMAS: Turma[] = [
  { id: 'energia', nome: 'Energia', emoji: '⚡', funcao: 'Dão força para correr e pular', cor: 'border-yellow-400 bg-yellow-100' },
  { id: 'construtor', nome: 'Construtores', emoji: '💪', funcao: 'Ajudam os músculos a crescer e se recuperar', cor: 'border-rose-400 bg-rose-100' },
  { id: 'protetor', nome: 'Protetores', emoji: '🛡️', funcao: 'Ajudam o corpo a funcionar e a se defender', cor: 'border-green-500 bg-green-100' },
  { id: 'vezEmQuando', nome: 'De vez em quando', emoji: '🎈', funcao: 'Gostosos, mas só para festas e dias especiais', cor: 'border-violet-400 bg-violet-100' },
]

export interface Alimento {
  id: string
  nome: string
  emoji: string
  turma: IdTurma
}

// Só alimentos com emoji comum (aparece em celulares antigos) e turma sem dúvida
export const ALIMENTOS: Alimento[] = [
  { id: 'arroz', nome: 'Arroz', emoji: '🍚', turma: 'energia' },
  { id: 'pao', nome: 'Pão', emoji: '🍞', turma: 'energia' },
  { id: 'macarrao', nome: 'Macarrão', emoji: '🍝', turma: 'energia' },
  { id: 'batata', nome: 'Batata', emoji: '🥔', turma: 'energia' },
  { id: 'milho', nome: 'Milho', emoji: '🌽', turma: 'energia' },
  { id: 'ovo', nome: 'Ovo', emoji: '🥚', turma: 'construtor' },
  { id: 'frango', nome: 'Frango', emoji: '🍗', turma: 'construtor' },
  { id: 'peixe', nome: 'Peixe', emoji: '🐟', turma: 'construtor' },
  { id: 'carne', nome: 'Carne', emoji: '🥩', turma: 'construtor' },
  { id: 'leite', nome: 'Leite', emoji: '🥛', turma: 'construtor' },
  { id: 'queijo', nome: 'Queijo', emoji: '🧀', turma: 'construtor' },
  { id: 'brocolis', nome: 'Brócolis', emoji: '🥦', turma: 'protetor' },
  { id: 'cenoura', nome: 'Cenoura', emoji: '🥕', turma: 'protetor' },
  { id: 'tomate', nome: 'Tomate', emoji: '🍅', turma: 'protetor' },
  { id: 'alface', nome: 'Alface', emoji: '🥬', turma: 'protetor' },
  { id: 'maca', nome: 'Maçã', emoji: '🍎', turma: 'protetor' },
  { id: 'laranja', nome: 'Laranja', emoji: '🍊', turma: 'protetor' },
  { id: 'morango', nome: 'Morango', emoji: '🍓', turma: 'protetor' },
  { id: 'melancia', nome: 'Melancia', emoji: '🍉', turma: 'protetor' },
  { id: 'refrigerante', nome: 'Refrigerante', emoji: '🥤', turma: 'vezEmQuando' },
  { id: 'pirulito', nome: 'Pirulito', emoji: '🍭', turma: 'vezEmQuando' },
  { id: 'batata-frita', nome: 'Batata frita', emoji: '🍟', turma: 'vezEmQuando' },
  { id: 'rosquinha', nome: 'Rosquinha', emoji: '🍩', turma: 'vezEmQuando' },
  { id: 'chocolate', nome: 'Chocolate', emoji: '🍫', turma: 'vezEmQuando' },
  { id: 'bala', nome: 'Bala', emoji: '🍬', turma: 'vezEmQuando' },
]

export function turmaPorId(id: IdTurma): Turma {
  return TURMAS.find((t) => t.id === id)!
}

export interface Licao {
  id: string
  emoji: string
  titulo: string
  /** Frases curtas (o mascote "fala" uma de cada vez) */
  frases: string[]
}

export const LICOES: Licao[] = [
  {
    id: 'combustivel',
    emoji: '⛽',
    titulo: 'Comida é combustível',
    frases: [
      'O corpo do craque é como um carro de corrida.',
      'Para correr, pular e defender, ele precisa de combustível.',
      'E o combustível do corpo é a comida! 🍽️',
    ],
  },
  {
    id: 'turmas',
    emoji: '🍽️',
    titulo: 'As turmas dos alimentos',
    frases: [
      '⚡ Energia: arroz, pão, macarrão e batata dão força para correr.',
      '💪 Construtores: feijão, ovo, frango, peixe e leite ajudam os músculos a crescer.',
      '🛡️ Protetores: frutas, verduras e legumes ajudam o corpo a funcionar e a se defender.',
    ],
  },
  {
    id: 'prato',
    emoji: '🌈',
    titulo: 'Prato colorido',
    frases: [
      'Um prato de campeão é bem colorido!',
      'Metade do prato com verduras e legumes.',
      'O resto com um pouco de energia e um pouco de construtor. Arroz e feijão é um ótimo time! 🇧🇷',
    ],
  },
  {
    id: 'antes',
    emoji: '🍌',
    titulo: 'Antes do treino',
    frases: [
      'Não treine com a barriga vazia, nem com a barriga muito cheia.',
      'Um lanche leve um pouco antes ajuda: uma fruta ou um pão.',
      'Fritura e comida pesada logo antes deixam a barriga ruim. 🤢',
    ],
  },
  {
    id: 'agua',
    emoji: '💧',
    titulo: 'Água antes, durante e depois',
    frases: [
      'Quando você treina, o corpo perde água no suor.',
      'Beba água antes, no intervalo e depois do treino.',
      'Refrigerante não é água! A melhor bebida para o craque é a água. 💧',
    ],
  },
  {
    id: 'depois',
    emoji: '🔋',
    titulo: 'Depois do treino',
    frases: [
      'Depois de treinar, o corpo precisa recarregar a bateria.',
      'Uma refeição com energia e construtores ajuda: arroz e feijão, ou pão com leite.',
      'E não esqueça a água! 💧',
    ],
  },
  {
    id: 'vez-em-quando',
    emoji: '🎈',
    titulo: 'De vez em quando',
    frases: [
      'Doce, refrigerante, salgadinho e fritura são gostosos.',
      'Mas eles não ajudam o craque a jogar melhor.',
      'Por isso ficam para de vez em quando, como numa festa. 🎉',
    ],
  },
  {
    id: 'sono',
    emoji: '😴',
    titulo: 'Dormir também é treino',
    frases: [
      'É dormindo que o corpo cresce e se recupera do treino.',
      'Crianças precisam de 9 a 12 horas de sono por noite.',
      'Dormir bem deixa você mais rápido e mais esperto no jogo! ⚡',
    ],
  },
]

export interface PerguntaQuiz {
  pergunta: string
  /** true = é verdade */
  verdade: boolean
  explicacao: string
}

export const QUIZ: PerguntaQuiz[] = [
  { pergunta: 'Beber água no intervalo do jogo ajuda o craque.', verdade: true, explicacao: 'Isso! O corpo perde água no suor e precisa repor.' },
  { pergunta: 'Refrigerante hidrata igual à água.', verdade: false, explicacao: 'Não! Refrigerante tem muito açúcar. A melhor bebida é a água.' },
  { pergunta: 'Dormir bem ajuda a jogar melhor.', verdade: true, explicacao: 'Sim! É dormindo que o corpo cresce e se recupera.' },
  { pergunta: 'Comer um pratão de fritura logo antes do treino é bom.', verdade: false, explicacao: 'Não! Comida pesada antes do treino deixa a barriga ruim.' },
  { pergunta: 'Arroz, pão e macarrão dão energia para correr.', verdade: true, explicacao: 'Isso! Eles são da turma da energia ⚡.' },
  { pergunta: 'Frutas e verduras ajudam o corpo a se defender.', verdade: true, explicacao: 'Sim! Eles são da turma dos protetores 🛡️.' },
  { pergunta: 'Ovo, frango e feijão ajudam os músculos a crescer.', verdade: true, explicacao: 'Isso! São da turma dos construtores 💪.' },
  { pergunta: 'Doce e salgadinho podem ser comidos todo dia, toda hora.', verdade: false, explicacao: 'Não! Eles são de vez em quando, como numa festa 🎈.' },
  { pergunta: 'Só precisa beber água quando estiver com muita sede.', verdade: false, explicacao: 'Não! Beba antes, durante e depois do treino, mesmo sem muita sede.' },
  { pergunta: 'Treinar com a barriga vazia, sem comer nada o dia todo, é o melhor.', verdade: false, explicacao: 'Não! O corpo precisa de combustível. Um lanche leve antes ajuda.' },
]

/** Momentos de beber água no dia de treino */
export const MOMENTOS_AGUA = [
  { id: 'antes', nome: 'Antes do treino', emoji: '🚰' },
  { id: 'durante', nome: 'No intervalo', emoji: '⏸️' },
  { id: 'depois', nome: 'Depois do treino', emoji: '🏁' },
] as const

export type MomentoAgua = (typeof MOMENTOS_AGUA)[number]['id']
