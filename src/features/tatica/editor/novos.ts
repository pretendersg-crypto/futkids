// Peças dos editores do Futsal Tático: puzzle/prancheta em branco, ids novos, o texto padrão dos
// botões das jogadas e o "acabamento" antes de salvar.
import { azul, GOLEIRO_AZUL, GOLEIRO_VERMELHO, verm } from '../puzzles/ajuda'
import { RATING_POR_DIFICULDADE, type Jogador, type Opcao, type Prancheta, type Puzzle, type Time } from '../tipos'

export const novoId = (prefixo: string) => `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function puzzleEmBranco(): Puzzle {
  return {
    id: novoId('pz'),
    titulo: '',
    dificuldade: 'facil',
    categoria: 'ataque',
    contexto: '',
    jogadores: [GOLEIRO_AZUL, azul(4, 0.3, 0.5), azul(10, 0.5, 0.45), azul(9, 0.75, 0.6), verm(5, 0.6, 0.45), verm(8, 0.78, 0.65), GOLEIRO_VERMELHO],
    bola: 'a10',
    passos: [{ pergunta: '', opcoes: [] }],
    conceito: '',
    rating: RATING_POR_DIFICULDADE.facil,
  }
}

export function pranchetaEmBranco(): Prancheta {
  return {
    id: novoId('pr'),
    titulo: '',
    descricao: '',
    categoria: 'ataque',
    jogadores: [GOLEIRO_AZUL, azul(4, 0.35, 0.5), azul(7, 0.55, 0.2), azul(8, 0.55, 0.8), azul(9, 0.8, 0.5), verm(5, 0.75, 0.5), verm(7, 0.65, 0.3), verm(8, 0.65, 0.7), GOLEIRO_VERMELHO],
    quadros: [{ texto: '', posicoes: {}, bola: 'a4', setas: [] }],
  }
}

/** Cópia de um puzzle/prancheta pronto para usar de modelo (id novo, sem a origem) */
export function copiarComoNovo<T extends Puzzle | Prancheta>(x: T, prefixo: string): T {
  const copia = structuredClone(x)
  delete copia.origem
  return { ...copia, id: novoId(prefixo), titulo: `${x.titulo} (cópia)`.slice(0, 80) }
}

/** Próximo número de camisa livre do time */
export function proximoNumero(jogadores: Jogador[], time: Time): number {
  const usados = new Set(jogadores.filter((j) => j.time === time).map((j) => j.numero))
  for (const n of [4, 7, 8, 9, 10, 5, 6, 11, 2, 3, 12, 13, 14, 15]) if (!usados.has(n)) return n
  return 99
}

/** Id novo de jogador (a/b + número; se já existir, um sufixo) */
export function idDeJogador(jogadores: Jogador[], time: Time, numero: number): string {
  const base = `${time === 'A' ? 'a' : 'b'}${numero}`
  let id = base
  for (let k = 2; jogadores.some((j) => j.id === id); k++) id = `${base}-${k}`
  return id
}

export const nomeDoJogador = (j: Jogador | undefined) => (j ? `${j.goleiro ? 'goleiro ' : ''}${j.numero} ${j.time === 'A' ? 'azul' : 'vermelho'}` : '?')

/** Texto do botão quando o adulto não escreveu um */
export function rotuloPadrao(o: Opcao, jogadores: Jogador[]): string {
  const alvo = o.alvo.tipo === 'jogador' ? jogadores.find((j) => j.id === (o.alvo as { id: string }).id) : undefined
  const n = alvo?.numero
  switch (o.acao) {
    case 'passe':
      return o.alvo.tipo === 'jogador' ? `Passe para o ${n}` : 'Passe no espaço'
    case 'finalizacao':
      return 'Chutar no gol'
    case 'drible':
      return o.alvo.tipo === 'jogador' ? `Driblar o ${n}` : 'Sair driblando'
    case 'movimentacao':
      return 'Correr para o espaço'
    case 'marcacao':
      return o.alvo.tipo === 'jogador' ? `Marcar o ${n}` : 'Fechar o espaço'
    case 'desarme':
      return o.alvo.tipo === 'jogador' ? `Tentar roubar do ${n}` : 'Dar o bote'
  }
}

/** Antes de salvar: textos dos botões que faltam, rating pela dificuldade e campos vazios fora */
export function acabarPuzzle(p: Puzzle): Puzzle {
  const limpo = (s: string | undefined) => (s?.trim() ? s.trim() : undefined)
  return {
    ...p,
    titulo: p.titulo.trim(),
    contexto: p.contexto.trim(),
    conceito: p.conceito.trim(),
    rating: RATING_POR_DIFICULDADE[p.dificuldade],
    dica: limpo(p.dica),
    comentario: limpo(p.comentario),
    autor: limpo(p.autor),
    passos: p.passos.map((passo) =>
      passo.tipo === 'posicao' || passo.tipo === 'erro'
        ? passo
        : { ...passo, opcoes: passo.opcoes.map((o) => ({ ...o, rotulo: o.rotulo.trim() || rotuloPadrao(o, p.jogadores), consequencia: limpo(o.consequencia) })) },
    ),
  }
}

/** O Firestore não aceita `undefined`: tira os campos vazios (JSON faz isso) */
export const semVazios = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T
