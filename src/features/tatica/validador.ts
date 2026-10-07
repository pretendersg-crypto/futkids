// Regras do puzzle: quem pode agir, quais jogadas existem, se a jogada escolhida é a certa e
// como ficam os jogadores e a bola depois dela. Funções puras (testadas em validador.test.ts).
import type { Alvo, Jogador, Opcao, Passo, Ponto, Puzzle } from './tipos'

/** Centro do gol adversário (o azul ataca para a direita) */
export const GOL_ADVERSARIO: Ponto = { x: 1, y: 0.5 }

/** Jogadores azuis que têm alguma jogada neste passo (ficam brilhando na quadra) */
export function jogadoresQueAgem(passo: Passo): string[] {
  return [...new Set(passo.opcoes.map((o) => o.jogador))]
}

/** As jogadas de um jogador neste passo */
export function opcoesDoJogador(passo: Passo, jogador: string): Opcao[] {
  return passo.opcoes.filter((o) => o.jogador === jogador)
}

const mesmoAlvo = (a: Alvo, b: Alvo) =>
  a.tipo === b.tipo &&
  (a.tipo === 'gol' ||
    (a.tipo === 'jogador' && b.tipo === 'jogador' && a.id === b.id) ||
    (a.tipo === 'ponto' && b.tipo === 'ponto' && Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y) < 0.02))

/**
 * Confere a jogada (jogador + alvo clicados na quadra). Devolve a opção encontrada (certa ou
 * errada) ou null se aquela combinação não é uma jogada do puzzle.
 */
export function validarJogada(passo: Passo, jogador: string, alvo: Alvo): Opcao | null {
  return passo.opcoes.find((o) => o.jogador === jogador && mesmoAlvo(o.alvo, alvo)) ?? null
}

/** A jogada certa do passo */
export const opcaoCorreta = (passo: Passo): Opcao => passo.opcoes.find((o) => o.correta)!

/** Onde fica o alvo na quadra */
export function posicaoDoAlvo(alvo: Alvo, jogadores: Jogador[]): Ponto {
  if (alvo.tipo === 'gol') return GOL_ADVERSARIO
  if (alvo.tipo === 'ponto') return alvo.pos
  return jogadores.find((j) => j.id === alvo.id)?.pos ?? GOL_ADVERSARIO
}

export interface Cena {
  jogadores: Jogador[]
  /** Quem está com a bola; 'gol' = a bola entrou */
  bola: string
}

/**
 * Como a quadra fica depois da jogada certa de um passo:
 * - passe para jogador: a bola vai para ele; passe para um lugar: quem está mais perto do lugar
 *   (o companheiro que corre) vai até lá e recebe
 * - movimentação/drible: o jogador vai até o lugar (se estava com a bola, leva junto)
 * - finalização: a bola vai para o gol
 * - e os movimentos extras do passo (ex.: o defensor que sai para dar o bote)
 */
export function aplicarJogada(cena: Cena, passo: Passo, opcao: Opcao): Cena {
  let jogadores = cena.jogadores.map((j) => ({ ...j }))
  let bola = cena.bola
  const mover = (id: string, para: Ponto) => {
    jogadores = jogadores.map((j) => (j.id === id ? { ...j, pos: para } : j))
  }

  if (opcao.acao === 'finalizacao') bola = 'gol'
  else if (opcao.acao === 'passe' && opcao.alvo.tipo === 'jogador') bola = opcao.alvo.id
  else if (opcao.acao === 'passe' && opcao.alvo.tipo === 'ponto') {
    const destino = opcao.alvo.pos
    const recebe = jogadores
      .filter((j) => j.time === 'A' && j.id !== opcao.jogador)
      .reduce((perto, j) => (Math.hypot(j.pos.x - destino.x, j.pos.y - destino.y) < Math.hypot(perto.pos.x - destino.x, perto.pos.y - destino.y) ? j : perto))
    mover(recebe.id, destino)
    bola = recebe.id
  } else if (opcao.alvo.tipo === 'ponto') mover(opcao.jogador, opcao.alvo.pos)

  for (const m of passo.depois ?? []) mover(m.jogador, m.para)
  return { jogadores, bola }
}

/** Problemas nos dados de um puzzle (lista vazia = tudo certo). Usado nos testes. */
export function conferirPuzzle(p: Puzzle): string[] {
  const erros: string[] = []
  const ids = new Set(p.jogadores.map((j) => j.id))
  if (ids.size !== p.jogadores.length) erros.push('ids de jogador repetidos')
  if (!ids.has(p.bola)) erros.push(`bola com jogador inexistente: ${p.bola}`)
  for (const j of p.jogadores) {
    if (j.pos.x < 0 || j.pos.x > 1 || j.pos.y < 0 || j.pos.y > 1) erros.push(`${j.id} fora da quadra`)
  }
  if (p.passos.length === 0) erros.push('sem passos')
  p.passos.forEach((passo, i) => {
    const certas = passo.opcoes.filter((o) => o.correta).length
    if (certas !== 1) erros.push(`passo ${i + 1}: ${certas} opções certas (precisa 1)`)
    if (passo.opcoes.length < 2) erros.push(`passo ${i + 1}: menos de 2 opções`)
    const idsOpcoes = new Set(passo.opcoes.map((o) => o.id))
    if (idsOpcoes.size !== passo.opcoes.length) erros.push(`passo ${i + 1}: ids de opção repetidos`)
    for (const o of passo.opcoes) {
      const quem = p.jogadores.find((j) => j.id === o.jogador)
      if (!quem) erros.push(`passo ${i + 1}: ${o.id} com jogador inexistente`)
      else if (quem.time !== 'A') erros.push(`passo ${i + 1}: ${o.id} feita por jogador adversário`)
      if (o.alvo.tipo === 'jogador' && !ids.has(o.alvo.id)) erros.push(`passo ${i + 1}: ${o.id} com alvo inexistente`)
      if (o.alvo.tipo === 'ponto' && (o.alvo.pos.x < 0 || o.alvo.pos.x > 1 || o.alvo.pos.y < 0 || o.alvo.pos.y > 1)) erros.push(`passo ${i + 1}: ${o.id} fora da quadra`)
      if (!o.explicacao.trim()) erros.push(`passo ${i + 1}: ${o.id} sem explicação`)
    }
    // Duas opções iguais (mesmo jogador e alvo) não dá para distinguir na quadra
    passo.opcoes.forEach((o, k) => {
      if (passo.opcoes.some((x, m) => m < k && x.jogador === o.jogador && mesmoAlvo(x.alvo, o.alvo))) erros.push(`passo ${i + 1}: ${o.id} repete o alvo de outra opção`)
    })
    for (const m of passo.depois ?? []) if (!ids.has(m.jogador)) erros.push(`passo ${i + 1}: movimento de jogador inexistente`)
  })
  return erros
}
