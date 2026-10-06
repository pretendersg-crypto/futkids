// Uma série do menu de treinos (/treinos/:modulo), na mesma série guiada do aquecimento.
// Se a série é de uma categoria acima da criança (e não está na agenda de hoje), mostra o cadeado.
import { Navigate, useParams } from 'react-router'
import { categoriaLiberada } from '../data/categorias'
import { categoriaDaSerie, useAgendaDeHoje, useCategoria } from '../features/categoria/categoria'
import { TelaTrancada } from '../features/categoria/TelaTrancada'
import { seriePorModulo } from '../features/treino/series'
import { SerieGuiada } from '../features/treino/SerieGuiada'
import { useTreinosStore } from '../stores/treinosStore'

export function SerieTreino() {
  const { modulo } = useParams()
  const extras = useTreinosStore((s) => s.seriesExtras)
  const trocas = useTreinosStore((s) => s.categorias)
  const { atual } = useCategoria()
  const agenda = useAgendaDeHoje()
  const serie = seriePorModulo(modulo, extras)
  if (!serie || serie.modulo === 'aquecimento') return <Navigate to="/treinos" replace />

  const categoria = categoriaDaSerie(serie, trocas)
  if (!categoriaLiberada(categoria, atual.id) && !agenda.rotas.has(serie.rota)) {
    return <TelaTrancada categoria={categoria} titulo={`${serie.emoji} ${serie.titulo}`} voltarPara="/treinos" textoVoltar="Treinos 💪" />
  }

  return (
    <SerieGuiada
      key={serie.modulo}
      modulo={serie.modulo}
      titulo={`${serie.emoji} ${serie.titulo}`}
      textoComecar={`Começar ${serie.emoji}`}
      atividade={serie.modulo}
      voltarPara="/treinos"
      textoVoltar="Treinos 💪"
    />
  )
}
