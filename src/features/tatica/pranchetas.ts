// Pranchetas (lances explicados passo a passo) que vêm no app: os sistemas de jogo do futsal.
// Cada quadro diz onde os jogadores TERMINAM naquele momento (quem não aparece fica onde estava),
// com quem fica a bola e as setas do que aconteceu. Também tem a conferência das pranchetas
// criadas pelo treinador/pais.
import { azul, GOLEIRO_AZUL, GOLEIRO_VERMELHO, verm } from './puzzles/ajuda'
import type { Jogador, Ponto, Prancheta, QuadroPrancheta, SetaPrancheta, TipoSeta } from './tipos'

const p = (x: number, y: number): Ponto => ({ x, y })
const seta = (tipo: TipoSeta, de: Ponto, para: Ponto): SetaPrancheta => ({ tipo, de, para })
const GOL_DIREITA = (y = 0.5) => p(1, y)

export const PRANCHETAS_PRONTAS: Prancheta[] = [
  {
    id: 'sistema-3-1',
    titulo: 'Sistema 3-1',
    descricao: 'O sistema mais usado com crianças: um fixo, dois alas e um pivô.',
    categoria: 'sistemas',
    jogadores: [GOLEIRO_AZUL, azul(4, 0.4, 0.5), azul(7, 0.6, 0.15), azul(8, 0.6, 0.85), azul(9, 0.85, 0.5), verm(5, 0.8, 0.5), verm(7, 0.68, 0.22), verm(8, 0.68, 0.78), verm(10, 0.55, 0.5), GOLEIRO_VERMELHO],
    quadros: [
      { texto: 'No 3-1: o fixo (4) fica atrás e no meio, os dois alas (7 e 8) abertos perto das laterais e o pivô (9) lá na frente, de costas para o gol.', posicoes: {}, bola: 'a4', setas: [] },
      { texto: 'O fixo abre o jogo para um dos alas.', posicoes: {}, bola: 'a7', setas: [seta('passe', p(0.4, 0.5), p(0.6, 0.15))] },
      {
        texto: 'O ala procura o pivô. O pivô segura a bola de costas e espera os companheiros chegarem. O outro ala já corre para perto.',
        posicoes: { a8: p(0.75, 0.72) },
        bola: 'a9',
        setas: [seta('passe', p(0.6, 0.15), p(0.85, 0.5)), seta('corrida', p(0.6, 0.85), p(0.75, 0.72))],
      },
      { texto: 'O pivô toca para quem chega de frente para o gol, e o chute sai.', posicoes: {}, bola: 'gol', setas: [seta('passe', p(0.85, 0.5), p(0.75, 0.72)), seta('chute', p(0.75, 0.72), GOL_DIREITA(0.55))] },
    ],
  },
  {
    id: 'sistema-4-0',
    titulo: 'Sistema 4-0',
    descricao: 'Quatro em linha, sem pivô: quem passa, corre!',
    categoria: 'sistemas',
    jogadores: [GOLEIRO_AZUL, azul(4, 0.5, 0.15), azul(7, 0.5, 0.38), azul(8, 0.5, 0.62), azul(9, 0.5, 0.85), verm(5, 0.66, 0.2), verm(6, 0.66, 0.42), verm(7, 0.66, 0.6), verm(8, 0.66, 0.8), GOLEIRO_VERMELHO],
    quadros: [
      { texto: 'No 4-0 os quatro jogadores de linha ficam lado a lado, sem pivô parado. A bola roda de um para o outro.', posicoes: {}, bola: 'a7', setas: [seta('passe', p(0.5, 0.15), p(0.5, 0.38))] },
      {
        texto: 'Quem passa, corre! O 7 toca para o 8 e corre para as costas da defesa.',
        posicoes: { a7: p(0.8, 0.33) },
        bola: 'a8',
        setas: [seta('passe', p(0.5, 0.38), p(0.5, 0.62)), seta('corrida', p(0.5, 0.38), p(0.8, 0.33))],
      },
      { texto: 'O espaço que o 7 deixou é ocupado pelo 4: a linha continua com gente.', posicoes: { a4: p(0.5, 0.38) }, bola: 'a8', setas: [seta('corrida', p(0.5, 0.15), p(0.5, 0.38))] },
      { texto: 'O 8 lança o 7 nas costas da defesa, e o 7 finaliza.', posicoes: {}, bola: 'gol', setas: [seta('passe', p(0.5, 0.62), p(0.8, 0.33)), seta('chute', p(0.8, 0.33), GOL_DIREITA(0.45))] },
    ],
  },
  {
    id: 'sistema-2-2',
    titulo: 'Sistema 2-2',
    descricao: 'O quadrado: dois atrás, dois na frente e a bola na diagonal.',
    categoria: 'sistemas',
    jogadores: [GOLEIRO_AZUL, azul(4, 0.4, 0.3), azul(7, 0.4, 0.7), azul(8, 0.7, 0.3), azul(9, 0.7, 0.7), verm(5, 0.78, 0.33), verm(6, 0.48, 0.25), verm(7, 0.48, 0.74), verm(8, 0.8, 0.65), GOLEIRO_VERMELHO],
    quadros: [
      { texto: 'No 2-2 o time forma um quadrado: dois atrás (4 e 7) e dois na frente (8 e 9).', posicoes: {}, bola: 'a4', setas: [] },
      { texto: 'A bola roda pelos lados do quadrado, esperando um espaço.', posicoes: {}, bola: 'a7', setas: [seta('passe', p(0.4, 0.3), p(0.4, 0.7))] },
      { texto: 'O passe na diagonal (de um canto ao outro) atravessa a defesa.', posicoes: {}, bola: 'a8', setas: [seta('passe', p(0.4, 0.7), p(0.7, 0.3))] },
      {
        texto: 'Quem passou entra na área para o rebote, e o 8 chuta.',
        posicoes: { a7: p(0.78, 0.58) },
        bola: 'gol',
        setas: [seta('corrida', p(0.4, 0.7), p(0.78, 0.58)), seta('chute', p(0.7, 0.3), GOL_DIREITA(0.42))],
      },
    ],
  },
  {
    id: 'goleiro-linha',
    titulo: 'Goleiro-linha (5 contra 4)',
    descricao: 'O goleiro sobe e o time ataca com um a mais.',
    categoria: 'sistemas',
    jogadores: [
      { ...GOLEIRO_AZUL, pos: p(0.55, 0.5) },
      azul(4, 0.65, 0.15),
      azul(7, 0.65, 0.85),
      azul(8, 0.85, 0.3),
      azul(9, 0.85, 0.7),
      verm(5, 0.75, 0.5),
      verm(6, 0.72, 0.25),
      verm(7, 0.72, 0.75),
      verm(8, 0.88, 0.5),
      GOLEIRO_VERMELHO,
    ],
    quadros: [
      { texto: 'Com o goleiro-linha, o time ataca com 5 contra 4. Sempre sobra um jogador livre: é só achar ele.', posicoes: {}, bola: 'a1', setas: [] },
      { texto: 'A bola roda rápido. Quando a defesa vai para um lado, o outro lado fica livre.', posicoes: {}, bola: 'a4', setas: [seta('passe', p(0.55, 0.5), p(0.65, 0.15))] },
      { texto: 'O 4 toca para o 8, que atrai o marcador.', posicoes: {}, bola: 'a8', setas: [seta('passe', p(0.65, 0.15), p(0.85, 0.3))] },
      { texto: 'O 8 toca de primeira para o 9, livre no segundo pau: gol!', posicoes: {}, bola: 'gol', setas: [seta('passe', p(0.85, 0.3), p(0.85, 0.7)), seta('chute', p(0.85, 0.7), GOL_DIREITA(0.56))] },
      { texto: 'Cuidado: o seu gol está vazio! Por isso o passe tem que ser seguro. Perdeu a bola, todo mundo volta e o goleiro corre para o gol.', posicoes: {}, bola: null, setas: [] },
    ],
  },
]

