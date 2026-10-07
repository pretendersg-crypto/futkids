// Testes do Futsal Tático: validador de jogada, aplicação da jogada na quadra, rating (Elo) e a
// conferência de TODOS os puzzles (rode `npm test` depois de criar ou mudar um puzzle).
import { describe, expect, it } from 'vitest'
import { PUZZLES, puzzlePorId } from './puzzles'
import { chanceEsperada, novoRating, RATING_MINIMO, variacaoRating } from './rating'
import type { Passo } from './tipos'
import { aplicarJogada, conferirPuzzle, jogadoresQueAgem, opcaoCorreta, opcoesDoJogador, validarJogada } from './validador'

const passoExemplo: Passo = {
  pergunta: 'Teste',
  opcoes: [
    { id: 'p9', jogador: 'a10', acao: 'passe', alvo: { tipo: 'jogador', id: 'a9' }, rotulo: '', correta: true, explicacao: 'livre' },
    { id: 'p7', jogador: 'a10', acao: 'passe', alvo: { tipo: 'jogador', id: 'a7' }, rotulo: '', correta: false, explicacao: 'marcado' },
    { id: 'gol', jogador: 'a10', acao: 'finalizacao', alvo: { tipo: 'gol' }, rotulo: '', correta: false, explicacao: 'longe' },
    { id: 'corre', jogador: 'a8', acao: 'movimentacao', alvo: { tipo: 'ponto', pos: { x: 0.5, y: 0.2 } }, rotulo: '', correta: false, explicacao: 'x' },
  ],
}

describe('validarJogada', () => {
  it('acha a jogada certa', () => {
    expect(validarJogada(passoExemplo, 'a10', { tipo: 'jogador', id: 'a9' })?.correta).toBe(true)
  })
  it('acha a jogada errada', () => {
    const o = validarJogada(passoExemplo, 'a10', { tipo: 'jogador', id: 'a7' })
    expect(o?.id).toBe('p7')
    expect(o?.correta).toBe(false)
  })
  it('reconhece a finalização', () => {
    expect(validarJogada(passoExemplo, 'a10', { tipo: 'gol' })?.id).toBe('gol')
  })
  it('aceita um ponto muito perto do alvo (toque impreciso)', () => {
    expect(validarJogada(passoExemplo, 'a8', { tipo: 'ponto', pos: { x: 0.505, y: 0.205 } })?.id).toBe('corre')
  })
  it('recusa um ponto longe do alvo', () => {
    expect(validarJogada(passoExemplo, 'a8', { tipo: 'ponto', pos: { x: 0.6, y: 0.2 } })).toBeNull()
  })
  it('recusa jogada de quem não tem opção ou alvo de outro jogador', () => {
    expect(validarJogada(passoExemplo, 'a7', { tipo: 'gol' })).toBeNull()
    expect(validarJogada(passoExemplo, 'a8', { tipo: 'jogador', id: 'a9' })).toBeNull()
  })
  it('lista quem age e as opções de cada um', () => {
    expect(jogadoresQueAgem(passoExemplo)).toEqual(['a10', 'a8'])
    expect(opcoesDoJogador(passoExemplo, 'a10')).toHaveLength(3)
    expect(opcaoCorreta(passoExemplo).id).toBe('p9')
  })
})

describe('aplicarJogada', () => {
  const p = puzzlePorId('tabela')!
  const inicio = { jogadores: p.jogadores, bola: p.bola }

  it('passe leva a bola para quem recebe', () => {
    const depois = aplicarJogada(inicio, p.passos[0], opcaoCorreta(p.passos[0]))
    expect(depois.bola).toBe('a7')
  })
  it('movimentação muda o jogador de lugar e não mexe na bola', () => {
    const passo1 = aplicarJogada(inicio, p.passos[0], opcaoCorreta(p.passos[0]))
    const passo2 = aplicarJogada(passo1, p.passos[1], opcaoCorreta(p.passos[1]))
    expect(passo2.bola).toBe('a7')
    expect(passo2.jogadores.find((j) => j.id === 'a10')?.pos).toEqual({ x: 0.78, y: 0.66 })
  })
  it('finalização manda a bola para o gol', () => {
    const chute = puzzlePorId('hora-de-chutar')!
    expect(aplicarJogada({ jogadores: chute.jogadores, bola: chute.bola }, chute.passos[0], opcaoCorreta(chute.passos[0])).bola).toBe('gol')
  })
  it('passe para um lugar: o companheiro mais perto corre e recebe', () => {
    const par = puzzlePorId('paralela')!
    const depois = aplicarJogada({ jogadores: par.jogadores, bola: par.bola }, par.passos[0], opcaoCorreta(par.passos[0]))
    expect(depois.bola).toBe('a8')
    expect(depois.jogadores.find((j) => j.id === 'a8')?.pos).toEqual({ x: 0.82, y: 0.08 })
  })
  it('aplica os movimentos extras do passo', () => {
    const pivo = puzzlePorId('pivo')!
    const depois = aplicarJogada({ jogadores: pivo.jogadores, bola: pivo.bola }, pivo.passos[0], opcaoCorreta(pivo.passos[0]))
    expect(depois.jogadores.find((j) => j.id === 'a7')?.pos).toEqual({ x: 0.74, y: 0.27 })
  })
})

describe('rating (Elo)', () => {
  it('chance de 50% com ratings iguais', () => {
    expect(chanceEsperada(1000, 1000)).toBeCloseTo(0.5)
  })
  it('acertar sobe, errar desce', () => {
    expect(variacaoRating(1000, 1000, true)).toBe(16)
    expect(variacaoRating(1000, 1000, false)).toBe(-16)
  })
  it('acertar puzzle difícil sobe mais que acertar fácil', () => {
    expect(variacaoRating(800, 1200, true)).toBeGreaterThan(variacaoRating(800, 600, true))
  })
  it('errar puzzle fácil desce mais que errar difícil', () => {
    expect(variacaoRating(1000, 600, false)).toBeLessThan(variacaoRating(1000, 1400, false))
  })
  it('com dica, o ganho cai pela metade', () => {
    expect(variacaoRating(1000, 1000, true, true)).toBe(8)
  })
  it('nunca fica abaixo do mínimo', () => {
    expect(novoRating(RATING_MINIMO, 1500, false)).toBe(RATING_MINIMO)
  })
})

describe('puzzles', () => {
  it('tem pelo menos 15 puzzles nas 3 dificuldades e nas 4 categorias', () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(15)
    expect(new Set(PUZZLES.map((p) => p.dificuldade))).toEqual(new Set(['facil', 'intermediario', 'avancado']))
    expect(new Set(PUZZLES.map((p) => p.categoria))).toEqual(new Set(['ataque', 'defesa', 'transicao', 'bola-parada']))
  })
  it('ids únicos', () => {
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(PUZZLES.length)
  })
  it.each(PUZZLES.map((p) => [p.id, p] as const))('%s está correto', (_id, p) => {
    expect(conferirPuzzle(p)).toEqual([])
  })
  it('quem age em cada passo da sequência existe e a bola segue a jogada certa', () => {
    for (const p of PUZZLES) {
      let cena = { jogadores: p.jogadores, bola: p.bola }
      for (const passo of p.passos) {
        const certa = opcaoCorreta(passo)
        // Quem passa ou chuta precisa estar com a bola
        if (certa.acao === 'passe' || certa.acao === 'finalizacao' || certa.acao === 'drible') expect(cena.bola, `${p.id}: ${certa.id}`).toBe(certa.jogador)
        cena = aplicarJogada(cena, passo, certa)
      }
    }
  })
})
