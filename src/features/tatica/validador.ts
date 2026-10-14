// Regras do puzzle: quem pode agir, quais jogadas existem, se a resposta escolhida é a certa e
// como ficam os jogadores e a bola depois dela. Três tipos de pergunta (ver tipos.ts): a jogada
// (setas), o lugar certo na quadra e o jogador mal posicionado. Funções puras (testadas em
// tatica.test.ts).
import { ehJogada, RAIO_POSICAO, tipoDoPasso, type Alvo, type Jogador, type Opcao, type Passo, type PassoErro, type PassoJogada, type PassoPosicao, type Ponto, type Puzzle } from './tipos'

/** Centro do gol adversário (o azul ataca para a direita) */
export const GOL_ADVERSARIO: Ponto = { x: 1, y: 0.5 }

const distancia = (a: Ponto, b: Ponto) => Math.hypot(a.x - b.x, a.y - b.y)
const dentro = (p: Ponto) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1

/** Jogadores azuis que podem ser tocados para responder neste passo (ficam brilhando na quadra) */
export function jogadoresQueAgem(passo: Passo): string[] {
  if (passo.tipo === 'posicao') return [passo.jogador]
  if (passo.tipo === 'erro') return []
  return [...new Set((passo as PassoJogada).opcoes.map((o) => o.jogador))]
}

/** As jogadas de um jogador neste passo */
export function opcoesDoJogador(passo: Passo, jogador: string): Opcao[] {
  return ehJogada(passo) ? passo.opcoes.filter((o) => o.jogador === jogador) : []
}

const mesmoAlvo = (a: Alvo, b: Alvo) =>
  a.tipo === b.tipo &&
  (a.tipo === 'gol' || (a.tipo === 'jogador' && b.tipo === 'jogador' && a.id === b.id) || (a.tipo === 'ponto' && b.tipo === 'ponto' && distancia(a.pos, b.pos) < 0.02))

/**
 * Confere a jogada (jogador + alvo clicados na quadra). Devolve a opção encontrada (certa ou
 * errada) ou null se aquela combinação não é uma jogada do puzzle.
 */
export function validarJogada(passo: PassoJogada, jogador: string, alvo: Alvo): Opcao | null {
  return passo.opcoes.find((o) => o.jogador === jogador && mesmoAlvo(o.alvo, alvo)) ?? null
}

/** A jogada certa do passo */
export const opcaoCorreta = (passo: PassoJogada): Opcao => passo.opcoes.find((o) => o.correta)!

/** "Onde se posicionar": o toque foi perto o bastante do lugar certo? */
export function acertouPosicao(passo: PassoPosicao, toque: Ponto): boolean {
  return distancia(passo.certo, toque) <= (passo.raio ?? RAIO_POSICAO)
}

/** "Encontre o erro": tocou no jogador mal posicionado? */
export const acertouErro = (passo: PassoErro, jogador: string) => passo.errado === jogador

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

function moverNaCena(jogadores: Jogador[], id: string, para: Ponto): Jogador[] {
  return jogadores.map((j) => (j.id === id ? { ...j, pos: para } : j))
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

  if (opcao.acao === 'finalizacao') bola = 'gol'
  else if (opcao.acao === 'passe' && opcao.alvo.tipo === 'jogador') bola = opcao.alvo.id
  else if (opcao.acao === 'passe' && opcao.alvo.tipo === 'ponto') {
    const destino = opcao.alvo.pos
    const recebe = jogadores
      .filter((j) => j.time === 'A' && j.id !== opcao.jogador)
      .reduce((perto, j) => (distancia(j.pos, destino) < distancia(perto.pos, destino) ? j : perto))
    jogadores = moverNaCena(jogadores, recebe.id, destino)
    bola = recebe.id
  } else if (opcao.alvo.tipo === 'ponto') jogadores = moverNaCena(jogadores, opcao.jogador, opcao.alvo.pos)

  for (const m of passo.depois ?? []) jogadores = moverNaCena(jogadores, m.jogador, m.para)
  return { jogadores, bola }
}

/** Como a quadra fica depois da resposta certa de qualquer tipo de passo */
export function aplicarPasso(cena: Cena, passo: Passo): Cena {
  if (ehJogada(passo)) return aplicarJogada(cena, passo, opcaoCorreta(passo))
  let jogadores = cena.jogadores.map((j) => ({ ...j }))
  if (passo.tipo === 'posicao') jogadores = moverNaCena(jogadores, passo.jogador, passo.certo)
  if (passo.tipo === 'erro' && passo.corrigir) jogadores = moverNaCena(jogadores, passo.errado, passo.corrigir)
  for (const m of passo.depois ?? []) jogadores = moverNaCena(jogadores, m.jogador, m.para)
  return { jogadores, bola: cena.bola }
}

