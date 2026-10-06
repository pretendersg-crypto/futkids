// Lista única dos módulos do jogo: usada pela barra de navegação inferior e pelos botões da Home.
// Para adicionar um módulo novo, inclua aqui e crie a rota correspondente em src/rotas.tsx.

export interface Modulo {
  /** Caminho da rota (ex.: "/goleiro") */
  caminho: string
  /** Emoji grande usado como ícone (a criança reconhece antes de ler) */
  emoji: string
  /** Nome completo, usado em títulos e nos botões da Home */
  titulo: string
  /** Nome curto que cabe na barra inferior */
  rotuloCurto: string
  /** Frase curta de convite exibida na Home */
  convite: string
  /** Classes Tailwind de cor do módulo (fundo claro + borda forte, texto sempre escuro) */
  cor: string
  /** false = só aparece na Home (a barra inferior já está cheia) */
  naBarra?: boolean
}

export const INICIO: Modulo = {
  caminho: '/',
  emoji: '🏠',
  titulo: 'Início',
  rotuloCurto: 'Início',
  convite: 'Vamos treinar hoje?',
  cor: 'bg-green-100 border-green-500',
}

export const MODULOS: Modulo[] = [
  {
    caminho: '/treinos',
    emoji: '💪',
    titulo: 'Treinos',
    rotuloCurto: 'Treinos',
    convite: 'Aqueça, corra e fique forte!',
    cor: 'bg-orange-100 border-orange-500',
  },
  {
    caminho: '/goleiro',
    emoji: '🧤',
    titulo: 'Treino de Goleiro',
    rotuloCurto: 'Goleiro',
    convite: 'Defenda tudo!',
    cor: 'bg-sky-100 border-sky-500',
  },
  {
    caminho: '/rali',
    emoji: '⚽',
    titulo: 'Rali de Gestos',
    rotuloCurto: 'Rali',
    convite: 'Embaixadinha, passe e chute!',
    cor: 'bg-lime-100 border-lime-600',
  },
  {
    caminho: '/alimentacao',
    emoji: '🍎',
    titulo: 'Alimentação do Craque',
    rotuloCurto: 'Comida',
    convite: 'Combustível para jogar!',
    cor: 'bg-rose-100 border-rose-500',
    naBarra: false,
  },
  {
    caminho: '/agenda',
    emoji: '📅',
    titulo: 'Agenda de Treinos',
    rotuloCurto: 'Agenda',
    convite: 'Treine todo dia!',
    cor: 'bg-violet-100 border-violet-500',
  },
  {
    caminho: '/perfil',
    emoji: '🏆',
    titulo: 'Perfil e Conquistas',
    rotuloCurto: 'Perfil',
    convite: 'Veja suas figurinhas!',
    cor: 'bg-yellow-100 border-yellow-500',
  },
]

/** Busca um módulo pelo caminho da rota (erro se o caminho não existir na lista) */
export function moduloPorCaminho(caminho: string): Modulo {
  const modulo = MODULOS.find((m) => m.caminho === caminho)
  if (!modulo) throw new Error(`Módulo não cadastrado: ${caminho}`)
  return modulo
}
