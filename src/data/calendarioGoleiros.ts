// Calendário "Pré pré-temporada Goleiros" (FFutsal), transcrito do PDF com os links dos vídeos.
// São 2 calendários mensais seguidos (31 + 30 dias = 61 dias); o dia 1 é um domingo.
// Cada treino aponta para:
//  - o vídeo original do treinador (videoUrl), aberto só por um adulto; e
//  - a série animada do app que adapta aquele treino para criança (serie). Quando um vídeo virar
//    animação própria, basta criar a série nova e trocar o `serie` do treino aqui.

export interface TreinoCalendario {
  id: string
  /** Nome como está no calendário */
  nome: string
  emoji: string
  /** Vídeo original (YouTube) */
  videoUrl?: string
  /** Observação do calendário (ex.: "8 min - 2x · 30 s forte x 30 s fraco") */
  detalhe?: string
  /** Rota da versão animada/infantil no app */
  rota?: string
  /** Tipo registrado quando a criança faz o treino (marca o dia como feito) */
  atividade: string
}

export const TREINOS_CALENDARIO: TreinoCalendario[] = [
  {
    id: 'aquecimento',
    nome: 'Aquecimento',
    emoji: '🔥',
    videoUrl: 'https://youtu.be/RR1tNOGagfs',
    detalhe: 'Tem que ser feito sempre antes de cada treino',
    rota: '/treinos/aquecimento',
    atividade: 'aquecimento',
  },
  { id: 'forca-velocidade', nome: 'Força e velocidade', emoji: '⚡', videoUrl: 'https://youtu.be/lLHrOZV4iUk', rota: '/treinos/velocidade', atividade: 'velocidade' },
  {
    id: 'alongamento',
    nome: 'Alongamento',
    emoji: '🧘',
    videoUrl: 'https://youtu.be/Ux3n3L6o2GA',
    detalhe: 'Fazer pelo menos 3x na semana, separado dos treinos normais do dia',
    rota: '/treinos/alongamento',
    atividade: 'alongamento',
  },
  { id: 'hiit-1', nome: 'HIIT 1', emoji: '🐇', videoUrl: 'https://www.youtube.com/watch?v=vfY2DM3mwh4', rota: '/treinos/ritmo', atividade: 'ritmo' },
  { id: 'hiit-2', nome: 'HIIT 2', emoji: '🐇', videoUrl: 'https://youtu.be/Ih7hZRF23x4', rota: '/treinos/ritmo', atividade: 'ritmo' },
  { id: 'hiit-3', nome: 'HIIT 3', emoji: '🐇', videoUrl: 'https://youtu.be/PfS3f8yQt_s', rota: '/treinos/ritmo', atividade: 'ritmo' },
  { id: 'hiit-4', nome: 'HIIT 4', emoji: '🐇', videoUrl: 'https://youtu.be/m0annLhbPjo', rota: '/treinos/ritmo', atividade: 'ritmo' },
  {
    id: 'corrida-troca',
    nome: 'Corrida: troca de velocidade',
    emoji: '🏃',
    detalhe: '8 min - 2x · 30 s forte x 30 s fraco',
    rota: '/treinos/ritmo',
    atividade: 'ritmo',
  },
  { id: 'forca-tecnica-cruz', nome: 'Força com técnica (cruz)', emoji: '➕', videoUrl: 'https://youtu.be/2lpAGRCbDkc', rota: '/treinos/forca', atividade: 'forca' },
  {
    id: 'prevencao',
    nome: 'Prevenção',
    emoji: '🛡️',
    videoUrl: 'https://youtu.be/cqNaZVZtDk0',
    detalhe: 'Feito com atenção para evitar lesões',
    rota: '/treinos/prevencao',
    atividade: 'prevencao',
  },
  {
    // No PDF: "Lavoro prevenzione + ABS + piegamenti"
    id: 'prevencao-abs',
    nome: 'Prevenção + abdominais + flexões',
    emoji: '🛡️',
    videoUrl: 'https://www.youtube.com/watch?v=9dbCFx1ooDs',
    rota: '/treinos/prevencao',
    atividade: 'prevencao',
  },
  // Treinos do próprio app (não estão no PDF), para os pais poderem colocar na agenda
  { id: 'velocidade', nome: 'Velocidade (app)', emoji: '⚡', rota: '/treinos/velocidade', atividade: 'velocidade' },
  { id: 'ritmo', nome: 'Rápido e devagar (app)', emoji: '🐇', rota: '/treinos/ritmo', atividade: 'ritmo' },
  { id: 'forca', nome: 'Força do craque (app)', emoji: '💪', rota: '/treinos/forca', atividade: 'forca' },
  { id: 'goleiro', nome: 'Jogos de goleiro (app)', emoji: '🧤', rota: '/goleiro', atividade: 'goleiro' },
  { id: 'fundamentos', nome: 'Fundamentos do goleiro (app)', emoji: '📚', rota: '/goleiro/fundamentos', atividade: 'goleiro' },
  { id: 'rali', nome: 'Rali de gestos (app)', emoji: '⚽', rota: '/rali', atividade: 'rali' },
  { id: 'embaixadinhas', nome: 'Embaixadinhas de verdade (app)', emoji: '⚽', rota: '/rali/contador', atividade: 'rali' },
]

