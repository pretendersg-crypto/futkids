// Uma série do menu de treinos (/treinos/:modulo), na mesma série guiada do aquecimento.
import { Navigate, useParams } from 'react-router'
import { seriePorModulo } from '../features/treino/series'
import { SerieGuiada } from '../features/treino/SerieGuiada'
import { useTreinosStore } from '../stores/treinosStore'

export function SerieTreino() {
  const { modulo } = useParams()
  const extras = useTreinosStore((s) => s.seriesExtras)
  const serie = seriePorModulo(modulo, extras)
  if (!serie || serie.modulo === 'aquecimento') return <Navigate to="/treinos" replace />
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
