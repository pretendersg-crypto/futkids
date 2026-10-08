// Os dois tipos de atividade do app, sempre com o mesmo ícone, cor e nome em todas as telas:
//  - corpo: treino FÍSICO — larga o celular (ou apoia no chão) e mexe o corpo
//  - tela:  JOGO NA TELA — joga com os dedos, olhando o celular/tablet
// Assim a criança (e o adulto) sabe na hora se é para se mexer ou para jogar.

export type TipoAtividade = 'corpo' | 'tela'

export interface InfoTipo {
  id: TipoAtividade
  emoji: string
  /** Nome no selo (curto, em maiúsculas no visual) */
  selo: string
  titulo: string
  explicacao: string
  /** Classes do selo e do bloco (fundo claro + borda forte, texto escuro) */
  corSelo: string
  corBloco: string
}

export const TIPOS: Record<TipoAtividade, InfoTipo> = {
  corpo: {
    id: 'corpo',
    emoji: '🏃',
    selo: 'Treino com o corpo',
    titulo: 'Treinar com o corpo',
    explicacao: 'Largue o celular ou apoie no chão e mexa o corpo de verdade!',
    corSelo: 'bg-orange-500 text-white',
    corBloco: 'border-orange-400 bg-orange-50',
  },
  tela: {
    id: 'tela',
    emoji: '🎮',
    selo: 'Jogo na tela',
    titulo: 'Jogar na tela',
    explicacao: 'Jogue com os dedos, olhando o celular ou o tablet.',
    corSelo: 'bg-indigo-600 text-white',
    corBloco: 'border-indigo-400 bg-indigo-50',
  },
}

/**
 * O tipo de uma atividade pelo endereço (agenda, atalhos). Treinos, fundamentos, cones, treinos de
 * fundamentos e o contador de embaixadinhas são de corpo; jogos de goleiro e Futsal Tático são na
 * tela. ?tipo=corpo|tela no endereço decide. Módulos que têm os dois (Rali, Reação, menu do Goleiro
 * sem ?tipo) não têm um tipo único.
 */
export function tipoDaRota(rota: string | undefined): TipoAtividade | undefined {
  if (!rota) return undefined
  const pedido = /[?&]tipo=(corpo|tela)\b/.exec(rota)?.[1]
  if (pedido) return pedido as TipoAtividade
  if (/^\/treinos(\/|$)/.test(rota) || /^\/goleiro\/(fundamentos|saida|treino)/.test(rota) || rota === '/rali/contador') return 'corpo'
  if (rota.startsWith('/tatica') || /^\/goleiro\/[^/]+\/[^/]+$/.test(rota)) return 'tela'
  return undefined
}
