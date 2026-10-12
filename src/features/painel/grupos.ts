// Os treinos que dá para pôr no plano (painel), em grupos e abas ("seções"):
// gestos técnicos (um por categoria), treinos de fundamentos, treinos do app, o calendário de
// goleiros e o que os pais criaram. O plano da turma usa só o que vem no app.
import { TREINOS_CALENDARIO, treinoDeExtra, treinoDeFundamentos, treinoDeGesto, treinoDeSerie, type FundamentosDosPais, type SerieDosPais, type TreinoExtra } from '../../data/calendarioGoleiros'
import { CATEGORIAS_GESTO, type Gesto } from '../saidaGol/gestos'
import type { GrupoDeTreinos } from './GradePlano'

// Os treinos do próprio app têm "(app)" no nome; os outros são do calendário de goleiros (FFutsal)
const doApp = (nome: string) => nome.endsWith('(app)')
const semAquecimento = TREINOS_CALENDARIO.filter((t) => t.id !== 'aquecimento')

interface Fontes {
  gestos: Gesto[]
  fundamentos: FundamentosDosPais[]
  /** Só no plano de casa */
  series?: SerieDosPais[]
  extras?: TreinoExtra[]
}

export function gruposDoPlano({ gestos, fundamentos, series = [], extras = [] }: Fontes): GrupoDeTreinos[] {
  const gruposDeGestos = CATEGORIAS_GESTO.map((c) => ({
    secao: '🧤 Gestos técnicos',
    titulo: `${c.emoji} ${c.nome}`,
    treinos: gestos.filter((g) => g.categoria === c.id).map(treinoDeGesto),
  }))
  return [
    ...gruposDeGestos,
    { secao: '📚 Treinos de fundamentos', titulo: 'Treinos de fundamentos (vários gestos seguidos)', treinos: fundamentos.map(treinoDeFundamentos) },
    { secao: '📱 Treinos do app', titulo: 'Treinos e jogos do app', treinos: semAquecimento.filter((t) => doApp(t.nome)) },
    { secao: '📅 Calendário de goleiros', titulo: 'Calendário de goleiros (com vídeo)', treinos: semAquecimento.filter((t) => !doApp(t.nome)) },
    { secao: '✏️ Criados por você', titulo: 'Treinos criados por você', treinos: series.map(treinoDeSerie) },
    { secao: '✏️ Criados por você', titulo: 'Vídeos que você adicionou', treinos: extras.map(treinoDeExtra) },
  ].filter((g) => g.treinos.length > 0)
}
