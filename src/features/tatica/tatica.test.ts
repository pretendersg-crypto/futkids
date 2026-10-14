// Testes do Futsal Tático: validador de jogada, aplicação da jogada na quadra, rating (Elo) e a
// conferência de TODOS os puzzles (rode `npm test` depois de criar ou mudar um puzzle).
import { describe, expect, it } from 'vitest'
import { PUZZLES, puzzlePorId } from './puzzles'
import { chanceEsperada, novoRating, RATING_MINIMO, variacaoRating } from './rating'
import { acabarPuzzle, copiarComoNovo, puzzleEmBranco } from './editor/novos'
import { conferirPrancheta, jogadoresNoQuadro, PRANCHETAS_PRONTAS } from './pranchetas'
import { ehJogada, type Passo, type PassoErro, type PassoJogada, type PassoPosicao } from './tipos'
import { acertouErro, acertouPosicao, aplicarJogada, aplicarPasso, cenasDosPassos, conferirPuzzle, jogadoresQueAgem, opcaoCorreta as correta, opcoesDoJogador, validarJogada } from './validador'

/** Os puzzles antigos são todos de jogada */
const opcaoCorreta = (p: Passo) => correta(p as PassoJogada)

const passoExemplo: PassoJogada = {
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
    expect(new Set(PUZZLES.map((p) => p.categoria))).toEqual(new Set(['ataque', 'defesa', 'transicao', 'bola-parada', 'sistemas']))
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
        if (!ehJogada(passo)) {
          cena = aplicarPasso(cena, passo)
          continue
        }
        const certa = opcaoCorreta(passo)
        // Quem passa ou chuta precisa estar com a bola
        if (certa.acao === 'passe' || certa.acao === 'finalizacao' || certa.acao === 'drible') expect(cena.bola, `${p.id}: ${certa.id}`).toBe(certa.jogador)
        cena = aplicarJogada(cena, passo, certa)
      }
    }
  })
})

describe('onde se posicionar e encontre o erro', () => {
  const pos = puzzlePorId('pos-cobertura')!
  const erro = puzzlePorId('erro-esqueceu-o-9')!

  it('posição: toque perto do lugar certo vale, longe não', () => {
    const passo = pos.passos[0] as PassoPosicao
    expect(acertouPosicao(passo, { x: passo.certo.x + 0.03, y: passo.certo.y })).toBe(true)
    expect(acertouPosicao(passo, { x: 0.45, y: 0.42 })).toBe(false)
  })
  it('posição: depois da resposta, o jogador vai para o lugar certo', () => {
    const passo = pos.passos[0] as PassoPosicao
    const depois = aplicarPasso({ jogadores: pos.jogadores, bola: pos.bola }, passo)
    expect(depois.jogadores.find((j) => j.id === passo.jogador)?.pos).toEqual(passo.certo)
  })
  it('erro: só o jogador mal posicionado vale, e ele vai para onde deveria estar', () => {
    const passo = erro.passos[0] as PassoErro
    expect(acertouErro(passo, 'a8')).toBe(true)
    expect(acertouErro(passo, 'a4')).toBe(false)
    expect(aplicarPasso({ jogadores: erro.jogadores, bola: erro.bola }, passo).jogadores.find((j) => j.id === 'a8')?.pos).toEqual(passo.corrigir)
  })
  it('ninguém começa já no lugar certo (senão o puzzle não ensina nada)', () => {
    for (const p of PUZZLES) {
      p.passos.forEach((passo, i) => {
        if (passo.tipo !== 'posicao') return
        const quem = cenasDosPassos(p)[i].jogadores.find((j) => j.id === passo.jogador)!
        expect(acertouPosicao(passo, quem.pos), `${p.id}`).toBe(false)
      })
    }
  })
  it('a conferência acha pergunta incompleta', () => {
    const quebrado = { ...pos, passos: [{ tipo: 'posicao', pergunta: '', jogador: 'b10', certo: { x: 2, y: 0 }, explicacao: '' } as PassoPosicao] }
    expect(conferirPuzzle(quebrado).length).toBeGreaterThanOrEqual(3)
  })
})

describe('pranchetas', () => {
  it.each(PRANCHETAS_PRONTAS.map((p) => [p.id, p] as const))('%s está correta', (_id, p) => {
    expect(conferirPrancheta(p)).toEqual([])
  })
  it('o quadro guarda só quem mudou de lugar; os outros ficam onde estavam', () => {
    const pr = PRANCHETAS_PRONTAS.find((p) => p.id === 'sistema-4-0')!
    const q2 = jogadoresNoQuadro(pr, 2)
    expect(q2.find((j) => j.id === 'a7')?.pos).toEqual({ x: 0.8, y: 0.33 }) // mudou no quadro 1
    expect(q2.find((j) => j.id === 'a4')?.pos).toEqual({ x: 0.5, y: 0.38 }) // mudou no quadro 2
    expect(q2.find((j) => j.id === 'a9')?.pos).toEqual({ x: 0.5, y: 0.85 }) // nunca mudou
  })
})

describe('editor', () => {
  it('puzzle em branco precisa ser completado para salvar', () => {
    expect(conferirPuzzle(acabarPuzzle(puzzleEmBranco())).length).toBeGreaterThan(0)
  })
  it('acabar: botão sem texto ganha um texto padrão e o rating segue a dificuldade', () => {
    const p = puzzleEmBranco()
    p.titulo = 'Teste'
    p.dificuldade = 'avancado'
    p.passos = [
      {
        pergunta: 'Qual?',
        opcoes: [
          { id: 'o1', jogador: 'a10', acao: 'passe', alvo: { tipo: 'jogador', id: 'a9' }, rotulo: '', correta: true, explicacao: 'livre' },
          { id: 'o2', jogador: 'a10', acao: 'finalizacao', alvo: { tipo: 'gol' }, rotulo: '', correta: false, explicacao: 'longe' },
        ],
      },
    ]
    const pronto = acabarPuzzle(p)
    expect(conferirPuzzle(pronto)).toEqual([])
    expect((pronto.passos[0] as PassoJogada).opcoes.map((o) => o.rotulo)).toEqual(['Passe para o 9', 'Chutar no gol'])
    expect(pronto.rating).toBe(1350)
  })
  it('cópia de um pronto ganha id novo e não leva a origem', () => {
    const c = copiarComoNovo({ ...PUZZLES[0], origem: 'x' }, 'pz')
    expect(c.id).not.toBe(PUZZLES[0].id)
    expect(c.origem).toBeUndefined()
    expect(conferirPuzzle(c)).toEqual([])
  })
})