/** A cena no começo de cada passo (o passo i começa depois das respostas certas dos anteriores) */
export function cenasDosPassos(p: Pick<Puzzle, 'jogadores' | 'bola' | 'passos'>): Cena[] {
  const cenas: Cena[] = [{ jogadores: p.jogadores, bola: p.bola }]
  p.passos.forEach((passo, i) => {
    // Um passo incompleto (no editor) não muda a cena
    try {
      cenas.push(aplicarPasso(cenas[i], passo))
    } catch {
      cenas.push(cenas[i])
    }
  })
  return cenas
}

/** Problemas nos dados de um puzzle (lista vazia = tudo certo). Usado nos testes e no editor. */
export function conferirPuzzle(p: Puzzle): string[] {
  const erros: string[] = []
  const ids = new Set(p.jogadores.map((j) => j.id))
  const azul = (id: string) => p.jogadores.find((j) => j.id === id)?.time === 'A'
  if (!p.titulo.trim()) erros.push('falta o título')
  if (ids.size !== p.jogadores.length) erros.push('ids de jogador repetidos')
  if (!ids.has(p.bola)) erros.push(`bola com jogador inexistente: ${p.bola}`)
  for (const j of p.jogadores) if (!dentro(j.pos)) erros.push(`${j.id} fora da quadra`)
  if (p.passos.length === 0) erros.push('sem perguntas')
  p.passos.forEach((passo, i) => {
    const n = `pergunta ${i + 1}`
    if (!passo.pergunta.trim()) erros.push(`${n}: falta o texto da pergunta`)
    for (const m of passo.depois ?? []) if (!ids.has(m.jogador)) erros.push(`${n}: movimento de jogador inexistente`)
    const tipo = tipoDoPasso(passo)

    if (tipo === 'posicao') {
      const q = passo as PassoPosicao
      if (!azul(q.jogador)) erros.push(`${n}: escolha um jogador azul para ir ao lugar`)
      if (!dentro(q.certo)) erros.push(`${n}: o lugar certo está fora da quadra`)
      if (!q.explicacao.trim()) erros.push(`${n}: falta a explicação`)
      return
    }
    if (tipo === 'erro') {
      const q = passo as PassoErro
      if (!azul(q.errado)) erros.push(`${n}: escolha o jogador azul que está mal posicionado`)
      if (q.corrigir && !dentro(q.corrigir)) erros.push(`${n}: o lugar corrigido está fora da quadra`)
      if (!q.explicacao.trim()) erros.push(`${n}: falta a explicação`)
      return
    }

    const q = passo as PassoJogada
    const certas = q.opcoes.filter((o) => o.correta).length
    if (certas !== 1) erros.push(`${n}: ${certas} opções certas (precisa 1)`)
    if (q.opcoes.length < 2) erros.push(`${n}: menos de 2 opções`)
    const idsOpcoes = new Set(q.opcoes.map((o) => o.id))
    if (idsOpcoes.size !== q.opcoes.length) erros.push(`${n}: ids de opção repetidos`)
    for (const o of q.opcoes) {
      const quem = p.jogadores.find((j) => j.id === o.jogador)
      if (!quem) erros.push(`${n}: ${o.id} com jogador inexistente`)
      else if (quem.time !== 'A') erros.push(`${n}: ${o.id} feita por jogador adversário`)
      if (o.alvo.tipo === 'jogador' && !ids.has(o.alvo.id)) erros.push(`${n}: ${o.id} com alvo inexistente`)
      if (o.alvo.tipo === 'ponto' && !dentro(o.alvo.pos)) erros.push(`${n}: ${o.id} fora da quadra`)
      if (!o.rotulo.trim()) erros.push(`${n}: uma opção está sem o texto do botão`)
      if (!o.explicacao.trim()) erros.push(`${n}: ${o.rotulo || o.id} sem explicação`)
    }
    // Duas opções iguais (mesmo jogador e alvo) não dá para distinguir na quadra
    q.opcoes.forEach((o, k) => {
      if (q.opcoes.some((x, m) => m < k && x.jogador === o.jogador && mesmoAlvo(x.alvo, o.alvo))) erros.push(`${n}: ${o.rotulo || o.id} repete o alvo de outra opção`)
    })
  })
  return erros
}
