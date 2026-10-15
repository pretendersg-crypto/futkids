// Os treinos que dá para pôr no plano (painel), em grupos e abas ("seções"):
// gestos técnicos (um por categoria), treinos de fundamentos, treinos do app, o calendário de
// goleiros e o que os pais criaram. O plano da turma usa só o que vem no app.
import { TREINOS_CALENDARIO, treinoDeCircuito, treinoDeExtra, treinoDeFundamentos, treinoDeGesto, treinoDeSerie, type FundamentosDosPais, type SerieDosPais, type TreinoExtra } from '../../data/calendarioGoleiros'
import type { Circuito } from '../saidaGol/circuitos'
import { CATEGORIAS_GESTO, publicoDoGesto, type Gesto } from '../saidaGol/gestos'
import type { GrupoDeTreinos } from './GradePlano'

// Os treinos do próprio app têm "(app)" no nome; os outros são do calendário de goleiros (FFutsal)
const doApp = (nome: string) => nome.endsWith('(app)')
const semAquecimento = TREINOS_CALENDARIO.filter((t) => t.id !== 'aquecimento')

interface Fontes {
  gestos: Gesto[]
  fundamentos: FundamentosDosPais[]
  /** Circuitos com cones (do app, da família, da turma) */
  circuitos?: Circuito[]
  /** Só no plano de casa */
  series?: SerieDosPais[]
  extras?: TreinoExtra[]
}

export function gruposDoPlano({ gestos, fundamentos, circuitos = [], series = [], extras = [] }: Fontes): GrupoDeTreinos[] {
  // Uma aba para cada público (goleiro, linha, comuns), com um grupo por categoria
  const SECAO = { goleiro: '🧤 Gestos de goleiro', linha: '⚽ Gestos de linha', todos: '👥 Gestos comuns' } as const
  const gruposDeGestos = CATEGORIAS_GESTO.map((c) => ({
    secao: SECAO[c.publico],
    titulo: `${c.emoji} ${c.nome}`,
    treinos: gestos.filter((g) => g.categoria === c.id && publicoDoGesto(g) === c.publico).map(treinoDeGesto),
  }))
  // Gesto com público diferente do da categoria (ex.: comunicação do goleiro) vai para a aba dele
  const foraDaCategoria = gestos.filter((g) => publicoDoGesto(g) !== CATEGORIAS_GESTO.find((c) => c.id === g.categoria)?.publico)
  for (const g of foraDaCategoria) {
    const secao = SECAO[publicoDoGesto(g)]
    const grupo = gruposDeGestos.find((x) => x.secao === secao)
    if (grupo) grupo.treinos.push(treinoDeGesto(g))
  }
  return [
    ...gruposDeGestos,
    { secao: '🔶 Circuitos com cones', titulo: 'Circuitos com cones (saída do gol)', treinos: circuitos.map(treinoDeCircuito) },
    { secao: '📚 Treinos de fundamentos', titulo: 'Treinos de fundamentos (vários gestos seguidos)', treinos: fundamentos.map(treinoDeFundamentos) },
    { secao: '📱 Treinos do app', titulo: 'Treinos e jogos do app', treinos: semAquecimento.filter((t) => doApp(t.nome)) },
    { secao: '📅 Calendário de goleiros', titulo: 'Calendário de goleiros (com vídeo)', treinos: semAquecimento.filter((t) => !doApp(t.nome)) },
    { secao: '✏️ Criados por você', titulo: 'Treinos criados por você', treinos: series.map(treinoDeSerie) },
    { secao: '✏️ Criados por você', titulo: 'Vídeos que você adicionou', treinos: extras.map(treinoDeExtra) },
  ].filter((g) => g.treinos.length > 0)
}
