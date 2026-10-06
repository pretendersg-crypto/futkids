// As séries de treino (vindas da ideia de um calendário de pré-temporada de goleiros, adaptado
// para crianças a partir de 6 anos): aquecimento sempre antes, velocidade, "rápido e devagar"
// (o intervalado), força com o peso do corpo, prevenção de lesões e alongamento.
// Cada série usa os exercícios do módulo de mesmo nome em data/exercicios.json.

export interface SerieTreino {
  /** Módulo dos exercícios e também o tipo de atividade registrado ao terminar */
  modulo: string
  titulo: string
  emoji: string
  descricao: string
  /** Endereço da série */
  rota: string
  /** Classes de cor do cartão */
  cor: string
}

export const SERIES: SerieTreino[] = [
  {
    modulo: 'aquecimento',
    titulo: 'Aquecimento',
    emoji: '🔥',
    descricao: 'Sempre antes de treinar!',
    rota: '/treinos/aquecimento',
    cor: 'border-orange-400 bg-orange-100',
  },
  {
    modulo: 'velocidade',
    titulo: 'Velocidade',
    emoji: '⚡',
    descricao: 'Piques e passos rápidos de goleiro',
    rota: '/treinos/velocidade',
    cor: 'border-yellow-400 bg-yellow-100',
  },
  {
    modulo: 'ritmo',
    titulo: 'Rápido e devagar',
    emoji: '🐇',
    descricao: 'Corre com tudo, depois descansa',
    rota: '/treinos/ritmo',
    cor: 'border-red-300 bg-red-50',
  },
  {
    modulo: 'forca',
    titulo: 'Força do craque',
    emoji: '💪',
    descricao: 'Força com o peso do próprio corpo',
    rota: '/treinos/forca',
    cor: 'border-sky-400 bg-sky-100',
  },
  {
    modulo: 'prevencao',
    titulo: 'Prevenção',
    emoji: '🛡️',
    descricao: 'Equilíbrio e corpo firme para não se machucar',
    rota: '/treinos/prevencao',
    cor: 'border-emerald-400 bg-emerald-100',
  },
  {
    modulo: 'alongamento',
    titulo: 'Alongamento',
    emoji: '🧘',
    descricao: 'Pelo menos 3 vezes na semana',
    rota: '/treinos/alongamento',
    cor: 'border-violet-400 bg-violet-100',
  },
]

export function seriePorModulo(modulo: string | undefined): SerieTreino | undefined {
  return SERIES.find((s) => s.modulo === modulo)
}