export const pranchetaPorId = (id: string | undefined, outras: Prancheta[] = []) => [...PRANCHETAS_PRONTAS, ...outras].find((x) => x.id === id)

/** Onde cada jogador está no quadro i (os quadros só dizem quem mudou de lugar) */
export function jogadoresNoQuadro(pr: Pick<Prancheta, 'jogadores' | 'quadros'>, i: number): Jogador[] {
  const posicoes: Record<string, Ponto> = {}
  for (const q of pr.quadros.slice(0, i + 1)) Object.assign(posicoes, q.posicoes)
  return pr.jogadores.map((j) => (posicoes[j.id] ? { ...j, pos: posicoes[j.id] } : j))
}

const dentro = (q: Ponto) => q.x >= 0 && q.x <= 1 && q.y >= 0 && q.y <= 1

/** Problemas numa prancheta (lista vazia = tudo certo) */
export function conferirPrancheta(pr: Prancheta): string[] {
  const erros: string[] = []
  const ids = new Set(pr.jogadores.map((j) => j.id))
  if (!pr.titulo.trim()) erros.push('falta o título')
  if (ids.size !== pr.jogadores.length) erros.push('ids de jogador repetidos')
  if (pr.jogadores.length === 0) erros.push('coloque jogadores na quadra')
  for (const j of pr.jogadores) if (!dentro(j.pos)) erros.push(`${j.id} fora da quadra`)
  if (pr.quadros.length === 0) erros.push('sem quadros')
  pr.quadros.forEach((q: QuadroPrancheta, i) => {
    if (!q.texto.trim()) erros.push(`quadro ${i + 1}: falta o texto`)
    if (q.bola !== null && q.bola !== 'gol' && !ids.has(q.bola)) erros.push(`quadro ${i + 1}: bola com jogador inexistente`)
    for (const [id, pos] of Object.entries(q.posicoes)) {
      if (!ids.has(id)) erros.push(`quadro ${i + 1}: posição de jogador inexistente`)
      if (!dentro(pos)) erros.push(`quadro ${i + 1}: jogador fora da quadra`)
    }
    for (const s of q.setas) if (!dentro(s.de) || !dentro(s.para)) erros.push(`quadro ${i + 1}: seta fora da quadra`)
  })
  return erros
}
