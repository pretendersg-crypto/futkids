// Tela provisória: o conteúdo de verdade entra na etapa correspondente da ordem de implementação.
import { TelaEmConstrucao } from '../components/ui/TelaEmConstrucao'
import { moduloPorCaminho } from '../data/modulos'

export function Goleiro() {
  return <TelaEmConstrucao modulo={moduloPorCaminho('/goleiro')} />
}
