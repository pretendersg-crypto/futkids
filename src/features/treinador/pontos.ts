// Pontos e medalhas do Pai/Mãe Treinador. Cada ação vale XP UMA vez por "referência" (ex.: cada
// treino criado, cada dia planejado, cada lição), para não dar para ganhar repetindo a mesma coisa.
// As chaves já pontuadas ficam no treinadorStore como "tipo:referência".
import { LICOES } from './licoes'

export const PONTOS = {
  // Planejamento
  criarFundamentos: 30,
  editarFundamentos: 5,
  planejarDia: 10,
  criarTreino: 25,
  editarTreino: 10,
  criarGesto: 20,
  videoReal: 15,
  videoCalendario: 10,
  criarDrill: 15,
  // Estudo
  licao: 40,
  quizPerfeito: 10,
  // Acompanhar de perto
  abrirPais: 5,
  verProgresso: 5,
  treinoJunto: 15,
  semanaAcompanhada: 20,
} as const

export type TipoPonto = keyof typeof PONTOS

/** Como ganhar pontos (tela "Pontos" do perfil do treinador) */
export const COMO_GANHAR: { grupo: string; emoji: string; itens: { tipo: TipoPonto; texto: string }[] }[] = [
  {
    grupo: 'Planejamento',
    emoji: '📋',
    itens: [
      { tipo: 'criarFundamentos', texto: 'Criar um treino de fundamentos' },
      { tipo: 'editarFundamentos', texto: 'Ajustar um treino de fundamentos (1 vez por dia)' },
      { tipo: 'planejarDia', texto: 'Planejar um dia na agenda' },
      { tipo: 'criarTreino', texto: 'Criar um treino novo no "Treinar"' },
      { tipo: 'editarTreino', texto: 'Mudar os exercícios de um treino (1 vez por dia)' },
      { tipo: 'criarGesto', texto: 'Criar um gesto novo do goleiro' },
      { tipo: 'videoReal', texto: 'Colocar vídeo real num gesto ou exercício' },
      { tipo: 'videoCalendario', texto: 'Adicionar um vídeo de treino ao calendário' },
      { tipo: 'criarDrill', texto: 'Criar um drill de reação' },
    ],
  },
  {
    grupo: 'Estudo do treinador',
    emoji: '📚',
    itens: [
      { tipo: 'licao', texto: 'Concluir uma lição' },
      { tipo: 'quizPerfeito', texto: 'Acertar todas as perguntas do quiz' },
    ],
  },
  {
    grupo: 'Acompanhar de perto',
    emoji: '👀',
    itens: [
      { tipo: 'abrirPais', texto: 'Abrir a área dos pais (1 vez por dia)' },
      { tipo: 'verProgresso', texto: 'Ver o progresso do aluno (1 vez por dia)' },
      { tipo: 'treinoJunto', texto: '"Treinamos juntos hoje" (1 vez por dia)' },
      { tipo: 'semanaAcompanhada', texto: 'Abrir a área dos pais em 3 dias da mesma semana' },
    ],
  },
]

/** Quantas vezes cada tipo já pontuou */
export function contagens(chaves: string[]): Record<TipoPonto, number> {
  const c = Object.fromEntries(Object.keys(PONTOS).map((t) => [t, 0])) as Record<TipoPonto, number>
  for (const chave of chaves) {
    const tipo = chave.split(':')[0] as TipoPonto
    if (tipo in c) c[tipo]++
  }
  return c
}

export interface Medalha {
  id: string
  nome: string
  emoji: string
  descricao: string
  ganhou: (c: Record<TipoPonto, number>) => boolean
}

export const MEDALHAS: Medalha[] = [
  { id: 'primeiro-plano', nome: 'Primeiro plano', emoji: '📋', descricao: 'Criou o primeiro treino de fundamentos', ganhou: (c) => c.criarFundamentos >= 1 },
  { id: 'planejador', nome: 'Planejador da semana', emoji: '📅', descricao: 'Planejou 7 dias na agenda', ganhou: (c) => c.planejarDia >= 7 },
  { id: 'cinegrafista', nome: 'Cinegrafista', emoji: '🎬', descricao: 'Colocou 3 vídeos reais', ganhou: (c) => c.videoReal + c.videoCalendario >= 3 },
  { id: 'criativo', nome: 'Treinador criativo', emoji: '🎨', descricao: 'Criou 3 gestos, treinos ou drills', ganhou: (c) => c.criarGesto + c.criarTreino + c.criarDrill >= 3 },
  { id: 'estudioso', nome: 'Estudioso', emoji: '📚', descricao: 'Concluiu 3 lições', ganhou: (c) => c.licao >= 3 },
  { id: 'professor', nome: 'Formado', emoji: '🎓', descricao: 'Concluiu todas as lições', ganhou: (c) => c.licao >= LICOES.length },
  { id: 'nota-dez', nome: 'Nota 10', emoji: '💯', descricao: 'Acertou tudo em 3 quizzes', ganhou: (c) => c.quizPerfeito >= 3 },
  { id: 'presente', nome: 'Sempre presente', emoji: '👀', descricao: 'Abriu a área dos pais em 7 dias diferentes', ganhou: (c) => c.abrirPais >= 7 },
  { id: 'parceiro', nome: 'Parceiro de treino', emoji: '🤝', descricao: 'Treinou junto 5 vezes', ganhou: (c) => c.treinoJunto >= 5 },
  { id: 'olho-no-aluno', nome: 'Olho no aluno', emoji: '📈', descricao: 'Acompanhou 4 semanas', ganhou: (c) => c.semanaAcompanhada >= 4 },
]

export const medalhasGanhas = (chaves: string[]) => {
  const c = contagens(chaves)
  return MEDALHAS.filter((m) => m.ganhou(c))
}
