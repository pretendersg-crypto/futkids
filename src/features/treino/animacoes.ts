// Movimentos do bonequinho que os pais podem escolher para um exercício (galeria na área dos pais).
// Movimento novo: keyframes em boneco.css + nome no tipo AnimacaoBoneco (data/catalogo.ts) + aqui.
import type { AnimacaoBoneco } from '../../data/catalogo'

export const ANIMACOES: { id: AnimacaoBoneco; nome: string; ritmoSugerido: number }[] = [
  { id: 'corrida', nome: 'Corrida no lugar', ritmoSugerido: 700 },
  { id: 'polichinelo', nome: 'Polichinelo', ritmoSugerido: 1400 },
  { id: 'agachamento', nome: 'Agachamento', ritmoSugerido: 2400 },
  { id: 'pontinha', nome: 'Ponta dos pés', ritmoSugerido: 1600 },
  { id: 'prancha', nome: 'Prancha', ritmoSugerido: 3000 },
  { id: 'equilibrio', nome: 'Equilíbrio num pé', ritmoSugerido: 3000 },
  { id: 'cruz', nome: 'Passos em cruz', ritmoSugerido: 2400 },
  { id: 'alongamento-lateral', nome: 'Alongamento lateral', ritmoSugerido: 4000 },
  { id: 'quadriceps', nome: 'Alongar a coxa', ritmoSugerido: 4000 },
  { id: 'braco-cruzado', nome: 'Braço cruzado', ritmoSugerido: 8000 },
  { id: 'moinho', nome: 'Moinho de vento', ritmoSugerido: 1600 },
  { id: 'encaixe', nome: 'Encaixe (goleiro)', ritmoSugerido: 2200 },
  { id: 'saida-gol', nome: 'Saída de gol', ritmoSugerido: 1800 },
  { id: 'reposicao', nome: 'Reposição com a mão', ritmoSugerido: 2400 },
]