export function treinoPorId(id: string): TreinoCalendario | undefined {
  return TREINOS_CALENDARIO.find((t) => t.id === id)
}

/** Um item da agenda de um dia. `video` sobrescreve o vídeo padrão do treino só naquele dia. */
export interface ItemDia {
  treino: string
  video?: string
}

/** Um dia do programa. Sem itens = descanso ("riposo"). */
export interface DiaPrograma {
  itens: ItemDia[]
}

const D = (...ids: string[]): DiaPrograma => ({ itens: ids.map((treino) => ({ treino })) })
const RIPOSO: DiaPrograma = { itens: [] }

/** Os 61 dias do PDF, na ordem (calendário 1: dias 1–31; calendário 2: dias 1–30) */
export const PROGRAMA_GOLEIROS: DiaPrograma[] = [
  // Calendário 1 (o dia 1 é um domingo; a casa do dia 1 está vazia no PDF)
  RIPOSO, D('forca-velocidade'), D('alongamento'), D('hiit-1'), D('corrida-troca'), D('alongamento'), D('hiit-1'),
  RIPOSO, D('prevencao-abs'), D('hiit-2'), D('forca-velocidade'), D('corrida-troca'), D('alongamento'), D('hiit-2'),
  RIPOSO, D('hiit-3'), D('forca-velocidade'), D('forca-tecnica-cruz'), D('corrida-troca'), D('alongamento'), D('hiit-3'),
  RIPOSO, D('prevencao'), D('hiit-4'), D('alongamento'), D('hiit-4'), D('corrida-troca'), D('forca-tecnica-cruz'),
  RIPOSO, RIPOSO, D('hiit-1'),
  // Calendário 2 (o dia 1 é uma quarta, logo depois do dia 31)
  D('hiit-2'), D('alongamento'), D('hiit-3'), D('hiit-4'),
  RIPOSO, RIPOSO, D('corrida-troca'), D('hiit-4'), D('forca-tecnica-cruz'), D('alongamento'), RIPOSO,
  // Dia 13: no PDF, este "Lavoro prevenzione + ABS" aponta para o vídeo de Prevenção
  RIPOSO, { itens: [{ treino: 'prevencao-abs', video: 'https://youtu.be/cqNaZVZtDk0' }] }, D('hiit-1'), D('corrida-troca'), D('hiit-2'), D('forca-velocidade'), RIPOSO,
  RIPOSO, D('hiit-2'), D('forca-velocidade'), D('corrida-troca'), D('alongamento'), D('forca-velocidade'), RIPOSO,
  RIPOSO, D('forca-tecnica-cruz'), D('hiit-4'), D('hiit-2'), D('forca-velocidade'),
]

/** Avisos do calendário (caixa "ATENÇÃO" do PDF) */
export const OBSERVACOES_CALENDARIO = [
  { titulo: 'Aquecimento', texto: 'Tem que ser feito sempre antes de cada treino.', treino: 'aquecimento' },
  { titulo: 'Prevenção', texto: 'Feito com atenção para evitar lesões.', treino: 'prevencao' },
  { titulo: 'Alongamento', texto: 'Fazer pelo menos 3x na semana, separado dos treinos normais do dia.', treino: 'alongamento' },
]

/** Página "Academia" do PDF: só para quem tem acesso a academia, com acompanhamento */
export const ACADEMIA = {
  aviso:
    'Treinos para quem tem acesso a academia (trabalho de força). Muito importante ser acompanhado de um professor de academia ou do treinador de goleiros. Não indicado para crianças pequenas.',
  finalDoTreino: 'Após o treino de academia: 20 minutos de esteira inclinada 10 graus na velocidade 6.',
  aulas: [
    { nome: 'Bíceps + tríceps', url: 'https://youtu.be/QrPP8GA8Nfk' },
    { nome: 'Peito + costas', url: 'https://youtu.be/LgOSqtkw3ao' },
    { nome: 'Costas e panturrilha', url: 'https://youtu.be/mra85haBwiY' },
    { nome: 'Pernas', url: 'https://youtu.be/tetnd2iS9go' },
  ],
}
