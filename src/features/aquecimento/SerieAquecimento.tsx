// Aquecimento: a série guiada com os exercícios do módulo "aquecimento" (data/exercicios.json).
import { SerieGuiada } from '../treino/SerieGuiada'

export function SerieAquecimento() {
  return (
    <SerieGuiada
      modulo="aquecimento"
      titulo="🔥 Aquecimento"
      textoComecar="Começar aquecimento 🔥"
      atividade="aquecimento"
      voltarPara="/treinos"
      textoVoltar="Treinos 💪"
    />
  )
}
